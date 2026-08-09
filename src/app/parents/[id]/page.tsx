'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, ArrowLeft, Send, CheckCircle2, AlertTriangle, ShieldCheck, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { parseEntityContext } from '@/lib/context-nav';
import { formatCurrency } from '@/lib/formatters';

export default function ParentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from') || null;
  const navContext = parseEntityContext(fromParam);

  const id = (params?.id as string) || 'parent-raj';

  const parent = store.getParentById(id) || store.getParentById('parent-raj')!;
  const children = store.getStudents().filter((s) => parent.childrenIds.includes(s.id));
  const communications = store.getCommunications().filter((c) => c.parentId === parent.id);

  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const res = await fetch('/api/communications/fee-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: parent.id,
          studentId: children[0]?.id || 'student-aarav',
          amount: parent.familyTotalOutstanding,
          templateType: 'Overdue Fee Notice',
        }),
      });
      const data = await res.json();
      const refId = data.referenceId || `DEMO-NIWA-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setReminderResult(refId);
      store.addCommunication({
        id: `comm-${Date.now()}`,
        schoolId: 'school-1',
        parentId: parent.id,
        parentName: parent.name,
        studentId: children[0]?.id || 'student-aarav',
        studentName: children[0]?.name || 'Aarav Sharma',
        type: 'Overdue Fee',
        recipientPhone: parent.phone,
        template: `Dear ${parent.name}, your total family fee payment of ${formatCurrency(parent.familyTotalOutstanding)} for ${children.map((c) => c.name).join(' & ')} is overdue. Please remit at your earliest convenience.`,
        mode: 'DEMO',
        status: 'SIMULATED',
        referenceId: refId,
        amountMentioned: parent.familyTotalOutstanding,
        createdAt: new Date().toISOString(),
      });
    } catch {
      const refId = `DEMO-NIWA-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setReminderResult(refId);
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Context Origin Banner */}
        {navContext && (
          <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>You came from: <strong>{navContext.name}</strong></span>
            </div>
            <Link href={navContext.backRoute} className="font-semibold text-indigo-700 hover:underline">
              Return to {navContext.name} →
            </Link>
          </div>
        )}

        <button
          onClick={() => router.push('/parents')}
          className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Parent Directory
        </button>

        {/* Parent Hero Card */}
        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{parent.name}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-400 text-emerald-950 font-bold text-xs rounded-full">
                High Reliability Score (86/100)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {parent.phone} • {parent.email} • Parent of <strong className="text-white">{children.map((c) => c.name).join(' & ')}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Payment Reliability</div>
              <div className="text-2xl font-extrabold text-blue-400 mt-0.5">{parent.paymentReliabilityScore} / 100</div>
            </div>

            <button
              onClick={handleSendReminder}
              disabled={sendingReminder}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{sendingReminder ? 'Dispatching NIWA...' : 'Send WhatsApp Reminder'}</span>
            </button>
          </div>
        </div>

        {reminderResult && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 rounded-xl text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-white">NIWA Communication Dispatched!</span>
              <p className="text-[11px] text-emerald-300 mt-0.5">Mode: <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 font-bold">DEMO</span> Status: <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 font-bold">SIMULATED</span> Reference ID: <code className="bg-emerald-900 px-1.5 py-0.5 rounded text-white font-mono">{reminderResult}</code></p>
            </div>
            <Link href="/communications/history" className="text-xs font-semibold text-emerald-400 hover:underline">
              View Audit Log →
            </Link>
          </div>
        )}

        {/* 4 Financial Profile Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Family Total Outstanding</div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">{formatCurrency(parent.familyTotalOutstanding)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Aarav (₹8,500) + Riya (₹10,000)</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500">On-Time Settlement Rate</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{parent.paymentReliabilityBreakdown.onTimeRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">24-month track record</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Avg Release Delay</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{parent.paymentReliabilityBreakdown.averageReleaseDays} Days</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Past invoice due date</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500">Fee Credit Limit</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{formatCurrency(parent.feeCreditEligibility.recommendedAmount)}</div>
            <div className="text-[11px] text-purple-700 font-semibold mt-0.5">Decision-support limit</div>
          </div>
        </div>

        {/* Children Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Enrolled Children ({children.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                  <div className="text-xs text-slate-500">Class {c.className} • Adm #{c.admissionNo}</div>
                  <div className="text-xs font-semibold text-blue-600 mt-1">Score: {c.performanceBreakdown.score} ({c.riskLevel} Risk)</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Student Outstanding Balance</div>
                  <div className="text-lg font-bold text-amber-900">{formatCurrency(c.studentOutstandingFee)}</div>
                  <Link href={`/students/${c.id}?from=parent-${parent.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                    Inspect 360 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24-Month Payment Behavior History */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">24-Month Historical Fee Settlement Track Record</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Term Period</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Release Delay</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parent.familyPaymentHistory.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{h.month}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">{formatCurrency(h.amount)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{h.daysToPay} days past release</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'On-Time' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fee Credit Factors & Communication History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Credit Factors */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Fee Credit Eligibility Factors</h2>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-purple-950">Management Decision-Support Recommendation: {formatCurrency(parent.feeCreditEligibility.recommendedAmount)}</div>
              <p className="text-purple-800 text-[11px]">
                Strong payment consistency and historical settlement behavior support this management decision metric.
              </p>
              <ul className="list-disc list-inside text-purple-900 space-y-1 pt-1">
                {parent.feeCreditEligibility.explanationFactors.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Communication History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Communication Audit History</h2>
            <div className="space-y-2 text-xs">
              {communications.length === 0 ? (
                <div className="text-slate-500 py-4 text-center">No prior communication logs recorded.</div>
              ) : (
                communications.map((comm) => (
                  <div key={comm.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{comm.type}</span>
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded">{comm.mode}</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">{comm.status}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600">{comm.template}</p>
                    <div className="text-[10px] font-mono text-slate-400">Ref: {comm.referenceId}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
