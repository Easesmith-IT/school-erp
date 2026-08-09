'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, User, Users, GraduationCap, Receipt, Sparkles } from 'lucide-react';
import { store } from '@/lib/store';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    parents: any[];
    teachers: any[];
    invoices: any[];
  }>({ students: [], parents: [], teachers: [], invoices: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(store.globalSearch(query));
    } else {
      setResults({ students: [], parents: [], teachers: [], invoices: [] });
    }
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results.students.length > 0 ||
    results.parents.length > 0 ||
    results.teachers.length > 0 ||
    results.invoices.length > 0;

  const quickSearches = [
    { label: 'Aarav Sharma', query: 'Aarav', desc: 'Hero Student 8-A' },
    { label: 'Riya Sharma', query: 'Riya', desc: 'High-Risk Student' },
    { label: 'Raj Sharma', query: 'Raj', desc: 'Hero Parent' },
    { label: 'Priya Sharma', query: 'Priya', desc: 'Rank #1 Teacher' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, parents, teachers, invoices..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {query.trim().length < 2 ? (
            <div className="space-y-4 py-4">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Sales Presentation Quick Lookups</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSearches.map((qs) => (
                  <button
                    key={qs.label}
                    onClick={() => setQuery(qs.query)}
                    className="p-3 bg-slate-800/80 hover:bg-blue-900/40 border border-slate-700 rounded-lg text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300">{qs.label}</div>
                      <div className="text-[10px] text-slate-400">{qs.desc}</div>
                    </div>
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Search →
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-center pt-4 text-slate-500 text-xs">
                Type student name, parent phone, teacher subject, or invoice number...
              </div>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No canonical entities found matching &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Students */}
              {results.students.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> Students ({results.students.length})
                  </div>
                  <div className="space-y-1">
                    {results.students.map((s) => (
                      <Link
                        key={s.id}
                        href={`/students/${s.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-900/30 border border-slate-700/50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{s.name}</div>
                          <div className="text-[11px] text-slate-400">Class {s.className} • Adm #{s.admissionNo}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-blue-400">{s.performanceBreakdown.score} Score</div>
                          <div className="text-[10px] text-slate-400">{s.discipline.attendancePercentage}% Att</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Parents */}
              {results.parents.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Parents ({results.parents.length})
                  </div>
                  <div className="space-y-1">
                    {results.parents.map((p) => (
                      <Link
                        key={p.id}
                        href={`/parents/${p.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-emerald-900/30 border border-slate-700/50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400">{p.phone} • {p.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">{p.paymentReliabilityScore}/100 Score</div>
                          <div className="text-[10px] text-slate-400">Outstanding ₹{p.familyTotalOutstanding.toLocaleString('en-IN')}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers */}
              {results.teachers.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Teachers ({results.teachers.length})
                  </div>
                  <div className="space-y-1">
                    {results.teachers.map((t) => (
                      <Link
                        key={t.id}
                        href={`/teachers/${t.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-purple-900/30 border border-slate-700/50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{t.name}</div>
                          <div className="text-[11px] text-slate-400">{t.subject} • Assigned Classes: {t.assignedClasses.join(', ')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-purple-400">Index {t.performanceBreakdown.score}</div>
                          <div className="text-[10px] text-slate-400">{t.studentCount} Students</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {results.invoices.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" /> Fee Invoices ({results.invoices.length})
                  </div>
                  <div className="space-y-1">
                    {results.invoices.map((inv) => (
                      <Link
                        key={inv.id}
                        href="/finance/payments"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-amber-900/30 border border-slate-700/50 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{inv.invoiceNo} — {inv.studentName}</div>
                          <div className="text-[11px] text-slate-400">{inv.feeType} • Parent: {inv.parentName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-400">₹{inv.amountDue.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-amber-300 font-semibold">{inv.status}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-500 flex justify-between">
          <span>Press <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> to close</span>
          <span>Press <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">Ctrl+K</kbd> to toggle</span>
        </div>
      </div>
    </div>
  );
}
