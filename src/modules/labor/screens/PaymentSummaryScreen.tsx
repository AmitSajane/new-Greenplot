import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../../theme/tokens';
import { isRazorpayConfigured } from '../../../config/env';
import { paymentsApi, RazorpayOrder } from '../../../services/paymentsApi';
import { RazorpayCheckout, RazorpaySuccess } from '../../payments';

const MOCK_WORKERS = [
  { id: '1', name: 'Ramu', days: 5, wagePerDay: 400, total: 2000, status: 'paid' },
  { id: '2', name: 'Sita', days: 4, wagePerDay: 400, total: 1600, status: 'pending' },
  { id: '3', name: 'Gopal', days: 3, wagePerDay: 450, total: 1350, status: 'pending' },
];

export default function PaymentSummaryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const jobId = route.params?.jobId;
  const totalPayable = MOCK_WORKERS.reduce((sum, w) => sum + w.total, 0);

  const [order, setOrder] = useState<RazorpayOrder | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Pays the pending total as one lump sum — Razorpay test-mode checkout,
  // verified server-side before anything is recorded as paid (see
  // supabase/functions/verify-razorpay-payment). Splitting this per-worker
  // (so each laborer is paid individually, with the platform's commission
  // held back) needs Razorpay Route + a linked account per laborer, which
  // isn't wired up yet — see the payments module README.
  const onPayAll = async () => {
    if (!isRazorpayConfigured) {
      Alert.alert(
        'Payments not set up',
        'Add RAZORPAY_KEY_ID to .env and deploy the payment edge functions to enable this — see supabase/functions/README.md.',
      );
      return;
    }
    setPlacingOrder(true);
    try {
      const newOrder = await paymentsApi.createOrder({
        amountPaise: totalPayable * 100,
        context: 'labor_wage',
        contextId: jobId,
      });
      if (!newOrder) {
        Alert.alert('Could not start payment', 'Please try again.');
        return;
      }
      setOrder(newOrder);
      setCheckoutVisible(true);
    } catch (e) {
      Alert.alert('Could not start payment', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const onCheckoutSuccess = async (payload: RazorpaySuccess) => {
    setCheckoutVisible(false);
    try {
      const result = await paymentsApi.verifyPayment(payload);
      const verified = result?.verified ?? false;
      Alert.alert(
        verified ? 'Payment received' : 'Could not verify payment',
        verified
          ? `₹${totalPayable.toLocaleString()} paid successfully.`
          : 'Razorpay reported success but the signature did not verify — contact support before assuming this is paid.',
      );
    } catch (e) {
      Alert.alert('Verification failed', e instanceof Error ? e.message : 'Please contact support.');
    }
  };

  const onCheckoutError = (message: string) => {
    setCheckoutVisible(false);
    Alert.alert('Payment failed', message);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Summary</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total payable</Text>
          <Text style={styles.totalValue}>₹{totalPayable.toLocaleString()}</Text>
        </View>
        <Text style={styles.sectionTitle}>Worker breakdown</Text>
        {MOCK_WORKERS.map((w) => (
          <View key={w.id} style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.workerName}>{w.name}</Text>
              <Text style={styles.workerMeta}>{w.days} days × ₹{w.wagePerDay}/day</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.workerTotal}>₹{w.total}</Text>
              <View style={[styles.statusBadge, w.status === 'paid' ? styles.statusPaid : styles.statusPending]}>
                <Text style={styles.statusText}>{w.status}</Text>
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.payBtn, placingOrder && styles.payBtnDisabled]}
          activeOpacity={0.9}
          onPress={onPayAll}
          disabled={placingOrder}
        >
          <Ionicons name="wallet" size={22} color={colors.surface} />
          <Text style={styles.payBtnText}>{placingOrder ? 'Starting payment…' : 'Pay all'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <RazorpayCheckout
        visible={checkoutVisible}
        order={order}
        description={`Labor wages${jobId ? ` · Job ${jobId}` : ''}`}
        onSuccess={onCheckoutSuccess}
        onDismiss={() => setCheckoutVisible(false)}
        onError={onCheckoutError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { marginRight: spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  scroll: { padding: spacing.lg },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  totalValue: { fontSize: 28, fontWeight: '800', color: colors.surface, marginTop: spacing.xs },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLeft: {},
  workerName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  workerMeta: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  rowRight: { alignItems: 'flex-end' },
  workerTotal: { fontSize: 16, fontWeight: '700', color: colors.primary },
  statusBadge: { marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  statusPaid: { backgroundColor: colors.softGreen },
  statusPending: { backgroundColor: colors.softOrange },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.xl,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: colors.surface },
});
