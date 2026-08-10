'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function PerformanceTrendsPage() {
  const students = store.getStudents();
  const data = useMemo(() => {
    const current = students.reduce((s, x) => s + x.assessmentTrend.current, 0) / Math.max(students.length, 1);
    const pa2 = students.reduce((s, x) => s + x.assessmentTrend.pa2, 0) / Math.max(students.length, 1);
    const sa1 = students.reduce((s, x) => s + x.assessmentTrend.sa1, 0) / Math.max(students.length, 1);
    const pa1 = students.reduce((s, x) => s + x.assessmentTrend.pa1, 0) / Math.max(students.length, 1);
    const improvers = [...students].map((s) => ({ ...s, delta: s.assessmentTrend.current - s.assessmentTrend.pa2 })).sort((a, b) => b.delta - a.delta);
    const declines = [...improvers].sort((a, b) => a.delta - b.delta);
    const subjects = Object.keys(students[0]?.academics || {}).map((subject) => ({ subject, value: students.reduce((sum, s) => sum + Number(s.academics[subject as keyof typeof s.academics]), 0) / Math.max(students.length, 1) })).sort((a, b) => b.value - a.value);
    const classes = Array.from(new Set(students.map((s) => s.className))).map((className) => { const rows = students.filter((s) => s.className === className); return { className, value: rows.reduce((sum, s) => sum + s.assessmentTrend.current, 0) / Math.max(rows.length, 1) }; }).sort((a, b) => b.value - a.value);
    return { current, pa2, sa1, pa1, improvers, declines, subjects, classes };
  }, [students]);
  const change = data.current - data.pa1;

  return (
    <AppShell>
      <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
        <header><div className="text-[11px] uppercase tracking-[0.12em] font-bold text-blue-600 mb-1">Students / Longitudinal Intelligence</div><h1 className="text-2xl font-bold tracking-tight text-[#172033]">Performance Trends</h1><p className="text-sm text-slate-500 mt-1">See whether academic performance is improving, where it is uneven, and which students need attention.</p></header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric title="Current Average" value={`${data.current.toFixed(1)}%`} sub="Current assessment" />
          <Metric title="Since PA-I" value={`${change >= 0 ? '+' : ''}${change.toFixed(1)} pts`} sub={change >= 0 ? 'Overall improvement' : 'Overall decline'} tone={change >= 0 ? 'emerald' : 'rose'} />
          <Metric title="Top Improver" value={data.improvers[0]?.name || '—'} sub={`${data.improvers[0]?.delta >= 0 ? '+' : ''}${(data.improvers[0]?.delta || 0).toFixed(1)} pts`} />
          <Metric title="Largest Decline" value={data.declines[0]?.name || '—'} sub={`${data.declines[0]?.delta >= 0 ? '+' : ''}${(data.declines[0]?.delta || 0).toFixed(1)} pts`} tone="rose" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
          <div className="flex justify-between items-start"><div><h2 className="font-semibold text-[#172033]">School-wide academic trajectory</h2><p className="text-xs text-slate-500 mt-0.5">Average score across the four available assessment checkpoints.</p></div><TrendingUp className="w-5 h-5 text-blue-600" /></div>
          <div className="mt-8 h-56 flex items-end gap-4 sm:gap-8 border-b border-slate-100 px-2">{[['PA-I', data.pa1], ['PA-II', data.pa2], ['SA-I', data.sa1], ['Current', data.current]].map(([label, value]) => <div key={String(label)} className="flex-1 h-full flex flex-col justify-end"><div className="text-center text-xs font-bold text-slate-800 mb-2">{Number(value).toFixed(1)}%</div><div className="mx-auto w-full max-w-20 rounded-t-xl bg-blue-600 min-h-[8px]" style={{ height: `${Math.max(8, ((Number(value) - 50) / 50) * 82)}%` }} /><div className="text-[10px] font-semibold text-slate-500 text-center mt-2">{label}</div></div>)}</div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Panel title="Performance by subject" subtitle="Current academic averages across the student cohort.">{data.subjects.map((item) => <Bar key={item.subject} label={item.subject.replace(/([A-Z])/g, ' $1')} value={item.value} max={100} />)}</Panel>
          <Panel title="Current performance by class" subtitle="Cohort-level comparison for intervention and recognition.">{data.classes.slice(0, 10).map((item) => <Bar key={item.className} label={item.className} value={item.value} max={100} />)}</Panel>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <People title="Biggest improvers" rows={data.improvers.slice(0, 6)} positive />
          <People title="Students trending down" rows={data.declines.slice(0, 6)} positive={false} />
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ title, value, sub, tone = 'blue' }: { title: string; value: string; sub: string; tone?: 'blue' | 'emerald' | 'rose' }) { const cls = tone === 'emerald' ? 'text-emerald-600' : tone === 'rose' ? 'text-rose-600' : 'text-blue-600'; return <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"><div className="text-xs font-semibold text-slate-500">{title}</div><div className={`text-xl font-extrabold ${cls} mt-2 truncate`}>{value}</div><div className="text-[11px] text-slate-500 mt-1">{sub}</div></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"><h2 className="font-semibold text-[#172033]">{title}</h2><p className="text-xs text-slate-500 mt-0.5 mb-5">{subtitle}</p><div className="space-y-3">{children}</div></section>; }
function Bar({ label, value, max }: { label: string; value: number; max: number }) { return <div><div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{label}</span><span className="font-bold text-slate-900">{value.toFixed(1)}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div></div>; }
function People({ title, rows, positive }: { title: string; rows: any[]; positive: boolean }) { return <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden"><div className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-[#172033]">{title}</h2><p className="text-xs text-slate-500 mt-0.5">Movement from PA-II to current assessment.</p></div>{rows.map((s) => <div key={s.id} className="px-5 py-3 border-b border-slate-100 flex items-center justify-between"><div><div className="text-xs font-bold text-slate-900">{s.name}</div><div className="text-[10px] text-slate-500">{s.className} · Current {s.assessmentTrend.current}%</div></div><div className={`text-xs font-extrabold flex items-center gap-1 ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.delta >= 0 ? '+' : ''}{s.delta.toFixed(1)} pts</div></div>)}{rows[0] && <div className="p-4"><Link href={`/students/${rows[0].id}`} className="text-xs font-semibold text-blue-600">Open leading case →</Link></div>}</section>; }
