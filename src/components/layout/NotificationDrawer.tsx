'use client';

import React from 'react';
import Link from 'next/link';
import { X, AlertCircle, TrendingDown, DollarSign, Award, Bell } from 'lucide-react';
import { store } from '@/lib/store';
import { INTELLIGENCE_CONFIG } from '@/lib/config/intelligence-config';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  if (!isOpen) return null;

  const metrics = store.getMetrics();
  const students = store.getStudents();
  const teachers = store.getTeachers();
  const atRiskStudents = students.filter((s) => s.riskLevel !== 'Low');
  const highPriorityParents = store.getParents().filter((p) => p.familyTotalOutstanding >= INTELLIGENCE_CONFIG.RECOVERY_HIGH_VALUE_THRESHOLD);

  const sortedTeachers = [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);
  const topTeacher = sortedTeachers[0];
  const belowTargetCount = teachers.filter((t) => t.performanceBreakdown.score < INTELLIGENCE_CONFIG.TEACHER_TARGET_THRESHOLD).length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Bell className="w-4 h-4 text-blue-400" />
          <span>Executive Alerts</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alerts Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Alert 1: Students Needing Attention */}
        <Link
          href="/students/risk"
          onClick={onClose}
          className="block p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-200">
                {atRiskStudents.length} Students Require Attention
              </div>
              <div className="text-[11px] text-amber-400/80 mt-1">
                {metrics.highRiskCount} High Risk, {metrics.mediumRiskCount} Medium Risk flagged across classes.
              </div>
            </div>
          </div>
        </Link>

        {/* Alert 2: Overdue Recovery */}
        <Link
          href="/communications/recovery"
          onClick={onClose}
          className="block p-3 rounded-lg bg-red-950/40 border border-red-800/50 hover:bg-red-900/40 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <DollarSign className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-red-200">
                ₹{(metrics.totalOverdue / 100000).toFixed(1)}L Fees Overdue
              </div>
              <div className="text-[11px] text-red-400/80 mt-1">
                ₹{(metrics.agingBuckets.days90Plus / 100000).toFixed(1)}L is 90+ days overdue across {highPriorityParents.length} high-priority family accounts.
              </div>
            </div>
          </div>
        </Link>

        {/* Alert 3: Teacher Review */}
        <Link
          href="/teachers"
          onClick={onClose}
          className="block p-3 rounded-lg bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/40 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-blue-200">
                {belowTargetCount} Faculty Members Below Target
              </div>
              <div className="text-[11px] text-blue-400/80 mt-1">
                {topTeacher ? `${topTeacher.name} leads with ${topTeacher.performanceBreakdown.score} Index. ` : ''}
                {belowTargetCount} teachers require academic improvement reviews.
              </div>
            </div>
          </div>
        </Link>

        {/* Alert 4: Homework Completion Dip */}
        <Link
          href="/students/homework"
          onClick={onClose}
          className="block p-3 rounded-lg bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/40 transition-colors"
        >
          <div className="flex items-start gap-2.5">
            <TrendingDown className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-purple-200">
                Homework Completion Review
              </div>
              <div className="text-[11px] text-purple-400/80 mt-1">
                Discipline indicators tracked across all registered class sections.
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
