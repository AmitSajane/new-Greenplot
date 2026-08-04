import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, PermissionsAndroid, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound, { AudioEncoderAndroidType, AudioSourceAndroidType, OutputFormatAndroidType, type AudioSet } from 'react-native-nitro-sound';
import { hubStyles as s } from '../../styles/hub.styles';
import { MEDIA_RULES } from '../../constants/communityData';
import { InlineMediaPlayer } from './InlineMediaPlayer';

// Defensive optional require, same pattern used for react-native-image-picker
// in useCommunityHub.ts — @react-native-documents/picker resolves its native
// module with TurboModuleRegistry.getEnforcing() at import time (not lazily),
// so a plain top-level `import` throws synchronously and crashes the whole
// app (before React even mounts) on any build that hasn't linked the native
// module yet. Wrapping it in require()/try-catch turns that into a graceful
// "feature unavailable" instead of a blank white screen. (react-native-nitro-
// sound's default export is a lazy Proxy — it only touches native code on
// first method call, not on import — so it doesn't need this treatment.)
type DocumentPickerModule = {
  pick: (options?: { type?: string[] }) => Promise<{ uri: string; type: string | null }[]>;
  types: { audio: string };
  isErrorWithCode: (err: unknown) => err is { code: string };
  errorCodes: { OPERATION_CANCELED: string };
};
let DocumentPicker: DocumentPickerModule | null;
try {
  DocumentPicker = require('@react-native-documents/picker');
} catch {
  DocumentPicker = null;
}

interface RecordedVoice {
  base64: string;
  mime: string;
  /** Unknown for files picked from the device (no cheap way to read audio
   * duration without a native decoder) — only live recordings measure this. */
  durationSec?: number;
}

interface Props {
  visible: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: (voice: RecordedVoice) => void;
}

type Phase = 'choose' | 'permission-denied' | 'requesting' | 'recording' | 'recorded' | 'error';

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
      title: 'Microphone permission',
      message: 'GreenPlot needs the mic to record your voice note.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

const formatTime = (sec: number) => `0:${String(sec).padStart(2, '0')}`;

const RECORD_AUDIO_SET: AudioSet = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
  AVFormatIDKeyIOS: 'aac',
};

/** Records a short voice note via the device's actual microphone
 * (react-native-nitro-sound — a real native recorder). Previously this used
 * a hidden WebView running the browser's MediaRecorder API as a workaround
 * for not having a native audio library linked; that path was unreliable
 * (WebView getUserMedia support varies a lot by device/Android version). */
