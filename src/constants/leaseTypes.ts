/**
 * LEASE TYPES — single source of truth for the whole lease flow.
 *
 * Both the owner (Add Lease Offer) and the farmer (browse / compare / apply)
 * read from THIS file, so terms set by the owner are exactly what the farmer
 * sees. Replaces the three mismatched hardcoded lists that existed before.
 *
 * Each type declares a `fields` schema → the "Add Lease Offer" form renders
 * those fields dynamically, so every lease type captures the right terms.
 */

export type LeaseTypeId =
  | 'cash_rent'
  | 'fixed_rent'
  | 'crop_share'
  | 'revenue_share'
  | 'flexible_share'
  | 'custom';

/** How a single term input is rendered in the dynamic offer form. */
export type FieldKind = 'number' | 'text' | 'percent' | 'split' | 'select' | 'clauses';

export interface LeaseField {
  key: string;
  label: string;
  kind: FieldKind;
  unit?: string;
  placeholder?: string;
  options?: string[];
  /** Default value (split = farmer's %; number/percent = number; text = string). */
  default?: string | number;
  help?: string;
}

export interface LeaseTypeDef {
  id: LeaseTypeId;
  name: string;
  emoji: string;
  /** One-line plain-language meaning shown to farmers. */
  definition: string;
  moneyFlow: string;
  /** 1 (safest for owner) … 5 (most risk/upside). */
  ownerRisk: number;
  accent: string;
  /** Type-specific term inputs rendered in the offer form. */
  fields: LeaseField[];
}

/** Accent palette (matches the app theme). */
const C = {
  green: '#2D9B56',
  greenDark: '#1A6B3A',
  amber: '#E09830',
  amberDark: '#B87214',
  blue: '#1A5299',
  neutral: '#6B8074',
};

