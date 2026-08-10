'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ContextualIntelligence } from '@/components/common/ContextualIntelligence';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex app-bg text-[#172033]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <ContextualIntelligence />
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <div className="animate-[fadeIn_.18s_ease-out]">{children}</div>
        </main>
      </div>
    </div>
  );
}
