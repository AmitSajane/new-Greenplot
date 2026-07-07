import React, { useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { useAuth } from '../../../../context/AuthContext';
import { StoryItem } from '../../constants/communityData';

interface Props {
  stories: StoryItem[];
  onPress: () => void;
  onAdd: () => void;
}

/** "Your Story" ring — tap the ring to view (or add, if empty); tap the
 * corner badge to always add another. Only the current user's own stories
 * exist pre-backend, so there's just the one tray item for now. */
export const StoriesTray = React.memo(({ stories, onPress, onAdd }: Props) => {
  const { user } = useAuth();
  const hasStories = stories.length > 0;
  const initials = useMemo(() => (user?.name || 'You').trim().slice(0, 2).toUpperCase(), [user?.name]);
  const thumbUri = useMemo(() => {
    const latest = stories[stories.length - 1];
    return latest?.mediaType === 'image' ? latest.uri : undefined;
  }, [stories]);

  return (
    <View style={s.storyTray}>
      <View style={s.storyItem}>
        <View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[s.storyRingWrap, !hasStories && s.storyRingEmpty]}
          >
            <View style={s.storyAvatarInner}>
              {thumbUri ? (
                <Image source={{ uri: thumbUri }} style={s.storyAvatarImg} />
              ) : (
                <Text style={[s.avText, { color: '#1A6B3A' }]}>{initials}</Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={s.storyAddBadge} activeOpacity={0.8} onPress={onAdd} hitSlop={8}>
            <Ionicons name="add" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={s.storyLabel} numberOfLines={1}>
          {hasStories ? 'Your Story' : 'Add Story'}
        </Text>
      </View>
    </View>
  );
});
