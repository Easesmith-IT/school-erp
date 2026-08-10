'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface DomainTab {
  label: string;
  href: string;
  badge?: string | number;
}

interface DomainNavTabsProps {
  tabs: DomainTab[];
}

export function DomainNavTabs({ tabs }: DomainNavTabsProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Section navigation" className="sticky top-0 z-20 -mx-1 px-1 py-2 mb-5 overflow-x-auto scrollbar-none surface-glass border-b border-slate-200/80">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
