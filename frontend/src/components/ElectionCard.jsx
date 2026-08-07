import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Eye, Edit3, Trash2, ArrowRight } from 'lucide-react';
import ElectionStatusBadge from './ElectionStatusBadge';
import useAuth from '../hooks/useAuth';

export default function ElectionCard({ election, onDelete }) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);

  const startDateFormatted = election?.startTime || election?.startDate
    ? new Date(election.startTime || election.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'TBD';

  const endDateFormatted = election?.endTime || election?.endDate
    ? new Date(election.endTime || election.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'TBD';

  const creatorName = election?.createdBy?.name || election?.createdBy?.email || 'Election Commission';

  const canEdit = isAdmin && election?.status === 'DRAFT';
  const canDelete = isAdmin && (election?.status === 'DRAFT' || election?.status === 'CANCELLED');

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group shadow-lg">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <ElectionStatusBadge status={election?.status} />
          {election?.isDepartmentRestricted && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
              Department Restricted
            </span>
          )}
        </div>

        {/* Election Title */}
        <h3 className="font-bold text-slate-100 text-base mb-1.5 line-clamp-1 group-hover:text-indigo-300 transition-colors">
          {election?.title}
        </h3>

        {/* Election Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {election?.description || 'No description provided for this college election event.'}
        </p>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Start: {startDateFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="truncate">End: {endDateFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate text-slate-500">Created by: {creatorName}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          to={`/elections/${election?.id}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            {canEdit && (
              <Link
                to={`/admin/elections/${election?.id}/edit`}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Edit Election Parameters"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(election?.id, election?.title)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                title="Delete Election"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
