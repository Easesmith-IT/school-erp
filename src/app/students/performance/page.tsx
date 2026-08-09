'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import Link from 'next/link';
import { GraduationCap, Trophy, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function StudentPerformancePage() {
  const students = store.getStudents();
  const topPerformers = [...students].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score).slice(0, 15);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-blue-600 mb-1">Performance Intelligence</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Performance Ranking</h1>
            <p className="text-xs text-slate-500 mt-0.5">Calculated across Academics (55%), Discipline (25%), Engagement (10%), and Parent PTM (10%).</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3 text-right">Academic (55%)</th>
                  <th className="p-3 text-right">Discipline (25%)</th>
                  <th className="p-3 text-right">Engagement (10%)</th>
                  <th className="p-3 text-right">Parent PTM (10%)</th>
                  <th className="p-3 text-right">Overall Score</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topPerformers.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx < 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-slate-600">{s.className}</td>
                    <td className="p-3 text-right text-slate-800">{s.performanceBreakdown.academicScore}</td>
                    <td className="p-3 text-right text-slate-800">{s.performanceBreakdown.disciplineScore}</td>
                    <td className="p-3 text-right text-slate-800">{s.performanceBreakdown.engagementScore}</td>
                    <td className="p-3 text-right text-slate-800">{s.performanceBreakdown.parentEngagementScore}</td>
                    <td className="p-3 text-right font-black text-blue-600 text-sm">{s.performanceBreakdown.score}</td>
                    <td className="p-3 text-center">
                      <Link href={`/students/${s.id}`} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1">
                        View 360 <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
