'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { getSchoolAttendanceSummary, getClassAttendanceSummary } from '@/lib/aggregations';
import { CalendarCheck, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

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
              Daily presence tracking, chronic absenteeism analytics & class-level trends
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
            <div className="text-[11px] text-purple-600 font-medium mt-1">School-wide target 91.8%</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Present Today</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{summary.presentToday}</div>
            <div className="text-[11px] text-slate-500 mt-1">out of 1,248 enrolled</div>
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
            <div className="text-[11px] text-red-700 font-semibold mt-1">High risk flag</div>
          </div>
        </div>

        {/* Class-wise Attendance Grid */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Class-wise Attendance Comparison</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {classSummaries.map((c) => (
              <div key={c.className} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Class {c.className}</span>
                  <span className="text-purple-600">{c.avgAttendance}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${c.avgAttendance}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{c.studentCount} Students</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
