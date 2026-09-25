import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CropCycle } from '../modules/work/types';
import { MOCK_CROP_CYCLES } from '../modules/work/mockData/cropCycles';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { cropCycleApi, SaveCropCycleInput } from '../services/cropCycleApi';

export type { SaveCropCycleInput } from '../services/cropCycleApi';

const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

interface CropCycleContextType {
  cropCycles: CropCycle[];
  getCropCycleById: (cropCycleId: string) => CropCycle | undefined;
  /** `leaseId` scopes the match to one specific lease term — pass it whenever
   *  the plot is leased so a new lease on the same land never picks up a
   *  previous lease's crop cycle. Omit only for self-farmed (own) land. */
  getCropCycleByLand: (landId: string, farmerId: string, leaseId?: string) => CropCycle | undefined;
  /** Resolves once the save has actually landed (or rejects with the real
   *  error) — callers should await this before telling the user it saved. */
  saveCropCycle: (input: SaveCropCycleInput) => Promise<void>;
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
          c.status === 'active' &&
          (leaseId ? c.leaseId === leaseId : !c.leaseId),
      ),
    [cropCycles],
  );

  const saveCropCycle = useCallback(
    async (input: SaveCropCycleInput) => {
      if (supabase) {
        await cropCycleApi.save(input);
        await refetch();
        return;
      }
      setCropCycles((prev) => {
        const existing = prev.find(
          (c) =>
            c.landId === input.landId &&
            c.farmerId === input.farmerId &&
            c.status === 'active' &&
            (input.leaseId ? c.leaseId === input.leaseId : !c.leaseId),
        );
        if (existing) {
          return prev.map((c) => (c.cropCycleId === existing.cropCycleId ? { ...c, ...input } : c));
        }
        return [{ cropCycleId: uid('cc'), status: 'active', ...input }, ...prev];
      });
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
    () => ({ cropCycles, getCropCycleById, getCropCycleByLand, saveCropCycle, removeCropCycle }),
    [cropCycles, getCropCycleById, getCropCycleByLand, saveCropCycle, removeCropCycle],
  );

  return <CropCycleContext.Provider value={value}>{children}</CropCycleContext.Provider>;
}

export function useCropCycles() {
  const ctx = useContext(CropCycleContext);
  if (!ctx) throw new Error('useCropCycles must be used within a CropCycleProvider');
  return ctx;
}
