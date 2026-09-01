/**
 * Lease Closure — progress: Steps 4–7 of the closure workflow (settlement,
 * standing crops, handover, final closure) plus the audit trail. Reached by
 * pressing "View closure progress" on ClosureRequestedScreen (Step 1–3:
 * the request itself, notice period, and the owner's response) — never
 * navigated to directly, so the back button always lands back there.
 */
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLeases } from '../../context/LeaseContext';
import { useAuth } from '../../context/AuthContext';
import { storageApi } from '../../services/storageApi';
import {
  CLOSURE_STATUS_LABELS,
  computeSettlement,
  isNoticeSatisfied,
  STANDING_CROP_OPTIONS,
} from '../../constants/leaseClosure';
import type { StandingCropOption } from '../../types/lease';
import { colors } from '../../theme/tokens';

// Defensive optional require, same convention as AddFarmScreen.
let ImagePicker: { launchImageLibrary?: Function } | null;
try {
  ImagePicker = require('react-native-image-picker');
} catch {
  ImagePicker = null;
}

type ParamList = { LeaseClosure: { closureId: string } };

const G = colors.deepGreen;

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.rowMuted]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold, muted && styles.rowMuted]}>{value}</Text>
    </View>
  );
}

function GateRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.gateRow}>
      <Ionicons name={ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={ok ? G.g3 : G.n6} />
      <Text style={[styles.gateLabel, ok && styles.gateLabelOk]}>{label}</Text>
    </View>
  );
}

