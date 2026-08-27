/**
 * Terms & Conditions shown on a signed agreement's Agreement Details screen.
 *
 * Assembles static, role-tagged legal boilerplate with the live figures of
 * the specific agreement being viewed (dates, rent, deposit) so the same 15
 * clauses read correctly for every lease type and every pair of parties,
 * without hand-writing them per agreement.
 */
import { AgreementTerm, LeaseTypeId, LEASE_TYPE_MAP } from './leaseTypes';

export type TermsClauseRole = 'owner' | 'farmer' | 'both';

export interface TermsClause {
  id: string;
  role: TermsClauseRole;
  title: string;
  body: string;
}

/** The minimal shape both `Agreement` and `ActiveLease` satisfy — see
 *  AgreementDetailsScreen's `record = agreement || activeLease`. */
export interface TermsSourceRecord {
  typeId: LeaseTypeId;
  termsSummary: string;
  tenure?: string;
  startDate?: string;
  farmerName: string;
  ownerName: string;
  fullTerms?: AgreementTerm[];
  farmerSignedAt?: string;
}

export interface TermsLandInfo {
  location?: string;
  district?: string;
  state?: string;
  acresLabel?: string;
  acres?: string;
}

const bullets = (items: string[]): string => items.map(i => `• ${i}`).join('\n');

/** Best-effort "start + tenure" → end date. Falls back to plain text when the
 *  tenure string isn't a simple "N years"/"N year" (e.g. custom text). */
