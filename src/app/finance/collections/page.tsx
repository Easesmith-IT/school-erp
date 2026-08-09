'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { DollarSign, Receipt, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function FeeCollectionsStreamPage() {
  const payments = store.getPayments();

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Collections Stream</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time payment receipt log derived from 7,233 canonical transaction records
            </p>
          </div>
        </div>

        {/* Collection Stream Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Today&apos;s Collection (2026-08-09)</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹4.82 L</div>
            <div className="text-[11px] text-slate-500 mt-0.5">34 receipts generated</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">This Week&apos;s Collection</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">₹26.4 L</div>
            <div className="text-[11px] text-slate-500 mt-0.5">188 receipts processed</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Collected (YTD)</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹1.42 Cr</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">77.0% Collection Rate</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Payment Transactions Feed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Parent</th>
                  <th className="py-2.5 px-3">Fee Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.receiptNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.studentName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.parentName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.feeType}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.paymentDate}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {p.status}
                      </span>
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
