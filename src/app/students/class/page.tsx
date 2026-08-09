'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { getClassHealthComparison, getClassStudentDistribution } from '@/lib/aggregations';
import { Layers, GraduationCap, CalendarCheck, CheckSquare, TrendingUp, Users, ArrowRight, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function ClassIntelligencePage() {
  const students = useMemo(() => store.getStudents(), []);
  const teachers = useMemo(() => store.getTeachers(), []);

  const classHealth = useMemo(() => getClassHealthComparison(students, teachers), [students, teachers]);
  const [selectedClass, setSelectedClass] = useState('8-A');

  const activeClassData = useMemo(
    () => classHealth.find((c) => c.className === selectedClass || c.className === `Class ${selectedClass}`) || classHealth[0],
    [classHealth, selectedClass]
  );

  const studentDist = useMemo(
    () => getClassStudentDistribution(students, activeClassData.className),
    [students, activeClassData]
  );

  // Multi-Class Comparison selection
  const [compareClasses, setCompareClasses] = useState<string[]>(['8-A', '8-B', '9-A']);

  const toggleCompare = (className: string) => {
    if (compareClasses.includes(className)) {
      if (compareClasses.length > 1) setCompareClasses(compareClasses.filter((c) => c !== className));
    } else {
      if (compareClasses.length < 4) setCompareClasses([...compareClasses, className]);
    }
  };

  const comparisonData = useMemo(
    () => classHealth.filter((c) => compareClasses.includes(c.className)),
    [classHealth, compareClasses]
  );

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Class Intelligence & Cohort Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Class health, multi-section comparison, student score distribution & teacher outcome chain
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">Active Focus Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-none"
            >
              {classHealth.map((c) => (
                <option key={c.className} value={c.className}>
                  Class {c.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Focus Class Header & Class -> Teacher -> Student Chain */}
        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/30">
                  Class Cohort Profile
                </span>
                <span className="text-xs text-slate-400 font-medium">{studentDist.totalCount} Students Enrolled</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">Class {activeClassData.className}</h2>
            </div>

            {/* Class -> Teacher Chain Card */}
            <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl flex items-center gap-4 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Assigned Faculty Educator</div>
                <div className="font-bold text-white text-sm mt-0.5">{activeClassData.teacherName}</div>
                <div className="text-[11px] text-purple-400 font-semibold">
                  Teacher Index {activeClassData.teacherIndex} • Growth +{activeClassData.cohortGrowth}%
                </div>
              </div>
              {activeClassData.teacherId && (
                <Link
                  href={`/teachers/${activeClassData.teacherId}?from=class-${activeClassData.className}`}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shrink-0 transition-colors"
                >
                  View Teacher →
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 font-medium">Avg Performance</div>
              <div className="text-xl font-extrabold text-blue-400 mt-1">{activeClassData.avgPerformance}%</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 font-medium">Avg Attendance</div>
              <div className="text-xl font-extrabold text-purple-400 mt-1">{activeClassData.avgAttendance}%</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 font-medium">Avg Homework</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">{activeClassData.avgHomework}%</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 font-medium">At-Risk Count</div>
              <div className="text-xl font-extrabold text-amber-400 mt-1">{activeClassData.riskCount}</div>
            </div>
          </div>
        </div>

        {/* Student Distribution Tier Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Class {activeClassData.className} Performance Tiers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] text-emerald-800 font-bold uppercase">Excellent (&ge;85)</div>
                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">{studentDist.excellent}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-[10px] text-blue-800 font-bold uppercase">Strong (75-84)</div>
                <div className="text-xl font-extrabold text-blue-950 mt-0.5">{studentDist.strong}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-[10px] text-amber-800 font-bold uppercase">Average (65-74)</div>
                <div className="text-xl font-extrabold text-amber-950 mt-0.5">{studentDist.average}</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <div className="text-[10px] text-rose-800 font-bold uppercase">Needs Attention (&lt;65)</div>
                <div className="text-xl font-extrabold text-rose-950 mt-0.5">{studentDist.needsAttention}</div>
              </div>
            </div>

            {/* Top Students in Class */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">Top Performing Scholars in Class {activeClassData.className}</div>
              <div className="space-y-1.5">
                {studentDist.topStudents.map((s, idx) => (
                  <Link
                    key={s.id}
                    href={`/students/${s.id}?from=class-${activeClassData.className}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">{s.performanceBreakdown.score} Score</span>
                      <span className="text-[10px] text-slate-400 ml-2">{s.discipline.attendancePercentage}% Att</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* At-Risk Students in Class */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">At-Risk Students in Class {activeClassData.className}</h2>
            {studentDist.atRiskStudents.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium">
                No students currently flagged for academic risk in Class {activeClassData.className}.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {studentDist.atRiskStudents.map((s) => (
                  <div key={s.id} className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <Link href={`/students/${s.id}?from=class-${activeClassData.className}`} className="hover:text-rose-700">
                        {s.name}
                      </Link>
                      <span className="text-rose-700 font-extrabold">{s.riskLevel} Risk</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Score: {s.performanceBreakdown.score} • Att: {s.discipline.attendancePercentage}% • HW: {s.discipline.homeworkCompletionPercentage}%
                    </div>
                    <div className="text-right pt-1">
                      <Link
                        href={`/students/${s.id}?from=class-${activeClassData.className}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Inspect Student 360 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Class Section Comparison Tool */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Class Synchronized Comparison Tool</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select up to 4 class sections to compare performance metrics side-by-side</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {classHealth.slice(0, 8).map((c) => (
                <button
                  key={c.className}
                  onClick={() => toggleCompare(c.className)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                    compareClasses.includes(c.className)
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Class {c.className}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Assigned Teacher</th>
                  <th className="py-2.5 px-3 text-center">Students</th>
                  <th className="py-2.5 px-3 text-center">Avg Performance</th>
                  <th className="py-2.5 px-3 text-center">Avg Attendance</th>
                  <th className="py-2.5 px-3 text-center">Avg Homework</th>
                  <th className="py-2.5 px-3 text-center">At Risk</th>
                  <th className="py-2.5 px-3 text-center">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((c) => (
                  <tr key={c.className} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">Class {c.className}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{c.teacherName}</td>
                    <td className="py-3 px-3 text-center text-slate-500">{c.studentCount}</td>
                    <td className="py-3 px-3 text-center font-extrabold text-blue-600">{c.avgPerformance}%</td>
                    <td className="py-3 px-3 text-center font-bold text-purple-600">{c.avgAttendance}%</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">{c.avgHomework}%</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700">{c.riskCount}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">+{c.cohortGrowth}%</td>
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
