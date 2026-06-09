import { StyleSheet } from 'react-native';
import { AvatarTone } from '../constants/communityData';

export const HUB_HEADER_GRADIENT = ['#092E18', '#0F4A28', '#1A6B3A'];

export const avatarTones: Record<AvatarTone, { bg: string; fg: string }> = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A' },
  amber: { bg: '#FDF5E0', fg: '#B87214' },
  blue: { bg: '#D4E8FC', fg: '#1A5299' },
  red: { bg: '#FDD0D0', fg: '#C02828' },
  purple: { bg: '#EDE8FD', fg: '#4B2EA8' },
};

const BORDER = '#E8F0EC';
const TEXT2 = '#6B8074';

export const hubStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F8F5' },
  listContent: { paddingBottom: 96 },
  flex1: { flex: 1 },
  noBottomBorder: { borderBottomWidth: 0 },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  hdrSub: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  hdrTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 26 },
  hdrActions: { marginLeft: 'auto', flexDirection: 'row', gap: 7 },
  hBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  cstat: { flexDirection: 'row', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingVertical: 8 },
  cs: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.12)' },
  csLast: { borderRightWidth: 0 },
  csV: { fontSize: 14, fontWeight: '800', color: '#fff' },
  csL: { fontSize: 8.5, color: 'rgba(255,255,255,0.55)' },

  // Rewards strip
  reward: { marginHorizontal: 14, marginTop: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 12 },
  rewardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coinBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FDF5E0', alignItems: 'center', justifyContent: 'center' },
  coinEmoji: { fontSize: 22 },
  coinVal: { fontSize: 18, fontWeight: '800', color: '#0D1509' },
  coinLabel: { fontSize: 10, color: TEXT2 },
  streakPill: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FDECEC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  streakText: { fontSize: 11, fontWeight: '800', color: '#C02828' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11, marginBottom: 5 },
  levelText: { fontSize: 11, fontWeight: '700', color: '#1C2E18' },
  levelNext: { fontSize: 10, color: TEXT2 },
  levelTrack: { height: 7, backgroundColor: '#E8F0EC', borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: 7, borderRadius: 4, backgroundColor: '#E09830' },

  // Composer
  composer: { marginHorizontal: 14, marginTop: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 11 },
  compTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  compInput: { flex: 1, backgroundColor: '#F4F8F5', borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9 },
  compInputText: { fontSize: 11, color: '#9EB8A8' },
  compActions: { flexDirection: 'row', gap: 6, marginTop: 9, borderTopWidth: 1, borderTopColor: '#F4F8F5', paddingTop: 9 },
  compBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 9, paddingVertical: 8 },
  compBtnText: { fontSize: 11, fontWeight: '700' },
  compBtnGreen: { backgroundColor: '#E4F4EC' },
  compBtnRed: { backgroundColor: '#FDD0D0' },
  compBtnAmber: { backgroundColor: '#FDF5E0' },
  compTextGreen: { color: '#1A6B3A' },
  compTextRed: { color: '#C02828' },
  compTextAmber: { color: '#B87214' },

  // Avatar (shared)
  av: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avText: { fontSize: 13, fontWeight: '700' },

  // Section header
  section: { paddingHorizontal: 14, paddingTop: 16 },
  sectionFeed: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1C2E18' },
  sectionLink: { fontSize: 11, fontWeight: '700', color: '#1A6B3A' },

  // Category chips
  chipsContent: { gap: 7, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#C8D8CC', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: '#0F4A28', borderColor: '#0F4A28' },
  chipText: { fontSize: 11, fontWeight: '600', color: TEXT2 },
  chipTextOn: { color: '#fff' },

  // Spotlight
  spotlight: { marginHorizontal: 14, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff' },
  spotImg: { height: 130, justifyContent: 'space-between', padding: 10 },
  spotTagRow: { flexDirection: 'row' },
  spotTag: { backgroundColor: 'rgba(224,152,48,0.95)', color: '#fff', fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, overflow: 'hidden' },
  spotEarn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(15,74,40,0.92)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  spotEarnText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  spotBody: { padding: 12 },
  spotTitle: { fontSize: 15, fontWeight: '800', color: '#0F4A28', lineHeight: 20 },
  spotSummary: { fontSize: 11, color: TEXT2, marginTop: 4, lineHeight: 16 },
  spotMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  spotAuthor: { fontSize: 11, fontWeight: '600', color: '#3A5040' },
  spotBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E4F4EC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  spotBtnText: { fontSize: 11, fontWeight: '800', color: '#0F4A28' },

  // Contributors
  contribContent: { gap: 9, paddingRight: 14 },
  contrib: { width: 110, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 11, alignItems: 'center' },
  rankBadge: { position: 'absolute', top: 8, left: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 9, fontWeight: '900', color: '#fff' },
  contribAv: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  contribAvText: { fontSize: 15, fontWeight: '800' },
  contribName: { fontSize: 11, fontWeight: '700', color: '#1C2E18' },
  contribBadge: { fontSize: 9, color: TEXT2, marginTop: 1 },
  contribPts: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5, backgroundColor: '#FDF5E0', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  contribPtsText: { fontSize: 10, fontWeight: '800', color: '#B87214' },

  // Refer & earn
  refer: { marginHorizontal: 14, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  referInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  referIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  referTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  referSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  referBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  referBtnText: { fontSize: 12, fontWeight: '800', color: '#0F4A28' },

  // Learn guides
  learnContent: { gap: 9, paddingRight: 14 },
  learn: { width: 130, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 12, overflow: 'hidden' },
  learnImg: { height: 64, justifyContent: 'flex-end', padding: 6 },
  learnTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(9,46,24,0.8)', color: '#fff', fontSize: 8, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  learnBody: { padding: 9 },
  learnTitle: { fontSize: 11, fontWeight: '700', color: '#1C2E18', lineHeight: 15 },
  learnMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  learnMetaText: { fontSize: 9, color: TEXT2 },

  // Post
  post: { backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 16, overflow: 'hidden', marginHorizontal: 14, marginBottom: 12 },
  pHead: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 8 },
  pNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pName: { fontSize: 12, fontWeight: '700', color: '#1C2E18' },
  pMeta: { fontSize: 10, color: TEXT2, marginTop: 1 },
  role: { fontSize: 8, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, overflow: 'hidden' },
  roleFarmer: { backgroundColor: '#E4F4EC', color: '#0F4A28' },
  roleOwner: { backgroundColor: '#FDF5E0', color: '#8A5200' },
  pTag: { alignSelf: 'flex-start', marginHorizontal: 12, marginBottom: 8, fontSize: 10, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, overflow: 'hidden' },
  pText: { fontSize: 12, color: '#1C2E18', lineHeight: 18, paddingHorizontal: 12, paddingBottom: 10 },
  pMedia: { height: 180, backgroundColor: '#E4F4EC' },
  pGrid: { height: 120, flexDirection: 'row', gap: 2 },
  pGridCell: { flex: 1, backgroundColor: '#E4F4EC' },
  earnBadge: { position: 'absolute', left: 8, top: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(15,74,40,0.92)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  earnText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  playWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  vidDur: { position: 'absolute', right: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  pBar: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#F4F8F5' },
  pAct: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pActText: { fontSize: 11, fontWeight: '600', color: TEXT2 },
  pActTextLiked: { color: '#C02828' },
  pSave: { marginLeft: 'auto' },

  // FAB
  fab: { position: 'absolute', right: 18, bottom: 24, width: 54, height: 54, borderRadius: 27, backgroundColor: '#1A6B3A', alignItems: 'center', justifyContent: 'center', shadowColor: '#0F4A28', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 8 },
});
