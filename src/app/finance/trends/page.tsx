'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PaymentTrendsPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payment Behaviour Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              24-month longitudinal payment release delay trends & on-time settlement migration
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">24-Month On-Time Settlement Rate Trend</h2>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Overall On-Time Fee Settlement Rate</span>
              <span className="text-emerald-600">82.4% Average</span>
            </div>
            <p className="text-slate-500">
              Parent payment behavior exhibits highest compliance during Q1 term releases (85%), with average payment release delays peaking at 38 days during Q3 mid-terms.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
