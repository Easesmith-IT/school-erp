'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Send, AlertCircle, DollarSign, CheckCircle2, ShieldAlert, X, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function OverdueRecoveryQueuePage() {
  const parents = store.getParents().filter((p) => p.familyTotalOutstanding > 0);
  const metrics = store.getMetrics();

  const [activeStage, setActiveStage] = useState<'All' | 'Upcoming' | 'Reminder Sent' | 'First Follow-up' | 'Second Follow-up' | 'Escalated'>('All');
  
  // NIWA Confirmation Modal State
  const [selectedParent, setSelectedParent] = useState<{
    id: string;
    name: string;
    amount: number;
    phone: string;
    studentName: string;
  } | null>(null);

  const [dispatching, setDispatching] = useState(false);
  const [dispatchedMap, setDispatchedMap] = useState<Record<string, string>>({});

  const handleOpenModal = (parentId: string, parentName: string, amount: number, phone: string, studentName: string) => {
    setSelectedParent({ parentId, name: parentName, amount, phone, studentName } as any);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedParent) return;

    setDispatching(true);
    try {
      const res = await fetch('/api/communications/fee-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: selectedParent.id,
          amount: selectedParent.amount,
          templateType: 'Overdue Fee Notice',
        }),
      });
      const data = await res.json();
      const ref = data.referenceId || `DEMO-NIWA-${Math.floor(10000000 + Math.random() * 90000000)}`;

      setDispatchedMap((prev) => ({ ...prev, [selectedParent.id]: ref }));
      store.addCommunication({
        id: `comm-${Date.now()}`,
        schoolId: 'school-1',
        parentId: selectedParent.id,
        parentName: selectedParent.name,
        studentId: 'student-aarav',
        studentName: selectedParent.studentName || 'Aarav Sharma',
        type: 'Overdue Fee',
        recipientPhone: selectedParent.phone,
        template: `Dear ${selectedParent.name}, your total family fee payment of ₹${selectedParent.amount.toLocaleString('en-IN')} is overdue. Please settle via NIWA link.`,
        mode: 'DEMO',
        status: 'SIMULATED',
        referenceId: ref,
        amountMentioned: selectedParent.amount,
        createdAt: new Date().toISOString(),
      });
    } catch {
      const fallbackRef = 'DEMO-NIWA-98214309';
      setDispatchedMap((prev) => ({ ...prev, [selectedParent.id]: fallbackRef }));
    } finally {
      setDispatching(false);
      setSelectedParent(null);
    }
  };

  const stages = ['All', 'Upcoming', 'Reminder Sent', 'First Follow-up', 'Second Follow-up', 'Escalated'] as const;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overdue Fee Recovery Workflow</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Stage-based recovery queue with 1-click NIWA WhatsApp communication dispatch
            </p>
          </div>
          <Link href="/communications/history" className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800">
            View Audit Log →
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Total Overdue Portfolio</div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">₹{(metrics.totalOverdue / 100000).toFixed(1)} L</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Past invoice due dates</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Overdue Family Accounts</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{parents.length} Parents</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active recovery cases</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">90+ Days Exposure</div>
            <div className="text-2xl font-extrabold text-red-900 mt-1">₹{(metrics.agingBuckets.days90Plus / 100000).toFixed(1)} L</div>
            <div className="text-[11px] text-red-700 font-bold mt-0.5">High recovery risk</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">High Priority Accounts</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {parents.filter((p) => p.familyTotalOutstanding >= 15000).length}
            </div>
            <div className="text-[11px] text-amber-800 font-semibold mt-0.5">₹15,000+ outstanding</div>
          </div>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {stages.map((st) => (
            <button
              key={st}
              onClick={() => setActiveStage(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeStage === st ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Recovery Queue Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Parent Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Reliability</th>
                  <th className="py-2.5 px-3">Overdue Balance</th>
                  <th className="py-2.5 px-3">Aging Status</th>
                  <th className="py-2.5 px-3">NIWA Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.slice(0, 10).map((p) => {
                  const ref = dispatchedMap[p.id];
                  const isRaj = p.id === 'parent-raj';

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 ${isRaj ? 'bg-amber-50/50' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {isRaj && <span className="text-[10px] font-bold text-amber-800">Parent of Aarav & Riya</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{p.phone}</td>
                      <td className="py-3 px-3 font-bold text-blue-600">{p.paymentReliabilityScore}/100</td>
                      <td className="py-3 px-3 font-extrabold text-amber-900 text-sm">₹{p.familyTotalOutstanding.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-full">
                          {isRaj ? '91 Days Overdue' : 'Overdue'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {ref ? (
                          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Dispatched ({ref.slice(0, 14)})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(p.id, p.name, p.familyTotalOutstanding, p.phone, isRaj ? 'Aarav & Riya Sharma' : 'Student')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send WhatsApp Reminder</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* NIWA Dispatch Confirmation Modal */}
        {selectedParent && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-2xl overflow-hidden space-y-4">
              <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Send Fee Reminder via NIWA</h3>
                </div>
                <button onClick={() => setSelectedParent(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">Parent Name:</span> <strong className="text-slate-900">{selectedParent.name}</strong></div>
                  <div><span className="text-slate-500">Phone Contact:</span> <strong className="text-slate-900 font-mono">{selectedParent.phone}</strong></div>
                  <div><span className="text-slate-500">Family Outstanding:</span> <strong className="text-amber-900 font-bold">₹{selectedParent.amount.toLocaleString('en-IN')}</strong></div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">WhatsApp Message Content:</span>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-950 font-mono text-[11px]">
                    Dear {selectedParent.name}, your total family fee payment of ₹{selectedParent.amount.toLocaleString('en-IN')} for {selectedParent.studentName} is overdue. Please settle via NIWA link: https://niwa.school.demo/pay
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedParent(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDispatch}
                  disabled={dispatching}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{dispatching ? 'Dispatching via NIWA...' : 'Send via NIWA'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
