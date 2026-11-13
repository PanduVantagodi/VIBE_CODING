import React from 'react';
import { Languages } from 'lucide-react';

export default function LanguageSelector({ selected, onChange, disabled }) {
  const languages = [
    { code: 'en', label: 'English (Simple)' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Languages className="w-4 h-4 text-slate-500" />
      <span className="text-xs font-medium text-slate-600">Language:</span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
