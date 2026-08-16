import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../theme/tokens';
import { ScreenHeader } from '../components/molecules/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { AppNotification, notificationsApi } from '../services/notificationsApi';

function relativeTime(createdAt: string): string {
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationsCenterScreen() {
  const navigation = useNavigation<any>();
  const { user, authReady } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!authReady) return;
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setNotifications(await notificationsApi.fetchForUser(user.id));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [authReady, user?.id]);

  useEffect(() => {
    if (!authReady) return;
    loadNotifications();
    return user?.id ? notificationsApi.subscribe(user.id, loadNotifications) : undefined;
  }, [authReady, loadNotifications, user?.id]);

  const getIcon = (type: string) => {
    if (type === 'lease') return 'document-text-outline';
    if (type === 'job') return 'people-outline';
    if (type === 'disease') return 'warning-outline';
    if (type === 'payment') return 'wallet-outline';
    return 'notifications-outline';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} titleWeight="700" />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyBody}>New updates will appear here.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, !item.read && styles.cardUnread]} activeOpacity={0.8}>
            <View style={styles.iconWrap}>
              <Ionicons name={getIcon(item.type) as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBodyText}>{item.body}</Text>
              <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: spacing.md, fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptyBody: { marginTop: spacing.xs, fontSize: 14, color: colors.textSecondary },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  iconWrap: { marginRight: spacing.md },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardBodyText: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  time: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
});
