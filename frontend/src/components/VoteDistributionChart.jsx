import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function VoteDistributionChart({ positionTitle, candidates = [] }) {
  const chartData = candidates.map((c) => ({
    name: c.fullName || c.name || 'Candidate',
    votes: c.voteCount || c.votes || 0,
  }));

  if (candidates.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-500">
        No vote distribution data available for {positionTitle}.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Vote Distribution — {positionTitle}
          </h3>
          <p className="text-[11px] text-slate-400">Candidate tally distribution bar chart</p>
        </div>
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
          <BarChart3 className="w-4 h-4" />
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            />
            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
