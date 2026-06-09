/**
 * Kisan Mitra — mock conversational engine.
 *
 * Deterministic, offline, demo-stable: intent is detected from the message
 * (English, Hindi & Kannada keywords) and a localized reply is returned with
 * follow-up questions and optional in-app actions. Swap this file for a real
 * LLM/RAG backend later without touching the UI.
 */

export type ChatRole = 'user' | 'assistant';

export type Language = 'en' | 'hi' | 'kn' | 'mr' | 'te' | 'bn';

export type ActionType = 'buy' | 'scan' | 'community' | 'soil' | 'market';

export interface AssistantAction {
  type: ActionType;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text?: string;
  /** English version of an assistant message, for the one-tap Translate toggle. */
  textEn?: string;
  imageUri?: string;
  isVoice?: boolean;
  voiceDuration?: string;
  actions?: AssistantAction[];
  verified?: boolean;
  suggestions?: string[];
  showEnglish?: boolean;
  feedback?: 'up' | 'down';
  createdAt: number;
}

export interface AssistantReply {
  text: string;
  textEn: string;
  suggestions: string[];
  actions?: AssistantAction[];
  verified?: boolean;
}

type Intent =
  | 'disease'
  | 'irrigation'
  | 'fertilizer'
  | 'market'
  | 'scheme'
  | 'harvest'
  | 'weather'
  | 'image'
  | 'generic';

interface LocalizedReply {
  text: string;
  suggestions: string[];
  actions?: AssistantAction[];
  verified?: boolean;
}

type ReplySet = { en: LocalizedReply; hi: LocalizedReply; kn: LocalizedReply };

