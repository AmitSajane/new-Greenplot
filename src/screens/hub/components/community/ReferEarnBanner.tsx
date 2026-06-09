import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';

interface Props {
  coinsPerInvite: number;
  onRefer: () => void;
}

/** Refer & Earn — viral farmer-to-farmer acquisition via the native share sheet. */
export const ReferEarnBanner = React.memo(({ coinsPerInvite, onRefer }: Props) => (
  <View style={s.refer}>
    <LinearGradient colors={['#1A6B3A', '#0F4A28']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={s.referInner}>
        <View style={s.referIcon}>
          <Ionicons name="gift" size={24} color="#fff" />
        </View>
        <View style={s.flex1}>
          <Text style={s.referTitle}>Invite a farmer, earn {coinsPerInvite} 🪙</Text>
          <Text style={s.referSub}>They get help, you get coins. Everyone grows.</Text>
        </View>
        <TouchableOpacity style={s.referBtn} activeOpacity={0.85} onPress={onRefer}>
          <Text style={s.referBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
));
