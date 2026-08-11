import { Language } from '../../services/aiAssistantService';

export interface LanguageOption {
  code: Language;
  label: string;
}

/** Supported languages. Hindi + Kannada + English are fully localized; the
 *  rest fall back to English replies (UI labels still switch where available). */
export const LANGUAGES: LanguageOption[] = [
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
];

export interface QuickStart {
  id: string;
  emoji: string;
  tone: 'green' | 'amber' | 'blue' | 'red';
  titleEn: string;
  titleHi: string;
  titleKn: string;
  messageEn: string;
  messageHi: string;
  messageKn: string;
}

export const QUICK_STARTS: QuickStart[] = [
  { id: 'q1', emoji: '🔬', tone: 'red', titleEn: 'Diagnose crop', titleHi: 'फसल की बीमारी', titleKn: 'ಬೆಳೆ ರೋಗ', messageEn: 'My crop has yellow spots on the leaves', messageHi: 'मेरी फसल के पत्तों पर पीले धब्बे हैं', messageKn: 'ನನ್ನ ಬೆಳೆಯ ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಕಲೆಗಳಿವೆ' },
  { id: 'q2', emoji: '💧', tone: 'blue', titleEn: 'Irrigation', titleHi: 'सिंचाई सलाह', titleKn: 'ನೀರಾವರಿ ಸಲಹೆ', messageEn: 'How often should I water my crop?', messageHi: 'मुझे कितनी बार सिंचाई करनी चाहिए?', messageKn: 'ನಾನು ಎಷ್ಟು ಬಾರಿ ನೀರಾವರಿ ಮಾಡಬೇಕು?' },
  { id: 'q3', emoji: '💰', tone: 'green', titleEn: 'Market price', titleHi: 'मंडी भाव', titleKn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', messageEn: "What's today's mandi price for tomato?", messageHi: 'आज टमाटर का मंडी भाव क्या है?', messageKn: 'ಇಂದು ಟೊಮೆಟೊ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಏನು?' },
  { id: 'q4', emoji: '🌱', tone: 'amber', titleEn: 'Fertilizer', titleHi: 'खाद योजना', titleKn: 'ಗೊಬ್ಬರ ಯೋಜನೆ', messageEn: 'Suggest a fertilizer plan for my field', messageHi: 'मेरे खेत के लिए खाद की योजना बताएं', messageKn: 'ನನ್ನ ಹೊಲಕ್ಕೆ ಗೊಬ್ಬರ ಯೋಜನೆ ತಿಳಿಸಿ' },
  { id: 'q5', emoji: '🐛', tone: 'amber', titleEn: 'Pest control', titleHi: 'कीट नियंत्रण', titleKn: 'ಕೀಟ ನಿಯಂತ್ರಣ', messageEn: 'There are insects on my crop', messageHi: 'मेरी फसल में कीड़े लग गए हैं', messageKn: 'ನನ್ನ ಬೆಳೆಯಲ್ಲಿ ಕೀಟಗಳಿವೆ' },
  { id: 'q6', emoji: '🏛', tone: 'blue', titleEn: 'Govt schemes', titleHi: 'सरकारी योजना', titleKn: 'ಸರ್ಕಾರಿ ಯೋಜನೆ', messageEn: 'Which govt schemes can I apply for?', messageHi: 'मैं किन सरकारी योजनाओं के लिए आवेदन कर सकता हूं?', messageKn: 'ನಾನು ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು?' },
];

export function quickTitle(q: QuickStart, lang: Language): string {
  return lang === 'kn' ? q.titleKn : lang === 'hi' ? q.titleHi : q.titleEn;
}
export function quickSubtitle(q: QuickStart, lang: Language): string {
  return lang === 'en' ? q.titleHi : q.titleEn;
}
export function quickMessage(q: QuickStart, lang: Language): string {
  return lang === 'kn' ? q.messageKn : lang === 'hi' ? q.messageHi : q.messageEn;
}

interface UiStrings {
  greeting: string;
  online: string;
  typing: string;
  placeholder: string;
  followupsLabel: string;
  welcomeTitle: string;
  welcomeSub: string;
  voiceTitle: string;
  voiceSub: string;
  quickStartLabel: string;
  translate: string;
  showOriginal: string;
  verified: string;
  voiceSampleMessage: string;
  listening: string;
  speaking: string;
}

type UiStringsBase = Omit<UiStrings, 'welcomeTitle'>;

const STRINGS: Record<'en' | 'hi' | 'kn', UiStringsBase> = {
  en: {
    greeting: "Namaste! 🙏 I'm Kisan Mitra, your farming friend. Ask me anything about your crops, mandi prices or weather.",
    online: 'Online · your farming friend',
    typing: 'Typing…',
    placeholder: 'Ask anything…',
    followupsLabel: 'Suggested follow-ups',
    welcomeSub: "I'm Kisan Mitra — here to help with your crops, mandi, weather and schemes. Ask me anything!",
    voiceTitle: "Can't type? Just speak 🎙️",
    voiceSub: 'Ask by voice — in Kannada, Hindi or Marathi',
    quickStartLabel: 'Quick start',
    translate: 'Translate to English',
    showOriginal: 'Show original',
    verified: 'Expert-verified',
    voiceSampleMessage: 'There are insects on my crop, what should I do?',
    listening: 'Listening… speak now',
    speaking: 'Speaking…',
  },
  hi: {
    greeting: 'नमस्ते! 🙏 मैं किसान मित्र हूं, आपका खेती दोस्त। फसल, मंडी भाव या मौसम — कुछ भी पूछें।',
    online: 'ऑनलाइन · आपका खेती दोस्त',
    typing: 'लिख रहे हैं…',
    placeholder: 'कुछ भी पूछें…',
    followupsLabel: 'सुझाए गए सवाल',
    welcomeSub: 'मैं किसान मित्र हूं — फसल, मंडी, मौसम और योजनाओं में मदद के लिए। कुछ भी पूछें!',
    voiceTitle: 'टाइप नहीं कर सकते? बस बोलें 🎙️',
    voiceSub: 'बोलकर पूछें — कन्नड़, हिंदी या मराठी में',
    quickStartLabel: 'जल्दी शुरू करें',
    translate: 'अंग्रेज़ी में अनुवाद करें',
    showOriginal: 'मूल दिखाएं',
    verified: 'विशेषज्ञ-सत्यापित',
    voiceSampleMessage: 'मेरी फसल में कीड़े लग गए हैं, क्या करूं?',
    listening: 'सुन रहे हैं… अब बोलें',
    speaking: 'बोल रहे हैं…',
  },
  kn: {
    greeting: 'ನಮಸ್ಕಾರ! 🙏 ನಾನು ಕಿಸಾನ್ ಮಿತ್ರ, ನಿಮ್ಮ ಕೃಷಿ ಸ್ನೇಹಿತ. ಬೆಳೆ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಅಥವಾ ಹವಾಮಾನ — ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.',
    online: 'ಆನ್‌ಲೈನ್ · ನಿಮ್ಮ ಕೃಷಿ ಸ್ನೇಹಿತ',
    typing: 'ಟೈಪ್ ಮಾಡುತ್ತಿದೆ…',
    placeholder: 'ಏನು ಬೇಕಾದರೂ ಕೇಳಿ…',
    followupsLabel: 'ಸೂಚಿಸಿದ ಪ್ರಶ್ನೆಗಳು',
    welcomeSub: 'ನಾನು ಕಿಸಾನ್ ಮಿತ್ರ — ಬೆಳೆ, ಮಾರುಕಟ್ಟೆ, ಹವಾಮಾನ ಮತ್ತು ಯೋಜನೆಗಳಲ್ಲಿ ಸಹಾಯಕ್ಕಾಗಿ. ಏನು ಬೇಕಾದರೂ ಕೇಳಿ!',
    voiceTitle: 'ಟೈಪ್ ಮಾಡಲಾಗದೇ? ಮಾತನಾಡಿ 🎙️',
    voiceSub: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ — ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಮರಾಠಿಯಲ್ಲಿ',
    quickStartLabel: 'ತ್ವರಿತ ಆರಂಭ',
    translate: 'ಇಂಗ್ಲಿಷ್‌ಗೆ ಅನುವಾದಿಸಿ',
    showOriginal: 'ಮೂಲ ತೋರಿಸಿ',
    verified: 'ತಜ್ಞ-ಪರಿಶೀಲಿತ',
    voiceSampleMessage: 'ನನ್ನ ಬೆಳೆಯಲ್ಲಿ ಕೀಟಗಳಿವೆ, ಏನು ಮಾಡಲಿ?',
    listening: 'ಕೇಳುತ್ತಿದೆ… ಈಗ ಮಾತನಾಡಿ',
    speaking: 'ಮಾತನಾಡುತ್ತಿದೆ…',
  },
};

// Generic fallback used only when the user's name isn't available (e.g. not
// signed in yet) — the greeting itself is built from the real logged-in
// user's name, not a fixed placeholder.
const GREETING_FALLBACK_NAME: Record<'en' | 'hi' | 'kn', string> = {
  en: 'Farmer',
  hi: 'किसान',
  kn: 'ರೈತರೇ',
};

function welcomeTitleFor(lang: 'en' | 'hi' | 'kn', name?: string): string {
  const who = name?.trim() || GREETING_FALLBACK_NAME[lang];
  if (lang === 'hi') return `नमस्ते, ${who}! 🙏`;
  if (lang === 'kn') return `ನಮಸ್ಕಾರ, ${who}! 🙏`;
  return `Namaste, ${who}! 🙏`;
}

/** UI strings for a language (Hindi/Kannada localized; others fall back to
 *  English). `userName` personalizes the welcome greeting — falls back to a
 *  generic per-language word (e.g. "Farmer") when unavailable. */
export function uiStrings(language: Language, userName?: string): UiStrings {
  const lang = language === 'hi' ? 'hi' : language === 'kn' ? 'kn' : 'en';
  return { ...STRINGS[lang], welcomeTitle: welcomeTitleFor(lang, userName) };
}
