import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import {
  ActionType,
  ChatMessage,
  Language,
  generateAssistantReply,
} from '../../services/aiAssistantService';
import { generateGeminiReply, generateGeminiVisionReply } from '../../services/geminiService';
import { isGeminiConfigured } from '../../config/env';
import {
  isSttAvailable,
  speak,
  startListening,
  stopListening,
  stopSpeaking,
  teardownVoice,
} from '../../services/voiceService';
import { uiStrings } from './constants';
import type { MediaSource } from '../hub/hooks/useCommunityHub';

// Defensive optional require for the image picker — same pattern as useCommunityHub.ts,
// callback-style (this file's existing calling convention, kept as-is).
type PickerResult = { didCancel?: boolean; assets?: { uri?: string; base64?: string; type?: string }[] };
type PickerFn = (options: Record<string, unknown>, callback: (res: PickerResult) => void) => void;
let ImagePicker: { launchImageLibrary?: PickerFn; launchCamera?: PickerFn } | null;
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
  const { user } = useAuth();

  const [language, setLanguage] = useState<Language>('kn'); // Karnataka-first default
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  // Id of the message currently being read aloud (null = nothing speaking).
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const ui = useMemo(() => uiStrings(language, user?.name), [language, user?.name]);

  // Timers + listen guards (cleared on unmount → no state-after-unmount leaks).
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const listenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenHandled = useRef(false);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
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

  // Read a message aloud in the right language (English voice if it's translated).
  // `speakingId` tracks which bubble is actually playing right now, driven by
  // the TTS engine's own start/finish/cancel events — not just "we asked it to".
  // Declared above `respond` so a voice-originated question can trigger it
  // directly once the reply lands, without needing a ref indirection.
  const readAloud = useCallback(
    (id: string, text: string, english: boolean, opts?: { silent?: boolean }) => {
      speak(text, english ? 'en' : language, {
        onStart: () => mounted.current && setSpeakingId(id),
        onDone: () => mounted.current && setSpeakingId(prev => (prev === id ? null : prev)),
        onCancel: () => mounted.current && setSpeakingId(prev => (prev === id ? null : prev)),
      }).then(ok => {
        if (!ok && !opts?.silent) Alert.alert('🔊', 'Voice output is not available on this device yet.');
      });
    },
    [language],
  );

  const respond = useCallback(
    (args: { userText?: string; imageUri?: string; imageBase64?: string; imageMime?: string; viaVoice?: boolean }) => {
      stopSpeaking();
      setIsThinking(true);
      setSuggestions([]);

      // Offline engine reply (also supplies contextual action buttons + a
      // sensible fallback if AI is off/unavailable).
      const base = generateAssistantReply({ ...args, language, history: messages });

      const finish = (text: string, textEn: string, suggestions: string[]) => {
        if (!mounted.current) return;
        const id = makeId('a');
        setMessages(prev => [
          ...prev,
          {
            id,
            role: 'assistant',
            text,
            textEn,
            actions: base.actions,
            verified: base.verified,
            createdAt: Date.now(),
          },
        ]);
        setSuggestions(suggestions.length ? suggestions : base.suggestions);
        setIsThinking(false);
        // Voice in, voice out — a spoken question gets a spoken answer
        // without waiting for a tap on the speaker icon.
        if (args.viaVoice) readAloud(id, text, false, { silent: true });
      };

      const fallback = () => finish(base.text, base.textEn, base.suggestions);

      // Real AI — photo disease detection (image) takes priority.
      if (isGeminiConfigured && args.imageBase64) {
        generateGeminiVisionReply({
          base64: args.imageBase64,
          mimeType: args.imageMime || 'image/jpeg',
          language,
          userText: args.userText,
        })
          .then(ai => (ai ? finish(ai.text, ai.textEn, ai.suggestions) : fallback()))
          .catch(fallback);
        return;
      }

      // Real AI for text questions.
      if (isGeminiConfigured && args.userText) {
        generateGeminiReply({ userText: args.userText, language, history: messages })
          .then(ai => (ai ? finish(ai.text, ai.textEn, ai.suggestions) : fallback()))
          .catch(fallback);
        return;
      }

      // Offline path (no key) — brief "thinking" delay.
      const t = setTimeout(fallback, 700);
      timers.current.push(t);
    },
    [language, messages, readAloud],
  );

  const sendText = useCallback(
    (raw: string, viaVoice?: boolean) => {
      const text = raw.trim();
      if (!text || isThinking) return;
      setMessages(prev => [...prev, { id: makeId('u'), role: 'user', text, createdAt: Date.now() }]);
      respond({ userText: text, viaVoice });
    },
    [isThinking, respond],
  );

  const sendImage = useCallback(
    (uri: string, base64?: string, mime?: string) => {
      setMessages(prev => [...prev, { id: makeId('u'), role: 'user', imageUri: uri, createdAt: Date.now() }]);
      respond({ imageUri: uri, imageBase64: base64, imageMime: mime });
    },
    [respond],
  );

  const pickImageFromSource = useCallback(
    (source: MediaSource) => {
      const launch = source === 'camera-photo' ? ImagePicker?.launchCamera : ImagePicker?.launchImageLibrary;
      if (!launch) {
        Alert.alert('Camera', 'Camera/gallery access is not available on this device.');
        return;
      }
      launch(
        // includeBase64 + resize → small enough to send to Gemini Vision quickly.
        { mediaType: 'photo', selectionLimit: 1, includeBase64: true, maxWidth: 1280, maxHeight: 1280, quality: 0.7 },
        (res: { didCancel?: boolean; assets?: { uri?: string; base64?: string; type?: string }[] }) => {
          if (res.didCancel) return;
          const a = res.assets?.[0];
          if (a?.uri) sendImage(a.uri, a.base64, a.type);
        },
      );
    },
    [sendImage],
  );

  // Attach button opens a "Take Photo vs Choose from Gallery" chooser instead
  // of jumping straight into the gallery picker, same UX as the Hub composer.
  const pickImage = useCallback(() => setMediaSheetOpen(true), []);
  const closeMediaSheet = useCallback(() => setMediaSheetOpen(false), []);
  const onPickMediaSource = useCallback(
    (source: MediaSource) => {
      setMediaSheetOpen(false);
      pickImageFromSource(source);
    },
    [pickImageFromSource],
  );

  // Real speech-to-text isn't available (native module missing/not rebuilt,
  // or it failed to start) — say so honestly instead of faking a voice
  // message with a fixed 6-second duration and a canned response.
  const showVoiceUnavailable = useCallback(() => {
    Alert.alert(
      'Voice input unavailable',
      "Voice input isn't available on this device right now. Please type your question instead.",
    );
  }, []);

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
      showVoiceUnavailable();
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
        sendText(text, true);
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
      // Couldn't start (locale unsupported / module missing).
      listenHandled.current = true;
      clearListen();
      showVoiceUnavailable();
      return;
    }

    // Safety: auto-stop if nothing is recognised in time.
    listenTimeout.current = setTimeout(() => {
      if (listenHandled.current) return;
      listenHandled.current = true;
      clearListen();
      stopListening();
    }, LISTEN_TIMEOUT_MS);
  }, [isThinking, isListening, language, clearListen, sendText, showVoiceUnavailable]);

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
    isSpeaking: speakingId !== null,
    speakingMessageId: speakingId,
    showWelcome: messages.length === 0,
    langPickerOpen,
    mediaSheetOpen,

    sendText,
    pickImage,
    onPickMediaSource,
    closeMediaSheet,
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
