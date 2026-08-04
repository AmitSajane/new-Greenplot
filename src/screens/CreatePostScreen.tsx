import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/tokens';
import { CreatePostForm } from '../components/hub/CreatePostForm';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

export default function CreatePostScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Create Post" onBack={() => navigation.goBack()} />
      <CreatePostForm onSubmitSuccess={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});


