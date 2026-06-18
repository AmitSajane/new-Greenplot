/**
 * "Learn · Videos" home section — agriculture News / Technology / Training
 * videos from curated YouTube channels (RSS). Self-contained: owns the selected
 * category + its own data load; the parent only supplies an open-video handler.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import { SectionHeader } from './SectionHeader';
import { useAgriVideos } from '../../hooks/useAgriVideos';
import { VideoCategory, VideoItem } from '../../../../services/videosApi';

const CATEGORIES: { key: VideoCategory; label: string; icon: string }[] = [
  { key: 'news', label: 'News', icon: 'newspaper' },
  { key: 'technology', label: 'Technology', icon: 'hardware-chip' },
  { key: 'training', label: 'Training', icon: 'school' },
];

interface CardProps {
  item: VideoItem;
  onPress: (item: VideoItem) => void;
}

const VideoCard = React.memo(({ item, onPress }: CardProps) => {
  const handle = useCallback(() => onPress(item), [onPress, item]);
  return (
    <TouchableOpacity style={st.card} activeOpacity={0.85} onPress={handle}>
      <View>
        <Image source={{ uri: item.thumbnail }} style={st.thumb} resizeMode="cover" />
        <View style={st.playOverlay}>
          <Ionicons name="play" size={20} color="#fff" />
        </View>
      </View>
      <Text style={st.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={st.channel} numberOfLines={1}>
        {item.channel}
      </Text>
    </TouchableOpacity>
  );
});

interface Props {
  onOpenVideo: (embedUrl: string, title: string) => void;
}

function VideosSectionBase({ onOpenVideo }: Props) {
  const [category, setCategory] = useState<VideoCategory>('news');
  const { videos, loading } = useAgriVideos(category);

  const openVideo = useCallback(
    (item: VideoItem) => onOpenVideo(item.embedUrl, item.title),
    [onOpenVideo],
  );

  return (
    <View style={s.section}>
      <SectionHeader icon="play-circle" title="Learn · Videos" />

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.chips}
      >
        {CATEGORIES.map(c => {
          const active = c.key === category;
          return (
            <TouchableOpacity
              key={c.key}
              style={[st.chip, active && st.chipActive]}
              activeOpacity={0.8}
              onPress={() => setCategory(c.key)}
            >
              <Ionicons name={c.icon} size={14} color={active ? '#fff' : '#1A6B3A'} />
              <Text style={[st.chipText, active && st.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Video rail */}
      {loading && videos.length === 0 ? (
        <View style={st.loading}>
          <ActivityIndicator color="#1A6B3A" />
        </View>
      ) : videos.length === 0 ? (
        <Text style={st.empty}>No videos available right now.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.rail}
        >
          {videos.map(v => (
            <VideoCard key={v.id} item={v} onPress={openVideo} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export const VideosSection = React.memo(VideosSectionBase);

const st = StyleSheet.create({
  chips: { gap: 8, paddingBottom: 12, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E4F4EC',
    borderWidth: 1,
    borderColor: '#CDE9D8',
  },
  chipActive: { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#1A6B3A' },
  chipTextActive: { color: '#fff' },

  rail: { gap: 12, paddingRight: 16 },
  card: { width: 220 },
  thumb: { width: 220, height: 124, borderRadius: 14, backgroundColor: '#DDE7E1' },
  playOverlay: {
    position: 'absolute',
    top: 47,
    left: 95,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15,74,40,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', color: '#0D1509', marginTop: 8, lineHeight: 18 },
  channel: { fontSize: 12, color: '#6B8074', marginTop: 3 },

  loading: { height: 150, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 13, color: '#6B8074', paddingVertical: 20, textAlign: 'center' },
});
