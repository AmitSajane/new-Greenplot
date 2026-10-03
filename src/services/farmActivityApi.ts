/**
 * Farm activity data layer (Supabase) — Step 7's scheduled task list,
 * generated from crop_guidance master data when a crop plan is confirmed.
 * Distinct from cropActivityApi's free-text history log (see types/index.ts).
 */
import { supabase } from './supabase';
import { FarmActivity, FarmActivityStatus } from '../modules/work/types';
import { cropGuidanceApi } from './cropGuidanceApi';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const rowToApp = (r: any): FarmActivity => ({
  activityId: r.id,
  landId: r.land_id || undefined,
  cropCycleId: r.crop_cycle_id,
  farmerId: r.farmer_id,
  ownerId: r.owner_id || undefined,
  activityType: r.activity_type,
  title: r.title,
  description: r.description || undefined,
  scheduledDate: r.scheduled_date,
  completedDate: r.completed_date || undefined,
  status: r.status,
  priority: r.priority,
  farmerNotes: r.farmer_notes || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface GenerateActivitiesInput {
  cropCycleId: string;
  landId: string;
  farmerId: string;
  ownerId?: string;
  cropId?: string;
  plannedPlantingDate: string;
}

export const farmActivityApi = {
  async fetchByCropCycle(cropCycleId: string): Promise<FarmActivity[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await db()
        .from('farm_activities')
        .select('*')
        .eq('crop_cycle_id', cropCycleId)
        .order('scheduled_date', { ascending: true });
      if (error || !data) return [];
      return data.map(rowToApp);
    } catch {
      return [];
    }
  },

  /** No-ops for a custom "Other" crop (no cropId → no guidance) or if
   *  activities already exist for this cycle (idempotent against re-saving
   *  a plan). Best-effort — callers should treat failure as non-fatal. */
  async generateFromGuidance(input: GenerateActivitiesInput): Promise<void> {
    if (!supabase || !input.cropId) return;
    const existing = await this.fetchByCropCycle(input.cropCycleId);
    if (existing.length > 0) return;

    const guidance = await cropGuidanceApi.fetchForCrop(input.cropId);
    if (guidance.length === 0) return;

    const rows = guidance.map((g) => ({
      land_id: input.landId,
      crop_cycle_id: input.cropCycleId,
      farmer_id: input.farmerId,
      owner_id: input.ownerId || null,
      activity_type: g.activityType,
      title: g.title,
      description: g.description,
      scheduled_date: addDays(input.plannedPlantingDate, g.recommendedDay),
      status: 'PENDING',
      priority: g.priority,
    }));

    const { error } = await db().from('farm_activities').insert(rows);
    if (error) throw error;
  },

  async markCompleted(
    activityId: string,
    input: { completedDate: string; farmerNotes?: string },
  ): Promise<void> {
    const { error } = await db()
      .from('farm_activities')
      .update({
        status: 'COMPLETED',
        completed_date: input.completedDate,
        farmer_notes: input.farmerNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId);
    if (error) throw error;
  },

  async updateStatus(activityId: string, status: FarmActivityStatus): Promise<void> {
    const { error } = await db()
      .from('farm_activities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', activityId);
    if (error) throw error;
  },

  /** Subscribe to changes on one crop cycle's activities; `onChange` fires on any insert/update/delete. */
  subscribe(cropCycleId: string, onChange: () => void): () => void {
    if (!supabase) return () => {};
    const c = db();
    const channel = c
      // Unique per call: removeChannel() is async, so a fixed name can hand
      // back the still-subscribed channel from a previous mount and .on()
      // then throws "cannot add `postgres_changes` callbacks ... after
      // `subscribe()`" (see notificationsApi.subscribe).
      .channel(`farm-activities-${cropCycleId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'farm_activities', filter: `crop_cycle_id=eq.${cropCycleId}` },
        onChange,
      )
      .subscribe();
    return () => {
      c.removeChannel(channel);
    };
  },
};
