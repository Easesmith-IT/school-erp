'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Award, ArrowLeft, Users, TrendingUp, CheckCircle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { parseEntityContext } from '@/lib/context-nav';
import { getTeacherPerformanceBreakdown, getTeacherCohortBreakdown } from '@/lib/aggregations';

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from') || null;
  const navContext = parseEntityContext(fromParam);

  const id = (params?.id as string) || 'teacher-1';

  const teacher = store.getTeacherById(id) || store.getTeacherById('teacher-1')!;
  const students = store.getStudents();

  const perfBreakdown = useMemo(() => getTeacherPerformanceBreakdown(teacher), [teacher]);
  const cohortBreakdown = useMemo(() => getTeacherCohortBreakdown(teacher, students), [teacher, students]);
  const cohortGrowth = cohortBreakdown.cohortGrowth;
  const cohortGrowthSign = cohortGrowth >= 0 ? '+' : '';

  const allTeachers = store.getTeachers();
  const sortedTeachers = useMemo(() => [...allTeachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score), [allTeachers]);
  const teacherRank = sortedTeachers.findIndex((t) => t.id === teacher.id) + 1;

  const assignedStudents = store.getStudents().filter((s) => teacher.assignedClasses.includes(s.className));
  const atRiskAssigned = assignedStudents.filter((s) => s.riskLevel !== 'Low');

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Context Origin Banner */}
        {navContext && (
          <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>You came from: <strong>{navContext.name}</strong></span>
            </div>
            <Link href={navContext.backRoute} className="font-semibold text-indigo-700 hover:underline">
              Return to {navContext.name} →
            </Link>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push('/teachers')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Teacher Directory
        </button>

        {/* Teacher Hero Header */}
        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-purple-500/20">
              {teacher.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{teacher.name}</h1>
                <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 font-bold text-xs rounded-full">
                  Rank #{teacherRank} Educator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {teacher.subject} • Assigned Classes: <strong className="text-white">{teacher.assignedClasses.join(', ')}</strong>
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-right">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Teacher Performance Index</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-0.5">{teacher.performanceBreakdown.score}</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{cohortGrowthSign}{cohortGrowth}% Cohort Growth (School Benchmark)</div>
          </div>
        </div>

        {/* Teacher Analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Why is {teacher.name} Rank #{teacherRank}? (Weighted Model Breakdown)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Student Improvement (35%)</div>
              <div className="text-xl font-black text-blue-950 mt-1">+{teacher.performanceBreakdown.studentImprovement} pts</div>
              <div className="text-[10px] text-blue-800 mt-0.5">Contrib: {perfBreakdown.weights.studentImprovement.weightedVal} pts</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Academics (25%)</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{teacher.performanceBreakdown.academicPerformance}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Contrib: {perfBreakdown.weights.academicPerformance.weightedVal} pts</div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <div className="text-[10px] font-bold text-purple-700 uppercase">Attendance (15%)</div>
              <div className="text-xl font-extrabold text-purple-950 mt-1">{teacher.performanceBreakdown.attendance}%</div>
              <div className="text-[10px] text-purple-800 mt-0.5">Contrib: {perfBreakdown.weights.attendance.weightedVal} pts</div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Work Completion (10%)</div>
              <div className="text-xl font-extrabold text-emerald-950 mt-1">{teacher.performanceBreakdown.homeworkBookCompletion}%</div>
              <div className="text-[10px] text-emerald-800 mt-0.5">Contrib: {perfBreakdown.weights.homeworkBookCompletion.weightedVal} pts</div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
              <div className="text-[10px] font-bold text-indigo-700 uppercase">Engagement (10%)</div>
              <div className="text-xl font-extrabold text-indigo-950 mt-1">{teacher.performanceBreakdown.engagement}%</div>
              <div className="text-[10px] text-indigo-800 mt-0.5">Contrib: {perfBreakdown.weights.engagement.weightedVal} pts</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <div className="text-[10px] font-bold text-amber-800 uppercase">Parent Feedback (5%)</div>
              <div className="text-xl font-extrabold text-amber-950 mt-1">{teacher.performanceBreakdown.parentFeedback}%</div>
              <div className="text-[10px] text-amber-900 mt-0.5">Contrib: {perfBreakdown.weights.parentFeedback.weightedVal} pts</div>
            </div>
          </div>
        </div>

        {/* Cohort Performance Tiers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Cohort Score Distribution ({cohortBreakdown.totalStudents} Students)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[10px] text-emerald-800 uppercase font-bold">Excellent (&ge;85)</div>
              <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{cohortBreakdown.excellent}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-[10px] text-blue-800 uppercase font-bold">Strong (75-84)</div>
              <div className="text-xl font-extrabold text-blue-950 mt-0.5">{cohortBreakdown.strong}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-[10px] text-amber-800 uppercase font-bold">Average (65-74)</div>
              <div className="text-xl font-extrabold text-amber-950 mt-0.5">{cohortBreakdown.average}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-[10px] text-rose-800 uppercase font-bold">Needs Attention (&lt;65)</div>
              <div className="text-xl font-extrabold text-rose-950 mt-0.5">{cohortBreakdown.needsAttention}</div>
            </div>
          </div>
        </div>

        {/* Assigned Student Cohort Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Assigned Student Cohort ({assignedStudents.length})</h2>
            <span className="text-xs text-amber-700 font-semibold">{atRiskAssigned.length} At-Risk Students</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Performance</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Homework</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedStudents.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{s.className}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{s.performanceBreakdown.score}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.discipline.attendancePercentage}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.discipline.homeworkCompletionPercentage}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : s.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {s.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href={`/students/${s.id}?from=teacher-${teacher.id}`} className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                        <span>Inspect 360</span>
                        <ArrowRight className="w-3 h-3" />
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
