/**
 * Mandi price comparison — shows which market pays the most for a commodity in
 * the farmer's state (data.gov.in Agmarknet, free). Top row = best place to sell.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { mandiApi, MandiPrice } from '../services/mandiApi';
import { useAuth } from '../context/AuthContext';
import INDIA_LOCATIONS from '../constants/indiaLocations.json';

const STATES = Object.keys(INDIA_LOCATIONS as Record<string, unknown>).sort();
const POPULAR = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Paddy(Dhan)(Common)', 'Cotton', 'Maize', 'Soyabean'];

export default function MandiPricesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const userState = (user as { state?: string })?.state;

  const [state, setState] = useState(userState && STATES.includes(userState) ? userState : 'Karnataka');
  const [commodity, setCommodity] = useState('Tomato');
  const [rows, setRows] = useState<MandiPrice[]>([]);
  const [commodities, setCommodities] = useState<string[]>(POPULAR);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<null | 'state' | 'commodity'>(null);
  const [search, setSearch] = useState('');

  // Load available commodities for the chosen state.
  useEffect(() => {
    let active = true;
    const c = new AbortController();
    mandiApi.commoditiesForState(state, c.signal).then(list => {
      if (active && list.length) setCommodities(list);
    });
    return () => {
      active = false;
      c.abort();
    };
  }, [state]);

  // Load + compare markets for the selected commodity & state.
  useEffect(() => {
    let active = true;
    const c = new AbortController();
    setLoading(true);
    mandiApi
      .compareMarkets(commodity, state, c.signal)
      .then(list => active && setRows(list))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      c.abort();
    };
  }, [commodity, state]);

  const best = rows[0];
  const pickerData = picker === 'state' ? STATES : commodities;
  const filteredPickerData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pickerData;
    return pickerData.filter(item => item.toLowerCase().includes(q));
  }, [pickerData, search]);
  const onPick = useCallback(
    (val: string) => {
      if (picker === 'state') setState(val);
      else setCommodity(val);
      setPicker(null);
      setSearch('');
    },
    [picker],
  );
  const closePicker = useCallback(() => {
    setPicker(null);
    setSearch('');
  }, []);

  const renderRow = useCallback(
    ({ item, index }: { item: MandiPrice; index: number }) => {
      const isBest = index === 0;
      const diff = best ? item.modalPrice - best.modalPrice : 0;
      return (
        <View style={[styles.row, isBest && styles.rowBest]}>
          <View style={styles.rank}>
            {isBest ? (
              <Ionicons name="trophy" size={18} color="#B8860B" />
            ) : (
              <Text style={styles.rankNum}>{index + 1}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.market}>{item.market}</Text>
            <Text style={styles.district}>
              {item.district}{item.variety ? ` · ${item.variety}` : ''}
            </Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={[styles.price, isBest && styles.priceBest]}>₹{item.modalPrice.toLocaleString('en-IN')}</Text>
            <Text style={styles.unit}>/quintal</Text>
            {isBest ? (
              <View style={styles.bestBadge}><Text style={styles.bestBadgeText}>BEST PRICE</Text></View>
            ) : diff < 0 ? (
              <Text style={styles.diff}>₹{Math.abs(diff).toLocaleString('en-IN')} less</Text>
            ) : null}
          </View>
        </View>
      );
    },
    [best],
  );

  const header = useMemo(
    () => (
      <View>
        {!!best && !loading && (
          <View style={styles.banner}>
            <Ionicons name="trending-up" size={20} color="#0F4A28" />
            <Text style={styles.bannerText}>
              Sell <Text style={styles.bannerBold}>{commodity}</Text> at{' '}
              <Text style={styles.bannerBold}>{best.market}</Text> for the best price:{' '}
              <Text style={styles.bannerBold}>₹{best.modalPrice.toLocaleString('en-IN')}/q</Text>
            </Text>
          </View>
        )}
        <Text style={styles.listHint}>{rows.length} markets · sorted by best price</Text>
      </View>
    ),
    [best, loading, commodity, rows.length],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F4A28" />
        </TouchableOpacity>
        <Text style={styles.title}>Mandi Prices</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Selectors */}
      <View style={styles.selectors}>
        <TouchableOpacity style={styles.selector} onPress={() => setPicker('commodity')} activeOpacity={0.8}>
          <Text style={styles.selectorLabel}>Crop</Text>
          <Text style={styles.selectorValue} numberOfLines={1}>{commodity}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B8074" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.selector} onPress={() => setPicker('state')} activeOpacity={0.8}>
          <Text style={styles.selectorLabel}>State</Text>
          <Text style={styles.selectorValue} numberOfLines={1}>{state}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B8074" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#1A6B3A" /><Text style={styles.loadingText}>Fetching latest mandi prices…</Text></View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="sad-outline" size={44} color="#9EB8A8" />
          <Text style={styles.emptyText}>No recent prices for {commodity} in {state}.</Text>
          <Text style={styles.emptySub}>Try another crop or state.</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(it, i) => `${it.market}-${it.district}-${i}`}
          renderItem={renderRow}
          ListHeaderComponent={header}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}

      {/* Picker modal */}
      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={closePicker}>
        <Pressable style={styles.backdrop} onPress={closePicker} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select {picker === 'state' ? 'state' : 'crop'}</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#6B8074" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${picker === 'state' ? 'state' : 'crop'}…`}
              placeholderTextColor="#9EB8A8"
              value={search}
              onChangeText={setSearch}
              autoFocus
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#9EB8A8" />
              </TouchableOpacity>
            )}
          </View>
          {filteredPickerData.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No {picker === 'state' ? 'state' : 'crop'} matches "{search}"</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPickerData}
              keyExtractor={(it) => it}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => onPick(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 340 }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8F5' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E6EFE9' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#0D1509' },

  selectors: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 4 },
  selector: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectorLabel: { fontSize: 12, color: '#6B8074', fontWeight: '700' },
  selectorValue: { flex: 1, fontSize: 15, fontWeight: '800', color: '#0D1509' },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E4F4EC', borderRadius: 14, padding: 14, marginBottom: 12 },
  bannerText: { flex: 1, fontSize: 14, color: '#1C2E18', lineHeight: 20 },
  bannerBold: { fontWeight: '800', color: '#0F4A28' },
  listHint: { fontSize: 13, color: '#6B8074', marginBottom: 8, fontWeight: '600' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAF1EC', borderRadius: 14, padding: 14, marginBottom: 10 },
  rowBest: { borderColor: '#B8860B', backgroundColor: '#FFFCEF', borderWidth: 2 },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F5F2', alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 14, fontWeight: '800', color: '#6B8074' },
  market: { fontSize: 16, fontWeight: '800', color: '#0D1509' },
  district: { fontSize: 13, color: '#6B8074', marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '800', color: '#1C2E18' },
  priceBest: { color: '#0F4A28' },
  unit: { fontSize: 11, color: '#6B8074' },
  bestBadge: { backgroundColor: '#B8860B', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 },
  bestBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
  diff: { fontSize: 12, color: '#C02828', fontWeight: '700', marginTop: 2 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  loadingText: { fontSize: 14, color: '#6B8074', fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#3A5040', fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#6B8074' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, paddingBottom: 30 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0D1509', marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F4F8F5', borderWidth: 1, borderColor: '#E6EFE9', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#0D1509', paddingVertical: 10 },
  noResults: { paddingVertical: 24, alignItems: 'center' },
  noResultsText: { fontSize: 14, color: '#6B8074', fontWeight: '600' },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F6F3' },
  optionText: { fontSize: 16, color: '#1C2E18', fontWeight: '600' },
});