const REPLIES: Record<Intent, ReplySet> = {
  disease: {
    en: {
      text: 'This looks like Early Blight (a fungus). Do this now:\n1. Remove the yellow leaves\n2. Spray neem oil (5ml/litre)\n3. Don’t wet the leaves while watering.',
      suggestions: ["What's the organic cure?", 'Which chemical medicine is best?', 'How do I prevent it next time?'],
      actions: [{ type: 'buy', label: 'Buy neem oil' }, { type: 'scan', label: 'Scan leaf' }],
      verified: true,
    },
    hi: {
      text: 'यह अर्ली ब्लाइट (फफूंद) लगता है। तुरंत करें:\n1. पीले पत्ते हटा दें\n2. नीम तेल (5ml/लीटर) छिड़कें\n3. पत्तों पर पानी न डालें।',
      suggestions: ['इसका जैविक इलाज क्या है?', 'कौन सी रासायनिक दवा सही है?', 'दोबारा कैसे रोकें?'],
      actions: [{ type: 'buy', label: 'नीम तेल खरीदें' }, { type: 'scan', label: 'पत्ती स्कैन करें' }],
      verified: true,
    },
    kn: {
      text: 'ಇದು ಅರ್ಲಿ ಬ್ಲೈಟ್ (ಶಿಲೀಂಧ್ರ ರೋಗ) ಇರಬಹುದು. ಈಗಲೇ ಮಾಡಿ:\n1. ಹಳದಿ ಎಲೆಗಳನ್ನು ತೆಗೆಯಿರಿ\n2. ಬೇವಿನ ಎಣ್ಣೆ (5ml/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ\n3. ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಹಾಕಬೇಡಿ.',
      suggestions: ['ಸಾವಯವ ಚಿಕಿತ್ಸೆ ಏನು?', 'ಯಾವ ರಾಸಾಯನಿಕ ಔಷಧ ಸರಿ?', 'ಮುಂದೆ ಹೇಗೆ ತಡೆಯುವುದು?'],
      actions: [{ type: 'buy', label: 'ಬೇವಿನ ಎಣ್ಣೆ ಖರೀದಿಸಿ' }, { type: 'scan', label: 'ಎಲೆ ಸ್ಕ್ಯಾನ್' }],
      verified: true,
    },
  },
  irrigation: {
    en: {
      text: 'Water deeply in the early morning. Sandy soil → small, frequent watering. Clay soil → less often but deeper. Check 5cm deep — if it’s dry, water.',
      suggestions: ['How often in summer?', 'Drip vs sprinkler?', 'How to check soil moisture?'],
      actions: [{ type: 'soil', label: 'Check my soil' }],
    },
    hi: {
      text: 'सुबह जल्दी गहरी सिंचाई करें। बलुई मिट्टी → थोड़ा-थोड़ा बार-बार। चिकनी मिट्टी → कम बार पर गहरा। 5 सेमी गहराई जांचें — सूखी हो तो पानी दें।',
      suggestions: ['गर्मी में कितनी बार?', 'ड्रिप या स्प्रिंकलर?', 'नमी कैसे जांचें?'],
      actions: [{ type: 'soil', label: 'मेरी मिट्टी जांचें' }],
    },
    kn: {
      text: 'ಬೆಳಿಗ್ಗೆ ಬೇಗ ಆಳವಾಗಿ ನೀರು ಹಾಯಿಸಿ. ಮರಳು ಮಣ್ಣು → ಸ್ವಲ್ಪ, ಪದೇ ಪದೇ. ಜೇಡಿ ಮಣ್ಣು → ಕಡಿಮೆ ಬಾರಿ ಆದರೆ ಆಳವಾಗಿ. 5 ಸೆಂ.ಮೀ ಆಳ ಪರೀಕ್ಷಿಸಿ — ಒಣಗಿದ್ದರೆ ನೀರು ಹಾಕಿ.',
      suggestions: ['ಬೇಸಿಗೆಯಲ್ಲಿ ಎಷ್ಟು ಬಾರಿ?', 'ಡ್ರಿಪ್ ಅಥವಾ ಸ್ಪ್ರಿಂಕ್ಲರ್?', 'ಮಣ್ಣಿನ ತೇವ ಹೇಗೆ ಪರೀಕ್ಷಿಸುವುದು?'],
      actions: [{ type: 'soil', label: 'ನನ್ನ ಮಣ್ಣು ಪರೀಕ್ಷಿಸಿ' }],
    },
  },
  fertilizer: {
    en: {
      text: 'Start with a soil test. Use compost/FYM for soil health + balanced NPK for growth. Too much nitrogen = lots of leaves but fewer fruits.',
      suggestions: ['What NPK should I use?', 'Organic vs chemical?', 'Make a fertilizer plan'],
      actions: [{ type: 'soil', label: 'Get soil report' }, { type: 'buy', label: 'Buy fertilizer' }],
    },
    hi: {
      text: 'पहले मिट्टी जांच कराएं। मिट्टी के लिए गोबर खाद + वृद्धि के लिए संतुलित NPK। ज्यादा नाइट्रोजन = ज्यादा पत्ते पर कम फल।',
      suggestions: ['कौन सा NPK लूं?', 'जैविक या रासायनिक?', 'खाद योजना बनाएं'],
      actions: [{ type: 'soil', label: 'मिट्टी रिपोर्ट लें' }, { type: 'buy', label: 'खाद खरीदें' }],
    },
    kn: {
      text: 'ಮೊದಲು ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ. ಮಣ್ಣಿಗೆ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ + ಬೆಳವಣಿಗೆಗೆ ಸಮತೋಲ NPK. ಹೆಚ್ಚು ನೈಟ್ರೋಜನ್ = ಹೆಚ್ಚು ಎಲೆ, ಕಡಿಮೆ ಹಣ್ಣು.',
      suggestions: ['ಯಾವ NPK ಬಳಸಲಿ?', 'ಸಾವಯವ ಅಥವಾ ರಾಸಾಯನಿಕ?', 'ಗೊಬ್ಬರ ಯೋಜನೆ ಮಾಡಿ'],
      actions: [{ type: 'soil', label: 'ಮಣ್ಣು ವರದಿ ಪಡೆಯಿರಿ' }, { type: 'buy', label: 'ಗೊಬ್ಬರ ಖರೀದಿಸಿ' }],
    },
  },
  market: {
    en: {
      text: 'Tomato is ₹18/kg at Dharwad today and falling. Belagavi offers ₹22/kg. AI expects ₹11 in 30 days — consider selling soon or storing in cold storage.',
      suggestions: ['Best mandi near me?', 'Should I store or sell?', 'Onion price today?'],
      actions: [{ type: 'market', label: 'Open Market' }],
    },
    hi: {
      text: 'धारवाड़ में आज टमाटर ₹18/किलो और गिर रहा है। बेलगावी में ₹22/किलो। AI के अनुसार 30 दिन में ₹11 — जल्दी बेचें या कोल्ड स्टोरेज में रखें।',
      suggestions: ['पास की सबसे अच्छी मंडी?', 'भंडारण करूं या बेचूं?', 'आज प्याज का भाव?'],
      actions: [{ type: 'market', label: 'मंडी देखें' }],
    },
    kn: {
      text: 'ಇಂದು ಧಾರವಾಡದಲ್ಲಿ ಟೊಮೆಟೊ ₹18/ಕೆಜಿ, ಇಳಿಯುತ್ತಿದೆ. ಬೆಳಗಾವಿಯಲ್ಲಿ ₹22/ಕೆಜಿ. AI ಪ್ರಕಾರ 30 ದಿನಗಳಲ್ಲಿ ₹11 — ಬೇಗ ಮಾರಿ ಅಥವಾ ಶೀತಲಗೃಹದಲ್ಲಿ ಇಡಿ.',
      suggestions: ['ಹತ್ತಿರದ ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ?', 'ಸಂಗ್ರಹಿಸಲಿ ಅಥವಾ ಮಾರಲಿ?', 'ಇಂದು ಈರುಳ್ಳಿ ಬೆಲೆ?'],
      actions: [{ type: 'market', label: 'ಮಾರುಕಟ್ಟೆ ತೆರೆಯಿರಿ' }],
    },
  },
  scheme: {
    en: {
      text: 'You may be eligible for PM-KISAN (₹6,000/year) and a drip-irrigation subsidy (up to 55%). Keep your Aadhaar-linked bank account active to receive payments.',
      suggestions: ['Am I eligible for PM-KISAN?', 'How to apply?', 'Crop insurance schemes?'],
    },
    hi: {
      text: 'आप PM-KISAN (₹6,000/वर्ष) और ड्रिप सिंचाई सब्सिडी (55% तक) के पात्र हो सकते हैं। भुगतान पाने के लिए आधार से जुड़ा बैंक खाता चालू रखें।',
      suggestions: ['क्या मैं PM-KISAN के पात्र हूं?', 'आवेदन कैसे करें?', 'फसल बीमा योजनाएं?'],
    },
    kn: {
      text: 'ನೀವು PM-KISAN (ವರ್ಷಕ್ಕೆ ₹6,000) ಮತ್ತು ಡ್ರಿಪ್ ನೀರಾವರಿ ಸಬ್ಸಿಡಿ (55% ವರೆಗೆ) ಗೆ ಅರ್ಹರಾಗಿರಬಹುದು. ಪಾವತಿ ಪಡೆಯಲು ಆಧಾರ್ ಲಿಂಕ್ ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಕ್ರಿಯವಾಗಿಡಿ.',
      suggestions: ['ನಾನು PM-KISAN ಗೆ ಅರ್ಹನೇ?', 'ಅರ್ಜಿ ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?', 'ಬೆಳೆ ವಿಮೆ ಯೋಜನೆಗಳು?'],
    },
  },
  harvest: {
    en: {
      text: 'Harvest tomatoes when they’re mostly colored but still firm. Pick in the cool morning, twist gently at the stem, and keep them shaded if it’s hot.',
      suggestions: ['How to store after harvest?', 'Best time to sell?', 'How to grade tomatoes?'],
      actions: [{ type: 'market', label: 'Check prices' }],
    },
    hi: {
      text: 'टमाटर तब तोड़ें जब ज्यादातर रंग आ जाए पर सख्त हों। ठंडी सुबह तोड़ें, डंठल से धीरे घुमाएं, गर्मी हो तो छाया में रखें।',
      suggestions: ['तोड़ने के बाद भंडारण कैसे?', 'बेचने का सही समय?', 'ग्रेडिंग कैसे करें?'],
      actions: [{ type: 'market', label: 'भाव देखें' }],
    },
    kn: {
      text: 'ಟೊಮೆಟೊ ಬಹುತೇಕ ಬಣ್ಣ ಬಂದು ಗಟ್ಟಿಯಾಗಿದ್ದಾಗ ಕೊಯ್ಲು ಮಾಡಿ. ತಂಪಾದ ಬೆಳಿಗ್ಗೆ ಕೊಯ್ಲು ಮಾಡಿ, ತೊಟ್ಟಿನಿಂದ ನಿಧಾನವಾಗಿ ತಿರುಗಿಸಿ, ಬಿಸಿಲಿದ್ದರೆ ನೆರಳಲ್ಲಿ ಇಡಿ.',
      suggestions: ['ಕೊಯ್ಲಿನ ನಂತರ ಸಂಗ್ರಹ ಹೇಗೆ?', 'ಮಾರಲು ಉತ್ತಮ ಸಮಯ?', 'ಗ್ರೇಡಿಂಗ್ ಹೇಗೆ?'],
      actions: [{ type: 'market', label: 'ಬೆಲೆ ನೋಡಿ' }],
    },
  },
  weather: {
    en: {
      text: 'Light rain is likely in Dharwad over the next 2 days. Hold off on spraying and harvesting; cover any dried produce. It’s a good window for transplanting after the rain.',
      suggestions: ['Will it rain this week?', 'Is it safe to spray today?', 'Best day to harvest?'],
    },
    hi: {
      text: 'धारवाड़ में अगले 2 दिनों में हल्की बारिश संभव है। छिड़काव और कटाई रोकें; सूखी उपज ढक दें। बारिश के बाद रोपाई का अच्छा समय है।',
      suggestions: ['इस हफ्ते बारिश होगी?', 'आज छिड़काव सुरक्षित है?', 'कटाई का सही दिन?'],
    },
    kn: {
      text: 'ಮುಂದಿನ 2 ದಿನಗಳಲ್ಲಿ ಧಾರವಾಡದಲ್ಲಿ ಸ್ವಲ್ಪ ಮಳೆ ಸಾಧ್ಯತೆ. ಸಿಂಪಡಣೆ ಮತ್ತು ಕೊಯ್ಲು ಮುಂದೂಡಿ; ಒಣಗಿದ ಬೆಳೆ ಮುಚ್ಚಿ. ಮಳೆಯ ನಂತರ ನಾಟಿಗೆ ಒಳ್ಳೆಯ ಸಮಯ.',
      suggestions: ['ಈ ವಾರ ಮಳೆ ಬರುತ್ತದೆಯೇ?', 'ಇಂದು ಸಿಂಪಡಣೆ ಸುರಕ್ಷಿತವೇ?', 'ಕೊಯ್ಲಿಗೆ ಉತ್ತಮ ದಿನ?'],
    },
  },
  image: {
    en: {
      text: 'Got your photo 📷. Which crop is this, and what are you noticing — spots, curling, yellowing or pests? I’ll diagnose it for you.',
      suggestions: ['Yellow spots on leaves', 'Leaves are curling', 'Tiny insects under leaves'],
      actions: [{ type: 'scan', label: 'Full Crop Doctor' }],
    },
    hi: {
      text: 'फोटो मिल गई 📷। यह कौन सी फसल है और क्या दिख रहा है — धब्बे, मुड़ना, पीलापन या कीड़े? मैं बताता हूं।',
      suggestions: ['पत्तों पर पीले धब्बे', 'पत्ते मुड़ रहे हैं', 'पत्तों के नीचे छोटे कीड़े'],
      actions: [{ type: 'scan', label: 'पूरा क्रॉप डॉक्टर' }],
    },
    kn: {
      text: 'ಫೋಟೋ ಸಿಕ್ಕಿತು 📷. ಇದು ಯಾವ ಬೆಳೆ ಮತ್ತು ಏನು ಕಾಣುತ್ತಿದೆ — ಕಲೆಗಳು, ಮುದುಡುವಿಕೆ, ಹಳದಿ ಅಥವಾ ಕೀಟಗಳು? ನಾನು ಹೇಳುತ್ತೇನೆ.',
      suggestions: ['ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಕಲೆಗಳು', 'ಎಲೆಗಳು ಮುದುಡುತ್ತಿವೆ', 'ಎಲೆಗಳ ಕೆಳಗೆ ಸಣ್ಣ ಕೀಟಗಳು'],
      actions: [{ type: 'scan', label: 'ಪೂರ್ಣ ಕ್ರಾಪ್ ಡಾಕ್ಟರ್' }],
    },
  },
  generic: {
    en: {
      text: 'I can help with crops, irrigation, pests, fertilizer, mandi prices, weather and govt schemes. What’s on your mind?',
      suggestions: ['Best time to harvest tomatoes?', 'How often should I irrigate?', "Today's mandi prices?"],
    },
    hi: {
      text: 'मैं फसल, सिंचाई, कीट, खाद, मंडी भाव, मौसम और सरकारी योजनाओं में मदद कर सकता हूं। क्या जानना है?',
      suggestions: ['टमाटर तोड़ने का सही समय?', 'कितनी बार सिंचाई करूं?', 'आज के मंडी भाव?'],
    },
    kn: {
      text: 'ನಾನು ಬೆಳೆ, ನೀರಾವರಿ, ಕೀಟ, ಗೊಬ್ಬರ, ಮಾರುಕಟ್ಟೆ ಬೆಲೆ, ಹವಾಮಾನ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಏನು ತಿಳಿಯಬೇಕು?',
      suggestions: ['ಟೊಮೆಟೊ ಕೊಯ್ಲಿಗೆ ಉತ್ತಮ ಸಮಯ?', 'ಎಷ್ಟು ಬಾರಿ ನೀರಾವರಿ?', 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ?'],
    },
  },
};

const KEYWORDS: { intent: Intent; words: string[] }[] = [
  { intent: 'disease', words: ['disease', 'spot', 'fungus', 'blight', 'pest', 'insect', 'curl', 'yellow', 'धब्बे', 'पत्ते', 'फफूंद', 'कीड़े', 'कीट', 'पीले', 'बीमारी', 'रोग', 'इलाज', 'दवा', 'ಕಲೆ', 'ಎಲೆ', 'ಶಿಲೀಂಧ್ರ', 'ಕೀಟ', 'ಹಳದಿ', 'ರೋಗ'] },
  { intent: 'weather', words: ['weather', 'rain', 'forecast', 'मौसम', 'बारिश', 'ಹವಾಮಾನ', 'ಮಳೆ'] },
  { intent: 'irrigation', words: ['water', 'irrigation', 'drip', 'moisture', 'सिंचाई', 'पानी', 'नमी', 'ड्रिप', 'ನೀರಾವರಿ', 'ನೀರು', 'ತೇವ'] },
  { intent: 'fertilizer', words: ['fertilizer', 'npk', 'manure', 'compost', 'urea', 'खाद', 'गोबर', 'यूरिया', 'ಗೊಬ್ಬರ', 'ಖಾದ್'] },
  { intent: 'market', words: ['price', 'mandi', 'market', 'sell', 'rate', 'भाव', 'मंडी', 'बेच', 'दाम', 'कीमत', 'ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ', 'ಮಾರ'] },
  { intent: 'scheme', words: ['scheme', 'subsidy', 'kisan', 'loan', 'insurance', 'योजना', 'सब्सिडी', 'बीमा', 'ऋण', 'ಯೋಜನೆ', 'ಸಬ್ಸಿಡಿ', 'ವಿಮೆ'] },
  { intent: 'harvest', words: ['harvest', 'pick', 'ripe', 'तोड़', 'कटाई', 'पकने', 'ಕೊಯ್ಲು'] },
];

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  for (const { intent, words } of KEYWORDS) {
    if (words.some(w => t.includes(w))) return intent;
  }
  return 'generic';
}

function pick(set: ReplySet, language: Language): LocalizedReply {
  if (language === 'hi') return set.hi;
  if (language === 'kn') return set.kn;
  return set.en; // mr / te / bn fall back to English replies (demo-honest)
}

export function generateAssistantReply(args: {
  userText?: string;
  imageUri?: string;
  language: Language;
  history: ChatMessage[];
}): AssistantReply {
  const { userText, imageUri, language } = args;

  const intent: Intent =
    imageUri && (!userText || !userText.trim()) ? 'image' : detectIntent(userText || '');

  const localized = pick(REPLIES[intent], language);
  const english = REPLIES[intent].en;

  return {
    text: localized.text,
    textEn: english.text,
    suggestions: localized.suggestions,
    actions: localized.actions,
    verified: localized.verified,
  };
}
