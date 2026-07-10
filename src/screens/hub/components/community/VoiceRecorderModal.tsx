import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { MEDIA_RULES } from '../../constants/communityData';
import { InlineMediaPlayer } from './InlineMediaPlayer';

interface RecordedVoice {
  base64: string;
  mime: string;
  durationSec: number;
}

interface Props {
  visible: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: (voice: RecordedVoice) => void;
}

type Phase = 'permission-denied' | 'requesting' | 'recording' | 'recorded' | 'error';

const RECORDER_HTML = `<!DOCTYPE html><html><head></head><body style="margin:0;background:transparent;">
<script>
(function () {
  function post(msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  if (!navigator.mediaDevices || !window.MediaRecorder) { post({ type: 'error', message: 'Recording is not supported on this device.' }); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    var candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg'];
    var mimeType = '';
    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) { mimeType = candidates[i]; break; }
    }
    var recorder = mimeType ? new MediaRecorder(stream, { mimeType: mimeType }) : new MediaRecorder(stream);
    var chunks = [];
    recorder.ondataavailable = function (e) { if (e.data && e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = function () {
      var blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' });
      var reader = new FileReader();
      reader.onloadend = function () {
        var base64 = String(reader.result || '').split(',')[1] || '';
        post({ type: 'recorded', base64: base64, mime: blob.type });
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(function (t) { t.stop(); });
    };
    window.__stopRecording = function () { if (recorder.state !== 'inactive') recorder.stop(); };
    recorder.start();
    post({ type: 'started' });
  }).catch(function (err) {
    post({ type: 'error', message: String((err && err.message) || err) });
  });
})();
</script>
</body></html>`;

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

/** Records a short voice note entirely in-app — no native audio-recording
 * library is linked, so a hidden WebView runs the browser's MediaRecorder
 * API (getUserMedia → MediaRecorder → base64) and posts the result back. */
export const VoiceRecorderModal = React.memo(({ visible, busy, onClose, onConfirm }: Props) => {
  const [phase, setPhase] = useState<Phase>('requesting');
  const [elapsed, setElapsed] = useState(0);
  const [recorded, setRecorded] = useState<RecordedVoice | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    stopTimer();
    webviewRef.current?.injectJavaScript('window.__stopRecording && window.__stopRecording(); true;');
  }, [stopTimer]);

  useEffect(() => {
    if (!visible) return;
    setPhase('requesting');
    setRecorded(null);
    setPreviewUri(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setErrorMessage('');

    let cancelled = false;
    ensureMicPermission().then(granted => {
      if (cancelled) return;
      if (!granted) setPhase('permission-denied');
      // Otherwise the WebView mounts and requests getUserMedia itself.
    });

    return () => {
      cancelled = true;
      stopTimer();
    };
  }, [visible, stopTimer]);

  const onWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'started') {
          setPhase('recording');
          timerRef.current = setInterval(() => {
            elapsedRef.current += 1;
            setElapsed(elapsedRef.current);
            if (elapsedRef.current >= MEDIA_RULES.voice.maxSec) stopRecording();
          }, 1000);
        } else if (msg.type === 'recorded') {
          stopTimer();
          const durationSec = elapsedRef.current;
          setRecorded({ base64: msg.base64, mime: msg.mime, durationSec });
          setPreviewUri(`data:${msg.mime};base64,${msg.base64}`);
          setPhase('recorded');
        } else if (msg.type === 'error') {
          stopTimer();
          setErrorMessage(msg.message || 'Could not access the microphone.');
          setPhase('error');
        }
      } catch {
        /* ignore malformed message */
      }
    },
    [stopRecording, stopTimer],
  );

  const handleClose = useCallback(() => {
    stopTimer();
    onClose();
  }, [onClose, stopTimer]);

  const handleConfirm = useCallback(() => {
    if (recorded) onConfirm(recorded);
  }, [recorded, onConfirm]);

  const handleRetry = useCallback(() => {
    setPhase('requesting');
    setRecorded(null);
    setPreviewUri(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setErrorMessage('');
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.modalBackdrop}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Voice note</Text>
          <Text style={s.sheetSub}>Record a spoken tip — up to {MEDIA_RULES.voice.maxSec} seconds.</Text>

          {(phase === 'requesting' || phase === 'recording') && (
            <WebView
              ref={webviewRef}
              // baseUrl matters here: an inline `html` source with no baseUrl
              // loads as an opaque/null origin, which Chrome/WebView does NOT
              // treat as a secure context — so navigator.mediaDevices is
              // undefined and getUserMedia can never work. "https://localhost"
              // is in the browser's secure-context allowlist, which unlocks it.
              source={{ html: RECORDER_HTML, baseUrl: 'https://localhost' }}
              style={s.voiceHiddenWebview}
              onMessage={onWebViewMessage}
              mediaCapturePermissionGrantType="grant"
              javaScriptEnabled
              originWhitelist={['*']}
            />
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
              <Text style={s.voiceTimer}>{formatTime(recorded?.durationSec ?? 0)}</Text>
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
      </View>
    </Modal>
  );
});
