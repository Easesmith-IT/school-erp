'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Building2, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedEmail, setSelectedEmail] = useState('principal@school.demo');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(selectedEmail)) {
      const user = DEMO_USERS.find((u) => u.email === selectedEmail);
      if (user?.role === 'Accountant') {
        router.push('/finance/dashboard');
      } else if (user?.role === 'Teacher') {
        router.push('/students');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-800">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center text-white border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">School Intelligence Platform</h1>
          <p className="text-xs text-slate-400 mt-1">Executive management intelligence for modern schools</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Demo Role Persona
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_USERS.map((u) => (
                <div
                  key={u.email}
                  onClick={() => setSelectedEmail(u.email)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedEmail === u.email
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {u.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.role} Persona</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {selectedEmail === u.email && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {u.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
            >
              <span>Launch School Intelligence Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          Springdale International School • Demo Presentation Mode
        </div>
      </div>
    </div>
  );
}
