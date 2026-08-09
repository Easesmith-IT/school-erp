'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DEMO_USERS } from '@/lib/auth-context';
import { ShieldCheck, UserCheck } from 'lucide-react';

export default function UsersRolesPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-blue-600 mb-1">Administration</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users & Role Access</h1>
            <p className="text-xs text-slate-500 mt-0.5">Configured demo accounts and system role-based sidebar access control.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEMO_USERS.map((u) => (
              <div key={u.email} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                    {u.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
