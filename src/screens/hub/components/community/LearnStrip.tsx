import React, { useCallback } from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { Guide } from '../../constants/communityData';
import { SectionHeader } from './SectionHeader';

interface CardProps {
  item: Guide;
  onPress: (id: string, title: string) => void;
}

const GuideCard = React.memo(({ item, onPress }: CardProps) => {
  const handlePress = useCallback(() => onPress(item.id, item.title), [onPress, item.id, item.title]);
  return (
    <TouchableOpacity style={s.learn} activeOpacity={0.9} onPress={handlePress}>
      <ImageBackground source={{ uri: item.image }} style={s.learnImg} resizeMode="cover">
        <Text style={s.learnTag}>{item.tag}</Text>
      </ImageBackground>
      <View style={s.learnBody}>
        <Text style={s.learnTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={s.learnMeta}>
          <Ionicons name="time-outline" size={10} color="#6B8074" />
          <Text style={s.learnMetaText}>{item.readMins} min read</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

interface Props {
  guides: readonly Guide[];
  onPress: (id: string, title: string) => void;
  onSeeAll: () => void;
}

/** Learn & grow — curated concept guides (vermicompost, drip, organic). */
export const LearnStrip = React.memo(({ guides, onPress, onSeeAll }: Props) => (
  <View style={s.section}>
    <SectionHeader icon="school" title="Learn & grow" link="All guides ›" onLink={onSeeAll} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.learnContent}>
      {guides.map(g => (
        <GuideCard key={g.id} item={g} onPress={onPress} />
      ))}
    </ScrollView>
  </View>
));
