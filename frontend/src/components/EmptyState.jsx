import React from 'react';
import { FileQuestion, UploadCloud, RefreshCw } from 'lucide-react';

export default function EmptyState({ onUploadClick, onLoadSample }) {
  return (
    <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-5 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">No Report Analyzed Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Upload a lab test result file (PDF, JPG, or PNG) to view parsed health metrics, or explore pre-populated clinical samples.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition flex items-center justify-center gap-1.5"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => onLoadSample('cbc')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Load Sample CBC</span>
        </button>
      </div>
    </div>
  );
}
