import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { Spotlight } from '../../constants/communityData';
import { SectionHeader } from './SectionHeader';

interface Props {
  spotlight: Spotlight;
  onPress: () => void;
}

/** Story of the Week — aspirational social proof to pull farmers in. */
export const SpotlightCard = React.memo(({ spotlight, onPress }: Props) => (
  <View style={s.section}>
    <SectionHeader icon="star" title="Story of the week" />
    <TouchableOpacity style={s.spotlight} activeOpacity={0.92} onPress={onPress}>
      <ImageBackground source={{ uri: spotlight.image }} style={s.spotImg} resizeMode="cover">
        <View style={s.spotTagRow}>
          <Text style={s.spotTag}>⭐ FEATURED</Text>
        </View>
        <View style={s.spotEarn}>
          <Ionicons name="cash" size={12} color="#fff" />
          <Text style={s.spotEarnText}>{spotlight.earnedLabel}</Text>
        </View>
      </ImageBackground>
      <View style={s.spotBody}>
        <Text style={s.spotTitle}>{spotlight.title}</Text>
        <Text style={s.spotSummary}>{spotlight.summary}</Text>
        <View style={s.spotMetaRow}>
          <Text style={s.spotAuthor}>
            {spotlight.author} · {spotlight.location}
          </Text>
          <View style={s.spotBtn}>
            <Text style={s.spotBtnText}>Read story</Text>
            <Ionicons name="arrow-forward" size={12} color="#0F4A28" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </View>
));
