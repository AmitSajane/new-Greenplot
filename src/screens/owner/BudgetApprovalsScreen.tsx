import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

type PendingRequest = {
  id: string;
  title: string;
  cost: string;
  requester: string;
  date: string;
  reason: string;
};

const INITIAL_REQUESTS: PendingRequest[] = [
  {
    id: '1',
    title: 'Organic Fertilizer',
    cost: '₹12,500',
    requester: 'Rajesh Kumar',
    date: '2 Feb 2026',
    reason:
      'For tomato crop - soil nutrient levels are low. AI recommends organic fertilizer application.',
  },
  {
    id: '2',
    title: 'Drip Irrigation Parts',
    cost: '₹8,200',
    requester: 'Rajesh Kumar',
    date: '1 Feb 2026',
    reason:
      'Replace damaged drip lines in wheat field section B. Required for optimal water distribution.',
  },
  {
    id: '3',
    title: 'Seeds & Soil Treatment',
    cost: '₹5,800',
    requester: 'Rajesh Kumar',
    date: '31 Jan 2026',
    reason: 'New sowing season - certified seeds and pre-sowing soil treatment as per recommendation.',
  },
];

const NOTIFICATION_COUNT = 5;

export default function BudgetApprovalsScreen() {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<PendingRequest[]>(INITIAL_REQUESTS);

  const handleBack = () => navigation.goBack();
  const handleNotifications = () => {};

  const handleReject = (req: PendingRequest) => {
    Alert.alert('Reject Request', `Reject "${req.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => setRequests((prev) => prev.filter((r) => r.id !== req.id)),
      },
    ]);
  };

  const handleApprove = (req: PendingRequest) => {
    Alert.alert('Approve Request', `Approve "${req.title}" for ${req.cost}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => setRequests((prev) => prev.filter((r) => r.id !== req.id)),
      },
    ]);
  };

  const handleMessageFarmer = (req: PendingRequest) => {
    // TODO: open chat/message flow
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget & Approvals</Text>
        <TouchableOpacity onPress={handleNotifications} style={styles.headerBtn} hitSlop={12}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {NOTIFICATION_COUNT > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{NOTIFICATION_COUNT}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Pending Requests ({requests.length})</Text>

        {requests.map((req) => (
          <View key={req.id} style={[styles.card, shadow.card]}>
            <Text style={styles.cardTitle}>{req.title}</Text>
            <Text style={styles.cost}>{req.cost}</Text>
            <View style={styles.requesterRow}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.requesterText}>{req.requester}</Text>
              <Text style={styles.dateText}>{req.date}</Text>
            </View>
            <Text style={styles.reasonLabel}>Reason</Text>
            <Text style={styles.reasonText}>{req.reason}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleReject(req)}
              >
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleApprove(req)}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => handleMessageFarmer(req)}
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.messageBtnText}>Message Farmer</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requesterText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  rejectBtn: {
    backgroundColor: colors.danger,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
