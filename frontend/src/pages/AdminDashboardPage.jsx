import React from 'react';
import useAuth from '../hooks/useAuth';
import { 
  Settings, 
  Users, 
  Layers, 
  ShieldAlert, 
  PlusCircle, 
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 py-4">
      
      {/* Admin Console Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Election Commission Console
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Administrator Control Panel
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Logged in as <span className="font-semibold text-purple-300">{user?.name}</span> ({user?.email}). Manage campus elections, candidate approvals, and inspect blockchain audit logs.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/20 text-purple-300 uppercase tracking-wider">
              Role: ADMINISTRATOR
            </span>
            <span className="text-[11px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Full RBAC Privileges
            </span>
          </div>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 text-purple-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Create New Election</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Initialize election titles, voting start/end timetables, and department eligibility criteria.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-purple-400 font-medium">Phase 3 Backend Ready</span>
            <button className="text-xs font-semibold text-purple-300 group-hover:text-white flex items-center gap-1">
              Create Election <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Candidate Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review pending candidate nominations, verify eligibility documentation, and approve ballot placements.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-purple-400 font-medium">RBAC Admin Guard</span>
            <button className="text-xs font-semibold text-purple-300 group-hover:text-white flex items-center gap-1">
              Manage Nominations <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Blockchain Ledger Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run integrity validation checks on the SHA-256 vote chain and inspect tamper-detection logs.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ledger Valid
            </span>
            <button className="text-xs font-semibold text-purple-300 group-hover:text-white flex items-center gap-1">
              Run Validation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
