import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  ShieldCheck, 
  Vote, 
  CheckCircle2, 
  KeyRound, 
  Cpu, 
  BarChart3, 
  Layers, 
  Clock, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role, accessToken } = useAuth();

  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'CANDIDATE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'VOTER':
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Authenticated Session Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-300 bg-clip-text text-transparent">{user?.name || 'Voter'}</span>!
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Access your college election dashboard, view active ballots, and verify custom blockchain receipts.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(role)}`}>
              Role: {role || 'VOTER'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              JWT Dual-Token Protected
            </span>
          </div>
        </div>
      </div>

      {/* User Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details Card */}
        <div className="md:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Voter Profile</h3>
                <p className="text-xs text-slate-500">Account Credentials</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Full Name</p>
                <p className="font-semibold text-slate-200 mt-0.5">{user?.name || 'Jane Student'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Email Address</p>
                <p className="font-semibold text-slate-200 mt-0.5">{user?.email || 'jane.student@college.edu'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">User UUID</p>
                <p className="font-mono text-slate-300 text-[10px] truncate mt-0.5">{user?.id || 'e4a7c8b2-1234-4567-89ab-cdef01234567'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> RBAC Verified
            </span>
            <span className="font-mono text-slate-500">v1.0</span>
          </div>
        </div>

        {/* Action Modules Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Active Elections */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit mb-3 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Vote className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">Active College Elections</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                View ongoing campus elections, candidate manifestos, and cast your secure vote.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Phase 3 Ready
              </span>
              <button className="text-xs font-semibold text-indigo-300 group-hover:text-white flex items-center gap-1">
                View Ballots <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Blockchain Audit Verification */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-2.5 bg-violet-500/10 rounded-xl w-fit mb-3 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">Blockchain Vote Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect custom SHA-256 block ledger, cryptographic hashes, and verify vote receipts.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-violet-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Immutable Audit
              </span>
              <button className="text-xs font-semibold text-violet-300 group-hover:text-white flex items-center gap-1">
                Audit Explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Results & Analytics */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-2.5 bg-purple-500/10 rounded-xl w-fit mb-3 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">Results & Analytics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time election outcome charts, voter turnout statistics, and official winner announcements.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-purple-400 font-medium">Live Tallies</span>
              <button className="text-xs font-semibold text-purple-300 group-hover:text-white flex items-center gap-1">
                View Results <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: RBAC & Admin Tools (If ADMIN) */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-2.5 bg-amber-500/10 rounded-xl w-fit mb-3 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">Election Commission Control</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage candidate nominations, set election windows, and inspect security logs.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-amber-400 font-medium">
                {role === 'ADMIN' ? 'Admin Access Granted' : 'Role: Voter Standard'}
              </span>
              <button className="text-xs font-semibold text-amber-300 group-hover:text-white flex items-center gap-1">
                Admin Panel <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Security Infrastructure Summary Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Session verified via <strong>JWT Access & Refresh Token pair</strong> stored securely in memory & database.</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 shrink-0">
          Branch: archananewphase2
        </div>
      </div>

    </div>
  );
}
