import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AttendanceRecord } from '../../types';
import { MOCK_ATTENDANCE } from '../../mockData';

interface AttendanceState {
  records: AttendanceRecord[];
  totalPayable: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: MOCK_ATTENDANCE,
  totalPayable: MOCK_ATTENDANCE.filter((r) => r.present).reduce(
    (sum, r) => sum + r.wageAmount,
    0
  ),
  isLoading: false,
  error: null,
};

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (jobId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 300));
      return jobId
        ? MOCK_ATTENDANCE.filter((r) => r.jobId === jobId)
        : MOCK_ATTENDANCE;
    } catch (e) {
      return rejectWithValue('Failed to fetch attendance');
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (
    {
      recordId,
      present,
      wageAmount,
    }: { recordId: string; present: boolean; wageAmount: number },
    { rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 200));
      return { recordId, present, wageAmount };
    } catch (e) {
      return rejectWithValue('Failed to update attendance');
    }
  }
);

export const addAttendanceRecord = createAsyncThunk(
  'attendance/addAttendanceRecord',
  async (
    record: Omit<AttendanceRecord, 'id'>,
    { rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 200));
      const newRecord: AttendanceRecord = {
        ...record,
        id: `AT${Date.now()}`,
      };
      return newRecord;
    } catch (e) {
      return rejectWithValue('Failed to add record');
    }
  }
);

function computeTotalPayable(records: AttendanceRecord[]): number {
  return records.filter((r) => r.present).reduce((sum, r) => sum + r.wageAmount, 0);
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setRecordsByJob: (state, action: { payload: string }) => {
      state.records = MOCK_ATTENDANCE.filter((r) => r.jobId === action.payload);
      state.totalPayable = computeTotalPayable(state.records);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.records = action.payload;
        state.totalPayable = computeTotalPayable(state.records);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        const { recordId, present, wageAmount } = action.payload;
        const idx = state.records.findIndex((r) => r.id === recordId);
        if (idx >= 0) {
          state.records[idx].present = present;
          state.records[idx].wageAmount = present ? wageAmount : 0;
        }
        state.totalPayable = computeTotalPayable(state.records);
      })
      .addCase(addAttendanceRecord.fulfilled, (state, action) => {
        state.records = [action.payload, ...state.records];
        state.totalPayable = computeTotalPayable(state.records);
      });
  },
});

export const { setRecordsByJob } = attendanceSlice.actions;
export default attendanceSlice.reducer;
