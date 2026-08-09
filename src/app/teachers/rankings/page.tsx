'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Award, BarChart3, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function TeacherRankingsPage() {
  const teachers = store.getTeachers();

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Teacher Rankings Leaderboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative performance rankings derived dynamically from student cohort outcomes
            </p>
          </div>
          <Link href="/teachers/comparison" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500">
            Compare Educators →
          </Link>
        </div>

        {/* Teacher Ranking Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Performance Index</th>
                  <th className="py-2.5 px-3">Student Impr</th>
                  <th className="py-2.5 px-3">Academic</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Parent Feedback</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className={`hover:bg-slate-50 ${idx === 0 ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {idx === 0 ? <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-bold rounded-full">#1</span> : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3 px-3 text-slate-500">{t.subject}</td>
                    <td className="py-3 px-3 font-extrabold text-blue-600 text-sm">{t.performanceBreakdown.score}</td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">+{t.performanceBreakdown.studentImprovement.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-slate-700">{t.avgStudentPerformance}%</td>
                    <td className="py-3 px-3 text-slate-700">{t.avgAttendance}%</td>
                    <td className="py-3 px-3 font-semibold text-amber-600">{t.performanceBreakdown.parentFeedback}</td>
                    <td className="py-3 px-3">
                      <Link href={`/teachers/${t.id}`} className="text-blue-600 font-semibold hover:underline">
                        Profile
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