function tenureEndDate(startDate: string | undefined, tenure: string | undefined): string {
  if (!startDate || !tenure) return 'as agreed for the stated tenure';
  const match = tenure.match(/(\d+)\s*year/i);
  const parsed = new Date(startDate);
  if (!match || Number.isNaN(parsed.getTime())) return `at the end of the ${tenure} tenure`;
  parsed.setFullYear(parsed.getFullYear() + Number(match[1]));
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function findTerm(rows: AgreementTerm[] | undefined, label: string): string | undefined {
  return rows?.find(r => r.label.toLowerCase() === label.toLowerCase())?.value;
}

export function buildTermsAndConditions(record: TermsSourceRecord, land?: TermsLandInfo): TermsClause[] {
  const t = LEASE_TYPE_MAP[record.typeId];
  const revenueSharingTypes: LeaseTypeId[] = ['crop_share', 'revenue_share', 'flexible_share'];
  const landDesc = land
    ? [land.location, land.district, land.state].filter(Boolean).join(', ') || undefined
    : undefined;
  const acresDesc = land?.acresLabel || land?.acres;
  const depositTerm = findTerm(record.fullTerms, 'Security deposit');
  const inputCostsTerm = findTerm(record.fullTerms, 'Input costs');

  const clauses: (TermsClause | null)[] = [
    {
      id: 'land-usage',
      role: 'both',
      title: 'Land details and agreed agricultural usage',
      body: `The leased land${acresDesc ? ` (${acresDesc})` : ''}${landDesc ? ` at ${landDesc}` : ''} shall be used solely for agricultural purposes as described in this agreement. Any change of use requires the land owner's written consent.`,
    },
    {
      id: 'duration',
      role: 'both',
      title: 'Lease start date and end date',
      body: `This lease runs for a tenure of ${record.tenure || 'the agreed period'}, starting ${record.startDate || 'on the date both parties sign'} and ending ${tenureEndDate(record.startDate, record.tenure)}, unless closed earlier under the Agreement Termination clause below.`,
    },
    {
      id: 'payment',
      role: 'both',
      title: 'Lease amount, rent and payment schedule',
      body: `${record.termsSummary}. Payments are due as agreed at signing; late or missed payments may be raised as a dispute and are accounted for in any lease closure settlement.`,
    },
    revenueSharingTypes.includes(record.typeId)
      ? {
          id: 'revenue-share',
          role: 'both',
          title: 'Revenue or crop sharing',
          body: `This is a ${t.name} agreement: ${t.definition} The exact split is recorded above in the Lease Terms section and is binding for the full tenure.`,
        }
      : null,
    {
      id: 'deposit',
      role: 'both',
      title: 'Security deposit',
      body: depositTerm
        ? `A refundable security deposit of ${depositTerm.split(' (')[0].replace('₹', '₹')} has been collected. It is refunded at lease closure, less any deductions both parties agree to (see Lease Closure → Settlement).`
        : 'No security deposit was agreed for this lease.',
    },
    {
      id: 'owner-responsibilities',
      role: 'owner',
      title: 'Responsibilities of the Land Owner',
      body: bullets(t.ownerResponsibilities),
    },
    {
      id: 'farmer-responsibilities',
      role: 'farmer',
      title: 'Responsibilities of the Farmer',
      body: bullets(t.farmerResponsibilities),
    },
    {
      id: 'farming-expenses',
      role: 'farmer',
      title: 'Water, electricity, irrigation, labour, seeds, fertilizers, pesticides and other farming expenses',
      body: inputCostsTerm
        ? `Input costs (water, electricity, irrigation, labour, seeds, fertilizers, pesticides) are split ${inputCostsTerm}.`
        : 'Unless stated otherwise above, the farmer bears the day-to-day cost of water, electricity, irrigation, labour, seeds, fertilizers, and pesticides.',
    },
    {
      id: 'maintenance',
      role: 'both',
      title: 'Land maintenance',
      body: 'The farmer maintains field boundaries and day-to-day upkeep of the land under cultivation. The land owner is responsible for major infrastructure repairs (irrigation systems, fencing, boundary walls) not caused by the farmer’s negligence.',
    },
    {
      id: 'damage',
      role: 'both',
      title: 'Damage to land or property',
      body: 'Damage caused by the farmer’s negligence or misuse is the farmer’s responsibility to repair or compensate. Damage from causes outside the farmer’s control (e.g. the owner’s existing structures) is the owner’s responsibility. Any damage is recorded during the Land Handover & Inspection step if the lease closes.',
    },
    {
      id: 'standing-crops',
      role: 'both',
      title: 'Existing or standing crops',
      body: 'If a lease closes while a crop is still standing, it is not treated as immediately vacated — both parties resolve it via the Lease Closure workflow (continue until harvest, harvest by an agreed deadline, owner takes possession, or a mutual arrangement on ownership and compensation).',
    },
    {
      id: 'disasters',
      role: 'both',
      title: 'Natural disasters, crop loss and unexpected events',
      body: 'Neither party is held liable for crop loss or damage caused by natural disasters, extreme weather, pest outbreaks, or other events beyond reasonable control. Both parties will discuss in good faith any rent or terms adjustment such an event may warrant.',
    },
    {
      id: 'disputes',
      role: 'both',
      title: 'Dispute resolution',
      body: 'Any disagreement is first raised directly between the parties for mutual resolution. If unresolved, either party may escalate to local agricultural authorities or applicable law. Every closure-related communication is recorded in the Agreement History for reference.',
    },
    {
      id: 'termination',
      role: 'both',
      title: 'Agreement termination',
      body: 'Either party may end this lease early only through the Lease Closure workflow: the farmer submits a closure request, the standard notice period applies (unless the land owner waives it by mutual agreement), pending settlement is resolved, and land handover is confirmed by both parties before the lease is marked closed.',
    },
    {
      id: 'acceptance',
      role: 'both',
      title: 'Mutual agreement and digital acceptance',
      body: `By digitally signing this agreement, ${record.ownerName} (Land Owner) and ${record.farmerName} (Farmer) confirm they have read and accepted every term above.${record.farmerSignedAt ? ` Accepted on ${new Date(record.farmerSignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}.` : ''}`,
    },
  ];

  return clauses.filter((c): c is TermsClause => c !== null);
}
