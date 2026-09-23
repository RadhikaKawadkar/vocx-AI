import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/analytics';
import { DashboardSummary } from '../types';
import { TrendAnalysis } from '../components/analytics/TrendAnalysis';
import { RegionalHeatmap } from '../components/analytics/RegionalHeatmap';
import { AspectSentimentMatrix } from '../components/dashboard/AspectSentimentMatrix';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await analyticsApi.getDashboardSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading || !data) {
    return <LoadingSpinner label="Generating deep multi-dimensional analytics report..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h1 className="text-xl font-bold text-slate-100">Deep Analytics & Regional Insights</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore cross-lingual aspect sentiment correlations and state-level customer dissatisfaction metrics.
        </p>
      </div>

      <TrendAnalysis trends={data.trends} />

      <RegionalHeatmap data={data.regional} />

      <AspectSentimentMatrix data={data.aspects} />
    </div>
  );
};
