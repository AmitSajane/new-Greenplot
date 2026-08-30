/**
 * Lease Closure — Step 1: the request itself, notice period, and the land
 * owner's response. This is the screen every closure entry point (Owner
 * Home's "Action required"/"Recent activity", Farmer Home's activity feed,
 * Agreement Details) lands on first — "View closure progress" pushes
 * forward into LeaseClosureScreen (settlement, standing crops, handover,
 * final closure) once there's something to manage there.
 *
 * Splitting this out of LeaseClosureScreen gives the back button somewhere
 * real to land: Progress → back → here, here → back → wherever you came
 * from. Previously both lived on one screen, so back from anywhere skipped
 * straight past "as requested" to whatever screen opened the closure.
 */
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLeases } from '../../context/LeaseContext';
import { useAuth } from '../../context/AuthContext';
import { CLOSURE_STATUS_LABELS } from '../../constants/leaseClosure';
import type { OwnerClosureResponse } from '../../types/lease';
import { colors } from '../../theme/tokens';

type ParamList = { ClosureRequested: { closureId: string } };

const G = colors.deepGreen;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ClosureRequestedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'ClosureRequested'>>();
  const { closureId } = route.params;
  const { user } = useAuth();
  const { closures, respondToClosure, waiveNoticePeriod, cancelClosure } = useLeases();
  const closure = closures.find(c => c.id === closureId);

  // All hooks declared unconditionally, before the "not found" early return.
  const [respondMode, setRespondMode] = useState<OwnerClosureResponse | null>(null);
  const [respondComment, setRespondComment] = useState('');
  const [respondDate, setRespondDate] = useState('');

  const isFarmer = !!closure && user?.id === closure.farmerId;
  const role: 'farmer' | 'owner' = isFarmer ? 'farmer' : 'owner';

  const handleRespond = useCallback(
    (response: OwnerClosureResponse) => {
      if (!closure || !user) return;
      respondToClosure(
        closure.id, response,
        { ownerId: closure.ownerId, farmerId: closure.farmerId, landTitle: closure.landTitle },
        { comments: respondComment.trim() || undefined, proposedDate: response === 'proposed_new_date' ? respondDate.trim() || undefined : undefined },
      );
      setRespondMode(null);
      setRespondComment('');
      setRespondDate('');
    },
    [closure, user, respondToClosure, respondComment, respondDate],
  );

  const onWithdraw = useCallback(() => {
    if (!closure || !user) return;
    Alert.alert('Withdraw closure request?', 'This cancels your request — you can submit a new one later.', [
      { text: 'No', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => cancelClosure(closure.id, { userId: user.id, role }) },
    ]);
  }, [closure, user, role, cancelClosure]);

  if (!closure) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lease Closure</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={40} color={G.n6} />
          <Text style={styles.emptyText}>Closure not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const terminal = closure.status === 'closed' || closure.status === 'rejected' || closure.status === 'cancelled';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>{closure.landTitle}</Text>
          <Text style={styles.headerTitle}>{CLOSURE_STATUS_LABELS[closure.status]}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Step 1 + Step 2: the request as submitted, and its notice period */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Closure Request & Notice Period</Text>
          <Row label="Reason" value={closure.reason} />
          {!!closure.comments && <Row label="Comments" value={closure.comments} />}
          <Row label="Requested" value={new Date(closure.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
          <Row label="Proposed handover date" value={closure.proposedHandoverDate} />
          <Row label="Notice period" value={closure.noticeWaived ? 'Waived' : `${closure.noticePeriodDays} days`} />
          <Row label="Eligible closure date" value={closure.eligibleClosureDate || '—'} />
          {!isFarmer && !closure.noticeWaived && !terminal && (
            <TouchableOpacity style={styles.linkBtn} onPress={() => waiveNoticePeriod(closure.id, closure.ownerId)}>
              <Text style={styles.linkBtnText}>Waive notice period (mutual agreement)</Text>
            </TouchableOpacity>
          )}
          {isFarmer && closure.status === 'requested' && (
            <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdraw}>
              <Text style={styles.withdrawBtnText}>Withdraw request</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 3: owner response — the reason this screen exists on its own:
            whether or not you've responded is exactly what should still be
            visible after pressing back from the progress screen. */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Land Owner Response</Text>
          {closure.ownerResponse ? (
            <>
              <Row label="Response" value={closure.ownerResponse.replace(/_/g, ' ')} />
              {!!closure.ownerResponseComments && <Row label="Comments" value={closure.ownerResponseComments} />}
              {!!closure.ownerProposedDate && <Row label="Proposed date" value={closure.ownerProposedDate} />}
            </>
          ) : isFarmer ? (
            <Text style={styles.help}>Waiting for the land owner to respond.</Text>
          ) : (
            <>
              <View style={styles.respondGrid}>
                <TouchableOpacity style={[styles.respondBtn, styles.respondAccept]} onPress={() => handleRespond('accepted')}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.respondBtnTextLight}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.respondBtn, styles.respondAccept]} onPress={() => handleRespond('accepted_with_settlement')}>
                  <Ionicons name="cash-outline" size={16} color="#fff" />
                  <Text style={styles.respondBtnTextLight}>Accept, settle first</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.respondBtn, styles.respondNeutral]} onPress={() => setRespondMode(m => (m === 'proposed_new_date' ? null : 'proposed_new_date'))}>
                  <Ionicons name="calendar-outline" size={16} color={G.g2} />
                  <Text style={styles.respondBtnText}>Propose date</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.respondBtn, styles.respondReject]} onPress={() => setRespondMode(m => (m === 'rejected' ? null : 'rejected'))}>
                  <Ionicons name="close" size={16} color="#C02828" />
                  <Text style={styles.respondBtnTextReject}>Reject</Text>
                </TouchableOpacity>
              </View>
              {respondMode === 'proposed_new_date' && (
                <View style={styles.inlineComposer}>
                  <TextInput style={styles.input} placeholder="Proposed date, e.g. 30 Sep 2026" placeholderTextColor="#9EB8A8" value={respondDate} onChangeText={setRespondDate} />
                  <TextInput style={[styles.input, styles.multiline]} placeholder="Comments (optional)" placeholderTextColor="#9EB8A8" multiline value={respondComment} onChangeText={setRespondComment} />
                  <TouchableOpacity style={styles.confirmBtn} disabled={!respondDate.trim()} onPress={() => handleRespond('proposed_new_date')}>
                    <Text style={styles.confirmBtnText}>Send proposed date</Text>
                  </TouchableOpacity>
                </View>
              )}
              {respondMode === 'rejected' && (
                <View style={styles.inlineComposer}>
                  <TextInput style={[styles.input, styles.multiline]} placeholder="Reason for rejecting (required)" placeholderTextColor="#9EB8A8" multiline value={respondComment} onChangeText={setRespondComment} />
                  <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnReject]} disabled={!respondComment.trim()} onPress={() => handleRespond('rejected')}>
                    <Text style={styles.confirmBtnText}>Confirm rejection</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('LeaseClosure', { closureId: closure.id })}
        >
          <Text style={styles.continueBtnText}>View closure progress</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.n8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: G.g2, paddingHorizontal: 16, paddingVertical: 14 },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  scroll: { padding: 14, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 14, padding: 13, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: G.g1, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.3 },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: G.n8 },
  rowLabel: { fontSize: 12, color: G.n4, flexShrink: 0 },
  rowValue: { fontSize: 12, color: G.n2, fontWeight: '600', flex: 1, textAlign: 'right' },

  input: { fontSize: 13, color: G.n2, paddingVertical: 9, paddingHorizontal: 11, backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10 },
  multiline: { minHeight: 60, textAlignVertical: 'top', marginTop: 8 },

  respondGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  respondBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: 'transparent' },
  respondAccept: { backgroundColor: G.g2 },
  respondNeutral: { backgroundColor: '#fff', borderColor: G.n7 },
  respondReject: { backgroundColor: '#FDECEC', borderColor: '#F5C6C6' },
  respondBtnText: { fontSize: 12, fontWeight: '700', color: G.g2 },
  respondBtnTextLight: { fontSize: 12, fontWeight: '700', color: '#fff' },
  respondBtnTextReject: { fontSize: 12, fontWeight: '700', color: '#C02828' },
  inlineComposer: { marginTop: 10, gap: 8 },

  confirmBtn: { backgroundColor: G.g2, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  confirmBtnReject: { backgroundColor: '#C02828' },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  linkBtn: { marginTop: 10 },
  linkBtnText: { fontSize: 12, fontWeight: '700', color: G.g3 },
  withdrawBtn: { marginTop: 10, alignSelf: 'flex-start' },
  withdrawBtnText: { fontSize: 12, fontWeight: '700', color: '#C02828' },

  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: G.g2, borderRadius: 12, paddingVertical: 14, marginTop: 2 },
  continueBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  help: { fontSize: 11, color: G.n4, marginTop: 6, lineHeight: 16 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: G.n4 },
});
