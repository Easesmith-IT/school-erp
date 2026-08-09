'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { FileSpreadsheet, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentIntelligencePage() {
  const assessments = store.getAssessments();
  const students = store.getStudents();

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assessment Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluation metrics across PA-I, PA-II, SA-I and SA-II terms for 1,248 students
            </p>
          </div>
        </div>

        {/* 4 Term Assessment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assessments.map((ass) => (
            <div key={ass.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-md">{ass.assessmentName}</span>
                <span className="text-xs font-semibold text-emerald-600">{ass.passRate}% Pass Rate</span>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium">Average Score</div>
                <div className="text-2xl font-extrabold text-slate-900">{ass.averageScore}%</div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Highest:</span> <strong className="text-slate-900">{ass.highestScore}%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Lowest:</span> <strong className="text-slate-900">{ass.lowestScore}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Subject Breakdown Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Term Evaluation Distribution</h2>
            <Link href="/students/trends" className="text-xs font-semibold text-blue-600 hover:underline">
              Performance Trends →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">PA-I</th>
                  <th className="py-2.5 px-3">PA-II</th>
                  <th className="py-2.5 px-3">SA-I</th>
                  <th className="py-2.5 px-3">Current Score</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{s.className}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.assessmentTrend.pa1}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.assessmentTrend.pa2}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.assessmentTrend.sa1}%</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{s.assessmentTrend.current}%</td>
                    <td className="py-2.5 px-3">
                      <Link href={`/students/${s.id}`} className="text-blue-600 font-semibold hover:underline">
                        360 View
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
