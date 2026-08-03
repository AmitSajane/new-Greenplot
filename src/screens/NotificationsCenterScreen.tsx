import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../theme/tokens';
import { ScreenHeader } from '../components/molecules/ScreenHeader';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'lease', title: 'Lease request', body: 'Ramesh Kumar requested to lease your 5-acre plot.', time: '2h ago', read: false },
  { id: '2', type: 'job', title: 'Job application', body: '3 workers applied for Harvesting job.', time: '5h ago', read: false },
  { id: '3', type: 'disease', title: 'Disease alert', body: 'Early blight risk in tomato field – Bangalore North.', time: '1d ago', read: true },
  { id: '4', type: 'payment', title: 'Payment received', body: '₹4,950 received for labor payment.', time: '2d ago', read: true },
];

export default function NotificationsCenterScreen() {
  const navigation = useNavigation<any>();

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
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, !item.read && styles.cardUnread]} activeOpacity={0.8}>
            <View style={styles.iconWrap}>
              <Ionicons name={getIcon(item.type) as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBodyText}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
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
