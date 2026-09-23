import React, { useState } from 'react';
import { X, Send, Sparkles, Upload } from 'lucide-react';
import { feedbackApi } from '../../services/feedback';

interface FeedbackIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FeedbackIngestModal: React.FC<FeedbackIngestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [text, setText] = useState('');
  const [source, setSource] = useState('SupportTicket');
  const [state, setState] = useState('Maharashtra');
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await feedbackApi.create({
        original_text: text,
        source: source,
        customer_id: customerId || undefined,
        location_state: state
      });
      setText('');
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error ingesting feedback: ' + err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Ingest Customer Feedback</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Feedback Text (Hindi, Tamil, Telugu, Hinglish, Bengali, etc.)
            </label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. ओटीपी नहीं आ रहा है, पेमेंट फेल हो गया और 500 रुपये कट गए। Urgent help needed!"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source Channel</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="PlayStore">Google Play Store</option>
                <option value="AppStore">Apple App Store</option>
                <option value="SupportTicket">Support Ticket</option>
                <option value="Twitter">Twitter / X</option>
                <option value="Survey">NPS Survey</option>
                <option value="Webhook">Webhook Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State Region</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Identifier (Optional)</label>
            <input
              type="text"
              placeholder="e.g. CUST_IN_909"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/30"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Analyzing & Ingesting...' : 'Ingest Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
