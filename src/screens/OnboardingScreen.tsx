import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import { colors, radius, spacing, shadow } from '../theme/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {/* <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
            }}
            style={styles.heroImage}
          /> */}
          <Image style={styles.heroImage} source={require('../assets/images/no-Land-No-Problem.png') } />
          <Text style={styles.heroTitle}>Discover Your Perfect Farmland</Text>
          <Text style={styles.heroSubtitle}>
            Easily search, filter, and find land to rent or buy.
          </Text>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How will you use the app?</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.card}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🗺️</Text>
            </View>
            <Text style={styles.cardTitle}>Looking to Buy/Rent Land</Text>
          </View>
          
          <Text style={styles.cardSubtitle}>
            Find, lease, or purchase agricultural land.
          </Text>
          <Text style={styles.cardSubtitleHindi}>
            जमीन खरीदने या किराए पर लेने के लिए
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.card, styles.cardAlt]}
          onPress={() => navigation.navigate('Register')}
        >
           <View style={styles.iconRow}>
          <View style={[styles.iconCircle, styles.iconCircleAlt]}>
            <Text style={styles.iconText}>🚜</Text>
          </View>
           <Text style={styles.cardTitle}>Listing Land / Managing Farms</Text>
          </View>
         
          <Text style={styles.cardSubtitle}>
            List property for sale/lease or manage farm operations.
          </Text>
          <Text style={styles.cardSubtitleHindi}>
            भूमि सूचीबद्ध करने या खेतों का प्रबंधन करने के लिए
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadow.card,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    resizeMode:'contain'
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    // padding: spacing.xl,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  cardAlt: {
    backgroundColor: colors.softOrange,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  iconCircleAlt: {
    backgroundColor: '#FFE9DC',
  },
  iconText: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardSubtitleHindi: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});



