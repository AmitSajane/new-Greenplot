/**
 * Crop activity log data layer (Supabase).
 *
 * Maps DB rows (snake_case) ↔ app types (camelCase). Used by useCropActivities
 * when Supabase is configured; otherwise the hook falls back to an in-memory
 * list so the screen still works with no backend.
 */
import { supabase } from './supabase';
import { CropActivity, CropActivityType } from '../modules/work/types';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

const rowToApp = (r: any): CropActivity => ({
  activityId: r.id,
  cropCycleId: r.crop_cycle_id,
  farmerId: r.farmer_id,
  ownerId: r.owner_id || undefined,
  type: r.type,
  title: r.title || undefined,
  note: r.note || undefined,
  date: r.activity_date,
  createdAt: r.created_at,
});

export interface AddCropActivityInput {
  cropCycleId: string;
  farmerId: string;
  ownerId?: string;
  type: CropActivityType;
  title?: string;
  note?: string;
  date: string;
}

export const cropActivityApi = {
  async fetchByCropCycle(cropCycleId: string): Promise<CropActivity[]> {
    const { data, error } = await db()
      .from('crop_activities')
      .select('*')
      .eq('crop_cycle_id', cropCycleId)
      .order('activity_date', { ascending: true });
    if (error) throw error;
    return (data || []).map(rowToApp);
  },

  async add(input: AddCropActivityInput): Promise<void> {
    const { error } = await db().from('crop_activities').insert({
      crop_cycle_id: input.cropCycleId,
      farmer_id: input.farmerId,
      owner_id: input.ownerId || null,
      type: input.type,
      title: input.title || null,
      note: input.note || null,
      activity_date: input.date,
    });
    if (error) throw error;
  },

  /** Subscribe to changes on one crop's activities; `onChange` fires on any insert/update/delete. */
  subscribe(cropCycleId: string, onChange: () => void): () => void {
    const c = db();
    const channel = c
      .channel(`crop-activities-${cropCycleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crop_activities', filter: `crop_cycle_id=eq.${cropCycleId}` },
        onChange,
      )
      .subscribe();
    return () => {
      c.removeChannel(channel);
    };
  },
};
