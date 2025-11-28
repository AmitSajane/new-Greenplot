export interface Shift {
  id: string;
  facility: string;
  role: string;
  area: string;
  city: string;
  hourlyRate: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  booked: boolean;
  premium?: boolean;
}

export type ShiftActionType = 'book' | 'cancel';

