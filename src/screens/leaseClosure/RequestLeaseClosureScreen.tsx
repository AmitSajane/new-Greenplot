/**
 * Lease Closure — Step 1: the farmer's closure request form. Reason, optional
 * comments, proposed handover date, notice period — then hands off to the
 * land owner (Step 3, reviewed on LeaseClosureScreen).
 */
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLeases } from '../../context/LeaseContext';
import { useAuth } from '../../context/AuthContext';
import { CLOSURE_REASONS, DEFAULT_NOTICE_PERIOD_DAYS, NOTICE_PERIOD_OPTIONS } from '../../constants/leaseClosure';
import { colors } from '../../theme/tokens';
import { formatDateLabel } from '../../utils';

type ParamList = { LeaseClosureRequest: { leaseId: string } };

const G = colors.deepGreen;

export default function RequestLeaseClosureScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'LeaseClosureRequest'>>();
  const { leaseId } = route.params;
  const { user } = useAuth();
  const { activeLeases, offers, requestClosure } = useLeases();

  const lease = activeLeases.find(l => l.id === leaseId);
  const offer = lease ? offers.find(o => o.id === lease.offerId) : undefined;
  const securityDeposit = offer ? Number(offer.terms.securityDeposit) || undefined : undefined;

  const [reason, setReason] = useState<string>(CLOSURE_REASONS[0]);
  const [comments, setComments] = useState('');
  // Picked via calendar (not typed) — the value handed off to `requestClosure`
  // is still the app's usual "DD Mon YYYY" label, just sourced from a Date now.
  const [proposedHandoverDate, setProposedHandoverDate] = useState<Date | null>(null);
  const [showHandoverDatePicker, setShowHandoverDatePicker] = useState(false);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(DEFAULT_NOTICE_PERIOD_DAYS);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!lease && !!user && !!proposedHandoverDate;

  const submit = useCallback(() => {
    if (!lease || !user || !proposedHandoverDate) return;
    setSubmitting(true);
    requestClosure({
      leaseId: lease.id, landId: lease.landId, landTitle: lease.landTitle,
      farmerId: lease.farmerId, farmerName: lease.farmerName, ownerId: lease.ownerId, ownerName: lease.ownerName,
      reason, comments: comments.trim() || undefined, proposedHandoverDate: formatDateLabel(proposedHandoverDate),
      noticePeriodDays, securityDeposit,
    });
    setSubmitting(false);
    Alert.alert(
      'Closure request submitted',
      `${lease.ownerName} will be notified and can accept, reject, or propose another date.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  }, [lease, user, reason, comments, proposedHandoverDate, noticePeriodDays, securityDeposit, requestClosure, navigation]);

  if (!lease) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Lease Closure</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={40} color={G.n6} />
          <Text style={styles.emptyText}>Lease not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSub}>{lease.landTitle}</Text>
          <Text style={styles.headerTitle}>Request Lease Closure</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Reason for closure</Text>
          <View style={styles.chipsRow}>
            {CLOSURE_REASONS.map(r => (
              <TouchableOpacity key={r} style={[styles.chip, reason === r && styles.chipOn]} onPress={() => setReason(r)}>
                <Text style={[styles.chipText, reason === r && styles.chipTextOn]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Additional comments (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputBox, styles.multiline]}
            multiline
            value={comments}
            placeholder="Anything the land owner should know…"
            placeholderTextColor="#9EB8A8"
            onChangeText={setComments}
          />

          <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Proposed land handover date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowHandoverDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Choose proposed handover date"
          >
            <Ionicons name="calendar-outline" size={16} color={G.n4} />
            <Text style={[styles.dateInputText, !proposedHandoverDate && styles.dateInputPlaceholder]}>
              {proposedHandoverDate ? formatDateLabel(proposedHandoverDate) : 'Select a date'}
            </Text>
          </TouchableOpacity>
          {showHandoverDatePicker && (
            <DateTimePicker
              value={proposedHandoverDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowHandoverDatePicker(false);
                if (event.type !== 'dismissed' && selectedDate) setProposedHandoverDate(selectedDate);
              }}
            />
          )}

          <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Notice period</Text>
          <View style={styles.chipsRow}>
            {NOTICE_PERIOD_OPTIONS.map(d => (
              <TouchableOpacity key={d} style={[styles.chip, noticePeriodDays === d && styles.chipOn]} onPress={() => setNoticePeriodDays(d)}>
                <Text style={[styles.chipText, noticePeriodDays === d && styles.chipTextOn]}>{d} days</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.help}>The land owner can waive this by mutual agreement once you submit.</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          disabled={!canSubmit || submitting}
          onPress={submit}
          activeOpacity={0.85}
        >
          <Ionicons name="exit-outline" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit closure request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.n8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: G.g2, paddingHorizontal: 16, paddingVertical: 14 },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  scroll: { padding: 14, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 14, padding: 13 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: G.n2, marginBottom: 8 },
  fieldSpacing: { marginTop: 16 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#C8D8CC', backgroundColor: '#fff' },
  chipOn: { backgroundColor: G.g2, borderColor: G.g2 },
  chipText: { fontSize: 11, fontWeight: '600', color: G.n4 },
  chipTextOn: { color: '#fff' },
  input: { flex: 1, fontSize: 14, color: G.n2, paddingVertical: 10 },
  inputBox: { backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10, paddingHorizontal: 12 },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  dateInputText: { fontSize: 14, color: G.n2, fontWeight: '600' },
  dateInputPlaceholder: { color: '#9EB8A8', fontWeight: '400' },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  help: { fontSize: 10, color: G.n4, marginTop: 8 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: G.g2, borderRadius: 12, paddingVertical: 14, marginTop: 16 },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: G.n4 },
});
