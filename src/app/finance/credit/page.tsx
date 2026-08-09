'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import Link from 'next/link';
import { CreditCard, Sparkles, CheckCircle2, ArrowUpRight, ShieldCheck, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function FeeCreditEligibilityPage() {
  const parents = useMemo(() => store.getParents(), []);
  const raj = parents.find((p) => p.name === 'Raj Sharma') || parents[0];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Management Decision-Support Tool
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Credit Eligibility</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Derived fee credit limit recommendations based on historical settlement behavior and parent reliability scores.
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
            Internal Decision-Support Only
          </span>
        </div>

        {/* Disclaimer Callout Box */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-950">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Policy & Compliance Disclaimer:</strong>
            <span>
              Fee credit recommendations represent internal <strong>management decision-support suggestions</strong> based on parent payment reliability algorithms.
              This metric is <strong>never</strong> a loan approval, credit product, or guaranteed financial credit.
            </span>
          </div>
        </div>

        {/* Hero Parent Raj Sharma Credit Spotlight */}
        {raj && (
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Featured Family Profile</span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">{raj.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Parent of Aarav Sharma (Class 8-A) & Riya Sharma (Class 8-A)</p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Recommended Fee Credit</div>
                <div className="text-3xl font-black text-indigo-400 mt-0.5">{formatCurrency(raj.feeCreditEligibility.recommendedAmount)}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Decision Factor: High Historical Compliance</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="text-slate-400 font-medium">Reliability Score</div>
                <div className="text-lg font-extrabold text-blue-400 mt-0.5">{raj.paymentReliabilityScore} / 100</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="text-slate-400 font-medium">On-Time Rate</div>
                <div className="text-lg font-extrabold text-emerald-400 mt-0.5">{raj.paymentReliabilityBreakdown.onTimeRate}%</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="text-slate-400 font-medium">Average Release Delay</div>
                <div className="text-lg font-extrabold text-amber-400 mt-0.5">{raj.paymentReliabilityBreakdown.averageReleaseDays} days</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <div className="text-slate-400 font-medium">Family Outstanding</div>
                <div className="text-lg font-extrabold text-rose-400 mt-0.5">{formatCurrency(raj.familyTotalOutstanding)}</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Link
                href={`/parents/${raj.id}?from=credit`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Raj Sharma Parent 360</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Fee Credit Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Parents Fee Credit Recommendations</h2>
            <span className="text-xs text-slate-500 font-medium">{parents.length} Evaluated Parents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Parent Name</th>
                  <th className="p-3 text-right">Reliability Score</th>
                  <th className="p-3 text-right">On-Time Rate</th>
                  <th className="p-3 text-right">Avg Release Delay</th>
                  <th className="p-3 text-right">Recommended Fee Credit</th>
                  <th className="p-3">Decision Factors</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parents.slice(0, 30).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <Link href={`/parents/${p.id}`} className="hover:text-blue-600">{p.name}</Link>
                    </td>
                    <td className="p-3 text-right font-extrabold text-blue-600">{p.paymentReliabilityScore} / 100</td>
                    <td className="p-3 text-right text-slate-800">{p.paymentReliabilityBreakdown.onTimeRate}%</td>
                    <td className="p-3 text-right text-slate-600">{p.paymentReliabilityBreakdown.averageReleaseDays} days</td>
                    <td className="p-3 text-right font-black text-indigo-600 text-sm">
                      {formatCurrency(p.feeCreditEligibility.recommendedAmount)}
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {p.feeCreditEligibility.explanationFactors.slice(0, 2).join(' • ')}
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/parents/${p.id}?from=credit`}
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        Parent Detail <ArrowUpRight className="w-3 h-3" />
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
