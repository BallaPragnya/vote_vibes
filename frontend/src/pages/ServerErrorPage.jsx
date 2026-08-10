import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12 px-4 max-w-md mx-auto">
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 mb-6 animate-pulse">
        <AlertCircle className="w-10 h-10" />
      </div>

      <h1 className="text-6xl font-extrabold text-white tracking-tight mb-2">500</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-3">Something Went Wrong</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-8 leading-relaxed">
        We're having trouble processing your request. Please try again or return to the home page.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(0)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
