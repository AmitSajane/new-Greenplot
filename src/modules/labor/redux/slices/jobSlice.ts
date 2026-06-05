import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Job, JobFilters } from '../../types';
import { MOCK_JOBS } from '../../mockData';

interface JobState {
  jobs: Job[];
  filteredJobs: Job[];
  myPostedJobs: Job[];
  filters: JobFilters;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_FARMER_ID = 'F001';

const initialState: JobState = {
  jobs: MOCK_JOBS,
  filteredJobs: MOCK_JOBS,
  myPostedJobs: MOCK_JOBS.filter((j) => j.farmerId === DEFAULT_FARMER_ID),
  filters: {},
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'job/fetchJobs',
  async (farmerId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 300));
      return { jobs: MOCK_JOBS, farmerId };
    } catch (e) {
      return rejectWithValue('Failed to fetch jobs');
    }
  }
);

export const postJob = createAsyncThunk(
  'job/postJob',
  async (job: Omit<Job, 'jobId' | 'createdAt' | 'workersHired' | 'status'>, { rejectWithValue }) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 400));
      const newJob: Job = {
        ...job,
        jobId: `J${Date.now()}`,
        workersHired: 0,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      return newJob;
    } catch (e) {
      return rejectWithValue('Failed to post job');
    }
  }
);

export const updateJobWorkers = createAsyncThunk(
  'job/updateJobWorkers',
  async (
    { jobId, workersHired }: { jobId: string; workersHired: number },
    { getState, rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 200));
      return { jobId, workersHired };
    } catch (e) {
      return rejectWithValue('Failed to update job');
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setFilters: (state, action: { payload: JobFilters }) => {
      state.filters = { ...state.filters, ...action.payload };
      applyFilters(state);
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredJobs = state.jobs;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobs = action.payload.jobs;
        state.myPostedJobs = state.jobs.filter(
          (j) => j.farmerId === (action.payload.farmerId || DEFAULT_FARMER_ID)
        );
        applyFilters(state);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(postJob.fulfilled, (state, action) => {
        state.jobs = [action.payload, ...state.jobs];
        state.filteredJobs = [action.payload, ...state.filteredJobs];
        if (action.payload.farmerId === DEFAULT_FARMER_ID) {
          state.myPostedJobs = [action.payload, ...state.myPostedJobs];
        }
      })
      .addCase(updateJobWorkers.fulfilled, (state, action) => {
        const { jobId, workersHired } = action.payload;
        const idx = state.jobs.findIndex((j) => j.jobId === jobId);
        if (idx >= 0) {
          state.jobs[idx].workersHired = workersHired;
          const fi = state.filteredJobs.findIndex((j) => j.jobId === jobId);
          if (fi >= 0) state.filteredJobs[fi].workersHired = workersHired;
          const mi = state.myPostedJobs.findIndex((j) => j.jobId === jobId);
          if (mi >= 0) state.myPostedJobs[mi].workersHired = workersHired;
        }
      });
  },
});

function applyFilters(state: JobState) {
  let result = [...state.jobs];
  if (state.filters.workType) {
    result = result.filter((j) => j.workType === state.filters.workType);
  }
  if (state.filters.minWage != null) {
    result = result.filter((j) => j.wagePerDay >= state.filters.minWage!);
  }
  if (state.filters.sortBy) {
    if (state.filters.sortBy === 'wage') {
      result.sort((a, b) => b.wagePerDay - a.wagePerDay);
    } else if (state.filters.sortBy === 'date') {
      result.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime());
    }
  }
  state.filteredJobs = result;
}

export const { setFilters, clearFilters } = jobSlice.actions;
export default jobSlice.reducer;
