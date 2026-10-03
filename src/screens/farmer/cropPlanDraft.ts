/** Carried as a route param from the Crop Plan form to its review screen —
 *  kept as plain serializable strings (no Date objects) since React
 *  Navigation params must be serializable. Mirrors managementRequestDraft.ts. */
export interface CropPlanDraft {
  cropId: string;
  cropName: string;
  variety: string;
  plannedPlantingDateIso: string;
  plannedPlantingDateLabel: string;
  expectedHarvestDateIso: string;
  expectedHarvestDateLabel: string;
  areaToCultivate: string;
  irrigationMethod: string;
  farmerNotes: string;
}
