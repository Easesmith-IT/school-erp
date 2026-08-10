'use client';

import React, { useState } from 'react';
import { Download, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { store } from '@/lib/store';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ExportModal({ isOpen, onClose, title = 'Analytical Dataset' }: ExportModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const students = store.getStudents();
    const headers = ['Admission No', 'Name', 'Class', 'Performance Score', 'Risk Level', 'Attendance %', 'Homework %', 'Outstanding Fee'];
    const rows = students.map((s) => [
      s.admissionNo,
      `"${s.name}"`,
      `"${s.className}"`,
      s.performanceBreakdown.score,
      s.riskLevel,
      s.discipline.attendancePercentage,
      s.discipline.homeworkCompletionPercentage,
      s.studentOutstandingFee,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `school_intelligence_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Prepared</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-2">
          <p>
            The canonical data export for <span className="font-semibold text-white">{title}</span> has been formatted for executive review.
          </p>
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Format: CSV / XLSX</div>
            <div>Records: 1,248 Students / Canonical Collections</div>
            <div>Generated: 2026-08-09T17:00:00.000Z</div>
          </div>
        </div>

        {downloaded ? (
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Export Generated Successfully!</span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Export</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
