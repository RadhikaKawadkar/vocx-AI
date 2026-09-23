import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { automationApi } from '../../services/automation';

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RuleFormModal: React.FC<RuleFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [aspect, setAspect] = useState('');
  const [urgency, setUrgency] = useState('');
  const [actionType, setActionType] = useState('EMAIL_ALERT');
  const [recipient, setRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await automationApi.createRule({
        name,
        description: description || undefined,
        is_active: true,
        condition_sentiment: sentiment || undefined,
        condition_aspect: aspect || undefined,
        condition_urgency: urgency || undefined,
        action_type: actionType,
        action_config: { recipient: recipient || 'admin@vocx.ai' },
      });
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to create rule: ' + err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Create Automation Rule</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Notify Lead on Support Escalations"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="Brief description of what this rule automates"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sentiment Condition</label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="">Any</option>
                <option value="Negative">Negative</option>
                <option value="Positive">Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Aspect Condition</label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="">Any</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Product Quality">Product Quality</option>
                <option value="Billing & Payment">Billing & Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency Condition</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="">Any</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
            >
              <option value="EMAIL_ALERT">Send Email Alert</option>
              <option value="SLACK_NOTIFICATION">Slack Channel Notification</option>
              <option value="JIRA_TICKET">Auto-Create Jira Ticket</option>
              <option value="AUTO_ESCALATE">Mark Priority Escalated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient / Channel Target</label>
            <input
              type="text"
              placeholder="e.g. support-leads@company.in or #urgent-risk"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
            >
              {isSubmitting ? 'Saving...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
