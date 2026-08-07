import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LayoutDashboard } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function UnauthorizedPage() {
  const { role, isAuthenticated, getRoleRedirectPath } = useAuth();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 mb-6 animate-pulse">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">403</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-3">Access Denied</h2>
      <p className="text-xs text-slate-400 max-w-md mb-8 leading-relaxed">
        Your current role (<span className="font-semibold text-rose-300 uppercase">{role || 'GUEST'}</span>) does not possess authorization to view this area of the VoteVibes platform.
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
            to={getRoleRedirectPath(role)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Authorized Portal
          </Link>
        )}
      </div>
    </div>
  );
}
