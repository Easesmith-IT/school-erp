'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { LineChart, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function CollectionAnalyticsPage() {
  const metrics = store.getMetrics();

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Collection Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Efficiency benchmarks, payment release distribution & partial settlement analytics
            </p>
          </div>
        </div>

        {/* 3 Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Collection Efficiency</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.collectionRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">₹1.42 Cr collected / ₹1.843 Cr expected</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Average Payment Delay</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">28.4 Days</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Past invoice due date</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Partial Payment Rate</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">12.5%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Installment settlements</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
