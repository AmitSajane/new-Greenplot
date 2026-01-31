import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

const DUMMY_TENANTS = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    phone: '+91 9876543210',
    propertyName: 'Ramgarh Plot A',
    area: '2.5 Acres',
    monthlyRent: '₹15,000',
    status: 'Active',
    leaseStart: 'Jan 2024',
    leaseEnd: 'Dec 2024',
  },
  {
    id: '2',
    name: 'Amit Singh',
    phone: '+91 9876543212',
    propertyName: 'Barkakana Land',
    area: '8 Acres',
    monthlyRent: '₹40,000',
    status: 'Active',
    leaseStart: 'Mar 2024',
    leaseEnd: 'Feb 2025',
  },
  {
    id: '3',
    name: 'Suresh Patel',
    phone: '+91 9876543213',
    propertyName: 'Hehal Farm',
    area: '5 Acres',
    monthlyRent: '₹25,000',
    status: 'Pending',
    leaseStart: 'May 2024',
    leaseEnd: 'Apr 2025',
  },
];

export default function TenantsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tenants</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DUMMY_TENANTS.map((tenant) => (
          <View key={tenant.id} style={styles.tenantCard}>
            <View style={styles.tenantHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {tenant.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Text>
              </View>
              <View style={styles.tenantInfo}>
                <Text style={styles.tenantName}>{tenant.name}</Text>
                <Text style={styles.tenantPhone}>{tenant.phone}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  tenant.status === 'Active'
                    ? styles.statusActive
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    tenant.status === 'Active'
                      ? styles.statusTextActive
                      : styles.statusTextPending,
                  ]}
                >
                  {tenant.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.tenantDetails}>
              <View style={styles.detailRow}>
                <Icon name="home" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{tenant.propertyName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="straighten" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>{tenant.area}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="attach-money" size={18} color={colors.textSecondary} />
                {/* <Text style={styles.detailText}>{tenant.monthlyRent}/month</Text> */}
              </View>
              <View style={styles.detailRow}>
                <Icon name="event" size={18} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {tenant.leaseStart} - {tenant.leaseEnd}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="phone" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="message" size={20} color={colors.primary} />
                <Text style={styles.actionText}>Message</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    // backgroundColor: colors.surface,
    // borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.xl,
  },
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
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.surface,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tenantPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusActive: {
    backgroundColor: colors.softGreen,
  },
  statusPending: {
    backgroundColor: colors.softOrange,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  tenantDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
