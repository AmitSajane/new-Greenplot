/**
 * Crop master data directory (Supabase). Backs the "Select Crop" step of the
 * Farm Management crop-plan flow. Read access is allowed by the "crops read"
 * RLS policy (public). Falls back to a small hardcoded list when Supabase
 * isn't configured (mock mode), matching profilesApi.ts's pattern.
 */
import { supabase } from './supabase';

export interface Crop {
  id: string;
  name: string;
  description?: string;
  typicalDurationDays?: number;
  waterRequirement?: string;
  suitableSoils?: string[];
}

function mapRow(r: any): Crop {
  return {
    id: r.id,
    name: r.name,
    description: r.description || undefined,
    typicalDurationDays: r.typical_duration_days ?? undefined,
    waterRequirement: r.water_requirement || undefined,
    suitableSoils: Array.isArray(r.suitable_soils) ? r.suitable_soils : undefined,
  };
}

const FALLBACK_CROPS: Crop[] = [
  { id: 'fallback-tomato', name: 'Tomato', typicalDurationDays: 105, waterRequirement: 'Moderate' },
  { id: 'fallback-rice', name: 'Rice', typicalDurationDays: 125, waterRequirement: 'High' },
  { id: 'fallback-maize', name: 'Maize', typicalDurationDays: 105, waterRequirement: 'Moderate' },
];

export const cropsApi = {
  async fetchActiveCrops(): Promise<Crop[]> {
    if (!supabase) return FALLBACK_CROPS;
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('id, name, description, typical_duration_days, water_requirement, suitable_soils')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error || !data || data.length === 0) return FALLBACK_CROPS;
      return data.map(mapRow);
    } catch {
      return FALLBACK_CROPS;
    }
  },
};
