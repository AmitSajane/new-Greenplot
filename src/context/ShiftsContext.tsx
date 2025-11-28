import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { shiftService } from '../services/shiftService';
import { Shift, ShiftActionType } from '../types/shifts';

interface ShiftsContextValue {
  shifts: Shift[];
  loading: boolean;
  refreshing: boolean;
  error?: string;
  pendingActions: Record<string, ShiftActionType>;
  refresh: () => Promise<void>;
  bookShift: (shiftId: string) => Promise<void>;
  cancelShift: (shiftId: string) => Promise<void>;
}

const ShiftsContext = createContext<ShiftsContextValue | undefined>(undefined);

export const ShiftsProvider = ({ children }: { children: React.ReactNode }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();
  const [pendingActions, setPendingActions] = useState<
    Record<string, ShiftActionType>
  >({});

  const loadShifts = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      const data = await shiftService.fetchShifts();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await shiftService.fetchShifts();
      setShifts(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const markPending = useCallback(
    (shiftId: string, action?: ShiftActionType) => {
      setPendingActions((prev) => {
        const next = { ...prev };
        if (action) {
          next[shiftId] = action;
        } else {
          delete next[shiftId];
        }
        return next;
      });
    },
    [],
  );

  const applyShiftUpdate = useCallback((updatedShift: Shift) => {
    setShifts((prev) =>
      prev.map((shift) => (shift.id === updatedShift.id ? updatedShift : shift)),
    );
  }, []);

  const bookShift = useCallback(
    async (shiftId: string) => {
      markPending(shiftId, 'book');
      try {
        const updated = await shiftService.bookShift(shiftId);
        applyShiftUpdate(updated);
      } finally {
        markPending(shiftId);
      }
    },
    [applyShiftUpdate, markPending],
  );

  const cancelShift = useCallback(
    async (shiftId: string) => {
      markPending(shiftId, 'cancel');
      try {
        const updated = await shiftService.cancelShift(shiftId);
        applyShiftUpdate(updated);
      } finally {
        markPending(shiftId);
      }
    },
    [applyShiftUpdate, markPending],
  );

  const value = useMemo(
    () => ({
      shifts,
      loading,
      refreshing,
      error,
      pendingActions,
      refresh,
      bookShift,
      cancelShift,
    }),
    [
      shifts,
      loading,
      refreshing,
      error,
      pendingActions,
      refresh,
      bookShift,
      cancelShift,
    ],
  );

  return (
    <ShiftsContext.Provider value={value}>{children}</ShiftsContext.Provider>
  );
};

export const useShifts = () => {
  const context = useContext(ShiftsContext);
  if (!context) {
    throw new Error('useShifts must be used within a ShiftsProvider');
  }
  return context;
};

