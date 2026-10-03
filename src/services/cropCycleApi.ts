/**
 * Crop cycle data layer (Supabase).
 *
 * Maps DB rows (snake_case) ↔ app types (camelCase). Used by CropCycleContext
 * when Supabase is configured; otherwise the context falls back to in-memory
 * mock data so the app still runs with no backend.
 */
import { supabase } from './supabase';
import { CropCycle, CropHealthStatus } from '../modules/work/types';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

/** A cycle is still "the farm's current one" through harvest_ready/harvested
 *  — only 'completed' (or legacy 'fallow') retires it, per Step 9: the
 *  crop stays visible on the dashboard right through recording the harvest,
 *  and only drops out once the farmer explicitly completes the cycle. */
export const CURRENT_STATUSES = ['active', 'harvest_ready', 'harvested'];

const rowToApp = (r: any): CropCycle => ({
  cropCycleId: r.id,
  landId: r.land_id,
  leaseId: r.lease_id || undefined,
  farmerId: r.farmer_id,
  ownerId: r.owner_id || undefined,
  cropName: r.crop_name,
  plotName: r.plot_name,
  areaAcres: Number(r.area_acres) || 0,
  landlord: r.landlord || '',
  status: r.status,
  sownDate: r.sown_date || undefined,
  healthStatus: r.health_status || undefined,
  healthNote: r.health_note || undefined,
  cropId: r.crop_id || undefined,
  variety: r.variety || undefined,
  plannedPlantingDate: r.planned_planting_date || undefined,
  expectedHarvestDate: r.expected_harvest_date || undefined,
  currentStage: r.current_stage || undefined,
});

export interface SaveCropCycleInput {
  landId: string;
  /** The active lease this cycle belongs to — omit for self-farmed/own land.
   *  Scopes the lookup so re-leasing the same land never reuses a previous
   *  lease's crop cycle. */
  leaseId?: string;
  farmerId: string;
  ownerId?: string;
  plotName: string;
  areaAcres: number;
  landlord: string;
  cropName: string;
  /** Omit for a Farm-Management crop plan that hasn't actually been planted
   *  yet — CropDetailsScreen shows "Planting Not Started" until this (or a
   *  logged 'sowing' activity) is set. */
  sownDate?: string;
  healthStatus: CropHealthStatus;
  healthNote?: string;
  /** Farm-Management crop-plan fields — omit for legacy lease/self-farmed cycles. */
  cropId?: string;
  variety?: string;
  plannedPlantingDate?: string;
  expectedHarvestDate?: string;
  currentStage?: string;
}

export const cropCycleApi = {
  async fetchAll(): Promise<CropCycle[]> {
    const { data, error } = await db().from('crop_cycles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToApp);
  },

  /** Insert a new active cycle for (land, farmer, lease), or update the existing one.
   *  Scoping by `lease_id` (when present) keeps a new lease term on the same
   *  land from ever matching — and overwriting — a previous lease's cycle.
   *  Returns the cycle's id (existing or newly-inserted) — Step 7's activity
   *  generation needs it right after a crop plan is confirmed. */
  async save(input: SaveCropCycleInput): Promise<string> {
    const c = db();
    let query = c
      .from('crop_cycles')
      .select('id')
      .eq('land_id', input.landId)
      .eq('farmer_id', input.farmerId)
      .in('status', CURRENT_STATUSES);
    query = input.leaseId ? query.eq('lease_id', input.leaseId) : query.is('lease_id', null);
    const { data: existing, error: findError } = await query.maybeSingle();
    if (findError) throw findError;

    const row = {
      land_id: input.landId,
      lease_id: input.leaseId || null,
      farmer_id: input.farmerId,
      owner_id: input.ownerId || null,
      crop_name: input.cropName,
      plot_name: input.plotName,
      area_acres: input.areaAcres,
      landlord: input.landlord,
      sown_date: input.sownDate || null,
      health_status: input.healthStatus,
      health_note: input.healthNote || null,
      crop_id: input.cropId || null,
      variety: input.variety || null,
      planned_planting_date: input.plannedPlantingDate || null,
      expected_harvest_date: input.expectedHarvestDate || null,
      current_stage: input.currentStage || null,
    };

    if (existing) {
      const { error } = await c.from('crop_cycles').update(row).eq('id', existing.id);
      if (error) throw error;
      return existing.id as string;
    }
    const { data: inserted, error } = await c
      .from('crop_cycles')
      .insert({ ...row, status: 'active' })
      .select('id')
      .single();
    if (error || !inserted) throw error || new Error('Insert failed');
    return inserted.id as string;
  },

  /** Direct by-id update for status/stage transitions (Advance Stage, Record
   *  Harvest, Complete Crop Cycle) — deliberately NOT routed through
   *  `save()`'s find-by-`status='active'` upsert, since once status moves
   *  off `'active'` that lookup should stop matching this row (that's what
   *  lets the farmer start a fresh crop cycle on the same farm). */
  async updateFields(cropCycleId: string, fields: { status?: CropCycle['status']; currentStage?: string }): Promise<void> {
    const row: Record<string, any> = {};
    if (fields.status !== undefined) row.status = fields.status;
    if (fields.currentStage !== undefined) row.current_stage = fields.currentStage;
    if (Object.keys(row).length === 0) return;
    const { error } = await db().from('crop_cycles').update(row).eq('id', cropCycleId);
    if (error) throw error;
  },

  async remove(landId: string, farmerId: string, leaseId?: string): Promise<void> {
    let query = db()
      .from('crop_cycles')
      .delete()
      .eq('land_id', landId)
      .eq('farmer_id', farmerId)
      .eq('status', 'active');
    query = leaseId ? query.eq('lease_id', leaseId) : query.is('lease_id', null);
    const { error } = await query;
    if (error) throw error;
  },

  /** Subscribe to crop_cycles changes; `onChange` fires on any insert/update/delete. */
  subscribe(onChange: () => void): () => void {
    const c = db();
    const channel = c
      .channel('crop-cycles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crop_cycles' }, onChange)
      .subscribe();
    return () => {
      c.removeChannel(channel);
    };
  },
};
