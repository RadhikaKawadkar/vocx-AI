import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/analytics';
import { feedbackApi } from '../services/feedback';
import { DashboardSummary, FeedbackItem } from '../types';
import { StatCard } from '../components/common/StatCard';
import { SentimentChart } from '../components/dashboard/SentimentChart';
import { LanguageDistribution } from '../components/dashboard/LanguageDistribution';
import { AspectSentimentMatrix } from '../components/dashboard/AspectSentimentMatrix';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { FeedbackDetailModal } from '../components/feedback/FeedbackDetailModal';
import { FeedbackIngestModal } from '../components/feedback/FeedbackIngestModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  MessageSquare,
  Smile,
  Frown,
  TrendingUp,
  ShieldAlert,
  Languages,
  Plus
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const summary = await analyticsApi.getDashboardSummary();
      setData(summary);
      const listRes = await feedbackApi.list({ limit: 10 });
      setFeedbacks(listRes.items);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading || !data) {
    return <LoadingSpinner label="Compiling regional language intelligence dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Customer Feedback Executive Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-lingual AI analytics across Indian regional languages (Hindi, Tamil, Telugu, Kannada, Marathi, Hinglish, etc.)
          </p>
        </div>
        <button
          onClick={() => setIsIngestOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="h-4 w-4" />
          <span>Ingest New Feedback</span>
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Feedback Volume"
          value={data.metrics.total_feedback.toLocaleString()}
          subtitle="Processed across 10 regional dialects"
          icon={MessageSquare}
          color="indigo"
        />
        <StatCard
          title="Net Promoter / CSAT Score"
          value={`${data.metrics.nps_score > 0 ? '+' : ''}${data.metrics.nps_score}`}
          subtitle={`${data.metrics.positive_percentage}% Positive sentiment`}
          icon={TrendingUp}
          isPositive={data.metrics.nps_score >= 0}
          color="green"
        />
        <StatCard
          title="Negative Dissatisfaction"
          value={`${data.metrics.negative_percentage}%`}
          subtitle="Customer issues & complaints"
          icon={Frown}
          color="red"
        />
        <StatCard
          title="Urgent Escalation Risks"
          value={data.metrics.urgent_alerts_count}
          subtitle="Fraud, legal, or severe churn alerts"
          icon={ShieldAlert}
          color="amber"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SentimentChart data={data.trends} />
        </div>
        <div>
          <LanguageDistribution data={data.languages} />
        </div>
      </div>

      {/* ABSA Matrix & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AspectSentimentMatrix data={data.aspects} />
        <RecentAlerts items={feedbacks} onSelect={(item) => setSelectedFeedback(item)} />
      </div>

      {/* Modals */}
      <FeedbackDetailModal item={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
      <FeedbackIngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
