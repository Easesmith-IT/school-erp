'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Award,
  Wallet,
  Receipt,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Building2,
  CalendarCheck,
  BookOpenCheck,
  Trophy,
  Layers,
  TrendingUp,
  BarChart3,
  GitCompare,
  DollarSign,
  PieChart,
  LineChart,
  UserCheck,
  Send,
  History,
  FileText,
  Activity,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/types/schema';

interface SubNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: SubNavItem[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV_CONFIG: NavSection[] = [
  {
    section: 'EXECUTIVE',
    items: [
      { label: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Principal', 'Accountant', 'Teacher', 'Admin'] },
    ],
  },
  {
    section: 'STUDENTS',
    items: [
      { label: 'Students Needing Attention', href: '/students/risk', icon: AlertTriangle, roles: ['Principal', 'Teacher', 'Admin'] },
      {
        label: 'Students Directory',
        href: '/students',
        icon: Users,
        roles: ['Principal', 'Teacher', 'Admin', 'Accountant'],
        subItems: [
          { label: 'Academic Performance', href: '/students/performance', icon: GraduationCap, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Attendance Intelligence', href: '/students/attendance', icon: CalendarCheck, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Class Intelligence', href: '/students/class', icon: Layers, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Assessments', href: '/students/assessments', icon: FileSpreadsheet, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Homework & Work', href: '/students/homework', icon: BookOpenCheck, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Activities & Engagement', href: '/students/activities', icon: Trophy, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Performance Trends', href: '/students/trends', icon: TrendingUp, roles: ['Principal', 'Teacher', 'Admin'] },
        ],
      },
    ],
  },
  {
    section: 'TEACHING',
    items: [
      {
        label: 'Teaching Effectiveness',
        href: '/teachers',
        icon: Award,
        roles: ['Principal', 'Teacher', 'Admin'],
        subItems: [
          { label: 'Rankings & Benchmarks', href: '/teachers/rankings', icon: BarChart3, roles: ['Principal', 'Teacher', 'Admin'] },
          { label: 'Teacher Comparison', href: '/teachers/comparison', icon: GitCompare, roles: ['Principal', 'Admin'] },
        ],
      },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      {
        label: 'Fee Recovery',
        href: '/communications/recovery',
        icon: Send,
        roles: ['Principal', 'Accountant', 'Admin'],
        subItems: [
          { label: 'Financial Overview', href: '/finance/dashboard', icon: Wallet, roles: ['Principal', 'Accountant', 'Admin'] },
          { label: 'Outstanding Portfolio', href: '/finance/outstanding', icon: AlertCircle, roles: ['Principal', 'Accountant'] },
          { label: 'Parent Reliability', href: '/parents', icon: UserCheck, roles: ['Principal', 'Accountant'] },
          { label: 'Aging Analysis', href: '/finance/aging', icon: PieChart, roles: ['Principal', 'Accountant'] },
          { label: 'Payment Records', href: '/finance/payments', icon: Receipt, roles: ['Principal', 'Accountant'] },
          { label: 'Collection Analytics', href: '/finance/analytics', icon: LineChart, roles: ['Principal', 'Accountant'] },
          { label: 'Fee Credit Eligibility', href: '/finance/credit', icon: CreditCard, roles: ['Principal', 'Accountant'] },
          { label: 'Payment Trends', href: '/finance/trends', icon: TrendingUp, roles: ['Principal', 'Accountant'] },
        ],
      },
    ],
  },
  {
    section: 'COMMUNICATION',
    items: [
      {
        label: 'Parent Communication',
        href: '/communications/history',
        icon: History,
        roles: ['Principal', 'Accountant', 'Admin'],
        subItems: [
          { label: 'Fee Reminders', href: '/communications/reminders', icon: MessageSquare, roles: ['Principal', 'Accountant', 'Admin'] },
          { label: 'Reminder Templates', href: '/communications/templates', icon: FileText, roles: ['Principal', 'Accountant', 'Admin'] },
          { label: 'Communication Analytics', href: '/communications/analytics', icon: Activity, roles: ['Principal', 'Accountant', 'Admin'] },
        ],
      },
    ],
  },
  {
    section: 'ADMINISTRATION',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: ShieldCheck, roles: ['Principal', 'Admin'] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nextState: Record<string, boolean> = {};
    NAV_CONFIG.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) => pathname === sub.href);
          const isParentActive = pathname === item.href;
          if (hasActiveSub || isParentActive) {
            nextState[item.href] = true;
          }
        }
      });
    });
    setExpandedItems((prev) => ({ ...prev, ...nextState }));
  }, [pathname]);

  const toggleExpand = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <aside className="w-64 sidebar-bg text-slate-800 flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#DCE4EF]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#DCE4EF] flex items-center gap-3 bg-white/50">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1">
            <span>School Intelligence</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">Springdale International</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {NAV_CONFIG.map((sec) => {
          const visibleItems = sec.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sec.section}>
              <div className="px-3 mb-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {sec.section}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isExactActive = pathname === item.href;
                  const isSubActive = item.subItems?.some((sub) => pathname === sub.href);
                  const isActive = isExactActive || (isSubActive && !isExactActive);
                  const isExpanded = expandedItems[item.href];
                  const Icon = item.icon;

                  return (
                    <div key={item.href} className="space-y-0.5">
                      <div className="flex items-center justify-between group">
                        <Link
                          href={item.href}
                          className={`flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                            isExactActive
                              ? 'bg-[#EEF4FF] text-blue-700 shadow-2xs font-bold'
                              : isActive
                              ? 'bg-[#EEF4FF]/60 text-blue-600 font-semibold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-[#F4F7FB]'
                          }`}
                        >
                          {isExactActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full"></span>
                          )}
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                        {item.subItems && item.subItems.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(item.href, e)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors mr-1"
                            title="Toggle sub-navigation"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Expandable Sub-items */}
                      {item.subItems && isExpanded && (
                        <div className="pl-6 space-y-0.5 pt-0.5 border-l-2 border-slate-200/60 ml-4">
                          {item.subItems
                            .filter((sub) => sub.roles.includes(role))
                            .map((sub) => {
                              const isSubItemActive = pathname === sub.href;
                              const SubIcon = sub.icon;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                    isSubItemActive
                                      ? 'text-blue-700 font-bold bg-[#EEF4FF]'
                                      : 'text-slate-500 hover:text-slate-900 hover:bg-[#F4F7FB]'
                                  }`}
                                >
                                  <SubIcon className={`w-3.5 h-3.5 ${isSubItemActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                  <span className="truncate">{sub.label}</span>
                                </Link>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Product Position Badge */}
      <div className="p-3 border-t border-[#DCE4EF] bg-white/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-medium text-slate-600">Enterprise</span>
        <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-blue-200 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>SaaS v2.0</span>
        </span>
      </div>
    </aside>
  );
}
