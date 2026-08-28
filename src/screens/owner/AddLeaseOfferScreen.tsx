import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LEASE_TYPES, LEASE_TYPE_MAP, LeaseField, LeaseTypeId, summarizeOffer } from '../../constants/leaseTypes';
import { useLeases } from '../../context/LeaseContext';
import { useFarmListings, FarmListing } from '../../context/FarmListingsContext';
import { colors } from '../../theme/tokens';
import { formatDateLabel } from '../../utils';

// Either an existing land (`landId`) gets a new offer, or — reached from
// AddFarmScreen's "Continue with Lease Offer" — a not-yet-created land
// (`draftLand`) is created together with the offer once Publish is pressed.
type ParamList = {
  AddLeaseOffer:
    | { landId: string; landTitle?: string; draftLand?: undefined }
    | { draftLand: Omit<FarmListing, 'id' | 'createdAt'>; landTitle?: string; landId?: undefined };
};

const TENURES = ['1 year', '2 years', '3 years', '5 years', '10 years'];

const G = colors.deepGreen;

function defaultsFor(typeId: LeaseTypeId): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const f of LEASE_TYPE_MAP[typeId].fields) {
    if (f.default !== undefined) out[f.key] = f.default;
    else if (f.kind === 'split') out[f.key] = 50;
    else if (f.kind === 'select' && f.options?.length) out[f.key] = f.options[0];
  }
  return out;
}

