import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/tokens';

/** Dark-green gradient used by the header (matches the Market module). */
export const OWNER_HEADER_GRADIENT = ['#092E18', '#0F4A28', '#1A6B3A'];

/** Semantic tint palette for alert cards / tool icons. */
export const tone = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A', strong: '#0F4A28' },
  amber: { bg: '#FDF5E0', fg: '#B87214', strong: '#8A5200' },
  red: { bg: '#FDECEC', fg: '#C02828', strong: '#6B1212' },
  blue: { bg: '#E7F0FF', fg: '#1A5299', strong: '#0B2D5C' },
  purple: { bg: '#EDE8FD', fg: '#4B2EA8', strong: '#3A1F86' },
  neutral: { bg: '#EEF2F0', fg: '#3A5040', strong: '#1C2E18' },
};

export const ownerHomeStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  scrollContent: { paddingBottom: 96 },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5C86A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#5C3300', fontWeight: '800', fontSize: 15 },
  hi: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  name: { fontSize: 19, fontWeight: '800', color: '#fff', lineHeight: 23 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  locText: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  bell: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E04848',
    borderWidth: 1.5,
    borderColor: '#0F4A28',
  },

  // Portfolio hero
  port: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  portLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  portVal: { fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 33, marginTop: 2 },
  portChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    backgroundColor: 'rgba(77,175,122,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(168,216,184,0.5)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  portChipText: { fontSize: 10, fontWeight: '700', color: '#CFEFDB' },
  portStats: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
    paddingTop: 10,
  },
  pst: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.12)' },
  pstLast: { borderRightWidth: 0 },
  pstV: { fontSize: 16, fontWeight: '800', color: '#fff' },
  pstL: { fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 1 },

  // Sections
  section: { paddingHorizontal: 14, paddingTop: 14 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  sectionLink: { fontSize: 11, fontWeight: '700', color: '#1A6B3A' },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8F0EC', borderRadius: 14 },

  // Revenue
  revRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: 13 },
  revLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  revVal: { fontSize: 26, fontWeight: '800', color: '#092E18', marginTop: 2 },
  revChip: { fontSize: 10, fontWeight: '700', color: '#0F4A28', backgroundColor: '#E4F4EC', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, marginTop: 4, overflow: 'hidden', alignSelf: 'flex-start' },
  spark: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 40 },
  sparkBar: { width: 5, borderRadius: 2, backgroundColor: '#4CAF7A' },
  sparkBarHi: { backgroundColor: '#1A6B3A' },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 13, borderTopWidth: 1, borderTopColor: '#E8F0EC', borderStyle: 'dashed', paddingVertical: 10 },
  payoutText: { fontSize: 11, color: colors.textSecondary, flex: 1 },
  payoutGo: { fontSize: 11, color: '#1A6B3A', fontWeight: '700' },

  // Metric tiles
  tilesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { flexBasis: '48%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8F0EC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  // Icon + label sit side by side so it's clear what the icon denotes,
  // instead of the label being a small caption under the number.
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tileVal: { fontSize: 18, fontWeight: '800', color: '#0D1509', marginTop: 7 },
  tileLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, flexShrink: 1 },
  tileSub: { fontSize: 9, fontWeight: '700', marginTop: 1 },

  // Alerts
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 8 },
  alertIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  alertTitle: { fontSize: 12, fontWeight: '700' },
  alertSub: { fontSize: 10, marginTop: 1 },
  alertBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  alertBtnText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Properties
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  propImg: { width: 46, height: 46, borderRadius: 10, backgroundColor: '#E4F4EC', alignItems: 'center', justifyContent: 'center' },
  propEmoji: { fontSize: 22 },
  propNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  propName: { fontSize: 12, fontWeight: '800', color: '#1C2E18' },
  statusChip: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  statusText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  propMeta: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  propRight: { alignItems: 'flex-end' },
  propRent: { fontSize: 13, fontWeight: '800', color: '#0F4A28' },
  propNext: { fontSize: 9, color: colors.textSecondary },
  propCta: { fontSize: 11, fontWeight: '800', color: '#B87214' },

  // Tools
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tool: { flexBasis: '31.5%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8F0EC', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  toolIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  toolLabel: { fontSize: 10, fontWeight: '700', color: colors.textPrimary },

  // Activity
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  actDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 11, fontWeight: '700', color: '#1C2E18' },
  actSub: { fontSize: 10, color: colors.textSecondary },
  actTime: { fontSize: 9, color: colors.textMuted, marginLeft: 'auto' },
  actEmpty: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20 },
  actEmptyText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },

  // FAB
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1A6B3A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F4A28',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
  },
});
