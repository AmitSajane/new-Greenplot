import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ActionButtonsRowProps {
  onJoinMembershipPress?: () => void;
  onPostAdvertisementPress?: () => void;
  onNotificationsPress?: () => void;
}

export function ActionButtonsRow({
  onJoinMembershipPress,
  onPostAdvertisementPress,
  onNotificationsPress,
}: ActionButtonsRowProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onJoinMembershipPress}
        activeOpacity={0.8}
        style={styles.button}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="card" size={20} color={colors.primary} />
        </View>
        <Text style={styles.buttonText}>Join Membership</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onPostAdvertisementPress}
        activeOpacity={0.8}
        style={styles.button}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="megaphone" size={20} color={colors.primary} />
        </View>
        <Text style={styles.buttonText}>Post Advertisement</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNotificationsPress}
        activeOpacity={0.8}
        style={styles.button}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
        </View>
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softGreen,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  iconContainer: {
    // width: 24,
    // height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
    // justifyContent
    // textAlign: 'center',
    // flexShrink: 1,
  },
});

