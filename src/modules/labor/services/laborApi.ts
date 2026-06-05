import { Job, Labor, Application, AttendanceRecord } from '../types';
import { MOCK_JOBS, MOCK_LABORERS, MOCK_APPLICATIONS, MOCK_ATTENDANCE } from '../mockData';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(() => r(), ms));

export const laborApi = {
  async getJobs(farmerId?: string): Promise<Job[]> {
    await delay(300);
    if (farmerId) {
      return MOCK_JOBS.filter((j) => j.farmerId === farmerId);
    }
    return MOCK_JOBS;
  },

  async getLaborers(): Promise<Labor[]> {
    await delay(300);
    return MOCK_LABORERS;
  },

  async getApplicationsByFarmer(farmerId: string): Promise<Application[]> {
    await delay(300);
    return MOCK_APPLICATIONS.filter((a) => a.job.farmerId === farmerId);
  },

  async getApplicationsByLaborer(laborId: string): Promise<Application[]> {
    await delay(300);
    return MOCK_APPLICATIONS.filter((a) => a.laborId === laborId);
  },

  async getAttendance(jobId?: string): Promise<AttendanceRecord[]> {
    await delay(300);
    if (jobId) {
      return MOCK_ATTENDANCE.filter((r) => r.jobId === jobId);
    }
    return MOCK_ATTENDANCE;
  },
};
