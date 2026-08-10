'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  AlertCircle,
  TrendingUp,
  Award,
  Send,
  ArrowUpRight,
  ShieldAlert,
  PieChart,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Layers,
  Activity,
  Check,
  Zap,
  BarChart3,
  CreditCard,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { store } from '@/lib/store';
import { NiwaService } from '@/services/niwa.service';
import { AppShell } from '@/components/layout/AppShell';
import {
  getSchoolAttendanceSummary,
  getClassPerformanceSummary,
  getSchoolAcademicTrendSummary,
  getCollectionVelocity,
  getTeacherCohortBreakdown,
} from '@/lib/aggregations';
import {
  getSchoolHealthOverview,
  getManagementInsights,
  getPrincipalMorningBrief,
  getExecutivePriorityQueue,
} from '@/lib/insights';
import { formatLakhs, formatCrores } from '@/lib/formatters';
import { useAuth } from '@/lib/auth-context';
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

import { IntelligenceDrawer } from '@/components/intelligence/IntelligenceDrawer';
import { Student } from '@/types/schema';

export default function PrincipalDashboardPage() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [sendingState, setSendingState] = useState<Record<string, boolean>>({});
  const [sendingSuccess, setSendingSuccess] = useState<Record<string, string>>({});
  const [commLogs, setCommLogs] = useState(() => store.getCommunications());

  // Intelligence Drawer State
  const [selectedDrawerStudent, setSelectedDrawerStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const handleOpenStudentDrawer = (studentId: string = 'student-riya') => {
    const s = store.getStudentById(studentId) || store.getStudentById('student-riya') || null;
    setSelectedDrawerStudent(s);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Canonical Data Selectors & Aggregations
  const metrics = store.getMetrics();
  const students = useMemo(() => store.getStudents(), []);
  const teachers = useMemo(() => store.getTeachers(), []);
  const sortedTeachers = useMemo(() => [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score), [teachers]);
  const topTeacher = sortedTeachers[0];
  const parents = useMemo(() => store.getParents(), []);
  const feeInvoices = useMemo(() => store.getInvoices(), []);
  const payments = useMemo(() => store.getPayments(), []);

  // Intelligence Layer & Selectors
  const healthOverview = useMemo(
    () => getSchoolHealthOverview(students, teachers, metrics),
    [students, teachers, metrics]
  );
  const managementInsights = useMemo(
    () => getManagementInsights(students, teachers, parents, feeInvoices, payments, metrics),
    [students, teachers, parents, feeInvoices, payments, metrics]
  );
  const morningBrief = useMemo(
    () => getPrincipalMorningBrief(students, teachers, parents, feeInvoices, metrics),
    [students, teachers, parents, feeInvoices, metrics]
  );
  const priorityQueue = useMemo(
    () => getExecutivePriorityQueue(students, teachers, parents, feeInvoices, metrics),
    [students, teachers, parents, feeInvoices, metrics]
  );

  // Attendance Summary & Class Performance
  const attendanceSummary = useMemo(() => getSchoolAttendanceSummary(students), [students]);
  const classSummary = useMemo(() => getClassPerformanceSummary(students), [students]);

  // Derived Risk & Priority Queues
  const atRiskStudents = useMemo(() => {
    return students
      .filter((s) => s.riskLevel !== 'Low')
      .sort((a, b) => {
        if (a.riskLevel === 'High' && b.riskLevel !== 'High') return -1;
        if (a.riskLevel !== 'High' && b.riskLevel === 'High') return 1;
        return a.performanceBreakdown.score - b.performanceBreakdown.score;
      });
  }, [students]);

  const topStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score)
      .slice(0, 5);
  }, [students]);

  const topTeachers = useMemo(() => {
    return [...teachers]
      .sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score)
      .slice(0, 5);
  }, [teachers]);

  const highPriorityParents = useMemo(() => {
    return parents
      .filter((p) => p.familyTotalOutstanding > 0)
      .sort((a, b) => b.familyTotalOutstanding - a.familyTotalOutstanding);
  }, [parents]);

  const parentReliabilityCounts = useMemo(() => {
    const high = parents.filter((p) => p.paymentReliabilityScore >= 80).length;
    const med = parents.filter((p) => p.paymentReliabilityScore >= 65 && p.paymentReliabilityScore < 80).length;
    const low = parents.filter((p) => p.paymentReliabilityScore < 65).length;
    return { high, med, low };
  }, [parents]);

  const academicTrendData = useMemo(
    () => getSchoolAcademicTrendSummary(students),
    [students]
  );

  const collectionVelocity = useMemo(
    () => getCollectionVelocity(payments, feeInvoices),
    [payments, feeInvoices]
  );

  const financialCollectionData = useMemo(() => {
    if (collectionVelocity.monthlyBreakdown.length > 0) {
      return collectionVelocity.monthlyBreakdown.map((m) => ({
        month: m.month,
        collected: Number((m.collected / 100000).toFixed(1)),
      }));
    }
    return [
      { month: 'Apr', collected: 42.5 },
      { month: 'May', collected: 41.0 },
      { month: 'Jun', collected: 39.5 },
      { month: 'Jul', collected: 19.0 },
    ];
  }, [collectionVelocity]);

  // NIWA Handler
  const handleSendReminder = async (parentId: string, studentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setSendingState((prev) => ({ ...prev, [parentId]: true }));
    try {
      const response = await NiwaService.sendOverdueReminder(parentId, studentId);
      if (response.success) {
        setSendingSuccess((prev) => ({ ...prev, [parentId]: '✓ Reminder Sent' }));
        setCommLogs(store.getCommunications());
      }
    } catch (err) {
      setSendingSuccess((prev) => ({ ...prev, [parentId]: 'Failed' }));
    } finally {
      setSendingState((prev) => ({ ...prev, [parentId]: false }));
      setTimeout(() => {
        setSendingSuccess((prev) => {
          const copy = { ...prev };
          delete copy[parentId];
          return copy;
        });
      }, 4000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1440px] mx-auto pb-16">
        {/* ========================================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold tracking-wider uppercase">
                Executive Command Center 2.0
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ● School data synchronized
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Good morning, {user?.name || 'Dr. Vikram Malhotra'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Principal Morning Brief & Executive Intelligence • Sunday, 9 August 2026
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">System Status</div>
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last updated: Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. SCHOOL PULSE (COMPACT HORIZONTAL EXECUTIVE SUMMARY) */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">School Pulse</span>
            <span className="text-[11px] text-slate-400">| Synchronized</span>
          </div>

          <div className="flex items-center gap-6 text-xs flex-wrap">
            <div>
              <span className="text-slate-400 font-medium block text-[10px]">Students</span>
              <strong className="text-slate-900 text-sm font-black">{metrics.totalStudents.toLocaleString('en-IN')}</strong>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <span className="text-rose-600 font-bold block text-[10px]">Need Attention</span>
              <strong className="text-rose-950 text-sm font-black">{metrics.studentsAtRiskCount} Scholars</strong>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <span className="text-slate-400 font-medium block text-[10px]">Attendance Rate</span>
              <strong className="text-slate-900 text-sm font-black">{metrics.avgAttendance}%</strong>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <span className="text-slate-400 font-medium block text-[10px]">Academic Performance</span>
              <strong className="text-slate-900 text-sm font-black">{metrics.avgPerformance}%</strong>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <span className="text-slate-400 font-medium block text-[10px]">Fee Collection Rate</span>
              <strong className="text-emerald-700 text-sm font-black">{metrics.collectionRate}%</strong>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TODAY AT A GLANCE (EXECUTIVE NARRATIVE) */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white p-5 md:p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Today at a Glance</h2>
                <p className="text-xs text-slate-400">Executive Briefing & High-Priority Management Context</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-amber-400 text-xs font-bold rounded-lg border border-slate-700">
              Management Briefing
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center text-xs">
            <div className="lg:col-span-2 space-y-2">
              <p className="text-slate-200 text-sm leading-relaxed">
                School performance is broadly stable with <strong>{metrics.collectionRate}%</strong> fee collection and <strong>{metrics.avgAttendance}%</strong> attendance. However, <strong>{metrics.studentsAtRiskCount} students</strong> require active management intervention.
              </p>
              <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-slate-300 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Highest-Priority Intervention Case</span>
                  <span className="font-bold text-white text-sm">Riya Sharma (Class 8-A)</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Attendance 68% (critical) • Homework 54% • Performance 72.0 • Family Outstanding ₹18,500 (Raj Sharma)
                  </span>
                </div>
                <button
                  onClick={() => handleOpenStudentDrawer('student-riya')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs shrink-0 transition-colors shadow-xs"
                >
                  Review Case →
                </button>
              </div>
            </div>

            {/* What Would You Do Interactive Decision Card */}
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2.5">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Management Action Needed</span>
              </div>
              <p className="text-xs text-white font-semibold">
                What should happen next for Riya Sharma?
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleOpenStudentDrawer('student-riya')}
                  className="w-full text-left px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-between"
                >
                  <span>1. Contact Parent</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  href="/teachers/teacher-1"
                  className="block px-3 py-2 bg-slate-900 hover:bg-slate-950 text-slate-300 rounded-lg font-semibold text-xs transition-colors"
                >
                  2. Review Educator Performance
                </Link>
                <Link
                  href="/students/class"
                  className="block px-3 py-2 bg-slate-900 hover:bg-slate-950 text-slate-300 rounded-lg font-semibold text-xs transition-colors"
                >
                  3. Inspect Class Cohort
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. THREE THINGS NEED YOUR ATTENTION (EXECUTIVE PRIORITY BLOCKS) */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>3 Things Need Your Attention</span>
            </h2>
            <span className="text-xs text-slate-500">Executive Priority Queue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PRIORITY 1 — STUDENT ATTENTION */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Priority 1 • Student Attention</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full border border-rose-200">
                    HIGH RISK
                  </span>
                </div>

                <div>
                  <div className="text-lg font-black text-slate-900">Riya Sharma</div>
                  <div className="text-xs text-slate-500">Class 8-A • Admission #1088</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Perf Score</div>
                    <div className="text-sm font-black text-slate-900">72.0</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-700 font-bold">Attendance</div>
                    <div className="text-sm font-black text-rose-950">68%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-700 font-bold">Homework</div>
                    <div className="text-sm font-black text-rose-950">54%</div>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <strong>Why Flagged:</strong> Severe attendance gap combined with 54% homework completion.
                </div>
              </div>

              {completedActions['student-riya'] ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ Action Completed (Parent Contacted)</span>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenStudentDrawer('student-riya')}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>REVIEW CASE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* PRIORITY 2 — FEE RECOVERY */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Priority 2 • Fee Recovery</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-200">
                    AGING EXPOSURE
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">90+ Day Exposure</div>
                  <div className="text-2xl font-black text-red-600 mt-0.5">₹{formatLakhs(metrics.agingBuckets.days90Plus)} L</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 font-medium">
                  High recovery risk exposure across past-due family balances including Raj Sharma (₹18,500).
                </div>
              </div>

              <Link
                href="/communications/recovery"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <span>REVIEW RECOVERY WORKFLOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* PRIORITY 3 — TEACHING EFFECTIVENESS */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Priority 3 • Teaching Effectiveness</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-bold rounded-full border border-purple-200">
                    #1 EDUCATOR
                  </span>
                </div>

                <div>
                  <div className="text-lg font-black text-slate-900">{topTeacher ? topTeacher.name : 'Top Educator'}</div>
                  <div className="text-xs text-slate-500">{topTeacher ? `${topTeacher.subject} • Class ${topTeacher.assignedClasses.join(' & ')}` : ''}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                  <div>
                    <div className="text-[10px] text-purple-700 font-medium">Teacher Index</div>
                    <div className="text-sm font-black text-purple-950">{topTeacher ? topTeacher.performanceBreakdown.score : 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 font-medium">Cohort Growth</div>
                    <div className="text-sm font-black text-emerald-700">
                      {topTeacher ? `${getTeacherCohortBreakdown(topTeacher, store.getStudents()).cohortGrowth >= 0 ? '+' : ''}${getTeacherCohortBreakdown(topTeacher, store.getStudents()).cohortGrowth}%` : '0%'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  Top performing educator leading cohort progress across assigned class sections.
                </div>
              </div>

              <Link
                href={`/teachers/${topTeacher ? topTeacher.id : 'teacher-1'}`}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <span>VIEW EDUCATOR PERFORMANCE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MANAGEMENT INSIGHTS SECTION (FACT -> INTERPRETATION -> ACTION) */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Management Insights</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Actionable statements derived from canonical data (FACT → INTERPRETATION → ACTION)
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
              5 Key Insights Derived
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        insight.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : insight.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {insight.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{insight.severity} SEVERITY</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">{insight.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{insight.description}</p>

                  <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] space-y-1">
                    <div className="text-slate-500 font-medium">
                      <strong className="text-slate-700">Why it matters:</strong> {insight.whyItMatters}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    Fact: {insight.factText.slice(0, 30)}...
                  </span>
                  <Link
                    href={insight.actionRoute}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>{insight.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMARY KPI COMMAND BAR */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1: TOTAL STUDENTS */}
          <Link
            href="/students"
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Students
              </span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.totalStudents.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Active across 16 classes</span>
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> ↗ / trend
              </span>
            </div>
          </Link>

          {/* KPI 2: ACADEMIC PERFORMANCE */}
          <Link
            href="/students/performance"
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Academic Performance
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.avgPerformance}%
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">School-wide average</span>
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +4.4 pts Growth
              </span>
            </div>
          </Link>

          {/* KPI 3: ATTENDANCE */}
          <Link
            href="/students/attendance"
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Attendance
              </span>
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.avgAttendance}%
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">School average</span>
              <span className="text-purple-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Healthy
              </span>
            </div>
          </Link>

          {/* KPI 4: FEES COLLECTED */}
          <Link
            href="/finance/dashboard"
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Fees Collected
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-950 tracking-tight">
              {formatCrores(metrics.totalFeeCollected)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Collection Rate</span>
              <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                {metrics.collectionRate}%
              </span>
            </div>
          </Link>

          {/* KPI 5: OUTSTANDING */}
          <Link
            href="/finance/outstanding"
            className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-500 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outstanding
              </span>
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatLakhs(metrics.totalOutstanding)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {formatLakhs(metrics.totalOverdue)} overdue
              </span>
              <span className="text-slate-400 font-medium">Current {formatLakhs(metrics.agingBuckets.currentNotDue)}</span>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* ACADEMIC & ATTENDANCE TRENDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Performance Trend (2/3 Width) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Academic Performance Trend</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    School-wide performance across assessments
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200 shrink-0">
                  +4.4 pts Growth
                </span>
              </div>

              <div className="h-60 w-full pt-2">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={academicTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="term" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis domain={[65, 85]} stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${val}%`, 'Avg Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6, fill: '#1d4ed8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-slate-50 rounded-lg animate-pulse"></div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-600 font-medium">
                Performance has improved <strong className="text-emerald-700">+4.4 pts</strong> since PA-I
              </span>
              <Link href="/students/performance" className="text-blue-600 hover:text-blue-700 font-semibold shrink-0 ml-2">
                Detailed Rankings →
              </Link>
            </div>
          </div>

          {/* Attendance Health (1/3 Width) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-purple-600" />
                  <span>Attendance Health</span>
                </h3>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {metrics.avgAttendance}% School Average
                </span>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl mb-4 text-center">
                <div className="text-3xl font-extrabold text-white tracking-tight">{metrics.avgAttendance}%</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">School Average</div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Healthy (&ge;75%)</span>
                    <span className="font-bold text-slate-900">
                      {attendanceSummary.healthy} Students
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${((attendanceSummary.healthy / (metrics.totalStudents || 1)) * 100).toFixed(0)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-700">At Risk (60-74.9%)</span>
                    <span className="font-bold text-amber-900">{attendanceSummary.atRisk} Students</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${((attendanceSummary.atRisk / (metrics.totalStudents || 1)) * 100).toFixed(0)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-rose-700">Critical (&lt;60%)</span>
                    <span className="font-bold text-rose-900">{attendanceSummary.critical} Students</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{
                        width: `${((attendanceSummary.critical / (metrics.totalStudents || 1)) * 100).toFixed(0)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Students below 75%</div>
                  <div className="font-bold text-amber-900 text-sm mt-0.5">{attendanceSummary.below75}</div>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-[10px] text-rose-700 font-medium">Students below 60%</div>
                  <div className="font-bold text-rose-950 text-sm mt-0.5">{attendanceSummary.below60}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <Link
                href="/students/attendance"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
              >
                <span>View attendance intelligence →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FINANCIAL EXECUTIVE AREA & AGING PANEL */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Financial Intelligence
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                School fee collection stream, outstanding portfolio, and aging risk breakdown
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                {metrics.collectionRate}% Collection Rate
              </span>
              <Link
                href="/finance/dashboard"
                className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Financial Dashboard →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Expected
              </span>
              <div className="text-lg font-extrabold text-slate-900 mt-1">
                {formatCrores(metrics.totalFeeExpected)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Full Academic Term</div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Collected
              </span>
              <div className="text-lg font-extrabold text-emerald-950 mt-1">
                {formatCrores(metrics.totalFeeCollected)}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5">{metrics.collectionRate}% Collection Rate</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Outstanding
              </span>
              <div className="text-lg font-extrabold text-slate-900 mt-1">
                {formatLakhs(metrics.totalOutstanding)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Current + Overdue</div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                Overdue
              </span>
              <div className="text-lg font-extrabold text-rose-950 mt-1">
                {formatLakhs(metrics.totalOverdue)}
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5">Past Invoice Due Dates</div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Collection Rate
              </span>
              <div className="text-lg font-extrabold text-indigo-950 mt-1">
                {metrics.collectionRate}%
              </div>
              <div className="text-[10px] text-indigo-700 mt-0.5">Target &ge; 85%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Collection Trend
                </h3>
                <span className="text-[11px] font-medium text-slate-500">Historical Term Performance</span>
              </div>
              <div className="h-52 w-full">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialCollectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`₹${val} Lakhs`, 'Amount']}
                      />
                      <Bar dataKey="collected" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-slate-50 rounded-lg animate-pulse"></div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Outstanding Portfolio Aging
                </h3>
                <Link href="/finance/aging" className="text-xs font-semibold text-blue-600 hover:underline">
                  View Aging Analysis →
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="text-[10px] text-slate-500 font-semibold">Current</div>
                  <div className="font-extrabold text-slate-900 text-sm my-1">
                    {formatLakhs(metrics.agingBuckets.currentNotDue)}
                  </div>
                  <span className="text-[9px] text-slate-500 bg-slate-200/60 px-1 py-0.5 rounded">Monitor</span>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col justify-between">
                  <div className="text-[10px] text-amber-800 font-semibold">0-30</div>
                  <div className="font-extrabold text-amber-950 text-sm my-1">
                    {formatLakhs(metrics.agingBuckets.days0_30)}
                  </div>
                  <span className="text-[9px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded">Normal</span>
                </div>

                <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 flex flex-col justify-between">
                  <div className="text-[10px] text-amber-900 font-semibold">31-60</div>
                  <div className="font-extrabold text-amber-950 text-sm my-1">
                    {formatLakhs(metrics.agingBuckets.days31_60)}
                  </div>
                  <span className="text-[9px] text-amber-900 bg-amber-200 px-1 py-0.5 rounded">Medium</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex flex-col justify-between">
                  <div className="text-[10px] text-rose-800 font-semibold">61-90</div>
                  <div className="font-extrabold text-rose-950 text-sm my-1">
                    {formatLakhs(metrics.agingBuckets.days61_90)}
                  </div>
                  <span className="text-[9px] text-rose-800 bg-rose-100 px-1 py-0.5 rounded">High</span>
                </div>

                <div className="p-3 bg-rose-900 text-white rounded-xl border border-rose-700 flex flex-col justify-between shadow-xs">
                  <div className="text-[10px] text-rose-200 font-bold uppercase tracking-wider">90+</div>
                  <div className="font-extrabold text-white text-sm my-1">
                    {formatLakhs(metrics.agingBuckets.days90Plus)}
                  </div>
                  <span className="text-[9px] text-rose-200 bg-rose-800 px-1 py-0.5 rounded">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STUDENT RISK & TEACHER INTEL */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Students Requiring Attention</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Priority student intervention queue derived from risk intelligence model
                  </p>
                </div>
                <Link
                  href="/students/risk"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All ({atRiskStudents.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-2">Class</th>
                      <th className="py-2.5 px-2 text-center">Performance</th>
                      <th className="py-2.5 px-2 text-center">Attendance</th>
                      <th className="py-2.5 px-2 text-center">Homework</th>
                      <th className="py-2.5 px-2">Risk</th>
                      <th className="py-2.5 px-3">Primary Reason</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {atRiskStudents.slice(0, 5).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <Link href={`/students/${s.id}`} className="hover:text-blue-600">
                            {s.name}
                          </Link>
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 font-medium">{s.className}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-900">
                          {s.performanceBreakdown.score}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-semibold ${
                            s.discipline.attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {s.discipline.attendancePercentage}%
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-semibold ${
                            s.discipline.homeworkCompletionPercentage < 60 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {s.discipline.homeworkCompletionPercentage}%
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.riskLevel === 'High'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {s.riskLevel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[160px]">
                          {s.riskReasons?.[0] || 'Attendance + Homework gap'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href={`/students/${s.id}?from=risk`}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                          >
                            View 360 →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>
                Hero student <strong>Riya Sharma</strong> (Class 8-A, HIGH Risk, 68% Att, 54% HW) evaluated.
              </span>
              <Link href="/students/risk" className="text-blue-600 font-semibold hover:underline">
                Risk Command Queue →
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Teacher Performance</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Faculty index scores & cohort growth rankings
                  </p>
                </div>
                <Link
                  href="/teachers/rankings"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                  Rankings →
                </Link>
              </div>

              <div className="space-y-2">
                {topTeachers.map((t, idx) => (
                  <Link
                    key={t.id}
                    href={`/teachers/${t.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.subject} • Class {t.assignedClasses.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-purple-700">
                        {t.performanceBreakdown.score}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {getTeacherCohortBreakdown(t, students).cohortGrowth >= 0 ? '+' : ''}{getTeacherCohortBreakdown(t, students).cohortGrowth}% Cohort Growth
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-purple-50/50 p-2 rounded-lg border border-purple-100">
              <span>
                Top teacher <strong>{topTeacher ? topTeacher.name : 'Educator'}</strong> (#1 Rank, Index {topTeacher ? topTeacher.performanceBreakdown.score : 0}) lead educator.
              </span>
              <Link href="/teachers" className="text-purple-700 font-semibold hover:underline">
                Teachers →
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECOVERY & PARENT INTELLIGENCE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parent Payment Intelligence */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Parent Payment Intelligence</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Parent payment reliability scores & credit eligibility tracking
                  </p>
                </div>
                <Link href="/parents" className="text-xs font-semibold text-emerald-700 hover:underline">
                  View All Parents →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">High Reliability</div>
                  <div className="text-lg font-extrabold text-emerald-950 mt-0.5">
                    {parentReliabilityCounts.high}
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-[10px] text-amber-700 font-bold uppercase">Medium Reliability</div>
                  <div className="text-lg font-extrabold text-amber-950 mt-0.5">
                    {parentReliabilityCounts.med}
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="text-[10px] text-rose-700 font-bold uppercase">Low Reliability</div>
                  <div className="text-lg font-extrabold text-rose-950 mt-0.5">
                    {parentReliabilityCounts.low}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {highPriorityParents.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/parents/${p.id}`} className="font-bold text-xs text-slate-900 hover:text-emerald-700">
                          {p.name}
                        </Link>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Reliability: {p.paymentReliabilityScore} • Credit Limit ₹{p.feeCreditEligibility.recommendedAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-rose-700">
                        ₹{p.familyTotalOutstanding.toLocaleString('en-IN')} Outstanding
                      </div>
                      <Link href={`/parents/${p.id}`} className="text-[11px] text-blue-600 font-semibold hover:underline">
                        Action →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>Hero parent <strong>Raj Sharma</strong> (Score 86, ₹18,500 family outstanding, ₹30k credit) tracked.</span>
            </div>
          </div>

          {/* Fee Recovery Queue (Recovery Action Panel with NIWA) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span>Fee Recovery Queue</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automated NIWA recovery workflow stages & SMS dispatch queue
                  </p>
                </div>
                <Link
                  href="/communications/recovery"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Open Recovery →
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wider mb-4">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200">Upcoming</div>
                <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">Reminder Sent</div>
                <div className="p-1.5 bg-amber-50 text-amber-800 rounded border border-amber-200">Follow-up</div>
                <div className="p-1.5 bg-rose-50 text-rose-800 rounded border border-rose-200">Escalated</div>
              </div>

              <div className="space-y-2">
                {highPriorityParents.slice(0, 3).map((p) => {
                  const student = students.find((s) => s.parentId === p.id) || students[0];
                  const isSending = sendingState[p.id];
                  const successMsg = sendingSuccess[p.id];

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {p.name} <span className="text-slate-400 font-normal">({student.name})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Outstanding: <strong className="text-rose-700">₹{p.familyTotalOutstanding.toLocaleString('en-IN')}</strong> • Reliability: {p.paymentReliabilityScore}
                        </div>
                      </div>

                      <div>
                        {successMsg ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {successMsg}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleSendReminder(p.id, student.id, e)}
                            disabled={isSending}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isSending ? 'Sending...' : 'Send Reminder'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100">
              <span>Powered by NIWA Messaging Engine.</span>
              <Link href="/communications/history" className="text-indigo-700 font-semibold hover:underline">
                Comm Logs →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <IntelligenceDrawer
        student={selectedDrawerStudent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onActionCompleted={(studentId) => {
          setCompletedActions((prev) => ({ ...prev, [studentId]: true }));
        }}
        isCompleted={selectedDrawerStudent ? Boolean(completedActions[selectedDrawerStudent.id]) : false}
      />
    </AppShell>
  );
}
