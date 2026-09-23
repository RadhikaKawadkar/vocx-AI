import { api } from './api';

export interface LanguageDetectionResult {
  language_code: string;
  language_name: string;
  confidence: number;
  script: string;
  is_code_mixed: boolean;
  distribution: Record<string, number>;
}

export interface LanguageStatItem {
  code: string;
  name: string;
  count: number;
  percentage: number;
  avg_confidence: number;
}

export interface LanguageStatsResponse {
  total_records: number;
  avg_confidence: number;
  distribution: LanguageStatItem[];
}

export const languageApi = {
  detect: async (text: string): Promise<LanguageDetectionResult> => {
    const response = await api.post<LanguageDetectionResult>('/language/detect', { text });
    return response.data;
  },

  bulkDetect: async (texts: string[]): Promise<LanguageDetectionResult[]> => {
    const response = await api.post<LanguageDetectionResult[]>('/language/bulk-detect', { texts });
    return response.data;
  },

  reclassifyDB: async (): Promise<{ reclassified_records: number; status: string }> => {
    const response = await api.post<{ reclassified_records: number; status: string }>('/language/reclassify-db');
    return response.data;
  },

  getStats: async (): Promise<LanguageStatsResponse> => {
    const response = await api.get<LanguageStatsResponse>('/language/stats');
    return response.data;
  }
};
