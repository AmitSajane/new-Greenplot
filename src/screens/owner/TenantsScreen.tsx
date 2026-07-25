import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';
import { profilesApi, FarmerProfile } from '../../services/profilesApi';
import { isSupabaseConfigured } from '../../services/supabase';

const initials = (name: string) =>
  name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase();

/** Open the dialer / WhatsApp for a farmer's number (+91). */
function callNumber(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  Linking.openURL(`tel:+91${digits}`).catch(() => Alert.alert('Call', 'Unable to open the dialer.'));
}
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  const app = `whatsapp://send?phone=91${digits}`;
  const web = `https://wa.me/91${digits}`;
  Linking.canOpenURL(app).then(ok => Linking.openURL(ok ? app : web)).catch(() => Linking.openURL(web));
}

export default function TenantsScreen() {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const load = useCallback(async (signal?: AbortSignal) => {
    const list = await profilesApi.fetchFarmers(signal);
    setFarmers(list);
    setLoading(false);
  }, []);

  // Live: load farmers once, refresh on any profile change.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const c = new AbortController();
    load(c.signal);
    const unsub = profilesApi.subscribe(() => load());
    return () => {
      c.abort();
      unsub();
    };
  }, [load]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tenants &amp; Farmers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Farmers directory (real, from onboarding) */}
        <Text style={styles.sectionTitle}>Farmers on GreenPlot</Text>
        <Text style={styles.sectionHint}>Connect with farmers looking for land — call or message on WhatsApp.</Text>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : farmers.length === 0 ? (
          <View style={styles.center}>
            <Icon name="people-outline" size={44} color="#9EB8A8" />
            <Text style={styles.emptyText}>No farmers have joined yet.</Text>
            <Text style={styles.emptySub}>As farmers onboard, they'll appear here to contact.</Text>
          </View>
        ) : (
          farmers.map(f => (
            <View key={f.id} style={styles.tenantCard}>
              <View style={styles.tenantHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{initials(f.name)}</Text></View>
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName}>{f.name}</Text>
                  <Text style={styles.tenantPhone}>+91 {f.phone}</Text>
                </View>
                <View style={[styles.statusBadge, styles.statusActive]}>
                  <Text style={[styles.statusText, styles.statusTextActive]}>Farmer</Text>
                </View>
              </View>

              {!!f.location && (
                <View style={styles.detailRow}>
                  <Icon name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{f.location}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => callNumber(f.phone)} activeOpacity={0.8}>
                  <Icon name="call" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
                {f.hasWhatsapp && (
                  <TouchableOpacity style={[styles.actionButton, styles.waButton]} onPress={() => whatsappNumber(f.phone)} activeOpacity={0.8}>
                    <Icon name="logo-whatsapp" size={18} color="#fff" />
                    <Text style={[styles.actionText, styles.waText]}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md, borderBottomColor: colors.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  scrollContent: { padding: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  sectionHint: { fontSize: 13, color: colors.textSecondary, marginBottom: 14 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

  tenantCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  tenantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.surface },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  tenantPhone: { fontSize: 14, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusActive: { backgroundColor: colors.softGreen },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextActive: { color: colors.success },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  detailText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  waButton: { backgroundColor: '#25D366', borderColor: '#25D366' },
  waText: { color: '#fff' },
});
