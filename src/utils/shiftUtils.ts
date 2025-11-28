import { Shift } from '../types/shifts';

const dayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
});

export interface ShiftSection {
  title: string;
  rawDate: string;
  data: Shift[];
}

export const groupShiftsByDate = (shifts: Shift[]): ShiftSection[] => {
  const grouped = shifts.reduce<Record<string, Shift[]>>((acc, shift) => {
    const dateKey = new Date(shift.startTime).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(shift);
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(
      ([a], [b]) =>
        new Date(a).getTime() - new Date(b).getTime(),
    )
    .map(([rawDate, items]) => ({
      rawDate,
      title: dayFormatter.format(new Date(rawDate)),
      data: items.sort(
        (shiftA, shiftB) =>
          new Date(shiftA.startTime).getTime() -
          new Date(shiftB.startTime).getTime(),
      ),
    }));
};

export const formatShiftTimeRange = (shift: Shift) =>
  `${timeFormatter.format(new Date(shift.startTime))} - ${timeFormatter.format(
    new Date(shift.endTime),
  )}`;

export const getShiftDuration = (shift: Shift) => {
  const durationInHours =
    (new Date(shift.endTime).getTime() -
      new Date(shift.startTime).getTime()) /
    1000 /
    60 /
    60;
  const rounded =
    Number.isInteger(durationInHours)
      ? durationInHours
      : Number(durationInHours.toFixed(1));
  return `${rounded}h`;
};

export const getUniqueCities = (shifts: Shift[]): string[] => {
  const cities = Array.from(new Set(shifts.map((shift) => shift.city)));
  return cities.sort();
};

