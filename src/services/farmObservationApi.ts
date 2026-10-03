/**
 * Farm observation data layer (Supabase) — farmer notes/photos recorded
 * against a Step 7 farm activity.
 */
import { supabase } from './supabase';
import { FarmObservation } from '../modules/work/types';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const rowToApp = (r: any): FarmObservation => ({
  observationId: r.id,
  activityId: r.activity_id || undefined,
  cropCycleId: r.crop_cycle_id || undefined,
  farmerId: r.farmer_id,
  ownerId: r.owner_id || undefined,
  observation: r.observation || undefined,
  photoUrl: r.photo_url || undefined,
  cropStage: r.crop_stage || undefined,
  createdAt: r.created_at,
});

export interface AddFarmObservationInput {
  activityId?: string;
  cropCycleId?: string;
  farmerId: string;
  ownerId?: string;
  observation?: string;
  photoUrl?: string;
  cropStage?: string;
}

export const farmObservationApi = {
  async fetchByActivity(activityId: string): Promise<FarmObservation[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await db()
        .from('farm_observations')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(rowToApp);
    } catch {
      return [];
    }
  },

  /** Recent observations across a set of activity ids (typically all of one
   *  crop cycle's activities) — used by the Farm Health tab and the
   *  landowner's read-only preview. */
  async fetchRecentForActivities(activityIds: string[], limit = 5): Promise<FarmObservation[]> {
    if (!supabase || activityIds.length === 0) return [];
    try {
      const { data, error } = await db()
        .from('farm_observations')
        .select('*')
        .in('activity_id', activityIds)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error || !data) return [];
      return data.map(rowToApp);
    } catch {
      return [];
    }
  },

  /** All observations recorded for a farm's crop cycle — the primary lookup
   *  for the Monitoring > Observations tab and the Monitoring Timeline. */
  async fetchByCropCycle(cropCycleId: string): Promise<FarmObservation[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await db()
        .from('farm_observations')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(rowToApp);
    } catch {
      return [];
    }
  },

  async add(input: AddFarmObservationInput): Promise<void> {
    if (!input.observation && !input.photoUrl) return;
    const { error } = await db().from('farm_observations').insert({
      activity_id: input.activityId || null,
      crop_cycle_id: input.cropCycleId || null,
      farmer_id: input.farmerId,
      owner_id: input.ownerId || null,
      observation: input.observation || null,
      photo_url: input.photoUrl || null,
      crop_stage: input.cropStage || null,
    });
    if (error) throw error;
  },
};