export default function AddLeaseOfferScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'AddLeaseOffer'>>();
  const { landId, landTitle, draftLand } = route.params;
  const { addOffer, getOffersByLand, removeOffer } = useLeases();
  const { addListing } = useFarmListings();

  const [typeId, setTypeId] = useState<LeaseTypeId>('fixed_rent');
  const [terms, setTerms] = useState<Record<string, string | number>>(() => defaultsFor('fixed_rent'));
  const [tenure, setTenure] = useState('3 years');
  // Picked via calendar (not typed) so this same date can become the
  // agreement's actual lease start date once the farmer signs, instead of
  // the sign date always being used.
  const [availableFromDate, setAvailableFromDate] = useState(new Date());
  const [showAvailableFromPicker, setShowAvailableFromPicker] = useState(false);
  const availableFrom = formatDateLabel(availableFromDate);
  // Common to every lease type (like tenure/availableFrom above), so it lives
  // outside `terms` — `selectType` resets `terms` via defaultsFor() on every
  // type switch, which would otherwise wipe out a deposit already typed in.
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const def = LEASE_TYPE_MAP[typeId];
  // Draft mode has no landId yet, so there can't be any offers to show.
  const existing = landId ? getOffersByLand(landId) : [];

  const selectType = useCallback((id: LeaseTypeId) => {
    setTypeId(id);
    setTerms(defaultsFor(id));
  }, []);

  const setTerm = useCallback((key: string, value: string | number) => {
    setTerms(prev => ({ ...prev, [key]: value }));
  }, []);

  const termsWithDeposit = useCallback(
    () => (securityDeposit ? { ...terms, securityDeposit } : terms),
    [terms, securityDeposit],
  );

  const previewOffer = useMemo(
    () => summarizeOffer({ id: 'preview', landId: landId || 'draft', typeId, terms: termsWithDeposit(), tenure, availableFrom, createdAt: '' }),
    [landId, typeId, termsWithDeposit, tenure, availableFrom],
  );

  // In draft mode this is the ONLY place the land gets created — guarded by
  // `submitting` (and the button disabling itself below) so a double-tap, or
  // coming back to AddFarmScreen and choosing "Continue with Lease Offer"
  // again, can never create it twice.
  const publish = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    let targetLandId = landId;
    try {
      if (!targetLandId && draftLand) {
        targetLandId = await addListing(draftLand);
      }
      if (!targetLandId) throw new Error('Missing land to attach this offer to.');
      addOffer({ landId: targetLandId, typeId, terms: termsWithDeposit(), tenure, availableFrom });
    } catch (e) {
      setSubmitting(false);
      const reason = e instanceof Error ? e.message : (e as { message?: string })?.message;
      Alert.alert('Could not publish', reason || 'Please check your connection and try again.');
      return;
    }
    setSubmitting(false);
    Alert.alert(
      draftLand ? 'Land Published ✓' : 'Offer added ✓',
      draftLand
        ? `${def.name} offer published — your land is now live for farmers to apply.`
        : `${def.name} offer published for this land.`,
      [{ text: 'OK', onPress: () => navigation.popToTop() }],
    );
  }, [submitting, landId, draftLand, addListing, addOffer, typeId, termsWithDeposit, tenure, availableFrom, def.name, navigation]);

  const renderField = (f: LeaseField) => {
    const val = terms[f.key];
    switch (f.kind) {
      case 'number':
      case 'percent':
        return (
          <View style={styles.fieldRow} key={f.key}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <View style={styles.inputWrap}>
              {f.unit === '₹' && <Text style={styles.unit}>₹</Text>}
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={val !== undefined ? String(val) : ''}
                placeholder={f.placeholder || '0'}
                placeholderTextColor="#9EB8A8"
                onChangeText={t => setTerm(f.key, t.replace(/[^\d.]/g, ''))}
              />
              {f.unit === '%' && <Text style={styles.unit}>%</Text>}
            </View>
            {!!f.help && <Text style={styles.help}>{f.help}</Text>}
          </View>
        );
      case 'text':
        return (
          <View style={styles.fieldRow} key={f.key}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <TextInput
              style={[styles.input, styles.inputBox]}
              value={val !== undefined ? String(val) : ''}
              placeholder={f.placeholder}
              placeholderTextColor="#9EB8A8"
              onChangeText={t => setTerm(f.key, t)}
            />
          </View>
        );
      case 'clauses':
        return (
          <View style={styles.fieldRow} key={f.key}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <TextInput
              style={[styles.input, styles.inputBox, styles.multiline]}
              multiline
              value={val !== undefined ? String(val) : ''}
              placeholder={f.placeholder}
              placeholderTextColor="#9EB8A8"
              onChangeText={t => setTerm(f.key, t)}
            />
          </View>
        );
      case 'select':
        return (
          <View style={styles.fieldRow} key={f.key}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <View style={styles.chipsRow}>
              {f.options?.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, val === opt && styles.chipOn]}
                  onPress={() => setTerm(f.key, opt)}
                >
                  <Text style={[styles.chipText, val === opt && styles.chipTextOn]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 'split': {
        const farmer = Number(val ?? 50);
        const owner = 100 - farmer;
        const step = (d: number) => setTerm(f.key, Math.max(0, Math.min(100, farmer + d)));
        return (
          <View style={styles.fieldRow} key={f.key}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <View style={styles.splitRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => step(-5)}>
                <Ionicons name="remove" size={18} color={G.g2} />
              </TouchableOpacity>
              <View style={styles.splitMid}>
                <Text style={styles.splitVal}>Farmer {farmer}% · Owner {owner}%</Text>
                <View style={styles.splitBar}>
                  <View style={[styles.splitFill, { width: `${farmer}%` }]} />
                </View>
              </View>
              <TouchableOpacity style={styles.stepBtn} onPress={() => step(5)}>
                <Ionicons name="add" size={18} color={G.g2} />
              </TouchableOpacity>
            </View>
            {!!f.help && <Text style={styles.help}>{f.help}</Text>}
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSub}>Lease offers</Text>
          <Text style={styles.headerTitle}>{landTitle || draftLand?.title || 'Your land'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Draft mode: the land itself doesn't exist yet — make that explicit
            so it's clear nothing is saved (land or offer) until Publish. */}
        {!!draftLand && (
          <View style={styles.draftBanner}>
            <Ionicons name="information-circle" size={17} color="#0B5ED7" />
            <Text style={styles.draftBannerText}>Creating land + offer together — nothing is saved until you Publish.</Text>
          </View>
        )}

        {/* existing offers */}
        {existing.length > 0 && (
          <View style={styles.existing}>
            <Text style={styles.sectionLabel}>Published offers ({existing.length})</Text>
            {existing.map(o => (
              <View key={o.id} style={styles.offerRow}>
                <Text style={styles.offerEmoji}>{LEASE_TYPE_MAP[o.typeId].emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerName}>{LEASE_TYPE_MAP[o.typeId].name}</Text>
                  <Text style={styles.offerSum}>{summarizeOffer(o)}</Text>
                </View>
                <TouchableOpacity onPress={() => removeOffer(o.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color="#C02828" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* type picker */}
        <Text style={styles.sectionLabel}>Add a lease offer · choose type</Text>
        <View style={styles.typeGrid}>
          {LEASE_TYPES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeCard, typeId === t.id && { borderColor: t.accent, backgroundColor: G.g7 }]}
              onPress={() => selectType(t.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={styles.typeName}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.def}>{def.definition}</Text>

        {/* dynamic fields */}
        <View style={styles.card}>
          {def.fields.map(renderField)}
          {/* common fields */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Tenure</Text>
            <View style={styles.chipsRow}>
              {TENURES.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, tenure === t && styles.chipOn]} onPress={() => setTenure(t)}>
                  <Text style={[styles.chipText, tenure === t && styles.chipTextOn]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Available from</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowAvailableFromPicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Choose available-from date"
            >
              <Ionicons name="calendar-outline" size={16} color={G.n4} />
              <Text style={styles.dateInputText}>{availableFrom}</Text>
            </TouchableOpacity>
            {showAvailableFromPicker && (
              <DateTimePicker
                value={availableFromDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowAvailableFromPicker(false);
                  if (event.type !== 'dismissed' && selectedDate) setAvailableFromDate(selectedDate);
                }}
              />
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Security deposit (optional)</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.unit}>₹</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={securityDeposit}
                placeholder="e.g. 20000"
                placeholderTextColor="#9EB8A8"
                onChangeText={t => setSecurityDeposit(t.replace(/[^\d.]/g, ''))}
              />
            </View>
            <Text style={styles.help}>Refundable at lease closure, minus any agreed deductions.</Text>
          </View>
        </View>

        {/* preview */}
        <View style={styles.preview}>
          <Ionicons name="eye-outline" size={15} color={G.g2} />
          <Text style={styles.previewText}>Farmer sees: <Text style={styles.previewBold}>{previewOffer}</Text></Text>
        </View>

        <TouchableOpacity
          style={[styles.publishBtn, submitting && styles.publishBtnDisabled]}
          onPress={publish}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.publishText}>{draftLand ? 'Publish Land & Offer' : 'Publish this offer'}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: G.n8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: G.g2, paddingHorizontal: 16, paddingVertical: 14 },
  back: {},
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  scroll: { padding: 14, paddingBottom: 32 },
  draftBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: '#E7F0FF', borderWidth: 1, borderColor: '#BFD8FF', borderRadius: 12, padding: 12, marginBottom: 14 },
  draftBannerText: { flex: 1, fontSize: 11.5, color: '#0A4FB4', fontWeight: '600', lineHeight: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: G.n4, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9, marginTop: 4 },
  existing: { marginBottom: 14 },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 12, padding: 11, marginBottom: 8 },
  offerEmoji: { fontSize: 20 },
  offerName: { fontSize: 13, fontWeight: '700', color: G.n2 },
  offerSum: { fontSize: 11, color: G.n4, marginTop: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  typeCard: { flexBasis: '31%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: G.n7, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  typeEmoji: { fontSize: 20, marginBottom: 4 },
  typeName: { fontSize: 11, fontWeight: '700', color: G.n2, textAlign: 'center' },
  def: { fontSize: 12, color: G.n4, lineHeight: 18, marginBottom: 12, fontStyle: 'italic' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: G.n7, borderRadius: 14, padding: 13 },
  fieldRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: G.n2, marginBottom: 7 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10, paddingHorizontal: 12 },
  unit: { fontSize: 14, color: G.n4, fontWeight: '700' },
  input: { flex: 1, fontSize: 14, color: G.n2, paddingVertical: 10 },
  inputBox: { backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10, paddingHorizontal: 12 },
  dateInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: G.n8, borderWidth: 1, borderColor: G.n7, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  dateInputText: { fontSize: 14, color: G.n2, fontWeight: '600' },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  help: { fontSize: 10, color: G.n4, marginTop: 5 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#C8D8CC', backgroundColor: '#fff' },
  chipOn: { backgroundColor: G.g2, borderColor: G.g2 },
  chipText: { fontSize: 11, fontWeight: '600', color: G.n4 },
  chipTextOn: { color: '#fff' },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#A8D8B8', backgroundColor: G.g7, alignItems: 'center', justifyContent: 'center' },
  splitMid: { flex: 1 },
  splitVal: { fontSize: 12, fontWeight: '700', color: G.n2, textAlign: 'center', marginBottom: 6 },
  splitBar: { height: 8, borderRadius: 4, backgroundColor: '#E09830', overflow: 'hidden' },
  splitFill: { height: 8, backgroundColor: G.g3 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: G.g7, borderRadius: 10, padding: 11, marginTop: 12 },
  previewText: { flex: 1, fontSize: 11, color: G.g2 },
  previewBold: { fontWeight: '800', color: G.g1 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: G.g2, borderRadius: 12, paddingVertical: 14, marginTop: 14 },
  publishBtnDisabled: { opacity: 0.7 },
  publishText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
