import { api } from './api';
import {
  FeedbackItem,
  FeedbackListResponse,
  FeedbackFilterParams,
  TextAnalyzeRequest,
  TextAnalyzeResponse
} from '../types';

export interface IngestionSummary {
  batch_id: string;
  source: string;
  total_records: number;
  imported_count: number;
  duplicates_skipped: number;
  errors_count: number;
  error_details: string[];
  created_at: string;
}

export interface IngestionStats {
  total_ingested: number;
  by_source: Record<string, number>;
  by_batch: Record<string, number>;
  duplicates_flagged_count: number;
}

export const feedbackApi = {
  create: async (data: { original_text: string; source?: string; customer_id?: string; location_state?: string; metadata_info?: Record<string, any> }): Promise<FeedbackItem> => {
    const response = await api.post<FeedbackItem>('/feedback/', data);
    return response.data;
  },

  uploadCSV: async (file: File, source = 'CSV_Import', skipDuplicates = true): Promise<IngestionSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);
    formData.append('skip_duplicates', String(skipDuplicates));
    
    const response = await api.post<IngestionSummary>('/feedback/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadJSON: async (file: File, source = 'JSON_Import', skipDuplicates = true): Promise<IngestionSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);
    formData.append('skip_duplicates', String(skipDuplicates));
    
    const response = await api.post<IngestionSummary>('/feedback/upload/json', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getIngestionStats: async (): Promise<IngestionStats> => {
    const response = await api.get<IngestionStats>('/feedback/ingestion/stats');
    return response.data;
  },

  list: async (params: FeedbackFilterParams = {}): Promise<FeedbackListResponse> => {
    const response = await api.get<FeedbackListResponse>('/feedback/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<FeedbackItem> => {
    const response = await api.get<FeedbackItem>(`/feedback/${id}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/feedback/${id}`);
  },

  analyzeText: async (payload: TextAnalyzeRequest): Promise<TextAnalyzeResponse> => {
    const response = await api.post<TextAnalyzeResponse>('/nlp/analyze', payload);
    return response.data;
  },

  seedSampleData: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/feedback/seed/sample-data');
    return response.data;
  }
};
