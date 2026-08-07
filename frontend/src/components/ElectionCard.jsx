import React from 'react';
import { Link } from 'react-router-dom';
import ElectionStatusBadge from './ElectionStatusBadge';
import { Calendar, Eye, Edit, Trash2, ArrowRight, Vote, BarChart3 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function ElectionCard({ election, onDelete }) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);

  const startDateFormatted = election?.startDate
    ? new Date(election.startDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const endDateFormatted = election?.endDate
    ? new Date(election.endDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const isEditable = election?.status === 'DRAFT' && isAdmin;
  const isDeletable = (election?.status === 'DRAFT' || election?.status === 'CANCELLED') && isAdmin;
  const isActive = election?.status === 'ACTIVE';
  const isCompleted = election?.status === 'COMPLETED';

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group shadow-lg">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <ElectionStatusBadge status={election?.status} />
          {election?.createdBy && (
            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
              By: {election.createdBy.name || 'Admin'}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-slate-100 text-base mb-1.5 group-hover:text-indigo-300 transition-colors line-clamp-1">
          {election?.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {election?.description || 'No description provided.'}
        </p>

        {/* Date Schedule */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-400 mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Starts:
            </span>
            <span className="font-medium text-slate-300">{startDateFormatted}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              Ends:
            </span>
            <span className="font-medium text-slate-300">{endDateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/elections/${election?.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>

          {/* Active Election: Cast Vote CTA */}
          {isActive && (
            <Link
              to={`/elections/${election?.id}/vote`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-md shadow-indigo-500/20 transition-all"
            >
              <Vote className="w-3 h-3" />
              <span>Cast Vote</span>
            </Link>
          )}

          {/* Completed Election: View Results CTA */}
          {isCompleted && (
            <Link
              to={`/elections/${election?.id}/results`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Results</span>
            </Link>
          )}
        </div>

        {/* Admin Actions */}
        <div className="flex items-center gap-1.5">
          {isEditable && (
            <Link
              to={`/admin/elections/${election?.id}/edit`}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Edit Election"
            >
              <Edit className="w-3.5 h-3.5" />
            </Link>
          )}

          {isDeletable && (
            <button
              onClick={() => onDelete(election?.id, election?.title)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Delete Election"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
