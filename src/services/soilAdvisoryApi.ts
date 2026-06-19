/**
 * Soil fertility advisory from SoilGrids (ISRIC) — FREE, no API key.
 *
 * Helps farmers SPEND LESS & GROW MORE: reads soil pH, nitrogen and organic
 * carbon at the farm's GPS point, then applies agronomy rules to recommend the
 * right amendments/fertiliser and crops — so farmers apply only what the soil
 * actually needs instead of over-spending on inputs.
 */

const SOILGRIDS = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

export interface SoilAdvice {
  icon: string;
  title: string;
  detail: string;
  tone: 'green' | 'amber' | 'red' | 'blue';
}

export interface SoilAdvisory {
  ph: number | null; // actual pH (0-14)
  phLabel: string;
  nitrogenGkg: number | null; // g/kg
  organicCarbonGkg: number | null; // g/kg
  texture: string; // e.g. "Clay loam"
  suitableCrops: string[];
  recommendations: SoilAdvice[];
}

/** Pull a layer's mean value from the SoilGrids response (0-5cm depth). */
function layerMean(data: any, name: string): number | null {
  const layer = data?.properties?.layers?.find((l: any) => l.name === name);
  const v = layer?.depths?.[0]?.values?.mean;
  return typeof v === 'number' ? v : null;
}

function textureFromFractions(clayPct: number | null, sandPct: number | null): string {
  if (clayPct == null || sandPct == null) return 'Unknown';
  if (clayPct >= 40) return 'Clay (heavy)';
  if (sandPct >= 70) return 'Sandy (light)';
  if (clayPct >= 27) return 'Clay loam';
  if (sandPct >= 52) return 'Sandy loam';
  return 'Loam (balanced)';
}

function buildAdvisory(
  ph: number | null,
  nitrogenGkg: number | null,
  socGkg: number | null,
  texture: string,
): SoilAdvisory {
  const recs: SoilAdvice[] = [];
  let phLabel = 'Unknown';
  const crops: string[] = [];

  // ── pH interpretation → amendment + crop suitability ──
  if (ph != null) {
    if (ph < 5.5) {
      phLabel = 'Strongly acidic';
      recs.push({
        icon: 'flask',
        tone: 'red',
        title: 'Apply agricultural lime',
        detail: `Soil pH is ${ph.toFixed(1)} (acidic). Add lime (~2-3 q/acre) before sowing to unlock nutrients and boost yield.`,
      });
      crops.push('Rice', 'Tea', 'Potato', 'Pineapple');
    } else if (ph <= 6.5) {
      phLabel = 'Slightly acidic';
      crops.push('Rice', 'Maize', 'Soybean', 'Groundnut', 'Vegetables');
    } else if (ph <= 7.5) {
      phLabel = 'Neutral (ideal)';
      recs.push({
        icon: 'checkmark-circle',
        tone: 'green',
        title: 'pH is ideal',
        detail: `pH ${ph.toFixed(1)} suits most crops. No correction needed — focus on balanced NPK.`,
      });
      crops.push('Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Most vegetables');
    } else if (ph <= 8.5) {
      phLabel = 'Alkaline';
      recs.push({
        icon: 'flask',
        tone: 'amber',
        title: 'Apply gypsum',
        detail: `Soil pH is ${ph.toFixed(1)} (alkaline). Add gypsum (~2 q/acre) + organic matter to improve nutrient uptake.`,
      });
      crops.push('Cotton', 'Wheat', 'Barley', 'Mustard', 'Sugar beet');
    } else {
      phLabel = 'Saline / sodic';
      recs.push({
        icon: 'warning',
        tone: 'red',
        title: 'Reclaim saline soil',
        detail: `pH ${ph.toFixed(1)} is very high. Use gypsum + good drainage and salt-tolerant crops before normal cultivation.`,
      });
      crops.push('Barley', 'Cotton', 'Date palm', 'Saltbush');
    }
  }

  // ── Nitrogen → urea guidance ──
  if (nitrogenGkg != null) {
    if (nitrogenGkg < 1.5) {
      recs.push({
        icon: 'leaf',
        tone: 'amber',
        title: 'Nitrogen is low — add urea',
        detail: 'Apply nitrogen (urea) in 2-3 split doses. Low N limits leaf growth and yield.',
      });
    } else if (nitrogenGkg > 3) {
      recs.push({
        icon: 'leaf',
        tone: 'green',
        title: 'Nitrogen is good',
        detail: 'Soil N is healthy — avoid over-applying urea (wastes money and harms soil).',
      });
    }
  }

  // ── Organic carbon → manure/compost ──
  if (socGkg != null && socGkg < 5) {
    recs.push({
      icon: 'nutrition',
      tone: 'blue',
      title: 'Add organic matter',
      detail: 'Organic carbon is low. Add farmyard manure / compost / green manure to improve soil health and water-holding.',
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: 'information-circle',
      tone: 'blue',
      title: 'Get a lab soil test',
      detail: 'Satellite estimate unavailable here. Visit your nearest Krishi Vigyan Kendra for a free soil health card.',
    });
  }

  return {
    ph,
    phLabel,
    nitrogenGkg,
    organicCarbonGkg: socGkg,
    texture,
    suitableCrops: crops,
    recommendations: recs,
  };
}

export const soilAdvisoryApi = {
  /** Fetch + interpret soil for a GPS point into a farmer-friendly advisory. */
  async getAdvisory(lat: number, lon: number, signal?: AbortSignal): Promise<SoilAdvisory | null> {
    const params = new URLSearchParams({ lon: String(lon), lat: String(lat), depth: '0-5cm', value: 'mean' });
    ['phh2o', 'nitrogen', 'soc', 'clay', 'sand'].forEach(p => params.append('property', p));
    try {
      const res = await fetch(`${SOILGRIDS}?${params.toString()}`, { signal });
      if (!res.ok) return null;
      const data = await res.json();
      const phRaw = layerMean(data, 'phh2o'); // pH × 10
      const nRaw = layerMean(data, 'nitrogen'); // cg/kg
      const socRaw = layerMean(data, 'soc'); // dg/kg
      const clayRaw = layerMean(data, 'clay'); // g/kg
      const sandRaw = layerMean(data, 'sand'); // g/kg

      const ph = phRaw != null ? phRaw / 10 : null;
      const nitrogenGkg = nRaw != null ? nRaw / 100 : null; // cg/kg → g/kg
      const socGkg = socRaw != null ? socRaw / 10 : null; // dg/kg → g/kg
      const clayPct = clayRaw != null ? clayRaw / 10 : null;
      const sandPct = sandRaw != null ? sandRaw / 10 : null;

      return buildAdvisory(ph, nitrogenGkg, socGkg, textureFromFractions(clayPct, sandPct));
    } catch {
      return null;
    }
  },
};
