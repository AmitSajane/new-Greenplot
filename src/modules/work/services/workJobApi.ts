/**
 * Mock REST APIs for Work & Labor Management
 */

import { WorkJob, JobApplication, LaborAssignment } from '../types';
import { MOCK_WORK_JOBS } from '../mockData/workJobs';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(() => r(), ms));

// Mutable store (copy of mock for createJob)
const workJobsStore: WorkJob[] = [...MOCK_WORK_JOBS];
const applications: JobApplication[] = [];
const assignments: LaborAssignment[] = [];

export const workJobApi = {
  async getJobsList(): Promise<WorkJob[]> {
    await delay(300);
    return workJobsStore;
  },

  async getJobsByFarmer(farmerId: string): Promise<WorkJob[]> {
    await delay(300);
    return workJobsStore.filter((j) => j.farmerId === farmerId);
  },

  async getJobsByCropCycle(cropCycleId: string): Promise<WorkJob[]> {
    await delay(300);
    return workJobsStore.filter((j) => j.cropCycleId === cropCycleId);
  },

  async getJobById(jobId: string): Promise<WorkJob | null> {
    await delay(200);
    return workJobsStore.find((j) => j.jobId === jobId) ?? null;
  },

  async applyForJob(jobId: string, laborId: string): Promise<{ status: string; applicationId: string }> {
    await delay(400);
    const applicationId = `APP${Date.now()}`;
    applications.push({
      applicationId,
      jobId,
      laborId,
      appliedDate: new Date().toISOString(),
      status: 'pending',
    });
    return { status: 'Applied', applicationId };
  },

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    await delay(300);
    return applications.filter((a) => a.jobId === jobId);
  },

  async assignLabor(jobId: string, laborId: string): Promise<{ status: string; assignmentId: string }> {
    await delay(400);
    const assignmentId = `ASG${Date.now()}`;
    assignments.push({
      assignmentId,
      jobId,
      laborId,
      assignedDate: new Date().toISOString(),
      attendanceStatus: 'pending',
      paymentStatus: 'pending',
    });
    return { status: 'Assigned', assignmentId };
  },

  async createJob(job: Omit<WorkJob, 'jobId' | 'createdAt' | 'workersHired'>): Promise<WorkJob> {
    await delay(400);
    const newJob: WorkJob = {
      ...job,
      jobId: `JOB${Date.now()}`,
      workersHired: 0,
      createdAt: new Date().toISOString(),
    };
    workJobsStore.push(newJob);
    return newJob;
  },
};
