/**
 * Swipeable media carousel for farm photos/videos. Shows paging dots when there
 * is more than one item. Images render inline; video URLs (.mp4/.mov) show a
 * tappable play frame that opens the clip.
 */
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const isVideo = (url: string) => /\.(mp4|mov|m4v|webm)(\?|$)/i.test(url);

interface Props {
  urls: string[];
  height?: number;
}

export default function MediaCarousel({ urls, height = 240 }: Props) {
  const width = Dimensions.get('window').width;
  const [index, setIndex] = useState(0);
  const items = urls.filter(Boolean);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / width);
      if (i !== index) setIndex(i);
    },
    [index, width],
  );

  if (items.length === 0) return null;

  if (items.length === 1) {
    const u = items[0];
    return isVideo(u) ? (
      <VideoFrame url={u} width={width} height={height} />
    ) : (
      <Image source={{ uri: u }} style={{ width, height }} resizeMode="cover" />
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {items.map((u, i) =>
          isVideo(u) ? (
            <VideoFrame key={i} url={u} width={width} height={height} />
          ) : (
            <Image key={i} source={{ uri: u }} style={{ width, height }} resizeMode="cover" />
          ),
        )}
      </ScrollView>

      {/* counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{index + 1}/{items.length}</Text>
      </View>

      {/* dots */}
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function VideoFrame({ url, width, height }: { url: string; width: number; height: number }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={[styles.videoFrame, { width, height }]}
    >
      <View style={styles.playBtn}>
        <Ionicons name="play" size={26} color="#fff" />
      </View>
      <Text style={styles.videoLabel}>Tap to play video</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  videoFrame: { backgroundColor: '#0D1509', alignItems: 'center', justifyContent: 'center', gap: 10 },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(26,107,58,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
});
