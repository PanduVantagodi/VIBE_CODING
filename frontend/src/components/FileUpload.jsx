import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSelect = (file) => {
    setErrorMsg('');
    if (!file) return;

    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMsg('Please upload a PDF document or image (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit.');
      return;
    }

    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-teal-400 bg-white shadow-sm hover:shadow'
        } ${isLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              {selectedFileName ? (
                <span className="text-teal-700 font-medium">Selected: {selectedFileName}</span>
              ) : (
                'Drop your lab test report here, or click to browse'
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports Blood Tests, Urine Panels, Lipid Profiles, Metabolic Panels in PDF or Image
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> PNG / JPG / WEBP</span>
            <span>•</span>
            <span>Max 15MB</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
