/**
 * Mandi (market) price comparison — data.gov.in Agmarknet daily prices.
 * Free (public sample key by default; users can add their own free key).
 *
 * Helps farmers SELL HIGHER: given a commodity + state, returns each market's
 * modal price sorted best-first, so a farmer can see which nearby mandi pays
 * the most for the same produce.
 */
import { ENV } from '../config/env';

const RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070'; // Agmarknet daily prices

export interface MandiPrice {
  commodity: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  minPrice: number; // ₹/quintal
  maxPrice: number;
  modalPrice: number; // the representative price
  arrivalDate: string;
}

function toNum(v: any): number {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function mapRecord(r: any): MandiPrice {
  return {
    commodity: r.commodity || '',
    variety: r.variety || '',
    market: r.market || '',
    district: r.district || '',
    state: r.state || '',
    minPrice: toNum(r.min_price),
    maxPrice: toNum(r.max_price),
    modalPrice: toNum(r.modal_price),
    arrivalDate: r.arrival_date || '',
  };
}

interface Query {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  limit?: number;
}

export const mandiApi = {
  /** Raw price records matching the filters (newest arrivals first by API default). */
  async fetchPrices(q: Query = {}, signal?: AbortSignal): Promise<MandiPrice[]> {
    const params = new URLSearchParams({
      'api-key': ENV.dataGovApiKey,
      format: 'json',
      limit: String(q.limit ?? 200),
    });
    if (q.commodity) params.append('filters[commodity]', q.commodity);
    if (q.state) params.append('filters[state]', q.state);
    if (q.district) params.append('filters[district]', q.district);
    if (q.market) params.append('filters[market]', q.market);

    try {
      const res = await fetch(`${ENV.dataGovBaseUrl}/${RESOURCE}?${params.toString()}`, { signal });
      if (!res.ok) return [];
      const json = await res.json();
      console.log('mandiApi.fetchPrices', json);
      const records: any[] = Array.isArray(json.records) ? json.records : [];
      return records.map(mapRecord).filter(r => r.modalPrice > 0);
    } catch {
      return [];
    }
  },

  /**
   * Best markets for a commodity in a state — deduped to the highest modal price
   * per market, sorted high→low so the top row is the best place to sell.
   */
  async compareMarkets(commodity: string, state: string, signal?: AbortSignal): Promise<MandiPrice[]> {
    const rows = await mandiApi.fetchPrices({ commodity, state, limit: 500 }, signal);
    const bestByMarket = new Map<string, MandiPrice>();
    for (const r of rows) {
      const key = `${r.market}|${r.district}`;
      const prev = bestByMarket.get(key);
      if (!prev || r.modalPrice > prev.modalPrice) bestByMarket.set(key, r);
    }
    return Array.from(bestByMarket.values()).sort((a, b) => b.modalPrice - a.modalPrice);
  },

  /** Distinct commodities available for a state (for the picker). */
  async commoditiesForState(state: string, signal?: AbortSignal): Promise<string[]> {
    const rows = await mandiApi.fetchPrices({ state, limit: 500 }, signal);
    return Array.from(new Set(rows.map(r => r.commodity).filter(Boolean))).sort();
  },
};
