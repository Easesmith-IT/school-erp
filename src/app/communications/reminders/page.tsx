'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

import { DomainNavTabs } from '@/components/common/DomainNavTabs';

export default function FeeRemindersDashboardPage() {
  const communications = store.getCommunications();

  const commTabs = [
    { label: 'Fee Reminders', href: '/communications/reminders' },
    { label: 'Overdue Recovery Queue', href: '/communications/recovery' },
    { label: 'Communication History', href: '/communications/history' },
    { label: 'Reminder Templates', href: '/communications/templates' },
    { label: 'Analytics', href: '/communications/analytics' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Reminders Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              NIWA WhatsApp communication control center for fee notices & recovery
            </p>
          </div>
          <Link href="/communications/recovery" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 shadow-xs">
            Overdue Recovery Queue →
          </Link>
        </div>

        {/* Domain Navigation Tabs */}
        <DomainNavTabs tabs={commTabs} />

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Messages Sent</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">1,284</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Canonical total</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Delivered</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">1,201</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">93.5% Delivery Rate</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Pending Delivery</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">48</div>
            <div className="text-[11px] text-slate-500 mt-0.5">In transit</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Failed / Retried</div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">35</div>
            <div className="text-[11px] text-red-700 font-semibold mt-0.5">2.7% Failed rate</div>
          </div>
        </div>

        {/* Recent Communication Log Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Communication History</h2>
            <Link href="/communications/history" className="text-xs font-semibold text-blue-600 hover:underline">
              View All History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Parent Name</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Message Type</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {communications.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.parentName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.studentName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{c.type}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{c.mode}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-blue-600">{c.referenceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
