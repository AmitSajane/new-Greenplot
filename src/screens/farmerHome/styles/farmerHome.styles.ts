import { StyleSheet } from 'react-native';
import { Tone } from '../constants/farmerDashboardData';

export const FARMER_HEADER_GRADIENT = ['#092E18', '#0F4A28', '#1A6B3A'];

/** Semantic tint palette shared by every section (bg / icon / strong text). */
export const tones: Record<Tone, { bg: string; fg: string; strong: string }> = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A', strong: '#0F4A28' },
  amber: { bg: '#FDF5E0', fg: '#B87214', strong: '#8A5200' },
  red: { bg: '#FDECEC', fg: '#C02828', strong: '#6B1212' },
  blue: { bg: '#E7F0FF', fg: '#1A5299', strong: '#0B2D5C' },
  purple: { bg: '#EDE8FD', fg: '#4B2EA8', strong: '#3A1F86' },
  neutral: { bg: '#EEF2F0', fg: '#3A5040', strong: '#1C2E18' },
};

const TEXT_SECONDARY = '#6B8074';
const BORDER = '#E8F0EC';

export const farmerHomeStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  scrollContent: { paddingBottom: 96 },

  // Shared layout helpers (avoid inline static styles in row components).
  flex1: { flex: 1 },
  noBottomBorder: { borderBottomWidth: 0 },
  noRightBorder: { borderRightWidth: 0 },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#4CAF7A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  hi: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  name: { fontSize: 19, fontWeight: '800', color: '#fff', lineHeight: 23 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  locText: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 7 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  langText: { fontSize: 12, color: '#fff', fontWeight: '800' },
  bellDot: {
    position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#E04848', borderWidth: 1.5, borderColor: '#0F4A28',
  },

  // Weather hero (overlaps header)
  weather: {
    marginTop: -30, marginHorizontal: 14, backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 6,
  },
  weatherMain: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  wEmoji: { fontSize: 38 },
  wTemp: { fontSize: 30, fontWeight: '800', color: '#092E18', lineHeight: 32 },
  wCond: { fontSize: 11, fontWeight: '700', color: '#1C2E18' },
  wDesc: { fontSize: 10, color: '#1A6B3A', fontWeight: '700' },
  wMeta: { marginLeft: 'auto', alignItems: 'flex-end' },
  wMetaText: { fontSize: 10, color: TEXT_SECONDARY, lineHeight: 15 },
  wForecast: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: '#FAFCFA' },
  wfCell: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRightWidth: 1, borderRightColor: BORDER },
  wfDay: { fontSize: 10, color: TEXT_SECONDARY },
  wfTemp: { fontSize: 11, color: '#1C2E18', fontWeight: '600', marginTop: 1 },
  wAdvisory: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#E4F4EC', borderTopWidth: 1, borderTopColor: '#A8D8B8',
  },
  wAdvisoryText: { flex: 1, fontSize: 11, color: '#0F4A28', fontWeight: '600' },

  // Farm snapshot
  snapRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 14 },
  snapTile: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  snapEmoji: { fontSize: 14 },
  snapValue: { fontSize: 17, fontWeight: '800', color: '#0D1509', marginTop: 2 },
  snapLabel: { fontSize: 8.5, color: TEXT_SECONDARY, marginTop: 1 },

  // Section
  section: { paddingHorizontal: 14, paddingTop: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1C2E18' },
  sectionLink: { fontSize: 11, fontWeight: '700', color: '#1A6B3A' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14 },

  // AI advisory
  ai: { backgroundColor: '#092E18', borderRadius: 14, padding: 14, overflow: 'hidden' },
  aiGlow: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(77,175,122,0.14)', top: -40, right: -30 },
  aiBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(77,175,122,0.2)', borderWidth: 1, borderColor: 'rgba(77,175,122,0.4)',
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2, marginBottom: 7,
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', color: '#A8D8B8', letterSpacing: 0.3 },
  aiText: { fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  aiCta: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7,
  },
  aiCtaText: { fontSize: 11, color: '#fff', fontWeight: '700' },

  // Ticker
  tickerContent: { gap: 8, paddingVertical: 1, paddingRight: 14 },
  tk: { minWidth: 100, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  tkCrop: { fontSize: 11, color: '#3A5040', fontWeight: '700' },
  tkPrice: { fontSize: 16, fontWeight: '800', color: '#0D1509', marginTop: 3 },
  tkChange: { fontSize: 10, fontWeight: '700', marginTop: 1 },

  // Tasks
  task: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 8 },
  taskIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 12, fontWeight: '700' },
  taskSub: { fontSize: 10, marginTop: 1 },
  taskBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  taskBtnText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Quick actions
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  qaItem: { width: '25%', alignItems: 'center', marginBottom: 12 },
  qaIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  qaLabel: { fontSize: 9.5, fontWeight: '600', color: '#3A5040', textAlign: 'center' },

  // Crop health
  crop: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  cropImg: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cropEmoji: { fontSize: 22 },
  cropNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cropName: { fontSize: 12, fontWeight: '700', color: '#1C2E18' },
  cropTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  cropTagText: { fontSize: 8, fontWeight: '800' },
  cropStage: { fontSize: 10, color: TEXT_SECONDARY, marginTop: 3, marginBottom: 5 },
  hbar: { height: 5, backgroundColor: BORDER, borderRadius: 3, overflow: 'hidden' },
  hfill: { height: 5, borderRadius: 3 },
  cropRight: { alignItems: 'flex-end' },
  cropHealth: { fontSize: 14, fontWeight: '800' },
  cropHealthLabel: { fontSize: 9, color: TEXT_SECONDARY },

  // Find land
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 9 },
  searchText: { fontSize: 12, color: '#9EB8A8' },
  fchips: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  fchip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#C8D8CC', backgroundColor: '#fff' },
  fchipActive: { backgroundColor: '#0F4A28', borderColor: '#0F4A28' },
  fchipText: { fontSize: 11, fontWeight: '600', color: '#6B8074' },
  fchipTextActive: { color: '#fff' },
  listingContent: { gap: 10, paddingRight: 14 },
  listing: { width: 172, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14, overflow: 'hidden' },
  listingImg: { height: 84, backgroundColor: '#E4F4EC', justifyContent: 'flex-end' },
  listingImgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listingType: { position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(255,255,255,0.92)', color: '#0F4A28', fontSize: 8, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  listingPrice: { position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(9,46,24,0.85)', color: '#fff', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  listingBody: { paddingHorizontal: 11, paddingVertical: 9 },
  listingTitle: { fontSize: 12, fontWeight: '700', color: '#1C2E18' },
  listingMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  listingMetaText: { fontSize: 10, color: TEXT_SECONDARY },

  // News
  news: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  newsIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  newsTitle: { fontSize: 11, fontWeight: '700', color: '#1C2E18' },
  newsSub: { fontSize: 10, color: TEXT_SECONDARY },

  // Schemes & news — home category tiles
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tile: {
    width: '48.5%', backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14,
    padding: 12, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 1,
  },
  tileIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontSize: 11.5, fontWeight: '700', color: '#1C2E18', lineHeight: 15 },
  tileCount: { fontSize: 9.5, color: TEXT_SECONDARY, fontWeight: '600' },
  teaserCard: { marginTop: 9 },
  teaserRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  teaserIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  teaserTitle: { fontSize: 10.5, fontWeight: '600', color: '#3A5040', lineHeight: 14 },

  // Schemes & Subsidies screen — segmented tabs
  tabsWrap: { flexDirection: 'row', gap: 4, backgroundColor: BORDER, borderRadius: 12, padding: 4, marginHorizontal: 14, marginTop: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 1 },
  tabBtnText: { fontSize: 12, fontWeight: '700', color: '#3A5040' },
  tabBtnTextActive: { color: '#0F4A28' },

  // Category chips (Schemes tab) + state dropdown trigger
  catChipsRow: { flexDirection: 'row', gap: 7, paddingHorizontal: 14, paddingTop: 12 },
  catChip: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#C8D8CC', backgroundColor: '#fff' },
  catChipActive: { backgroundColor: '#0F4A28', borderColor: '#0F4A28' },
  catChipText: { fontSize: 11, fontWeight: '700', color: '#3A5040' },
  catChipTextActive: { color: '#fff' },
  groupLabel: { fontSize: 10.5, fontWeight: '800', color: TEXT_SECONDARY, letterSpacing: 0.4, textTransform: 'uppercase', paddingHorizontal: 2, paddingTop: 14, paddingBottom: 6 },
  stateTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: '#A8D8B8', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 9,
  },
  stateTriggerText: { fontSize: 12, fontWeight: '700', color: '#0F4A28' },

  // Scheme link row (opens external URL after a confirm)
  slink: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  slinkIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  slinkTitle: { fontSize: 12, fontWeight: '700', color: '#1C2E18', lineHeight: 16 },
  slinkDesc: { fontSize: 9.5, color: TEXT_SECONDARY, marginTop: 2 },

  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: '#E4F4EC', borderWidth: 1, borderColor: '#A8D8B8', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 14, marginTop: 12,
  },
  liveBadgeText: { fontSize: 9.5, color: '#1A6B3A', fontWeight: '600' },

  // Browse chips
  browseSection: { paddingBottom: 16 },
  browseWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  browseChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: '#C8D8CC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  browseLabel: { fontSize: 11, fontWeight: '600', color: '#3A5040' },

  // FAB
  fab: {
    position: 'absolute', right: 18, bottom: 24, width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#1A6B3A', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0F4A28', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 8,
  },
});
