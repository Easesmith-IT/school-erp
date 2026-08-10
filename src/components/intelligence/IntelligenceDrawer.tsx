'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  Award,
  CreditCard,
  GraduationCap,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Clock,
  BookOpen,
} from 'lucide-react';
import { store } from '@/lib/store';
import { getTeacherCohortBreakdown } from '@/lib/aggregations';
import { NiwaService } from '@/services/niwa.service';
import { formatCurrency } from '@/lib/formatters';

interface IntelligenceDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onActionCompleted?: (studentId: string) => void;
  isCompleted?: boolean;
}

export function IntelligenceDrawer({
  student,
  isOpen,
  onClose,
  onActionCompleted,
  isCompleted = false,
}: IntelligenceDrawerProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [dispatchState, setDispatchState] = useState<'idle' | 'preparing' | 'sending' | 'completed' | 'error'>('idle');
  const [referenceId, setReferenceId] = useState<string>('');
  const [dispatchError, setDispatchError] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const parent: Parent | undefined = store.getParentById(student.parentId);
  const teacher: Teacher | undefined = store.getTeacherById(student.teacherId);
  const siblings = parent
    ? store.getStudents().filter((s) => parent.childrenIds.includes(s.id))
    : [student];

  const hasCompleted = isCompleted || dispatchState === 'completed';

  const handleDispatchNIWA = async () => {
    if (!parent) return;

    setDispatchState('preparing');
    setDispatchError('');

    setTimeout(async () => {
      setDispatchState('sending');
      try {
        const response = await NiwaService.sendFeeReminder({
          parentId: parent.id,
          studentId: student.id,
          type: 'Overdue Fee',
          customTemplate: `Dear ${parent.name}, Riya's recent attendance (${student.discipline.attendancePercentage}%) and homework completion (${student.discipline.homeworkCompletionPercentage}%) require attention. We would like to discuss an intervention plan regarding your family account (₹${parent.familyTotalOutstanding.toLocaleString('en-IN')} balance).`,
        });

        if (response.success) {
          setReferenceId(response.log.referenceId);
          setDispatchState('completed');
          if (onActionCompleted) {
            onActionCompleted(student.id);
          }
        } else {
          setDispatchState('error');
          setDispatchError('Dispatch failed. Please check network connection.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Execution error';
        setDispatchState('error');
        setDispatchError(msg);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Executive Case Review
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  student.riskLevel === 'High'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {student.riskLevel} RISK
              </span>
            </div>
            <h2 id="drawer-title" className="text-xl font-bold text-white tracking-tight">
              {student.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Class {student.className} • Admission #{student.admissionNo}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
          {/* Section 1: Evidence / Why Flagged */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Why This Student Is Flagged</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Performance</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {student.performanceBreakdown.score}
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-[10px] text-rose-700 font-bold">Attendance</div>
                <div className="text-lg font-black text-rose-950 mt-0.5">
                  {student.discipline.attendancePercentage}%
                </div>
              </div>

              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-[10px] text-rose-700 font-bold">Homework</div>
                <div className="text-lg font-black text-rose-950 mt-0.5">
                  {student.discipline.homeworkCompletionPercentage}%
                </div>
              </div>
            </div>

            {/* Fact -> Interpretation -> Recommendation */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fact</span>
                <p className="text-slate-800 font-medium mt-0.5">
                  Attendance is <strong>{student.discipline.attendancePercentage}%</strong> (below 75% threshold). Homework completion is <strong>{student.discipline.homeworkCompletionPercentage}%</strong>.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Interpretation</span>
                <p className="text-slate-700 mt-0.5">
                  Continued attendance and work completion gaps indicate severe risk of academic disengagement and mark drops.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Management Recommendation</span>
                <p className="text-blue-900 font-semibold mt-0.5">
                  Immediate parent intervention with Raj Sharma & joint academic counseling plan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Connected Family Intelligence (The Wow Moment) */}
          {parent && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Connected Family Intelligence</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Reliability: {parent.paymentReliabilityScore}/100
                </span>
              </div>

              {/* Visual Connected Context Node Tree */}
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-sans mb-1">
                  Connected Relationship Graph
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800 font-bold font-sans text-[11px]">
                    {student.name} ({student.className})
                  </span>
                  <span className="text-slate-500 font-sans">──►</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-white rounded border border-slate-700 font-bold font-sans text-[11px]">
                    {parent.name} (Parent)
                  </span>
                </div>

                <div className="pl-4 border-l-2 border-slate-700 space-y-1.5 my-2">
                  {siblings.map((sib) => (
                    <div key={sib.id} className="flex items-center justify-between text-[11px] bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 font-sans">
                      <span className="font-semibold text-slate-200">{sib.name} ({sib.className})</span>
                      <span className="text-amber-400 font-bold font-mono">{formatCurrency(sib.studentOutstandingFee)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-sans">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Family Total Exposure</span>
                  <span className="text-xs font-black text-amber-400 font-mono">{formatCurrency(parent.familyTotalOutstanding)}</span>
                </div>
              </div>

              <div className="flex items-start justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{parent.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {parent.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {parent.email}</span>
                  </div>
                </div>

                <Link
                  href={`/parents/${parent.id}?from=drawer`}
                  className="text-[11px] font-semibold text-blue-600 hover:underline shrink-0"
                >
                  Parent Profile →
                </Link>
              </div>

              {/* Strict Financial Distinction */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Family Total Outstanding</span>
                  <div className="text-lg font-black text-amber-950 mt-0.5">
                    {formatCurrency(parent.familyTotalOutstanding)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Riya ({formatCurrency(student.studentOutstandingFee)}) + Aarav ({formatCurrency(parent.familyTotalOutstanding - student.studentOutstandingFee)})
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Payment Reliability</span>
                  <div className="text-lg font-black text-blue-950 mt-0.5">
                    {parent.paymentReliabilityBreakdown.onTimeRate}% On-Time
                  </div>
                  <div className="text-[10px] text-blue-800 mt-1 font-medium">
                    {parent.paymentReliabilityBreakdown.averageReleaseDays} Days Avg Release Delay
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Assigned Educator */}
          {teacher && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Assigned Educator</span>
                </div>
                <Link
                  href={`/teachers/${teacher.id}?from=drawer`}
                  className="text-[11px] font-semibold text-purple-600 hover:underline"
                >
                  View Teacher →
                </Link>
              </div>

              <div className="flex items-center justify-between bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{teacher.name}</div>
                  <div className="text-[11px] text-slate-500">{teacher.subject} • Class {teacher.assignedClasses.join(', ')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-purple-700">Rank #{teacher.performanceBreakdown.score > 90 ? '1' : '2'}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    {getTeacherCohortBreakdown(teacher, store.getStudents()).cohortGrowth >= 0 ? '+' : ''}
                    {getTeacherCohortBreakdown(teacher, store.getStudents()).cohortGrowth}% Cohort Growth
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Primary Action Area */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3">
          {hasCompleted ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-950 text-white rounded-xl border border-emerald-700 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">✓ Action Completed</div>
                    <div className="text-[11px] text-emerald-300">
                      Parent {parent?.name || 'Raj Sharma'} contacted via NIWA WhatsApp
                    </div>
                  </div>
                </div>
                {referenceId && (
                  <span className="text-[10px] font-mono bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded border border-emerald-800">
                    {referenceId.slice(0, 15)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/communications/history"
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>View Communication History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDispatchNIWA}
                  disabled={dispatchState === 'preparing' || dispatchState === 'sending'}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {dispatchState === 'preparing'
                      ? 'Preparing message...'
                      : dispatchState === 'sending'
                      ? 'Dispatching via NIWA...'
                      : `CONTACT ${parent?.name.toUpperCase() || 'PARENT'} VIA NIWA`}
                  </span>
                </button>

                {/* Secondary Actions Quiet Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center gap-1 shadow-xs"
                    title="More actions"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1 z-50 text-xs">
                      <Link
                        href={`/students/${student.id}?from=drawer`}
                        onClick={() => setShowMoreMenu(false)}
                        className="block px-3 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-slate-700"
                      >
                        Inspect Student 360
                      </Link>
                      {parent && (
                        <Link
                          href={`/parents/${parent.id}?from=drawer`}
                          onClick={() => setShowMoreMenu(false)}
                          className="block px-3 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-slate-700"
                        >
                          View Parent Profile
                        </Link>
                      )}
                      {teacher && (
                        <Link
                          href={`/teachers/${teacher.id}?from=drawer`}
                          onClick={() => setShowMoreMenu(false)}
                          className="block px-3 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-slate-700"
                        >
                          View Assigned Educator
                        </Link>
                      )}
                      <Link
                        href="/finance/outstanding"
                        onClick={() => setShowMoreMenu(false)}
                        className="block px-3 py-1.5 hover:bg-slate-50 rounded-md font-semibold text-slate-700"
                      >
                        View Financial Exposure
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {dispatchError && (
                <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {dispatchError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
