import React, { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLeases } from '../../../context/LeaseContext';
import { useAuth } from '../../../context/AuthContext';
import { LEASE_TYPE_MAP, LeaseOffer, summarizeOffer } from '../../../constants/leaseTypes';

const G = { g1: '#092E18', g2: '#0F4A28', g3: '#1A6B3A', g7: '#E4F4EC', a3: '#B87214', a7: '#FDF5E0', n1: '#0D1509', n2: '#1C2E18', n4: '#6B8074', n7: '#E8F0EC', n8: '#F4F8F5' };

type OfferState = 'apply' | 'applied' | 'sign' | 'active';

interface Props {
  landId: string;
  landTitle: string;
  ownerId: string;
  ownerName: string;
}

function OfferCard({
  offer,
  state,
  onApply,
  onSign,
}: {
  offer: LeaseOffer;
  state: OfferState;
  onApply: (o: LeaseOffer) => void;
  onSign: (o: LeaseOffer) => void;
}) {
  const t = LEASE_TYPE_MAP[offer.typeId];
  const apply = useCallback(() => onApply(offer), [onApply, offer]);
  const sign = useCallback(() => onSign(offer), [onSign, offer]);
  return (
    <View style={[styles.card, { borderTopColor: t.accent }]}>
      <View style={styles.cardHead}>
        <Text style={styles.emoji}>{t.emoji}</Text>
        <Text style={styles.name}>{t.name}</Text>
        <View style={styles.riskWrap}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={[styles.riskDot, i <= t.ownerRisk && styles.riskOn]} />
          ))}
        </View>
      </View>
      <Text style={styles.summary}>{summarizeOffer(offer)}</Text>
      <Text style={styles.meta}>{offer.tenure} · available {offer.availableFrom}</Text>

      {state === 'apply' && (
        <TouchableOpacity style={styles.applyBtn} onPress={apply} activeOpacity={0.85}>
          <Text style={styles.applyText}>Apply for this lease</Text>
          <Ionicons name="arrow-forward" size={15} color="#fff" />
        </TouchableOpacity>
      )}
      {state === 'applied' && (
        <View style={styles.appliedTag}>
          <Ionicons name="time" size={15} color={G.a3} />
          <Text style={styles.appliedText}>Applied — awaiting owner</Text>
        </View>
      )}
      {state === 'sign' && (
        <TouchableOpacity style={styles.signBtn} onPress={sign} activeOpacity={0.85}>
          <Ionicons name="create" size={15} color="#fff" />
          <Text style={styles.applyText}>Owner approved — Sign agreement</Text>
        </TouchableOpacity>
      )}
      {state === 'active' && (
        <View style={styles.activeTag}>
          <Ionicons name="checkmark-done-circle" size={16} color={G.g3} />
          <Text style={styles.activeText}>Active lease</Text>
        </View>
      )}
    </View>
  );
}

export const LeaseOptionsSection = React.memo(({ landId, landTitle, ownerId, ownerName }: Props) => {
  const navigation = useNavigation<any>();
  const { getOffersByLand, applyForLease, getRequestsForFarmer, agreements, activeLeases } = useLeases();
  const { user } = useAuth();

  const offers = getOffersByLand(landId);
  const farmerId = user?.id || 'farmer-demo';
  const myRequests = getRequestsForFarmer(farmerId);

  // Single-user demo: match by offer so the lifecycle survives role-switching.
  const stateFor = useMemo(
    () =>
      (offer: LeaseOffer): OfferState => {
        if (activeLeases.some(l => l.offerId === offer.id)) return 'active';
        const ag = agreements.find(a => a.offerId === offer.id);
        if (ag && ag.status === 'active') return 'active';
        if (ag && !ag.farmerSigned) return 'sign';
        if (myRequests.some(r => r.offerId === offer.id && r.status === 'pending')) return 'applied';
        return 'apply';
      },
    [activeLeases, agreements, myRequests],
  );

  const onApply = useCallback(
    (offer: LeaseOffer) => {
      const t = LEASE_TYPE_MAP[offer.typeId];
      Alert.alert('Apply for this lease?', `${t.name}\n${summarizeOffer(offer)}`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send application',
          onPress: () => {
            applyForLease({ offer, landTitle, farmerId, farmerName: user?.name || 'Farmer', ownerId, ownerName });
            Alert.alert('Application sent ✓', 'The owner will review and respond. Track it in My Leases.');
          },
        },
      ]);
    },
    [applyForLease, landTitle, farmerId, user?.name, ownerId, ownerName],
  );

  const onSign = useCallback(
    (offer: LeaseOffer) => {
      const ag = agreements.find(a => a.offerId === offer.id);
      if (ag) navigation.navigate('AgreementSign', { agreementId: ag.id });
    },
    [agreements, navigation],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Ionicons name="document-text" size={17} color={G.g3} />
        <Text style={styles.title}>Lease options</Text>
        {offers.length > 0 && <Text style={styles.count}>{offers.length} available</Text>}
      </View>
      {offers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            The owner hasn’t added lease offers for this land yet. Tap “Contact Owner” to ask.
          </Text>
        </View>
      ) : (
        offers.map(o => <OfferCard key={o.id} offer={o} state={stateFor(o)} onApply={onApply} onSign={onSign} />)
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '800', color: G.n1 },
  count: { marginLeft: 'auto', fontSize: 11, fontWeight: '700', color: G.g3 },
  emptyCard: { backgroundColor: G.n8, borderRadius: 12, padding: 14 },
  emptyText: { fontSize: 12, color: G.n4, lineHeight: 18 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderTopWidth: 3, borderRadius: 14, padding: 13, marginBottom: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 20 },
  name: { fontSize: 14, fontWeight: '800', color: G.n2 },
  riskWrap: { flexDirection: 'row', gap: 3, marginLeft: 'auto', alignItems: 'center' },
  riskDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: G.n7 },
  riskOn: { backgroundColor: '#E09830' },
  summary: { fontSize: 13, color: G.n2, fontWeight: '600', marginTop: 8 },
  meta: { fontSize: 11, color: G.n4, marginTop: 3 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: G.g2, borderRadius: 10, paddingVertical: 11, marginTop: 11 },
  signBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: G.g3, borderRadius: 10, paddingVertical: 11, marginTop: 11 },
  applyText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  appliedTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: G.a7, borderRadius: 10, paddingVertical: 10, justifyContent: 'center', marginTop: 11 },
  appliedText: { color: G.a3, fontSize: 12, fontWeight: '700' },
  activeTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: G.g7, borderRadius: 10, paddingVertical: 10, justifyContent: 'center', marginTop: 11 },
  activeText: { color: G.g2, fontSize: 12, fontWeight: '800' },
});
