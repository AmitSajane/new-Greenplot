/**
 * Soil advisor — turns the raw soil API response into farmer-friendly guidance.
 *
 * Pure, deterministic functions (no side effects) so the output is easy to test
 * and cheap to memoise. Everything a farmer sees on the Soil Test screen is
 * derived here: plain-language ratings, a soil-health score, best crops, and a
 * step-by-step AI fertilizer guide.
 */
import { SoilResponse } from '../../types/soil';

export type Rating = 'good' | 'medium' | 'low' | 'danger';
export type StepTone = 'green' | 'amber' | 'blue' | 'neutral';

export interface SoilMetric {
  key: string;
  icon: string; // Ionicons name
  label: string;
  value: string;
  rating: Rating;
  ratingLabel: string;
  note: string; // farmer-friendly explanation
}

export interface CropRec {
  name: string;
  emoji: string;
  fit: 'best' | 'good';
  tip: string;
}

export interface FertilizerStep {
  icon: string;
  tone: StepTone;
  title: string;
  product: string;
  dose: string;
  timing: string;
  why: string;
}

export interface SoilReport {
  textureClass: string;
  faoClass: string;
  textureSummary: string;
  textureTraits: string[];
  healthScore: number; // 0–100
  healthLabel: string;
  healthTone: 'green' | 'amber' | 'red';
  aiSummary: string;
  metrics: SoilMetric[];
  crops: CropRec[];
  fertilizer: FertilizerStep[];
  amendments: string[];
  disclaimer: string;
}

const RATING_POINTS: Record<Rating, number> = { good: 100, medium: 65, low: 35, danger: 15 };

interface Verdict {
  rating: Rating;
  ratingLabel: string;
  note: string;
}

// ── individual interpreters ────────────────────────────────────────────────

function ratePh(ph: number): Verdict {
  if (ph < 5.5) return { rating: 'danger', ratingLabel: 'Strongly acidic', note: 'Too acidic — nutrients get locked. Add agricultural lime before sowing.' };
  if (ph < 6.5) return { rating: 'medium', ratingLabel: 'Slightly acidic', note: 'Mildly acidic. Fine for most crops; lime only if growing sensitive crops.' };
  if (ph <= 7.5) return { rating: 'good', ratingLabel: 'Neutral', note: 'Ideal range — plant roots can take up nutrients easily. No correction needed.' };
  if (ph <= 8.4) return { rating: 'medium', ratingLabel: 'Slightly alkaline', note: 'A little alkaline. Add organic matter/gypsum and prefer acidic fertilizers.' };
  return { rating: 'danger', ratingLabel: 'Strongly alkaline', note: 'Too alkaline — apply gypsum and plenty of compost to improve.' };
}

function rateOrganicMatter(om: number): Verdict {
  if (om < 1) return { rating: 'low', ratingLabel: 'Low', note: 'Soil is low on organic matter. Add compost / farmyard manure to feed the soil.' };
  if (om < 2.5) return { rating: 'medium', ratingLabel: 'Medium', note: 'Decent organic matter. Keep adding compost to reach a healthy level.' };
  return { rating: 'good', ratingLabel: 'High', note: 'Rich in organic matter — great for soil life and water holding.' };
}

function rateNitrogen(n: number): Verdict {
  if (n < 0.5) return { rating: 'low', ratingLabel: 'Low', note: 'Nitrogen is low — crops may look pale. Plan a good urea schedule.' };
  if (n <= 2) return { rating: 'medium', ratingLabel: 'Medium', note: 'Moderate nitrogen. Apply urea in splits for steady leaf growth.' };
  return { rating: 'good', ratingLabel: 'High', note: 'Plenty of nitrogen — go easy on urea to avoid excess growth.' };
}

