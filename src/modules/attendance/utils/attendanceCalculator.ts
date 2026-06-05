/**
 * Attendance & Wage Calculator
 * Per labor, per job, total job wage, cost per acre
 */

export interface AttendanceInput {
  laborId: string;
  daysPresent: number;
  daysAbsent: number;
  wagePerDay: number;
}

export interface LaborWageResult {
  laborId: string;
  daysPresent: number;
  daysAbsent: number;
  wagePerDay: number;
  totalPayable: number;
}

export interface JobWageSummary {
  totalLaborCount: number;
  totalDaysPresent: number;
  totalPayable: number;
  costPerAcre?: number;
  acres?: number;
}

export function calculateLaborWage(input: AttendanceInput): LaborWageResult {
  const totalPayable = input.daysPresent * input.wagePerDay;
  return {
    laborId: input.laborId,
    daysPresent: input.daysPresent,
    daysAbsent: input.daysAbsent,
    wagePerDay: input.wagePerDay,
    totalPayable,
  };
}

export function calculateJobWage(
  laborAttendance: AttendanceInput[],
  acres?: number
): JobWageSummary {
  let totalDaysPresent = 0;
  let totalPayable = 0;

  laborAttendance.forEach((a) => {
    const result = calculateLaborWage(a);
    totalDaysPresent += result.daysPresent;
    totalPayable += result.totalPayable;
  });

  const summary: JobWageSummary = {
    totalLaborCount: laborAttendance.length,
    totalDaysPresent,
    totalPayable,
  };

  if (acres != null && acres > 0) {
    summary.acres = acres;
    summary.costPerAcre = Math.round((totalPayable / acres) * 100) / 100;
  }

  return summary;
}
