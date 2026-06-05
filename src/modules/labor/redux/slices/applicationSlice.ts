import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Application, ApplicationStatus } from '../../types';
import { MOCK_APPLICATIONS } from '../../mockData';

interface ApplicationState {
  applications: Application[];
  myJobApplications: Application[];
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_FARMER_ID = 'F001';
const DEFAULT_LABOR_ID = 'L001'; // Demo laborer

const initialState: ApplicationState = {
  applications: MOCK_APPLICATIONS,
  myJobApplications: MOCK_APPLICATIONS.filter(
    (a) => a.job.farmerId === DEFAULT_FARMER_ID
  ),
  isLoading: false,
  error: null,
};

export const fetchApplications = createAsyncThunk(
  'application/fetchApplications',
  async (
    { farmerId, laborId }: { farmerId?: string; laborId?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 300));
      return { farmerId: farmerId || DEFAULT_FARMER_ID, laborId: laborId || DEFAULT_LABOR_ID };
    } catch (e) {
      return rejectWithValue('Failed to fetch applications');
    }
  }
);

export const applyForJob = createAsyncThunk(
  'application/applyForJob',
  async (
    {
      jobId,
      laborId,
      labor,
      job,
      message,
    }: {
      jobId: string;
      laborId: string;
      labor: Application['labor'];
      job: Application['job'];
      message?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 300));
      const application: Application = {
        applicationId: `A${Date.now()}`,
        jobId,
        laborId,
        labor,
        job,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        message,
      };
      return application;
    } catch (e) {
      return rejectWithValue('Failed to apply');
    }
  }
);

export const respondToApplication = createAsyncThunk(
  'application/respondToApplication',
  async (
    {
      applicationId,
      status,
      jobId,
      incrementWorkers,
    }: {
      applicationId: string;
      status: ApplicationStatus;
      jobId: string;
      incrementWorkers?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 200));
      return { applicationId, status, jobId, incrementWorkers };
    } catch (e) {
      return rejectWithValue('Failed to respond');
    }
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.myJobApplications = state.applications.filter(
          (a) => a.job.farmerId === action.payload.farmerId
        );
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.applications = [action.payload, ...state.applications];
      })
      .addCase(respondToApplication.fulfilled, (state, action) => {
        const { applicationId, status } = action.payload;
        const idx = state.applications.findIndex((a) => a.applicationId === applicationId);
        if (idx >= 0) {
          state.applications[idx].status = status;
        }
        state.myJobApplications = state.applications.filter(
          (a) => a.job.farmerId === DEFAULT_FARMER_ID
        );
      });
  },
});

export default applicationSlice.reducer;
