import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { colors, spacing, radius } from '../theme/tokens';
import { fetchSoilData } from '../services/soilService';
import { SoilResponse } from '../types/soil';

import { Text } from '../components/atoms/Text';
import { Loader } from '../components/atoms/Loader';
import { Button } from '../components/atoms/Button';
import { MapSection } from '../components/organisms/MapSection';
import { SoilSummaryCard } from '../components/organisms/SoilSummaryCard';
import { SoilDetailsSection } from '../components/organisms/SoilDetailsSection';

export default function SoilTestScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SoilResponse | null>(null);

  // Mock location based on the cURL coordinates
  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, use Geolocation API here
      const lat = 16.591018669999993;
      const lon = 74.91707610999997;
      
      const soilData = await fetchSoilData(lat, lon);
      setData(soilData);
    } catch (err) {
      setError('Failed to fetch soil data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const soilData = await fetchSoilData(lat, lon);
      setData(soilData);
    } catch (err) {
      setError('Failed to fetch soil data for selected location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Optionally fetch immediately or wait for user to press button.
  // The design shows the location button on the map, so let's fetch on mount
  // to match the populated UI in the screenshot.
  useEffect(() => {
    handleGetLocation();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text variant="h2" weight="900" color={colors.primaryDark}>{t('soilTest.title')}</Text>
          <Text variant="caption" weight="600" color={colors.textSecondary}>{t('soilTest.subtitle')}</Text>
        </View>
        
        <Image 
          source={{ uri: 'https://i.pravatar.cc/100?img=11' }} 
          style={styles.profileImage} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Loader message={t('soilTest.analyzing')} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text color={colors.danger}>{t('soilTest.error')}</Text>
            <Button label={t('soilTest.retry')} onPress={handleGetLocation} style={styles.retryButton} />
          </View>
        ) : data ? (
          <>
            <MapSection 
              location={data.location} 
              onGetLocation={handleGetLocation} 
              onMapPress={handleMapPress}
            />
            
            <SoilSummaryCard 
              soilType={data.soil_type.texture_class} 
            />
            
            <SoilDetailsSection 
              chemical={data.chemical} 
            />
            
            <Button
              label={t('soilTest.viewGuide')}
              variant="brown"
              icon={<Ionicons name="tractor-outline" size={20} color="white" />}
              style={styles.footerButton}
              onPress={() => {}}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light grayish background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
  },
  footerButton: {
    marginTop: spacing.xl,
  },
});
