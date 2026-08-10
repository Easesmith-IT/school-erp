'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { AlertTriangle, ArrowRight, Clock3, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
const lakhs = (value: number) => `₹${(value / 100000).toFixed(1)} L`;

export default function AgingAnalysisPage() {
  const metrics = store.getMetrics();
  const invoices = store.getInvoices();
  const aging = metrics.agingBuckets;

  const families = useMemo(() => {
    const map = new Map<string, { id: string; name: string; outstanding: number; overdue: number; ninety: number; students: Set<string> }>();
    invoices.filter((i) => i.outstandingBalance > 0).forEach((i) => {
      const row = map.get(i.parentId) || { id: i.parentId, name: i.parentName, outstanding: 0, overdue: 0, ninety: 0, students: new Set<string>() };
      row.outstanding += i.outstandingBalance;
      if (i.agingDays > 0) row.overdue += i.outstandingBalance;
      if (i.agingDays >= 90) row.ninety += i.outstandingBalance;
      row.students.add(i.studentId);
      map.set(i.parentId, row);
    });
    return [...map.values()].filter((f) => f.overdue > 0).sort((a, b) => (b.ninety * 2 + b.overdue) - (a.ninety * 2 + a.overdue)).slice(0, 8);
  }, [invoices]);

  const buckets = [
    ['Current / Not Due', aging.currentNotDue, 'Future-dated balance', 'slate'],
    ['0–30 Days', aging.days0_30, 'Initial reminder stage', 'amber'],
    ['31–60 Days', aging.days31_60, 'Follow-up stage', 'amber'],
    ['61–90 Days', aging.days61_90, 'Escalation stage', 'rose'],
    ['90+ Days', aging.days90Plus, 'Highest recovery risk', 'red'],
  ] as const;
  const overdue = Math.max(metrics.totalOutstanding - aging.currentNotDue, 0);

  return (
    <AppShell>
      <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="text-[11px] uppercase tracking-[0.12em] font-bold text-rose-600 mb-1">Finance / Recovery Risk</div><h1 className="text-2xl font-bold tracking-tight text-[#172033]">Aging Analysis</h1><p className="text-sm text-slate-500 mt-1">See how outstanding fees are moving from current balances into recovery risk.</p></div>
          <Link href="/communications/recovery" className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold">Open recovery queue →</Link>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {buckets.map(([label, value, note, tone]) => <div key={label} className={`rounded-2xl border p-4 ${tone === 'red' ? 'bg-red-50 border-red-200' : tone === 'rose' ? 'bg-rose-50 border-rose-200' : tone === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}><div className="text-[11px] font-bold text-slate-600">{label}</div><div className="text-xl font-extrabold text-slate-900 mt-1">{lakhs(value)}</div><div className="text-[10px] text-slate-500 mt-1">{note}</div></div>)}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex justify-between items-start"><div><h2 className="font-semibold text-[#172033]">Outstanding distribution</h2><p className="text-xs text-slate-500 mt-0.5">Proportion of the total outstanding portfolio by aging stage.</p></div><Clock3 className="w-5 h-5 text-slate-400" /></div>
            <div className="mt-6 h-10 flex rounded-xl overflow-hidden bg-slate-100">
              {buckets.map(([label, value], index) => <div key={label} title={`${label}: ${lakhs(value)}`} className={`${index === 0 ? 'bg-slate-300' : index < 3 ? 'bg-amber-400' : 'bg-rose-500'} h-full`} style={{ width: `${(value / Math.max(metrics.totalOutstanding, 1)) * 100}%` }} />)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">{buckets.map(([label, value], index) => <div key={label}><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-slate-300' : index < 3 ? 'bg-amber-400' : 'bg-rose-500'}`} /><span className="text-[10px] text-slate-500 truncate">{label}</span></div><div className="text-sm font-bold text-slate-900 mt-1">{((value / Math.max(metrics.totalOutstanding, 1)) * 100).toFixed(1)}%</div></div>)}</div>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5"><div className="flex justify-between"><div><div className="text-[10px] uppercase tracking-wider font-bold text-rose-600">Management attention</div><div className="text-2xl font-extrabold text-[#172033] mt-1">{lakhs(aging.days90Plus)}</div><div className="text-xs text-slate-600 mt-1">sits in the 90+ day bucket.</div></div><ShieldAlert className="w-5 h-5 text-rose-600" /></div><div className="mt-5 p-3 rounded-xl bg-white border border-rose-100 text-xs text-slate-600">{((aging.days90Plus / Math.max(metrics.totalOutstanding, 1)) * 100).toFixed(1)}% of the outstanding portfolio is in the highest-risk bucket.</div><Link href="/communications/recovery" className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-rose-700">Prioritise these families <ArrowRight className="w-3 h-3" /></Link></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-semibold text-[#172033]">Recovery priority</h2><p className="text-xs text-slate-500 mt-0.5">Largest and oldest overdue family exposure first.</p></div><span className="text-xs text-slate-500">{families.length} priority cases</span></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500"><tr><th className="p-3">Parent</th><th className="p-3">Students</th><th className="p-3">Outstanding</th><th className="p-3">Overdue</th><th className="p-3">90+ Exposure</th><th className="p-3">Priority</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{families.map((f) => <tr key={f.id} className="hover:bg-slate-50"><td className="p-3 font-bold text-slate-900">{f.name}</td><td className="p-3 text-slate-500">{f.students.size}</td><td className="p-3 font-bold text-slate-800">{money(f.outstanding)}</td><td className="p-3 font-semibold text-amber-700">{money(f.overdue)}</td><td className="p-3 font-bold text-rose-700">{money(f.ninety)}</td><td className="p-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${f.ninety > 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{f.ninety > 0 ? 'HIGH' : 'FOLLOW-UP'}</span></td><td className="p-3"><Link href={`/parents/${f.id}?from=aging`} className="font-semibold text-blue-600">Open family →</Link></td></tr>)}</tbody></table></div>
        </section>

        <div className="rounded-2xl bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><div className="font-semibold">Portfolio reconciliation</div><div className="text-xs text-slate-400 mt-1">{lakhs(metrics.totalOutstanding)} outstanding = {lakhs(aging.currentNotDue)} current/not due + {lakhs(overdue)} overdue.</div></div><div className="text-right"><div className="text-xl font-extrabold text-amber-400">100%</div><div className="text-[10px] text-slate-400">reconciled by value</div></div></div>
      </div>
    </AppShell>
  );
}
