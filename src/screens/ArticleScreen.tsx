/**
 * In-app reader. Renders one of two things from a single route:
 *  - a YouTube video → embedded YoutubePlayer (react-native-youtube-iframe),
 *    which handles the IFrame API origin handshake reliably on iOS/Android.
 *  - any other URL → a WebView (news/scheme article).
 * Both have a branded header and a graceful fallback to the external app.
 */
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';

type ArticleRoute = RouteProp<FarmerHomeStackParamList, 'Article'>;

/** Extract a YouTube video id from an embed/watch/youtu.be URL, else null. */
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function ArticleScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<ArticleRoute>();
  const { url, title } = params;

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const videoId = extractYouTubeId(url);
  const playerHeight = Math.round((Dimensions.get('window').width * 9) / 16);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onOpenExternal = useCallback(() => {
    Linking.openURL(videoId ? `https://www.youtube.com/watch?v=${videoId}` : url).catch(() => {});
  }, [url, videoId]);

  // YoutubePlayer reports embedding/playback problems here (e.g. a video whose
  // owner disabled embedding) → fall back to opening it in the YouTube app.
  const onVideoError = useCallback(() => {
    setLoading(false);
    setFailed(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Branded header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F4A28" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || (videoId ? 'Video' : 'Article')}
        </Text>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenExternal} activeOpacity={0.7}>
          <Ionicons name="open-outline" size={20} color="#0F4A28" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {failed ? (
          <View style={styles.center}>
            <Ionicons name="logo-youtube" size={48} color="#9EB8A8" />
            <Text style={styles.errText}>
              {videoId ? "This video can't play inside the app." : "Couldn't load this article."}
            </Text>
            <TouchableOpacity style={styles.errBtn} onPress={onOpenExternal} activeOpacity={0.85}>
              <Text style={styles.errBtnText}>{videoId ? 'Watch on YouTube' : 'Open in browser'}</Text>
            </TouchableOpacity>
          </View>
        ) : videoId ? (
          // ── Video ──
          <ScrollView contentContainerStyle={styles.videoWrap}>
            <YoutubePlayer
              height={playerHeight}
              play={false}
              videoId={videoId}
              onError={onVideoError}
              onReady={() => setLoading(false)}
              webViewProps={{ allowsInlineMediaPlayback: true }}
            />
            {!!title && <Text style={styles.videoTitle}>{title}</Text>}
            <TouchableOpacity style={styles.ytLink} onPress={onOpenExternal} activeOpacity={0.7}>
              <Ionicons name="logo-youtube" size={18} color="#C02828" />
              <Text style={styles.ytLinkText}>Open in YouTube</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          // ── Article or Dailymotion video (both play in a plain WebView) ──
          <>
            <WebView
              source={{ uri: url }}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setFailed(true);
              }}
              startInLoadingState
              allowsBackForwardNavigationGestures
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo
              style={styles.webview}
            />
            {loading && (
              <View style={styles.center} pointerEvents="none">
                <ActivityIndicator size="large" color="#1A6B3A" />
                <Text style={styles.loadingText}>Loading…</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EFE9',
    backgroundColor: '#fff',
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0D1509', marginHorizontal: 4 },
  body: { flex: 1 },
  webview: { flex: 1 },

  videoWrap: { paddingTop: 8, paddingBottom: 24, backgroundColor: '#fff' },
  videoTitle: { fontSize: 17, fontWeight: '800', color: '#0D1509', paddingHorizontal: 16, paddingTop: 16, lineHeight: 23 },
  ytLink: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingTop: 14 },
  ytLinkText: { fontSize: 15, fontWeight: '700', color: '#1A6B3A' },

  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#6B8074', fontWeight: '600' },
  errText: { fontSize: 16, color: '#3A5040', fontWeight: '700', textAlign: 'center', paddingHorizontal: 24 },
  errBtn: { backgroundColor: '#1A6B3A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  errBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
