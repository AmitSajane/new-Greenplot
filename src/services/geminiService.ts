/**
 * Kisan Mitra — real AI via Google Gemini (free tier, great Indian-language
 * support). Falls back to the offline rule-based engine when no key is set or
 * the call fails, so the assistant always answers.
 *
 * Get a free key (no card) at https://aistudio.google.com/apikey → put it in
 * .env as GEMINI_API_KEY.
 */
import { ENV, isGeminiConfigured } from '../config/env';
import type { ChatMessage, Language } from './aiAssistantService';

const LANG_NAME: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  mr: 'Marathi',
  te: 'Telugu',
  bn: 'Bengali',
};

export interface GeminiReply {
  text: string; // reply in the user's language
  textEn: string; // English version (for the translate toggle / TTS)
  suggestions: string[]; // 3 follow-up questions in the user's language
}

function systemPrompt(language: Language): string {
  const lang = LANG_NAME[language] || 'English';
  return [
    'You are "Kisan Mitra", a friendly, expert agriculture advisor for Indian farmers.',
    'Give practical, correct, concise advice on crops, soil, fertiliser, pests/disease,',
    'irrigation, weather, mandi prices and government schemes (India-specific, e.g. PM-KISAN,',
    'PMFBY, soil health card). Keep replies short — 2 to 4 sentences or a few bullet points a',
    'small farmer can act on today. Avoid jargon. Prefer specific quantities (e.g. urea per acre).',
    `Reply in ${lang}.`,
    'Respond ONLY as compact JSON, no markdown, with this exact shape:',
    `{"reply": "<answer in ${lang}>", "replyEnglish": "<same answer in English>", "suggestions": ["<q1>","<q2>","<q3>"]}`,
    `The suggestions must be short follow-up questions a farmer might tap next, written in ${lang}.`,
  ].join(' ');
}

/** Build Gemini "contents" from recent chat history + the new user message. */
function buildContents(history: ChatMessage[], userText: string) {
  const recent = history.slice(-6).filter(m => m.text); // keep it light
  const turns = recent.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text as string }],
  }));
  turns.push({ role: 'user', parts: [{ text: userText }] });
  return turns;
}

/** Return the first balanced {...} object in a string (Gemini sometimes appends
 *  extra content after the JSON, which breaks a naive JSON.parse). */
function firstJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') inStr = !inStr;
    else if (!inStr) {
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) return s.slice(start, i + 1);
      }
    }
  }
  return null;
}

/** Extract one string field from (possibly truncated) JSON, unescaped. */
function field(json: string, key: string): string | null {
  const m = json.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (!m) return null;
  try {
    return JSON.parse(`"${m[1]}"`); // unescape \n, \" etc.
  } catch {
    return m[1];
  }
}

function safeParse(raw: string): GeminiReply | null {
  // Gemini may wrap JSON in ```json fences despite instructions — strip them.
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  // 1) Parse just the first JSON object (handles trailing "extra data").
  try {
    const obj = firstJsonObject(cleaned) || cleaned;
    const j = JSON.parse(obj);
    if (j.reply) {
      return {
        text: String(j.reply),
        textEn: String(j.replyEnglish || j.reply),
        suggestions: Array.isArray(j.suggestions) ? j.suggestions.slice(0, 3).map(String) : [],
      };
    }
  } catch {
    /* fall through to field extraction */
  }

  // 2) Truncated/imperfect JSON → pull out the fields we can (never show raw braces).
  const reply = field(cleaned, 'reply');
  if (reply) {
    const suggMatch = cleaned.match(/"suggestions"\s*:\s*\[([^\]]*)\]/);
    const suggestions = suggMatch
      ? (suggMatch[1].match(/"((?:[^"\\]|\\.)*)"/g) || []).slice(0, 3).map(s => s.replace(/^"|"$/g, ''))
      : [];
    return { text: reply, textEn: field(cleaned, 'replyEnglish') || reply, suggestions };
  }

  // 3) Last resort: if it isn't JSON-looking at all, show it as the reply.
  if (cleaned && !cleaned.startsWith('{')) return { text: cleaned, textEn: cleaned, suggestions: [] };
  return null;
}

/**
 * Vision: diagnose a crop photo (disease / pest / nutrient deficiency) and
 * recommend treatment. Uses the same Gemini model with an inline image.
 */
export async function generateGeminiVisionReply(args: {
  base64: string;
  mimeType: string;
  language: Language;
  userText?: string;
  signal?: AbortSignal;
}): Promise<GeminiReply | null> {
  if (!isGeminiConfigured || !args.base64) return null;
  const lang = LANG_NAME[args.language] || 'English';
  const prompt = [
    'You are "Kisan Mitra". A farmer has sent a photo of their crop/plant.',
    'Identify the crop (if visible) and the most likely problem — disease, pest,',
    'or nutrient deficiency. Give: the problem name, how severe it looks, a clear',
    'treatment (one organic option AND one chemical option with approximate dosage',
    'per acre), and one prevention tip. If the image is unclear or not a plant, say',
    'so politely and ask for a closer photo.',
    args.userText ? `The farmer also said: "${args.userText}".` : '',
    `Reply in ${lang}. Respond ONLY as JSON:`,
    `{"reply":"<answer in ${lang}>","replyEnglish":"<same in English>","suggestions":["<q1>","<q2>","<q3>"]}`,
  ].join(' ');

  const url = `${ENV.geminiBaseUrl}/models/${ENV.geminiModel}:generateContent?key=${ENV.geminiApiKey}`;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inline_data: { mime_type: args.mimeType || 'image/jpeg', data: args.base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: args.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? safeParse(text) : null;
  } catch {
    return null;
  }
}

export async function generateGeminiReply(args: {
  userText: string;
  language: Language;
  history: ChatMessage[];
  signal?: AbortSignal;
}): Promise<GeminiReply | null> {
  if (!isGeminiConfigured || !args.userText.trim()) return null;

  const url = `${ENV.geminiBaseUrl}/models/${ENV.geminiModel}:generateContent?key=${ENV.geminiApiKey}`;
  const body = {
    system_instruction: { parts: [{ text: systemPrompt(args.language) }] },
    contents: buildContents(args.history, args.userText),
    generationConfig: {
      temperature: 0.6,
      // Generous budget — Indic scripts use many tokens; too small truncates the JSON.
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: args.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? safeParse(text) : null;
  } catch {
    return null;
  }
}
