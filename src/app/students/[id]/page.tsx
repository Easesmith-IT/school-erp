'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  CalendarCheck,
  CheckSquare,
  Trophy,
  ArrowLeft,
  UserCheck,
  CreditCard,
  BookOpen,
  FileText,
  Clock,
  Send,
  AlertCircle,
  Users,
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { parseEntityContext } from '@/lib/context-nav';
import {
  getStudentPerformanceTrend,
  getStudentAttendanceAnalysis,
  getStudentHomeworkAnalysis,
} from '@/lib/aggregations';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function Student360Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from') || null;
  const navContext = parseEntityContext(fromParam);

  const id = (params?.id as string) || 'student-aarav';

  const student = store.getStudentById(id) || store.getStudentById('student-aarav')!;
  const parent = store.getParentById(student.parentId);
  const teacher = store.getTeacherById(student.teacherId);
  const invoices = store.getInvoices().filter((inv) => inv.studentId === student.id);

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Academic' | 'Assessments' | 'Attendance' | 'Homework' | 'Activities' | 'Behaviour' | 'Parent' | 'Fees' | 'Timeline'
  >('Overview');

  const perf = student.performanceBreakdown;

  // Derived analysis
  const perfTrend = getStudentPerformanceTrend(student);
  const attAnalysis = getStudentAttendanceAnalysis(student);
  const hwAnalysis = getStudentHomeworkAnalysis(student);

  const subjectChartData = [
    { name: 'English', score: student.academics.english },
    { name: 'Hindi', score: student.academics.hindi },
    { name: 'Mathematics', score: student.academics.mathematics },
    { name: 'Science', score: student.academics.science },
    { name: 'Social Study', score: student.academics.socialStudies },
    { name: 'GK', score: student.academics.gk },
  ];

  const trendChartData = [
    { name: 'PA-I', score: student.assessmentTrend.pa1 },
    { name: 'PA-II', score: student.assessmentTrend.pa2 },
    { name: 'SA-I', score: student.assessmentTrend.sa1 },
    { name: 'Current', score: student.assessmentTrend.current },
  ];

  const tabs = [
    'Overview', 'Academic', 'Assessments', 'Attendance', 'Homework',
    'Activities', 'Behaviour', 'Parent', 'Fees', 'Timeline',
  ] as const;

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

        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/students')}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Directory
          </button>
          <div className="flex items-center gap-2">
            {parent && (
              <Link
                href={`/parents/${parent.id}?from=student-${student.id}`}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                View Parent Profile ({parent.name})
              </Link>
            )}
            {teacher && (
              <Link
                href={`/teachers/${teacher.id}?from=student-${student.id}`}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                View Teacher ({teacher.name})
              </Link>
            )}
          </div>
        </div>

        {/* Student Header Hero Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  student.riskLevel === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : student.riskLevel === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {student.riskLevel} Risk
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span>Class <strong className="text-slate-800">{student.className}</strong></span>
                <span>•</span>
                <span>Admission No: <strong className="text-slate-800">#{student.admissionNo}</strong></span>
                <span>•</span>
                <span>Teacher: <strong className="text-slate-800">{teacher?.name || 'Priya Sharma'}</strong></span>
                <span>•</span>
                <span>Parent: <strong className="text-slate-800">{parent?.name || 'Raj Sharma'}</strong></span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl text-right max-w-xs">
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Financial Context</div>
            <div className="text-xs text-slate-600 mt-0.5">
              Student Outstanding: <strong className="text-slate-900 font-bold">{formatCurrency(student.studentOutstandingFee)}</strong>
            </div>
            {parent && (
              <div className="text-[11px] text-amber-900 mt-0.5 font-medium">
                Family Total Outstanding: <strong>{formatCurrency(parent.familyTotalOutstanding)}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold text-slate-600">Student Performance Score</span>
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600">{perf.score} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center justify-between">
              <span>Overall Improvement:</span>
              <span className="font-bold text-emerald-700">+{perfTrend.overallImprovement} pts</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold text-slate-600">Attendance Rate</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{student.discipline.attendancePercentage}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Streak: {attAnalysis.currentStreak} days</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold text-slate-600">Homework Completion</span>
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{student.discipline.homeworkCompletionPercentage}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Book Completion: {student.discipline.bookCompletionPercentage}%</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold text-slate-600">Parent Reliability</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{parent?.paymentReliabilityScore || 86} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            <div className="text-[11px] text-slate-500 mt-1">On-Time Rate: {parent?.paymentReliabilityBreakdown.onTimeRate}%</div>
          </div>
        </div>

        {/* 10 Profile Tabs Bar */}
        <div className="border-b border-slate-200 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">What is driving this performance score ({perf.score})?</h2>
                <p className="text-xs text-slate-500">Calculated weighting model breakdown across 4 primary dimensions</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Academic Performance (55% weight)</span>
                    <span className="text-blue-600">{perf.academicScore} / 100</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${perf.academicScore}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Discipline & Attendance (25% weight)</span>
                    <span className="text-emerald-600">{perf.disciplineScore} / 100</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${perf.disciplineScore}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Student Co-Curricular Engagement (10% weight)</span>
                    <span className="text-indigo-600">{perf.engagementScore} / 100</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${perf.engagementScore}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Parent Engagement & PTM (10% weight)</span>
                    <span className="text-amber-600">{perf.parentEngagementScore} / 100</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: `${perf.parentEngagementScore}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Explanation Panel */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Why is this student {student.riskLevel} Risk?</h2>
              <div className={`p-4 rounded-xl border space-y-3 ${
                student.riskLevel === 'High'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : student.riskLevel === 'Medium'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="text-xs font-extrabold uppercase tracking-wider">
                  Risk Level: {student.riskLevel}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-1">
                    <span>Attendance Rate:</span>
                    <strong className={student.discipline.attendancePercentage < 75 ? 'text-rose-700 font-bold' : ''}>
                      {student.discipline.attendancePercentage}% {student.discipline.attendancePercentage < 75 ? '✓ (Below 75%)' : ''}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-1">
                    <span>Homework Completion:</span>
                    <strong className={student.discipline.homeworkCompletionPercentage < 60 ? 'text-rose-700 font-bold' : ''}>
                      {student.discipline.homeworkCompletionPercentage}% {student.discipline.homeworkCompletionPercentage < 60 ? '✓ (Below 60%)' : ''}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Performance Score:</span>
                    <strong>{student.performanceBreakdown.score} / 100</strong>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-white/80 rounded-lg text-xs border border-rose-200/80">
                  <strong className="text-slate-900 block mb-0.5">Recommended Management Action:</strong>
                  <span>
                    {student.riskLevel === 'High'
                      ? 'Schedule Academic Coordinator & Parent Meeting with Raj Sharma.'
                      : 'Conduct teacher check-in and homework verification.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Academic */}
        {activeTab === 'Academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Subject Performance Marks</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Trends */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-2">Subject Directional Indicators</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {perfTrend.subjectTrends.map((st) => (
                    <div key={st.subject} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-700">{st.subject}</span>
                      <span className="font-bold text-blue-600">{st.score} {st.trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Assessment Growth Line</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                Overall Assessment Growth: +{perfTrend.overallImprovement} points from PA-I to Current Term.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Assessments */}
        {activeTab === 'Assessments' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Term Assessment Progression</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">PA-I</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{student.assessmentTrend.pa1}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">PA-II</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{student.assessmentTrend.pa2}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">SA-I</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{student.assessmentTrend.sa1}%</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700 font-semibold">Current Evaluation</div>
                <div className="text-lg font-bold text-blue-900 mt-1">{student.assessmentTrend.current}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Attendance */}
        {activeTab === 'Attendance' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Monthly Attendance Intelligence</h2>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Overall: {student.discipline.attendancePercentage}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {student.monthlyAttendance.map((m) => (
                <div key={m.month} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs font-semibold text-slate-500">{m.month}</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{m.percentage}%</div>
                  <div className="text-[10px] text-slate-400">{m.presentDays} / {m.workingDays} days</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-center pt-2">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-[10px] text-emerald-800 uppercase font-bold">Best Month</div>
                <div className="font-extrabold text-emerald-950 text-sm mt-0.5">{attAnalysis.bestMonth.month} ({attAnalysis.bestMonth.percentage}%)</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[10px] text-amber-800 uppercase font-bold">Worst Month</div>
                <div className="font-extrabold text-amber-950 text-sm mt-0.5">{attAnalysis.worstMonth.month} ({attAnalysis.worstMonth.percentage}%)</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-[10px] text-blue-800 uppercase font-bold">Absence Pattern</div>
                <div className="font-extrabold text-blue-950 text-sm mt-0.5">{attAnalysis.absencePattern}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Homework */}
        {activeTab === 'Homework' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Homework & Book Completion Analysis</h2>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  HW: {student.discipline.homeworkCompletionPercentage}%
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  Book: {student.discipline.bookCompletionPercentage}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Most Consistent Subject</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{hwAnalysis.mostConsistentSubject}</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Most Incomplete Subject</span>
                <div className="font-bold text-rose-950 text-sm mt-0.5">{hwAnalysis.mostIncompleteSubject}</div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {student.recentHomework.map((hw) => (
                <div key={hw.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{hw.title}</div>
                    <div className="text-slate-500">{hw.subject} • Due {hw.dueDate}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    hw.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {hw.status} {hw.score ? `(${hw.score} pts)` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Activities */}
        {activeTab === 'Activities' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Activities & Competition Achievements</h2>
            <div className="space-y-3">
              {student.activities.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{act.title}</div>
                    <div className="text-slate-500">{act.category} • {act.level} Level • {act.date}</div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                    {act.achievement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Behaviour */}
        {activeTab === 'Behaviour' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Classroom Discipline & Behavior Score</h2>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Discipline Rating</span>
                <span className="text-emerald-600">92 / 100</span>
              </div>
              <p className="text-slate-600">
                Punctual, attentive, respectful to staff, maintains complete class notebooks and active participation in classroom discussions.
              </p>
            </div>
          </div>
        )}

        {/* Tab 8: Parent */}
        {activeTab === 'Parent' && parent && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{parent.name}</h2>
                <p className="text-xs text-slate-500">{parent.phone} • {parent.email}</p>
              </div>
              <Link
                href={`/parents/${parent.id}?from=student-${student.id}`}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md shadow-xs hover:bg-blue-500"
              >
                View Full Parent Profile
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500">Payment Reliability</div>
                <div className="text-lg font-bold text-blue-600 mt-1">{parent.paymentReliabilityScore}/100</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500">On-Time Rate</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">{parent.paymentReliabilityBreakdown.onTimeRate}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500">Family Outstanding</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(parent.familyTotalOutstanding)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Fees */}
        {activeTab === 'Fees' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Student Fee Invoices</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{inv.invoiceNo} — {inv.feeType}</div>
                    <div className="text-slate-500">Due {inv.dueDate} • Due: {formatCurrency(inv.amountDue)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-900">Outstanding: {formatCurrency(inv.outstandingBalance)}</div>
                    <span className="text-[10px] text-amber-700 font-semibold">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 10: Timeline */}
        {activeTab === 'Timeline' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Student History Timeline</h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">2026-08-08 — Homework Submitted</div>
                  <div className="text-slate-500">Quadratic Equations Ex 4.2 completed with 95 pts score.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">2026-07-15 — Math Olympiad Achievement</div>
                  <div className="text-slate-500">Secured 1st Runner Up at State Level Math Olympiad.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
