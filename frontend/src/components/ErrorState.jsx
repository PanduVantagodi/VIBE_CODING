import React from 'react';
import { AlertCircle, RefreshCw, UploadCloud } from 'lucide-react';

export default function ErrorState({ title, message, onRetry, onReset }) {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-sm text-center max-w-lg mx-auto space-y-5 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          {title || "Unable to Process Report"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {message || "We encountered an issue reading the provided document. Please check the file formatting or try again."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Another File</span>
        </button>
      </div>
    </div>
  );
}
