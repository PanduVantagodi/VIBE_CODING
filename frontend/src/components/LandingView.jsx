import React, { useState } from 'react';
import { 
  HeartPulse, 
  Upload, 
  Play, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Heart, 
  CheckCircle2, 
  ArrowRight, 
  Stethoscope,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

export default function LandingView({ onNavigateToUpload, onLoadSample }) {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* Hero Section matching reference */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Report <span className="text-teal-700">Saathi</span>
              </h1>
              <div className="w-20 h-1.5 bg-teal-500 rounded-full mt-2" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Your Medical Reports, Made Easy to Understand
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Upload your medical reports and get simple, clear explanations with helpful health insights, reference range comparisons, and questions for your doctor.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateToUpload}
                className="px-7 py-3.5 rounded-full font-bold text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/25 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Upload className="w-4 h-4 text-teal-200 group-hover:-translate-y-0.5 transition-transform" />
                <span>Upload Report</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowDemoModal(true)}
                className="px-6 py-3.5 rounded-full font-bold text-sm bg-white hover:bg-teal-50/50 text-teal-800 border-2 border-teal-600/40 hover:border-teal-600 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-teal-700 text-teal-700" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Visual Composition matching reference graphic */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Background Organic Fluid Shapes */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-teal-100/70 via-cyan-100/50 to-emerald-100/40 rounded-[3rem] blur-2xl -z-10" />

            {/* Glowing Heart Pulse Graphic Icon top right */}
            <div className="absolute -top-6 -right-2 w-14 h-14 rounded-2xl bg-white shadow-lg border border-teal-100 flex items-center justify-center text-teal-600 animate-bounce duration-1000">
              <HeartPulse className="w-8 h-8" />
            </div>

            {/* Medical Report Paper Card */}
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-rose-500 text-white flex items-center justify-center font-bold text-base leading-none">
                  +
                </span>
                <span className="font-bold text-slate-900 text-sm">Medical Report</span>
              </div>

              {/* Skeleton Document Lines */}
              <div className="space-y-2 py-1">
                <div className="h-2.5 bg-slate-200 rounded-full w-4/5" />
                <div className="h-2 bg-slate-100 rounded-full w-full" />
                <div className="h-2 bg-slate-100 rounded-full w-3/4" />
                <div className="h-2 bg-slate-100 rounded-full w-5/6" />
              </div>

              {/* Overlapping Feature Badge List (matching mockup) */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50/80 rounded-2xl p-4 border border-teal-100/80 shadow-inner space-y-2.5">
                {[
                  "Simple Explanation",
                  "Key Findings",
                  "Health Tips",
                  "Next Steps"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-teal-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-100" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Pills Bar matching reference */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">AI-Powered</p>
              <p className="text-xs text-slate-500">Analysis & OCR</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Trusted & Secure</p>
              <p className="text-xs text-slate-500">Private In-Memory</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Instant Insights</p>
              <p className="text-xs text-slate-500">Under 5 Seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Better Health</p>
              <p className="text-xs text-slate-500">Informed Decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Report Saathi Section matching bottom banner */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Stethoscope Photo Container */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-100 shadow-md h-56 sm:h-64">
            <img 
              src="/hero-medical.jpg" 
              alt="Clinical Medical Stethoscope" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>

          {/* About Text */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                About Report <span className="text-teal-700">Saathi</span>
              </h3>
              <div className="w-16 h-1 bg-teal-500 rounded-full mt-1.5" />
            </div>

            <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
              We believe good health starts with understanding.
            </p>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              <strong>Report Saathi</strong> is your smart companion to decode complex medical reports and empower you to take better care of your health. Whether you are reviewing routine Complete Blood Counts, fasting glucose, or lipid and cholesterol panels, we break down numbers, highlight out-of-range indicators, and provide guided questions to discuss with your doctor.
            </p>

            <div className="pt-2">
              <button
                onClick={onNavigateToUpload}
                className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-teal-700 hover:text-teal-900 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 transition"
              >
                <span>Upload a Report Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video / Walkthrough Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-700 fill-teal-700" />
                <h4 className="font-bold text-slate-900 text-base">Report Saathi Quick Tour</h4>
              </div>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                Experience the live pipeline in 2 seconds by testing our pre-configured clinical reports:
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={() => { setShowDemoModal(false); onLoadSample('cbc'); }}
                  className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100 text-left flex items-center justify-between"
                >
                  <span>1. Complete Blood Count (CBC) Demo</span>
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                </button>
                <button
                  onClick={() => { setShowDemoModal(false); onLoadSample('lipid'); }}
                  className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold hover:bg-teal-100 text-left flex items-center justify-between"
                >
                  <span>2. Lipid & Cholesterol Panel Demo</span>
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                </button>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
