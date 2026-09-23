import { api } from './api';
import { DashboardSummary } from '../types';

export const analyticsApi = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/analytics/dashboard');
    return response.data;
  },
};
