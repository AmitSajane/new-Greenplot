import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';

interface Props {
  onPress: () => void;
  onPressMyPosts: () => void;
}

/** Two separate cards side by side — one to open the post composer (replaces
 * the old composer card and the floating add button, which both opened the
 * same screen), one to open the list of the current user's own posts. */
export const CreatePostRow = React.memo(({ onPress, onPressMyPosts }: Props) => (
  <View style={s.createPostRow}>
    <TouchableOpacity style={s.createPostCard} activeOpacity={0.8} onPress={onPress} accessibilityLabel="Create post">
      <View style={s.createPostBtn}>
        <Ionicons name="add" size={18} color="#fff" />
      </View>
      <Text style={s.createPostText}>Create post</Text>
    </TouchableOpacity>
    <TouchableOpacity style={s.myPostsCard} activeOpacity={0.8} onPress={onPressMyPosts}>
      <View style={s.myPostsIconWrap}>
        <Ionicons name="grid-outline" size={17} color="#1A6B3A" />
      </View>
      <Text style={s.myPostsBtnText}>Posts</Text>
    </TouchableOpacity>
  </View>
));
