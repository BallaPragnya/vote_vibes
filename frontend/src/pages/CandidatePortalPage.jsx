import React from 'react';
import useAuth from '../hooks/useAuth';
import { 
  Award, 
  FileText, 
  UserCheck, 
  BarChart2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function CandidatePortalPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 py-4">
      
      {/* Candidate Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Candidate Portal Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Candidate Workspace: <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Manage your election candidacy nomination status, campaign manifesto details, and monitor election participation metrics.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/20 text-amber-300 uppercase tracking-wider">
              Role: CANDIDATE
            </span>
            <span className="text-[11px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              Nomination Status: Approved
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-amber-500/10 rounded-xl w-fit mb-4 text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Campaign Manifesto</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edit your candidate bio, key election promises, and campaign manifesto published to voters.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-amber-400 font-medium">Published</span>
            <button className="text-xs font-semibold text-amber-300 group-hover:text-white flex items-center gap-1">
              Edit Manifesto <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-amber-500/10 rounded-xl w-fit mb-4 text-amber-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Nomination Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View official approval document from the College Election Commission and candidate ID tag.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Candidate
            </span>
            <button className="text-xs font-semibold text-amber-300 group-hover:text-white flex items-center gap-1">
              View Credentials <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="p-3 bg-amber-500/10 rounded-xl w-fit mb-4 text-amber-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-100 text-base mb-1">Live Turnout Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track overall voter turnout percentage across departments during active voting hours.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Voting Live
            </span>
            <button className="text-xs font-semibold text-amber-300 group-hover:text-white flex items-center gap-1">
              View Turnout <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
