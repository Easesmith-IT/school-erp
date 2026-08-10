'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { BarChart3, CreditCard, IndianRupee, TrendingUp, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

const DEMO_DATE = '2026-08-09';
const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
const lakhs = (value: number) => `₹${(value / 100000).toFixed(1)} L`;

export default function CollectionAnalyticsPage() {
  const metrics = store.getMetrics();
  const invoices = store.getInvoices();
  const payments = store.getPayments();

  const data = useMemo(() => {
    const partialInvoices = invoices.filter((i) => i.status === 'PARTIALLY_PAID').length;
    const partialRate = invoices.length ? (partialInvoices / invoices.length) * 100 : 0;
    const methodTotals = payments.reduce<Record<string, number>>((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
      return acc;
    }, {});
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0) || 1;
    const months = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(DEMO_DATE);
      d.setMonth(d.getMonth() - (5 - index));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { key, label: d.toLocaleString('en-IN', { month: 'short' }), value: payments.filter((p) => p.paymentDate.startsWith(key)).reduce((sum, p) => sum + p.amount, 0) };
    });
    const maxMonth = Math.max(...months.map((m) => m.value), 1);
    const overdueInvoices = invoices.filter((i) => i.outstandingBalance > 0 && i.agingDays > 0);
    const avgDelay = overdueInvoices.length ? overdueInvoices.reduce((sum, i) => sum + i.agingDays, 0) / overdueInvoices.length : 0;
    const feeTypeTotals = invoices.reduce<Record<string, number>>((acc, i) => {
      acc[i.feeType] = (acc[i.feeType] || 0) + i.amountPaid;
      return acc;
    }, {});
    return { partialRate, methodTotals, totalPayments, months, maxMonth, avgDelay, feeTypeTotals };
  }, [invoices, payments]);

  const methods = Object.entries(data.methodTotals).sort((a, b) => b[1] - a[1]);
  const feeTypes = Object.entries(data.feeTypeTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AppShell>
      <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-blue-600 mb-1">Finance / Analytics</div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">Collection Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Understand collection velocity, payment behaviour and where settlement friction is accumulating.</p>
          </div>
          <Link href="/finance/aging" className="px-3.5 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-semibold">Review ageing exposure →</Link>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric title="Collection Efficiency" value={`${metrics.collectionRate.toFixed(1)}%`} sub={`${money(metrics.totalFeeCollected)} collected`} icon={TrendingUp} tone="emerald" />
          <Metric title="Outstanding Portfolio" value={lakhs(metrics.totalOutstanding)} sub={`${lakhs(metrics.totalOverdue)} overdue`} icon={Wallet} tone="amber" />
          <Metric title="Avg Overdue Age" value={`${data.avgDelay.toFixed(1)} d`} sub="Across unpaid overdue invoices" icon={IndianRupee} tone="blue" />
          <Metric title="Partial Payment Rate" value={`${data.partialRate.toFixed(1)}%`} sub="Invoices with partial settlement" icon={CreditCard} tone="violet" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-4">
          <Panel title="Collection momentum" subtitle="Actual payment value by month">
            <div className="h-64 flex items-end gap-3 border-b border-slate-100 pt-5">
              {data.months.map((month, index) => {
                const previous = data.months[index - 1]?.value || 0;
                const delta = previous ? ((month.value - previous) / previous) * 100 : 0;
                return <div key={month.key} className="flex-1 h-full flex flex-col justify-end group">
                  <div className="text-[10px] text-slate-400 text-center mb-1 opacity-0 group-hover:opacity-100">{money(month.value)}</div>
                  <div className="rounded-t-lg bg-blue-600 min-h-[5px]" style={{ height: `${Math.max(4, (month.value / data.maxMonth) * 78)}%` }} />
                  <div className="text-[10px] font-semibold text-slate-500 text-center mt-2">{month.label}</div>
                  {index > 0 && <div className={`text-[9px] text-center mt-1 ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{delta >= 0 ? '+' : ''}{delta.toFixed(0)}%</div>}
                </div>;
              })}
            </div>
          </Panel>

          <Panel title="Payment method mix" subtitle="Value share of recorded payments">
            <div className="space-y-4 pt-2">
              {methods.map(([method, value]) => {
                const share = (value / data.totalPayments) * 100;
                return <div key={method}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">{method}</span><span className="font-bold text-slate-900">{share.toFixed(1)}%</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${share}%` }} /></div>
                  <div className="text-[10px] text-slate-400 mt-1">{money(value)}</div>
                </div>;
              })}
            </div>
          </Panel>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Panel title="Fee-type collection performance" subtitle="Paid value by fee category">
            <div className="space-y-3">
              {feeTypes.map(([type, value]) => <div key={type} className="flex items-center gap-3">
                <div className="w-36 text-xs font-semibold text-slate-700 truncate">{type}</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (value / Math.max(...feeTypes.map(([, v]) => v), 1)) * 100)}%` }} /></div>
                <div className="w-20 text-right text-xs font-bold text-slate-900">{money(value)}</div>
              </div>)}
            </div>
          </Panel>

          <Panel title="Management signal" subtitle="What the numbers imply">
            <div className="space-y-3 text-sm text-slate-600">
              <Insight icon={Users} title="Collection gap" text={`${money(metrics.totalFeeExpected - metrics.totalFeeCollected)} remains uncollected from the expected portfolio.`} />
              <Insight icon={BarChart3} title="Overdue concentration" text={`${((metrics.totalOverdue / Math.max(metrics.totalOutstanding, 1)) * 100).toFixed(1)}% of outstanding value is already overdue.`} />
              <Insight icon={CreditCard} title="Settlement friction" text={`${data.partialRate.toFixed(1)}% of invoices are partially settled, indicating installment behaviour that deserves monitoring.`} />
            </div>
            <Link href="/communications/recovery" className="inline-flex mt-4 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Open recovery workflow →</Link>
          </Panel>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center"><div><h2 className="font-semibold text-[#172033]">Collection interpretation</h2><p className="text-xs text-slate-500 mt-0.5">A concise operating view rather than another decorative chart.</p></div><span className="text-xs font-semibold text-emerald-600">Live from demo store</span></div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-5"><div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Collected</div><div className="text-xl font-extrabold text-slate-900 mt-1">{money(metrics.totalFeeCollected)}</div><div className="text-xs text-slate-500 mt-1">{metrics.collectionRate.toFixed(1)}% of expected fees.</div></div>
            <div className="p-5"><div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Still exposed</div><div className="text-xl font-extrabold text-amber-600 mt-1">{lakhs(metrics.totalOutstanding)}</div><div className="text-xs text-slate-500 mt-1">Split between current and overdue balances.</div></div>
            <div className="p-5"><div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Next action</div><div className="text-xl font-extrabold text-blue-600 mt-1">Prioritise recovery</div><div className="text-xs text-slate-500 mt-1">Start with the oldest and largest overdue families.</div></div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ title, value, sub, icon: Icon, tone }: { title: string; value: string; sub: string; icon: React.ElementType; tone: 'emerald' | 'amber' | 'blue' | 'violet' }) {
  const tones = { emerald: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50', blue: 'text-blue-600 bg-blue-50', violet: 'text-violet-600 bg-violet-50' };
  return <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"><div className="flex justify-between"><span className="text-xs font-semibold text-slate-500">{title}</span><span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}><Icon className="w-4 h-4" /></span></div><div className="text-2xl font-extrabold text-slate-900 mt-2">{value}</div><div className="text-[11px] text-slate-500 mt-1">{sub}</div></div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"><div className="mb-4"><h2 className="font-semibold text-[#172033]">{title}</h2><p className="text-xs text-slate-500 mt-0.5">{subtitle}</p></div>{children}</section>;
}

function Insight({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return <div className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"><Icon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /><div><div className="text-xs font-bold text-slate-800">{title}</div><div className="text-xs text-slate-500 mt-0.5">{text}</div></div></div>;
}
