'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { store } from '@/lib/store';
import { Trophy, Award, Star } from 'lucide-react';
import Link from 'next/link';

export default function ActivitiesEngagementPage() {
  const students = store.getStudents();
  const avgParticipation = Number(
    (students.reduce((acc, s) => acc + s.engagement.activityParticipation, 0) / (students.length || 1)).toFixed(1)
  );
  const avgCompetition = Number(
    (students.reduce((acc, s) => acc + s.engagement.competitionParticipation, 0) / (students.length || 1)).toFixed(1)
  );
  const highlyEngaged = students.filter((s) => s.engagement.activityParticipation >= 80).length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Activities & Engagement Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Co-curricular, ECA, Olympiads & Inter-school competition tracking
            </p>
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Participation Rate</span>
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{avgParticipation}%</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Target &ge;75%</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Competition Rate</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600">{avgCompetition}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Zonal & State level</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-600">Highly Engaged Students</span>
              <Star className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{highlyEngaged}</div>
            <div className="text-[11px] text-slate-500 mt-1">Leaderboard cohort</div>
          </div>
        </div>

        {/* Student Achievements Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Recent ECA Achievements</h2>
          <div className="space-y-3">
            {students.slice(0, 5).map((s) => (
              <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{s.name} ({s.className})</div>
                  <div className="text-slate-500">{s.activities[0]?.title || 'Annual Sports Day'} • {s.activities[0]?.level || 'School'} Level</div>
                </div>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded text-[11px]">
                  {s.activities[0]?.achievement || 'Gold Medalist'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
