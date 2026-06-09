import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { farmerHomeStyles as s, FARMER_HEADER_GRADIENT } from '../../styles/farmerHome.styles';

interface Props {
  name: string;
  location: string;
  onAvatar: () => void;
  onLanguage: () => void;
  onNotifications: () => void;
}

function toInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function FarmerHeaderBase({ name, location, onAvatar, onLanguage, onNotifications }: Props) {
  return (
    <LinearGradient colors={FARMER_HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']}>
        <View style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.avatar} onPress={onAvatar} activeOpacity={0.8} hitSlop={6}>
              <Text style={s.avatarText}>{toInitials(name)}</Text>
            </TouchableOpacity>
            <View>
              <Text style={s.hi}>Namaste 🙏</Text>
              <Text style={s.name}>{name}</Text>
              <View style={s.locRow}>
                <Ionicons name="location" size={11} color="rgba(255,255,255,0.55)" />
                <Text style={s.locText}>{location}</Text>
              </View>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity style={s.headerBtn} onPress={onLanguage} activeOpacity={0.8} hitSlop={6}>
                <Text style={s.langText}>हि</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.headerBtn} onPress={onNotifications} activeOpacity={0.8} hitSlop={6}>
                <Ionicons name="notifications" size={17} color="#fff" />
                <View style={s.bellDot} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export const FarmerHeader = React.memo(FarmerHeaderBase);