export const LEASE_TYPES: readonly LeaseTypeDef[] = [
  {
    id: 'cash_rent',
    name: 'Cash Rent',
    emoji: '💵',
    definition: 'Farmer pays a fixed cash amount upfront for the season. Owner takes zero risk.',
    moneyFlow: 'Lump-sum cash before sowing',
    ownerRisk: 1,
    accent: C.green,
    fields: [
      { key: 'totalAmount', label: 'Total cash', kind: 'number', unit: '₹', placeholder: 'e.g. 60000' },
      { key: 'payByDate', label: 'Pay by', kind: 'text', placeholder: 'e.g. before sowing' },
    ],
  },
  {
    id: 'fixed_rent',
    name: 'Fixed Rent',
    emoji: '📅',
    definition: 'A fixed amount per acre per year, paid in installments (e.g. half at sowing, half at harvest).',
    moneyFlow: 'Scheduled fixed payments',
    ownerRisk: 2,
    accent: C.greenDark,
    fields: [
      { key: 'ratePerAcre', label: 'Rent per acre / year', kind: 'number', unit: '₹', placeholder: 'e.g. 12000' },
      { key: 'installments', label: 'Installments', kind: 'select', options: ['Full upfront', '2 splits', '3 splits'], default: '2 splits' },
    ],
  },
  {
    id: 'crop_share',
    name: 'Crop Share',
    emoji: '🌾',
    definition: 'Owner and farmer split the physical harvest by a ratio. No fixed cash changes hands.',
    moneyFlow: 'Produce divided at harvest',
    ownerRisk: 3,
    accent: C.amber,
    fields: [
      { key: 'harvestSplit', label: 'Harvest split (farmer share)', kind: 'split', default: 50, help: 'Farmer keeps this %, owner gets the rest' },
      { key: 'inputSplit', label: 'Input-cost split (farmer share)', kind: 'split', default: 50 },
      { key: 'crops', label: 'Crops allowed', kind: 'text', placeholder: 'e.g. Tomato, Cotton' },
    ],
  },
  {
    id: 'revenue_share',
    name: 'Revenue Share',
    emoji: '💰',
    definition: 'Owner gets a percentage of the sale revenue (the cash from selling the crop).',
    moneyFlow: '% of money after the sale',
    ownerRisk: 4,
    accent: C.amberDark,
    fields: [
      { key: 'ownerPercent', label: 'Owner revenue share', kind: 'percent', unit: '%', default: 25 },
      { key: 'inputSplit', label: 'Input-cost split (farmer share)', kind: 'split', default: 50 },
    ],
  },
  {
    id: 'flexible_share',
    name: 'Flexible Share',
    emoji: '⚖️',
    definition: 'A guaranteed base rent plus a bonus that flexes with yield or price — both share the upside.',
    moneyFlow: 'Guaranteed base + upside bonus',
    ownerRisk: 3,
    accent: C.blue,
    fields: [
      { key: 'baseRate', label: 'Base rent per acre', kind: 'number', unit: '₹', placeholder: 'e.g. 6000' },
      { key: 'bonusPercent', label: 'Bonus share of upside', kind: 'percent', unit: '%', default: 20 },
      { key: 'threshold', label: 'Bonus applies when', kind: 'text', placeholder: 'e.g. price > ₹20/kg' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Agreement',
    emoji: '📝',
    definition: 'Owner writes custom terms per crop plus free-form clauses — for anything the presets don’t cover.',
    moneyFlow: 'Whatever is agreed',
    ownerRisk: 3,
    accent: C.neutral,
    fields: [
      { key: 'crops', label: 'Crops', kind: 'text', placeholder: 'e.g. Sugarcane' },
      { key: 'clauses', label: 'Custom clauses', kind: 'clauses', placeholder: 'One clause per line…' },
    ],
  },
];

export const LEASE_TYPE_MAP: Record<LeaseTypeId, LeaseTypeDef> = LEASE_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<LeaseTypeId, LeaseTypeDef>,
);

/** A concrete lease offer the owner attaches to a land. */
export interface LeaseOffer {
  id: string;
  landId: string;
  typeId: LeaseTypeId;
  /** Dynamic term values keyed by field.key. */
  terms: Record<string, string | number>;
  tenure: string;
  availableFrom: string;
  createdAt: string;
}

export interface AgreementTerm {
  label: string;
  value: string;
}

/** Detailed, human-readable agreement clauses generated from an offer's terms. */
export function buildAgreementTerms(offer: LeaseOffer): AgreementTerm[] {
  const t = offer.terms;
  const split = (v: unknown) => {
    const f = Number(v ?? 50);
    return `Farmer ${f}% / Owner ${100 - f}%`;
  };
  switch (offer.typeId) {
    case 'cash_rent':
      return [
        { label: 'Payment', value: `₹${t.totalAmount ?? '—'} (one-time, upfront)` },
        { label: 'Pay by', value: String(t.payByDate || 'Before sowing') },
      ];
    case 'fixed_rent':
      return [
        { label: 'Rent', value: `₹${t.ratePerAcre ?? '—'} per acre / year` },
        { label: 'Installments', value: String(t.installments || '2 splits') },
      ];
    case 'crop_share':
      return [
        { label: 'Harvest split', value: split(t.harvestSplit) },
        { label: 'Input costs', value: split(t.inputSplit) },
        { label: 'Crops allowed', value: String(t.crops || 'As mutually agreed') },
      ];
    case 'revenue_share':
      return [
        { label: 'Owner share', value: `${t.ownerPercent ?? 25}% of sale revenue` },
        { label: 'Input costs', value: split(t.inputSplit) },
      ];
    case 'flexible_share':
      return [
        { label: 'Base rent', value: `₹${t.baseRate ?? '—'} per acre` },
        { label: 'Upside bonus', value: `${t.bonusPercent ?? 20}% of extra income` },
        { label: 'Bonus applies', value: String(t.threshold || 'above agreed threshold') },
      ];
    case 'custom':
      return [
        { label: 'Crops', value: String(t.crops || '—') },
        { label: 'Clauses', value: String(t.clauses || 'As written in the agreement') },
      ];
    default:
      return [];
  }
}

/** One-line, farmer-friendly summary of an offer (used on cards/lists). */
export function summarizeOffer(offer: LeaseOffer): string {
  const t = offer.terms;
  switch (offer.typeId) {
    case 'cash_rent':
      return `₹${t.totalAmount ?? '—'} upfront${t.payByDate ? ` · pay ${t.payByDate}` : ''}`;
    case 'fixed_rent':
      return `₹${t.ratePerAcre ?? '—'}/acre/yr · ${t.installments ?? '2 splits'}`;
    case 'crop_share':
      return `Harvest ${t.harvestSplit ?? 50}:${100 - Number(t.harvestSplit ?? 50)} · inputs ${t.inputSplit ?? 50}/${100 - Number(t.inputSplit ?? 50)}`;
    case 'revenue_share':
      return `Owner ${t.ownerPercent ?? 25}% of sale revenue`;
    case 'flexible_share':
      return `Base ₹${t.baseRate ?? '—'}/acre + ${t.bonusPercent ?? 20}% upside`;
    case 'custom':
      return `${t.crops ? `${t.crops} · ` : ''}custom terms`;
    default:
      return 'Lease offer';
  }
}
