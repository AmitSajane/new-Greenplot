import React from 'react';
import { MyPostsContent } from './components/MyPostsContent';
import { useMyPosts } from './hooks/useMyPosts';

export default function MyPostsScreen() {
  const vm = useMyPosts();
  return <MyPostsContent {...vm} />;
}
