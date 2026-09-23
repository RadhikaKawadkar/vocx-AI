import React, { useState, useEffect } from 'react';
import { automationApi } from '../services/automation';
import { AutomationRule, ActionLog } from '../types';
import { RuleList } from '../components/automation/RuleList';
import { RuleFormModal } from '../components/automation/RuleFormModal';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AutomationPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAutomations = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, logsRes] = await Promise.all([
        automationApi.listRules(),
        automationApi.listLogs(),
      ]);
      setRules(rulesRes);
      setLogs(logsRes);
    } catch (err) {
      console.error('Failed to load automation rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, []);

  const handleToggleStatus = async (ruleId: number, isActive: boolean) => {
    try {
      await automationApi.toggleRuleStatus(ruleId, isActive);
      loadAutomations();
    } catch (err) {
      alert('Failed to update rule status: ' + err);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      try {
        await automationApi.deleteRule(ruleId);
        loadAutomations();
      } catch (err) {
        alert('Failed to delete rule: ' + err);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading automated trigger engine state..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Automated Actions & Escalation Triggers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated action workflows when negative sentiment or critical urgency items are detected.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="h-4 w-4" />
          <span>Create Rule</span>
        </button>
      </div>

      <RuleList
        rules={rules}
        logs={logs}
        onToggle={handleToggleStatus}
        onDelete={handleDeleteRule}
      />

      <RuleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadAutomations}
      />
    </div>
  );
};
