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

export interface CropCycle {
  cropCycleId: string;
  landId: string;
  farmerId: string;
  cropName: string;
  plotName: string;
  areaAcres: number;
  landlord: string;
  status: 'active' | 'harvested' | 'fallow';
}
