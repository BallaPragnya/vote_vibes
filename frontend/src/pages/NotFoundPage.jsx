import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-amber-400 mb-6 animate-bounce">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <h1 className="text-6xl font-extrabold text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-3">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-8 leading-relaxed">
        The requested URL could not be located on the VoteVibes platform. Please verify the web route.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <Home className="w-4 h-4" />
          Home Page
        </Link>

        {isAuthenticated && (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
