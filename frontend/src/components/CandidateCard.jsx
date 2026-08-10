import React from 'react';
import { Link } from 'react-router-dom';
import CandidateStatusBadge from './CandidateStatusBadge';
import { User, Eye, CheckCircle2, XCircle, ArrowRight, Award, FileText } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function CandidateCard({ candidate, onApprove, onReject, onWithdraw }) {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);
  const isOwner = user?.id === (candidate?.userId || candidate?.user?.id);

  const photo = candidate?.profileImage || candidate?.photoUrl || candidate?.user?.profileImage;
  const name = candidate?.fullName || candidate?.user?.name || 'Nominated Candidate';
  const electionTitle = candidate?.election?.title || 'Campus Election';
  const status = candidate?.nominationStatus || candidate?.approvalStatus || candidate?.status || 'PENDING';

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group shadow-lg">
      <div>
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <CandidateStatusBadge status={status} />
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" /> Nominee
          </span>
        </div>

        {/* Candidate Profile Info */}
        <div className="flex items-center gap-3 mb-4">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border-2 border-amber-500/30 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <User className="w-6 h-6" />
            </div>
          )}

          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-100 text-sm truncate group-hover:text-amber-300 transition-colors">
              {name}
            </h3>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {electionTitle}
            </p>
          </div>
        </div>

        {/* Manifesto Snippet */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 mb-1">
            <FileText className="w-3 h-3 text-amber-400" />
            <span>Manifesto Summary</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic">
            "{candidate?.manifesto || 'No manifesto details submitted yet.'}"
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/candidates/${candidate?.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Manifesto</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Admin Approval Controls */}
        {isAdmin && status === 'PENDING' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onApprove(candidate?.id)}
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
              title="Approve Nomination"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onReject(candidate?.id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Reject Nomination"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Candidate Owner Withdraw Control */}
        {isOwner && status === 'PENDING' && (
          <button
            type="button"
            onClick={() => onWithdraw(candidate?.id)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
          >
            Withdraw
          </button>
        )}
      </div>

    </div>
  );
}
