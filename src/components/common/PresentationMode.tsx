'use client';

import React, { useState } from 'react';
import { Play, ChevronRight, X, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export interface StoryStep {
  route: string;
  title: string;
  subtitle: string;
  hint: string;
}

export interface PresentationStory {
  id: string;
  title: string;
  tagline: string;
  steps: StoryStep[];
}

export const DEMO_STORIES: PresentationStory[] = [
  {
    id: 'story-academic',
    title: 'Story A — Academic Intelligence',
    tagline: 'From school-wide health to high-risk student, class context & teacher performance',
    steps: [
      {
        route: '/dashboard',
        title: 'Executive Dashboard',
        subtitle: 'School Health & High Risk Alerts',
        hint: 'Start with the school-wide health signals (Academic, Attendance & Financial collection rate). Identify High Risk Alerts requiring intervention.',
      },
      {
        route: '/students/risk',
        title: 'Student Risk Intelligence',
        subtitle: '2D Risk Matrix & Intervention Queue',
        hint: 'Review the Risk Matrix. Locate Riya Sharma in the Low Discipline / Low Performance (CRITICAL) quadrant.',
      },
      {
        route: '/students/student-riya?from=risk',
        title: 'Riya Sharma — Student 360',
        subtitle: 'Score Driver Breakdown & Risk Explanation',
        hint: 'Inspect Riya Sharma’s profile. Notice why she is flagged HIGH RISK (Low Attendance and Homework completion).',
      },
      {
        route: '/students/class?from=student-riya',
        title: 'Class 8-A Intelligence',
        subtitle: 'Class Health & Multi-Class Comparison',
        hint: 'Bridge Riya to her class section (Class 8-A). Review class cohort growth and assigned educator Priya Sharma.',
      },
      {
        route: '/teachers/teacher-1?from=class-8A',
        title: 'Priya Sharma — Teacher Profile',
        subtitle: 'Rank #1 Performance Index & "Why #1" Analysis',
        hint: 'Understand why Priya Sharma ranks #1. Review her 35/25/15/10/10/5 weighted model breakdown.',
      },
    ],
  },
  {
    id: 'story-financial',
    title: 'Story B — Financial Intelligence',
    tagline: 'From total school exposure to aging risk, parent payment behavior & fee credit limits',
    steps: [
      {
        route: '/dashboard',
        title: 'Executive Dashboard',
        subtitle: 'Financial Exposure Metrics',
        hint: 'Examine school-wide financial reconciliation: Collected ₹1.42 Cr, Outstanding ₹42.3L, Overdue ₹29.8L (77.0% Collection Rate).',
      },
      {
        route: '/finance/dashboard',
        title: 'Financial Command Center',
        subtitle: 'Collection Velocity & Payment Methods',
        hint: 'Review operational collection trends and payment method distribution across online portals, UPI, and bank transfers.',
      },
      {
        route: '/finance/aging',
        title: 'Aging Bucket Analysis',
        subtitle: 'Current vs Overdue Aging Schedule',
        hint: 'Inspect overdue aging buckets: Current ₹12.5L, 0-30d ₹8.0L, 31-60d ₹9.0L, 61-90d ₹6.8L, 90+d ₹6.0L (CRITICAL).',
      },
      {
        route: '/finance/outstanding',
        title: 'Outstanding Fees Portfolio',
        subtitle: 'Parent Recovery Priorities',
        hint: 'Locate Raj Sharma (Parent of Aarav & Riya). Note separation of Aarav (₹8,500) + Riya (₹10,000) = Family Total (₹18,500).',
      },
      {
        route: '/parents/parent-raj?from=outstanding',
        title: 'Raj Sharma — Parent 360',
        subtitle: 'Reliability Score (86/100) & 24-Month History',
        hint: 'Evaluate Raj Sharma’s reliability factors (82% On-time rate, 38d release delay) and 24-month payment history.',
      },
      {
        route: '/finance/credit?from=parent-raj',
        title: 'Fee Credit Eligibility',
        subtitle: 'Management Decision-Support Recommendation',
        hint: 'Review recommended Fee Credit limit of ₹30,000 for Raj Sharma based on high historical compliance (Not a loan approval).',
      },
    ],
  },
  {
    id: 'story-recovery',
    title: 'Story C — Recovery Automation',
    tagline: 'From overdue exposure to NIWA WhatsApp dispatch & audit history log',
    steps: [
      {
        route: '/finance/outstanding',
        title: 'Outstanding Workbench',
        subtitle: 'Recovery Case Selection',
        hint: 'Identify Raj Sharma’s family overdue balance (₹18,500) with CRITICAL priority badge.',
      },
      {
        route: '/communications/recovery',
        title: 'Recovery Kanban Board',
        subtitle: 'Pipeline Stages & NIWA Dispatch',
        hint: 'Locate Raj Sharma in the Recovery Queue. Click "Send WhatsApp Reminder" to launch the NIWA confirmation modal sequence.',
      },
      {
        route: '/parents/parent-raj?from=recovery',
        title: 'Raj Sharma — WhatsApp Dispatch',
        subtitle: 'NIWA WhatsApp Confirmation & Dispatch',
        hint: 'Dispatch the simulated WhatsApp notice via NIWA. Note reference ID generation (Mode: DEMO, Status: SIMULATED).',
      },
      {
        route: '/communications/history',
        title: 'Communication Audit History',
        subtitle: 'Audit Log Verification',
        hint: 'Verify that the newly dispatched NIWA communication immediately appears at the top of the audit log.',
      },
    ],
  },
];

export function PresentationMode() {
  const router = useRouter();
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('story-academic');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dismissedHint, setDismissedHint] = useState(false);

  const activeStory = DEMO_STORIES.find((s) => s.id === selectedStoryId) || DEMO_STORIES[0];
  const currentStep = activeStory.steps[currentStepIndex] || activeStory.steps[0];

  const handleStartPresentation = (storyId: string) => {
    setSelectedStoryId(storyId);
    setCurrentStepIndex(0);
    setIsActive(true);
    setDismissedHint(false);
    const firstStory = DEMO_STORIES.find((s) => s.id === storyId) || DEMO_STORIES[0];
    router.push(firstStory.steps[0].route);
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeStory.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setDismissedHint(false);
      router.push(activeStory.steps[nextIndex].route);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setDismissedHint(false);
      router.push(activeStory.steps[prevIndex].route);
    }
  };

  if (!isActive) {
    return (
      <div className="relative group">
        <button
          onClick={() => handleStartPresentation('story-academic')}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Guided Sales Demo</span>
        </button>

        {/* Dropdown menu for selecting specific stories */}
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xl p-2 hidden group-hover:block z-50 text-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Select Sales Story</div>
          {DEMO_STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => handleStartPresentation(story.id)}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 transition-colors flex items-center justify-between text-slate-200 hover:text-white"
            >
              <span>{story.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Header Presentation Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-6 py-2 sticky top-14 z-40 shadow-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-extrabold rounded uppercase tracking-wider">
            Presentation Mode
          </span>

          <select
            value={selectedStoryId}
            onChange={(e) => handleStartPresentation(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs font-bold focus:outline-none"
          >
            {DEMO_STORIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-semibold text-[11px]">
            Step <strong className="text-white">{currentStepIndex + 1}</strong> of <strong>{activeStory.steps.length}</strong>: {currentStep.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentStepIndex > 0 && (
            <button
              onClick={handlePrevStep}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-colors"
            >
              ← Prev
            </button>
          )}

          {currentStepIndex < activeStory.steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors inline-flex items-center gap-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[11px] font-bold">
              Story Complete ✓
            </span>
          )}

          <button
            onClick={() => setIsActive(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
            title="Exit Presentation Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dismissible Presenter Hint Banner */}
      {!dismissedHint && currentStep.hint && (
        <div className="max-w-7xl mx-auto px-6 mt-3">
          <div className="bg-indigo-950/90 border border-indigo-700/80 text-indigo-100 p-3 rounded-xl shadow-md flex items-start justify-between gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-white uppercase text-[10px] tracking-wider block mb-0.5">
                  Presenter Takeaway — {currentStep.subtitle}
                </strong>
                <span>{currentStep.hint}</span>
              </div>
            </div>
            <button
              onClick={() => setDismissedHint(true)}
              className="text-indigo-300 hover:text-white text-[11px] font-semibold underline shrink-0"
            >
              Dismiss Hint
            </button>
          </div>
        </div>
      )}
    </>
  );
}
