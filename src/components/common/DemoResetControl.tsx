'use client';

import React, { useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { store } from '@/lib/store';

export function DemoResetControl() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = () => {
    setResetting(true);
    setTimeout(() => {
      store.resetDemo();
      setResetting(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
      window.location.reload();
    }, 400);
  };

  return (
    <button
      onClick={handleReset}
      disabled={resetting}
      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
      title="Resets local demo activity & logs without altering canonical seed data"
    >
      {done ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-bold">Demo Reset!</span>
        </>
      ) : (
        <>
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
        </>
      )}
    </button>
  );
}
