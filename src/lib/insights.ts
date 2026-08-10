import { Student, Teacher, Parent, FeeInvoice, PaymentRecord, DashboardMetrics } from '@/types/schema';
import { INTELLIGENCE_CONFIG, DEMO_DATE } from './config/intelligence-config';
import {
  getClassPerformanceSummary,
  getTeacherCohortBreakdown,
} from './aggregations';

export interface ManagementInsight {
  id: string;
  type: 'ACADEMIC' | 'RISK' | 'TEACHER' | 'FINANCE' | 'RECOVERY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  whyItMatters: string;
  actionLabel: string;
  actionRoute: string;
  factText: string;
  interpretationText: string;
  sourceEntityType: string;
  sourceEntityId: string;
}

export function getSchoolHealthOverview(
  students: Student[],
  teachers: Teacher[],
  metrics: DashboardMetrics
) {
  const totalStudents = students.length || 1;
  const highRiskStudents = students.filter((s) => s.riskLevel === 'High');

  const avgAcademic =
    students.reduce((acc, s) => acc + s.performanceBreakdown.academicScore, 0) / totalStudents;
  const avgAttendance =
    students.reduce((acc, s) => acc + s.discipline.attendancePercentage, 0) / totalStudents;

  const healthyTeachers = teachers.filter(
    (t) => t.performanceBreakdown.score >= INTELLIGENCE_CONFIG.TEACHER_TARGET_THRESHOLD
  );
  const teacherEffectivenessRate =
    teachers.length > 0 ? Number(((healthyTeachers.length / teachers.length) * 100).toFixed(1)) : 0;

  return {
    academicHealthScore: Number(avgAcademic.toFixed(1)),
    attendanceRate: Number(avgAttendance.toFixed(1)),
    financialCollectionRate: metrics.collectionRate,
    teacherEffectivenessRate,
    studentsNeedingIntervention: highRiskStudents.length,
  };
}

