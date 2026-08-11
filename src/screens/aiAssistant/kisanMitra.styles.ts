import { StyleSheet } from 'react-native';

export const KM_HEADER_GRADIENT = ['#092E18', '#0F4A28', '#1A6B3A'];

export const quickTones: Record<string, { bg: string; fg: string }> = {
  green: { bg: '#E4F4EC', fg: '#1A6B3A' },
  amber: { bg: '#FDF5E0', fg: '#B87214' },
  blue: { bg: '#D4E8FC', fg: '#1A5299' },
  red: { bg: '#FDD0D0', fg: '#C02828' },
};

const BORDER = '#E8F0EC';
const TEXT2 = '#6B8074';

export const km = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8F5' },
  flex1: { flex: 1 },

  // Header
  header: { paddingHorizontal: 14, paddingVertical: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  backBtn: { marginRight: 2 },
  botAvatar: {
    width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: '#2D9B56',
  },
  botAvatarEmoji: { fontSize: 20 },
  online: {
    position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#4ADE80', borderWidth: 2, borderColor: '#0F4A28',
  },
  botName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  botStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  botStatusText: { fontSize: 10, color: '#A8E6C0' },
  langChip: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  langChipText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Language picker sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 28 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#C8D8CC', marginBottom: 12 },
  sheetTitle: { fontSize: 14, fontWeight: '800', color: '#1C2E18', marginBottom: 10 },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F4F8F5' },
  langOptionText: { fontSize: 14, color: '#1C2E18', flex: 1 },
  langOptionActive: { color: '#0F4A28', fontWeight: '800' },

  // Chat list
  chatContent: { padding: 12, gap: 10 },

  // Welcome
  welcome: { alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6 },
  welcomeAv: {
    width: 64, height: 64, borderRadius: 20, marginBottom: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1A6B3A',
    shadowColor: '#0F4A28', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 6,
  },
  welcomeAvEmoji: { fontSize: 32 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#092E18', textAlign: 'center' },
  welcomeSub: { fontSize: 12, color: TEXT2, marginTop: 6, lineHeight: 18, textAlign: 'center' },
  qLabel: { fontSize: 10, fontWeight: '800', color: TEXT2, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 9, paddingHorizontal: 2 },
  qGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  qCard: {
    flexBasis: '47%', flexGrow: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER,
    borderRadius: 14, padding: 12,
  },
  qIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  qIconEmoji: { fontSize: 17 },
  qTitle: { fontSize: 12, fontWeight: '700', color: '#1C2E18' },
  qSub: { fontSize: 9.5, color: TEXT2, marginTop: 1 },
  voiceCta: {
    flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 14,
    backgroundColor: '#092E18', borderRadius: 14, padding: 13,
  },
  voiceIcon: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(77,175,122,0.22)', borderWidth: 1, borderColor: 'rgba(77,175,122,0.4)',
  },
  voiceTitle: { fontSize: 12, fontWeight: '700', color: '#fff' },
  voiceSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  // Message bubbles
  msgRow: { flexDirection: 'row', gap: 7, maxWidth: '86%' },
  msgRowBot: { alignSelf: 'flex-start' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  mAv: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  mAvBot: { backgroundColor: '#2D9B56' },
  mAvUser: { backgroundColor: '#E4F4EC' },
  mAvEmoji: { fontSize: 14 },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9 },
  bubbleBot: { backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderTopLeftRadius: 5 },
  bubbleUser: { backgroundColor: '#0F4A28', borderTopRightRadius: 5 },
  bubbleTextBot: { fontSize: 12.5, lineHeight: 19, color: '#1C2E18' },
  bubbleTextUser: { fontSize: 12.5, lineHeight: 19, color: '#fff' },
  msgImage: { width: 180, height: 130, borderRadius: 10, marginBottom: 6 },

  // Bubble meta (translate / read-aloud / verified)
  bMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F4F8F5' },
  speakerWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  speakerRing: {
    position: 'absolute', width: 15, height: 15, borderRadius: 8,
    borderWidth: 1.3, borderColor: '#1A6B3A',
  },
  bMetaLink: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bMetaLinkText: { fontSize: 10, color: '#1A6B3A', fontWeight: '600' },
  verified: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E4F4EC', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText: { fontSize: 9, color: '#0F4A28', fontWeight: '700' },

  // Answer actions
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  actionBuy: { backgroundColor: '#0F4A28' },
  actionGhost: { backgroundColor: '#E4F4EC', borderWidth: 1, borderColor: '#A8D8B8' },
  actionTextBuy: { fontSize: 10, fontWeight: '700', color: '#fff' },
  actionTextGhost: { fontSize: 10, fontWeight: '700', color: '#0F4A28' },

  // Feedback
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 14, marginLeft: 33, marginTop: 2 },
  feedbackReg: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  feedbackRegText: { fontSize: 10, color: TEXT2, fontWeight: '600' },

  // Voice message
  voiceMsg: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vmPlay: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  vmWave: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 18 },
  vmBar: { width: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 1 },
  vmTime: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },

  // Typing
  typing: { flexDirection: 'row', gap: 4, alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 16, borderTopLeftRadius: 5, paddingHorizontal: 13, paddingVertical: 11 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#9EB8A8' },
  typingDotMid: { opacity: 0.6 },
  typingDotLow: { opacity: 0.3 },

  // Follow-ups
  followups: { paddingHorizontal: 12, paddingTop: 8 },
  fuLabel: { fontSize: 9, fontWeight: '800', color: TEXT2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 2 },
  fuStripContent: { gap: 7, paddingRight: 12 },
  fuChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: '#4CAF7A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  fuChipText: { fontSize: 11, color: '#0F4A28', fontWeight: '600' },

  // Input bar
  inputBar: { borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: '#fff', paddingHorizontal: 10, paddingTop: 9, paddingBottom: 10 },
  inRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inBtn: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#F4F8F5', alignItems: 'center', justifyContent: 'center' },
  inMic: { backgroundColor: '#1A6B3A' },
  inMicActive: { backgroundColor: '#C02828' },
  inField: { flex: 1, backgroundColor: '#F4F8F5', borderWidth: 1, borderColor: BORDER, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, color: '#1C2E18', maxHeight: 90 },
  inSend: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#0F4A28', alignItems: 'center', justifyContent: 'center' },
  inSendDisabled: { backgroundColor: '#9EB8A8' },
});
