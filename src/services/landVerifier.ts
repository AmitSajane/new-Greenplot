/**
 * Land ownership verification — pluggable provider architecture.
 *
 * The app calls `landVerifier.verify(...)` and never knows which provider runs.
 * Today: a free DOCUMENT provider (Gemini Vision reads the owner's RoR / Pahani
 * / 7-12 and cross-checks it). Tomorrow: drop in an APISetu (Karnataka, free)
 * or a paid all-India provider behind the same `LandVerifier` interface — no UI
 * changes. Everything degrades gracefully (never throws to the UI).
 */
import { ENV, isGeminiConfigured } from '../config/env';

export type VerifyStatus = 'verified' | 'mismatch' | 'unreadable' | 'unconfigured';

/** Structured land record extracted from a document (or returned by an API). */
export interface LandRecord {
  ownerName?: string;
  surveyNumber?: string;
  area?: string;
  village?: string;
  district?: string;
  state?: string;
}

export interface VerificationResult {
  status: VerifyStatus;
  record: LandRecord;
  /** Cross-checks against what the owner typed (undefined when not provided). */
  surveyMatches?: boolean;
  ownerMatches?: boolean;
  message: string;
  source: 'document' | 'apisetu' | 'aggregator';
}

export interface VerifyInput {
  /** base64 image of the land document (for the document provider). */
  base64?: string;
  mimeType?: string;
  /** What the owner typed, for cross-checking. */
  claimedSurveyNumber?: string;
  claimedOwnerName?: string;
  state?: string;
}

/** Any verification provider implements this. */
export interface LandVerifier {
  readonly id: VerificationResult['source'];
  isAvailable(): boolean;
  verify(input: VerifyInput): Promise<VerificationResult>;
}

// ── matching helpers ─────────────────────────────────────────────────────────
const normSurvey = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function surveyMatch(a?: string, b?: string): boolean | undefined {
  if (!a || !b) return undefined;
  const x = normSurvey(a);
  const y = normSurvey(b);
  if (!x || !y) return undefined;
  return x === y || x.includes(y) || y.includes(x);
}

function ownerMatch(claimed?: string, doc?: string): boolean | undefined {
  if (!claimed || !doc) return undefined;
  const tok = (s: string) =>
    s.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const a = tok(claimed);
  const b = tok(doc);
  if (!a.length || !b.length) return undefined;
  // Lenient: any shared name token counts (handles initials, surname-only, order).
  return a.some(w => b.includes(w)) || b.some(w => a.includes(w));
}

// ── small JSON extractor (Gemini may wrap/append text) ───────────────────────
function firstJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') inStr = !inStr;
    else if (!inStr) {
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return s.slice(start, i + 1); }
    }
  }
  return null;
}

// ── Document provider (Gemini Vision) ────────────────────────────────────────
const documentVerifier: LandVerifier = {
  id: 'document',
  isAvailable: () => isGeminiConfigured,

  async verify(input: VerifyInput): Promise<VerificationResult> {
    if (!isGeminiConfigured) {
      return { status: 'unconfigured', record: {}, message: 'AI verification is not configured.', source: 'document' };
    }
    if (!input.base64) {
      return { status: 'unreadable', record: {}, message: 'No document image provided.', source: 'document' };
    }

    const prompt = [
      'You are verifying an Indian land record document (RoR / Pahani / 7-12 / Khata / RTC).',
      'Read the document image and extract these fields. If a field is not visible, use null.',
      'Respond ONLY as compact JSON:',
      '{"isLandRecord":true/false,"ownerName":string|null,"surveyNumber":string|null,"area":string|null,"village":string|null,"district":string|null,"state":string|null}',
      'isLandRecord = false if the image is not a land/revenue record.',
    ].join(' ');

    const url = `${ENV.geminiBaseUrl}/models/${ENV.geminiModel}:generateContent?key=${ENV.geminiApiKey}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: input.mimeType || 'image/jpeg', data: input.base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' },
    };

    let parsed: any = null;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { status: 'unreadable', record: {}, message: 'Could not read the document. Please try a clearer photo.', source: 'document' };
      }
      const json = await res.json();
      const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) parsed = JSON.parse(firstJsonObject(text) || text);
    } catch {
      return { status: 'unreadable', record: {}, message: 'Network error reading the document. Try again.', source: 'document' };
    }

    if (!parsed) {
      return { status: 'unreadable', record: {}, message: 'Could not read the document. Please try a clearer photo.', source: 'document' };
    }

    if (parsed.isLandRecord === false) {
      return { status: 'unreadable', record: {}, message: 'This doesn’t look like a land record. Upload your RoR / Pahani / 7-12.', source: 'document' };
    }

    const record: LandRecord = {
      ownerName: parsed.ownerName || undefined,
      surveyNumber: parsed.surveyNumber || undefined,
      area: parsed.area || undefined,
      village: parsed.village || undefined,
      district: parsed.district || undefined,
      state: parsed.state || undefined,
    };

    if (!record.surveyNumber && !record.ownerName) {
      return { status: 'unreadable', record, message: 'Couldn’t read the key details. Please try a clearer photo.', source: 'document' };
    }

    const sMatch = surveyMatch(record.surveyNumber, input.claimedSurveyNumber);
    const oMatch = ownerMatch(input.claimedOwnerName, record.ownerName);

    // Mismatch only when the owner typed a survey number that clearly differs.
    if (input.claimedSurveyNumber && sMatch === false) {
      return {
        status: 'mismatch',
        record,
        surveyMatches: false,
        ownerMatches: oMatch,
        message: `The document shows survey no. ${record.surveyNumber}, not ${input.claimedSurveyNumber}.`,
        source: 'document',
      };
    }

    return {
      status: 'verified',
      record,
      surveyMatches: sMatch,
      ownerMatches: oMatch,
      message: 'Land record verified from your document.',
      source: 'document',
    };
  },
};

// Registry — ordered by preference. Add ApiSetu/aggregator providers here later.
const PROVIDERS: LandVerifier[] = [documentVerifier];

export const landVerifier = {
  /** True if any provider can run right now. */
  isAvailable(): boolean {
    return PROVIDERS.some(p => p.isAvailable());
  },
  /** Verify using the first available provider that suits the input. */
  async verify(input: VerifyInput): Promise<VerificationResult> {
    const provider = PROVIDERS.find(p => p.isAvailable());
    if (!provider) {
      return { status: 'unconfigured', record: {}, message: 'Verification is not available.', source: 'document' };
    }
    return provider.verify(input);
  },
};
