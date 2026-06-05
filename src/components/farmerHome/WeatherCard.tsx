import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = {
  temperatureC: number;
  conditionLabel: string;
  descriptionLabel: string;
  locationLabel: string;
  humidityPct: number;
  windKmh: number;
  forecast: Array<{ id: string; day: string; icon: 'sunny' | 'rainy'; tempC: number }>;
};

export function WeatherCard({
  temperatureC,
  conditionLabel,
  descriptionLabel,
  locationLabel,
  humidityPct,
  windKmh,
  forecast,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Weather Forecast</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.softBlue} />
          <Text style={styles.locationText}>{locationLabel}</Text>
        </View>
      </View>

      <View style={styles.topRow}>
        <View style={styles.tempGroup}>
          <Text style={styles.tempText}>{temperatureC}°</Text>
          <Text style={styles.cText}>C</Text>
        </View>
        <View style={styles.conditionGroup}>
          <Text style={styles.conditionText}>{conditionLabel}</Text>
          <Text style={styles.descText}>{descriptionLabel}</Text>
        </View>
        <Ionicons name="sunny-outline" size={52} color={colors.surface} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Ionicons name="water-outline" size={16} color={colors.surface} />
          <Text style={styles.metricLabel}>HUMIDITY</Text>
          <Text style={styles.metricValue}>{humidityPct}%</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Ionicons name="speedometer-outline" size={16} color={colors.surface} />
          <Text style={styles.metricLabel}>WIND</Text>
          <Text style={styles.metricValue}>{windKmh} km/h</Text>
        </View>
      </View>

      <View style={styles.forecastRow}>
        {forecast.slice(0, 3).map((f) => (
          <View key={f.id} style={styles.forecastItem}>
            <Text style={styles.forecastDay}>{f.day}</Text>
            <Ionicons
              name={f.icon === 'rainy' ? 'rainy-outline' : 'sunny-outline'}
              size={18}
              color={colors.surface}
            />
            <Text style={styles.forecastTemp}>{f.tempC}°C</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.info,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.surface,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.softBlue,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  tempGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempText: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
    color: colors.surface,
  },
  cText: {
    marginTop: 8,
    marginLeft: 2,
    fontSize: 18,
    fontWeight: '900',
    color: colors.surface,
  },
  conditionGroup: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.sm,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.surface,
  },
  descText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.softBlue,
  },
  metricsRow: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: spacing.md,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: colors.softBlue,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.surface,
  },
  forecastRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  forecastDay: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.softBlue,
  },
  forecastTemp: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.surface,
  },
});

