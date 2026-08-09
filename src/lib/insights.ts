import { Student, Teacher, Parent, FeeInvoice, PaymentRecord, DashboardMetrics } from '@/types/schema';
import {
  getSchoolAttendanceSummary,
  getTotalOverdue,
  getAgingBreakdown,
  getClassPerformanceSummary,
} from './aggregations';
import { formatLakhs, formatCrores } from './formatters';

export type InsightType =
  | 'STUDENT_RISK'
  | 'ATTENDANCE'
  | 'ACADEMIC'
  | 'TEACHER'
  | 'FINANCIAL'
  | 'OVERDUE'
  | 'RECOVERY'
  | 'PARENT_PAYMENT'
  | 'CLASS_PERFORMANCE';

export interface Insight {
  id: string;
  type: InsightType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  whyItMatters: string;
  sourceEntityType?: 'Student' | 'Parent' | 'Teacher' | 'Class' | 'Finance';
  sourceEntityId?: string;
  actionLabel: string;
  actionRoute: string;
  factText: string;
  interpretationText: string;
}

export interface SchoolHealthOverview {
  academicScore: number;
  attendanceScore: number;
  financialScore: number; // collection rate
  riskStatus: string;
  teacherPerformanceScore: number;
  academicNote: string;
  attendanceNote: string;
  financialNote: string;
  riskNote: string;
  teacherNote: string;
}

export function getSchoolHealthOverview(
  students: Student[],
  teachers: Teacher[],
  metrics: DashboardMetrics
): SchoolHealthOverview {
  const avgTeacherPerf = teachers.length
    ? Number((teachers.reduce((acc, t) => acc + t.performanceBreakdown.score, 0) / teachers.length).toFixed(1))
    : 84.2;

  const atRiskCount = students.filter((s) => s.riskLevel !== 'Low').length;

  return {
    academicScore: metrics.avgPerformance, // 78.6%
    attendanceScore: metrics.avgAttendance, // 91.8%
    financialScore: metrics.collectionRate, // 77.0%
    riskStatus: atRiskCount > 50 ? 'Attention Required' : 'Healthy',
    teacherPerformanceScore: avgTeacherPerf,
    academicNote: 'Current academic term average score',
    attendanceNote: 'Current school attendance average',
    financialNote: 'Fee collection rate reconciled to date',
    riskNote: `${atRiskCount} students currently flagged for academic/discipline risk`,
    teacherNote: `Average teacher performance index across ${teachers.length} faculty members`,
  };
}

export function getManagementInsights(
  students: Student[],
  teachers: Teacher[],
  parents: Parent[],
  invoices: FeeInvoice[],
  payments: PaymentRecord[],
  metrics: DashboardMetrics
): Insight[] {
  const insights: Insight[] = [];

  // 1. High Risk Students Insight (e.g., Riya Sharma)
  const highRiskStudents = students.filter((s) => s.riskLevel === 'High');
  const dualRiskCount = students.filter(
    (s) => s.discipline.attendancePercentage < 75 && s.discipline.homeworkCompletionPercentage < 60
  ).length;

  insights.push({
    id: 'insight-student-risk',
    type: 'STUDENT_RISK',
    severity: 'HIGH',
    title: `${metrics.studentsAtRiskCount} students require academic attention`,
    description: `${dualRiskCount} students show both attendance and homework deterioration.`,
    whyItMatters:
      'Combined attendance and homework decline is the single highest predictor of academic failure and term retention loss.',
    actionLabel: 'Review At-Risk Students',
    actionRoute: '/students/risk',
    factText: `${dualRiskCount} students have attendance < 75% and homework completion < 60%.`,
    interpretationText: 'Multiple intervention indicators are active. Immediate coordinator check required.',
  });

  // 2. Overdue Fees Aging Insight
  const aging = getAgingBreakdown(invoices);
  const overdueLakhs = (metrics.totalOverdue / 100000).toFixed(1);
  const ninetyPlusLakhs = (aging.days90Plus / 100000).toFixed(1);

  insights.push({
    id: 'insight-aging-overdue',
    type: 'OVERDUE',
    severity: 'HIGH',
    title: `₹${ninetyPlusLakhs}L in 90+ day overdue fee bucket`,
    description: `Total overdue balance stands at ₹${overdueLakhs}L across all fee terms.`,
    whyItMatters:
      'Fees in the 90+ day aging bucket have a 64% lower natural recovery rate without structured management intervention.',
    actionLabel: 'Review Recovery Queue',
    actionRoute: '/finance/aging',
    factText: `₹${ninetyPlusLakhs}L is 90+ days past due date out of ₹${overdueLakhs}L total overdue.`,
    interpretationText: 'This is the highest-risk financial aging segment requiring executive recovery workflow.',
  });

  // 3. Class 8-A Performance & Growth
  const classSummaries = getClassPerformanceSummary(students);
  const class8A = classSummaries.find((c) => c.className === 'Class 8-A' || c.className === '8-A');
  if (class8A) {
    insights.push({
      id: 'insight-class-8a-growth',
      type: 'CLASS_PERFORMANCE',
      severity: 'LOW',
      title: 'Class 8-A has improved +8.4% this term',
      description: `Class 8-A average score reached ${class8A.avgPerformance}% with ${class8A.avgAttendance}% attendance.`,
      whyItMatters:
        'Targeted math problem-set completion and proactive teacher follow-up led to measurable score growth.',
      actionLabel: 'Explore Class 8-A',
      actionRoute: '/students/class?from=class-8a',
      factText: 'Class 8-A cohort performance score increased by +8.4% over baseline.',
      interpretationText: 'Class cohort strategy is outperforming school average benchmark.',
    });
  }

  // 4. Priya Sharma Faculty Insight
  const priya = teachers.find((t) => t.name === 'Priya Sharma');
  if (priya) {
    insights.push({
      id: 'insight-teacher-priya',
      type: 'TEACHER',
      severity: 'LOW',
      title: "Priya Sharma's cohort improved +11.4%",
      description: `Priya Sharma holds Performance Index ${priya.performanceBreakdown.score} (Rank #1).`,
      whyItMatters:
        'Priya Sharma’s structured homework verification model is driving student improvement across Class 8-A and 8-B.',
      actionLabel: 'View Teacher #1 Analysis',
      actionRoute: `/teachers/${priya.id}`,
      factText: 'Teacher Priya Sharma leads school with 91.4 Performance Index and +11.4% cohort growth.',
      interpretationText: 'Faculty peer benchmark for academic outcome delivery.',
    });
  }

  // 5. Parent Recovery Case Insight (Raj Sharma)
  const raj = parents.find((p) => p.name === 'Raj Sharma');
  if (raj) {
    insights.push({
      id: 'insight-parent-raj-recovery',
      type: 'RECOVERY',
      severity: 'MEDIUM',
      title: '28 fee cases require active recovery action',
      description: `Includes Raj Sharma (₹${(raj.familyTotalOutstanding / 1000).toFixed(1)}k family outstanding, 86 Reliability).`,
      whyItMatters:
        'Raj Sharma has strong payment reliability (86/100) and historical compliance. A friendly reminder will release funds prompt.',
      actionLabel: 'Open Recovery Workflow',
      actionRoute: '/communications/recovery',
      factText: 'Raj Sharma family has ₹18,500 outstanding with 82% historical on-time rate.',
      interpretationText: 'High-reliability parent with temporary delay. Ideal candidate for WhatsApp workflow.',
    });
  }

  return insights;
}

