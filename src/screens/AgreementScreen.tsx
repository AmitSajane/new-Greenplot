import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLeases } from '../context/LeaseContext';
import { useAuth } from '../context/AuthContext';
import { LEASE_TYPE_MAP } from '../constants/leaseTypes';
import { colors } from '../theme/tokens';
import { supabase } from '../services/supabase';
import { storageApi } from '../services/storageApi';
import { SignaturePadModal } from '../components/organisms/SignaturePadModal';
import { buildTermsAndConditions, TermsClauseRole } from '../constants/leaseTermsAndConditions';
import { isRazorpayConfigured } from '../config/env';
import { paymentsApi, RazorpayOrder } from '../services/paymentsApi';
import { RazorpayCheckout, RazorpaySuccess } from '../modules/payments';

type ParamList = { AgreementSign: { agreementId: string } };

const G = colors.deepGreen;

const ROLE_BADGE: Record<TermsClauseRole, { label: string; bg: string; fg: string }> = {
  owner: { label: 'OWNER', bg: '#FFF1DC', fg: '#B87214' },
  farmer: { label: 'FARMER', bg: '#E7F0FF', fg: '#1A5299' },
  both: { label: 'BOTH', bg: '#E4F4EC', fg: '#1A6B3A' },
};

function SignatureBlock({ name, role, signed, signatureUrl }: { name: string; role: string; signed: boolean; signatureUrl?: string }) {
  return (
    <View style={[styles.signBox, signed && styles.signBoxDone]}>
      <Text style={styles.signRole}>{role}</Text>
      {signed ? (
        signatureUrl ? (
          <View>
            <Image source={{ uri: signatureUrl }} style={styles.signatureImg} resizeMode="contain" />
            <Text style={styles.signedName}>{name}</Text>
          </View>
        ) : (
          <View style={styles.signedRow}>
            <Ionicons name="checkmark-circle" size={18} color={G.g3} />
            <Text style={styles.signedName}>{name}</Text>
          </View>
        )
      ) : (
        <Text style={styles.pendingName}>Awaiting signature</Text>
      )}
    </View>
  );
}

