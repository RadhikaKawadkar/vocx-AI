import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FeedbackExplorerPage } from './pages/FeedbackExplorerPage';
import { IngestionManagerPage } from './pages/IngestionManagerPage';
import { LanguageAnalyticsPage } from './pages/LanguageAnalyticsPage';
import { TranslationManagerPage } from './pages/TranslationManagerPage';
import { CategoryAnalyticsPage } from './pages/CategoryAnalyticsPage';
import { SentimentAnalyticsPage } from './pages/SentimentAnalyticsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AutomationPage } from './pages/AutomationPage';
import { NLPSandboxPage } from './pages/NLPSandboxPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner label="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explorer" element={<FeedbackExplorerPage />} />
            <Route path="/ingestion" element={<IngestionManagerPage />} />
            <Route path="/language" element={<LanguageAnalyticsPage />} />
            <Route path="/translation" element={<TranslationManagerPage />} />
            <Route path="/categories" element={<CategoryAnalyticsPage />} />
            <Route path="/sentiment" element={<SentimentAnalyticsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/nlp-sandbox" element={<NLPSandboxPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
