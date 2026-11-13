import React from 'react';
import { Loader2, Sparkles, FileSearch, CheckCircle2 } from 'lucide-react';

export default function LoadingState({ fileName, stepMessage }) {
  return (
    <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-pulse" />
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" /> Demo Engine Simulating Extraction
        </span>
        <h3 className="text-xl font-bold text-slate-900">
          Analyzing Laboratory Document
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {stepMessage || `Parsing biomarkers, checking normal bounds, and drafting clear educational explanations for "${fileName}"...`}
        </p>
      </div>

      {/* Progress Steps Simulation */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 max-w-sm mx-auto">
        <div className="flex items-center gap-2.5 text-xs text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>File format and size validation verified</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-teal-800 font-medium">
          <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
          <span>Mapping reference intervals & biomarker names</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
          <span>Drafting plain-language summaries</span>
        </div>
      </div>
    </div>
  );
}
