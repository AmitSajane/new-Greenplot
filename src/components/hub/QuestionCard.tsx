import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { CommunityQuestion } from '../../constants/hubMockData';

type Props = {
  item: CommunityQuestion;
  onPress?: () => void;
  containerStyle?: ViewStyle;
};

function QuestionCardComponent({ item, onPress, containerStyle }: Props) {
  const initials = item.authorName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, containerStyle]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.author}>{item.authorName}</Text>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        </View>
      </View>

      <Text style={styles.question} numberOfLines={3}>
        {item.question}
      </Text>

      {item.answerPreview ? (
        <View style={styles.answerPill}>
          <Text style={styles.answerPillText}>Answered</Text>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {item.likesCount} likes · {item.repliesCount} replies
        </Text>
        <Text style={styles.replyCta}>Reply</Text>
      </View>
    </TouchableOpacity>
  );
}

export const QuestionCard = React.memo(QuestionCardComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  question: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  answerPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
  },
  answerPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  replyCta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});


