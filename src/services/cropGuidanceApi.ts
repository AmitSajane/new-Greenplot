/**
 * Crop guidance master data (Supabase). Read-only reference data driving
 * farmActivityApi.generateFromGuidance — not hard-coded in the UI.
 */
import { supabase } from './supabase';
import { CropGuidance } from '../modules/work/types';

const rowToApp = (r: any): CropGuidance => ({
  guidanceId: r.id,
  cropId: r.crop_id,
  cropStage: r.crop_stage,
  title: r.title,
  description: r.description,
  activityType: r.activity_type,
  recommendedDay: r.recommended_day,
  priority: r.priority,
});

export const cropGuidanceApi = {
  async fetchForCrop(cropId: string): Promise<CropGuidance[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('crop_guidance')
        .select('*')
        .eq('crop_id', cropId)
        .order('recommended_day', { ascending: true });
      if (error || !data) return [];
      return data.map(rowToApp);
    } catch {
      return [];
    }
  },
};
