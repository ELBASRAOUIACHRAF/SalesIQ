export interface CohortAnalysisDto {
  totalUsers: number;
  totalCohorts: number;
  activeUsers: number;
  avgUsersPerCohort: number;
}

export const defaultCohortAnalysis: CohortAnalysisDto = {
  totalUsers: 0,
  totalCohorts: 0,
  activeUsers: 0,
  avgUsersPerCohort: 0
};
