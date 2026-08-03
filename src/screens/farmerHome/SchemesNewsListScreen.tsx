import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmerHomeStackParamList } from '../../navigation/FarmerHomeStack';
import { NewsRow } from './components/sections';
import { StatePickerModal } from './components/StatePickerModal';
import { farmerHomeStyles as s, tones } from './styles/farmerHome.styles';
import { FarmerAction, NewsItem } from './constants/farmerDashboardData';
import {
  CENTRAL_SCHEMES,
  CREDIT_SCHEMES,
  DEFAULT_STATE_KEY,
  SCHEME_CATEGORY_LABEL,
  SchemeCategory,
  SchemeLink,
  STATE_SCHEMES,
} from './constants/schemeCatalog';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import { colors } from '../../theme/tokens';

type NavigationProp = NativeStackNavigationProp<FarmerHomeStackParamList, 'SchemesNewsList'>;
type ScreenRouteProp = RouteProp<FarmerHomeStackParamList, 'SchemesNewsList'>;

/** Minimal shape we need from the parent tab navigator for cross-tab routing. */
type ParentNav = { navigate: (name: string, params?: object) => void };

type ListTab = 'schemes' | 'news';
type CatFilter = SchemeCategory | 'all';

function SchemeLinkRow({ item, isLast, onPress }: { item: SchemeLink; isLast: boolean; onPress: (item: SchemeLink) => void }) {
  const t = tones[item.tone];
  return (
    <TouchableOpacity
      style={[s.slink, isLast && s.noBottomBorder]}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      <View style={[s.slinkIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={item.icon} size={15} color={t.fg} />
      </View>
      <View style={s.flex1}>
        <Text style={s.slinkTitle}>{item.title}</Text>
        <Text style={s.slinkDesc}>{item.desc}</Text>
      </View>
      <Ionicons name="open-outline" size={14} color="#9EB8A8" />
    </TouchableOpacity>
  );
}

function SchemeGroup({ label, items, onPress }: { label: string; items: readonly SchemeLink[]; onPress: (item: SchemeLink) => void }) {
  return (
    <>
      <Text style={s.groupLabel}>{label}</Text>
      <View style={s.card}>
        {items.map((item, i) => (
          <SchemeLinkRow key={item.id} item={item} isLast={i === items.length - 1} onPress={onPress} />
        ))}
      </View>
    </>
  );
}

/**
 * Combined "Schemes & Subsidies" destination — reached via the category tiles
 * or "More" link on the farmer home card. Two tabs: a Schemes directory
 * (Central / State / Loans & Credit, real official links) and the live News
 * feed (same items/behaviour as the old flat list).
 */
export default function SchemesNewsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const newsItems: readonly NewsItem[] = route.params?.items ?? [];

  const [tab, setTab] = useState<ListTab>(route.params?.initialTab ?? 'schemes');
  const [category, setCategory] = useState<CatFilter>(route.params?.initialCategory ?? 'all');
  const [stateKey, setStateKey] = useState(DEFAULT_STATE_KEY);
  const [statePickerOpen, setStatePickerOpen] = useState(false);

  const goTab = useCallback(
    (tabName: string, params?: object) => (navigation.getParent() as ParentNav | undefined)?.navigate(tabName, params),
    [navigation],
  );

  const onOpenArticle = useCallback(
    (url: string, title?: string) => navigation.navigate('Article', { url, title }),
    [navigation],
  );

  const onAction = useCallback(
    (action: FarmerAction) => {
      switch (action) {
        case 'market':
        case 'marketAlert':
          return goTab('Market');
        case 'hub':
          return goTab('Hub');
        default:
          return undefined;
      }
    },
    [goTab],
  );

  const onOpenScheme = useCallback((item: SchemeLink) => {
    Alert.alert(
      'Leaving GreenPlot',
      `You're about to open an official government website in your browser:\n\n${item.url}\n\nScheme: ${item.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open site', onPress: () => Linking.openURL(item.url) },
      ],
    );
  }, []);

  const stateGroup = STATE_SCHEMES[stateKey];

  const schemeGroups: { key: SchemeCategory; label: string; items: readonly SchemeLink[] }[] = useMemo(() => {
    const groups = [
      { key: 'central' as const, label: SCHEME_CATEGORY_LABEL.central, items: CENTRAL_SCHEMES },
      { key: 'state' as const, label: `${SCHEME_CATEGORY_LABEL.state} — ${stateGroup.label}`, items: stateGroup.items },
      { key: 'credit' as const, label: SCHEME_CATEGORY_LABEL.credit, items: CREDIT_SCHEMES },
    ];
    return category === 'all' ? groups : groups.filter(g => g.key === category);
  }, [category, stateGroup]);

  const showStatePicker = category === 'all' || category === 'state';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Schemes & Subsidies"
        onBack={() => navigation.goBack()}
        buttonBackgroundColor="transparent"
        titleColor={colors.deepGreen.n1}
        iconColor="#1C2E18"
        titleSize={15}
        titleWeight="800"
      />

      <View style={s.tabsWrap}>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'schemes' && s.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => setTab('schemes')}
        >
          <Text style={[s.tabBtnText, tab === 'schemes' && s.tabBtnTextActive]}>Schemes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, tab === 'news' && s.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => setTab('news')}
        >
          <Text style={[s.tabBtnText, tab === 'news' && s.tabBtnTextActive]}>News</Text>
        </TouchableOpacity>
      </View>

      {tab === 'schemes' ? (
        <>
          <View style={s.catChipsRow}>
            {(['all', 'central', 'state', 'credit'] as CatFilter[]).map(key => {
              const active = category === key;
              const label = key === 'all' ? 'All' : key === 'central' ? 'Central' : key === 'state' ? 'State' : 'Loans & Credit';
              return (
                <TouchableOpacity
                  key={key}
                  style={[s.catChip, active && s.catChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(key)}
                >
                  <Text style={[s.catChipText, active && s.catChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView contentContainerStyle={styles.schemesContent} showsVerticalScrollIndicator={false}>
            {schemeGroups.map(group =>
              group.key === 'state' ? (
                <React.Fragment key={group.key}>
                  <Text style={s.groupLabel}>{group.label}</Text>
                  {showStatePicker && (
                    <TouchableOpacity style={s.stateTrigger} activeOpacity={0.8} onPress={() => setStatePickerOpen(true)}>
                      <Text style={s.stateTriggerText}>{stateGroup.label}</Text>
                      <Ionicons name="chevron-down" size={16} color="#0F4A28" />
                    </TouchableOpacity>
                  )}
                  <View style={s.card}>
                    {group.items.map((item, i) => (
                      <SchemeLinkRow key={item.id} item={item} isLast={i === group.items.length - 1} onPress={onOpenScheme} />
                    ))}
                  </View>
                </React.Fragment>
              ) : (
                <SchemeGroup key={group.key} label={group.label} items={group.items} onPress={onOpenScheme} />
              ),
            )}
          </ScrollView>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.schemesContent} showsVerticalScrollIndicator={false}>
          <View style={s.liveBadge}>
            <Ionicons name="radio" size={12} color="#1A6B3A" />
            <Text style={s.liveBadgeText}>Live agriculture news & scheme updates</Text>
          </View>
          {newsItems.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No news right now — check back soon.</Text>
            </View>
          ) : (
            <View style={[s.card, styles.newsCardWrapper]}>
              {newsItems.map((item, i) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  isLast={i === newsItems.length - 1}
                  onAction={onAction}
                  onOpenArticle={onOpenArticle}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <StatePickerModal
        visible={statePickerOpen}
        selected={stateKey}
        onSelect={setStateKey}
        onClose={() => setStatePickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  schemesContent: { padding: 14, paddingTop: 4, paddingBottom: 32, flexGrow: 1 },
  newsCardWrapper: { marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 13, color: '#6B8074', textAlign: 'center', paddingHorizontal: 32 },
});
