import { api } from './api';

export interface SecondaryCategoryItem {
  category: string;
  score: number;
}

export interface CategoryClassifyResponse {
  primary_category: string;
  confidence: number;
  secondary_categories: SecondaryCategoryItem[];
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
  percentage: number;
  avg_confidence: number;
  negative_count: number;
}

export interface CategoryAnalyticsResponse {
  total_records: number;
  distribution: CategoryDistributionItem[];
}

export const categoryApi = {
  classify: async (text: string, sentiment = 'Neutral'): Promise<CategoryClassifyResponse> => {
    const response = await api.post<CategoryClassifyResponse>('/category/classify', { text, sentiment });
    return response.data;
  },

  bulkClassify: async (): Promise<{ classified_records: number; status: string }> => {
    const response = await api.post<{ classified_records: number; status: string }>('/category/bulk-classify');
    return response.data;
  },

  getAnalytics: async (): Promise<CategoryAnalyticsResponse> => {
    const response = await api.get<CategoryAnalyticsResponse>('/category/analytics');
    return response.data;
  }
};
