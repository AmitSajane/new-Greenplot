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

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
  state?: string;
}

export interface Labor {
  laborId: string;
  name: string;
  phone: string;
  skills: string[];
  wageExpected: number;
  rating: number;
  experienceYears: number;
  location: Location;
  avatarUrl?: string;
}

export interface Job {
  jobId: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  workType: WorkType;
  cropType: string;
  acres?: number;
  hours?: number;
  workersNeeded: number;
  workersHired: number;
  wagePerDay: number;
  workDate: string;
  location: Location;
  notes?: string;
  status: JobStatus;
  createdAt: string;
}

export interface Application {
  applicationId: string;
  jobId: string;
  laborId: string;
  labor: Labor;
  job: Job;
  status: ApplicationStatus;
  appliedAt: string;
  message?: string;
}

export interface AttendanceRecord {
  id: string;
  jobId: string;
  laborId: string;
  laborName: string;
  date: string;
  present: boolean;
  wageAmount: number;
  notes?: string;
}

export interface JobFilters {
  workType?: WorkType;
  minWage?: number;
  maxDistance?: number;
  sortBy?: 'distance' | 'wage' | 'date';
}
