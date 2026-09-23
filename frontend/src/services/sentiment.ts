import { api } from './api';

export interface SentimentPredictResponse {
  text: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentiment_score: number;
  confidence_score: number;
}

export interface SentimentStatsResponse {
  total_records: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  net_promoter_score: number;
  avg_confidence: number;
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export const sentimentApi = {
  predict: async (text: string): Promise<SentimentPredictResponse> => {
    const response = await api.post<SentimentPredictResponse>('/sentiment/predict', { text });
    return response.data;
  },

  bulkAnalyze: async (): Promise<{ processed_records: number; status: string }> => {
    const response = await api.post<{ processed_records: number; status: string }>('/sentiment/bulk-analyze');
    return response.data;
  },

  getStats: async (): Promise<SentimentStatsResponse> => {
    const response = await api.get<SentimentStatsResponse>('/sentiment/stats');
    return response.data;
  },

  getTrends: async (): Promise<SentimentTrendPoint[]> => {
    const response = await api.get<SentimentTrendPoint[]>('/sentiment/trends');
    return response.data;
  }
};
