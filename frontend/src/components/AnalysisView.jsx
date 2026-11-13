import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Stethoscope,
  Info
} from 'lucide-react';

export default function AnalysisView({ data }) {
  if (!data) return null;

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <ArrowUpRight className="w-3 h-3 text-amber-600" /> High
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowDownRight className="w-3 h-3 text-blue-600" /> Low
          </span>
        );
      case 'ABNORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Abnormal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <HelpCircle className="w-3 h-3 text-slate-500" /> Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.title || "Report Findings Breakdown"}</h2>
            <p className="text-xs text-slate-500 mt-1">Plain-English translation of extracted biomarker data</p>
          </div>
          <button
            onClick={() => window.print()}
            className="self-start md:self-auto text-xs px-3 py-1.5 font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Print / Save Summary
          </button>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-800 mb-2">Overall Summary</h3>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            {data.overall_summary}
          </p>
        </div>

        {data.key_findings && data.key_findings.length > 0 && (
          <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">Key Takeaways</h4>
            <ul className="space-y-1.5">
              {data.key_findings.map((finding, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-700">
                  <span className="mr-2 text-teal-600 font-bold">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sections & Biomarkers */}
      {data.sections && data.sections.map((sec, secIdx) => (
        <div key={secIdx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">{sec.category}</h3>
            {sec.summary && <p className="text-xs text-slate-500 mt-0.5">{sec.summary}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sec.biomarkers && sec.biomarkers.map((bio, bioIdx) => (
              <div 
                key={bioIdx} 
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-base">{bio.name}</span>
                    {getStatusBadge(bio.status)}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900">{bio.value}</span>
                    {bio.unit && <span className="text-xs text-slate-500 ml-1">{bio.unit}</span>}
                    {bio.reference_range && (
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        (Target: {bio.reference_range})
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {bio.simple_explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Questions for Doctor */}
      {data.questions_for_doctor && data.questions_for_doctor.length > 0 && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-teal-900">Questions to Ask Your Doctor</h3>
          </div>
          <p className="text-xs text-teal-700 mb-4">
            Bring these talking points to your appointment to get clarity on what these results mean for your health.
          </p>
          <ul className="space-y-2">
            {data.questions_for_doctor.map((q, idx) => (
              <li key={idx} className="flex items-start text-sm text-teal-950 bg-white/70 p-3 rounded-lg border border-teal-100">
                <span className="font-semibold text-teal-700 mr-2">{idx + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Medical Disclaimer: </span>
          {data.disclaimer || "ReportSaathi is intended for general educational purposes and patient comprehension only. It cannot replace personalized diagnostic counsel or treatment from a licensed physician."}
        </div>
      </div>
    </div>
  );
}
