/**
 * In-app article reader. Opens a news/scheme URL inside a WebView with a
 * branded header (back + open-in-browser) and loading/error states, so users
 * never leave the app to read the full story.
 */
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';

type ArticleRoute = RouteProp<FarmerHomeStackParamList, 'Article'>;

/** Extract a YouTube video id from an embed/watch/youtu.be URL, else null. */
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * Full-bleed YouTube player using the IFrame Player API so we can catch
 * onError (e.g. 101/150 = embedding disabled by owner) and post it back to RN
 * to trigger an "open in YouTube" fallback. Loaded with a youtube.com baseUrl
 * to give the player a valid origin (avoids Error 153).
 */
function youTubeHtml(videoId: string): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>*{margin:0;padding:0}html,body{height:100%;background:#000}#player{width:100%;height:100%}</style></head>
<body><div id="player"></div>
<script>
  var tag=document.createElement('script');
  tag.src="https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
  function post(m){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(m); }
  function onYouTubeIframeAPIReady(){
    new YT.Player('player',{
      videoId:'${videoId}',
      playerVars:{playsinline:1,rel:0,modestbranding:1},
      events:{ onError:function(e){ post('error:'+e.data); } }
    });
  }
</script></body></html>`;
}

export default function ArticleScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<ArticleRoute>();
  const { url, title } = params;

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // YouTube embeds must run inside a page with a real youtube.com origin, or the
  // player rejects them (Error 153). Wrap the embed in an HTML iframe + baseUrl
  // so it has a valid origin; load articles directly by URL.
  const videoId = extractYouTubeId(url);
  const source = videoId
    ? { html: youTubeHtml(videoId), baseUrl: 'https://www.youtube.com' }
    : { uri: url };

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onOpenExternal = useCallback(() => {
    Linking.openURL(videoId ? `https://www.youtube.com/watch?v=${videoId}` : url).catch(() => {});
  }, [url, videoId]);

  // The YouTube player posts 'error:<code>' when a video can't be embedded
  // (e.g. 101/150 = owner disabled embedding) → show the fallback.
  const onMessage = useCallback((e: { nativeEvent: { data: string } }) => {
    if (e.nativeEvent.data?.startsWith('error:')) {
      setLoading(false);
      setFailed(true);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Branded header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F4A28" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || 'Article'}
        </Text>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenExternal} activeOpacity={0.7}>
          <Ionicons name="open-outline" size={20} color="#0F4A28" />
        </TouchableOpacity>
      </View>

      {/* Content */}
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
        ) : (
          <>
            <WebView
              source={source}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setFailed(true);
              }}
              onMessage={onMessage}
              javaScriptEnabled
              domStorageEnabled
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
                <Text style={styles.loadingText}>Loading article…</Text>
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0D1509', marginHorizontal: 4 },
  body: { flex: 1 },
  webview: { flex: 1 },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#6B8074', fontWeight: '600' },
  errText: { fontSize: 16, color: '#3A5040', fontWeight: '700' },
  errBtn: {
    backgroundColor: '#1A6B3A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  errBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
