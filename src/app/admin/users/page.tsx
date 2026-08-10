'use client';

import React, { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DEMO_USERS } from '@/lib/auth-context';
import { Check, ShieldCheck, Users, X } from 'lucide-react';

const domains = ['Students Directory', 'Student Intelligence', 'Finance', 'Recovery & Communication', 'Teacher Intelligence', 'Administration'];
const access: Record<string, boolean[]> = {
  Principal: [true, true, true, true, true, true],
  Accountant: [true, false, true, true, false, false],
  Teacher: [true, true, false, false, true, false],
  Admin: [true, true, true, true, true, true],
};

export default function UsersRolesPage() {
  const roleCounts = useMemo(() => DEMO_USERS.reduce<Record<string, number>>((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {}), []);
  return <AppShell><div className="max-w-[1500px] mx-auto pb-12 space-y-5">
    <header><div className="text-[11px] uppercase tracking-[0.12em] font-bold text-blue-600 mb-1">Administration / Access Control</div><h1 className="text-2xl font-bold tracking-tight text-[#172033]">Users & Role Access</h1><p className="text-sm text-slate-500 mt-1">Configured identities and the role-based navigation surface currently enforced by the application.</p></header>
    <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">{['Principal', 'Accountant', 'Teacher', 'Admin'].map((role) => <div key={role} className="bg-white rounded-2xl border border-slate-200 p-5"><div className="flex justify-between"><span className="text-xs font-semibold text-slate-500">{role}</span><ShieldCheck className="w-4 h-4 text-blue-600" /></div><div className="text-2xl font-extrabold text-slate-900 mt-2">{roleCounts[role] || 0}</div><div className="text-[11px] text-slate-500 mt-1">configured account{(roleCounts[role] || 0) === 1 ? '' : 's'}</div></div>)}<div className="bg-slate-900 rounded-2xl p-5 text-white"><div className="flex justify-between"><span className="text-xs font-semibold text-slate-300">Total Users</span><Users className="w-4 h-4" /></div><div className="text-2xl font-extrabold mt-2">{DEMO_USERS.length}</div><div className="text-[11px] text-slate-400 mt-1">configured demo identities</div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden"><div className="px-5 py-4 border-b border-slate-100"><h2 className="font-semibold text-[#172033]">Navigation access matrix</h2><p className="text-xs text-slate-500 mt-0.5">Derived from the role filters in the application sidebar. This is navigation visibility, not backend authorization.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500"><tr><th className="p-3">Domain</th>{['Principal', 'Accountant', 'Teacher', 'Admin'].map((r) => <th key={r} className="p-3 text-center">{r}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{domains.map((domain, index) => <tr key={domain}><td className="p-3 font-semibold text-slate-800">{domain}</td>{['Principal', 'Accountant', 'Teacher', 'Admin'].map((role) => <td key={role} className="p-3 text-center">{access[role][index] ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>)}</tr>)}</tbody></table></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4"><h2 className="font-semibold text-[#172033]">Configured accounts</h2><p className="text-xs text-slate-500 mt-0.5">Current demo identities and their assigned roles.</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{DEMO_USERS.map((u) => <div key={u.email} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">{u.name.split(' ').map((n: string) => n[0]).join('')}</div><div><div className="text-sm font-bold text-slate-900">{u.name}</div><div className="text-xs text-slate-500 font-mono">{u.email}</div></div></div><span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{u.role}</span></div>)}</div></section>
  </div></AppShell>;
}
