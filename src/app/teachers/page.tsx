'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Teacher } from '@/types/schema';
import { Award, TrendingUp, Users, CheckCircle2, ChevronRight, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { DomainNavTabs } from '@/components/common/DomainNavTabs';

export default function TeacherPerformancePage() {
  const teachers = store.getTeachers();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(teachers[0]); // Default to Priya Sharma

  const teacherTabs = [
    { label: 'Teacher Intelligence', href: '/teachers' },
    { label: 'Rankings', href: '/teachers/rankings' },
    { label: 'Comparison Summary', href: '/teachers/comparison' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              Academic Operations Intelligence
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Teacher Performance Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluates student academic improvement, discipline, work completion, and engagement across cohorts.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs text-blue-800 font-medium">
            Weighted Score Model (35% Student Impr., 25% Academics, 15% Attd.)
          </div>
        </div>

        {/* Domain Navigation Tabs */}
        <DomainNavTabs tabs={teacherTabs} />

        {/* Model Explanation Callout */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Teacher Intelligence Scoring Model</h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-center">
              <div className="font-extrabold text-blue-700">35%</div>
              <div className="text-[11px] text-slate-600 font-medium">Student Impr.</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="font-extrabold text-slate-800">25%</div>
              <div className="text-[11px] text-slate-600 font-medium">Academics</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="font-extrabold text-slate-800">15%</div>
              <div className="text-[11px] text-slate-600 font-medium">Attendance</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="font-extrabold text-slate-800">10%</div>
              <div className="text-[11px] text-slate-600 font-medium">Work Compl.</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="font-extrabold text-slate-800">10%</div>
              <div className="text-[11px] text-slate-600 font-medium">Engagement</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="font-extrabold text-slate-800">5%</div>
              <div className="text-[11px] text-slate-600 font-medium">Parent Feedback</div>
            </div>
          </div>
        </div>

        {/* Teacher Ranking Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Teacher Performance Ranking</h2>
            <span className="text-xs text-slate-500 font-medium">{teachers.length} Evaluated Educators</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="table-header">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Assigned Classes</th>
                  <th className="p-3 text-right">Performance Index</th>
                  <th className="p-3 text-right">Student Impr.</th>
                  <th className="p-3 text-right">Avg Attendance</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {teachers.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedTeacher?.id === t.id ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="p-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{t.name}</td>
                    <td className="p-3 text-slate-600">{t.subject}</td>
                    <td className="p-3 text-slate-600">{t.assignedClasses.join(', ')}</td>
                    <td className="p-3 text-right font-extrabold text-blue-600 text-sm">
                      {t.performanceBreakdown.score}
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-600">
                      {t.performanceBreakdown.studentImprovement} pts
                    </td>
                    <td className="p-3 text-right text-slate-700">{t.avgAttendance}%</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedTeacher(t)}
                        className="text-xs bg-slate-100 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded font-semibold transition-colors"
                      >
                        Inspect Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Teacher Detailed Modal / Panel */}
        {selectedTeacher && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{selectedTeacher.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {selectedTeacher.subject}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Cohorts: {selectedTeacher.assignedClasses.join(', ')} • {selectedTeacher.studentCount} Total Students
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-600">{selectedTeacher.performanceBreakdown.score}</div>
                <div className="text-xs text-slate-500 font-semibold">Teacher Intelligence Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Student Improvement</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">{selectedTeacher.performanceBreakdown.studentImprovement}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Academic Perf.</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{selectedTeacher.performanceBreakdown.academicPerformance}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Attendance</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{selectedTeacher.performanceBreakdown.attendance}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Work Completion</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{selectedTeacher.performanceBreakdown.homeworkBookCompletion}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Engagement</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{selectedTeacher.performanceBreakdown.engagement}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Parent Feedback</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{selectedTeacher.performanceBreakdown.parentFeedback}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