export function getExecutivePriorityQueue(
  students: Student[],
  teachers: Teacher[],
  parents: Parent[],
  metrics: DashboardMetrics
) {
  const aging = getAgingBreakdown([]);
  return [
    {
      id: 'prio-1',
      severity: 'HIGH' as const,
      title: `₹${(metrics.totalOverdue / 100000).toFixed(1)}L Total Overdue Fees`,
      subtitle: `₹${(metrics.agingBuckets.days90Plus / 100000).toFixed(1)}L in 90+ day critical overdue bucket`,
      actionLabel: 'Review Recovery',
      actionRoute: '/finance/aging',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'prio-2',
      severity: 'HIGH' as const,
      title: `${metrics.studentsAtRiskCount} Students Require Academic Attention`,
      subtitle: `${metrics.highRiskCount} High Risk, ${metrics.mediumRiskCount} Medium Risk students flagged`,
      actionLabel: 'Review Risk',
      actionRoute: '/students/risk',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'prio-3',
      severity: 'MEDIUM' as const,
      title: '3 Faculty Members Below Target Threshold',
      subtitle: 'Students needing attention in assigned cohorts require coordinator review',
      actionLabel: 'Review Teachers',
      actionRoute: '/teachers',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'prio-4',
      severity: 'MEDIUM' as const,
      title: '28 Overdue Cases Awaiting WhatsApp Follow-up',
      subtitle: 'NIWA communication dispatch queue ready for execution',
      actionLabel: 'Open Recovery',
      actionRoute: '/communications/recovery',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
  ];
}

export function getPrincipalMorningBrief(
  students: Student[],
  teachers: Teacher[],
  parents: Parent[],
  metrics: DashboardMetrics
) {
  return {
    goodNews: [
      {
        id: 'gn-1',
        text: 'Class 8-A improved +8.4% this term, reaching an average academic score of 81.4%.',
        route: '/students/class',
      },
      {
        id: 'gn-2',
        text: "Priya Sharma's student cohort demonstrated +11.4% improvement, ranking #1 among faculty.",
        route: '/teachers/teacher-1',
      },
      {
        id: 'gn-3',
        text: 'Fee collections reached ₹1.42 Cr (77.0% overall collection rate reconciled).',
        route: '/finance/dashboard',
      },
    ],
    attention: [
      {
        id: 'att-1',
        text: `${metrics.studentsAtRiskCount} students require academic/attendance intervention (${metrics.highRiskCount} High Risk).`,
        route: '/students/risk',
      },
      {
        id: 'att-2',
        text: `₹${(metrics.agingBuckets.days90Plus / 100000).toFixed(1)}L is currently past 90+ days overdue out of ₹${(metrics.totalOverdue / 100000).toFixed(1)}L overdue total.`,
        route: '/finance/aging',
      },
      {
        id: 'att-3',
        text: 'Riya Sharma (Admission #1088) exhibits 68% attendance and 54% homework completion.',
        route: '/students/student-riya',
      },
    ],
    todayActions: [
      {
        id: 'act-1',
        title: 'Review High-Risk Students',
        description: 'Conduct coordinator review for 27 students with dual attendance & homework decline.',
        route: '/students/risk',
      },
      {
        id: 'act-2',
        title: 'Execute Fee Recovery Dispatches',
        description: 'Dispatch WhatsApp reminders via NIWA for 28 high-priority overdue cases.',
        route: '/communications/recovery',
      },
      {
        id: 'act-3',
        title: 'Review Teacher Exceptions',
        description: 'Check support plan for faculty members with at-risk cohorts.',
        route: '/teachers',
      },
    ],
  };
}
