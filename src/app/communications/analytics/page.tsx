'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Activity, Send } from 'lucide-react';

export default function CommunicationAnalyticsPage() {
  const communications = store.getCommunications();

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Communication Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dispatch volume, delivery rate, simulated vs live mode breakdown
            </p>
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Messages Sent</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">1,284</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Canonical total</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Delivery Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">93.5%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">High delivery compliance</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Failed Rate</div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">2.7%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Invalid numbers / retry queue</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
