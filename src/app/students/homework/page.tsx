'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { BookOpenCheck, CheckSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomeworkWorkCompletionPage() {
  const students = store.getStudents();
  const avgHomework = Number(
    (students.reduce((acc, s) => acc + s.discipline.homeworkCompletionPercentage, 0) / (students.length || 1)).toFixed(1)
  );
  const avgBook = Number(
    (students.reduce((acc, s) => acc + s.discipline.bookCompletionPercentage, 0) / (students.length || 1)).toFixed(1)
  );

  const completedStudents = students.filter((s) => s.discipline.homeworkCompletionPercentage >= 80).length;
  const lowCompletionStudents = students.filter((s) => s.discipline.homeworkCompletionPercentage < 60).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Homework & Work Completion</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual tracking across Daily Homework Assignments and Physical Textbook/Copy Verification Records
            </p>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Avg Homework Completion</span>
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{avgHomework}%</div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">Daily assignment tracking</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Avg Book/Copy Completion</span>
              <BookOpenCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{avgBook}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Physical notebook checks</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">On-Track Students (&ge;80%)</span>
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-600">{completedStudents}</div>
            <div className="text-[11px] text-slate-500 mt-1">Consistent submission</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Incomplete Work Risk (&lt;60%)</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-600">{lowCompletionStudents}</div>
            <div className="text-[11px] text-red-700 font-semibold mt-1">Requires academic warning</div>
          </div>
        </div>

        {/* Student Homework Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Work Completion Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Homework Completion</th>
                  <th className="py-2.5 px-3">Book/Copy Verification</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{s.className}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{s.discipline.homeworkCompletionPercentage}%</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">{s.discipline.bookCompletionPercentage}%</td>
                    <td className="py-2.5 px-3">
                      <Link href={`/students/${s.id}`} className="text-blue-600 font-semibold hover:underline">
                        360 Profile
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
