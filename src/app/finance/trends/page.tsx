'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  IndianRupee,
  LineChart,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
const lakhs = (value: number) => `₹${(value / 100000).toFixed(1)} L`;
const pct = (value: number) => `${value.toFixed(1)}%`;

function dateValue(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).getTime();
}

function monthKey(value: string) {
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'short' });
}

function daysBetween(later: string, earlier: string) {
  return Math.round((dateValue(later) - dateValue(earlier)) / 86400000);
}

export default function PaymentTrendsPage() {
  const invoices = store.getInvoices();
  const payments = store.getPayments();
  const parents = store.getParents();

  const analytics = useMemo(() => {
    const invoiceMap = new Map(invoices.map((invoice) => [invoice.id, invoice]));
    const parentMap = new Map(parents.map((parent) => [parent.id, parent]));

    const paymentRows = payments.map((payment) => {
      const invoice = invoiceMap.get(payment.invoiceId);
      const releaseDays = invoice ? Math.max(0, daysBetween(payment.paymentDate, invoice.dueDate)) : 0;
      return {
        payment,
        invoice,
        releaseDays,
        onTime: releaseDays <= 0,
      };
    });

    const dated = paymentRows.filter((row) => row.payment.paymentDate).sort((a, b) => dateValue(a.payment.paymentDate) - dateValue(b.payment.paymentDate));
    const latest = dated[dated.length - 1]?.payment.paymentDate || new Date().toISOString().slice(0, 10);
    const latestDate = new Date(`${latest.slice(0, 10)}T00:00:00`);
    const monthKeys = Array.from({ length: 24 }, (_, index) => {
      const d = new Date(latestDate.getFullYear(), latestDate.getMonth() - (23 - index), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const monthly = monthKeys.map((key) => {
      const rows = paymentRows.filter((row) => monthKey(row.payment.paymentDate) === key);
      const amount = rows.reduce((sum, row) => sum + row.payment.amount, 0);
      const onTimeRows = rows.filter((row) => row.onTime);
      const avgDelay = rows.length ? rows.reduce((sum, row) => sum + row.releaseDays, 0) / rows.length : 0;
      return {
        key,
        label: monthLabel(key),
        amount,
        count: rows.length,
        onTimeRate: rows.length ? (onTimeRows.length / rows.length) * 100 : 0,
        avgDelay,
      };
    });

    const activeMonths = monthly.filter((month) => month.count > 0);
    const totalAmount = paymentRows.reduce((sum, row) => sum + row.payment.amount, 0);
    const onTimeCount = paymentRows.filter((row) => row.onTime).length;
    const avgDelay = paymentRows.length ? paymentRows.reduce((sum, row) => sum + row.releaseDays, 0) / paymentRows.length : 0;
    const onTimeRate = paymentRows.length ? (onTimeCount / paymentRows.length) * 100 : 0;

    const firstHalf = activeMonths.slice(0, Math.max(1, Math.floor(activeMonths.length / 2)));
    const secondHalf = activeMonths.slice(Math.floor(activeMonths.length / 2));
    const firstRate = firstHalf.length ? firstHalf.reduce((sum, item) => sum + item.onTimeRate, 0) / firstHalf.length : 0;
    const secondRate = secondHalf.length ? secondHalf.reduce((sum, item) => sum + item.onTimeRate, 0) / secondHalf.length : 0;
    const migration = secondRate - firstRate;

    const feeTypeMap = new Map<string, { amount: number; count: number; delays: number[] }>();
    paymentRows.forEach((row) => {
      const key = row.invoice?.feeType || row.payment.feeType || 'Other';
      const current = feeTypeMap.get(key) || { amount: 0, count: 0, delays: [] };
      current.amount += row.payment.amount;
      current.count += 1;
      current.delays.push(row.releaseDays);
      feeTypeMap.set(key, current);
    });
    const feeTypes = Array.from(feeTypeMap.entries())
      .map(([name, value]) => ({ name, ...value, avgDelay: value.count ? value.delays.reduce((a, b) => a + b, 0) / value.count : 0 }))
      .sort((a, b) => b.amount - a.amount);

    const parentMapRows = new Map<string, { parentId: string; parentName: string; amount: number; count: number; delays: number[]; onTime: number }>();
    paymentRows.forEach((row) => {
      const key = row.payment.parentId;
      const parent = parentMap.get(key);
      const current = parentMapRows.get(key) || { parentId: key, parentName: row.payment.parentName, amount: 0, count: 0, delays: [], onTime: 0 };
      current.amount += row.payment.amount;
      current.count += 1;
      current.delays.push(row.releaseDays);
      if (row.onTime) current.onTime += 1;
      parentMapRows.set(key, current);
    });
    const parentBehaviour = Array.from(parentMapRows.values())
      .map((row) => ({ ...row, avgDelay: row.count ? row.delays.reduce((a, b) => a + b, 0) / row.count : 0, onTimeRate: row.count ? (row.onTime / row.count) * 100 : 0 }))
      .sort((a, b) => b.avgDelay - a.avgDelay);

    const methodMap = new Map<string, number>();
    paymentRows.forEach((row) => methodMap.set(row.payment.paymentMethod, (methodMap.get(row.payment.paymentMethod) || 0) + row.payment.amount));
    const methods = Array.from(methodMap.entries()).sort((a, b) => b[1] - a[1]);
    const maxMonthlyDelay = Math.max(...activeMonths.map((m) => m.avgDelay), 1);
    const maxMonthlyAmount = Math.max(...monthly.map((m) => m.amount), 1);

    return {
      monthly,
      activeMonths,
      paymentRows,
      totalAmount,
      onTimeRate,
      avgDelay,
      migration,
      feeTypes,
      parentBehaviour,
      methods,
      maxMonthlyDelay,
      maxMonthlyAmount,
    };
  }, [invoices, payments, parents]);

  const latest = analytics.activeMonths[analytics.activeMonths.length - 1];
  const previous = analytics.activeMonths[analytics.activeMonths.length - 2];
  const currentRateDelta = latest && previous ? latest.onTimeRate - previous.onTimeRate : 0;
  const delayedAmount = analytics.paymentRows.filter((row) => !row.onTime).reduce((sum, row) => sum + row.payment.amount, 0);
  const delayedShare = analytics.totalAmount ? (delayedAmount / analytics.totalAmount) * 100 : 0;

  return (
    <AppShell>
      <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
        <header className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1"><span>Finance</span><ChevronRight className="w-3 h-3" /><span>Payment Behaviour</span></div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">Payment Behaviour Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Understand when families pay, how late they release money, and where payment behaviour is deteriorating.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-500"><CalendarDays className="w-3.5 h-3.5" />24-month payment window</div>
            <Link href="/finance/collections" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold shadow-sm hover:bg-[#1D4ED8]"><ReceiptText className="w-4 h-4" />Review payment records</Link>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi icon={CheckCircle2} label="On-time settlement" value={pct(analytics.onTimeRate)} sub="Across recorded payments" tone="emerald" />
          <Kpi icon={Clock3} label="Average release delay" value={`${analytics.avgDelay.toFixed(0)} days`} sub={`${pct(delayedShare)} of payment value was late`} tone="amber" />
          <Kpi icon={IndianRupee} label="Payment value analysed" value={lakhs(analytics.totalAmount)} sub={`${analytics.paymentRows.length.toLocaleString('en-IN')} payment records`} tone="blue" />
          <Kpi icon={TrendingUp} label="Behaviour migration" value={`${analytics.migration >= 0 ? '+' : ''}${analytics.migration.toFixed(1)} pts`} sub="Early vs later half of window" tone={analytics.migration >= 0 ? 'emerald' : 'rose'} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div><h2 className="font-semibold text-[#172033]">24-month settlement trajectory</h2><p className="text-xs text-slate-500 mt-0.5">Monthly on-time settlement rate and average release delay.</p></div>
            <LineChart className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.8fr] gap-6">
              <div>
                <div className="flex items-center justify-between mb-3"><span className="text-[11px] font-semibold text-slate-500">ON-TIME RATE</span><span className="text-[11px] text-slate-400">Higher is better</span></div>
                <div className="h-56 flex items-end gap-1.5 sm:gap-2 border-b border-slate-100">
                  {analytics.monthly.map((item, index) => {
                    const height = item.count ? Math.max(6, item.onTimeRate) : 3;
                    return <div key={item.key} className="flex-1 h-full flex flex-col justify-end group min-w-0">
                      <div className="text-[9px] font-semibold text-emerald-600 text-center opacity-0 group-hover:opacity-100 mb-1">{item.count ? `${item.onTimeRate.toFixed(0)}%` : '—'}</div>
                      <div className="rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-600 transition-colors" style={{ height: `${height}%` }} />
                      <div className="text-[9px] text-slate-400 text-center mt-2 truncate">{index % 2 === 0 ? item.label : ''}</div>
                    </div>;
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400"><span>Older</span><span>Most recent recorded month</span></div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-600" />Current signal</div>
                <div className="mt-4 text-3xl font-extrabold text-[#172033]">{latest ? pct(latest.onTimeRate) : '—'}</div>
                <div className="mt-1 text-xs text-slate-500">Latest monthly on-time rate</div>
                <div className={`mt-4 inline-flex items-center gap-1 text-xs font-bold ${currentRateDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {currentRateDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{currentRateDelta >= 0 ? '+' : ''}{currentRateDelta.toFixed(1)} pts vs previous month
                </div>
                <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3"><div><div className="text-[10px] text-slate-500">Latest delay</div><div className="text-sm font-bold text-slate-800">{latest ? latest.avgDelay.toFixed(0) : '—'} days</div></div><div><div className="text-[10px] text-slate-500">Latest volume</div><div className="text-sm font-bold text-slate-800">{latest ? money(latest.amount) : '—'}</div></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between"><div><h2 className="font-semibold text-[#172033]">Release delay by month</h2><p className="text-xs text-slate-500 mt-0.5">Days between invoice due date and recorded payment.</p></div><BarChart3 className="w-5 h-5 text-amber-600" /></div>
            <div className="mt-5 h-48 flex items-end gap-2 border-b border-slate-100">
              {analytics.monthly.map((item, index) => <div key={item.key} className="flex-1 h-full flex flex-col justify-end group"><div className="text-[9px] text-amber-700 text-center opacity-0 group-hover:opacity-100 mb-1">{item.count ? `${item.avgDelay.toFixed(0)}d` : '—'}</div><div className="bg-amber-400/80 group-hover:bg-amber-500 rounded-t-sm" style={{ height: `${item.count ? Math.max(5, (item.avgDelay / analytics.maxMonthlyDelay) * 88) : 3}%` }} /><div className="text-[9px] text-slate-400 text-center mt-2">{index % 3 === 0 ? item.label : ''}</div></div>)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between"><div><h2 className="font-semibold text-[#172033]">Payment channel mix</h2><p className="text-xs text-slate-500 mt-0.5">Value by recorded payment method.</p></div><CreditCard className="w-5 h-5 text-blue-600" /></div>
            <div className="mt-5 space-y-4">
              {analytics.methods.map(([method, amount], index) => {
                const share = analytics.totalAmount ? (amount / analytics.totalAmount) * 100 : 0;
                return <div key={method}><div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-slate-700">{method}</span><span className="text-slate-500">{money(amount)} · {share.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${['bg-blue-600','bg-emerald-500','bg-indigo-500','bg-amber-500'][index % 4]}`} style={{ width: `${share}%` }} /></div></div>;
              })}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-semibold text-[#172033]">Fee type behaviour</h2><p className="text-xs text-slate-500 mt-0.5">Which fee streams are released late most often.</p></div><Wallet className="w-5 h-5 text-slate-400" /></div>
            <div className="divide-y divide-slate-100">
              {analytics.feeTypes.slice(0, 6).map((item) => <div key={item.name} className="px-5 py-3.5 flex items-center gap-4"><div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center"><ReceiptText className="w-4 h-4 text-slate-500" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-slate-800 truncate">{item.name}</div><div className="text-[11px] text-slate-500">{item.count.toLocaleString('en-IN')} payments · avg delay {item.avgDelay.toFixed(0)}d</div></div><div className="text-right"><div className="text-sm font-bold text-slate-800">{money(item.amount)}</div><div className={`text-[10px] font-semibold ${item.avgDelay > analytics.avgDelay ? 'text-amber-600' : 'text-emerald-600'}`}>{item.avgDelay > analytics.avgDelay ? 'Above portfolio delay' : 'Below portfolio delay'}</div></div></div>)}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between"><div><p className="text-[11px] uppercase tracking-[0.12em] font-bold text-rose-600">Management signal</p><h2 className="text-xl font-bold text-[#172033] mt-1">Late payment value is {pct(delayedShare)}</h2></div><Clock3 className="w-5 h-5 text-rose-500" /></div>
            <p className="text-sm text-slate-600 mt-3">The recovery team should prioritise families with repeated delays and high outstanding exposure rather than treating every late payment equally.</p>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white border border-slate-200 p-3"><div className="text-[10px] text-slate-500">Late payment value</div><div className="text-lg font-bold text-rose-600">{lakhs(delayedAmount)}</div></div><div className="rounded-xl bg-white border border-slate-200 p-3"><div className="text-[10px] text-slate-500">Average delay</div><div className="text-lg font-bold text-slate-800">{analytics.avgDelay.toFixed(0)}d</div></div></div>
            <Link href="/communications/recovery" className="mt-5 inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700">Open recovery workflow <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><div><h2 className="font-semibold text-[#172033]">Families with highest payment friction</h2><p className="text-xs text-slate-500 mt-0.5">Repeated release delays, ranked by average days late.</p></div><Link href="/parents" className="text-xs font-semibold text-[#2563EB]">Review parent profiles →</Link></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {analytics.parentBehaviour.slice(0, 4).map((row, index) => <div key={row.parentId} className="p-5"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">#{index + 1} friction</span><Users className="w-4 h-4 text-slate-300" /></div><div className="mt-2 text-sm font-bold text-slate-800 truncate">{row.parentName}</div><div className="mt-3 text-2xl font-extrabold text-[#172033]">{row.avgDelay.toFixed(0)}d</div><div className="text-[10px] text-slate-500">average release delay</div><div className="mt-3 flex justify-between text-[10px]"><span className="text-slate-500">On-time</span><span className={`font-bold ${row.onTimeRate >= analytics.onTimeRate ? 'text-emerald-600' : 'text-rose-600'}`}>{pct(row.onTimeRate)}</span></div><div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, row.onTimeRate)}%` }} /></div><div className="mt-3 text-[10px] text-slate-500">{money(row.amount)} paid across {row.count} records</div></div>)}
          </div>
        </section>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400"><span>All indicators are derived from recorded invoice due dates and payment records.</span><Link href="/finance/collections" className="font-semibold text-slate-500 hover:text-[#2563EB]">Audit payment records →</Link></div>
      </div>
    </AppShell>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: React.ElementType; label: string; value: string; sub: string; tone: 'emerald' | 'amber' | 'blue' | 'rose' }) {
  const classes = { emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-600', rose: 'bg-rose-50 text-rose-600' };
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]"><div className="flex items-center justify-between"><span className="text-[11px] font-medium text-slate-500">{label}</span><span className={`w-8 h-8 rounded-lg flex items-center justify-center ${classes[tone]}`}><Icon className="w-4 h-4" /></span></div><div className="text-xl font-extrabold text-[#172033] mt-2">{value}</div><div className="text-[10px] text-slate-500 mt-1">{sub}</div></div>;
}
