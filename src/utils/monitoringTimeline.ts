import { FarmActivity, FarmObservation } from '../modules/work/types';

export interface TimelineEntry {
  key: string;
  date: string;
  icon: string;
  title: string;
  note?: string;
}

/** Merges completed activities + observations into one dated list for the
 *  Farm Monitoring Timeline — no new fetch, just a merge of data the
 *  dashboard already loads (spec: "without duplicating records from the
 *  activity system"). */
export function buildTimeline(activities: FarmActivity[], observations: FarmObservation[]): TimelineEntry[] {
  const activityEntries: TimelineEntry[] = activities
    .filter((a) => a.status === 'COMPLETED' && a.completedDate)
    .map((a) => ({
      key: `activity-${a.activityId}`,
      date: a.completedDate as string,
      icon: 'checkmark-circle-outline',
      title: `${a.title} completed`,
      note: a.farmerNotes,
    }));

  const observationEntries: TimelineEntry[] = observations.map((o) => ({
    key: `observation-${o.observationId}`,
    date: o.createdAt.slice(0, 10),
    icon: 'chatbox-ellipses-outline',
    title: 'Farmer observation added',
    note: o.observation,
  }));

  return [...activityEntries, ...observationEntries].sort((a, b) => b.date.localeCompare(a.date));
}
