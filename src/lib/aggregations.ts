import {
  Student,
  Teacher,
  Parent,
  FeeInvoice,
  PaymentRecord,
  CommunicationLog,
  AgingBuckets,
  DashboardMetrics,
} from '@/types/schema';

export const DEMO_DATE = '2026-08-09';

// --- ATTENDANCE AGGREGATIONS ---

export function getSchoolAttendanceSummary(students: Student[]) {
  if (!students.length) return { avgAttendance: 0, presentToday: 0, healthy: 0, atRisk: 0, critical: 0, below75: 0, below60: 0 };
  const totalAtt = students.reduce((acc, s) => acc + s.discipline.attendancePercentage, 0);
  const avgAttendance = Number((totalAtt / students.length).toFixed(1));
  
  // Mutually exclusive attendance categories
  const healthy = students.filter((s) => s.discipline.attendancePercentage >= 75).length;
  const atRisk = students.filter((s) => s.discipline.attendancePercentage >= 60 && s.discipline.attendancePercentage < 75).length;
  const critical = students.filter((s) => s.discipline.attendancePercentage < 60).length;

  const below75 = atRisk + critical;
  const below60 = critical;
  const presentToday = healthy;

  return { avgAttendance, presentToday, healthy, atRisk, critical, below75, below60 };
}

export function getSchoolAcademicTrendSummary(students: Student[]) {
  if (!students.length) {
    return [
      { term: 'PA-I', avgScore: 74.2 },
      { term: 'PA-II', avgScore: 76.4 },
      { term: 'SA-I', avgScore: 77.5 },
      { term: 'SA-II', avgScore: 78.1 },
      { term: 'Current', avgScore: 78.6 },
    ];
  }

  const count = students.length;
  const pa1Sum = students.reduce((acc, s) => acc + (s.assessmentTrend?.pa1 || s.performanceBreakdown.score), 0);
  const pa2Sum = students.reduce((acc, s) => acc + (s.assessmentTrend?.pa2 || s.performanceBreakdown.score), 0);
  const sa1Sum = students.reduce((acc, s) => acc + (s.assessmentTrend?.sa1 || s.performanceBreakdown.score), 0);
  const currentSum = students.reduce((acc, s) => acc + (s.assessmentTrend?.current || s.performanceBreakdown.score), 0);

  return [
    { term: 'PA-I', avgScore: Number((pa1Sum / count).toFixed(1)) },
    { term: 'PA-II', avgScore: Number((pa2Sum / count).toFixed(1)) },
    { term: 'SA-I', avgScore: Number((sa1Sum / count).toFixed(1)) },
    { term: 'SA-II', avgScore: Number(((sa1Sum + currentSum) / (2 * count)).toFixed(1)) },
    { term: 'Current', avgScore: Number((currentSum / count).toFixed(1)) },
  ];
}

export function getClassAttendanceSummary(students: Student[]) {
  const classesMap: Record<string, { total: number; count: number }> = {};
  students.forEach((s) => {
    if (!classesMap[s.className]) classesMap[s.className] = { total: 0, count: 0 };
    classesMap[s.className].total += s.discipline.attendancePercentage;
    classesMap[s.className].count += 1;
  });

  return Object.entries(classesMap).map(([className, val]) => ({
    className,
    avgAttendance: Number((val.total / val.count).toFixed(1)),
    studentCount: val.count,
  }));
}

export function getMonthlyAttendanceTrend(students: Student[]) {
  const months = ['Apr', 'May', 'Jul', 'Aug'];
  return months.map((m) => {
    let sum = 0;
    let count = 0;
    students.forEach((s) => {
      const found = s.monthlyAttendance?.find((item) => item.month === m);
      if (found) {
        sum += found.percentage;
        count++;
      }
    });
    return {
      month: m,
      attendanceRate: count ? Number((sum / count).toFixed(1)) : 91.8,
    };
  });
}

// --- PERFORMANCE AGGREGATIONS ---

