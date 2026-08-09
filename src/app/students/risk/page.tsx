'use client';

import React, { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, X, User, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import {
  getRiskDistribution,
  getRiskReasonDistribution,
  getInterventionQueue,
} from '@/lib/aggregations';

type WorkflowStatus = 'New' | 'Under Review' | 'Intervention Planned' | 'Monitoring' | 'Resolved';

export default function StudentRiskIntelligencePage() {
  const students = useMemo(() => store.getStudents(), []);
  const parents = useMemo(() => store.getParents(), []);
  const teachers = useMemo(() => store.getTeachers(), []);

  const riskDist = useMemo(() => getRiskDistribution(students), [students]);
  const reasonDist = useMemo(() => getRiskReasonDistribution(students), [students]);
  const baseQueue = useMemo(() => getInterventionQueue(students), [students]);

  // Local workflow status tracking
  const [statuses, setStatuses] = useState<Record<string, WorkflowStatus>>({
    'student-riya': 'Under Review',
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleStatusChange = (studentId: string, newStatus: WorkflowStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: newStatus }));
  };

  const activeCaseStudent = useMemo(() => {
    if (!selectedCaseId) return null;
    return students.find((s) => s.id === selectedCaseId) || null;
  }, [selectedCaseId, students]);

  const activeCaseParent = useMemo(() => {
    if (!activeCaseStudent?.parentId) return null;
    return parents.find((p) => p.id === activeCaseStudent.parentId) || null;
  }, [activeCaseStudent, parents]);

  const activeCaseTeacher = useMemo(() => {
    if (!activeCaseStudent) return null;
    return teachers.find((t) => t.assignedClasses.includes(activeCaseStudent.className)) || teachers[0];
  }, [activeCaseStudent, teachers]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Risk Intelligence & Intervention Queue</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Operational early warning queue identifying academic decline, attendance drops & homework gaps across {students.length} students
            </p>
          </div>
        </div>

        {/* Risk Distribution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-rose-50 p-5 rounded-xl border border-rose-200">
            <div className="flex items-center justify-between text-rose-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">High Risk Cohort</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-900">{riskDist.high}</div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">Requires immediate intervention (Includes Riya Sharma)</div>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Medium Risk Cohort</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-900">{riskDist.medium}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Under active coordinator monitoring</div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Healthy / Low Risk Cohort</span>
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-900">{riskDist.low}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">Consistent attendance & homework</div>
          </div>
        </div>

        {/* Risk Reasons Breakdown Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Primary Risk Reason Drivers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {reasonDist.map((rd) => (
              <div key={rd.reason} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500 font-medium text-[11px]">{rd.reason}</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{rd.count} students</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Intervention Queue Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Operational Intervention Queue ({baseQueue.length})</h2>
            <span className="text-xs font-semibold text-rose-600">Click any row to open Intervention Detail modal</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-2">Class</th>
                  <th className="py-2.5 px-2 text-center">Score</th>
                  <th className="py-2.5 px-2 text-center">Att %</th>
                  <th className="py-2.5 px-2 text-center">HW %</th>
                  <th className="py-2.5 px-3">Primary Risk Reason</th>
                  <th className="py-2.5 px-3">Recommended Intervention</th>
                  <th className="py-2.5 px-3 text-center">Workflow Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {baseQueue.map((item) => {
                  const currentStatus = statuses[item.studentId] || 'New';

                  return (
                    <tr
                      key={item.studentId}
                      onClick={() => setSelectedCaseId(item.studentId)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <span className="hover:text-blue-600">{item.studentName}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-medium">{item.className}</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900">{item.performance}</td>
                      <td className={`py-3 px-2 text-center font-semibold ${item.attendance < 75 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.attendance}%
                      </td>
                      <td className={`py-3 px-2 text-center font-semibold ${item.homework < 60 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.homework}%
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[160px] truncate">{item.primaryReason}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-semibold">
                          {item.recommendedAction}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(item.studentId, e.target.value as WorkflowStatus)}
                          className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[11px] font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Intervention Planned">Intervention Planned</option>
                          <option value="Monitoring">Monitoring</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/students/${item.studentId}?from=risk`}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect 360</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Intervention Detail Modal */}
      {activeCaseStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Risk Case Detail</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{activeCaseStudent.name}</h3>
                <p className="text-xs text-slate-500">Class {activeCaseStudent.className} • Admission #{activeCaseStudent.admissionNo}</p>
              </div>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Performance Score</div>
                <div className="text-xl font-extrabold text-blue-600 mt-0.5">{activeCaseStudent.performanceBreakdown.score}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Attendance Rate</div>
                <div className="text-xl font-extrabold text-rose-600 mt-0.5">{activeCaseStudent.discipline.attendancePercentage}%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-slate-500 font-medium">Homework Completion</div>
                <div className="text-xl font-extrabold text-rose-600 mt-0.5">{activeCaseStudent.discipline.homeworkCompletionPercentage}%</div>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-950">
              <div className="font-bold flex items-center gap-1.5 uppercase text-[11px]">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Primary Evidence & Trigger Signals
              </div>
              <p className="text-rose-900">
                Attendance rate ({activeCaseStudent.discipline.attendancePercentage}%) and homework completion ({activeCaseStudent.discipline.homeworkCompletionPercentage}%) fall below acceptable thresholds.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium">Assigned Teacher</div>
                <div className="font-bold text-slate-900">{activeCaseTeacher?.name || 'Priya Sharma'}</div>
                <div className="text-[11px] text-slate-500">{activeCaseTeacher?.subject || 'Mathematics'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium">Parent Contact</div>
                <div className="font-bold text-slate-900">{activeCaseParent?.name || 'Raj Sharma'}</div>
                <div className="text-[11px] text-slate-500">{activeCaseParent?.phone || '+91 98765 43210'}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-200">
              <Link
                href={`/students/${activeCaseStudent.id}?from=risk`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <span>Open Full Student 360</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedCaseId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