function rateCec(cec: number): Verdict {
  if (cec < 10) return { rating: 'low', ratingLabel: 'Low', note: 'Holds nutrients poorly — apply fertilizer in small, frequent doses.' };
  if (cec < 25) return { rating: 'medium', ratingLabel: 'Good', note: 'Holds nutrients well — fertilizer stays available to the crop.' };
  return { rating: 'good', ratingLabel: 'High', note: 'Excellent nutrient store — fertilizers you apply are used efficiently.' };
}

function rateWater(field: number, wilt: number): Verdict {
  const available = field - wilt;
  if (available < 8) return { rating: 'low', ratingLabel: 'Low', note: 'Drains fast — needs frequent, lighter irrigation and mulching.' };
  if (available < 13) return { rating: 'medium', ratingLabel: 'Medium', note: 'Moderate water holding. Irrigate on a regular schedule.' };
  return { rating: 'good', ratingLabel: 'Good', note: 'Holds water well — fewer irrigations needed, saves water.' };
}

function rateBulkDensity(bd: number): Verdict {
  if (bd < 1.4) return { rating: 'good', ratingLabel: 'Loose', note: 'Well-aerated soil — roots spread easily.' };
  if (bd <= 1.6) return { rating: 'medium', ratingLabel: 'Firm', note: 'Slightly compact. Add organic matter and avoid heavy machinery when wet.' };
  return { rating: 'danger', ratingLabel: 'Compact', note: 'Compacted — roots struggle. Deep plough and add organic matter.' };
}

// ── texture → traits & crops ────────────────────────────────────────────────

interface TextureProfile {
  summary: string;
  traits: string[];
  crops: CropRec[];
}

const CLAY_LOAM: TextureProfile = {
  summary: 'Balanced soil that holds water and nutrients well. Great all-rounder; can get sticky when wet.',
  traits: ['Holds nutrients', 'Good water retention', 'Sticky when wet'],
  crops: [
    { name: 'Wheat', emoji: '🌾', fit: 'best', tip: 'Loves this fertile, moisture-holding soil.' },
    { name: 'Paddy / Rice', emoji: '🍚', fit: 'best', tip: 'Clay holds water — ideal for rice.' },
    { name: 'Cotton', emoji: '☁️', fit: 'best', tip: 'Deep roots thrive in clay loam.' },
    { name: 'Sugarcane', emoji: '🎋', fit: 'good', tip: 'Good yields with steady irrigation.' },
    { name: 'Gram / Pulses', emoji: '🫘', fit: 'good', tip: 'Fixes nitrogen, improves the soil too.' },
    { name: 'Tomato', emoji: '🍅', fit: 'good', tip: 'Profitable; ensure good drainage.' },
  ],
};

const TEXTURE_PROFILES: { match: (t: string) => boolean; profile: TextureProfile }[] = [
  {
    match: t => t.includes('sand'),
    profile: {
      summary: 'Light, fast-draining soil. Easy to work but loses water and nutrients quickly.',
      traits: ['Drains fast', 'Warms early', 'Needs frequent feeding'],
      crops: [
        { name: 'Groundnut', emoji: '🥜', fit: 'best', tip: 'Loves loose, sandy soil.' },
        { name: 'Bajra / Millet', emoji: '🌾', fit: 'best', tip: 'Drought-hardy, perfect here.' },
        { name: 'Watermelon', emoji: '🍉', fit: 'good', tip: 'Sandy soil gives sweet fruit.' },
        { name: 'Potato', emoji: '🥔', fit: 'good', tip: 'Easy tuber growth in loose soil.' },
      ],
    },
  },
  {
    match: t => t.includes('clay') && t.includes('loam'),
    profile: CLAY_LOAM,
  },
  {
    match: t => t.includes('clay'),
    profile: {
      summary: 'Heavy soil that holds water and nutrients strongly. Rich but hard to work when dry.',
      traits: ['Very fertile', 'Holds water long', 'Hard when dry'],
      crops: [
        { name: 'Paddy / Rice', emoji: '🍚', fit: 'best', tip: 'Water-holding clay is ideal.' },
        { name: 'Sugarcane', emoji: '🎋', fit: 'best', tip: 'Thrives in heavy, rich soil.' },
        { name: 'Cotton', emoji: '☁️', fit: 'good', tip: 'Good with proper drainage.' },
        { name: 'Wheat', emoji: '🌾', fit: 'good', tip: 'Works with good tillage.' },
      ],
    },
  },
  {
    match: t => t.includes('silt'),
    profile: {
      summary: 'Smooth, fertile soil with good moisture holding. Can crust on the surface.',
      traits: ['Fertile', 'Smooth texture', 'Can form a crust'],
      crops: [
        { name: 'Wheat', emoji: '🌾', fit: 'best', tip: 'Excellent in fertile silt.' },
        { name: 'Vegetables', emoji: '🥬', fit: 'best', tip: 'Rich silt grows great veg.' },
        { name: 'Maize', emoji: '🌽', fit: 'good', tip: 'Good moisture supports cobs.' },
        { name: 'Pulses', emoji: '🫘', fit: 'good', tip: 'Adds nitrogen back to soil.' },
      ],
    },
  },
];

