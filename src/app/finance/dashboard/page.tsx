'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Wallet, AlertCircle, TrendingUp, DollarSign, PieChart, LineChart } from 'lucide-react';
import Link from 'next/link';

import { DomainNavTabs } from '@/components/common/DomainNavTabs';

export default function FinancialDashboardPage() {
  const metrics = store.getMetrics();

  const financeTabs = [
    { label: 'Financial Overview', href: '/finance/dashboard' },
    { label: 'Fee Collections', href: '/finance/collections' },
    { label: 'Payment Records', href: '/finance/payments' },
    { label: 'Outstanding Fees', href: '/finance/outstanding', badge: '₹42.3L' },
    { label: 'Aging Analysis', href: '/finance/aging' },
    { label: 'Collection Analytics', href: '/finance/analytics' },
    { label: 'Parent Reliability', href: '/parents' },
    { label: 'Fee Credit Eligibility', href: '/finance/credit' },
    { label: 'Payment Trends', href: '/finance/trends' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Intelligence Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Executive financial overview derived dynamically from 7,488 canonical invoice records
            </p>
          </div>
          <Link
            href="/finance/collections"
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 shadow-xs"
          >
            + View Fee Collections Stream
          </Link>
        </div>

        {/* Domain Navigation Tabs */}
        <DomainNavTabs tabs={financeTabs} />

        {/* 6 Hero Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Expected Fees</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">₹{(metrics.totalFeeExpected / 10000000).toFixed(3)} Cr</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Canonical total</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Collected Fees</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">₹{(metrics.totalFeeCollected / 10000000).toFixed(2)} Cr</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">77.0% Collection Rate</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Total Outstanding</div>
            <div className="text-xl font-extrabold text-amber-900 mt-1">₹{(metrics.totalOutstanding / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-slate-500 mt-0.5">All unpaid balances</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Total Overdue</div>
            <div className="text-xl font-extrabold text-red-600 mt-1">₹{(metrics.totalOverdue / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-red-700 font-semibold mt-0.5">Past due date</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Current / Not Due</div>
            <div className="text-xl font-extrabold text-slate-800 mt-1">₹{(metrics.agingBuckets.currentNotDue / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Not yet overdue</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">90+ Days Overdue</div>
            <div className="text-xl font-extrabold text-red-900 mt-1">₹{(metrics.agingBuckets.days90Plus / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-red-700 font-bold mt-0.5">High recovery risk</div>
          </div>
        </div>

        {/* Financial Quick Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Link href="/finance/aging" className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">Aging Analysis</div>
              <div className="text-[11px] text-slate-500">Inspect 0-30, 31-60, 61-90, 90+ buckets</div>
            </div>
            <PieChart className="w-5 h-5 text-blue-600" />
          </Link>

          <Link href="/finance/analytics" className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">Collection Analytics</div>
              <div className="text-[11px] text-slate-500">Payment release delays & method distribution</div>
            </div>
            <LineChart className="w-5 h-5 text-emerald-600" />
          </Link>

          <Link href="/parents" className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 transition-colors flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">Parent Payment Reliability</div>
              <div className="text-[11px] text-slate-500">850 parent reliability scores</div>
            </div>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </Link>

          <Link href="/finance/credit" className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-colors flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900">Fee Credit Intelligence</div>
              <div className="text-[11px] text-slate-500">Decision support fee credit limits</div>
            </div>
            <Wallet className="w-5 h-5 text-amber-600" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
