/**
 * Static directory of real government scheme portals, grouped the same way
 * as the Schemes & Subsidies screen: Central programs, per-state schemes
 * (filterable), and credit/loan schemes. Unlike `FARMER_NEWS`, this has no
 * live feed to pull from — NewsData.io returns generic articles, not
 * structured scheme entries — so it's hand-curated and updated here directly.
 */
import type { Tone } from './farmerDashboardData';

export type SchemeCategory = 'central' | 'state' | 'credit';

export interface SchemeLink {
  id: string;
  icon: string;
  tone: Tone;
  title: string;
  desc: string;
  url: string;
}

export const SCHEME_CATEGORY_LABEL: Record<SchemeCategory, string> = {
  central: 'Central Government Programs',
  state: 'State Schemes',
  credit: 'Loans & Credit',
};

export const CENTRAL_SCHEMES: readonly SchemeLink[] = [
  { id: 'c1', icon: 'business', tone: 'blue', title: 'PM-KISAN Direct Income Support', desc: '₹6,000/yr direct benefit transfer', url: 'https://pmkisan.gov.in/' },
  { id: 'c2', icon: 'shield-checkmark', tone: 'blue', title: 'PMFBY Crop Insurance', desc: 'Now covers wild-animal & flood damage', url: 'https://pmfby.gov.in/' },
  { id: 'c3', icon: 'storefront', tone: 'blue', title: 'e-NAM National Agriculture Market', desc: 'Sell produce across 1,600+ mandis online', url: 'https://enam.gov.in/web/' },
  { id: 'c4', icon: 'people', tone: 'blue', title: 'NCDC Cooperative Support', desc: 'Funding for farmer cooperatives & FPOs', url: 'https://www.ncdc.in/' },
  { id: 'c5', icon: 'flask', tone: 'blue', title: 'Soil Health Card', desc: 'Free soil test & nutrient recommendation', url: 'https://www.soilhealth.dac.gov.in/' },
  { id: 'c6', icon: 'sunny', tone: 'blue', title: 'PM-KUSUM Solar Pump Scheme', desc: 'Subsidy on solar irrigation pumps', url: 'https://pmkusum.mnre.gov.in/' },
];

export const CREDIT_SCHEMES: readonly SchemeLink[] = [
  { id: 'cr1', icon: 'business', tone: 'amber', title: 'NABARD Refinance Schemes', desc: 'Refinance for farm & rural credit', url: 'https://www.nabard.org/' },
  { id: 'cr2', icon: 'card', tone: 'amber', title: 'SBI Kisan Credit Card', desc: 'Revolving credit for cultivation costs', url: 'https://sbi.bank.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card' },
];

export interface StateSchemeGroup {
  label: string;
  items: readonly SchemeLink[];
}

export const DEFAULT_STATE_KEY = 'karnataka';

export const STATE_SCHEMES: Record<string, StateSchemeGroup> = {
  karnataka: {
    label: 'Karnataka',
    items: [
      { id: 's1', icon: 'water', tone: 'green', title: 'Krishi Bhagya Yojana', desc: '80-90% subsidy for farm ponds & polyhouses', url: 'https://raitamitra.karnataka.gov.in/english' },
      { id: 's2', icon: 'school', tone: 'green', title: 'Chief Minister Raitha Vidya Nidhi', desc: "Scholarships for farmers' children", url: 'https://raitamitra.karnataka.gov.in/english' },
    ],
  },
  maharashtra: {
    label: 'Maharashtra',
    items: [
      { id: 's3', icon: 'construct', tone: 'green', title: 'MahaDBT Farmer Schemes', desc: 'Single portal for all state farm subsidies, paid via DBT', url: 'https://mahadbt.maharashtra.gov.in/' },
    ],
  },
  uttarPradesh: {
    label: 'Uttar Pradesh',
    items: [
      { id: 's4', icon: 'construct', tone: 'green', title: 'UP Krishi Upkaran Subsidy Yojana', desc: 'Up to 30% subsidy on farm equipment & machinery', url: 'https://upagriculture.com/' },
    ],
  },
  punjab: {
    label: 'Punjab',
    items: [
      { id: 's5', icon: 'leaf', tone: 'green', title: 'Paddy Straw Management Subsidy', desc: 'Machinery subsidy for in-situ straw management', url: 'https://agri.punjab.gov.in/' },
    ],
  },
  tamilNadu: {
    label: 'Tamil Nadu',
    items: [
      { id: 's6', icon: 'phone-portrait', tone: 'green', title: 'Individual-Based Subsidy Schemes', desc: 'Machinery & implement subsidy via the Uzhavan app', url: 'https://aed.tn.gov.in/' },
    ],
  },
  rajasthan: {
    label: 'Rajasthan',
    items: [
      { id: 's7', icon: 'document-text', tone: 'green', title: 'Raj Kisan Sathi Portal', desc: 'Single-window portal for every state farm subsidy', url: 'https://rajkisan.rajasthan.gov.in/' },
    ],
  },
  madhyaPradesh: {
    label: 'Madhya Pradesh',
    items: [
      { id: 's8', icon: 'pricetags', tone: 'green', title: 'e-Uparjan MSP Portal', desc: 'Register to sell wheat & paddy at MSP, paid via DBT', url: 'https://mpeuparjan.nic.in/' },
    ],
  },
  gujarat: {
    label: 'Gujarat',
    items: [
      { id: 's9', icon: 'water', tone: 'green', title: 'iKhedut Portal 2.0', desc: '50-75% subsidy: drip irrigation, machinery, polyhouse', url: 'https://ikhedut.gujarat.gov.in/' },
    ],
  },
  andhraPradesh: {
    label: 'Andhra Pradesh',
    items: [
      { id: 's10', icon: 'cash', tone: 'green', title: 'YSR Rythu Bharosa', desc: '₹13,500/yr family support (being renamed Annadatha Sukhibhava)', url: 'https://ysrrythubharosa.ap.gov.in/' },
    ],
  },
};