export const VoiceRecorderModal = React.memo(({ visible, busy, onClose, onConfirm }: Props) => {
  const [phase, setPhase] = useState<Phase>('choose');
  const [elapsed, setElapsed] = useState(0);
  const [recorded, setRecorded] = useState<RecordedVoice | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const elapsedRef = useRef(0);
  const listeningRef = useRef(false);

  const detachListener = useCallback(() => {
    if (!listeningRef.current) return;
    try {
      Sound.removeRecordBackListener();
    } catch {
      /* no active listener */
    }
    listeningRef.current = false;
  }, []);

  // Reads the finished recording off disk into base64 so it can flow through
  // the exact same upload path a picked file already uses.
  const stopRecording = useCallback(async () => {
    detachListener();
    try {
      const path = await Sound.stopRecorder();
      const durationSec = elapsedRef.current;
      const base64 = await RNFS.readFile(path, 'base64');
      const mime = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
      setRecorded({ base64, mime, durationSec });
      setPreviewUri(`data:${mime};base64,${base64}`);
      setPhase('recorded');
    } catch {
      setErrorMessage('Could not save the recording. Please try again.');
      setPhase('error');
    }
  }, [detachListener]);

  const startRecording = useCallback(async () => {
    try {
      await Sound.startRecorder(undefined, RECORD_AUDIO_SET, false);
      Sound.addRecordBackListener(meta => {
        const sec = Math.floor((meta.currentPosition ?? 0) / 1000);
        elapsedRef.current = sec;
        setElapsed(sec);
        if (sec >= MEDIA_RULES.voice.maxSec) stopRecording();
      });
      listeningRef.current = true;
      setPhase('recording');
    } catch {
      setErrorMessage('Could not access the microphone. Please try again.');
      setPhase('error');
    }
  }, [stopRecording]);

  // Kicked off only once the user explicitly chooses "Record Audio" in the
  // 'choose' step (not automatically on open) — requests the mic permission,
  // then starts recording.
  const beginRecording = useCallback(() => {
    setPhase('requesting');
    ensureMicPermission().then(granted => {
      if (!granted) {
        setPhase('permission-denied');
        return;
      }
      startRecording();
    });
  }, [startRecording]);

  useEffect(() => {
    if (!visible) return;
    setPhase('choose');
    setRecorded(null);
    setPreviewUri(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setErrorMessage('');

    return () => {
      if (listeningRef.current) {
        detachListener();
        Sound.stopRecorder().catch(() => {});
      }
    };
  }, [visible, detachListener]);

  // Alternative to live recording — lets the user attach an existing audio
  // file instead. Reuses the exact same `recorded` state + confirm flow as a
  // live take, just without a known duration (no cheap way to read that
  // without a native audio decoder).
  const pickAudioFile = useCallback(async () => {
    if (!DocumentPicker) {
      Alert.alert('Not available', 'Choosing an audio file needs an app update — please record instead for now.');
      return;
    }
    setImporting(true);
    try {
      const [file] = await DocumentPicker.pick({ type: [DocumentPicker.types.audio] });
      if (!file?.uri) return;
      const base64 = await RNFS.readFile(file.uri, 'base64');
      const mime = file.type || 'audio/mpeg';
      setRecorded({ base64, mime, durationSec: undefined });
      setPreviewUri(`data:${mime};base64,${base64}`);
      setPhase('recorded');
    } catch (err) {
      if (DocumentPicker?.isErrorWithCode(err) && err.code === DocumentPicker.errorCodes.OPERATION_CANCELED) return;
      Alert.alert("Can't use this file", 'Please try a different audio file.');
    } finally {
      setImporting(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (phase === 'recording' && listeningRef.current) {
      detachListener();
      Sound.stopRecorder().catch(() => {});
    }
    onClose();
  }, [phase, detachListener, onClose]);

  const handleConfirm = useCallback(() => {
    if (recorded) onConfirm(recorded);
  }, [recorded, onConfirm]);

  const handleRetry = useCallback(() => {
    setRecorded(null);
    setPreviewUri(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setErrorMessage('');
    beginRecording();
  }, [beginRecording]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={s.modalBackdrop} onPress={handleClose} />
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Voice note</Text>
          <Text style={s.sheetSub}>Record a spoken tip — up to {MEDIA_RULES.voice.maxSec} seconds, or choose an existing file.</Text>

          {phase === 'choose' && (
            <View style={s.sourceGrid}>
              <TouchableOpacity style={s.sourceBtn} activeOpacity={0.8} onPress={beginRecording} disabled={busy}>
                <View style={s.sourceIcon}>
                  <Ionicons name="mic" size={22} color="#1A6B3A" />
                </View>
                <Text style={s.sourceLabel}>Record Audio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.sourceBtn} activeOpacity={0.8} onPress={pickAudioFile} disabled={importing || busy}>
                <View style={s.sourceIcon}>
                  {importing ? (
                    <ActivityIndicator color="#1A6B3A" size="small" />
                  ) : (
                    <Ionicons name="folder-open-outline" size={22} color="#1A6B3A" />
                  )}
                </View>
                <Text style={s.sourceLabel}>Choose Audio File</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'permission-denied' && (
            <View style={s.voiceStateBox}>
              <Ionicons name="mic-off" size={32} color="#C02828" />
              <Text style={s.voiceStateText}>Microphone permission was denied. Enable it in Settings to record a voice note.</Text>
            </View>
          )}

          {phase === 'error' && (
            <View style={s.voiceStateBox}>
              <Ionicons name="warning" size={32} color="#C02828" />
              <Text style={s.voiceStateText}>{errorMessage}</Text>
              <TouchableOpacity style={s.voiceRetryBtn} onPress={handleRetry}>
                <Text style={s.voiceRetryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'requesting' && (
            <View style={s.voiceStateBox}>
              <ActivityIndicator color="#1A6B3A" />
              <Text style={s.voiceStateText}>Getting the mic ready…</Text>
            </View>
          )}

          {(phase === 'permission-denied' || phase === 'error') && (
            <>
              <View style={s.voiceOrDivider}>
                <View style={s.voiceOrLine} />
                <Text style={s.voiceOrText}>OR</Text>
                <View style={s.voiceOrLine} />
              </View>
              <TouchableOpacity
                style={s.voiceUploadBtn}
                activeOpacity={0.8}
                onPress={pickAudioFile}
                disabled={importing || busy}
              >
                {importing ? (
                  <ActivityIndicator color="#1A6B3A" size="small" />
                ) : (
                  <>
                    <Ionicons name="folder-open-outline" size={16} color="#1A6B3A" />
                    <Text style={s.voiceUploadBtnText}>Choose an audio file</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {phase === 'recording' && (
            <View style={s.voiceStateBox}>
              <View style={s.voiceMicPulse}>
                <Ionicons name="mic" size={30} color="#fff" />
              </View>
              <Text style={s.voiceTimer}>{formatTime(elapsed)}</Text>
              <TouchableOpacity style={s.voiceStopBtn} activeOpacity={0.85} onPress={stopRecording}>
                <Ionicons name="stop" size={18} color="#fff" />
                <Text style={s.voiceStopText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'recorded' && previewUri && (
            <View style={s.voiceStateBox}>
              <Ionicons name="checkmark-circle" size={28} color="#1A6B3A" />
              {recorded?.durationSec != null && <Text style={s.voiceTimer}>{formatTime(recorded.durationSec)}</Text>}
              <InlineMediaPlayer uri={previewUri} kind="audio" autoPlay={false} style={s.voicePreviewPlayer} />
            </View>
          )}

          <View style={s.previewActions}>
            <TouchableOpacity style={[s.previewBtn, s.previewDiscard]} onPress={handleClose} disabled={busy}>
              <Text style={s.previewDiscardText}>Cancel</Text>
            </TouchableOpacity>
            {phase === 'recorded' && (
              <TouchableOpacity style={[s.previewBtn, s.previewConfirm]} onPress={handleConfirm} disabled={busy}>
                <Text style={s.previewConfirmText}>{busy ? 'Uploading…' : 'Use this'}</Text>
              </TouchableOpacity>
            )}
          </View>
      </View>
    </Modal>
  );
});
