'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  IndianRupee,
  LineChart,
  PieChart,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { DomainNavTabs } from '@/components/common/DomainNavTabs';

const DEMO_DATE = '2026-08-09';

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
const lakhs = (value: number) => `₹${(value / 100000).toFixed(1)} L`;
const crores = (value: number) => `₹${(value / 10000000).toFixed(3)} Cr`;

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'short' });
}

export default function FinancialDashboardPage() {
  const metrics = store.getMetrics();
  const invoices = store.getInvoices();
  const payments = store.getPayments();
  const parents = store.getParents();

  const financeTabs = [
    { label: 'Financial Overview', href: '/finance/dashboard' },
    { label: 'Fee Collections', href: '/finance/collections' },
    { label: 'Payment Records', href: '/finance/payments' },
    { label: 'Outstanding Fees', href: '/finance/outstanding', badge: lakhs(metrics.totalOutstanding) },
    { label: 'Aging Analysis', href: '/finance/aging' },
    { label: 'Collection Analytics', href: '/finance/analytics' },
    { label: 'Parent Reliability', href: '/parents' },
    { label: 'Fee Credit Eligibility', href: '/finance/credit' },
    { label: 'Payment Trends', href: '/finance/trends' },
  ];

  const intelligence = useMemo(() => {
    const methodTotals = payments.reduce<Record<string, number>>((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
      return acc;
    }, {});

    const familyMap = new Map<string, { parentId: string; parentName: string; outstanding: number; overdue: number; ninetyPlus: number; students: Set<string> }>();
    invoices.forEach((invoice) => {
      const current = familyMap.get(invoice.parentId) || {
        parentId: invoice.parentId,
        parentName: invoice.parentName,
        outstanding: 0,
        overdue: 0,
        ninetyPlus: 0,
        students: new Set<string>(),
      };
      current.outstanding += invoice.outstandingBalance;
      if (invoice.agingDays > 0) current.overdue += invoice.outstandingBalance;
      if (invoice.agingDays >= 90) current.ninetyPlus += invoice.outstandingBalance;
      current.students.add(invoice.studentId);
      familyMap.set(invoice.parentId, current);
    });

    const topFamilies = Array.from(familyMap.values())
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);

    const recoveryQueue = Array.from(familyMap.values())
      .filter((family) => family.overdue > 0)
      .sort((a, b) => (b.ninetyPlus * 2 + b.overdue) - (a.ninetyPlus * 2 + a.overdue))
      .slice(0, 6);

    const demo = new Date(DEMO_DATE);
    const monthKeys = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(demo.getFullYear(), demo.getMonth() - (5 - index), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const monthly = monthKeys.map((key) => ({
      key,
      label: monthLabel(key),
      collected: payments.filter((payment) => monthKey(payment.paymentDate) === key).reduce((sum, payment) => sum + payment.amount, 0),
    }));

    const maxMonthly = Math.max(...monthly.map((item) => item.collected), 1);
    const methodEntries = Object.entries(methodTotals).sort((a, b) => b[1] - a[1]);
    const totalMethodValue = methodEntries.reduce((sum, [, value]) => sum + value, 0) || 1;

    const parentById = new Map(parents.map((parent) => [parent.id, parent]));

    return {
      methodEntries,
      totalMethodValue,
      topFamilies,
      recoveryQueue,
      monthly,
      maxMonthly,
      parentById,
    };
  }, [invoices, payments, parents]);

  const collectionGap = metrics.totalFeeExpected - metrics.totalFeeCollected;
  const overdueShare = metrics.totalOutstanding ? (metrics.totalOverdue / metrics.totalOutstanding) * 100 : 0;
  const ninetyShare = metrics.totalOutstanding ? (metrics.agingBuckets.days90Plus / metrics.totalOutstanding) * 100 : 0;

  return (
    <AppShell>
      <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
        {/* Executive header */}
        <header className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
              <span>Finance</span><ChevronRight className="w-3 h-3" /><span>Executive Overview</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">Financial Intelligence</h1>
            <p className="text-sm text-slate-500 mt-1">Where money is collected, where it is stuck, and what management should act on next.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Data reconciled · {invoices.length.toLocaleString('en-IN')} invoices
            </div>
            <Link href="/finance/collections" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold shadow-sm hover:bg-[#1D4ED8] transition-colors">
              <ReceiptText className="w-4 h-4" /> Review Collections
            </Link>
          </div>
        </header>

        <DomainNavTabs tabs={financeTabs} />

        {/* Executive financial health */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#172033]">School Financial Health</h2>
              <p className="text-xs text-slate-500 mt-0.5">The portfolio at a glance, with the operational story underneath.</p>
            </div>
            <Link href="/finance/analytics" className="text-xs font-semibold text-[#2563EB] hover:underline">Open full analytics →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-x divide-slate-100">
            <Metric label="Expected Fees" value={crores(metrics.totalFeeExpected)} icon={Wallet} tone="slate" sub="100% portfolio" />
            <Metric label="Collected" value={crores(metrics.totalFeeCollected)} icon={CheckCircle2} tone="emerald" sub={`${metrics.collectionRate.toFixed(1)}% collected`} />
            <Metric label="Outstanding" value={lakhs(metrics.totalOutstanding)} icon={IndianRupee} tone="amber" sub={`${(100 - metrics.collectionRate).toFixed(1)}% of expected`} />
            <Metric label="Overdue" value={lakhs(metrics.totalOverdue)} icon={Clock3} tone="rose" sub={`${overdueShare.toFixed(1)}% of outstanding`} />
            <Metric label="Not Yet Due" value={lakhs(metrics.agingBuckets.currentNotDue)} icon={ShieldCheck} tone="blue" sub="Future-dated balance" />
            <Metric label="90+ Days" value={lakhs(metrics.agingBuckets.days90Plus)} icon={AlertTriangle} tone="rose" sub={`${ninetyShare.toFixed(1)}% of outstanding`} />
          </div>
        </section>

        {/* The problem / action row */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr_1fr] gap-4">
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-rose-600">Management Attention</p>
                <h2 className="text-xl font-bold text-[#172033] mt-1">₹{(metrics.agingBuckets.days90Plus / 100000).toFixed(1)} L is 90+ days overdue</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-xl">This is the highest-recovery-risk portion of the outstanding portfolio. The question is no longer what is unpaid, but which families need intervention first.</p>
              </div>
              <div className="shrink-0 w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/finance/aging" className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700">Review 90+ day exposure</Link>
              <Link href="/communications/recovery" className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300">Open recovery workflow</Link>
              <span className="text-xs text-slate-500">Collection gap: <strong className="text-slate-700">{crores(collectionGap)}</strong></span>
            </div>
          </div>

          <InsightCard icon={TrendingUp} title="Collection position" value={`${metrics.collectionRate.toFixed(1)}%`} tone="emerald" description="of expected fees have been collected. The remaining portfolio is split between current and overdue balances." link="/finance/analytics" linkLabel="Understand collection performance" />
          <InsightCard icon={Users} title="Family exposure" value={lakhs(metrics.totalOutstanding)} tone="blue" description={`Top recovery cases are concentrated across ${parents.length.toLocaleString('en-IN')} parent accounts. Start with families carrying overdue exposure.`} link="/parents" linkLabel="Review parent reliability" />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.8fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[#172033]">Collection momentum</h2>
                <p className="text-xs text-slate-500 mt-0.5">Actual payments received by month, anchored to the demo period.</p>
              </div>
              <LineChart className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="mt-6 h-56 flex items-end gap-3 sm:gap-5 border-b border-slate-100 px-1">
              {intelligence.monthly.map((item, index) => {
                const previous = intelligence.monthly[index - 1]?.collected || 0;
                const delta = previous ? ((item.collected - previous) / previous) * 100 : 0;
                return (
                  <div key={item.key} className="flex-1 h-full flex flex-col justify-end group">
                    <div className="text-[10px] text-slate-400 text-center mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{money(item.collected)}</div>
                    <div className="relative rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-400 min-h-[6px] transition-all group-hover:from-blue-700" style={{ height: `${Math.max(4, (item.collected / intelligence.maxMonthly) * 82)}%` }}>
                      {index > 0 && <span className={`absolute -top-5 right-0 text-[9px] font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{delta >= 0 ? '+' : ''}{delta.toFixed(0)}%</span>}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 text-center mt-2">{item.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>6-month payment stream</span>
              <Link href="/finance/trends" className="font-semibold text-[#2563EB]">View payment behaviour →</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[#172033]">Where is the outstanding?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Current vs overdue exposure.</p>
              </div>
              <PieChart className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="mt-5 space-y-4">
              <ProgressRow label="Not yet due" value={metrics.agingBuckets.currentNotDue} total={metrics.totalOutstanding} color="bg-blue-500" />
              <ProgressRow label="0–30 days" value={metrics.agingBuckets.days0_30} total={metrics.totalOutstanding} color="bg-amber-400" />
              <ProgressRow label="31–60 days" value={metrics.agingBuckets.days31_60} total={metrics.totalOutstanding} color="bg-orange-500" />
              <ProgressRow label="61–90 days" value={metrics.agingBuckets.days61_90} total={metrics.totalOutstanding} color="bg-rose-400" />
              <ProgressRow label="90+ days" value={metrics.agingBuckets.days90Plus} total={metrics.totalOutstanding} color="bg-rose-600" />
            </div>
            <Link href="/finance/aging" className="mt-5 inline-flex text-xs font-semibold text-[#2563EB]">Open aging analysis →</Link>
          </div>
        </section>

        {/* Payment methods + top families */}
        <section className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[#172033]">Payment method mix</h2>
                <p className="text-xs text-slate-500 mt-0.5">Based on recorded successful payment value.</p>
              </div>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-5 space-y-4">
              {intelligence.methodEntries.map(([method, value], index) => {
                const percent = (value / intelligence.totalMethodValue) * 100;
                return (
                  <div key={method}>
                    <div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-slate-700">{method}</span><span className="text-slate-500">{money(value)} · {percent.toFixed(1)}%</span></div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'][index % 4]}`} style={{ width: `${percent}%` }} /></div>
                  </div>
                );
              })}
            </div>
            <Link href="/finance/collections" className="mt-5 inline-flex text-xs font-semibold text-[#2563EB]">Inspect payment records →</Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div><h2 className="font-semibold text-[#172033]">Highest outstanding families</h2><p className="text-xs text-slate-500 mt-0.5">Who carries the largest unpaid balances.</p></div>
              <Link href="/parents" className="text-xs font-semibold text-[#2563EB]">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {intelligence.topFamilies.map((family, index) => {
                const parent = intelligence.parentById.get(family.parentId);
                const isHero = family.parentName === 'Raj Sharma';
                return (
                  <div key={family.parentId} className={`px-5 py-3 flex items-center gap-3 ${isHero ? 'bg-blue-50/50' : ''}`}>
                    <span className="w-6 text-[11px] font-bold text-slate-400">#{index + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{family.parentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-800 truncate">{family.parentName}</span>{isHero && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">DEMO CASE</span>}</div>
                      <div className="text-[11px] text-slate-500">{family.students.size} student{family.students.size !== 1 ? 's' : ''} · {lakhs(family.overdue)} overdue</div>
                    </div>
                    <div className="text-right"><div className="text-sm font-bold text-slate-800">{money(family.outstanding)}</div><div className="text-[10px] text-rose-600 font-semibold">{lakhs(family.ninetyPlus)} 90+</div></div>
                    <Link href={parent ? `/parents/${parent.id}` : '/parents'} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><ChevronRight className="w-4 h-4" /></Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recovery workbench preview */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div><h2 className="font-semibold text-[#172033]">Recovery queue</h2><p className="text-xs text-slate-500 mt-0.5">A preview of the cases management should work first.</p></div>
            <Link href="/communications/recovery" className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">Open recovery workbench <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {intelligence.recoveryQueue.slice(0, 3).map((family) => {
              const parent = intelligence.parentById.get(family.parentId);
              const isHero = family.parentName === 'Raj Sharma';
              return (
                <div key={family.parentId} className={`p-5 ${isHero ? 'bg-blue-50/40' : ''}`}>
                  <div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">{family.ninetyPlus > 0 ? 'Critical recovery' : 'Overdue follow-up'}</span><BarChart3 className="w-4 h-4 text-slate-400" /></div>
                  <div className="mt-2 flex items-center gap-2"><span className="text-base font-bold text-slate-800">{family.parentName}</span>{isHero && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">KEY CASE</span>}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3"><div><div className="text-[10px] text-slate-500">Family outstanding</div><div className="text-sm font-bold text-slate-800">{money(family.outstanding)}</div></div><div><div className="text-[10px] text-slate-500">90+ exposure</div><div className="text-sm font-bold text-rose-600">{lakhs(family.ninetyPlus)}</div></div></div>
                  <Link href={parent ? `/parents/${parent.id}` : '/communications/recovery'} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">Review case <ChevronRight className="w-3 h-3" /></Link>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Demo anchor: {DEMO_DATE} · All figures derived from canonical invoice and payment records.</span>
          <Link href="/finance/aging" className="font-semibold text-slate-500 hover:text-[#2563EB]">Audit aging calculation →</Link>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ label, value, icon: Icon, tone, sub }: { label: string; value: string; icon: React.ElementType; tone: 'slate' | 'emerald' | 'amber' | 'rose' | 'blue'; sub: string }) {
  const tones = {
    slate: 'text-slate-700 bg-slate-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50',
    blue: 'text-blue-600 bg-blue-50',
  };
  return (
    <div className="p-4 min-w-0">
      <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-medium text-slate-500 truncate">{label}</span><span className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones[tone]}`}><Icon className="w-3.5 h-3.5" /></span></div>
      <div className="text-xl font-extrabold text-[#172033] mt-2 tracking-tight">{value}</div>
      <div className="text-[10px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{lakhs(value)} · {percent.toFixed(1)}%</span></div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, percent)}%` }} /></div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, value, tone, description, link, linkLabel }: { icon: React.ElementType; title: string; value: string; tone: 'emerald' | 'blue'; description: string; link: string; linkLabel: string }) {
  const iconClass = tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between"><span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}><Icon className="w-4 h-4" /></span><ArrowUpRight className="w-4 h-4 text-slate-300" /></div>
      <div className="mt-4 text-[11px] uppercase tracking-wider font-semibold text-slate-500">{title}</div>
      <div className="text-2xl font-bold text-[#172033] mt-1">{value}</div>
      <p className="text-xs text-slate-500 leading-5 mt-2">{description}</p>
      <Link href={link} className="inline-flex mt-4 text-xs font-semibold text-[#2563EB] hover:underline">{linkLabel} →</Link>
    </div>
  );
}
