import React, { useState } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Video from 'react-native-video';

interface Props {
  uri: string;
  kind: 'video' | 'audio';
  /** Hide the native scrubber/controls (used for full-screen story playback,
   * which has its own tap-to-navigate zones instead). */
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Native video/audio playback via react-native-video (ExoPlayer on Android,
 * AVPlayer on iOS) — used for feed post video, voice-note audio, and the
 * story viewer. Audio sources just play with no visible picture; the calling
 * screen supplies its own waveform/play-button UI around this component. */
export const InlineMediaPlayer = React.memo(
  ({ uri, kind, showControls = true, autoPlay = true, loop = false, style }: Props) => {
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);

    if (errored) {
      return (
        <View style={[styles.fallback, style]}>
          <Text style={styles.fallbackText}>Couldn't load this {kind}.</Text>
        </View>
      );
    }

    return (
      <View style={[kind === 'audio' ? styles.audioWrap : styles.videoWrap, style]}>
        <Video
          source={{ uri }}
          style={styles.media}
          controls={showControls}
          paused={!autoPlay}
          repeat={loop}
          resizeMode="contain"
          playInBackground={false}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setErrored(true);
          }}
        />
        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  videoWrap: { flex: 1, backgroundColor: '#000' },
  audioWrap: { height: 54, backgroundColor: 'transparent' },
  media: { ...StyleSheet.absoluteFillObject },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1509' },
  fallbackText: { color: '#fff', fontSize: 12 },
});
