import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/tokens';
import { communityQuestions } from '../constants/hubMockData';
import { QuestionCard } from '../components/hub/QuestionCard';
import { HubStackParamList } from '../navigation/HubStack';

type NavigationProp = NativeStackNavigationProp<HubStackParamList>;

export default function CommunityQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleCreatePost = useCallback(
    () => navigation.navigate('CreatePost', { from: 'community' }),
    [navigation],
  );
  const handleQuestionPress = useCallback(
    (id: string) => navigation.navigate('QuestionDetail', { id }),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={communityQuestions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>← Back</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <QuestionCard
              item={item}
              onPress={() => handleQuestionPress(item.id)}
            />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.createPostButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.createPostText}>Create Post ▸</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cardWrapper: {
    marginBottom: spacing.lg,
  },
  footer: {
    marginTop: spacing.lg,
  },
  createPostButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  createPostText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});


