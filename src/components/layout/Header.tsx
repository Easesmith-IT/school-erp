'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { Bell, Search, Shield } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { DemoResetControl } from '@/components/common/DemoResetControl';
import { PresentationMode } from '@/components/common/PresentationMode';

export function Header() {
  const { user, role, switchRole } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 surface-glass border-b border-slate-200/90 px-4 sm:px-5 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
        <button
          onClick={() => setIsSearchOpen(true)}
          aria-label="Open global search"
          className="group flex items-center gap-2 text-slate-400 bg-white/75 px-3 py-1.5 rounded-lg border border-slate-200/90 w-[min(20rem,48vw)] text-left hover:border-blue-200 hover:bg-white transition-all shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
          <span className="text-xs text-slate-500 truncate">Search student, parent, teacher, invoice...</span>
          <kbd className="ml-auto hidden sm:inline-flex bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md text-[10px] font-mono">Ctrl+K</kbd>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 bg-white/75 p-1 rounded-lg border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 px-2 py-0.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Role</span>
            </div>
            <div className="flex gap-1">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => switchRole(u.role)}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-all ${
                    role === u.role
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {u.role}
                </button>
              ))}
            </div>
          </div>

          <PresentationMode />
          <DemoResetControl />

          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Open executive notifications"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all relative"
            title="Executive Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.name.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] font-medium text-slate-500">{user?.role} Access</div>
            </div>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}
