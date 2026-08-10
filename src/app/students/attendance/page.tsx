'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { getSchoolAttendanceSummary, getClassAttendanceSummary } from '@/lib/aggregations';
import { INTELLIGENCE_CONFIG } from '@/lib/config/intelligence-config';
import { CalendarCheck, Users, AlertTriangle } from 'lucide-react';

export default function AttendanceIntelligencePage() {
  const students = store.getStudents();
  const summary = getSchoolAttendanceSummary(students);
  const classSummaries = getClassAttendanceSummary(students);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance tracking, chronic absenteeism analytics & class-level trends
            </p>
          </div>
        </div>

        {/* 4 Attendance KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Average Attendance</span>
              <CalendarCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{summary.avgAttendance}%</div>
            <div className="text-[11px] text-purple-600 font-medium mt-1">School-wide target {INTELLIGENCE_CONFIG.ATTENDANCE_TARGET_PERCENTAGE}%</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Students with ≥75% Attendance</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{summary.healthyAttendanceCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">out of {students.length} enrolled</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Below 75% Attendance</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{summary.below75}</div>
            <div className="text-[11px] text-amber-800 font-medium mt-1">Requires follow-up</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Chronic Absenteeism (&lt;60%)</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-extrabold text-red-600">{summary.below60}</div>
            <div className="text-[11px] text-red-800 font-medium mt-1">Critical intervention</div>
          </div>
        </div>

        {/* Class Attendance Breakdown Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Class Section Attendance Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Class Section</th>
                  <th className="py-2.5 px-3">Student Enrolled</th>
                  <th className="py-2.5 px-3">Average Attendance</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classSummaries.map((c) => (
                  <tr key={c.className} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">Class {c.className}</td>
                    <td className="py-3 px-3 text-slate-600">{c.studentCount} Students</td>
                    <td className="py-3 px-3 font-extrabold text-purple-900">{c.avgAttendance}%</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 font-bold text-[10px] rounded-full ${
                          c.avgAttendance >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.avgAttendance >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.avgAttendance >= 90 ? 'Healthy' : c.avgAttendance >= 75 ? 'Moderate' : 'Critical'}
                      </span>
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
