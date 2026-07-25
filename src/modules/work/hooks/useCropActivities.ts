import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../../../services/supabase';
import { cropActivityApi } from '../../../services/cropActivityApi';
import { CropActivity, CropActivityType } from '../types';

// In-memory fallback so the screen still works with no Supabase configured.
// Keyed by cropCycleId; lost on reload, same tradeoff as the rest of the app's mock mode.
const localStore: Record<string, CropActivity[]> = {};
const uid = () => `ca_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

export interface AddCropActivityInput {
  type: CropActivityType;
  title?: string;
  note?: string;
  date: string;
}

export function useCropActivities(cropCycleId: string, farmerId?: string, ownerId?: string) {
  const [activities, setActivities] = useState<CropActivity[]>(() => localStore[cropCycleId] || []);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setActivities(await cropActivityApi.fetchByCropCycle(cropCycleId));
    } catch {
      /* network hiccup — keep last good state */
    } finally {
      setLoading(false);
    }
  }, [cropCycleId]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setActivities(localStore[cropCycleId] || []);
      return;
    }
    refetch();
    return cropActivityApi.subscribe(cropCycleId, refetch);
  }, [cropCycleId, refetch]);

  const addActivity = useCallback(
    async (input: AddCropActivityInput) => {
      if (!farmerId) return;
      if (isSupabaseConfigured) {
        await cropActivityApi.add({ ...input, cropCycleId, farmerId, ownerId });
        await refetch();
        return;
      }
      const entry: CropActivity = {
        activityId: uid(),
        cropCycleId,
        farmerId,
        ownerId,
        createdAt: new Date().toISOString(),
        ...input,
      };
      const next = [...(localStore[cropCycleId] || []), entry];
      localStore[cropCycleId] = next;
      setActivities(next);
    },
    [cropCycleId, farmerId, ownerId, refetch],
  );

  return { activities, loading, addActivity };
}
