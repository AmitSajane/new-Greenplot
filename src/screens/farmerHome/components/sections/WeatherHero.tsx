import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s } from '../../styles/farmerHome.styles';
import { WeatherInfo } from '../../constants/farmerDashboardData';

interface Props {
  weather: WeatherInfo | null;
  loading?: boolean;
  location?: string;
  onPress: () => void;
}

function WeatherHeroBase({ weather, loading, location, onPress }: Props) {
  if (!weather) {
    return (
      <TouchableOpacity style={s.weather} activeOpacity={0.9} onPress={onPress}>
        <View style={s.weatherMain}>
          <Text style={s.wEmoji}>🌤</Text>
          <View style={s.flex1}>
            <Text style={s.wTemp}>--°</Text>
            <Text style={s.wCond}>{loading ? 'Loading weather' : 'Weather unavailable'}</Text>
            <Text style={s.wDesc}>{location || 'Add a location to see live weather'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={s.weather} activeOpacity={0.9} onPress={onPress}>
      <View style={s.weatherMain}>
        <Text style={s.wEmoji}>{weather.emoji}</Text>
        <View>
          <Text style={s.wTemp}>{weather.tempC}°</Text>
          <Text style={s.wCond}>{weather.condition}</Text>
          <Text style={s.wDesc}>{weather.advice}</Text>
        </View>
        <View style={s.wMeta}>
          <Text style={s.wMetaText}>💧 {weather.humidityPct}% humidity</Text>
          <Text style={s.wMetaText}>🌬 {weather.windKmh} km/h wind</Text>
          <Text style={s.wMetaText}>{weather.location}</Text>
        </View>
      </View>
      {weather.forecast.length ? (
        <View style={s.wForecast}>
          {weather.forecast.map((f, i) => (
            <View key={f.id} style={[s.wfCell, i === weather.forecast.length - 1 && s.noRightBorder]}>
              <Text style={s.wfDay}>{f.day}</Text>
              <Text style={s.wfTemp}>
                {f.emoji} {f.temp}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={s.wAdvisory}>
        <Ionicons name="leaf" size={14} color="#1A6B3A" />
        <Text style={s.wAdvisoryText}>{weather.advisory}</Text>
      </View>
    </TouchableOpacity>
  );
}

export const WeatherHero = React.memo(WeatherHeroBase);
