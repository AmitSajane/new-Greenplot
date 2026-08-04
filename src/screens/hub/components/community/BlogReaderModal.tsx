import React, { useMemo } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { FeedPost } from '../../constants/communityData';
import { Avatar } from './Avatar';

interface Props {
  post: FeedPost | null;
  onClose: () => void;
}

/** Full, untruncated view of a blog post — exactly what the author wrote
 * (title, cover image, body split into paragraphs), no fabricated extras. */
export const BlogReaderModal = React.memo(({ post, onClose }: Props) => {
  const paragraphs = useMemo(() => (post ? post.text.split('\n\n').filter(Boolean) : []), [post]);
  const coverUri = post?.media.uris[0];

  return (
    <Modal visible={!!post} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.safeAreaModal} edges={['top']}>
        <View style={s.readerHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color="#1C2E18" />
          </TouchableOpacity>
        </View>

        {post && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {!!coverUri && <Image source={{ uri: coverUri }} style={s.readerCover} resizeMode="cover" />}

            {!!post.title && <Text style={s.readerTitle}>{post.title}</Text>}

            <View style={s.readerMetaRow}>
              <Avatar initials={post.authorInitials} tone={post.avatarTone} />
              <View>
                <Text style={s.readerMetaName}>{post.authorName}</Text>
                <Text style={s.readerMetaSub}>
                  {post.location} · {post.time}
                </Text>
              </View>
            </View>

            {paragraphs.map((p, i) => (
              <Text key={i} style={s.readerParagraph}>
                {p}
              </Text>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
});
