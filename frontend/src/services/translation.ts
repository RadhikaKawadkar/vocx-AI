import { api } from './api';

export interface SingleTranslateResponse {
  original_text: string;
  translated_text: string;
  source_language: string;
  provider: string;
  latency_ms: number;
  status: string;
}

export interface TranslationRecordItem {
  id: number;
  feedback_id: number;
  source_language: string;
  original_text: string;
  translated_text?: string;
  status: string;
  provider: string;
  latency_ms: number;
  retry_count: number;
  error_message?: string;
  created_at: string;
}

export interface TranslationStatsResponse {
  total_translations: number;
  success_rate: number;
  avg_latency_ms: number;
  status_breakdown: Record<string, number>;
  provider_breakdown: Record<string, number>;
}

export const translationApi = {
  translate: async (text: string, source_language = 'hi'): Promise<SingleTranslateResponse> => {
    const response = await api.post<SingleTranslateResponse>('/translation/translate', { text, source_language });
    return response.data;
  },

  bulkTranslate: async (limit = 100): Promise<{ processed_count: number; status: string }> => {
    const response = await api.post<{ processed_count: number; status: string }>('/translation/bulk-translate', null, { params: { limit } });
    return response.data;
  },

  retryFailed: async (): Promise<{ retried_count: number; status: string }> => {
    const response = await api.post<{ retried_count: number; status: string }>('/translation/retry-failed');
    return response.data;
  },

  getStats: async (): Promise<TranslationStatsResponse> => {
    const response = await api.get<TranslationStatsResponse>('/translation/stats');
    return response.data;
  },

  getHistory: async (limit = 50): Promise<TranslationRecordItem[]> => {
    const response = await api.get<TranslationRecordItem[]>('/translation/history', { params: { limit } });
    return response.data;
  }
};
