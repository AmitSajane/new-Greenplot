import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WorkJob } from '../types';
import { workJobApi } from '../services/workJobApi';

interface WorkState {
  jobs: Record<string, WorkJob>;
  jobsByCropCycle: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkState = {
  jobs: {},
  jobsByCropCycle: {},
  isLoading: false,
  error: null,
};

export const fetchWorkJobs = createAsyncThunk(
  'work/fetchWorkJobs',
  async (farmerId?: string) => {
    await new Promise<void>((r) => setTimeout(() => r(), 300));
    const jobs = farmerId
      ? await workJobApi.getJobsByFarmer(farmerId)
      : await workJobApi.getJobsList();
    return jobs;
  }
);

export const createWorkJob = createAsyncThunk(
  'work/createWorkJob',
  async (job: Omit<WorkJob, 'jobId' | 'createdAt' | 'workersHired'>) => {
    return workJobApi.createJob(job);
  }
);

const workSlice = createSlice({
  name: 'work',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkJobs.fulfilled, (state, action) => {
        const jobs = action.payload;
        state.jobs = jobs.reduce((acc, j) => ({ ...acc, [j.jobId]: j }), {});
        state.jobsByCropCycle = {};
        jobs.forEach((j) => {
          if (!state.jobsByCropCycle[j.cropCycleId]) {
            state.jobsByCropCycle[j.cropCycleId] = [];
          }
          state.jobsByCropCycle[j.cropCycleId].push(j.jobId);
        });
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchWorkJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkJob.fulfilled, (state, action) => {
        const j = action.payload;
        state.jobs[j.jobId] = j;
        if (!state.jobsByCropCycle[j.cropCycleId]) {
          state.jobsByCropCycle[j.cropCycleId] = [];
        }
        state.jobsByCropCycle[j.cropCycleId].push(j.jobId);
      });
  },
});

export default workSlice.reducer;
