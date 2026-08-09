'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { TrendingUp, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function PerformanceTrendsPage() {
  const students = store.getStudents();
  
  const overallTrend = [
    { term: 'PA-I', avgScore: 74.2 },
    { term: 'PA-II', avgScore: 76.4 },
    { term: 'SA-I', avgScore: 77.5 },
    { term: 'Current', avgScore: 78.5 },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Performance Trends Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal tracking of academic progress across terms, cohorts, and subjects
            </p>
          </div>
        </div>

        {/* Overall School Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">School-wide Academic Trend</h2>
            <span className="text-xs font-semibold text-emerald-600">↑ +4.3% Overall Improvement</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overallTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[65, 85]} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
