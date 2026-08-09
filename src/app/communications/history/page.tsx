'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { History, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/formatters';

export default function CommunicationHistoryPage() {
  const communications = useMemo(() => store.getCommunications(), []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Communication Audit & Dispatch History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete longitudinal audit log of NIWA messaging dispatches, reminders & notices
            </p>
          </div>
          <Link
            href="/communications/recovery"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open Recovery Queue</span>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">NIWA Audit Log ({communications.length} Dispatches)</h2>
            <span className="text-xs text-slate-500 font-medium">Reconciled Audit History</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Parent</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Message Type</th>
                  <th className="py-2.5 px-3">Template / Content</th>
                  <th className="py-2.5 px-3 text-center">Mode</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 font-mono">Reference ID</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {communications.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <Link href={`/parents/${c.parentId}?from=history`} className="hover:text-blue-600">
                        {c.parentName}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      <Link href={`/students/${c.studentId}?from=history`} className="hover:text-blue-600">
                        {c.studentName}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">{c.type}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{c.template}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.mode === 'LIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {c.mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'DELIVERED' || c.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : c.status === 'SIMULATED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-600">{c.referenceId}</td>
                    <td className="py-2.5 px-3 text-right text-[11px] text-slate-400">{formatDate(c.createdAt)}</td>
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
