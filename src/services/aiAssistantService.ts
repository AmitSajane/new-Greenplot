export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text?: string;
  imageUri?: string;
  createdAt: number;
};

export type AssistantReply = {
  text: string;
  suggestions: string[];
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function makeSuggestions(topic: 'tomato' | 'irrigation' | 'fertilizer' | 'disease' | 'generic') {
  switch (topic) {
    case 'tomato':
      return [
        'How do I know tomatoes are fully ripe?',
        'What is the best time of day to harvest?',
        'How do I store tomatoes after harvest?',
      ];
    case 'irrigation':
      return [
        'How often should I water in summer?',
        'How to check soil moisture without a meter?',
        'Drip vs sprinkler: which is better?',
      ];
    case 'fertilizer':
      return [
        'What is NPK and how do I choose it?',
        'Organic vs chemical fertilizer?',
        'How often should I fertilize tomatoes?',
      ];
    case 'disease':
      return [
        'What are early signs of fungal disease?',
        'How can I prevent leaf blight?',
        'What should I do after spotting infected leaves?',
      ];
    default:
      return [
        'What should I do today for my crop?',
        'How to reduce pest risk this week?',
        'Explain this issue in simple steps',
      ];
  }
}

export function generateAssistantReply(args: {
  userText?: string;
  imageUri?: string;
  history: ChatMessage[];
}): AssistantReply {
  const { userText, imageUri } = args;

  if (imageUri && (!userText || !userText.trim())) {
    return {
      text:
        "I received the image. Tell me what crop it is and what you’re noticing (spots, curling, yellowing, pests, etc.). If you can, share your location and when the symptoms started.",
      suggestions: makeSuggestions('disease'),
    };
  }

  const text = normalize(userText || '');
  if (!text) {
    return {
      text: 'Ask me anything about farming — crops, irrigation, pests, weather planning, or market basics.',
      suggestions: makeSuggestions('generic'),
    };
  }

  // Tomato harvest intent
  if (text.includes('tomato') && (text.includes('harvest') || text.includes('pick'))) {
    return {
      text:
        "Harvest tomatoes when they’re mostly colored and still firm. Pick in the cool morning, twist gently at the stem, and avoid bruising. If it’s very hot, keep harvested tomatoes shaded.",
      suggestions: makeSuggestions('tomato'),
    };
  }

  // Irrigation intent
  if (text.includes('water') || text.includes('irrigation') || text.includes('drip')) {
    return {
      text:
        'A good baseline is deep watering early morning, then adjust by soil type and weather. Sandy soil needs smaller, more frequent watering; clay needs less frequent but deeper watering.',
      suggestions: makeSuggestions('irrigation'),
    };
  }

  // Fertilizer intent
  if (text.includes('fertilizer') || text.includes('npk') || text.includes('manure')) {
    return {
      text:
        'Start with a soil test if possible. Generally: compost/manure for soil health, and balanced NPK for growth — but too much nitrogen can cause lots of leaves and fewer fruits.',
      suggestions: makeSuggestions('fertilizer'),
    };
  }

  // Disease/pest intent
  if (
    text.includes('disease') ||
    text.includes('spots') ||
    text.includes('fungus') ||
    text.includes('blight') ||
    text.includes('pest') ||
    text.includes('insect')
  ) {
    return {
      text:
        'If you suspect disease: remove badly affected leaves, avoid watering foliage, improve airflow, and monitor daily. If you share the crop + symptoms (and an image), I can narrow it down.',
      suggestions: makeSuggestions('disease'),
    };
  }

  // Default
  return {
    text:
      'I can help with a quick plan. Tell me the crop, growth stage, location, and your main concern (watering, pests, disease, fertilizer, or harvest).',
    suggestions: makeSuggestions('generic'),
  };
}

