import { configureStore } from '@reduxjs/toolkit';
import laborReducer from './slices/laborSlice';
import jobReducer from './slices/jobSlice';
import applicationReducer from './slices/applicationSlice';
import attendanceReducer from './slices/attendanceSlice';
import workReducer from '../../work/redux/workSlice';

export const laborStore = configureStore({
  reducer: {
    labor: laborReducer,
    job: jobReducer,
    application: applicationReducer,
    attendance: attendanceReducer,
    work: workReducer,
  },
});

export type LaborRootState = ReturnType<typeof laborStore.getState>;
export type LaborAppDispatch = typeof laborStore.dispatch;
