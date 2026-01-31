import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/tokens';
import { HubStackParamList } from '../navigation/HubStack';
import { latestNews } from '../constants/hubMockData';

type Props = NativeStackScreenProps<HubStackParamList, 'NewsDetail'>;

export default function NewsDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const article = useMemo(
    () => latestNews.find((item) => item.id === id),
    [id],
  );

  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Article not found</Text>
          <Text style={styles.emptySubtitle}>
            The news item you are looking for is not available anymore.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const paragraphs = article.content.split('\n\n');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: article.imageUrl }} style={styles.image} />

        <View style={styles.metaRow}>
          <Text style={styles.category}>{article.category}</Text>
          <Text style={styles.timeAgo}>{article.timeAgo}</Text>
        </View>

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.summary}>{article.summary}</Text>

        {paragraphs.map((p) => (
          <Text key={p.slice(0, 12)} style={styles.paragraph}>
            {p}
          </Text>
        ))}
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
    paddingBottom: spacing.xxl,
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
  image: {
    width: '100%',
    height: 220,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summary: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  paragraph: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
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





