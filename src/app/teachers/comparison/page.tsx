'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { GitCompare, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TeacherComparisonPage() {
  const teachers = useMemo(() => store.getTeachers(), []);
  const [t1Id, setT1Id] = useState('teacher-1'); // Priya Sharma
  const [t2Id, setT2Id] = useState('teacher-2'); // Amit Kumar
  const [t3Id, setT3Id] = useState('teacher-3'); // Neha Singh

  const t1 = teachers.find((t) => t.id === t1Id) || teachers[0];
  const t2 = teachers.find((t) => t.id === t2Id) || teachers[1];
  const t3 = teachers.find((t) => t.id === t3Id) || teachers[2];

  const comparedList = [t1, t2, t3];

  // Dynamic Comparison Conclusions Engine
  const summaryNotes = useMemo(() => {
    const notes: string[] = [];

    // Highest Student Improvement
    const bestImprovement = [...comparedList].sort(
      (a, b) => b.performanceBreakdown.studentImprovement - a.performanceBreakdown.studentImprovement
    )[0];
    notes.push(`${bestImprovement.name} leads in student improvement (+${bestImprovement.performanceBreakdown.studentImprovement.toFixed(1)}%).`);

    // Highest Cohort Attendance
    const bestAttendance = [...comparedList].sort((a, b) => b.avgAttendance - a.avgAttendance)[0];
    notes.push(`${bestAttendance.name} has stronger cohort attendance outcomes (${bestAttendance.avgAttendance}%).`);

    // Highest Parent Feedback
    const bestParentFeedback = [...comparedList].sort(
      (a, b) => b.performanceBreakdown.parentFeedback - a.performanceBreakdown.parentFeedback
    )[0];
    notes.push(`${bestParentFeedback.name} demonstrates stronger parent feedback engagement (${bestParentFeedback.performanceBreakdown.parentFeedback}/100).`);

    return notes;
  }, [comparedList]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Teacher Comparison Matrix</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side analytical benchmarking across up to 3 educators
            </p>
          </div>
        </div>

        {/* Teacher Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-500">Educator #1</span>
            <select
              value={t1Id}
              onChange={(e) => setT1Id(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-500">Educator #2</span>
            <select
              value={t2Id}
              onChange={(e) => setT2Id(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-500">Educator #3</span>
            <select
              value={t3Id}
              onChange={(e) => setT3Id(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Comparison Summary Section */}
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Comparison Summary & Relative Strengths
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {summaryNotes.map((note, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-indigo-100 flex items-start gap-2 text-indigo-950 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparedList.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.subject} • Classes: {t.assignedClasses.join(', ')}</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  Rank #{teachers.findIndex((item) => item.id === t.id) + 1}
                </span>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-lg text-center">
                <div className="text-[10px] text-slate-400 font-medium">Performance Index</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-0.5">{t.performanceBreakdown.score}</div>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Student Improvement (35%)</span>
                  <span className="font-semibold text-emerald-600">+{t.performanceBreakdown.studentImprovement.toFixed(1)}%</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Avg Student Score (25%)</span>
                  <span className="font-semibold text-blue-600">{t.avgStudentPerformance}%</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Cohort Attendance (15%)</span>
                  <span className="font-semibold text-purple-600">{t.avgAttendance}%</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Work Completion (10%)</span>
                  <span className="font-semibold text-slate-900">{t.performanceBreakdown.homeworkBookCompletion}%</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-500">Parent Feedback (5%)</span>
                  <span className="font-semibold text-amber-600">{t.performanceBreakdown.parentFeedback}</span>
                </div>
              </div>

              <Link
                href={`/teachers/${t.id}`}
                className="block text-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                View Full Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
