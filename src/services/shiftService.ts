import { mockShifts } from '../constants/mockShifts';
import { Shift } from '../types/shifts';

const simulateDelay = (duration = 450) =>
  new Promise((resolve) => setTimeout(resolve, duration));

let inMemoryShifts: Shift[] = [...mockShifts];

const cloneShifts = (shifts: Shift[]) =>
  shifts.map((shift) => ({ ...shift }));

const updateShift = (id: string, booked: boolean): Shift => {
  const index = inMemoryShifts.findIndex((shift) => shift.id === id);
  if (index === -1) {
    throw new Error('Shift not found');
  }

  const existing = inMemoryShifts[index];
  if (existing.booked === booked) {
    throw new Error(
      booked ? 'Shift already booked' : 'Shift is not currently booked',
    );
  }

  const updated: Shift = { ...existing, booked };
  inMemoryShifts[index] = updated;
  return updated;
};

export const shiftService = {
  async fetchShifts(): Promise<Shift[]> {
    await simulateDelay();
    return cloneShifts(inMemoryShifts);
  },
  async bookShift(id: string): Promise<Shift> {
    await simulateDelay();
    return updateShift(id, true);
  },
  async cancelShift(id: string): Promise<Shift> {
    await simulateDelay();
    return updateShift(id, false);
  },
  async resetShifts() {
    inMemoryShifts = [...mockShifts];
    await simulateDelay(200);
    return cloneShifts(inMemoryShifts);
  },
};

