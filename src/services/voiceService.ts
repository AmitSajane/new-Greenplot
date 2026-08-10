/**
 * Voice service — Text-to-Speech (react-native-tts) + Speech-to-Text
 * (@dev-amirzubair/react-native-voice — a New Architecture / TurboModule
 * compatible fork of @react-native-voice/voice, same API; the original
 * package returns a null native module under this project's New Architecture
 * build and every call silently fails), wrapped defensively.
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
  Voice = require('@dev-amirzubair/react-native-voice').default ?? require('@dev-amirzubair/react-native-voice');
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

export interface SpeakHandlers {
  onStart?: () => void;
  onDone?: () => void;
  onCancel?: () => void;
}

// react-native-tts exposes speech progress as global engine events, not a
// per-call callback — so we keep a single "who's listening right now" ref
// that speak()/stopSpeaking() update, and one set of listeners bound once.
let ttsListenersBound = false;
let currentSpeakHandlers: SpeakHandlers | null = null;

// A throw inside a native-event callback isn't caught by any surrounding
// try/catch in the code that registered it (it runs on its own tick via the
// bridge), so each handler gets its own guard rather than relying on
// bindTtsListenersOnce()'s try/catch, which only covers registration.
function safeCall(fn?: () => void): void {
  try {
    fn?.();
  } catch {
    /* never let a UI handler crash the TTS event bridge */
  }
}

function bindTtsListenersOnce(): void {
  if (ttsListenersBound || !isTtsAvailable() || typeof Tts.addEventListener !== 'function') return;
  try {
    Tts.addEventListener('tts-start', () => safeCall(currentSpeakHandlers?.onStart));
    Tts.addEventListener('tts-finish', () => {
      safeCall(currentSpeakHandlers?.onDone);
      currentSpeakHandlers = null;
    });
    Tts.addEventListener('tts-cancel', () => {
      safeCall(currentSpeakHandlers?.onCancel);
      currentSpeakHandlers = null;
    });
    ttsListenersBound = true;
  } catch {
    /* event API not supported on this platform/version — caller just won't see start/stop */
  }
}

/**
 * Speak text in the user's preferred language; falls back to English voice.
 * Optional `handlers` let the UI react to real playback start/finish/cancel
 * (e.g. to animate an avatar while speech is actually playing).
 */
export async function speak(text: string, language: Language, handlers?: SpeakHandlers): Promise<boolean> {
  if (!isTtsAvailable() || !text) return false;
  try {
    await ensureTtsReady();
    bindTtsListenersOnce();
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
    currentSpeakHandlers = handlers ?? null;
    // Tts.speak() returns a promise on some platforms — left un-awaited (we
    // don't want callers blocked until playback finishes), so any rejection
    // needs its own .catch or React Native surfaces it as an uncaught error.
    Promise.resolve(Tts.speak(text)).catch(() => {
      currentSpeakHandlers = null;
    });
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (!isTtsAvailable()) return;
  try {
    Promise.resolve(Tts.stop()).catch(() => {});
  } catch {
    /* ignore */
  }
  // Belt-and-braces: some platforms/versions don't fire 'tts-cancel' on a
  // manual stop, so tell whoever's listening directly too.
  currentSpeakHandlers?.onCancel?.();
  currentSpeakHandlers = null;
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
