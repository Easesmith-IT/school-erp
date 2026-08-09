'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function ReminderTemplatesPage() {
  const templates = [
    {
      id: 'tmpl-1',
      name: 'Upcoming Fee Notice',
      trigger: '7 Days Before Due Date',
      content: 'Dear {ParentName}, Q2 Tuition fee notice of ₹{Amount} for {StudentName} is due on {DueDate}. Settle via link: {Link}',
      status: 'Active',
    },
    {
      id: 'tmpl-2',
      name: 'Overdue Fee Notice',
      trigger: '1 Day After Due Date',
      content: 'Dear {ParentName}, fee payment of ₹{Amount} for {StudentName} is overdue. Please remit at your earliest convenience.',
      status: 'Active',
    },
    {
      id: 'tmpl-3',
      name: 'Fee Credit Facility Offer',
      trigger: 'High Reliability Score (80+)',
      content: 'Dear {ParentName}, based on your strong payment reliability (86/100), you are eligible for ₹30,000 fee credit facility.',
      status: 'Active',
    },
    {
      id: 'tmpl-4',
      name: 'PTM & Academic Progress Alert',
      trigger: 'Academic Dip / Term PTM',
      content: 'Dear {ParentName}, PTM for Class {Class} is scheduled for 15 Aug 2026. Please attend to review {StudentName} progress.',
      status: 'Active',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reminder Templates Library</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Approved WhatsApp message templates for automated & manual NIWA dispatch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h2 className="font-bold text-slate-900 text-sm">{tmpl.name}</h2>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  {tmpl.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">Trigger Rule: <strong className="text-slate-800">{tmpl.trigger}</strong></div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
                {tmpl.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