export function getManagementInsights(
  students: Student[],
  teachers: Teacher[],
  parents: Parent[],
  invoices: FeeInvoice[],
  payments: PaymentRecord[],
  metrics: DashboardMetrics
): ManagementInsight[] {
  const insights: ManagementInsight[] = [];
  const demoTime = new Date(DEMO_DATE).getTime();

  // 1. High Risk Student Cluster Insight
  const highRiskStudents = students.filter((s) => s.riskLevel === 'High');
  if (highRiskStudents.length > 0) {
    const primaryHighRisk = highRiskStudents[0];
    insights.push({
      id: 'insight-risk-high',
      type: 'RISK',
      severity: 'HIGH',
      title: `${highRiskStudents.length} students exhibit high-risk indicators`,
      description: `Primary flag: ${primaryHighRisk.name} (${primaryHighRisk.className}, Admission #${primaryHighRisk.admissionNo}) has ${primaryHighRisk.discipline.attendancePercentage}% attendance and ${primaryHighRisk.discipline.homeworkCompletionPercentage}% homework completion.`,
      whyItMatters:
        'Dual attendance and homework completion drops correlate with lower term exam performance.',
      actionLabel: 'View High-Risk Roster',
      actionRoute: '/students/risk',
      factText: `${highRiskStudents.length} students flagged in High Risk tier.`,
      interpretationText: 'Multiple compounding risk factors present across attendance and homework.',
      sourceEntityType: 'Student',
      sourceEntityId: primaryHighRisk.id,
    });
  }

  // 2. Financial Overdue Risk Insight
  if (metrics.totalOverdue > 0) {
    insights.push({
      id: 'insight-finance-overdue',
      type: 'FINANCE',
      severity: 'HIGH',
      title: `₹${(metrics.totalOverdue / 100000).toFixed(1)}L overdue fees across aging buckets`,
      description: `₹${(metrics.agingBuckets.days90Plus / 100000).toFixed(1)}L is currently past ${INTELLIGENCE_CONFIG.RECOVERY_ESCALATION_DAYS} days past due date.`,
      whyItMatters:
        'Older aging buckets require structured communication and recovery workflows to maintain cash flow.',
      actionLabel: 'Inspect Aging Buckets',
      actionRoute: '/finance/aging',
      factText: `Total overdue balance is ₹${metrics.totalOverdue.toLocaleString('en-IN')}.`,
      interpretationText: 'Aging balances require active recovery follow-up.',
      sourceEntityType: 'Finance',
      sourceEntityId: 'aging-summary',
    });
  }

  // 3. Class Academic Leadership Insight
  const classSummaries = getClassPerformanceSummary(students);
  if (classSummaries.length > 0) {
    const topClass = classSummaries[0];
    insights.push({
      id: 'insight-class-top',
      type: 'ACADEMIC',
      severity: 'LOW',
      title: `Class ${topClass.className} leads academic performance benchmark`,
      description: `Class ${topClass.className} achieved highest cohort average score of ${topClass.avgPerformance}%.`,
      whyItMatters:
        'Understanding top-performing section dynamics provides instructional models for other sections.',
      actionLabel: 'View Section Analysis',
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
      (p) => p.paymentReliabilityScore >= INTELLIGENCE_CONFIG.PARENT_RELIABILITY_HIGH_THRESHOLD && p.familyTotalOutstanding > 0
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
  invoices: FeeInvoice[],
  metrics: DashboardMetrics
) {
  const demoTime = new Date(DEMO_DATE).getTime();
  const belowTargetTeachersCount = teachers.filter(
    (t) => t.performanceBreakdown.score < INTELLIGENCE_CONFIG.TEACHER_TARGET_THRESHOLD
  ).length;

  const overdueInvoices = invoices.filter(
    (inv) => inv.outstandingBalance > 0 && new Date(inv.dueDate).getTime() < demoTime
  );
  const overdueParentIds = new Set(overdueInvoices.map((inv) => inv.parentId));
  const overdueCasesCount = overdueParentIds.size;

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
  invoices: FeeInvoice[],
  metrics: DashboardMetrics
) {
  const classSummaries = getClassPerformanceSummary(students);
  const topClass = classSummaries[0];
  const classStudents = topClass ? students.filter((s) => s.className === topClass.className) : [];
  let classGrowth = 0;
  if (classStudents.length > 0) {
    const avgCurr = classStudents.reduce((acc, s) => acc + (s.assessmentTrend?.current || s.performanceBreakdown.score), 0) / classStudents.length;
    const avgPa1 = classStudents.reduce((acc, s) => acc + (s.assessmentTrend?.pa1 || s.performanceBreakdown.score), 0) / classStudents.length;
    classGrowth = avgPa1 > 0 ? Number((((avgCurr - avgPa1) / avgPa1) * 100).toFixed(1)) : 0;
  }
  const classSign = classGrowth >= 0 ? '+' : '';

  const sortedTeachers = [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);
  const topTeacher = sortedTeachers[0];
  const assignedStudents = topTeacher ? students.filter((s) => topTeacher.assignedClasses?.includes(s.className)) : [];
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

  const demoTime = new Date(DEMO_DATE).getTime();
  const overdueInvoices = invoices.filter(
    (inv) => inv.outstandingBalance > 0 && new Date(inv.dueDate).getTime() < demoTime
  );
  const overdueCasesCount = new Set(overdueInvoices.map((inv) => inv.parentId)).size;

  const highRiskStudent = students.find((s) => s.riskLevel === 'High') || students[0];

  return {
    goodNews: [
      {
        id: 'gn-1',
        text: topClass
          ? `Class ${topClass.className} shows ${classSign}${classGrowth}% assessment movement, reaching average academic score of ${topClass.avgPerformance}%.`
          : 'N/A',
        route: '/students/class',
      },
      {
        id: 'gn-2',
        text: topTeacher
          ? `${topTeacher.name}'s assigned cohort demonstrated ${tSign}${tGrowth}% assessment movement (Index ${topTeacher.performanceBreakdown.score}, Rank #1).`
          : 'N/A',
        route: topTeacher ? `/teachers/${topTeacher.id}` : '/teachers',
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
        text: highRiskStudent
          ? `${highRiskStudent.name} (Admission #${highRiskStudent.admissionNo}) exhibits ${highRiskStudent.discipline.attendancePercentage}% attendance and ${highRiskStudent.discipline.homeworkCompletionPercentage}% homework completion.`
          : 'N/A',
        route: highRiskStudent ? `/students/${highRiskStudent.id}` : '/students',
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
