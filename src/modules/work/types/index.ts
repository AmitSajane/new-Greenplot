/**
 * Work & Labor Management - Linked to CropCycle
 * CropCycle → WorkJob → Labor
 */

export type WorkType =
  | 'Harvesting'
  | 'Weeding'
  | 'Planting'
  | 'Plowing'
  | 'Irrigation'
  | 'Spraying'
  | 'Transplanting'
  | 'Threshing'
  | 'Other';

export type WorkJobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export type AttendanceStatus = 'present' | 'absent' | 'pending';

export type PaymentStatus = 'pending' | 'paid' | 'partial';

export interface WorkJob {
  jobId: string;
  cropCycleId: string;
  landId: string;
  farmerId: string;
  workType: WorkType;
  description: string;
  workersNeeded: number;
  workersHired: number;
  wagePerDay: number;
  workDate: string;
  startTime: string;
  endTime: string;
  status: WorkJobStatus;
  createdAt: string;
}

export interface LaborAssignment {
  assignmentId: string;
  jobId: string;
  laborId: string;
  assignedDate: string;
  attendanceStatus: AttendanceStatus;
  paymentStatus: PaymentStatus;
}

export interface JobApplication {
  applicationId: string;
  jobId: string;
  laborId: string;
  appliedDate: string;
  status: ApplicationStatus;
}

export type CropHealthStatus = 'healthy' | 'needs_water' | 'pest_alert';

export interface CropCycle {
  cropCycleId: string;
  landId: string;
  /** The specific lease term this cycle belongs to (undefined for self-farmed/own land,
   *  and also for a Farm-Management managed farm — those have no lease either). */
  leaseId?: string;
  farmerId: string;
  ownerId?: string;
  cropName: string;
  plotName: string;
  areaAcres: number;
  landlord: string;
  /** 'harvest_ready'/'harvested'/'completed' are Step 9 — a Farm-Management
   *  crop cycle's own lifecycle, independent of the Managed Farm's status
   *  (which never changes when a cycle completes; see cropCycleApi). */
  status: 'active' | 'harvest_ready' | 'harvested' | 'completed' | 'fallow';
  sownDate?: string;
  healthStatus?: CropHealthStatus;
  healthNote?: string;
  /** Farm-Management crop-plan fields — undefined for legacy lease/self-farmed cycles. */
  cropId?: string;
  variety?: string;
  plannedPlantingDate?: string;
  expectedHarvestDate?: string;
  currentStage?: string;
}

export type CropActivityType = 'sowing' | 'irrigation' | 'fertilizer' | 'weeding' | 'pest' | 'harvest' | 'other';

export interface CropActivity {
  activityId: string;
  cropCycleId: string;
  farmerId: string;
  ownerId?: string;
  type: CropActivityType;
  /** Farmer-given title; only meaningful (and required) when type is 'other'. */
  title?: string;
  note?: string;
  date: string;
  createdAt: string;
}

// ── Step 7: Crop Guidance + Farm Activities ─────────────────────────────
// A different, additive concept from CropActivity above: a scheduled task
// with status/priority (generated from crop_guidance master data), not a
// free-text history entry. The two are linked at the app layer (completing
// a FarmActivity mirrors a lightweight CropActivity entry) but not merged.

export type FarmActivityType =
  | 'IRRIGATION'
  | 'FERTILIZATION'
  | 'WEED_MANAGEMENT'
  | 'PEST_INSPECTION'
  | 'DISEASE_INSPECTION'
  | 'SPRAYING'
  | 'PRUNING'
  | 'EARTHING_UP'
  | 'HARVESTING'
  | 'OTHER';

export type FarmActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';

export type FarmActivityPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FarmActivity {
  activityId: string;
  landId?: string;
  cropCycleId: string;
  farmerId: string;
  ownerId?: string;
  activityType: FarmActivityType;
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  status: FarmActivityStatus;
  priority: FarmActivityPriority;
  farmerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmObservation {
  observationId: string;
  activityId?: string;
  /** Present whether or not this observation is tied to a specific activity
   *  (Step 8 — Farm Monitoring lets a farmer record one standalone). */
  cropCycleId?: string;
  farmerId: string;
  ownerId?: string;
  observation?: string;
  photoUrl?: string;
  /** The crop stage this was recorded at, e.g. for the Monitoring timeline. */
  cropStage?: string;
  createdAt: string;
}

export interface CropGuidance {
  guidanceId: string;
  cropId: string;
  cropStage: string;
  title: string;
  description: string;
  activityType: FarmActivityType;
  recommendedDay: number;
  priority: FarmActivityPriority;
}

// ── Step 9: Harvest, Farm Performance & Crop Cycle Completion ───────────

export interface HarvestRecord {
  harvestRecordId: string;
  cropCycleId: string;
  landId?: string;
  farmerId: string;
  ownerId?: string;
  harvestDate: string;
  harvestedArea?: number;
  quantity?: number;
  unit?: string;
  qualityGrade?: string;
  notes?: string;
  photoUrls?: string[];
  createdAt: string;
}
