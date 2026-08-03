import React from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from '../atoms/Text';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { colors, spacing } from '../../theme/tokens';

interface InfoRow {
  icon?: string;
  label: string;
}

interface CardAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface StatusActionCardProps {
  title: string;
  status: string;
  infoRows?: InfoRow[];
  actions?: CardAction[];
}

/** Card → title + status badge → info rows → action buttons. The shape shared by lease/agreement/property list cards. */
export function StatusActionCard({ title, status, infoRows = [], actions = [] }: StatusActionCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text variant="subtitle" weight="bold" style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Badge label={status} status={status} />
      </View>

      {infoRows.map((row, i) => (
        <View key={i} style={styles.infoRow}>
          {row.icon && <Ionicons name={row.icon} size={14} color={colors.textMuted} />}
          <Text variant="caption" color={colors.textSecondary}>
            {row.label}
          </Text>
        </View>
      ))}

      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <Button
              key={i}
              label={action.label}
              onPress={action.onPress}
              variant={action.variant === 'secondary' ? 'secondary' : 'primary'}
              size="sm"
              style={styles.actionButton}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    marginRight: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
