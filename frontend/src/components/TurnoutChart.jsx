import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#10b981', '#334155'];

export default function TurnoutChart({ turnoutInfo }) {
  const { totalVotesCast = 0, eligibleVoters = 500 } = turnoutInfo || {};
  const nonVoters = Math.max(0, eligibleVoters - totalVotesCast);

  const data = [
    { name: 'Voted', value: totalVotesCast },
    { name: 'Non-Voting', value: nonVoters },
  ];

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Voter Turnout Rate
          </h3>
          <p className="text-[11px] text-slate-400">Participating vs Non-participating voter breakdown</p>
        </div>
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
          <PieIcon className="w-4 h-4" />
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
