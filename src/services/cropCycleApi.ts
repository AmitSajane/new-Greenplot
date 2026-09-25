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
  sownDate: string;
  healthStatus: CropHealthStatus;
  healthNote?: string;
}

export const cropCycleApi = {
  async fetchAll(): Promise<CropCycle[]> {
    const { data, error } = await db().from('crop_cycles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToApp);
  },

  /** Insert a new active cycle for (land, farmer, lease), or update the existing one.
   *  Scoping by `lease_id` (when present) keeps a new lease term on the same
   *  land from ever matching — and overwriting — a previous lease's cycle. */
  async save(input: SaveCropCycleInput): Promise<void> {
    const c = db();
    let query = c
      .from('crop_cycles')
      .select('id')
      .eq('land_id', input.landId)
      .eq('farmer_id', input.farmerId)
      .eq('status', 'active');
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
      sown_date: input.sownDate,
      health_status: input.healthStatus,
      health_note: input.healthNote || null,
    };

    if (existing) {
      const { error } = await c.from('crop_cycles').update(row).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await c.from('crop_cycles').insert({ ...row, status: 'active' });
      if (error) throw error;
    }
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
