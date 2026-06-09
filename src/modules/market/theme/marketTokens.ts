/**
 * Market module design tokens — ported from the AgriArambh Market Intelligence
 * Figma spec. Self-contained so the module's visual language stays consistent
 * regardless of the app-wide theme in src/theme/tokens.ts.
 */

export const market = {
  // Green ramp (primary)
  g1: '#092E18',
  g2: '#0F4A28',
  g3: '#1A6B3A',
  g4: '#2D9B56',
  g5: '#4CAF7A',
  g6: '#A8D8B8',
  g7: '#E4F4EC',

  // Amber ramp (warning)
  a1: '#5C3300',
  a2: '#8A5200',
  a3: '#B87214',
  a4: '#E09830',
  a5: '#F5C86A',
  a6: '#FAE4A8',
  a7: '#FDF5E0',

  // Red ramp (danger)
  r1: '#6B1212',
  r2: '#C02828',
  r3: '#E04848',
  r4: '#F47A7A',
  r5: '#FDD0D0',

  // Blue ramp (info / govt)
  b1: '#0B2D5C',
  b2: '#1A5299',
  b3: '#2872D0',
  b4: '#82B4F0',
  b5: '#D4E8FC',

  // Neutral ramp
  n0: '#000000',
  n1: '#0D1509',
  n2: '#1C2E18',
  n3: '#3A5040',
  n4: '#6B8074',
  n5: '#9EB8A8',
  n6: '#C8D8CC',
  n7: '#E8F0EC',
  n8: '#F4F8F5',
  n9: '#FAFCFA',
  white: '#FFFFFF',

  // AI accent
  aiPurpleBg: '#F0ECFE',
  aiPurpleBorder: '#DDD5FC',
  aiPurpleText: '#4B2EA8',
} as const;

export const mRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const mSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 24,
};

export const mShadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  float: {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
  },
};

/** Header gradient stops (dark green diagonal used across screens). */
export const headerGradient = [market.g1, market.g2, market.g3];