const LOAM_PROFILE: TextureProfile = {
  summary: 'The ideal farming soil — balanced sand, silt and clay. Holds water yet drains well.',
  traits: ['Best all-round soil', 'Holds water & drains', 'Easy to work'],
  crops: [
    { name: 'Wheat', emoji: '🌾', fit: 'best', tip: 'Loam is perfect for wheat.' },
    { name: 'Vegetables', emoji: '🥬', fit: 'best', tip: 'Almost any vegetable does well.' },
    { name: 'Maize', emoji: '🌽', fit: 'good', tip: 'Strong cobs with good feeding.' },
    { name: 'Pulses', emoji: '🫘', fit: 'good', tip: 'Improves soil nitrogen.' },
  ],
};

const UNKNOWN_PROFILE: TextureProfile = {
  summary:
    'Soil type could not be classified for this exact spot, but the readings below still guide your crop & fertilizer plan.',
  traits: ['Mixed soil'],
  crops: LOAM_PROFILE.crops,
};

function profileForTexture(texture: string | null): TextureProfile {
  if (!texture) return UNKNOWN_PROFILE;
  const t = texture.toLowerCase();
  const found = TEXTURE_PROFILES.find(p => p.match(t));
  if (found) return found.profile;
  if (t.includes('loam')) return LOAM_PROFILE;
  return CLAY_LOAM; // sensible default
}

/** True only for real, finite numbers (the API may send null). */
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

// ── fertilizer guide ────────────────────────────────────────────────────────

