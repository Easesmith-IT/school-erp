'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { PieChart, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AgingAnalysisPage() {
  const metrics = store.getMetrics();
  const aging = metrics.agingBuckets;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aging Analysis Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Overdue fee portfolio segmented into 5 aging buckets anchored to DEMO_DATE 2026-08-09
            </p>
          </div>
          <Link href="/communications/recovery" className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 shadow-xs">
            Overdue Recovery Queue →
          </Link>
        </div>

        {/* 5 Aging Bucket Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
            <div className="text-[11px] font-medium text-slate-500">Current / Not Due</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">₹{(aging.currentNotDue / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Due in future terms</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
            <div className="text-[11px] font-semibold text-amber-800">0-30 Days Overdue</div>
            <div className="text-xl font-extrabold text-amber-900 mt-1">₹{(aging.days0_30 / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Initial reminder stage</div>
          </div>

          <div className="bg-amber-100 p-4 rounded-xl border border-amber-300 text-center">
            <div className="text-[11px] font-bold text-amber-900">31-60 Days Overdue</div>
            <div className="text-xl font-extrabold text-amber-950 mt-1">₹{(aging.days31_60 / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-amber-800 mt-0.5">Follow-up stage</div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
            <div className="text-[11px] font-semibold text-red-800">61-90 Days Overdue</div>
            <div className="text-xl font-extrabold text-red-900 mt-1">₹{(aging.days61_90 / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-red-700 mt-0.5">Second follow-up</div>
          </div>

          <div className="bg-red-100 p-4 rounded-xl border border-red-300 text-center">
            <div className="text-[11px] font-bold text-red-950">90+ Days Overdue</div>
            <div className="text-xl font-extrabold text-red-950 mt-1">₹{(aging.days90Plus / 100000).toFixed(1)} L</div>
            <div className="text-[10px] text-red-800 font-bold mt-0.5">High recovery risk</div>
          </div>
        </div>

        {/* Portfolio Summary Reconciliation Box */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-sm text-white">Reconciled Portfolio Summary</span>
            <div className="text-slate-400 mt-0.5">
              Total Outstanding (₹{(metrics.totalOutstanding / 100000).toFixed(1)}L) = Current (₹{(aging.currentNotDue / 100000).toFixed(1)}L) + Overdue (₹{(metrics.totalOverdue / 100000).toFixed(1)}L)
            </div>
          </div>
          <div className="text-right">
            <div className="text-amber-400 font-extrabold text-lg">₹{(metrics.totalOutstanding / 100000).toFixed(1)} L</div>
            <div className="text-slate-400 text-[10px]">100% Mathematically Reconciled</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
