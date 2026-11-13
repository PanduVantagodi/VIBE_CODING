import React, { useState } from 'react';
import { 
  HeartPulse, 
  User, 
  LogIn, 
  LogOut, 
  History, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Lock,
  Database
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function Header({ 
  currentTab, 
  onSelectTab, 
  user, 
  setUser, 
  onViewHistory 
}) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setAuthMessage('Account created successfully! Check your email if verification is required, or sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        setUser(data.user);
        setShowAuthModal(false);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => onSelectTab('landing')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Report <span className="text-teal-700">Saathi</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <button
              onClick={() => onSelectTab('landing')}
              className={`transition pb-1 ${
                currentTab === 'landing'
                  ? 'text-teal-700 border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onSelectTab('dashboard')}
              className={`transition pb-1 ${
                currentTab === 'dashboard'
                  ? 'text-teal-700 border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Report
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`transition pb-1 flex items-center gap-1.5 ${
                currentTab === 'history'
                  ? 'text-teal-700 border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Health History</span>
            </button>

            <button
              onClick={() => onSelectTab('landing')}
              className="text-slate-600 hover:text-slate-900 transition pb-1"
            >
              About Us
            </button>
          </nav>

          {/* Auth Action */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full hidden sm:inline-block">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 rounded-full font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{isSupabaseConfigured ? 'Sign In / Register' : 'Demo Account'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Supabase Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-700" />
                <h4 className="font-bold text-slate-900 text-base">
                  {isSupabaseConfigured
                    ? (authMode === 'login' ? 'Sign in to ReportSaathi' : 'Create Free Account')
                    : 'Supabase Demo Status'}
                </h4>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSupabaseConfigured ? (
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setAuthError('');
                      setAuthMessage('');
                    }}
                    className="text-xs text-teal-700 hover:underline font-semibold"
                  >
                    {authMode === 'login' 
                      ? "Don't have an account? Sign up here" 
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-700" />
                    Demo Mode Active (Supabase Not Configured)
                  </p>
                  <p>
                    ReportSaathi runs in <strong>100% Private Guest Mode</strong>. You can analyze any report freely without an account.
                  </p>
                </div>
                <p>
                  To enable live user accounts and save report history, add your Supabase credentials to <code>frontend/.env</code>:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px]">
                  VITE_SUPABASE_URL=https://xyz.supabase.co<br />
                  VITE_SUPABASE_ANON_KEY=eyJh...
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-teal-700 text-white hover:bg-teal-800 transition"
                >
                  Continue in Demo Mode
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