export default function AgreementScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'AgreementSign'>>();
  const { user } = useAuth();
  const { getAgreementById, signAgreementAsFarmer, offers } = useLeases();

  const agreement = getAgreementById(route.params.agreementId);
  const isOwnerViewer = (user as { role?: string })?.role === 'owner';

  const [padOpen, setPadOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  // Farmer must read the Terms & Conditions below before this unlocks the
  // sign button — reading comes before signing, not after.
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Deposit amount: read from the owner's offer when they set one.
  // TODO(mock data): most seeded/test offers don't have securityDeposit set
  // yet, so this falls back to a fixed test amount — enough to exercise the
  // Razorpay test-mode flow end-to-end. Remove the fallback once offers
  // reliably carry a real deposit.
  const offer = offers.find(o => o.id === agreement?.offerId);
  const configuredDepositRupees = Number(offer?.terms.securityDeposit) || 0;
  const MOCK_DEPOSIT_RUPEES = 5000;
  const depositRupees = configuredDepositRupees > 0 ? configuredDepositRupees : MOCK_DEPOSIT_RUPEES;
  const isMockDeposit = configuredDepositRupees <= 0;

  // Signature drawn but the deposit hasn't been verified yet → held here so
  // "retry payment" doesn't force the farmer to re-draw it.
  const [pendingSignatureUrl, setPendingSignatureUrl] = useState<string | null>(null);
  const [startingPayment, setStartingPayment] = useState(false);
  const [order, setOrder] = useState<RazorpayOrder | null>(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const onSign = useCallback(() => {
    if (!agreement || !agreedToTerms) return;
    Alert.alert(
      'Sign & pay security deposit?',
      `By signing, you draw your signature to accept the lease terms above, then pay the ₹${depositRupees.toLocaleString()} security deposit to activate the lease.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => setPadOpen(true) },
      ],
    );
  }, [agreement, agreedToTerms, depositRupees]);

  const closePad = useCallback(() => {
    if (signing) return; // don't let a stray tap dismiss mid-upload
    setPadOpen(false);
  }, [signing]);

  // Opens Razorpay test-mode checkout for the security deposit. Only once
  // that payment is verified server-side (see onCheckoutSuccess) do we
  // actually record the signature + activate the lease — signing the
  // agreement on its own no longer activates it.
  const startDepositPayment = useCallback(
    async (signatureUrl: string) => {
      if (!agreement) return;
      if (!isRazorpayConfigured) {
        Alert.alert(
          'Payments not set up',
          'Add RAZORPAY_KEY_ID to .env and deploy the payment edge functions — see supabase/functions/README.md.',
        );
        return;
      }
      setPendingSignatureUrl(signatureUrl);
      setStartingPayment(true);
      try {
        const newOrder = await paymentsApi.createOrder({
          amountPaise: depositRupees * 100,
          context: 'lease_rent',
          contextId: agreement.id,
          payeeId: agreement.ownerId,
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
        setStartingPayment(false);
      }
    },
    [agreement, depositRupees],
  );

  // Farmer finished drawing → `dataUri` is a full "data:image/png;base64,…"
  // from the signature pad. Upload it (Supabase mode) or keep it as-is (mock
  // mode, nowhere to upload to), close the pad, then move straight into the
  // deposit payment step — signing alone doesn't finalize anything yet.
  const handleSignatureCaptured = useCallback(
    async (dataUri: string) => {
      if (!agreement) return;
      setSigning(true);
      try {
        let signatureUrl = dataUri;
        if (supabase) {
          const base64 = dataUri.replace(/^data:image\/\w+;base64,/, '');
          const result = await storageApi.uploadBase64Detailed(base64, 'image/png', user?.id || '', 'signatures');
          if ('error' in result) {
            Alert.alert('Could not save signature', result.error);
            return;
          }
          signatureUrl = result.url;
        }
        setPadOpen(false);
        await startDepositPayment(signatureUrl);
      } finally {
        setSigning(false);
      }
    },
    [agreement, startDepositPayment, user?.id],
  );

  const onCheckoutSuccess = useCallback(
    async (payload: RazorpaySuccess) => {
      setCheckoutVisible(false);
      if (!agreement || !pendingSignatureUrl) return;
      try {
        const result = await paymentsApi.verifyPayment(payload);
        const verified = result?.verified ?? false;
        if (!verified) {
          Alert.alert(
            'Could not verify payment',
            'Razorpay reported success but the signature did not verify — try the payment again before assuming the deposit is paid.',
          );
          return;
        }
        signAgreementAsFarmer(agreement.id, pendingSignatureUrl);
        setPendingSignatureUrl(null);
        Alert.alert('Lease booked ✓', 'Security deposit paid and both parties have signed. Your lease is now active!', [
          { text: 'View my lease', onPress: () => navigation.navigate('MyActiveLeases') },
        ]);
      } catch (e) {
        Alert.alert('Verification failed', e instanceof Error ? e.message : 'Please contact support.');
      }
    },
    [agreement, pendingSignatureUrl, signAgreementAsFarmer, navigation],
  );

  const onCheckoutDismiss = useCallback(() => setCheckoutVisible(false), []);

  const onCheckoutError = useCallback((message: string) => {
    setCheckoutVisible(false);
    Alert.alert('Payment failed', message);
  }, []);

  if (!agreement) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agreement</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={40} color={G.n6} />
          <Text style={styles.emptyText}>Agreement not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const t = LEASE_TYPE_MAP[agreement.typeId];
  const active = agreement.status === 'active';
  const rows = [
    ...agreement.fullTerms,
    { label: 'Tenure', value: agreement.tenure },
    { label: 'Available from', value: agreement.availableFrom },
  ];
  // Before the farmer signs, `agreement.startDate` isn't set yet (it's only
  // written once the lease goes active) — fall back to the owner's chosen
  // "Available from" date so the Duration clause already shows the real
  // start date the farmer is agreeing to, not a vague "on the date both
  // parties sign".
  const termsClauses = buildTermsAndConditions({ ...agreement, startDate: agreement.startDate || agreement.availableFrom });
  // Only the farmer is stopped by the unread-terms gate here — the owner's
  // side of this screen is a read-only wait state, never the sign action.
  const needsTermsGate = !active && !isOwnerViewer && !agreement.farmerSigned && !pendingSignatureUrl;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lease Agreement</Text>
        {active && <View style={styles.activePill}><Text style={styles.activePillText}>ACTIVE</Text></View>}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Document */}
        <View style={styles.doc}>
          <View style={styles.docHead}>
            <Text style={styles.docEmoji}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{t.name} Agreement</Text>
              <Text style={styles.docLand}>{agreement.landTitle}</Text>
            </View>
          </View>

          <View style={styles.parties}>
            <Text style={styles.partyText}>
              Between <Text style={styles.bold}>{agreement.ownerName}</Text> (Owner) and{' '}
              <Text style={styles.bold}>{agreement.farmerName}</Text> (Farmer)
            </Text>
          </View>

          <Text style={styles.termsHead}>Terms</Text>
          {rows.map(r => (
            <View key={r.label} style={styles.termRow}>
              <Text style={styles.termLabel}>{r.label}</Text>
              <Text style={styles.termValue}>{r.value}</Text>
            </View>
          ))}

          <Text style={styles.fine}>
            This is a digital lease record generated by GreenPlot. Both parties agree to the terms above for the stated tenure.
          </Text>
        </View>

        {/* Terms & Conditions — shown in full so the farmer reads every clause
            before signing, not after. */}
        <Text style={styles.sectionLabel}>Terms & Conditions</Text>
        <View style={styles.termsDoc}>
          {termsClauses.map(clause => {
            const badge = ROLE_BADGE[clause.role];
            return (
              <View key={clause.id} style={styles.termsClause}>
                <View style={styles.termsClauseHead}>
                  <Text style={styles.termsClauseTitle}>{clause.title}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.roleBadgeText, { color: badge.fg }]}>{badge.label}</Text>
                  </View>
                </View>
                <Text style={styles.termsClauseBody}>{clause.body}</Text>
              </View>
            );
          })}
        </View>

        {needsTermsGate && (
          <TouchableOpacity
            style={styles.agreeRow}
            activeOpacity={0.75}
            onPress={() => setAgreedToTerms(v => !v)}
          >
            <Ionicons
              name={agreedToTerms ? 'checkbox' : 'square-outline'}
              size={22}
              color={agreedToTerms ? G.g3 : G.n4}
            />
            <Text style={styles.agreeText}>I have read and agree to all the Terms & Conditions above</Text>
          </TouchableOpacity>
        )}

        {/* Signatures */}
        <Text style={styles.sectionLabel}>Signatures</Text>
        <View style={styles.signRow}>
          <SignatureBlock name={agreement.ownerName} role="Owner" signed={agreement.ownerSigned} />
          <SignatureBlock
            name={agreement.farmerName}
            role="Farmer"
            signed={agreement.farmerSigned}
            signatureUrl={agreement.farmerSignatureUrl}
          />
        </View>

        {/* Security deposit — the farmer pays this to activate the lease,
            separate from signing (see onSign / startDepositPayment above). */}
        {!isOwnerViewer && (
          <>
            <Text style={styles.sectionLabel}>Security deposit</Text>
            <View style={styles.depositCard}>
              <View>
                <Text style={styles.depositAmount}>₹{depositRupees.toLocaleString()}</Text>
                {isMockDeposit && <Text style={styles.depositNote}>Test amount — no deposit set on this offer</Text>}
              </View>
              <View style={[styles.depositBadge, active ? styles.depositBadgePaid : styles.depositBadgePending]}>
                <Text style={styles.depositBadgeText}>{active ? 'Paid' : 'Pending'}</Text>
              </View>
            </View>
          </>
        )}

        {/* Action */}
        {active ? (
          <View style={styles.activeBox}>
            <Ionicons name="checkmark-done-circle" size={22} color={G.g3} />
            <Text style={styles.activeText}>Lease active since {agreement.startDate}</Text>
          </View>
        ) : isOwnerViewer ? (
          <View style={styles.waitBox}>
            <Ionicons name="time-outline" size={18} color={G.a3} />
            <Text style={styles.waitText}>You’ve signed. Waiting for {agreement.farmerName} to sign and pay the deposit.</Text>
          </View>
        ) : agreement.farmerSigned ? (
          <View style={styles.waitBox}>
            <Ionicons name="time-outline" size={18} color={G.a3} />
            <Text style={styles.waitText}>You’ve signed. Finalising the lease…</Text>
          </View>
        ) : pendingSignatureUrl ? (
          <TouchableOpacity
            style={styles.signBtn}
            onPress={() => startDepositPayment(pendingSignatureUrl)}
            activeOpacity={0.85}
            disabled={startingPayment}
          >
            <Ionicons name="wallet" size={18} color="#fff" />
            <Text style={styles.signBtnText}>
              {startingPayment ? 'Starting payment…' : `Pay ₹${depositRupees.toLocaleString()} deposit`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.signBtn, !agreedToTerms && styles.signBtnDisabled]}
            onPress={onSign}
            activeOpacity={0.85}
            disabled={!agreedToTerms}
          >
            <Ionicons name="create" size={18} color="#fff" />
            <Text style={styles.signBtnText}>Accept & Sign agreement</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <SignaturePadModal
        visible={padOpen}
        title={`Sign for ${agreement.landTitle}`}
        saving={signing}
        onCancel={closePad}
        onSave={handleSignatureCaptured}
      />

      <RazorpayCheckout
        visible={checkoutVisible}
        order={order}
        description={`Security deposit · ${agreement.landTitle}`}
        prefill={{ name: agreement.farmerName }}
        onSuccess={onCheckoutSuccess}
        onDismiss={onCheckoutDismiss}
        onError={onCheckoutError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.n8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: G.g2, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  activePill: { marginLeft: 'auto', backgroundColor: G.g4, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  activePillText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  scroll: { padding: 14, paddingBottom: 30 },
  doc: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 14, padding: 16 },
  docHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  docEmoji: { fontSize: 26 },
  docTitle: { fontSize: 17, fontWeight: '800', color: G.g1 },
  docLand: { fontSize: 12, color: G.n4, marginTop: 1 },
  parties: { backgroundColor: G.n8, borderRadius: 10, padding: 11, marginBottom: 14 },
  partyText: { fontSize: 12, color: G.n2, lineHeight: 18 },
  bold: { fontWeight: '800', color: G.g1 },
  termsHead: { fontSize: 11, fontWeight: '800', color: G.n4, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: G.n8, gap: 12 },
  termLabel: { fontSize: 12, color: G.n4, flexShrink: 0 },
  termValue: { fontSize: 12, color: G.n2, fontWeight: '600', flex: 1, textAlign: 'right' },
  fine: { fontSize: 10, color: G.n4, lineHeight: 15, marginTop: 12, fontStyle: 'italic' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: G.n4, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 9 },
  signRow: { flexDirection: 'row', gap: 10 },
  signBox: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 12, padding: 13, minHeight: 74, justifyContent: 'center' },
  signBoxDone: { borderColor: '#A8D8B8', backgroundColor: G.g7 },
  signRole: { fontSize: 10, fontWeight: '700', color: G.n4, textTransform: 'uppercase', marginBottom: 6 },
  signedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  signedName: { fontSize: 13, fontWeight: '800', color: G.g2 },
  signatureImg: { width: '100%', height: 40, marginBottom: 4 },
  pendingName: { fontSize: 12, color: G.a3, fontWeight: '600' },
  depositCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 12, padding: 14 },
  depositAmount: { fontSize: 18, fontWeight: '800', color: G.g1 },
  depositNote: { fontSize: 11, color: G.a3, marginTop: 2 },
  depositBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  depositBadgePending: { backgroundColor: G.a7 },
  depositBadgePaid: { backgroundColor: G.g7 },
  depositBadgeText: { fontSize: 11, fontWeight: '800', color: G.n2 },
  signBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: G.g2, borderRadius: 12, paddingVertical: 15, marginTop: 16 },
  signBtnDisabled: { backgroundColor: G.n6 },
  signBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  termsDoc: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 14, padding: 16 },
  termsClause: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: G.n8 },
  termsClauseHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  termsClauseTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: G.g1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  roleBadgeText: { fontSize: 10, fontWeight: '800' },
  termsClauseBody: { fontSize: 12, color: G.n2, lineHeight: 18 },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, paddingHorizontal: 2 },
  agreeText: { flex: 1, fontSize: 12, color: G.n2, fontWeight: '600', lineHeight: 17 },
  activeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: G.g7, borderRadius: 12, padding: 14, marginTop: 16, justifyContent: 'center' },
  activeText: { color: G.g2, fontSize: 13, fontWeight: '800' },
  waitBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: G.a7, borderRadius: 12, padding: 14, marginTop: 16, justifyContent: 'center' },
  waitText: { color: G.a3, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: G.n4 },
});