function buildFertilizerPlan(
  om: Verdict | null,
  n: Verdict | null,
  ph: Verdict | null,
  texture: string | null,
): FertilizerStep[] {
  const steps: FertilizerStep[] = [];

  // 1) Organic base — dose scales with current organic matter (default: medium)
  const omRating = om?.rating ?? 'medium';
  const fymDose = omRating === 'low' ? '6–8 tonnes / acre' : omRating === 'medium' ? '4–5 tonnes / acre' : '2–3 tonnes / acre';
  steps.push({
    icon: 'leaf',
    tone: 'green',
    title: 'Organic base',
    product: 'Farmyard manure / Compost',
    dose: fymDose,
    timing: '2–3 weeks before sowing',
    why: 'Builds organic matter, feeds soil life and improves water holding.',
  });

  // 2) Nitrogen — dose scales with measured N (default: medium)
  const nRating = n?.rating ?? 'medium';
  const ureaDose = nRating === 'low' ? '120–130 kg / acre' : nRating === 'medium' ? '100–110 kg / acre' : '70–80 kg / acre';
  steps.push({
    icon: 'color-fill',
    tone: 'blue',
    title: 'Nitrogen (N)',
    product: 'Urea',
    dose: ureaDose,
    timing: 'In 2–3 splits: sowing, tillering, flowering',
    why: `Soil nitrogen is ${(n?.ratingLabel ?? 'moderate').toLowerCase()} — splitting urea gives steady, healthy leaf growth.`,
  });

  // 3) Phosphorus (not measured by the test — standard basal dose)
  steps.push({
    icon: 'flower',
    tone: 'amber',
    title: 'Phosphorus (P)',
    product: 'DAP',
    dose: '45–50 kg / acre',
    timing: 'Full dose at sowing (basal)',
    why: 'Drives strong roots, flowering and early establishment.',
  });

  // 4) Potassium (not measured — standard basal dose)
  steps.push({
    icon: 'shield-checkmark',
    tone: 'amber',
    title: 'Potassium (K)',
    product: 'MOP (Muriate of Potash)',
    dose: '25–30 kg / acre',
    timing: 'Basal, with the phosphorus dose',
    why: 'Improves grain filling, water use and disease resistance.',
  });

  // 5) pH amendment — only when needed
  if (ph && ph.rating === 'danger' && ph.ratingLabel.includes('acidic')) {
    steps.push({ icon: 'cube', tone: 'neutral', title: 'pH correction', product: 'Agricultural lime', dose: '200–400 kg / acre', timing: '3–4 weeks before sowing', why: 'Raises pH so locked nutrients become available.' });
  } else if (ph && ph.ratingLabel.includes('alkaline')) {
    steps.push({ icon: 'cube', tone: 'neutral', title: 'pH correction', product: 'Gypsum', dose: '200–250 kg / acre', timing: 'Before sowing, mix into topsoil', why: 'Lowers alkalinity and improves soil structure.' });
  }

  // 6) Micronutrient hint for heavy / alkaline soils
  const t = (texture ?? '').toLowerCase();
  if (t.includes('clay') || (ph?.ratingLabel.includes('alkaline') ?? false)) {
    steps.push({ icon: 'sparkles', tone: 'neutral', title: 'Micronutrient (if needed)', product: 'Zinc Sulphate', dose: '10 kg / acre', timing: 'At sowing, once every 2–3 seasons', why: 'Heavy/alkaline soils often lack zinc — prevents yellowing leaves.' });
  }

  return steps;
}

function buildAmendments(ph: Verdict | null, om: Verdict | null, bd: Verdict | null): string[] {
  const out: string[] = [];
  if (ph?.rating === 'good') out.push('Your pH is ideal — no lime or gypsum needed. 👍');
  else if (ph) out.push(ph.note);
  if (!om || om.rating !== 'good') out.push('Grow a green-manure crop (dhaincha/sunhemp) and plough it in to boost organic matter.');
  if (bd && (bd.rating === 'danger' || bd.rating === 'medium')) out.push('Add compost and deep-plough to loosen the soil for better root growth.');
  out.push('Re-test your soil every 2–3 seasons to track improvement.');
  return out;
}

function healthFrom(rating: number): { label: string; tone: 'green' | 'amber' | 'red' } {
  if (rating >= 75) return { label: 'Healthy soil', tone: 'green' };
  if (rating >= 50) return { label: 'Moderately healthy', tone: 'amber' };
  return { label: 'Needs improvement', tone: 'red' };
}

// ── public entry ────────────────────────────────────────────────────────────

