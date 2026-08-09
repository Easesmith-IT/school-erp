'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import Link from 'next/link';
import { AlertCircle, Send, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatLakhs } from '@/lib/formatters';

export default function OutstandingFeesPage() {
  const parents = useMemo(() => store.getParents().filter((p) => p.familyTotalOutstanding > 0), []);
  const students = useMemo(() => store.getStudents(), []);
  const metrics = useMemo(() => store.getMetrics(), []);
  const aging = metrics.agingBuckets;

  const [activeAging, setActiveAging] = useState<string>('All');

  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      if (activeAging === '0-30') return p.paymentReliabilityBreakdown.averageReleaseDays <= 30;
      if (activeAging === '31-60') return p.paymentReliabilityBreakdown.averageReleaseDays > 30 && p.paymentReliabilityBreakdown.averageReleaseDays <= 60;
      if (activeAging === '61-90') return p.paymentReliabilityBreakdown.averageReleaseDays > 60 && p.paymentReliabilityBreakdown.averageReleaseDays <= 90;
      if (activeAging === '90+') return p.paymentReliabilityBreakdown.averageReleaseDays > 90 || p.familyTotalOutstanding >= 18000;
      return true;
    });
  }, [parents, activeAging]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">Fee Recovery & Aging Workbench</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Outstanding Fees Portfolio</h1>
            <p className="text-xs text-slate-500 mt-0.5">Parents with pending fee balances grouped by aging buckets, reliability scores & recovery priorities.</p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-2xl font-black text-slate-900">{formatLakhs(metrics.totalOutstanding)}</div>
              <div className="text-[10px] text-slate-500 font-medium">Total Outstanding</div>
            </div>
            <div className="pl-4 border-l border-slate-200">
              <div className="text-xl font-bold text-rose-600">{formatLakhs(metrics.totalOverdue)}</div>
              <div className="text-[10px] text-rose-600 font-semibold">Total Overdue</div>
            </div>
          </div>
        </div>

        {/* 3 Summary Distinction Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Outstanding Balance</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatLakhs(metrics.totalOutstanding)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Current ({formatLakhs(aging.currentNotDue)}) + Overdue ({formatLakhs(metrics.totalOverdue)})</div>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Current / Not Yet Overdue</div>
            <div className="text-2xl font-extrabold text-blue-950 mt-1">{formatLakhs(aging.currentNotDue)}</div>
            <div className="text-[11px] text-blue-700 mt-0.5">Invoices with future due dates</div>
          </div>

          <div className="bg-rose-50 p-5 rounded-xl border border-rose-200">
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Overdue (Past Due Date)</div>
            <div className="text-2xl font-extrabold text-rose-950 mt-1">{formatLakhs(metrics.totalOverdue)}</div>
            <div className="text-[11px] text-rose-700 mt-0.5">0-30: ₹8.0L • 31-60: ₹9.0L • 61-90: ₹6.8L • 90+: ₹6.0L</div>
          </div>
        </div>

        {/* Aging Bucket Filter Tabs */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
          {['All', '0-30', '31-60', '61-90', '90+'].map((bucket) => (
            <button
              key={bucket}
              onClick={() => setActiveAging(bucket)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeAging === bucket
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {bucket === 'All' ? 'All Aging Buckets' : `${bucket} Days Overdue`}
            </button>
          ))}
        </div>

        {/* Parents Outstanding Workbench Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Outstanding Accounts Workbench ({filteredParents.length})</h2>
            <span className="text-xs text-slate-500 font-medium">Click parent name for individual student balances</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Parent Name</th>
                  <th className="p-3">Enrolled Children</th>
                  <th className="p-3 text-right">Reliability Score</th>
                  <th className="p-3 text-right">Avg Release Delay</th>
                  <th className="p-3 text-right">Family Total Outstanding</th>
                  <th className="p-3 text-center">Recovery Priority</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredParents.slice(0, 35).map((p) => {
                  const parentChildren = students.filter((s) => p.childrenIds.includes(s.id));
                  const priorityLevel =
                    p.familyTotalOutstanding >= 18000
                      ? 'CRITICAL'
                      : p.familyTotalOutstanding >= 12000
                      ? 'HIGH'
                      : p.familyTotalOutstanding >= 6000
                      ? 'MODERATE'
                      : 'NORMAL';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        <Link href={`/parents/${p.id}?from=outstanding`} className="hover:text-blue-600">
                          {p.name}
                        </Link>
                      </td>
                      <td className="p-3 text-slate-600">
                        {parentChildren.map((c) => (
                          <div key={c.id} className="text-[11px]">
                            {c.name} ({c.className}): <strong className="text-slate-800">{formatCurrency(c.studentOutstandingFee)}</strong>
                          </div>
                        ))}
                      </td>
                      <td className="p-3 text-right font-extrabold text-blue-600">{p.paymentReliabilityScore} / 100</td>
                      <td className="p-3 text-right text-slate-700">{p.paymentReliabilityBreakdown.averageReleaseDays} days</td>
                      <td className="p-3 text-right font-bold text-rose-700 text-sm">
                        {formatCurrency(p.familyTotalOutstanding)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          priorityLevel === 'CRITICAL'
                            ? 'bg-rose-900 text-white'
                            : priorityLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : priorityLevel === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {priorityLevel}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/parents/${p.id}?from=outstanding`}
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" /> NIWA WhatsApp
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
