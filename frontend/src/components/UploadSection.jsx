import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  X,
  FileCheck2,
  Sparkles,
  Info,
  Server
} from 'lucide-react';

export default function UploadSection({ 
  onAnalyze, 
  isLoading, 
  onLoadSample 
}) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (uploadedFile) => {
    setErrorMsg('');
    if (!uploadedFile) return;

    const fileName = uploadedFile.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isJpg = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
    const isPng = fileName.endsWith('.png');

    if (!isPdf && !isJpg && !isPng) {
      setErrorMsg('Invalid file format. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    if (uploadedFile.size > maxSizeBytes) {
      setErrorMsg(`File size (${(uploadedFile.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
      return;
    }

    setFile(uploadedFile);

    if (isJpg || isPng) {
      const url = URL.createObjectURL(uploadedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!file) {
      setErrorMsg('Please select or drop a lab report before continuing.');
      return;
    }
    onAnalyze(file);
  };

  return (
    <div className="space-y-6">
      {/* Backend Connected Notice Banner */}
      <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-900 leading-relaxed">
            <span className="font-bold">FastAPI Backend Connected: </span>
            Uploaded files are processed live via <strong>POST /api/reports/analyze</strong> with digital PDF extraction and Tesseract OCR engine.
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
          Live API
        </span>
      </div>

      {/* Main Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 ${
          dragActive
            ? 'border-teal-500 bg-teal-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-teal-500 bg-white shadow-sm hover:shadow-md'
        } ${file ? 'cursor-default border-teal-400 bg-teal-50/20' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileInput}
          disabled={isLoading}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-lg font-bold text-slate-800">
                Drag and drop your medical report here
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload your lab slip or diagnostic document. Supported formats: PDF, JPG, PNG up to 10MB.
              </p>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
            >
              Browse Files
            </button>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium"><FileText className="w-3.5 h-3.5 text-teal-600" /> PDF</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium"><ImageIcon className="w-3.5 h-3.5 text-cyan-600" /> JPG / PNG</span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {previewUrl ? (
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
                <img src={previewUrl} alt="Report preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
                <FileText className="w-8 h-8" />
              </div>
            )}

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-slate-900">{file.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Ready to Analyze
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearSelection}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upload & Process with API
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Demo Previews */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Or Load Pre-Populated Sample Reports
          </h3>
          <span className="text-xs text-teal-600 font-medium">Instant preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onLoadSample('cbc')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/40 text-left transition flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Complete Blood Count (CBC)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluates Hemoglobin, WBC elevation, Platelets & anemia indicators
              </p>
            </div>
            <FileCheck2 className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0 ml-2" />
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('lipid')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/40 text-left transition flex items-center justify-between group"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                Lipid & Cholesterol Profile
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluates Total Cholesterol, LDL, HDL & Triglyceride cardiovascular flags
              </p>
            </div>
            <FileCheck2 className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
