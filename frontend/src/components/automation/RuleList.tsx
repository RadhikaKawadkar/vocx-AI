import React from 'react';
import { AutomationRule, ActionLog } from '../../types';
import { Zap, ToggleLeft, ToggleRight, Trash2, Mail, MessageSquare, Ticket, AlertTriangle } from 'lucide-react';

interface RuleListProps {
  rules: AutomationRule[];
  logs: ActionLog[];
  onToggle: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
}

export const RuleList: React.FC<RuleListProps> = ({ rules, logs, onToggle, onDelete }) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'EMAIL_ALERT':
        return <Mail className="h-4 w-4 text-blue-400" />;
      case 'SLACK_NOTIFICATION':
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
      case 'JIRA_TICKET':
        return <Ticket className="h-4 w-4 text-amber-400" />;
      case 'AUTO_ESCALATE':
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      default:
        return <Zap className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Rules List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Active Automation Rules</h3>

        {rules.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No automation rules defined yet. Click "Create Rule" above.
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 rounded-xl">{getActionIcon(rule.action_type)}</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{rule.name}</h4>
                    {rule.description && <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggle(rule.id, !rule.is_active)}
                    className="text-slate-400 hover:text-indigo-400 transition"
                  >
                    {rule.is_active ? (
                      <ToggleRight className="h-6 w-6 text-indigo-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-600" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(rule.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Conditions Pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[10px]">
                {rule.condition_sentiment && (
                  <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 rounded border border-rose-800">
                    Sentiment == {rule.condition_sentiment}
                  </span>
                )}
                {rule.condition_aspect && (
                  <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 rounded border border-indigo-800">
                    Aspect == {rule.condition_aspect}
                  </span>
                )}
                {rule.condition_urgency && (
                  <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 rounded border border-amber-800">
                    Urgency == {rule.condition_urgency}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded ml-auto">
                  Triggered: <strong>{rule.trigger_count} times</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Execution Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Execution Audit Logs</h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No rule triggers logged yet.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-300">
                  <span>{log.rule_name}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    {log.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{log.details}</p>
                <div className="text-[9px] text-slate-500">{new Date(log.executed_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
