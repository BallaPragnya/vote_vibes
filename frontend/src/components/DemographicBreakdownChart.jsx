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
import { Users } from 'lucide-react';

const COLORS = ['#a855f7', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export default function DemographicBreakdownChart({ demographicData = [] }) {
  if (demographicData.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Demographic & Category Breakdown
          </h3>
          <p className="text-[11px] text-slate-400">Participation across ballot categories</p>
        </div>
        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
          <Users className="w-4 h-4" />
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={demographicData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
            />
            <Bar dataKey="totalVotes" radius={[8, 8, 0, 0]}>
              {demographicData.map((_, index) => (
                <Cell key={`cell-demo-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