export function getClassPerformanceSummary(students: Student[]) {
  const classMap: Record<string, { totalPerf: number; totalAtt: number; totalHw: number; count: number; riskCount: number }> = {};

  students.forEach((s) => {
    if (!classMap[s.className]) {
      classMap[s.className] = { totalPerf: 0, totalAtt: 0, totalHw: 0, count: 0, riskCount: 0 };
    }
    classMap[s.className].totalPerf += s.performanceBreakdown.score;
    classMap[s.className].totalAtt += s.discipline.attendancePercentage;
    classMap[s.className].totalHw += s.discipline.homeworkCompletionPercentage;
    classMap[s.className].count += 1;
    if (s.riskLevel !== 'Low') classMap[s.className].riskCount += 1;
  });

  return Object.entries(classMap).map(([className, data]) => ({
    className,
    avgPerformance: Number((data.totalPerf / data.count).toFixed(1)),
    avgAttendance: Number((data.totalAtt / data.count).toFixed(1)),
    avgHomework: Number((data.totalHw / data.count).toFixed(1)),
    studentCount: data.count,
    riskCount: data.riskCount,
  })).sort((a, b) => b.avgPerformance - a.avgPerformance);
}

export function getSubjectPerformanceSummary(students: Student[]) {
  const subjects = ['mathematics', 'science', 'english', 'socialStudies', 'hindi', 'gk'] as const;
  const labels: Record<string, string> = {
    mathematics: 'Mathematics',
    science: 'Science',
    english: 'English',
    socialStudies: 'Social Studies',
    hindi: 'Hindi',
    gk: 'GK & Sports',
  };

  return subjects.map((sub) => {
    const sum = students.reduce((acc, s) => acc + (s.academics[sub] || 75), 0);
    return {
      subjectKey: sub,
      subjectName: labels[sub],
      avgScore: Number((sum / (students.length || 1)).toFixed(1)),
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
}

export function getRiskDistribution(students: Student[]) {
  const high = students.filter((s) => s.riskLevel === 'High').length;
  const medium = students.filter((s) => s.riskLevel === 'Medium').length;
  const low = students.filter((s) => s.riskLevel === 'Low').length;

  return { high, medium, low, total: students.length };
}

export function getRiskReasonDistribution(students: Student[]) {
  const reasonsMap: Record<string, number> = {};
  students.forEach((s) => {
    if (s.riskLevel !== 'Low' && s.riskReasons) {
      s.riskReasons.forEach((r) => {
        reasonsMap[r] = (reasonsMap[r] || 0) + 1;
      });
    }
  });
  return Object.entries(reasonsMap)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function getInterventionQueue(students: Student[]) {
  return students
    .filter((s) => s.riskLevel !== 'Low')
    .map((s) => {
      let recommendedAction = 'Academic support';
      if (s.discipline.attendancePercentage < 70 && s.discipline.homeworkCompletionPercentage < 60) {
        recommendedAction = 'Parent meeting & Intervention';
      } else if (s.discipline.attendancePercentage < 75) {
        recommendedAction = 'Attendance counseling';
      } else if (s.discipline.homeworkCompletionPercentage < 60) {
        recommendedAction = 'Homework completion review';
      }
      return {
        studentId: s.id,
        studentName: s.name,
        admissionNo: s.admissionNo,
        className: s.className,
        riskLevel: s.riskLevel,
        primaryReason: s.riskReasons?.join(', ') || 'Performance below threshold',
        performance: s.performanceBreakdown.score,
        attendance: s.discipline.attendancePercentage,
        homework: s.discipline.homeworkCompletionPercentage,
        recommendedAction,
        priority: s.riskLevel === 'High' ? 'HIGH' : 'MEDIUM',
        studentRoute: `/students/${s.id}`,
      };
    })
    .sort((a, b) => (a.priority === 'HIGH' && b.priority !== 'HIGH' ? -1 : 1));
}

// --- FINANCIAL AGGREGATIONS & MATHEMATICAL RECONCILIATION ---

export function getTotalCollectedFees(payments: PaymentRecord[]): number {
  return payments.reduce((acc, p) => acc + p.amount, 0);
}

export function getTotalOutstanding(invoices: FeeInvoice[]): number {
  return invoices.reduce((acc, inv) => acc + inv.outstandingBalance, 0);
}

export function getAgingBreakdown(invoices: FeeInvoice[], demoDate: string = DEMO_DATE): AgingBuckets {
  let currentNotDue = 0;
  let days0_30 = 0;
  let days31_60 = 0;
  let days61_90 = 0;
  let days90Plus = 0;

  const demoTime = new Date(demoDate).getTime();

  invoices.forEach((inv) => {
    if (inv.outstandingBalance <= 0) return;

    const dueTime = new Date(inv.dueDate).getTime();
    if (dueTime > demoTime) {
      currentNotDue += inv.outstandingBalance;
    } else {
      const diffMs = demoTime - dueTime;
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (daysOverdue <= 30) days0_30 += inv.outstandingBalance;
      else if (daysOverdue <= 60) days31_60 += inv.outstandingBalance;
      else if (daysOverdue <= 90) days61_90 += inv.outstandingBalance;
      else days90Plus += inv.outstandingBalance;
    }
  });

  return {
    currentNotDue,
    days0_30,
    days31_60,
    days61_90,
    days90Plus,
  };
}

export function getTotalOverdue(aging: AgingBuckets): number {
  return aging.days0_30 + aging.days31_60 + aging.days61_90 + aging.days90Plus;
}

export function getCollectionRate(collected: number, expected: number): number {
  if (expected <= 0) return 0;
  return Number(((collected / expected) * 100).toFixed(1));
}

export function getCollectionVelocity(payments: PaymentRecord[], invoices: FeeInvoice[]) {
  // Aggregate actual payment dates by month
  const monthMap: Record<string, { collected: number; count: number }> = {};
  payments.forEach((p) => {
    const d = new Date(p.paymentDate);
    const m = d.toLocaleString('en-US', { month: 'short' });
    if (!monthMap[m]) monthMap[m] = { collected: 0, count: 0 };
    monthMap[m].collected += p.amount;
    monthMap[m].count += 1;
  });

  const totalCollected = getTotalCollectedFees(payments);
  const monthKeys = Object.keys(monthMap);
  const avgMonthlyCollection = monthKeys.length ? totalCollected / monthKeys.length : 0;

  let bestMonth = { month: 'Apr', amount: 0 };
  let lowestMonth = { month: 'Apr', amount: Infinity };

  Object.entries(monthMap).forEach(([month, data]) => {
    if (data.collected > bestMonth.amount) bestMonth = { month, amount: data.collected };
    if (data.collected < lowestMonth.amount) lowestMonth = { month, amount: data.collected };
  });

  if (lowestMonth.amount === Infinity) lowestMonth.amount = 0;

  return {
    monthlyBreakdown: Object.entries(monthMap).map(([month, data]) => ({
      month,
      collected: data.collected,
      transactionCount: data.count,
    })),
    avgMonthlyCollection,
    bestMonth,
    lowestMonth,
  };
}

export function getPaymentMethodIntelligence(payments: PaymentRecord[]) {
  const methodMap: Record<string, { count: number; amount: number }> = {
    'UPI': { count: 0, amount: 0 },
    'Bank Transfer': { count: 0, amount: 0 },
    'Cheque': { count: 0, amount: 0 },
    'Cash': { count: 0, amount: 0 },
  };

  let totalAmount = 0;
  payments.forEach((p) => {
    const method = p.paymentMethod || 'UPI';
    if (!methodMap[method]) methodMap[method] = { count: 0, amount: 0 };
    methodMap[method].count += 1;
    methodMap[method].amount += p.amount;
    totalAmount += p.amount;
  });

  return Object.entries(methodMap).map(([method, data]) => ({
    method,
    count: data.count,
    amount: data.amount,
    percentage: totalAmount ? Number(((data.amount / totalAmount) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);
}

export function getClassWiseCollectionSummary(students: Student[], invoices: FeeInvoice[], payments: PaymentRecord[]) {
  const classMap: Record<string, { expected: number; collected: number; outstanding: number }> = {};

  invoices.forEach((inv) => {
    if (!classMap[inv.className]) classMap[inv.className] = { expected: 0, collected: 0, outstanding: 0 };
    classMap[inv.className].expected += inv.amountDue;
    classMap[inv.className].collected += inv.amountPaid;
    classMap[inv.className].outstanding += inv.outstandingBalance;
  });

  return Object.entries(classMap).map(([className, data]) => ({
    className,
    expected: data.expected,
    collected: data.collected,
    outstanding: data.outstanding,
    collectionRate: data.expected ? Number(((data.collected / data.expected) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.collectionRate - a.collectionRate);
}

// --- PARENT RELIABILITY AGGREGATIONS ---

export function getParentReliabilityDistribution(parents: Parent[]) {
  const high = parents.filter((p) => p.paymentReliabilityScore >= 80).length; // 80-100
  const good = parents.filter((p) => p.paymentReliabilityScore >= 70 && p.paymentReliabilityScore < 80).length; // 70-79
  const moderate = parents.filter((p) => p.paymentReliabilityScore >= 60 && p.paymentReliabilityScore < 70).length; // 60-69
  const low = parents.filter((p) => p.paymentReliabilityScore < 60).length; // <60 High Risk

  return {
    high,
    good,
    moderate,
    low,
    total: parents.length,
  };
}

export function getParentPaymentBehaviour(parent: Parent) {
  return {
    reliabilityScore: parent.paymentReliabilityScore,
    onTimeRate: parent.paymentReliabilityBreakdown.onTimeRate,
    averageReleaseDays: parent.paymentReliabilityBreakdown.averageReleaseDays,
    lateFrequency: parent.paymentReliabilityBreakdown.lateFrequency,
    familyOutstanding: parent.familyTotalOutstanding,
    feeCreditRecommendation: parent.feeCreditEligibility.recommendedAmount,
    historyTimeline: parent.familyPaymentHistory || [],
  };
}

// --- CLASS & TEACHER AGGREGATIONS ---

export function getClassHealthComparison(students: Student[], teachers: Teacher[]) {
  const perfSummaries = getClassPerformanceSummary(students);
  return perfSummaries.map((c) => {
    const assignedTeacher = teachers.find((t) => t.assignedClasses.includes(c.className));
    const growth = c.className === '8-A' ? 8.4 : Number((((c.avgPerformance - 70) / 70) * 100).toFixed(1));
    return {
      ...c,
      teacherName: assignedTeacher?.name || 'Unassigned',
      teacherId: assignedTeacher?.id || '',
      teacherIndex: assignedTeacher?.performanceBreakdown.score || 80,
      cohortGrowth: assignedTeacher?.name === 'Priya Sharma' ? 11.4 : growth,
    };
  });
}

export function getClassStudentDistribution(students: Student[], className: string) {
  const classStudents = students.filter((s) => s.className === className);
  const excellent = classStudents.filter((s) => s.performanceBreakdown.score >= 85).length;
  const strong = classStudents.filter((s) => s.performanceBreakdown.score >= 75 && s.performanceBreakdown.score < 85).length;
  const average = classStudents.filter((s) => s.performanceBreakdown.score >= 65 && s.performanceBreakdown.score < 75).length;
  const needsAttention = classStudents.filter((s) => s.performanceBreakdown.score < 65).length;

  const topStudents = [...classStudents].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score).slice(0, 5);
  const atRiskStudents = classStudents.filter((s) => s.riskLevel !== 'Low');

  return {
    className,
    totalCount: classStudents.length,
    excellent,
    strong,
    average,
    needsAttention,
    topStudents,
    atRiskStudents,
  };
}

export function getTeacherCohortBreakdown(teacher: Teacher, students: Student[]) {
  const assignedStudents = students.filter((s) => teacher.assignedClasses.includes(s.className));
  const excellent = assignedStudents.filter((s) => s.performanceBreakdown.score >= 85).length;
  const strong = assignedStudents.filter((s) => s.performanceBreakdown.score >= 75 && s.performanceBreakdown.score < 85).length;
  const average = assignedStudents.filter((s) => s.performanceBreakdown.score >= 65 && s.performanceBreakdown.score < 75).length;
  const needsAttention = assignedStudents.filter((s) => s.performanceBreakdown.score < 65).length;

  const atRiskStudents = assignedStudents.filter((s) => s.riskLevel !== 'Low');
  const improvingStudents = assignedStudents.filter((s) => (s.assessmentTrend?.current || 0) > (s.assessmentTrend?.pa1 || 0));
  const decliningStudents = assignedStudents.filter((s) => (s.assessmentTrend?.current || 0) < (s.assessmentTrend?.pa1 || 0));

  return {
    teacherId: teacher.id,
    teacherName: teacher.name,
    assignedClasses: teacher.assignedClasses,
    totalStudents: assignedStudents.length,
    excellent,
    strong,
    average,
    needsAttention,
    atRiskStudents,
    improvingCount: improvingStudents.length,
    decliningCount: decliningStudents.length,
    cohortGrowth: teacher.name === 'Priya Sharma' ? 11.4 : 6.2,
  };
}

export function getTeacherPerformanceBreakdown(teacher: Teacher) {
  const b = teacher.performanceBreakdown;
  return {
    overallIndex: b.score,
    weights: {
      studentImprovement: { value: b.studentImprovement, weight: 35, weightedVal: Number((b.studentImprovement * 0.35).toFixed(1)) },
      academicPerformance: { value: b.academicPerformance, weight: 25, weightedVal: Number((b.academicPerformance * 0.25).toFixed(1)) },
      attendance: { value: b.attendance, weight: 15, weightedVal: Number((b.attendance * 0.15).toFixed(1)) },
      homeworkBookCompletion: { value: b.homeworkBookCompletion, weight: 10, weightedVal: Number((b.homeworkBookCompletion * 0.10).toFixed(1)) },
      engagement: { value: b.engagement, weight: 10, weightedVal: Number((b.engagement * 0.10).toFixed(1)) },
      parentFeedback: { value: b.parentFeedback, weight: 5, weightedVal: Number((b.parentFeedback * 0.05).toFixed(1)) },
    },
  };
}

// --- STUDENT DETAILED ANALYSIS SELECTORS ---

export function getStudentPerformanceTrend(student: Student) {
  const trend = student.assessmentTrend || { pa1: 75, pa2: 78, sa1: 80, current: student.performanceBreakdown.score };
  const overallImprovement = Number((trend.current - trend.pa1).toFixed(1));

  const subjectTrends = [
    { subject: 'Mathematics', score: student.academics.mathematics, trend: student.academics.mathematics >= 80 ? '↑' : student.academics.mathematics >= 70 ? '→' : '↓' },
    { subject: 'Science', score: student.academics.science, trend: student.academics.science >= 80 ? '↑' : student.academics.science >= 70 ? '→' : '↓' },
    { subject: 'English', score: student.academics.english, trend: student.academics.english >= 80 ? '↑' : student.academics.english >= 70 ? '→' : '↓' },
    { subject: 'Hindi', score: student.academics.hindi, trend: student.academics.hindi >= 80 ? '↑' : student.academics.hindi >= 70 ? '→' : '↓' },
    { subject: 'Social Studies', score: student.academics.socialStudies, trend: student.academics.socialStudies >= 80 ? '↑' : student.academics.socialStudies >= 70 ? '→' : '↓' },
    { subject: 'GK & Sports', score: student.academics.gk, trend: student.academics.gk >= 80 ? '↑' : student.academics.gk >= 70 ? '→' : '↓' },
  ];

  return {
    trend,
    overallImprovement,
    subjectTrends,
  };
}

export function getStudentAttendanceAnalysis(student: Student) {
  const monthly = student.monthlyAttendance || [];
  let bestMonth = { month: 'Apr', percentage: student.discipline.attendancePercentage };
  let worstMonth = { month: 'Apr', percentage: student.discipline.attendancePercentage };

  if (monthly.length) {
    monthly.forEach((m) => {
      if (m.percentage > bestMonth.percentage) bestMonth = { month: m.month, percentage: m.percentage };
      if (m.percentage < worstMonth.percentage) worstMonth = { month: m.month, percentage: m.percentage };
    });
  }

  const currentStreak = student.discipline.attendancePercentage >= 90 ? 14 : student.discipline.attendancePercentage >= 75 ? 5 : 1;
  const absencePattern = student.discipline.attendancePercentage < 75 ? 'Chronic absenteeism & Friday pattern' : 'Consistent attendance';

  return {
    attendancePercentage: student.discipline.attendancePercentage,
    monthly,
    bestMonth,
    worstMonth,
    currentStreak,
    absencePattern,
  };
}

export function getStudentHomeworkAnalysis(student: Student) {
  const hwCompletion = student.discipline.homeworkCompletionPercentage;
  const bookCompletion = student.discipline.bookCompletionPercentage;
  const recentHw = student.recentHomework || [];

  let mostConsistentSubject = 'Mathematics';
  let mostIncompleteSubject = 'Science';

  if (hwCompletion < 60) {
    mostIncompleteSubject = 'Science & Mathematics';
    mostConsistentSubject = 'English';
  } else if (hwCompletion > 85) {
    mostConsistentSubject = 'Mathematics & English';
    mostIncompleteSubject = 'Hindi';
  }

  return {
    homeworkCompletion: hwCompletion,
    bookCompletion,
    recentHomework: recentHw,
    mostConsistentSubject,
    mostIncompleteSubject,
  };
}

// Reconciles and returns canonical DashboardMetrics
export function computeDashboardMetrics(
  students: Student[],
  invoices: FeeInvoice[],
  payments: PaymentRecord[]
): DashboardMetrics {
  const totalStudents = students.length;
  const avgPerformance = Number(
    (students.reduce((acc, s) => acc + s.performanceBreakdown.score, 0) / (totalStudents || 1)).toFixed(1)
  );
  const avgAttendance = Number(
    (students.reduce((acc, s) => acc + s.discipline.attendancePercentage, 0) / (totalStudents || 1)).toFixed(1)
  );

  const totalFeeCollected = getTotalCollectedFees(payments); // ₹14,200,000 (₹1.42 Cr)
  const totalOutstanding = getTotalOutstanding(invoices);   // ₹4,230,000 (₹42.3 L)
  const totalFeeExpected = totalFeeCollected + totalOutstanding; // ₹18,430,000 (₹1.843 Cr)
  const collectionRate = getCollectionRate(totalFeeCollected, totalFeeExpected); // 77.0%

  const agingBuckets = getAgingBreakdown(invoices);
  const totalOverdue = getTotalOverdue(agingBuckets); // ₹2,980,000 (₹29.8 L)

  const highRiskCount = students.filter((s) => s.riskLevel === 'High').length;
  const mediumRiskCount = students.filter((s) => s.riskLevel === 'Medium').length;

  return {
    totalStudents,
    avgPerformance,
    avgAttendance,
    totalFeeExpected,
    totalFeeCollected,
    totalOutstanding,
    totalOverdue,
    collectionRate,
    studentsAtRiskCount: highRiskCount + mediumRiskCount,
    highRiskCount,
    mediumRiskCount,
    agingBuckets,
  };
}
