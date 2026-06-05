import React from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WeatherCard } from '../../../components/hub/WeatherCard';
import { MandiPricesCard } from '../../../components/hub/MandiPricesCard';
import { SectionHeader } from '../../../components/hub/SectionHeader';
import { NewsCard } from '../../../components/hub/NewsCard';
import { TechniqueCard } from '../../../components/hub/TechniqueCard';
import { QuestionCard } from '../../../components/hub/QuestionCard';
import { HubViewModel } from '../hooks/useHub';
import { hubStyles as styles } from '../styles/hub.styles';

export const HubContent: React.FC<HubViewModel> = (vm) => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>My Farm</Text>
        <Text style={styles.screenSubtitle}>Updates for your farm</Text>
      </View>
      <WeatherCard
        location="Ludhiana, Punjab"
        temperatureC={32}
        condition="Sunny"
        todayLabel="Today"
        cropAdvisory="Good for Wheat"
        onAskExpertPress={vm.onCreatePost}
      />
      <MandiPricesCard
        mandiName="Azadpur Mandi"
        updatedLabel="Updated · 2h ago"
        prices={vm.mandiPrices}
        onFilterByCropPress={vm.onFilterByCrop}
      />
      <SectionHeader title="Latest News" onPressAction={vm.onNewsSeeAll} />
      <FlatList
        data={vm.featuredNews}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsCard item={item} onPress={() => vm.onNewsPress(item.id, item.title)} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
      <SectionHeader title="Modern Farming Tech" onPressAction={vm.onTechSeeAll} />
      <TechniqueCard
        item={vm.primaryTechnique}
        onPress={vm.onTechSeeAll}
        containerStyle={styles.techCard}
      />
      <SectionHeader title="Community Questions" onPressAction={vm.onCommunitySeeAll} />
      {vm.featuredQuestions.map((q) => (
        <View key={q.id} style={styles.questionWrapper}>
          <QuestionCard item={q} onPress={() => vm.onQuestionPress(q.id)} />
        </View>
      ))}
      <TouchableOpacity activeOpacity={0.9} style={styles.createPostButton} onPress={vm.onCreatePost}>
        <Text style={styles.createPostText}>Create Post ▸</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.seeMoreButton} activeOpacity={0.8} onPress={vm.onCommunitySeeAll}>
        <Text style={styles.seeMoreText}>See more discussions</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);
