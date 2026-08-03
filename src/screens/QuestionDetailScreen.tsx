import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/tokens';
import { HubStackParamList } from '../navigation/HubStack';
import { communityQuestions } from '../constants/hubMockData';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

type Props = NativeStackScreenProps<HubStackParamList, 'QuestionDetail'>;

export default function QuestionDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const question = useMemo(
    () => communityQuestions.find((item) => item.id === id),
    [id],
  );

  if (!question) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Question not found</Text>
          <Text style={styles.emptySubtitle}>
            This question seems to have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = question.authorName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader backVariant="text" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.author}>{question.authorName}</Text>
              <Text style={styles.timeAgo}>{question.timeAgo}</Text>
            </View>
          </View>

          <Text style={styles.question}>{question.question}</Text>

          {question.answerPreview && (
            <View style={styles.answerCard}>
              <Text style={styles.answerLabel}>Top response</Text>
              <Text style={styles.answerText}>{question.answerPreview}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {question.likesCount} likes · {question.repliesCount} replies
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  author: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  question: {
    marginTop: spacing.lg,
    fontSize: 15,
    color: colors.textPrimary,
  },
  answerCard: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.softGreen,
    padding: spacing.md,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  answerText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  metaRow: {
    marginTop: spacing.lg,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


