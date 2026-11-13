import React from 'react';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent">
                ReportSaathi
              </span>
              <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                AI Lab Companion
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Simplifying medical reports into friendly, everyday language
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
            <span>For educational purposes only • Not medical advice</span>
          </div>
        </div>
      </div>
    </header>
  );
}
