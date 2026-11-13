import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import LandingView from './components/LandingView';
import UploadSection from './components/UploadSection';
import ResultsView from './components/ResultsView';
import HistoryView from './components/HistoryView';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import { sampleReports } from './data/sampleData';
import { HeartHandshake } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing'); // 'landing' | 'dashboard' | 'history'
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'empty'
  const [analyzedData, setAnalyzedData] = useState(null);
  const [activeFileName, setActiveFileName] = useState('');
  const [errorDetails, setErrorDetails] = useState({ title: '', message: '' });
  const [user, setUser] = useState(null);

  // Monitor Supabase auth session if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleAnalyzeFile = async (file) => {
    setActiveFileName(file.name);
    setStatus('loading');
    setErrorDetails({ title: '', message: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/reports/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      if (result.status === 'unreadable') {
        setErrorDetails({
          title: result.title || "Unreadable Report Content",
          message: result.overall_summary || "Could not detect clear printed text. Please try a higher quality scan or picture."
        });
        setStatus('error');
        return;
      }

      setAnalyzedData(result);
      setStatus('success');
    } catch (err) {
      console.error("API error:", err);
      const detail = err.response?.data?.detail || err.message || "Failed to reach the report analysis service.";
      setErrorDetails({
        title: "Analysis Request Failed",
        message: detail
      });
      setStatus('error');
    }
  };

  const handleLoadSample = (sampleKey) => {
    setCurrentTab('dashboard');
    setActiveFileName(sampleKey === 'lipid' ? 'sample_lipid_panel.pdf' : 'sample_complete_blood_count.pdf');
    setStatus('loading');

    setTimeout(() => {
      setAnalyzedData(sampleReports[sampleKey] || sampleReports.cbc);
      setStatus('success');
    }, 600);
  };

  const handleReset = () => {
    setAnalyzedData(null);
    setStatus('idle');
    setErrorDetails({ title: '', message: '' });
  };

  const handleViewHistoricalReport = (historicalItem) => {
    setAnalyzedData({
      title: historicalItem.report_title,
      filename: historicalItem.filename,
      overallSummary: historicalItem.overall_summary,
      clarity_assessment: historicalItem.clarity_assessment,
      sections: historicalItem.sections,
      keyTakeaways: historicalItem.key_findings,
      doctorQuestions: historicalItem.questions_for_doctor,
      ai_powered: false,
      disclaimer: "Historical Saved Educational Summary"
    });
    setCurrentTab('dashboard');
    setStatus('success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Header 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
        user={user}
        setUser={setUser}
        onViewHistory={() => setCurrentTab('history')}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentTab === 'landing' && (
          <LandingView 
            onNavigateToUpload={() => setCurrentTab('dashboard')} 
            onLoadSample={handleLoadSample}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView 
            user={user}
            onViewReport={handleViewHistoricalReport}
            onNavigateToUpload={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Lab Report Analysis
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Understand your biomarkers, clinical flags, and questions for your doctor
                </p>
              </div>

              {status !== 'idle' && (
                <button
                  onClick={handleReset}
                  className="self-start sm:self-auto text-xs px-3.5 py-2 font-semibold rounded-xl text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
                >
                  Upload New File
                </button>
              )}
            </div>

            {/* State Router */}
            {status === 'idle' && (
              <UploadSection 
                onAnalyze={handleAnalyzeFile}
                isLoading={false}
                onLoadSample={handleLoadSample}
              />
            )}

            {status === 'loading' && (
              <LoadingState fileName={activeFileName} />
            )}

            {status === 'success' && (
              <ResultsView 
                data={analyzedData} 
                onReset={handleReset} 
                user={user}
              />
            )}

            {status === 'error' && (
              <ErrorState 
                title={errorDetails.title}
                message={errorDetails.message}
                onRetry={handleReset}
                onReset={handleReset}
              />
            )}

            {status === 'empty' && (
              <EmptyState 
                onUploadClick={handleReset}
                onLoadSample={handleLoadSample}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600 shrink-0" />
            <p>
              <strong className="text-slate-800">ReportSaathi</strong> • Educational Lab Literacy Project.
            </p>
          </div>
          <p className="text-[11px] text-slate-400 max-w-md">
            Informational and educational guidance only. Not diagnostic advice. Always seek advice from your licensed doctor or healthcare professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