export default function LeaseClosureScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'LeaseClosure'>>();
  const { closureId } = route.params;
  const { user } = useAuth();
  const {
    closures, getHistoryForClosure, updateSettlement, confirmSettlement,
    resolveStandingCrop, addHandoverPhotos, setHandoverNotes, confirmHandover, finalizeClosure,
  } = useLeases();
  const closure = closures.find(c => c.id === closureId);

  // All hooks declared unconditionally, before the "not found" early return.
  const [rentText, setRentText] = useState(() => String(closure?.pendingRent ?? ''));
  const [waterText, setWaterText] = useState(() => String(closure?.pendingWater ?? ''));
  const [electricityText, setElectricityText] = useState(() => String(closure?.pendingElectricity ?? ''));
  const [expenseLabel, setExpenseLabel] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [deductionReason, setDeductionReason] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');
  const [cropOption, setCropOption] = useState<StandingCropOption | undefined>(closure?.standingCropOption);
  const [cropDeadline, setCropDeadline] = useState('');
  const [cropNotes, setCropNotes] = useState('');
  const [farmerNotesText, setFarmerNotesText] = useState(() => closure?.farmerHandoverNotes || '');
  const [ownerNotesText, setOwnerNotesText] = useState(() => closure?.ownerHandoverNotes || '');
  const [uploadingFor, setUploadingFor] = useState<'farmer' | 'owner' | null>(null);

  const isFarmer = !!closure && user?.id === closure.farmerId;
  const role: 'farmer' | 'owner' = isFarmer ? 'farmer' : 'owner';

  const saveSettlementFigures = useCallback(() => {
    if (!closure || !user) return;
    updateSettlement(
      closure.id,
      { pendingRent: Number(rentText) || 0, pendingWater: Number(waterText) || 0, pendingElectricity: Number(electricityText) || 0 },
      { userId: user.id, role },
    );
  }, [closure, user, rentText, waterText, electricityText, updateSettlement, role]);

  const addExpense = useCallback(() => {
    if (!closure || !user || !expenseLabel.trim() || !expenseAmount) return;
    updateSettlement(closure.id, { otherExpenses: [...closure.otherExpenses, { label: expenseLabel.trim(), amount: Number(expenseAmount) }] }, { userId: user.id, role });
    setExpenseLabel('');
    setExpenseAmount('');
  }, [closure, user, expenseLabel, expenseAmount, updateSettlement, role]);

  const removeExpense = useCallback(
    (i: number) => {
      if (!closure || !user) return;
      updateSettlement(closure.id, { otherExpenses: closure.otherExpenses.filter((_, idx) => idx !== i) }, { userId: user.id, role });
    },
    [closure, user, updateSettlement, role],
  );

  const addDeduction = useCallback(() => {
    if (!closure || !user || !deductionReason.trim() || !deductionAmount) return;
    updateSettlement(closure.id, { deductions: [...closure.deductions, { reason: deductionReason.trim(), amount: Number(deductionAmount) }] }, { userId: user.id, role });
    setDeductionReason('');
    setDeductionAmount('');
  }, [closure, user, deductionReason, deductionAmount, updateSettlement, role]);

  const removeDeduction = useCallback(
    (i: number) => {
      if (!closure || !user) return;
      updateSettlement(closure.id, { deductions: closure.deductions.filter((_, idx) => idx !== i) }, { userId: user.id, role });
    },
    [closure, user, updateSettlement, role],
  );

  const recordStandingCrop = useCallback(() => {
    if (!closure || !user || !cropOption) return;
    resolveStandingCrop(closure.id, cropOption, { deadline: cropDeadline.trim() || undefined, notes: cropNotes.trim() || undefined, userId: user.id, role });
  }, [closure, user, cropOption, cropDeadline, cropNotes, resolveStandingCrop, role]);

  const saveNotes = useCallback(
    (who: 'farmer' | 'owner') => {
      if (!closure || !user) return;
      const notes = who === 'farmer' ? farmerNotesText : ownerNotesText;
      setHandoverNotes(closure.id, who, notes.trim(), user.id);
    },
    [closure, user, farmerNotesText, ownerNotesText, setHandoverNotes],
  );

  const uploadPhotosFor = useCallback(
    (who: 'farmer' | 'owner') => {
      if (!closure || !user) return;
      if (!ImagePicker?.launchImageLibrary) return Alert.alert('Gallery', 'Image picker not available in this build.');
      ImagePicker.launchImageLibrary(
        { mediaType: 'photo', selectionLimit: 0, includeBase64: true, maxWidth: 1600, maxHeight: 1600, quality: 0.8 },
        async (res: { didCancel?: boolean; assets?: { uri?: string; base64?: string; type?: string }[] }) => {
          if (res.didCancel) return;
          const assets = res.assets || [];
          if (!assets.length) return;
          setUploadingFor(who);
          const urls: string[] = [];
          for (const a of assets) {
            if (storageApi.enabled && a.base64) {
              const result = await storageApi.uploadBase64Detailed(a.base64, a.type || 'image/jpeg', user.id, 'farm-media');
              if ('url' in result) urls.push(result.url);
            } else if (a.uri) {
              urls.push(a.uri); // local fallback (no backend configured)
            }
          }
          if (urls.length) addHandoverPhotos(closure.id, who, urls, user.id);
          setUploadingFor(null);
        },
      );
    },
    [closure, user, addHandoverPhotos],
  );

  const onConfirmHandover = useCallback(() => {
    if (!closure || !user) return;
    Alert.alert(
      isFarmer ? 'Confirm handover' : 'Confirm receipt',
      isFarmer ? '"I confirm that I have handed over the land."' : '"I confirm that I have received the land."',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => confirmHandover(closure.id, role, user.id) }],
    );
  }, [closure, user, isFarmer, role, confirmHandover]);

  const onCloseLease = useCallback(() => {
    if (!closure || !user) return;
    Alert.alert(
      'Close this lease?',
      'This finalises the closure — the lease is marked closed and the land is freed up for a new listing.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Close lease', style: 'destructive', onPress: () => finalizeClosure(closure.id, closure.leaseId, closure.landId, { userId: user.id, role }) }],
    );
  }, [closure, user, role, finalizeClosure]);

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

  const history = getHistoryForClosure(closure.id);
  const settlement = computeSettlement(closure);
  const selectedStandingCrop = STANDING_CROP_OPTIONS.find(o => o.id === closure.standingCropOption);
  const noticeOk = isNoticeSatisfied(closure);
  const ownerAccepted = !!closure.ownerResponse && closure.ownerResponse !== 'rejected';
  // Settlement only applies when the owner specifically chose "Accept, settle
  // first" — a plain "Accept" means there's nothing to settle, so the
  // Settlement card (and its gate on closing the lease) are skipped entirely.
  const needsSettlement = closure.ownerResponse === 'accepted_with_settlement';
  const settlementOk = !needsSettlement || closure.settlementConfirmed;
  const terminal = closure.status === 'closed' || closure.status === 'rejected' || closure.status === 'cancelled';
  const readyToClose = !terminal && ownerAccepted && noticeOk && settlementOk && closure.standingCropResolved && !!closure.farmerConfirmedAt && !!closure.ownerConfirmedAt;

  const renderHandoverBlock = (who: 'farmer' | 'owner') => {
    const photos = who === 'farmer' ? closure.farmerPhotos : closure.ownerPhotos;
    const confirmedAt = who === 'farmer' ? closure.farmerConfirmedAt : closure.ownerConfirmedAt;
    const editable = role === who;
    const notesText = who === 'farmer' ? farmerNotesText : ownerNotesText;
    const setNotesText = who === 'farmer' ? setFarmerNotesText : setOwnerNotesText;
    return (
      <View style={styles.handoverBlock}>
        <Text style={styles.subLabel}>{who === 'farmer' ? 'Farmer' : 'Land Owner'}{editable ? ' (you)' : ''}</Text>
        {photos.length > 0 && (
          <Text style={styles.photoCount}>{photos.length} photo{photos.length === 1 ? '' : 's'} uploaded</Text>
        )}
        {editable ? (
          <>
            <TouchableOpacity style={styles.photoBtn} onPress={() => uploadPhotosFor(who)} disabled={uploadingFor === who}>
              {uploadingFor === who ? <ActivityIndicator size="small" color={G.g2} /> : <Ionicons name="camera-outline" size={16} color={G.g2} />}
              <Text style={styles.photoBtnText}>Add land condition photos</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Comments on land condition, damage, or pending issues"
              placeholderTextColor="#9EB8A8"
              multiline
              value={notesText}
              onChangeText={setNotesText}
              onBlur={() => saveNotes(who)}
            />
          </>
        ) : (
          !!notesText && <Text style={styles.readonlyValue}>{notesText}</Text>
        )}
        {confirmedAt ? (
          <View style={styles.doneRow}>
            <Ionicons name="checkmark-circle" size={16} color={G.g3} />
            <Text style={styles.doneText}>
              {who === 'farmer' ? 'Handed over' : 'Received'} on {new Date(confirmedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        ) : editable ? (
          // The owner can't confirm receipt before the farmer has actually
          // confirmed handing the land over — receiving something that
          // hasn't been handed over yet doesn't make sense.
          who === 'owner' && !closure.farmerConfirmedAt ? (
            <Text style={styles.help}>Waiting for the farmer to confirm handover first.</Text>
          ) : (
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirmHandover}>
              <Text style={styles.confirmBtnText}>
                {who === 'farmer' ? 'I confirm that I have handed over the land.' : 'I confirm that I have received the land.'}
              </Text>
            </TouchableOpacity>
          )
        ) : null}
      </View>
    );
  };

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
        {/* Step 4: settlement — only when the owner chose "Accept, settle first" */}
        {needsSettlement && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Settlement</Text>
            {!isFarmer && !closure.settlementConfirmed ? (
              <>
                <Text style={styles.subLabel}>Pending amounts</Text>
                <View style={styles.addRow}>
                  <TextInput style={[styles.input, styles.flex1]} placeholder="Rent ₹" placeholderTextColor="#9EB8A8" keyboardType="numeric" value={rentText} onChangeText={setRentText} onBlur={saveSettlementFigures} />
                  <TextInput style={[styles.input, styles.flex1]} placeholder="Water ₹" placeholderTextColor="#9EB8A8" keyboardType="numeric" value={waterText} onChangeText={setWaterText} onBlur={saveSettlementFigures} />
                  <TextInput style={[styles.input, styles.flex1]} placeholder="Electricity ₹" placeholderTextColor="#9EB8A8" keyboardType="numeric" value={electricityText} onChangeText={setElectricityText} onBlur={saveSettlementFigures} />
                </View>

                <Text style={styles.subLabel}>Other agreed expenses</Text>
                {closure.otherExpenses.map((e, i) => (
                  <View key={i} style={styles.lineItemRow}>
                    <Text style={styles.lineItemText}>{e.label} — ₹{e.amount}</Text>
                    <TouchableOpacity onPress={() => removeExpense(i)} hitSlop={6}><Ionicons name="close-circle" size={16} color="#C02828" /></TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addRow}>
                  <TextInput style={[styles.input, styles.flex1]} placeholder="Label" placeholderTextColor="#9EB8A8" value={expenseLabel} onChangeText={setExpenseLabel} />
                  <TextInput style={[styles.input, styles.amountInput]} placeholder="₹" placeholderTextColor="#9EB8A8" keyboardType="numeric" value={expenseAmount} onChangeText={setExpenseAmount} />
                  <TouchableOpacity style={styles.addBtn} onPress={addExpense}><Ionicons name="add" size={18} color="#fff" /></TouchableOpacity>
                </View>

                <Text style={styles.subLabel}>Security deposit</Text>
                <Text style={styles.readonlyValue}>₹{closure.securityDeposit ?? 0}</Text>

                <Text style={styles.subLabel}>Deductions — with a reason each (nothing is auto-deducted)</Text>
                {closure.deductions.map((d, i) => (
                  <View key={i} style={styles.lineItemRow}>
                    <Text style={styles.lineItemText}>{d.reason} — ₹{d.amount}</Text>
                    <TouchableOpacity onPress={() => removeDeduction(i)} hitSlop={6}><Ionicons name="close-circle" size={16} color="#C02828" /></TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addRow}>
                  <TextInput style={[styles.input, styles.flex1]} placeholder="Reason" placeholderTextColor="#9EB8A8" value={deductionReason} onChangeText={setDeductionReason} />
                  <TextInput style={[styles.input, styles.amountInput]} placeholder="₹" placeholderTextColor="#9EB8A8" keyboardType="numeric" value={deductionAmount} onChangeText={setDeductionAmount} />
                  <TouchableOpacity style={styles.addBtn} onPress={addDeduction}><Ionicons name="add" size={18} color="#fff" /></TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Row label="Pending rent" value={`₹${closure.pendingRent ?? 0}`} />
                <Row label="Pending water" value={`₹${closure.pendingWater ?? 0}`} />
                <Row label="Pending electricity" value={`₹${closure.pendingElectricity ?? 0}`} />
                {closure.otherExpenses.map((e, i) => <Row key={i} label={e.label} value={`₹${e.amount}`} />)}
                <Row label="Security deposit" value={`₹${closure.securityDeposit ?? 0}`} />
                {closure.deductions.map((d, i) => <Row key={i} label={`Deduction: ${d.reason}`} value={`₹${d.amount}`} muted />)}
              </>
            )}

            <View style={styles.totalsBox}>
              <Row label="Total pending amount" value={`₹${settlement.totalPending}`} bold />
              <Row label="Total deductions" value={`₹${settlement.totalDeductions}`} bold />
              <Row label="Security deposit refund" value={`₹${settlement.depositRefund}`} bold />
              <Row
                label="Final settlement"
                value={settlement.payer === 'none' ? 'Nothing owed either way' : `${settlement.payer === 'owner' ? 'Owner owes farmer' : 'Farmer owes owner'} ₹${Math.abs(settlement.finalAmount)}`}
                bold
              />
            </View>

            {closure.settlementConfirmed ? (
              <View style={styles.doneRow}><Ionicons name="checkmark-circle" size={16} color={G.g3} /><Text style={styles.doneText}>Settlement confirmed</Text></View>
            ) : (
              <TouchableOpacity style={styles.confirmBtn} onPress={() => user && confirmSettlement(closure.id, { userId: user.id, role })}>
                <Text style={styles.confirmBtnText}>Confirm settlement (both parties agree)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Step 5: standing crops — only the land owner decides how a
            standing crop is handled. Until it's recorded, the farmer doesn't
            see this section at all rather than a placeholder "waiting" card;
            once recorded, both sides see the same read-only result. */}
        {ownerAccepted && (!isFarmer || closure.standingCropResolved) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing / Standing Crops</Text>
            {isFarmer ? (
              // Farmer only needs to know what was decided, not the other
              // options that weren't picked.
              selectedStandingCrop && (
                <View style={styles.optionRow}>
                  <Ionicons name="checkmark-circle" size={18} color={G.g2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{selectedStandingCrop.label}</Text>
                    <Text style={styles.optionHelp}>{selectedStandingCrop.help}</Text>
                  </View>
                </View>
              )
            ) : (
              STANDING_CROP_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.optionRow}
                  disabled={closure.standingCropResolved}
                  onPress={() => setCropOption(opt.id)}
                >
                  <Ionicons name={(closure.standingCropResolved ? closure.standingCropOption : cropOption) === opt.id ? 'radio-button-on' : 'radio-button-off'} size={18} color={G.g2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionHelp}>{opt.help}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            {closure.standingCropResolved ? (
              <>
                {!!closure.standingCropDeadline && <Row label="Deadline" value={closure.standingCropDeadline} />}
                {!!closure.standingCropNotes && <Row label="Notes" value={closure.standingCropNotes} />}
                <View style={styles.doneRow}><Ionicons name="checkmark-circle" size={16} color={G.g3} /><Text style={styles.doneText}>Recorded</Text></View>
              </>
            ) : (
              <>
                {cropOption === 'harvest_by_deadline' && (
                  <TextInput style={styles.input} placeholder="Deadline, e.g. 10 Oct 2026" placeholderTextColor="#9EB8A8" value={cropDeadline} onChangeText={setCropDeadline} />
                )}
                <TextInput style={[styles.input, styles.multiline]} placeholder="Notes (optional)" placeholderTextColor="#9EB8A8" multiline value={cropNotes} onChangeText={setCropNotes} />
                <TouchableOpacity style={styles.confirmBtn} disabled={!cropOption} onPress={recordStandingCrop}>
                  <Text style={styles.confirmBtnText}>Record agreement</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Step 6: handover */}
        {ownerAccepted && closure.standingCropResolved && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Land Handover & Inspection</Text>
            {renderHandoverBlock('farmer')}
            {renderHandoverBlock('owner')}
          </View>
        )}

        {/* Step 7: final closure */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Final Closure</Text>
          <GateRow ok={ownerAccepted} label="Closure accepted or mutually agreed" />
          <GateRow ok={noticeOk} label="Notice period completed or waived" />
          {needsSettlement && <GateRow ok={closure.settlementConfirmed} label="Financial settlement completed or recorded" />}
          <GateRow ok={closure.standingCropResolved} label="Standing crop issue resolved" />
          <GateRow ok={!!closure.farmerConfirmedAt && !!closure.ownerConfirmedAt} label="Land handover completed by both parties" />
          {terminal ? (
            <View style={styles.doneRow}>
              <Ionicons name="information-circle" size={16} color={G.n4} />
              <Text style={styles.doneText}>{CLOSURE_STATUS_LABELS[closure.status]}</Text>
            </View>
          ) : readyToClose ? (
            // Finalizing is the owner's call — the farmer just sees the same
            // "Closed" status above (the `terminal` branch) once it happens.
            isFarmer ? (
              <Text style={styles.help}>Everything is complete — waiting for the land owner to close the lease.</Text>
            ) : (
              <TouchableOpacity style={styles.closeLeaseBtn} onPress={onCloseLease}>
                <Ionicons name="checkmark-done" size={18} color="#fff" />
                <Text style={styles.closeLeaseBtnText}>Close lease</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.help}>Complete every step above to close this lease.</Text>
          )}
        </View>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>History</Text>
            {history.map(h => (
              <View key={h.id} style={styles.historyItem}>
                <Text style={styles.historyAction}>{h.action.replace(/_/g, ' ')}</Text>
                {!!h.details && <Text style={styles.historyDetails}>{h.details}</Text>}
                <Text style={styles.historyMeta}>
                  {new Date(h.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })} · {h.userRole === 'farmer' ? 'Farmer' : 'Land Owner'}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  subLabel: { fontSize: 11, fontWeight: '800', color: G.n4, marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: G.n8 },
  rowLabel: { fontSize: 12, color: G.n4, flexShrink: 0 },
  rowValue: { fontSize: 12, color: G.n2, fontWeight: '600', flex: 1, textAlign: 'right' },
  rowValueBold: { fontWeight: '800' },
  rowMuted: { color: '#C02828' },

  gateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  gateLabel: { fontSize: 12, color: G.n4, flex: 1 },
  gateLabelOk: { color: G.n2, fontWeight: '600' },

  input: { fontSize: 13, color: G.n2, paddingVertical: 9, paddingHorizontal: 11, backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10 },
  multiline: { minHeight: 60, textAlignVertical: 'top', marginTop: 8 },
  flex1: { flex: 1 },
  amountInput: { width: 90 },
  addRow: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 6 },
  addBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: G.g2, alignItems: 'center', justifyContent: 'center' },
  lineItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  lineItemText: { fontSize: 12, color: G.n2, flex: 1 },

  readonlyValue: { fontSize: 13, color: G.n2, fontWeight: '600' },

  totalsBox: { backgroundColor: G.n8, borderRadius: 10, padding: 10, marginTop: 12 },

  confirmBtn: { backgroundColor: G.g2, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  optionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: G.n8 },
  optionLabel: { fontSize: 13, fontWeight: '700', color: G.n2 },
  optionHelp: { fontSize: 11, color: G.n4, marginTop: 2, lineHeight: 15 },

  handoverBlock: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: G.n8 },
  photoCount: { fontSize: 11, color: G.n4, marginBottom: 6 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: G.g7, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  photoBtnText: { fontSize: 11, fontWeight: '700', color: G.g2 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  doneText: { fontSize: 12, fontWeight: '700', color: G.g2 },

  closeLeaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: G.g2, borderRadius: 12, paddingVertical: 14, marginTop: 8 },
  closeLeaseBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  help: { fontSize: 11, color: G.n4, marginTop: 6, lineHeight: 16 },

  historyItem: { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: G.n8 },
  historyAction: { fontSize: 12, fontWeight: '700', color: G.n2, textTransform: 'capitalize' },
  historyDetails: { fontSize: 11, color: G.n4, marginTop: 1 },
  historyMeta: { fontSize: 10, color: G.n6, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: G.n4 },
});
