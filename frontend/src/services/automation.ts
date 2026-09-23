import { api } from './api';
import { AutomationRule, ActionLog } from '../types';

export const automationApi = {
  listRules: async (): Promise<AutomationRule[]> => {
    const response = await api.get<AutomationRule[]>('/automation/rules');
    return response.data;
  },

  createRule: async (rule: Omit<AutomationRule, 'id' | 'trigger_count' | 'created_at' | 'updated_at'>): Promise<AutomationRule> => {
    const response = await api.post<AutomationRule>('/automation/rules', rule);
    return response.data;
  },

  toggleRuleStatus: async (ruleId: number, isActive: boolean): Promise<AutomationRule> => {
    const response = await api.put<AutomationRule>(`/automation/rules/${ruleId}/status`, null, {
      params: { is_active: isActive }
    });
    return response.data;
  },

  deleteRule: async (ruleId: number): Promise<void> => {
    await api.delete(`/automation/rules/${ruleId}`);
  },

  listLogs: async (limit = 50): Promise<ActionLog[]> => {
    const response = await api.get<ActionLog[]>('/automation/logs', { params: { limit } });
    return response.data;
  }
};
