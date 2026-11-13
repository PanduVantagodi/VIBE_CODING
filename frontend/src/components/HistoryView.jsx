import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function HistoryView({ user, onViewReport, onNavigateToUpload }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      fetchReportHistory();
    }
  }, [user]);

  const fetchReportHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('report_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching report history:', err);
      setErrorMsg(err.message || 'Failed to load report history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!confirm('Are you sure you want to permanently delete this report summary from your history?')) {
      return;
    }

    setDeletingId(reportId);
    try {
      const { error } = await supabase
        .from('report_history')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-xl mx-auto space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Demo Mode Active</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Supabase credentials are not currently configured. ReportSaathi is running in private guest mode where no report data is saved or retained.
        </p>
        <div className="pt-2">
          <button
            onClick={onNavigateToUpload}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-700 text-white hover:bg-teal-800 transition"
          >
            Analyze a Report
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Health History</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Create a free account or sign in to save your educational report summaries and track your lab tests over time with Row Level Security.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Health History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Structured educational summaries saved to your private account (Protected by Supabase RLS)
          </p>
        </div>

        <button
          onClick={onNavigateToUpload}
          className="self-start sm:self-auto text-xs px-4 py-2 rounded-xl font-bold bg-teal-700 text-white hover:bg-teal-800 transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Analyze New Report</span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-xs text-teal-900">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">Privacy First:</strong>
          Only the structured educational breakdown is stored here. Your original uploaded PDF/images and raw OCR text files were discarded from memory and never stored in the database.
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading your report history...</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !errorMsg && reports.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Reports Saved Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When analyzing a report in the Lab Dashboard, you can choose whether to save the summary to your profile.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToUpload}
              className="px-5 py-2 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Analyze Your First Report
            </button>
          </div>
        </div>
      )}

      {/* Report Cards Grid */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-mono">
                    {item.filename}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {item.report_title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.overall_summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onViewReport(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Breakdown</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition"
                  title="Delete permanently"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
