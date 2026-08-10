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
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Search Bar (Clicking opens Global Search Modal) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 w-80 text-left hover:border-slate-300 transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 truncate">
            Search student, parent, teacher, invoice...
          </span>
          <kbd className="ml-auto bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Right Controls: Role Switcher + Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 px-2 py-0.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Role:</span>
            </div>
            <div className="flex gap-1">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => switchRole(u.role)}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-all ${
                    role === u.role
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {u.role}
                </button>
              ))}
            </div>
          </div>

          {/* Presentation Mode Control */}
          <PresentationMode />

          {/* Demo Reset Control */}
          <DemoResetControl />

          {/* Executive Notifications Bell */}
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors relative"
            title="Executive Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1 right-1"></span>
          </button>

          <div className="h-6 w-px bg-slate-200"></div>

          {/* User Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-semibold flex items-center justify-center text-xs">
              {user?.name.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] font-medium text-slate-500">{user?.role} Access</div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Executive Notifications Drawer */}
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}
