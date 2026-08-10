import { Student, Teacher, Parent, FeeInvoice, PaymentRecord, DashboardMetrics } from '@/types/schema';
import {
  getSchoolAttendanceSummary,
  getTotalOverdue,
  getAgingBreakdown,
  getClassPerformanceSummary,
} from './aggregations';
import { formatLakhs, formatCrores } from './formatters';
import { DEMO_DATE, INTELLIGENCE_CONFIG } from './config/intelligence-config';

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
    : 0;

  const atRiskCount = students.filter((s) => s.riskLevel !== 'Low').length;

  return {
    academicScore: metrics.avgPerformance,
    attendanceScore: metrics.avgAttendance,
    financialScore: metrics.collectionRate,
    riskStatus: atRiskCount > 50 ? 'Attention Required' : 'Healthy',
    teacherPerformanceScore: avgTeacherPerf,
    academicNote: 'Current academic term average score across all enrolled students',
    attendanceNote: 'Current school-wide attendance average percentage',
    financialNote: 'Fee collection rate reconciled against total expected fees',
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
  const demoTime = new Date(DEMO_DATE).getTime();

  // 1. High Risk Students Insight
  const dualRiskCount = students.filter(
    (s) =>
      s.discipline.attendancePercentage < INTELLIGENCE_CONFIG.ATTENDANCE_RISK_THRESHOLD &&
      s.discipline.homeworkCompletionPercentage < INTELLIGENCE_CONFIG.HOMEWORK_RISK_THRESHOLD
  ).length;

  insights.push({
    id: 'insight-student-risk',
    type: 'STUDENT_RISK',
    severity: 'HIGH',
    title: `${metrics.studentsAtRiskCount} students require academic attention`,
    description: `${dualRiskCount} students show dual attendance and homework completion decline.`,
    whyItMatters:
      'Students exhibiting simultaneous attendance and homework completion decline display multiple active intervention indicators.',
    actionLabel: 'Review At-Risk Students',
    actionRoute: '/students/risk',
    factText: `${dualRiskCount} students have attendance < ${INTELLIGENCE_CONFIG.ATTENDANCE_RISK_THRESHOLD}% and homework completion < ${INTELLIGENCE_CONFIG.HOMEWORK_RISK_THRESHOLD}%.`,
    interpretationText: 'Multiple intervention indicators are active. Immediate coordinator review recommended.',
    sourceEntityType: 'Student',
  });

  // 2. Overdue Fees Aging Insight
  const aging = getAgingBreakdown(invoices, DEMO_DATE);
  const overdueLakhs = (metrics.totalOverdue / 100000).toFixed(1);
  const ninetyPlusLakhs = (aging.days90Plus / 100000).toFixed(1);

  insights.push({
    id: 'insight-aging-overdue',
    type: 'OVERDUE',
    severity: 'HIGH',
    title: `₹${ninetyPlusLakhs}L in 90+ day overdue fee bucket`,
    description: `Total overdue balance stands at ₹${overdueLakhs}L across all fee terms.`,
    whyItMatters:
      'Accounts past 90 days represent critical overdue balances requiring structured recovery review.',
    actionLabel: 'Review Recovery Queue',
    actionRoute: '/finance/aging',
    factText: `₹${ninetyPlusLakhs}L is 90+ days past due date out of ₹${overdueLakhs}L total overdue.`,
    interpretationText: 'This is the highest-risk financial aging segment requiring executive recovery workflow.',
    sourceEntityType: 'Finance',
  });

  // 3. Top Class Performance & Growth
  const classSummaries = getClassPerformanceSummary(students);
  if (classSummaries.length > 0) {
    const topClass = classSummaries[0];
    const classStudents = students.filter((s) => s.className === topClass.className);
    let classGrowth = 0;
    if (classStudents.length > 0) {
      const avgCurr = classStudents.reduce((acc, s) => acc + (s.assessmentTrend?.current || s.performanceBreakdown.score), 0) / classStudents.length;
      const avgPa1 = classStudents.reduce((acc, s) => acc + (s.assessmentTrend?.pa1 || s.performanceBreakdown.score), 0) / classStudents.length;
      classGrowth = avgPa1 > 0 ? Number((((avgCurr - avgPa1) / avgPa1) * 100).toFixed(1)) : 0;
    }
    const sign = classGrowth >= 0 ? '+' : '';

    insights.push({
      id: 'insight-class-top-growth',
      type: 'CLASS_PERFORMANCE',
      severity: 'LOW',
      title: `Class ${topClass.className} performance score reached ${topClass.avgPerformance}%`,
      description: `Class ${topClass.className} shows ${sign}${classGrowth}% assessment movement with ${topClass.avgAttendance}% attendance.`,
      whyItMatters:
        'Class cohort performance tracking identifies section-level academic movement across terms.',
      actionLabel: `Explore Class ${topClass.className}`,
      actionRoute: `/students/class?from=class-${topClass.className.toLowerCase().replace(/\s+/g, '')}`,
      factText: `Class ${topClass.className} cohort average performance score is ${topClass.avgPerformance}%.`,
      interpretationText: 'Class cohort average is leading school performance benchmark.',
      sourceEntityType: 'Class',
      sourceEntityId: topClass.className,
    });
  }

  // 4. Top Faculty Educator Insight
  if (teachers.length > 0) {
    const sortedTeachers = [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);
    const topTeacher = sortedTeachers[0];
    const assignedStudents = students.filter((s) => topTeacher.assignedClasses.includes(s.className));
    let tGrowth = 0;
    if (assignedStudents.length > 0) {
      const avgCurr = assignedStudents.reduce((acc, s) => acc + (s.assessmentTrend?.current || s.performanceBreakdown.score), 0) / assignedStudents.length;
      const avgPa1 = assignedStudents.reduce((acc, s) => acc + (s.assessmentTrend?.pa1 || s.performanceBreakdown.score), 0) / assignedStudents.length;
      tGrowth = avgPa1 > 0 ? Number((((avgCurr - avgPa1) / avgPa1) * 100).toFixed(1)) : 0;
    }
    const tSign = tGrowth >= 0 ? '+' : '';

    insights.push({
      id: 'insight-teacher-top',
      type: 'TEACHER',
      severity: 'LOW',
      title: `${topTeacher.name} assigned cohort shows ${tSign}${tGrowth}% assessment movement`,
      description: `${topTeacher.name} holds Performance Index ${topTeacher.performanceBreakdown.score} (Rank #1).`,
      whyItMatters:
        'Teacher index evaluation combines student improvement, academic score, attendance, and work completion.',
      actionLabel: 'View Educator Analysis',
      actionRoute: `/teachers/${topTeacher.id}`,
      factText: `Teacher ${topTeacher.name} has ${topTeacher.performanceBreakdown.score} Performance Index score.`,
      interpretationText: 'Assigned cohort displays top-ranking performance index across measured dimensions.',
      sourceEntityType: 'Teacher',
      sourceEntityId: topTeacher.id,
    });
  }

  // 5. Overdue Account Recovery Insight
  const overdueInvoices = invoices.filter(
    (inv) => inv.outstandingBalance > 0 && new Date(inv.dueDate).getTime() < demoTime
  );
  const overdueParentIds = Array.from(new Set(overdueInvoices.map((inv) => inv.parentId)));
  const overdueCasesCount = overdueParentIds.length;

  if (parents.length > 0) {
    const highRelOverdueParent = parents.find(
      (p) => p.paymentReliabilityScore >= INTELLIGENCE_CONFIG.FEE_CREDIT_HIGH_RELIABILITY_THRESHOLD && p.familyTotalOutstanding > 0
    ) || parents[0];

    insights.push({
      id: 'insight-parent-recovery',
      type: 'RECOVERY',
      severity: 'MEDIUM',
      title: `${overdueCasesCount} fee cases require active recovery action`,
      description: `Includes ${highRelOverdueParent.name} (₹${(highRelOverdueParent.familyTotalOutstanding / 1000).toFixed(1)}k family outstanding, ${highRelOverdueParent.paymentReliabilityScore} Reliability).`,
      whyItMatters:
        'Parents with high historical payment reliability represent strong candidates for direct communication follow-up.',
      actionLabel: 'Open Recovery Workflow',
      actionRoute: '/communications/recovery',
      factText: `${highRelOverdueParent.name} family has ₹${highRelOverdueParent.familyTotalOutstanding.toLocaleString('en-IN')} outstanding.`,
      interpretationText: 'High-reliability parent account with outstanding balance awaiting follow-up.',
      sourceEntityType: 'Parent',
      sourceEntityId: highRelOverdueParent.id,
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
  const demoTime = new Date(DEMO_DATE).getTime();
  const belowTargetTeachersCount = teachers.filter(
    (t) => t.performanceBreakdown.score < INTELLIGENCE_CONFIG.TEACHER_TARGET_THRESHOLD
  ).length;

  const overdueInvoices = (storeInvoices: FeeInvoice[]) =>
    storeInvoices.filter((inv) => inv.outstandingBalance > 0 && new Date(inv.dueDate).getTime() < demoTime);

  // We derive overdue cases count from students/parents/invoices context
  const overdueCasesCount = parents.filter((p) => p.familyTotalOutstanding > 0).length;

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
      title: `${belowTargetTeachersCount} Faculty Members Below Target Threshold`,
      subtitle: 'Cohorts with performance indicators below target threshold require review',
      actionLabel: 'Review Teachers',
      actionRoute: '/teachers',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'prio-4',
      severity: 'MEDIUM' as const,
      title: `${overdueCasesCount} Overdue Cases Awaiting Follow-up`,
      subtitle: 'Communication dispatch queue available for recovery workflow',
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
  const classSummaries = getClassPerformanceSummary(students);
  const topClass = classSummaries[0] || { className: '8-A', avgPerformance: 81.4 };
  const classStudents = students.filter((s) => s.className === topClass.className);
  let classGrowth = 0;
  if (classStudents.length > 0) {
    const avgCurr = classStudents.reduce((acc, s) => acc + (s.assessmentTrend?.current || s.performanceBreakdown.score), 0) / classStudents.length;
    const avgPa1 = classStudents.reduce((acc, s) => acc + (s.assessmentTrend?.pa1 || s.performanceBreakdown.score), 0) / classStudents.length;
    classGrowth = avgPa1 > 0 ? Number((((avgCurr - avgPa1) / avgPa1) * 100).toFixed(1)) : 0;
  }
  const classSign = classGrowth >= 0 ? '+' : '';

  const sortedTeachers = [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);
  const topTeacher = sortedTeachers[0] || { id: 'teacher-1', name: 'Priya Sharma', performanceBreakdown: { score: 91.4 } };
  const assignedStudents = students.filter((s) => topTeacher.assignedClasses?.includes(s.className));
  let tGrowth = 0;
  if (assignedStudents.length > 0) {
    const avgCurr = assignedStudents.reduce((acc, s) => acc + (s.assessmentTrend?.current || s.performanceBreakdown.score), 0) / assignedStudents.length;
    const avgPa1 = assignedStudents.reduce((acc, s) => acc + (s.assessmentTrend?.pa1 || s.performanceBreakdown.score), 0) / assignedStudents.length;
    tGrowth = avgPa1 > 0 ? Number((((avgCurr - avgPa1) / avgPa1) * 100).toFixed(1)) : 0;
  }
  const tSign = tGrowth >= 0 ? '+' : '';

  const dualRiskCount = students.filter(
    (s) =>
      s.discipline.attendancePercentage < INTELLIGENCE_CONFIG.ATTENDANCE_RISK_THRESHOLD &&
      s.discipline.homeworkCompletionPercentage < INTELLIGENCE_CONFIG.HOMEWORK_RISK_THRESHOLD
  ).length;

  const overdueCasesCount = parents.filter((p) => p.familyTotalOutstanding > 0).length;

  const highRiskStudent = students.find((s) => s.riskLevel === 'High') || students[0];

  return {
    goodNews: [
      {
        id: 'gn-1',
        text: `Class ${topClass.className} shows ${classSign}${classGrowth}% assessment movement, reaching average academic score of ${topClass.avgPerformance}%.`,
        route: '/students/class',
      },
      {
        id: 'gn-2',
        text: `${topTeacher.name}'s assigned cohort demonstrated ${tSign}${tGrowth}% assessment movement (Index ${topTeacher.performanceBreakdown.score}, Rank #1).`,
        route: `/teachers/${topTeacher.id}`,
      },
      {
        id: 'gn-3',
        text: `Fee collections reached ₹${(metrics.totalFeeCollected / 10000000).toFixed(2)} Cr (${metrics.collectionRate}% overall collection rate reconciled).`,
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
        text: `${highRiskStudent.name} (Admission #${highRiskStudent.admissionNo}) exhibits ${highRiskStudent.discipline.attendancePercentage}% attendance and ${highRiskStudent.discipline.homeworkCompletionPercentage}% homework completion.`,
        route: `/students/${highRiskStudent.id}`,
      },
    ],
    todayActions: [
      {
        id: 'act-1',
        title: 'Review High-Risk Students',
        description: `Conduct coordinator review for ${dualRiskCount} students with dual attendance & homework decline.`,
        route: '/students/risk',
      },
      {
        id: 'act-2',
        title: 'Execute Fee Recovery Dispatches',
        description: `Dispatch reminder messages for ${overdueCasesCount} overdue accounts.`,
        route: '/communications/recovery',
      },
      {
        id: 'act-3',
        title: 'Review Teacher Exceptions',
        description: 'Check support plan for faculty members with cohorts needing attention.',
        route: '/teachers',
      },
    ],
  };
}
