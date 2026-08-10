import React from 'react';
import useAuth from '../hooks/useAuth';
import { 
  User, 
  ShieldCheck, 
  Vote, 
  CheckCircle2, 
  Layers, 
  Clock, 
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';

export default function VoterDashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-8 py-4">
      
      {/* Voter Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Voter Portal Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-300 bg-clip-text text-transparent">{user?.name || 'Voter'}</span>!
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Cast your secure ballot in active student elections and verify cryptographic vote receipts on the SHA-256 blockchain ledger.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
              Role: VOTER
            </span>
            <span className="text-[11px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Session Verified
            </span>
          </div>
        </div>
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details */}
        <div className="md:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Student Profile</h3>
                <p className="text-xs text-slate-500">Verified Voter Account</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Full Name</p>
                <p className="font-semibold text-slate-200 mt-0.5">{user?.name}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">College Email</p>
                <p className="font-semibold text-slate-200 mt-0.5">{user?.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Voter UUID</p>
                <p className="font-mono text-slate-300 text-[10px] truncate mt-0.5">{user?.id}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authorized Voter
            </span>
            <span className="font-mono text-slate-500">VoteVibes</span>
          </div>
        </div>

        {/* Voter Quick Actions */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-2.5 bg-indigo-500/10 rounded-xl w-fit mb-3 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Vote className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">Active Ballots</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review candidates standing for Student Council & Department positions and submit your ballot.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Elections Open
              </span>
              <button className="text-xs font-semibold text-indigo-300 group-hover:text-white flex items-center gap-1">
                Cast Vote <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="p-2.5 bg-violet-500/10 rounded-xl w-fit mb-3 text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">Blockchain Receipts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify your anonymized vote receipt against the SHA-256 block hash on the ledger.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-violet-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Immutable Verification
              </span>
              <button className="text-xs font-semibold text-violet-300 group-hover:text-white flex items-center gap-1">
                Verify Receipt <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
