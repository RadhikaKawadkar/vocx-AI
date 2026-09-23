export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface FeedbackItem {
  id: number;
  customer_id?: string;
  source: string;
  original_text: string;
  english_translation?: string;
  detected_language: string;
  language_name: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentiment_score: number;
  confidence_score: number;
  aspect_category: string;
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  is_escalated: boolean;
  location_state?: string;
  tags: string[];
  metadata_info?: Record<string, any>;
  created_at: string;
}

export interface FeedbackFilterParams {
  source?: string;
  language?: string;
  sentiment?: string;
  aspect?: string;
  urgency?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface KeyMetrics {
  total_feedback: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  nps_score: number;
  urgent_alerts_count: number;
  languages_supported_count: number;
}

export interface SentimentTrendItem {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface LanguageDistributionItem {
  language: string;
  language_name: string;
  count: number;
  percentage: number;
}

export interface AspectSentimentItem {
  aspect_name: string;
  positive: number;
  neutral: number;
  negative: number;
  avg_score: number;
}

export interface RegionalDistributionItem {
  state: string;
  total_volume: number;
  negative_ratio: number;
  top_language: string;
}

export interface DashboardSummary {
  metrics: KeyMetrics;
  trends: SentimentTrendItem[];
  languages: LanguageDistributionItem[];
  aspects: AspectSentimentItem[];
  regional: RegionalDistributionItem[];
}

export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  condition_sentiment?: string;
  condition_aspect?: string;
  condition_urgency?: string;
  condition_language?: string;
  action_type: string;
  action_config: Record<string, any>;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface ActionLog {
  id: number;
  rule_id: number;
  rule_name: string;
  feedback_id: number;
  action_type: string;
  status: string;
  details?: string;
  executed_at: string;
}

export interface TextAnalyzeRequest {
  text: string;
  source?: string;
  location_state?: string;
}

export interface TextAnalyzeResponse {
  original_text: string;
  english_translation: string;
  detected_language: string;
  language_name: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentiment_score: number;
  confidence_score: number;
  aspect_category: string;
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: string[];
}
