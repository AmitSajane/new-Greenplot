import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s, HUB_HEADER_GRADIENT } from '../../styles/hub.styles';

interface Stat {
  id: string;
  value: string;
  label: string;
}

interface Props {
  stats: readonly Stat[];
  onSearch: () => void;
  onRewards: () => void;
}

export const HubHeader = React.memo(({ stats, onSearch, onRewards }: Props) => (
  <LinearGradient colors={HUB_HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <View style={s.header}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.hdrSub}>GreenPlot Community</Text>
          <Text style={s.hdrTitle}>Kisan Community 🌱</Text>
        </View>
        <View style={s.hdrActions}>
          <TouchableOpacity style={s.hBtn} onPress={onSearch} activeOpacity={0.8} hitSlop={6}>
            <Ionicons name="search" size={17} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.hBtn} onPress={onRewards} activeOpacity={0.8} hitSlop={6}>
            <Ionicons name="trophy" size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.cstat}>
        {stats.map((st, i) => (
          <View key={st.id} style={[s.cs, i === stats.length - 1 && s.csLast]}>
            <Text style={s.csV}>{st.value}</Text>
            <Text style={s.csL}>{st.label}</Text>
          </View>
        ))}
      </View>
    </View>
  </LinearGradient>
));
