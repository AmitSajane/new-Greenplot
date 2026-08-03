export const colors = {
  background: '#F3F4F6',
  surface: '#FFFFFF',
  primary: '#2F8F46',
  primaryDark: '#256F37',
  info: '#0B5ED7',
  infoDark: '#0A4FB4',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#1BBE64',
  warning: '#F97316',
  danger: '#EF4444',
  border: '#E5E7EB',
  softGreen: '#E7F3EA',
  softOrange: '#FEF1E5',
  softBlue: '#E7F0FF',
  skyBlue: '#87CEEB',

  // Secondary palette used by the lease/agreement screens (AgreementScreen,
  // AddLeaseOfferScreen, LeaseRequestsScreen, SupabaseAuthScreen,
  // LeaseOptionsSection). Previously copy-pasted as a local `const G = {...}`
  // in each of those 5 files with a slightly different subset of keys per
  // file; consolidated here since every key they shared already had matching
  // values. Key names (g/a/r/n scales) kept as-is to match existing call
  // sites (`G.g1`, `G.a3`, etc.) so those files only need to swap the import.
  deepGreen: {
    g1: '#092E18',
    g2: '#0F4A28',
    g3: '#1A6B3A',
    g4: '#2D9B56',
    g7: '#E4F4EC',
    a2: '#8A5200',
    a3: '#B87214',
    a7: '#FDF5E0',
    r2: '#C02828',
    r5: '#FDD0D0',
    n1: '#0D1509',
    n2: '#1C2E18',
    n4: '#6B8074',
    n6: '#C8D8CC',
    n7: '#E8F0EC',
    n8: '#F4F8F5',
    white: '#fff',
  },

  // Bright-green palette used by LoginScreen/RegisterScreen/OtpScreen.
  // Recorded here so it has one source of truth, but those 3 screens still
  // use raw hex inline (each value appears as an individual StyleSheet
  // literal, not a local object) — migrating them is scoped into the
  // AuthLayout extraction, not this token pass, since it touches many
  // individual style properties rather than one import line.
  authGreen: {
    bright: '#0b980b',
    label: '#138115',
    muted: '#7ea18a',
    chipBg: '#b3c9b3',
    background: '#f2fbf2',
    headline: '#A9CDAD',
    countryPickerBg: '#d9e7d9',
    inputText: '#1f3b2a',
    chevron: '#4c6a55',
    errorBg: '#fce4e4',
    errorBorder: '#e53935',
  },
};

// Semantic status tone → {background, foreground} pairs, built from the
// existing colors above rather than new hex values. Backs the Badge/status-
// pill consolidation: today ActivityCard.badgeConfig(), LeaseCard.statusStyle(),
// atoms/StatusDot.tsx, and WorkListScreen's getStatusStyle() each redeclare
// this mapping independently, and StatusDot's palette doesn't even agree
// with colors.success/warning/danger. This is the single map they should
// all read from going forward.
export const statusTones = {
  success: { bg: colors.softGreen, fg: colors.success },
  warning: { bg: colors.softOrange, fg: colors.warning },
  danger: { bg: '#FDEBEB', fg: colors.danger },
  info: { bg: colors.softBlue, fg: colors.info },
  neutral: { bg: colors.background, fg: colors.textSecondary },
};

export const spacing = {
  xs: 4,
  sm: 8,
  // `md` (12) and `m` (10) are 2px apart and easy to grab the wrong one.
  // `m` has exactly one live usage (OnboardingScreen.tsx's card padding) —
  // left as-is rather than changed here, since altering it would be a
  // visual tweak to that screen, not a token-file change. Prefer `md` for
  // any new code; `m` should fold into `md` next time that screen is touched.
  md: 12,
  m: 10,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const shadow = {
  // Standard card shadow — the default for any raised surface.
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  // Slightly stronger — for elements that should read as sitting above cards
  // (e.g. a modal sheet, a card that's being dragged).
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  // Strongest — for elements floating over map/canvas content (FABs, the
  // satellite map's floating controls), which need to stay visible over
  // busy, variable-contrast backgrounds.
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
  },
};

/** Minimum touch target size for rural UX (44pt recommended) */
export const minTouchTargetSize = 44;





