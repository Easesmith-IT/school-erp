'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, ArrowRight, BrainCircuit, CheckCircle2, Clock3, IndianRupee, MessageSquare, ShieldAlert, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react';
import { store } from '@/lib/store';

type SignalTone = 'blue' | 'amber' | 'rose' | 'emerald';
type Signal = { label: string; value: string; explanation: string; action: string; href: string; tone: SignalTone; icon: React.ElementType };

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
const lakhs = (value: number) => `₹${(value / 100000).toFixed(1)} L`;

export function ContextualIntelligence() {
  const pathname = usePathname();
  const signals = useMemo<Signal[]>(() => {
    const students = store.getStudents();
    const teachers = store.getTeachers();
    const parents = store.getParents();
    const invoices = store.getInvoices();
    const communications = store.getCommunications();
    const metrics = store.getMetrics();
    const highRisk = students.filter((s) => s.riskLevel === 'High');
    const declining = students.map((s) => ({ student: s, delta: s.assessmentTrend.current - s.assessmentTrend.pa2 })).sort((a, b) => a.delta - b.delta);
    const lowestAttendance = [...students].sort((a, b) => a.discipline.attendancePercentage - b.discipline.attendancePercentage)[0];
    const lowestHomework = [...students].sort((a, b) => a.discipline.homeworkCompletionPercentage - b.discipline.homeworkCompletionPercentage)[0];
    const topTeacher = [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score)[0];
    const coachingTeacher = [...teachers].sort((a, b) => a.performanceBreakdown.score - b.performanceBreakdown.score)[0];
    const oldest = [...invoices].filter((i) => i.outstandingBalance > 0).sort((a, b) => b.agingDays - a.agingDays)[0];
    const largestOverdue = [...invoices].filter((i) => i.outstandingBalance > 0).sort((a, b) => b.outstandingBalance - a.outstandingBalance)[0];
    const leastReliable = [...parents].sort((a, b) => a.paymentReliabilityScore - b.paymentReliabilityScore)[0];
    const failedMessages = communications.filter((c) => c.status === 'FAILED').length;
    const delivered = communications.filter((c) => c.status === 'DELIVERED').length;
    const sentOrFailed = delivered + failedMessages;
    const deliveryRate = sentOrFailed ? (delivered / sentOrFailed) * 100 : 0;

    if (pathname.startsWith('/finance') || pathname.startsWith('/parents')) return [
      { label: 'Exposure concentration', value: lakhs(metrics.totalOverdue), explanation: `${((metrics.totalOverdue / Math.max(metrics.totalOutstanding, 1)) * 100).toFixed(1)}% of outstanding value is already overdue.`, action: 'Open ageing exposure', href: '/finance/aging', tone: 'rose', icon: ShieldAlert },
      { label: 'Largest current case', value: largestOverdue ? lakhs(largestOverdue.outstandingBalance) : '₹0', explanation: largestOverdue ? `${largestOverdue.parentName} · ${largestOverdue.studentName} · ${largestOverdue.agingDays} days old.` : 'No outstanding invoice found.', action: 'Review outstanding', href: '/finance/outstanding', tone: 'amber', icon: Wallet },
      { label: 'Behaviour signal', value: leastReliable ? `${leastReliable.paymentReliabilityScore}/100` : '—', explanation: leastReliable ? `${leastReliable.name} has the lowest recorded payment reliability.` : 'No parent reliability data found.', action: 'Review parent reliability', href: '/parents', tone: 'blue', icon: Users },
    ];

    if (pathname.startsWith('/students')) return [
      { label: 'Highest intervention need', value: highRisk[0]?.name || 'None', explanation: highRisk[0] ? `${highRisk[0].className} · ${highRisk[0].discipline.attendancePercentage.toFixed(0)}% attendance · ${highRisk[0].discipline.homeworkCompletionPercentage.toFixed(0)}% homework.` : 'No high-risk students in the current dataset.', action: 'Open risk queue', href: '/students/risk', tone: 'rose', icon: ShieldAlert },
      { label: 'Largest academic decline', value: declining[0]?.student.name || '—', explanation: declining[0] ? `${declining[0].delta >= 0 ? '+' : ''}${declining[0].delta.toFixed(1)} points from PA-II to current.` : 'No assessment movement available.', action: 'Review trends', href: '/students/trends', tone: declining[0]?.delta < 0 ? 'amber' : 'emerald', icon: TrendingDown },
      { label: 'Discipline signal', value: lowestAttendance ? `${lowestAttendance.discipline.attendancePercentage.toFixed(0)}%` : '—', explanation: lowestAttendance ? `${lowestAttendance.name} has the lowest attendance. Homework leader is ${lowestHomework?.name || 'not available'}.` : 'No attendance records available.', action: 'Open attendance', href: '/students/attendance', tone: 'blue', icon: Clock3 },
    ];

    if (pathname.startsWith('/teachers')) return [
      { label: 'Leading educator', value: topTeacher?.name || '—', explanation: topTeacher ? `${topTeacher.subject} · ${topTeacher.performanceBreakdown.score.toFixed(1)} index · ${topTeacher.avgStudentPerformance.toFixed(1)} avg student performance.` : 'No teacher records available.', action: 'View rankings', href: '/teachers/rankings', tone: 'emerald', icon: TrendingUp },
      { label: 'Coaching priority', value: coachingTeacher?.name || '—', explanation: coachingTeacher ? `${coachingTeacher.performanceBreakdown.score.toFixed(1)} index with ${coachingTeacher.studentsNeedingAttentionCount} students needing attention.` : 'No coaching candidate found.', action: 'Compare educators', href: '/teachers/comparison', tone: 'amber', icon: TrendingDown },
      { label: 'Student outcome link', value: teachers.length ? `${teachers.reduce((s, t) => s + t.studentsNeedingAttentionCount, 0)}` : '0', explanation: 'Students needing attention are the outcome signal to inspect alongside teacher performance.', action: 'Inspect student risk', href: '/students/risk', tone: 'blue', icon: Users },
    ];

    if (pathname.startsWith('/communications')) return [
      { label: 'Recovery opportunity', value: lakhs(metrics.totalOverdue), explanation: `${metrics.highRiskCount} high-risk students and overdue fee exposure create the clearest intervention queue.`, action: 'Open recovery queue', href: '/communications/recovery', tone: 'rose', icon: IndianRupee },
      { label: 'Delivery reliability', value: `${deliveryRate.toFixed(1)}%`, explanation: `${failedMessages} failed communication records are currently present in the log.`, action: 'Inspect communication history', href: '/communications/history', tone: deliveryRate >= 90 ? 'emerald' : 'amber', icon: MessageSquare },
      { label: 'Oldest unresolved invoice', value: oldest ? `${oldest.agingDays} days` : 'None', explanation: oldest ? `${oldest.parentName} · ${oldest.studentName} · ${money(oldest.outstandingBalance)} outstanding.` : 'No unresolved invoice found.', action: 'Prioritise oldest exposure', href: '/finance/aging', tone: 'amber', icon: AlertTriangle },
    ];

    return [
      { label: 'School attention load', value: `${metrics.studentsAtRiskCount}`, explanation: `${metrics.highRiskCount} are high risk. The system is prioritising intervention rather than merely reporting totals.`, action: 'Review student risk', href: '/students/risk', tone: metrics.highRiskCount ? 'rose' : 'emerald', icon: ShieldAlert },
      { label: 'Financial exposure', value: lakhs(metrics.totalOverdue), explanation: `${metrics.collectionRate.toFixed(1)}% collected against expected fees, leaving overdue balances to recover.`, action: 'Review recovery', href: '/communications/recovery', tone: 'amber', icon: Wallet },
      { label: 'Best educator signal', value: topTeacher?.name || '—', explanation: topTeacher ? `${topTeacher.performanceBreakdown.score.toFixed(1)} performance index with ${topTeacher.avgStudentPerformance.toFixed(1)} average student performance.` : 'No teacher records available.', action: 'View teaching intelligence', href: '/teachers', tone: 'blue', icon: CheckCircle2 },
    ];
  }, [pathname]);

  const toneClasses: Record<SignalTone, string> = { blue: 'border-blue-100 bg-blue-50/60 text-blue-700', amber: 'border-amber-100 bg-amber-50/70 text-amber-700', rose: 'border-rose-100 bg-rose-50/70 text-rose-700', emerald: 'border-emerald-100 bg-emerald-50/70 text-emerald-700' };

  return <section className="px-6 py-3 bg-white border-b border-slate-200"><div className="max-w-[1500px] mx-auto"><div className="flex items-center gap-2 mb-2"><BrainCircuit className="w-4 h-4 text-blue-600" /><span className="text-[10px] uppercase tracking-[0.14em] font-extrabold text-slate-500">Intelligence layer</span><span className="text-[10px] text-slate-400">Derived from current canonical records</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-2">{signals.map((signal) => { const Icon = signal.icon; return <div key={signal.label} className={`rounded-xl border p-3 ${toneClasses[signal.tone]}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[10px] uppercase tracking-wider font-bold opacity-70">{signal.label}</div><div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate">{signal.value}</div></div><Icon className="w-4 h-4 shrink-0" /></div><p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{signal.explanation}</p><Link href={signal.href} className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-700 hover:text-blue-700">{signal.action}<ArrowRight className="w-3 h-3" /></Link></div>; })}</div></div></section>;
}
