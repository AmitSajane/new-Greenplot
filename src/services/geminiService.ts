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

function safeParse(raw: string): GeminiReply | null {
  // Gemini may wrap JSON in ```json fences despite instructions — strip them.
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const j = JSON.parse(cleaned);
    if (!j.reply) return null;
    return {
      text: String(j.reply),
      textEn: String(j.replyEnglish || j.reply),
      suggestions: Array.isArray(j.suggestions) ? j.suggestions.slice(0, 3).map(String) : [],
    };
  } catch {
    // Not valid JSON → use the raw text as the reply so we still answer.
    return cleaned ? { text: cleaned, textEn: cleaned, suggestions: [] } : null;
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
      maxOutputTokens: 700,
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
