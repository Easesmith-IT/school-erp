'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import Link from 'next/link';

export default function PaymentRecordsPage() {
  const invoices = store.getInvoices();
  const payments = store.getPayments();
  const [viewTab, setViewTab] = useState<'Invoices' | 'Payments'>('Invoices');

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-blue-600 mb-1">Financial Intelligence</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Invoices & Payment Records</h1>
            <p className="text-xs text-slate-500 mt-0.5">Complete audit log of 7,488 fee invoices and 7,233 payment transactions.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewTab('Invoices')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${viewTab === 'Invoices' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Fee Invoices (7,488)
            </button>
            <button
              onClick={() => setViewTab('Payments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${viewTab === 'Payments' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              Payments (7,233)
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          {viewTab === 'Invoices' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Parent</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Fee Type</th>
                    <th className="p-3 text-right">Amount Due</th>
                    <th className="p-3 text-right">Amount Paid</th>
                    <th className="p-3 text-right">Outstanding</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.slice(0, 12).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600 font-bold">{inv.invoiceNo}</td>
                      <td className="p-3 font-bold text-slate-900">
                        <Link href={`/students/${inv.studentId}`} className="hover:text-blue-600">{inv.studentName}</Link>
                      </td>
                      <td className="p-3 text-slate-700">
                        <Link href={`/parents/${inv.parentId}`} className="hover:text-blue-600">{inv.parentName}</Link>
                      </td>
                      <td className="p-3 text-slate-600">{inv.className}</td>
                      <td className="p-3 text-slate-600">{inv.feeType}</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{inv.amountDue.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">₹{inv.amountPaid.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-amber-900">₹{inv.outstandingBalance.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-500">{inv.dueDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Parent</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Fee Type</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.slice(0, 12).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600 font-bold">{p.receiptNo}</td>
                      <td className="p-3 font-bold text-slate-900">{p.studentName}</td>
                      <td className="p-3 text-slate-700">{p.parentName}</td>
                      <td className="p-3 text-slate-600">{p.className}</td>
                      <td className="p-3 text-slate-600">{p.feeType}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-600">{p.paymentMethod}</td>
                      <td className="p-3 text-slate-500">{p.paymentDate}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
