import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { OwnerHomeStackParamList } from '../../navigation/OwnerHomeStack';

type NavigationProp = NativeStackNavigationProp<OwnerHomeStackParamList>;
type ParamList = { LandSubmitted: { propertyId: string } };

export default function LandSubmittedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<ParamList, 'LandSubmitted'>>();
  const { propertyId } = route.params;

  // Works whether this screen was reached from the Home tab or the My
  // Properties tab — same tab-hop used by useOwnerHome's `openProperty`.
  const onViewLand = useCallback(() => {
    (navigation as unknown as { getParent?: () => { navigate: (n: string, p?: object) => void } })
      .getParent?.()
      ?.navigate('MyProperties', { screen: 'PropertyDetails', params: { propertyId }, initial: false });
  }, [navigation, propertyId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Land Submitted"
        onBack={() => navigation.popToTop()}
        buttonBackgroundColor="transparent"
        backgroundColor={colors.background}
        titleWeight="700"
      />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="time" size={40} color={colors.warning} />
        </View>
        <Text style={styles.heading}>Land Submitted</Text>
        <View style={styles.statusChip}>
          <Text style={styles.statusChipText}>Under Verification</Text>
        </View>
        <Text style={styles.message}>
          Your land has been submitted to AgriArambh for verification.
        </Text>
        <Text style={styles.secondary}>
          Once your land is verified, it may become available for Farm Management.
        </Text>

        <TouchableOpacity style={styles.cta} onPress={onViewLand} activeOpacity={0.85}>
          <Text style={styles.ctaText}>View Land</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.softOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusChip: {
    backgroundColor: colors.softOrange,
    borderRadius: radius.pill ?? 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.lg,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  message: {
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  secondary: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#4ADE80',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    ...shadow.card,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
