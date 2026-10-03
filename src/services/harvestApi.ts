/**
 * Harvest record data layer (Supabase) — Step 9. A crop cycle can have more
 * than one harvest record (multi-harvest crops), so this is append-only;
 * completing the crop cycle is a separate step (see cropCycleApi.updateFields).
 */
import { supabase } from './supabase';
import { HarvestRecord } from '../modules/work/types';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const rowToApp = (r: any): HarvestRecord => ({
  harvestRecordId: r.id,
  cropCycleId: r.crop_cycle_id,
  landId: r.land_id || undefined,
  farmerId: r.farmer_id,
  ownerId: r.owner_id || undefined,
  harvestDate: r.harvest_date,
  harvestedArea: r.harvested_area == null ? undefined : Number(r.harvested_area),
  quantity: r.quantity == null ? undefined : Number(r.quantity),
  unit: r.unit || undefined,
  qualityGrade: r.quality_grade || undefined,
  notes: r.notes || undefined,
  photoUrls: Array.isArray(r.photo_urls) ? r.photo_urls : undefined,
  createdAt: r.created_at,
});

export interface RecordHarvestInput {
  cropCycleId: string;
  landId?: string;
  farmerId: string;
  ownerId?: string;
  harvestDate: string;
  harvestedArea?: number;
  quantity?: number;
  unit?: string;
  qualityGrade?: string;
  notes?: string;
  photoUrls?: string[];
}

export const harvestApi = {
  async fetchByCropCycle(cropCycleId: string): Promise<HarvestRecord[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await db()
        .from('harvest_records')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .order('harvest_date', { ascending: false });
      if (error || !data) return [];
      return data.map(rowToApp);
    } catch {
      return [];
    }
  },

  /** One query for Crop History's list of past cycles, keyed by cycle id. */
  async fetchByCropCycleIds(cropCycleIds: string[]): Promise<Record<string, HarvestRecord[]>> {
    if (!supabase || cropCycleIds.length === 0) return {};
    try {
      const { data, error } = await db()
        .from('harvest_records')
        .select('*')
        .in('crop_cycle_id', cropCycleIds)
        .order('harvest_date', { ascending: false });
      if (error || !data) return {};
      const byCycle: Record<string, HarvestRecord[]> = {};
      data.map(rowToApp).forEach((r) => {
        (byCycle[r.cropCycleId] ||= []).push(r);
      });
      return byCycle;
    } catch {
      return {};
    }
  },

  async record(input: RecordHarvestInput): Promise<void> {
    const { error } = await db().from('harvest_records').insert({
      crop_cycle_id: input.cropCycleId,
      land_id: input.landId || null,
      farmer_id: input.farmerId,
      owner_id: input.ownerId || null,
      harvest_date: input.harvestDate,
      harvested_area: input.harvestedArea ?? null,
      quantity: input.quantity ?? null,
      unit: input.unit || null,
      quality_grade: input.qualityGrade || null,
      notes: input.notes || null,
      photo_urls: input.photoUrls && input.photoUrls.length > 0 ? input.photoUrls : null,
    });
    if (error) throw error;
  },
};
