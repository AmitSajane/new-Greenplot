import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CropCycle } from '../modules/work/types';
import { MOCK_CROP_CYCLES } from '../modules/work/mockData/cropCycles';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { cropCycleApi, CURRENT_STATUSES, SaveCropCycleInput } from '../services/cropCycleApi';

export type { SaveCropCycleInput } from '../services/cropCycleApi';

const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

interface CropCycleContextType {
  cropCycles: CropCycle[];
  getCropCycleById: (cropCycleId: string) => CropCycle | undefined;
  /** `leaseId` scopes the match to one specific lease term — pass it whenever
   *  the plot is leased so a new lease on the same land never picks up a
   *  previous lease's crop cycle. Omit only for self-farmed (own) land. */
  getCropCycleByLand: (landId: string, farmerId: string, leaseId?: string) => CropCycle | undefined;
  /** Resolves with the cycle's id once the save has actually landed (or
   *  rejects with the real error) — callers should await this before
   *  telling the user it saved. */
  saveCropCycle: (input: SaveCropCycleInput) => Promise<string>;
  /** Status/stage transitions (Advance Stage, Record Harvest, Complete Crop
   *  Cycle) — a direct by-id update, not the find-or-create upsert `saveCropCycle` does. */
  updateCropCycle: (cropCycleId: string, fields: { status?: CropCycle['status']; currentStage?: string }) => Promise<void>;
  removeCropCycle: (landId: string, farmerId: string, leaseId?: string) => Promise<void>;
}

const CropCycleContext = createContext<CropCycleContextType | undefined>(undefined);

export function CropCycleProvider({ children }: { children: ReactNode }) {
  const [cropCycles, setCropCycles] = useState<CropCycle[]>(isSupabaseConfigured ? [] : MOCK_CROP_CYCLES);

  const refetch = useCallback(async () => {
    if (!supabase) return;
    try {
      setCropCycles(await cropCycleApi.fetchAll());
    } catch {
      /* network hiccup — keep last good state */
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    refetch();
    return cropCycleApi.subscribe(refetch); // any change on any phone → refetch
  }, [refetch]);

  const getCropCycleById = useCallback(
    (cropCycleId: string) => cropCycles.find((c) => c.cropCycleId === cropCycleId),
    [cropCycles],
  );

  const getCropCycleByLand = useCallback(
    (landId: string, farmerId: string, leaseId?: string) =>
      cropCycles.find(
        (c) =>
          c.landId === landId &&
          c.farmerId === farmerId &&
          CURRENT_STATUSES.includes(c.status) &&
          (leaseId ? c.leaseId === leaseId : !c.leaseId),
      ),
    [cropCycles],
  );

  const saveCropCycle = useCallback(
    async (input: SaveCropCycleInput) => {
      if (supabase) {
        const id = await cropCycleApi.save(input);
        await refetch();
        return id;
      }
      const existing = cropCycles.find(
        (c) =>
          c.landId === input.landId &&
          c.farmerId === input.farmerId &&
          CURRENT_STATUSES.includes(c.status) &&
          (input.leaseId ? c.leaseId === input.leaseId : !c.leaseId),
      );
      const id = existing?.cropCycleId ?? uid('cc');
      setCropCycles((prev) => {
        if (existing) {
          return prev.map((c) => (c.cropCycleId === existing.cropCycleId ? { ...c, ...input } : c));
        }
        return [{ cropCycleId: id, status: 'active', ...input }, ...prev];
      });
      return id;
    },
    [refetch, cropCycles],
  );

  const updateCropCycle = useCallback(
    async (cropCycleId: string, fields: { status?: CropCycle['status']; currentStage?: string }) => {
      if (supabase) {
        await cropCycleApi.updateFields(cropCycleId, fields);
        await refetch();
        return;
      }
      setCropCycles((prev) => prev.map((c) => (c.cropCycleId === cropCycleId ? { ...c, ...fields } : c)));
    },
    [refetch],
  );

  const removeCropCycle = useCallback(
    async (landId: string, farmerId: string, leaseId?: string) => {
      if (supabase) {
        await cropCycleApi.remove(landId, farmerId, leaseId);
        await refetch();
        return;
      }
      setCropCycles((prev) =>
        prev.filter(
          (c) =>
            !(
              c.landId === landId &&
              c.farmerId === farmerId &&
              c.status === 'active' &&
              (leaseId ? c.leaseId === leaseId : !c.leaseId)
            ),
        ),
      );
    },
    [refetch],
  );

  const value = useMemo(
    () => ({ cropCycles, getCropCycleById, getCropCycleByLand, saveCropCycle, updateCropCycle, removeCropCycle }),
    [cropCycles, getCropCycleById, getCropCycleByLand, saveCropCycle, updateCropCycle, removeCropCycle],
  );

  return <CropCycleContext.Provider value={value}>{children}</CropCycleContext.Provider>;
}

export function useCropCycles() {
  const ctx = useContext(CropCycleContext);
  if (!ctx) throw new Error('useCropCycles must be used within a CropCycleProvider');
  return ctx;
}
