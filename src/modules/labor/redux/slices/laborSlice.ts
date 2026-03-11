import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Labor } from '../../types';
import { MOCK_LABORERS } from '../../mockData';

interface LaborState {
  laborers: Labor[];
  nearbyLaborers: Labor[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LaborState = {
  laborers: MOCK_LABORERS,
  nearbyLaborers: [],
  isLoading: false,
  error: null,
};

export const fetchLaborers = createAsyncThunk(
  'labor/fetchLaborers',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 300));
      return MOCK_LABORERS;
    } catch (e) {
      return rejectWithValue('Failed to fetch laborers');
    }
  }
);

export const fetchNearbyLaborers = createAsyncThunk(
  'labor/fetchNearbyLaborers',
  async (
    { lat, lng, radiusKm = 20 }: { lat: number; lng: number; radiusKm?: number },
    { rejectWithValue }
  ) => {
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 200));
      const nearby = MOCK_LABORERS.filter((l) => {
        const d = haversine(lat, lng, l.location.latitude, l.location.longitude);
        return d <= radiusKm;
      });
      return nearby.sort(
        (a, b) =>
          haversine(lat, lng, a.location.latitude, a.location.longitude) -
          haversine(lat, lng, b.location.latitude, b.location.longitude)
      );
    } catch (e) {
      return rejectWithValue('Failed to fetch nearby laborers');
    }
  }
);

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const laborSlice = createSlice({
  name: 'labor',
  initialState,
  reducers: {
    clearNearby: (state) => {
      state.nearbyLaborers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLaborers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLaborers.fulfilled, (state, action) => {
        state.laborers = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchLaborers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNearbyLaborers.fulfilled, (state, action) => {
        state.nearbyLaborers = action.payload;
      });
  },
});

export const { clearNearby } = laborSlice.actions;
export default laborSlice.reducer;
