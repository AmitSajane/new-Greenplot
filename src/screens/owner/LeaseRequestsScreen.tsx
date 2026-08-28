import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLeases, LeaseRequest } from '../../context/LeaseContext';
import { useFarmListings } from '../../context/FarmListingsContext';
import { profilesApi, FarmerProfile } from '../../services/profilesApi';
import { LEASE_TYPE_MAP } from '../../constants/leaseTypes';
import { colors } from '../../theme/tokens';

const G = colors.deepGreen;

interface FarmerSnapshot {
  farmerLocation: string;
  activeLeaseCount: number;
  totalAcres: number;
}

function RequestCard({
  req,
  snapshot,
  onRespond,
  onView,
}: {
  req: LeaseRequest;
  snapshot?: FarmerSnapshot;
  onRespond: (id: string, ok: boolean) => void;
  onView?: () => void;
}) {
  const t = LEASE_TYPE_MAP[req.typeId];
  const pending = req.status === 'pending';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{req.farmerName.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.farmer}>{req.farmerName}</Text>
          <Text style={styles.land}>wants to lease · {req.landTitle}</Text>
        </View>
        {!pending && (
          <Text style={[styles.badge, req.status === 'accepted' ? styles.badgeOk : styles.badgeNo]}>
            {req.status === 'accepted' ? 'Approved' : 'Rejected'}
          </Text>
        )}
      </View>
      {pending && snapshot && (
        <View style={styles.snapshot}>
          <View style={styles.snapRow}>
            <Ionicons name="location-outline" size={13} color={G.n4} />
            <Text style={styles.snapText}>
              Farmer's location: {snapshot.farmerLocation}
            </Text>
          </View>
          <View style={styles.snapRow}>
            <Ionicons name="leaf-outline" size={13} color={G.n4} />
            <Text style={styles.snapText}>
              {snapshot.activeLeaseCount === 0
                ? 'No other active leases'
                : `${snapshot.activeLeaseCount} active lease${snapshot.activeLeaseCount === 1 ? '' : 's'} · ${snapshot.totalAcres} acres total`}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.offerBox}>
        <Text style={styles.offerType}>{t.emoji} {t.name}</Text>
        <Text style={styles.offerTerms}>{req.termsSummary}</Text>
      </View>
      {!!req.message && <Text style={styles.message}>“{req.message}”</Text>}
      {pending && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => onRespond(req.id, false)} activeOpacity={0.85}>
            <Ionicons name="close" size={16} color={G.r2} />
            <Text style={[styles.btnText, styles.rejectText]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => onRespond(req.id, true)} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={[styles.btnText, styles.approveText]}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
      {!pending && req.status === 'accepted' && onView && (
        <TouchableOpacity style={styles.viewRow} onPress={onView} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={14} color={G.g3} />
          <Text style={styles.viewText}>View agreement</Text>
          <Ionicons name="chevron-forward" size={14} color={G.g3} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function LeaseRequestsScreen() {
  const navigation = useNavigation();
  // Single-owner demo: show all requests. With Supabase auth + RLS this filters by owner.
  const { requests, agreements, activeLeases, approveRequest, rejectRequest } = useLeases();
  const { listings } = useFarmListings();
  const viewAgreement = useCallback(
    (requestId: string) => {
      const ag = agreements.find(a => a.requestId === requestId);
      if (ag) (navigation as { navigate: (n: string, p?: object) => void }).navigate('AgreementSign', { agreementId: ag.id });
    },
    [agreements, navigation],
  );
  const onRespond = useCallback(
    (id: string, ok: boolean) => {
      if (ok) {
        // Awaited: approving now locks the land and auto-rejects every other
        // pending request for it, atomically — if this request lost that
        // race (already decided, or the land was taken a moment ago), the
        // owner needs to see that instead of a false "Approved" message.
        approveRequest(id)
          .then(() => {
            Alert.alert('Approved & signed ✓', 'You have signed the agreement. It now goes to the farmer to sign — once they do, the lease becomes active.');
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Could not approve this request.';
            Alert.alert("Couldn't approve", message);
          });
      } else {
        rejectRequest(id);
      }
    },
    [approveRequest, rejectRequest],
  );

  const pending = requests.filter(r => r.status === 'pending');
  const responded = requests.filter(r => r.status !== 'pending');

  // Farmer context: fetch saved profile (for location) for whichever farmers
  // currently have a pending request, so the owner can see it before deciding.
  const [farmerProfiles, setFarmerProfiles] = useState<Record<string, FarmerProfile>>({});
  const pendingFarmerIds = useMemo(() => [...new Set(pending.map(r => r.farmerId))], [pending]);
  useEffect(() => {
    if (pendingFarmerIds.length === 0) return;
    profilesApi.fetchFarmersByIds(pendingFarmerIds).then(profiles => {
      setFarmerProfiles(prev => {
        const next = { ...prev };
        profiles.forEach(p => { next[p.id] = p; });
        return next;
      });
    });
  }, [pendingFarmerIds]);

  const landById = useMemo(() => new Map(listings.map(l => [l.id, l])), [listings]);
  const locationOf = useCallback(
    (loc?: string, district?: string, state?: string) =>
      [loc, district, state].filter(Boolean).join(', ') || 'Location not provided',
    [],
  );

  const snapshotFor = useCallback(
    (req: LeaseRequest): FarmerSnapshot => {
      const profile = farmerProfiles[req.farmerId];
      const farmerActiveLeases = activeLeases.filter(l => l.farmerId === req.farmerId);
      const totalAcres = farmerActiveLeases.reduce((sum, l) => {
        const leaseLand = landById.get(l.landId);
        return sum + (leaseLand ? parseFloat(leaseLand.acres) || 0 : 0);
      }, 0);
      return {
        farmerLocation: profile ? locationOf(profile.location, profile.district, profile.state) : 'Loading…',
        activeLeaseCount: farmerActiveLeases.length,
        totalAcres,
      };
    },
    [farmerProfiles, landById, activeLeases, locationOf],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lease Requests</Text>
        {pending.length > 0 && <Text style={styles.headerCount}>{pending.length} new</Text>}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {requests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={40} color="#C8D8CC" />
            <Text style={styles.emptyText}>No lease requests yet. They’ll appear here when farmers apply to your lands.</Text>
          </View>
        ) : (
          <>
            {pending.length > 0 && <Text style={styles.sectionLabel}>Pending your review</Text>}
            {pending.map(r => <RequestCard key={r.id} req={r} snapshot={snapshotFor(r)} onRespond={onRespond} />)}
            {responded.length > 0 && <Text style={styles.sectionLabel}>Responded</Text>}
            {responded.map(r => (
              <RequestCard key={r.id} req={r} onRespond={onRespond} onView={() => viewAgreement(r.id)} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.n8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: G.g2, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerCount: { marginLeft: 'auto', backgroundColor: '#E09830', color: '#fff', fontSize: 11, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, overflow: 'hidden' },
  scroll: { padding: 14, paddingBottom: 30 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: G.n4, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9, marginTop: 6 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 14, padding: 13, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: G.g7, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: G.g2 },
  farmer: { fontSize: 14, fontWeight: '800', color: G.n2 },
  land: { fontSize: 11, color: G.n4, marginTop: 1 },
  badge: { fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, overflow: 'hidden' },
  badgeOk: { backgroundColor: G.g7, color: G.g2 },
  badgeNo: { backgroundColor: G.r5, color: G.r2 },
  snapshot: { backgroundColor: G.n8, borderRadius: 10, padding: 10, marginTop: 10, gap: 6 },
  snapRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  snapText: { flex: 1, fontSize: 11, color: G.n4, fontWeight: '600' },
  offerBox: { backgroundColor: G.n8, borderRadius: 10, padding: 10, marginTop: 10 },
  offerType: { fontSize: 13, fontWeight: '700', color: G.n2 },
  offerTerms: { fontSize: 12, color: G.n4, marginTop: 2 },
  message: { fontSize: 12, color: G.n4, fontStyle: 'italic', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10, paddingVertical: 11 },
  reject: { backgroundColor: G.r5 },
  approve: { backgroundColor: G.g2 },
  btnText: { fontSize: 13, fontWeight: '800' },
  rejectText: { color: G.r2 },
  approveText: { color: '#fff' },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: G.n8 },
  viewText: { flex: 1, fontSize: 12, fontWeight: '700', color: G.g3 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyText: { fontSize: 12, color: G.n4, textAlign: 'center', lineHeight: 18, paddingHorizontal: 30 },
});
