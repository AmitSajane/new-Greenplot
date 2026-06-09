import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ActionType,
  ChatMessage,
  Language,
  generateAssistantReply,
} from '../../services/aiAssistantService';
import {
  isSttAvailable,
  speak,
  startListening,
  stopListening,
  stopSpeaking,
  teardownVoice,
} from '../../services/voiceService';
import { uiStrings } from './constants';

// Defensive optional require for the image picker (camera attach).
let ImagePicker: { launchImageLibrary?: Function } | null;
try {
  ImagePicker = require('react-native-image-picker');
} catch {
  ImagePicker = null;
}

type Nav = { navigate: (name: string, params?: object) => void; getParent?: () => Nav | undefined };

let counter = 0;
const makeId = (p: string) => `${p}_${Date.now()}_${counter++}`;

const LISTEN_TIMEOUT_MS = 8000;

export function useKisanMitra() {
  const navigation = useNavigation() as unknown as Nav;

  const [language, setLanguage] = useState<Language>('kn'); // Karnataka-first default
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const ui = useMemo(() => uiStrings(language), [language]);

  // Timers + listen guards (cleared on unmount → no state-after-unmount leaks).
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const listenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenHandled = useRef(false);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (listenTimeout.current) clearTimeout(listenTimeout.current);
      teardownVoice();
    },
    [],
  );

  const goTab = useCallback(
    (tab: string, params?: object) => navigation.getParent?.()?.navigate(tab, params),
    [navigation],
  );

  const respond = useCallback(
    (args: { userText?: string; imageUri?: string }) => {
      stopSpeaking();
      setIsThinking(true);
      setSuggestions([]);
      const t = setTimeout(() => {
        const reply = generateAssistantReply({ ...args, language, history: messages });
        setMessages(prev => [
          ...prev,
          {
            id: makeId('a'),
            role: 'assistant',
            text: reply.text,
            textEn: reply.textEn,
            actions: reply.actions,
            verified: reply.verified,
            createdAt: Date.now(),
          },
        ]);
        setSuggestions(reply.suggestions);
        setIsThinking(false);
      }, 700);
      timers.current.push(t);
    },
    [language, messages],
  );

  const sendText = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isThinking) return;
      setMessages(prev => [...prev, { id: makeId('u'), role: 'user', text, createdAt: Date.now() }]);
      respond({ userText: text });
    },
    [isThinking, respond],
  );

  const sendImage = useCallback(
    (uri: string) => {
      setMessages(prev => [...prev, { id: makeId('u'), role: 'user', imageUri: uri, createdAt: Date.now() }]);
      respond({ imageUri: uri });
    },
    [respond],
  );

  const pickImage = useCallback(() => {
    if (!ImagePicker?.launchImageLibrary) {
      Alert.alert('Camera', 'Image picker is not available in this build.');
      return;
    }
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1 },
      (res: { didCancel?: boolean; assets?: { uri?: string }[] }) => {
        if (res.didCancel) return;
        const uri = res.assets?.[0]?.uri;
        if (uri) sendImage(uri);
      },
    );
  }, [sendImage]);

  // Fallback used when real speech-to-text is unavailable (e.g. simulator).
  const sendVoiceMock = useCallback(() => {
    const text = ui.voiceSampleMessage;
    setMessages(prev => [
      ...prev,
      { id: makeId('u'), role: 'user', isVoice: true, voiceDuration: '0:06', text, createdAt: Date.now() },
    ]);
    respond({ userText: text });
  }, [respond, ui.voiceSampleMessage]);

  const clearListen = useCallback(() => {
    if (listenTimeout.current) {
      clearTimeout(listenTimeout.current);
      listenTimeout.current = null;
    }
    setIsListening(false);
  }, []);

  // Press-to-talk: tap to start, tap again (or auto) to stop. Robust fallbacks.
  const onMic = useCallback(async () => {
    if (isThinking) return;

    if (isListening) {
      listenHandled.current = true;
      clearListen();
      await stopListening();
      return;
    }

    if (!isSttAvailable()) {
      // No native STT (e.g. simulator / not rebuilt) → demo-safe mock.
      sendVoiceMock();
      return;
    }

    listenHandled.current = false;
    setIsListening(true);
    stopSpeaking();

    const started = await startListening(language, {
      onResult: text => {
        if (listenHandled.current) return;
        listenHandled.current = true;
        clearListen();
        stopListening();
        sendText(text);
      },
      onError: reason => {
        if (listenHandled.current) return;
        listenHandled.current = true;
        clearListen();
        if (reason === 'permission-denied') {
          Alert.alert('Microphone needed', 'Please allow microphone access to speak to Kisan Mitra.');
        }
        // For any other recognition error, stay quiet and let the user retry.
      },
    });

    if (!started) {
      // Couldn't start (locale unsupported / module missing) → mock so demo flows.
      listenHandled.current = true;
      clearListen();
      sendVoiceMock();
      return;
    }

    // Safety: auto-stop if nothing is recognised in time.
    listenTimeout.current = setTimeout(() => {
      if (listenHandled.current) return;
      listenHandled.current = true;
      clearListen();
      stopListening();
    }, LISTEN_TIMEOUT_MS);
  }, [isThinking, isListening, language, clearListen, sendText, sendVoiceMock]);

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    respond({ userText: lastUser.text, imageUri: lastUser.imageUri });
  }, [messages, respond]);

  const toggleTranslate = useCallback((id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, showEnglish: !m.showEnglish } : m)));
  }, []);

  const setFeedback = useCallback((id: string, value: 'up' | 'down') => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, feedback: m.feedback === value ? undefined : value } : m)));
  }, []);

  // Read a message aloud in the right language (English voice if it's translated).
  const readAloud = useCallback(
    (text: string, english: boolean) => {
      speak(text, english ? 'en' : language).then(ok => {
        if (!ok) Alert.alert('🔊', 'Voice output is not available on this device yet.');
      });
    },
    [language],
  );

  const onAction = useCallback(
    (type: ActionType) => {
      switch (type) {
        case 'buy':
        case 'market':
          return goTab('Market');
        case 'community':
          return goTab('Hub');
        case 'soil':
          return navigation.navigate('SoilTest');
        case 'scan':
          return pickImage();
        default:
          return undefined;
      }
    },
    [goTab, navigation, pickImage],
  );

  const chooseLanguage = useCallback((code: Language) => {
    setLanguage(code);
    setLangPickerOpen(false);
  }, []);

  return {
    language,
    ui,
    messages,
    suggestions,
    isThinking,
    isListening,
    showWelcome: messages.length === 0,
    langPickerOpen,

    sendText,
    pickImage,
    onMic,
    regenerate,
    toggleTranslate,
    setFeedback,
    readAloud,
    onAction,
    openLangPicker: useCallback(() => setLangPickerOpen(true), []),
    closeLangPicker: useCallback(() => setLangPickerOpen(false), []),
    chooseLanguage,
  };
}

export type KisanMitraVM = ReturnType<typeof useKisanMitra>;
