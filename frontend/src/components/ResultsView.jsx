import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  HelpCircle,
  Stethoscope, 
  Printer, 
  ArrowLeft,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Loader2,
  MessageSquare
} from 'lucide-react';
import ReportChat from './ReportChat';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function ResultsView({ data, onReset, user }) {
  const [showRawText, setShowRawText] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'chat'
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  if (!data) return null;

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Normal</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            <span>Elevated</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-900 border border-sky-200">
            <ArrowDownRight className="w-3.5 h-3.5 text-sky-600" />
            <span>Low</span>
          </span>
        );
      case 'ABNORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Out of Range</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Review</span>
          </span>
        );
    }
  };

  const handleSaveToHistory = async () => {
    if (!isSupabaseConfigured || !user) {
      alert("Sign in to your account with Supabase configured to save reports to your history.");
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      // Privacy-First: We ONLY save the structured summary.
      // Raw file binary and raw OCR text are NEVER stored.
      const payload = {
        user_id: user.id,
        report_title: data.title || "Lab Report Analysis",
        filename: data.filename || "Uploaded Report",
        overall_summary: data.overallSummary || data.overall_summary || "",
        clarity_assessment: data.clarity_assessment || "Clear",
        biomarkers_count: (data.sections || []).reduce((acc, s) => acc + (s.biomarkers?.length || 0), 0),
        sections: data.sections || [],
        key_findings: data.keyTakeaways || data.key_findings || [],
        questions_for_doctor: data.doctorQuestions || data.questions_for_doctor || []
      };

      const { error } = await supabase.from('report_history').insert([payload]);
      if (error) throw error;

      setSaved(true);
      setSaveMessage('Report breakdown saved to your private Health History.');
    } catch (err) {
      console.error(err);
      setSaveMessage(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const sections = data.sections || [];
  const keyTakeaways = data.keyTakeaways || data.key_findings || [];
  const doctorQuestions = data.doctorQuestions || data.questions_for_doctor || [];
  const summaryText = data.overallSummary || data.overall_summary || "";
  const isAiPowered = data.ai_powered === true;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Upload Another Report</span>
        </button>

        {/* View Switcher Tabs (Summary vs Interactive Report Chat) */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'summary'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report Breakdown
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat With This Report</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Optional Save to Supabase History Button */}
          {isSupabaseConfigured && user && (
            <button
              onClick={handleSaveToHistory}
              disabled={saved || saving}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                saved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              ) : saved ? (
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Bookmark className="w-4 h-4 text-slate-500" />
              )}
              <span>{saved ? 'Saved to History' : 'Save Summary'}</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-teal-600" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
          <span>{saveMessage}</span>
          <span className="text-[11px] text-teal-600 font-medium">Original file discarded</span>
        </div>
      )}

      {/* Render Chat or Breakdown according to selected tab */}
      {activeTab === 'chat' ? (
        <ReportChat reportData={data} />
      ) : (
        <div className="space-y-6">
          {/* Primary Card: Report Header & Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider rounded-md border flex items-center gap-1 ${
                    isAiPowered 
                      ? 'bg-purple-50 text-purple-800 border-purple-200' 
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}>
                    {isAiPowered ? (
                      <>
                        <Cpu className="w-3 h-3 text-purple-600" />
                        <span>Gemini 2.5 AI Analysis</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Structured OCR Analysis</span>
                      </>
                    )}
                  </span>

                  {data.filename && (
                    <span className="text-xs text-slate-500 font-mono">
                      {data.filename}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {data.title}
                </h1>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                {data.clarity_assessment && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    data.clarity_assessment === 'Clear'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    Report Clarity: {data.clarity_assessment}
                  </span>
                )}
                {data.page_count && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {data.page_count} page(s) analyzed
                  </span>
                )}
              </div>
            </div>

            {/* Warning if report clarity is unclear */}
            {data.clarity_assessment && data.clarity_assessment !== 'Clear' && (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Portions of This Report Were Unclear or Ambiguous</p>
                  <p>
                    Some values, units, or reference intervals in this document could not be extracted with full certainty. 
                    Please bring your printed laboratory document to a licensed clinician for definitive review.
                  </p>
                </div>
              </div>
            )}

            {/* Overall Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Plain-Language Overview
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {summaryText}
              </p>
            </div>

            {/* Key Takeaways */}
            {keyTakeaways.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-slate-500" />
                  Key Highlights
                </h3>
                <ul className="space-y-2">
                  {keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700 leading-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 mr-2.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Extracted Biomarkers Breakdown */}
          {sections.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Extracted Biomarker Breakdown
                </h2>
                <span className="text-xs text-slate-500">
                  Verbatim values paired with simple educational context
                </span>
              </div>

              {sections.map((sec, secIdx) => (
                <div 
                  key={secIdx} 
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">
                      {sec.category}
                    </h3>
                    {sec.summary && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sec.summary}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(sec.biomarkers || []).map((bio, bioIdx) => {
                      const val = bio.extracted_value || bio.value;
                      const refRange = bio.reference_range || bio.referenceRange;
                      const explanation = bio.simple_language_explanation || bio.simple_explanation || bio.plainExplanation;
                      const unclearNote = bio.missing_or_unclear_note;

                      return (
                        <div 
                          key={bioIdx}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 hover:bg-slate-50 transition space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {bio.name}
                              </span>
                              {getStatusBadge(bio.status)}
                            </div>

                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Report Value:</span>
                              <span className="text-lg font-black text-slate-900 font-mono">
                                {val}
                              </span>
                              {bio.unit ? (
                                <span className="text-xs font-semibold text-slate-600">
                                  {bio.unit}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  (no unit in report)
                                </span>
                              )}
                              {refRange ? (
                                <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                  Ref: {refRange}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                                  Ref range unstated
                                </span>
                              )}
                            </div>
                          </div>

                          {unclearNote && (
                            <div className="text-xs text-amber-800 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 flex items-center gap-2">
                              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span><strong>Note:</strong> {unclearNote}</span>
                            </div>
                          )}

                          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-1">
                              Plain-Language Context (AI Explanation)
                            </span>
                            {explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
              <p className="text-sm text-slate-600">
                No discrete tabular biomarker values were parsed from this file. You can inspect the extracted text below.
              </p>
            </div>
          )}

          {/* Raw Extracted Text Drawer */}
          {data.extracted_text && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  View Verbatim Extracted Source Text ({data.extracted_text.length} characters)
                </span>
                {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRawText && (
                <div className="p-5 border-t border-slate-100 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap rounded-b-2xl">
                  {data.extracted_text}
                </div>
              )}
            </div>
          )}

          {/* Questions for Physician */}
          {doctorQuestions.length > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-teal-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-teal-950">
                    Recommended Questions to Ask Your Doctor
                  </h2>
                  <p className="text-xs text-teal-700">
                    Bring these points to your appointment to get clarity on what these results mean for your health
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {doctorQuestions.map((q, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-teal-200/80 text-xs sm:text-sm text-teal-950 leading-relaxed"
                  >
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Educational Disclaimer Banner */}
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 flex items-start gap-4">
            <ShieldAlert className="w-7 h-7 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2">
              <p className="font-extrabold uppercase tracking-wider text-amber-900 text-sm">
                Educational Use Only — Mandatory Safety Disclaimer
              </p>
              <p>
                ReportSaathi is strictly an informational and educational assistant engineered to translate laboratory jargon. 
                <strong> It does not provide medical diagnoses, clinical treatment plans, or prescriptions, and does not claim medical certainty.</strong>
              </p>
              <p className="text-amber-900/90 text-xs">
                Laboratory reference intervals vary across individual equipment, fasting states, age, and biological variations. Never modify, start, or cease any medication or medical treatment based on an automated summary. If any finding appears unusual or unclear, always consult a licensed physician or qualified healthcare provider with your official laboratory sheet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
