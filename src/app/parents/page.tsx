'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Users, DollarSign, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function ParentPaymentDirectoryPage() {
  const parents = store.getParents();
  const highRel = parents.filter((p) => p.paymentReliabilityScore >= 80).length;
  const medRel = parents.filter((p) => p.paymentReliabilityScore >= 65 && p.paymentReliabilityScore < 80).length;
  const lowRel = parents.filter((p) => p.paymentReliabilityScore < 65).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Parent Payment Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Directory of ~850 parent accounts categorized by payment reliability & fee credit eligibility
            </p>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">High Reliability (80-100)</div>
            <div className="text-3xl font-extrabold text-emerald-950 mt-1">{highRel} Parents</div>
            <div className="text-[11px] text-emerald-700 mt-1">Eligible for ₹30,000 Fee Credit</div>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medium Reliability (65-79)</div>
            <div className="text-3xl font-extrabold text-amber-950 mt-1">{medRel} Parents</div>
            <div className="text-[11px] text-amber-700 mt-1">Eligible for ₹15,000 Fee Credit</div>
          </div>

          <div className="bg-red-50 p-5 rounded-xl border border-red-200">
            <div className="text-xs font-bold text-red-800 uppercase tracking-wider">Low Reliability (&lt;65)</div>
            <div className="text-3xl font-extrabold text-red-950 mt-1">{lowRel} Parents</div>
            <div className="text-[11px] text-red-700 mt-1">High recovery follow-up priority</div>
          </div>
        </div>

        {/* Parent Directory Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Parent Reliability Directory</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Parent Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Reliability Score</th>
                  <th className="py-2.5 px-3">On-Time %</th>
                  <th className="py-2.5 px-3">Avg Delay</th>
                  <th className="py-2.5 px-3">Family Outstanding</th>
                  <th className="py-2.5 px-3">Credit Limit</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.slice(0, 10).map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50 ${p.id === 'parent-raj' ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 text-slate-500">{p.phone}</td>
                    <td className="py-3 px-3 font-extrabold text-blue-600">{p.paymentReliabilityScore}/100</td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">{p.paymentReliabilityBreakdown.onTimeRate}%</td>
                    <td className="py-3 px-3 text-slate-700">{p.paymentReliabilityBreakdown.averageReleaseDays} days</td>
                    <td className="py-3 px-3 font-bold text-amber-900">₹{p.familyTotalOutstanding.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-semibold text-purple-600">₹{p.feeCreditEligibility.recommendedAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <Link href={`/parents/${p.id}`} className="text-blue-600 font-semibold hover:underline">
                        Profile
                      </Link>
                    </td>
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
