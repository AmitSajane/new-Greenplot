import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { km, KM_HEADER_GRADIENT } from '../kisanMitra.styles';

interface Props {
  statusText: string;
  languageLabel: string;
  onBack: () => void;
  onLangPress: () => void;
}

export const ChatHeader = React.memo(({ statusText, languageLabel, onBack, onLangPress }: Props) => (
  <LinearGradient colors={KM_HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
    <SafeAreaView edges={['top']}>
      <View style={km.header}>
        <View style={km.headerRow}>
          <TouchableOpacity onPress={onBack} hitSlop={8} style={km.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={km.botAvatar}>
            <Text style={km.botAvatarEmoji}>🌱</Text>
            <View style={km.online} />
          </View>
          <View>
            <Text style={km.botName}>Kisan Mitra</Text>
            <View style={km.botStatus}>
              <Ionicons name="ellipse" size={7} color="#4ADE80" />
              <Text style={km.botStatusText}>{statusText}</Text>
            </View>
          </View>
          <TouchableOpacity style={km.langChip} onPress={onLangPress} activeOpacity={0.8}>
            <Ionicons name="language" size={13} color="#fff" />
            <Text style={km.langChipText}>{languageLabel}</Text>
            <Ionicons name="chevron-down" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </LinearGradient>
));
