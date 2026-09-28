/** Carried as a route param from the Management Request form to its review
 *  screen — kept as plain serializable strings (no Date objects) since
 *  React Navigation params must be serializable. */
export interface ManagementRequestDraft {
  preferredCrop: string;
  farmingExperience: string;
  previousCrops: string;
  preferredStartDateIso: string;
  preferredStartDateLabel: string;
  expectedDuration: string;
  farmerNotes: string;
}
