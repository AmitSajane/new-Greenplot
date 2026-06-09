import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { KisanReward } from '../../constants/communityData';

interface Props {
  reward: KisanReward;
  onPress: () => void;
}

/** Kisan Rewards — coins + daily streak + level progress. The retention hook. */
export const RewardsStrip = React.memo(({ reward, onPress }: Props) => (
  <TouchableOpacity style={s.reward} activeOpacity={0.9} onPress={onPress}>
    <View style={s.rewardTop}>
      <View style={s.coinBadge}>
        <Text style={s.coinEmoji}>🪙</Text>
      </View>
      <View>
        <Text style={s.coinVal}>{reward.coins.toLocaleString('en-IN')} coins</Text>
        <Text style={s.coinLabel}>Earn coins for posting & helping</Text>
      </View>
      <View style={s.streakPill}>
        <Ionicons name="flame" size={13} color="#C02828" />
        <Text style={s.streakText}>{reward.streakDays}-day streak</Text>
      </View>
    </View>
    <View style={s.levelRow}>
      <Text style={s.levelText}>
        Level {reward.level} · {reward.levelLabel}
      </Text>
      <Text style={s.levelNext}>{reward.progressPct}% to {reward.nextLevelLabel}</Text>
    </View>
    <View style={s.levelTrack}>
      <View style={[s.levelFill, { width: `${reward.progressPct}%` }]} />
    </View>
  </TouchableOpacity>
));
