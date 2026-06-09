/**
 * Voice service — Text-to-Speech (react-native-tts) + Speech-to-Text
 * (@react-native-voice/voice), wrapped defensively.
 *
 * Every call is guarded so the app NEVER crashes if the native module isn't
 * linked yet (e.g. before a rebuild, or on a simulator with no mic). Callers
 * can probe `isTtsAvailable()` / `isSttAvailable()` and always have a fallback.
 */
import { PermissionsAndroid, Platform } from 'react-native';
import { Language } from './aiAssistantService';

// Optional native modules — never throw at import time.
let Tts: any = null;
let Voice: any = null;
try {
  Tts = require('react-native-tts').default ?? require('react-native-tts');
} catch {
  Tts = null;
}
try {
  Voice = require('@react-native-voice/voice').default ?? require('@react-native-voice/voice');
} catch {
  Voice = null;
}

/** App language → BCP-47 locale for both TTS and STT. */
export const voiceLocale: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};

export function isTtsAvailable(): boolean {
  return !!Tts && typeof Tts.speak === 'function';
}

export function isSttAvailable(): boolean {
  return !!Voice && typeof Voice.start === 'function';
}

// ── Text-to-Speech ──────────────────────────────────────────────────────────

let ttsReady = false;
async function ensureTtsReady(): Promise<void> {
  if (!isTtsAvailable() || ttsReady) return;
  try {
    await Tts.getInitStatus?.();
  } catch {
    /* no engine on this device — speak() may still no-op gracefully */
  }
  ttsReady = true;
}

/** Speak text in the user's preferred language; falls back to English voice. */
export async function speak(text: string, language: Language): Promise<boolean> {
  if (!isTtsAvailable() || !text) return false;
  try {
    await ensureTtsReady();
    try {
      await Tts.stop();
    } catch {
      /* nothing playing */
    }
    try {
      await Tts.setDefaultLanguage(voiceLocale[language]);
    } catch {
      // Requested voice not installed on the device → fall back to English.
      try {
        await Tts.setDefaultLanguage('en-IN');
      } catch {
        /* leave engine default */
      }
    }
    try {
      await Tts.setDefaultRate?.(0.45);
    } catch {
      /* optional */
    }
    Tts.speak(text);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (!isTtsAvailable()) return;
  try {
    Tts.stop();
  } catch {
    /* ignore */
  }
}

// ── Speech-to-Text ──────────────────────────────────────────────────────────

export interface ListenHandlers {
  onStart?: () => void;
  onResult: (text: string) => void;
  onError: (reason: string) => void;
  onEnd?: () => void;
}

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
      title: 'Microphone permission',
      message: 'Kisan Mitra needs the mic to listen to your question.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/** Start listening; returns true only if recognition actually started. */
export async function startListening(language: Language, handlers: ListenHandlers): Promise<boolean> {
  if (!isSttAvailable()) return false;

  const ok = await ensureMicPermission();
  if (!ok) {
    handlers.onError('permission-denied');
    return false;
  }

  Voice.onSpeechStart = () => handlers.onStart?.();
  Voice.onSpeechEnd = () => handlers.onEnd?.();
  Voice.onSpeechResults = (e: { value?: string[] }) => {
    const text = e?.value?.[0]?.trim();
    if (text) handlers.onResult(text);
  };
  Voice.onSpeechError = (e: { error?: { message?: string } }) => {
    handlers.onError(e?.error?.message || 'speech-error');
  };

  try {
    await Voice.start(voiceLocale[language]);
    return true;
  } catch {
    // Locale may be unsupported on the device → retry with English once.
    try {
      await Voice.start('en-IN');
      return true;
    } catch {
      return false;
    }
  }
}

export async function stopListening(): Promise<void> {
  if (!isSttAvailable()) return;
  try {
    await Voice.stop();
  } catch {
    /* ignore */
  }
}

/** Remove all listeners + stop engines. Call on unmount to avoid leaks. */
export function teardownVoice(): void {
  stopSpeaking();
  if (isSttAvailable()) {
    try {
      Voice.destroy().then(() => Voice.removeAllListeners?.());
    } catch {
      try {
        Voice.removeAllListeners?.();
      } catch {
        /* ignore */
      }
    }
  }
}
