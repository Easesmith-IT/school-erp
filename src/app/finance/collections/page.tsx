'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { ArrowUpRight, Banknote, CalendarDays, CreditCard, ReceiptText, Wallet } from 'lucide-react';
import Link from 'next/link';

const DEMO_DATE = '2026-08-09';
const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
const crores = (value: number) => `₹${(value / 10000000).toFixed(2)} Cr`;

export default function FeeCollectionsStreamPage() {
  const payments = store.getPayments();
  const metrics = store.getMetrics();

  const data = useMemo(() => {
    const demo = new Date(DEMO_DATE);
    const day = payments.filter((p) => p.paymentDate === DEMO_DATE);
    const weekStart = new Date(demo); weekStart.setDate(demo.getDate() - 6);
    const week = payments.filter((p) => { const d = new Date(p.paymentDate); return d >= weekStart && d <= demo; });
    const ytd = payments.filter((p) => new Date(p.paymentDate).getFullYear() === demo.getFullYear());
    const byMethod = payments.reduce<Record<string, number>>((acc, p) => { acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount; return acc; }, {});
    const recent = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 12);
    return { day, week, ytd, byMethod, recent };
  }, [payments]);

  const totalMethod = Math.max(payments.reduce((s, p) => s + p.amount, 0), 1);
  const sum = (rows: typeof payments) => rows.reduce((s, p) => s + p.amount, 0);

  return (
    <AppShell>
      <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-[11px] uppercase tracking-[0.12em] font-bold text-emerald-600 mb-1">Finance / Operations</div><h1 className="text-2xl font-bold tracking-tight text-[#172033]">Fee Collections</h1><p className="text-sm text-slate-500 mt-1">A live operating view of receipts, collection velocity and payment channels.</p></div><Link href="/finance/payments" className="px-3.5 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold">Open payment records →</Link></header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric title="Today" value={money(sum(data.day))} sub={`${data.day.length} receipts`} icon={CalendarDays} />
          <Metric title="Last 7 Days" value={money(sum(data.week))} sub={`${data.week.length} receipts processed`} icon={ReceiptText} />
          <Metric title="YTD Collected" value={crores(sum(data.ytd))} sub={`${metrics.collectionRate.toFixed(1)}% of expected fees`} icon={Wallet} />
          <Metric title="Average Receipt" value={money(payments.length ? sum(payments) / payments.length : 0)} sub={`${payments.length.toLocaleString('en-IN')} recorded payments`} icon={Banknote} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <Panel title="Collection velocity" subtitle="Recent daily receipt value within the demo period.">
            <div className="grid grid-cols-7 gap-2 items-end h-48">{Array.from({ length: 7 }, (_, index) => { const d = new Date(DEMO_DATE); d.setDate(d.getDate() - (6 - index)); const key = d.toISOString().slice(0, 10); const rows = payments.filter((p) => p.paymentDate === key); const value = sum(rows); const max = Math.max(...Array.from({ length: 7 }, (_, i) => { const x = new Date(DEMO_DATE); x.setDate(x.getDate() - (6 - i)); return sum(payments.filter((p) => p.paymentDate === x.toISOString().slice(0, 10))); }), 1); return <div key={key} className="h-full flex flex-col justify-end"><div className="text-[9px] text-slate-400 text-center mb-1">{money(value)}</div><div className="bg-blue-600 rounded-t-md min-h-[4px]" style={{ height: `${Math.max(4, (value / max) * 72)}%` }} /><div className="text-[9px] text-slate-500 text-center mt-2">{d.toLocaleString('en-IN', { weekday: 'short' })}</div></div>; })}</div>
          </Panel>
          <Panel title="Payment channel mix" subtitle="Recorded value by collection method.">
            <div className="space-y-4">{Object.entries(data.byMethod).sort((a, b) => b[1] - a[1]).map(([method, value]) => { const share = (value / totalMethod) * 100; return <div key={method}><div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{method}</span><span className="font-bold">{share.toFixed(1)}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${share}%` }} /></div><div className="text-[10px] text-slate-400 mt-1">{money(value)}</div></div>; })}</div>
          </Panel>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden"><div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-semibold text-[#172033]">Latest receipts</h2><p className="text-xs text-slate-500 mt-0.5">Most recent payment records in the canonical store.</p></div><span className="text-xs text-slate-500">{payments.length.toLocaleString('en-IN')} total</span></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500"><tr><th className="p-3">Receipt</th><th className="p-3">Student</th><th className="p-3">Parent</th><th className="p-3">Fee Type</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{data.recent.map((p) => <tr key={p.id} className="hover:bg-slate-50"><td className="p-3 font-mono font-bold text-slate-900">{p.receiptNo}</td><td className="p-3 font-semibold">{p.studentName}</td><td className="p-3 text-slate-500">{p.parentName}</td><td className="p-3 text-slate-600">{p.feeType}</td><td className="p-3 font-bold text-emerald-600">{money(p.amount)}</td><td className="p-3"><span className="inline-flex items-center gap-1"><CreditCard className="w-3 h-3" />{p.paymentMethod}</span></td><td className="p-3 text-slate-500">{p.paymentDate}</td><td className="p-3"><span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">{p.status}</span></td><td className="p-3"><Link href={`/finance/payments?invoice=${p.invoiceId}`} className="text-blue-600 font-semibold inline-flex items-center gap-1">View <ArrowUpRight className="w-3 h-3" /></Link></td></tr>)}</tbody></table></div></section>
      </div>
    </AppShell>
  );
}

function Metric({ title, value, sub, icon: Icon }: { title: string; value: string; sub: string; icon: React.ElementType }) { return <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"><div className="flex justify-between"><span className="text-xs font-semibold text-slate-500">{title}</span><span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Icon className="w-4 h-4" /></span></div><div className="text-2xl font-extrabold text-slate-900 mt-2">{value}</div><div className="text-[11px] text-slate-500 mt-1">{sub}</div></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"><h2 className="font-semibold text-[#172033]">{title}</h2><p className="text-xs text-slate-500 mt-0.5 mb-4">{subtitle}</p>{children}</section>; }
