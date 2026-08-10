'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import Link from 'next/link';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/formatters';
import { ArrowUpRight, CreditCard, MoreHorizontal, UserCheck } from 'lucide-react';

import { DomainNavTabs } from '@/components/common/DomainNavTabs';

export default function StudentsDirectoryPage() {
  const students = useMemo(() => store.getStudents(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  const studentTabs = [
    { label: 'Students Directory', href: '/students', badge: students.length },
    { label: 'Risk & Intervention', href: '/students/risk', badge: 84 },
    { label: 'Academic Performance', href: '/students/performance' },
    { label: 'Assessments', href: '/students/assessments' },
    { label: 'Attendance', href: '/students/attendance' },
    { label: 'Homework & Completion', href: '/students/homework' },
    { label: 'Activities & Engagement', href: '/students/activities' },
    { label: 'Class Intelligence', href: '/students/class' },
    { label: 'Trends', href: '/students/trends' },
  ];

  const classList = [
    { label: 'All Classes', value: 'ALL' },
    { label: 'Class 8-A', value: '8-A' },
    { label: 'Class 8-B', value: '8-B' },
    { label: 'Class 5-A', value: '5-A' },
    { label: 'Class 6-A', value: '6-A' },
    { label: 'Class 7-A', value: '7-A' },
    { label: 'Class 9-A', value: '9-A' },
    { label: 'Class 10-A', value: '10-A' },
    { label: 'Class 11-A', value: '11-A' },
    { label: 'Class 12-A', value: '12-A' },
  ];

  const riskOptions = [
    { label: 'All Risk Levels', value: 'ALL' },
    { label: 'High Risk', value: 'High' },
    { label: 'Medium Risk', value: 'Medium' },
    { label: 'Low Risk', value: 'Low' },
  ];

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.includes(searchTerm) ||
        s.className.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'ALL' || s.className === selectedClass || s.classId === selectedClass || s.className.includes(selectedClass);
      const matchesRisk = selectedRisk === 'ALL' || s.riskLevel === selectedRisk;
      return matchesSearch && matchesClass && matchesRisk;
    });
  }, [students, searchTerm, selectedClass, selectedRisk]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClass('ALL');
    setSelectedRisk('ALL');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Student Directory & Operational Register
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive registry of 1,248 enrolled students with performance scores, discipline, and parent links.
            </p>
          </div>
          <div className="text-xs text-slate-700 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {students.length.toLocaleString('en-IN')} Total Enrolled Scholars
          </div>
        </div>

        {/* Domain Navigation Tabs */}
        <DomainNavTabs tabs={studentTabs} />

        {/* FilterBar */}
        <FilterBar
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search student name, admission #, or class section..."
          filters={[
            {
              key: 'class',
              label: 'Class',
              options: classList,
              value: selectedClass,
              onChange: setSelectedClass,
            },
            {
              key: 'risk',
              label: 'Risk Level',
              options: riskOptions,
              value: selectedRisk,
              onChange: setSelectedRisk,
            },
          ]}
          onClearAll={handleClearFilters}
        />

        {/* Student Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{Math.min(50, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> matching students
            </span>
            {selectedClass !== 'ALL' && <span className="font-semibold text-blue-600">Filtered by Class {selectedClass}</span>}
          </div>

          {filteredStudents.length === 0 ? (
            <EmptyState
              title="No students match active filters"
              description="No student records matched your search query or selected class/risk filter criteria."
              actionLabel="Clear all filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Adm No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-2">Class</th>
                    <th className="py-2.5 px-2 text-right">Performance Score</th>
                    <th className="py-2.5 px-2 text-right">Attendance</th>
                    <th className="py-2.5 px-2 text-right">Homework</th>
                    <th className="py-2.5 px-3">Risk Status</th>
                    <th className="py-2.5 px-3">Student Fee Bal</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.slice(0, 50).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600 font-bold">#{s.admissionNo}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <Link href={`/students/${s.id}?from=directory`} className="hover:text-blue-600">
                          {s.name}
                        </Link>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">{s.className}</td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-blue-600">
                        {s.performanceBreakdown.score}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-800 font-semibold">{s.discipline.attendancePercentage}%</td>
                      <td className="py-2.5 px-2 text-right text-slate-800 font-semibold">{s.discipline.homeworkCompletionPercentage}%</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.riskLevel === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : s.riskLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {s.riskLevel} Risk
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">
                        {formatCurrency(s.studentOutstandingFee)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/students/${s.id}?from=directory`}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <span>360</span> <ArrowUpRight className="w-3 h-3" />
                          </Link>
                          {s.parentId && (
                            <Link
                              href={`/parents/${s.parentId}?from=directory`}
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                              title="Inspect Parent Profile"
                            >
                              Parent
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