export function buildSoilReport(data: SoilResponse): SoilReport {
  const soilType = data.soil_type ?? { texture_class: null, fao_classification: null };
  const phys = data.physical ?? ({} as SoilResponse['physical']);
  const chem = data.chemical ?? ({} as SoilResponse['chemical']);
  const water = data.water ?? null;

  const metrics: SoilMetric[] = [];
  const verdicts: Verdict[] = [];

  /** Push a metric + collect its verdict only when the reading exists. */
  const add = (m: Omit<SoilMetric, 'rating' | 'ratingLabel' | 'note'>, v: Verdict | null) => {
    if (!v) return;
    metrics.push({ ...m, rating: v.rating, ratingLabel: v.ratingLabel, note: v.note });
    verdicts.push(v);
  };

  const ph = isNum(chem.ph_h2o) ? ratePh(chem.ph_h2o) : null;
  add({ key: 'ph', icon: 'flask', label: 'Soil pH', value: isNum(chem.ph_h2o) ? chem.ph_h2o.toFixed(1) : '—' }, ph);

  const om = isNum(chem.organic_matter_pct) ? rateOrganicMatter(chem.organic_matter_pct) : null;
  add({ key: 'om', icon: 'leaf', label: 'Organic matter', value: isNum(chem.organic_matter_pct) ? `${chem.organic_matter_pct.toFixed(1)}%` : '—' }, om);

  const n = isNum(chem.nitrogen_g_kg) ? rateNitrogen(chem.nitrogen_g_kg) : null;
  add({ key: 'n', icon: 'color-fill', label: 'Nitrogen (N)', value: isNum(chem.nitrogen_g_kg) ? `${chem.nitrogen_g_kg.toFixed(1)} g/kg` : '—' }, n);

  const cec = isNum(chem.cec_cmol_kg) ? rateCec(chem.cec_cmol_kg) : null;
  add({ key: 'cec', icon: 'albums', label: 'Nutrient holding (CEC)', value: isNum(chem.cec_cmol_kg) ? `${chem.cec_cmol_kg.toFixed(0)}` : '—' }, cec);

  let waterVerdict: Verdict | null = null;
  if (water && isNum(water.capacity_field_vol_pct) && isNum(water.capacity_wilt_vol_pct)) {
    waterVerdict = rateWater(water.capacity_field_vol_pct, water.capacity_wilt_vol_pct);
    add(
      {
        key: 'water',
        icon: 'water',
        label: 'Water holding',
        value: `${(water.capacity_field_vol_pct - water.capacity_wilt_vol_pct).toFixed(0)}% avail.`,
      },
      waterVerdict,
    );
  }

  const bd = isNum(phys.bulk_density_g_cm3) ? rateBulkDensity(phys.bulk_density_g_cm3) : null;
  add({ key: 'bd', icon: 'layers', label: 'Soil firmness', value: isNum(phys.bulk_density_g_cm3) ? phys.bulk_density_g_cm3.toFixed(2) : '—' }, bd);

  const healthScore = verdicts.length
    ? Math.round(verdicts.reduce((sum, v) => sum + RATING_POINTS[v.rating], 0) / verdicts.length)
    : 0;
  const health = verdicts.length ? healthFrom(healthScore) : { label: 'Not enough data', tone: 'amber' as const };

  const textureClass = soilType.texture_class;
  const profile = profileForTexture(textureClass);

  const facts: string[] = [];
  if (ph) facts.push(`pH is ${ph.ratingLabel.toLowerCase()}`);
  if (n) facts.push(`nitrogen is ${n.ratingLabel.toLowerCase()}`);
  const aiSummary =
    `Your ${textureClass ? `${textureClass.toLowerCase()} ` : ''}soil is ${health.label.toLowerCase()}` +
    `${verdicts.length ? ` (${healthScore}/100)` : ''}. ` +
    (facts.length ? `${facts.join(' and ')}. ` : '') +
    (om ? (om.rating === 'good' ? 'Organic matter is healthy. ' : 'Add compost to lift organic matter. ') : '') +
    'Follow the fertilizer steps below for the best yield.';

  return {
    textureClass: textureClass ?? 'Not classified',
    faoClass: soilType.fao_classification ?? '—',
    textureSummary: profile.summary,
    textureTraits: profile.traits,
    healthScore,
    healthLabel: health.label,
    healthTone: health.tone,
    aiSummary,
    metrics,
    crops: profile.crops,
    fertilizer: buildFertilizerPlan(om, n, ph, textureClass),
    amendments: buildAmendments(ph, om, bd),
    disclaimer:
      'N is from your soil test; P & K doses are standard best-practice for this soil. For exact P/K, do a lab test before a big crop.',
  };
}
