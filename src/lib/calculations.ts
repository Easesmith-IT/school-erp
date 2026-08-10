import {
  AcademicScores,
  AcademicDiscipline,
  StudentEngagement,
  ParentEngagement,
  StudentPerformanceBreakdown,
  PerformanceTier,
  RiskLevel,
  AssessmentTrend,
  TeacherPerformanceBreakdown,
  Student,
  Parent,
} from '@/types/schema';
import { INTELLIGENCE_CONFIG } from './config/intelligence-config';

// 1. Calculate Academic Sub-Score (Average of 6 Subjects)
export function calculateAcademicScore(academics: AcademicScores): number {
  const sum =
    academics.english +
    academics.hindi +
    academics.mathematics +
    academics.science +
    academics.socialStudies +
    academics.gk;
  return Number((sum / 6).toFixed(1));
}

// 2. Calculate Discipline Sub-Score (Average of Attendance, Book, Homework)
export function calculateDisciplineScore(discipline: AcademicDiscipline): number {
  const sum =
    discipline.attendancePercentage +
    discipline.bookCompletionPercentage +
    discipline.homeworkCompletionPercentage;
  return Number((sum / 3).toFixed(1));
}

// 3. Calculate Engagement Sub-Score (Average of Activity & Competition)
export function calculateEngagementScore(engagement: StudentEngagement): number {
  const sum = engagement.activityParticipation + engagement.competitionParticipation;
  return Number((sum / 2).toFixed(1));
}

// 4. Calculate Parent Engagement Sub-Score (Average of PTM & Feedback)
export function calculateParentEngagementScore(parentEngagement: ParentEngagement): number {
  const sum = parentEngagement.ptmParticipation + parentEngagement.parentFeedbackScore;
  return Number((sum / 2).toFixed(1));
}

// Determine Performance Tier
export function getPerformanceTier(score: number): PerformanceTier {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Average';
  if (score >= 60) return 'Needs Attention';
  return 'Critical';
}

// 5. Full Student Performance Calculation (55% Academic, 25% Discipline, 10% Engagement, 10% Parent Engagement)
export function calculateStudentPerformance(
  academics: AcademicScores,
  discipline: AcademicDiscipline,
  engagement: StudentEngagement,
  parentEngagement: ParentEngagement
): StudentPerformanceBreakdown {
  const academicScore = calculateAcademicScore(academics);
  const disciplineScore = calculateDisciplineScore(discipline);
  const engagementScore = calculateEngagementScore(engagement);
  const parentScore = calculateParentEngagementScore(parentEngagement);

  const totalScore =
    academicScore * 0.55 +
    disciplineScore * 0.25 +
    engagementScore * 0.10 +
    parentScore * 0.10;

  const finalScore = Number(totalScore.toFixed(1));
  const tier = getPerformanceTier(finalScore);

  return {
    score: finalScore,
    tier,
    academicScore,
    disciplineScore,
    engagementScore,
    parentEngagementScore: parentScore,
  };
}

// 6. Calculate Student Risk Level & Reasons
export function calculateStudentRisk(
  discipline: AcademicDiscipline,
  assessmentTrend: AssessmentTrend,
  performanceScore: number
): { riskLevel: RiskLevel; riskReasons: string[] } {
  const reasons: string[] = [];

  const isAttendanceLow = discipline.attendancePercentage < INTELLIGENCE_CONFIG.ATTENDANCE_CRITICAL_THRESHOLD + 10; // <70
  const isAttendanceMedium = discipline.attendancePercentage < INTELLIGENCE_CONFIG.ATTENDANCE_RISK_THRESHOLD; // <75

  const isHomeworkLow = discipline.homeworkCompletionPercentage < INTELLIGENCE_CONFIG.HOMEWORK_RISK_THRESHOLD; // <60
  const isHomeworkMedium = discipline.homeworkCompletionPercentage < INTELLIGENCE_CONFIG.HOMEWORK_TARGET_THRESHOLD; // <75

  const markDrop = assessmentTrend.sa1 - assessmentTrend.current;
  const isMarkDropHigh = markDrop > 15;
  const isMarkDropMedium = markDrop > 5;

  if (isAttendanceLow) reasons.push(`Critical attendance (${discipline.attendancePercentage}%)`);
  if (isHomeworkLow) reasons.push(`Low homework completion (${discipline.homeworkCompletionPercentage}%)`);
  if (isMarkDropHigh) reasons.push(`Significant academic decline (-${markDrop.toFixed(1)} pts)`);
  if (performanceScore < 60) reasons.push(`Overall performance in critical tier (${performanceScore})`);

  if (reasons.length > 0 || isAttendanceLow || isHomeworkLow || isMarkDropHigh) {
    return { riskLevel: 'High', riskReasons: reasons };
  }

  const mediumReasons: string[] = [];
  if (isAttendanceMedium) mediumReasons.push(`Below target attendance (${discipline.attendancePercentage}%)`);
  if (isHomeworkMedium) mediumReasons.push(`Homework completion below target (${discipline.homeworkCompletionPercentage}%)`);
  if (isMarkDropMedium) mediumReasons.push(`Recent performance dip (-${markDrop.toFixed(1)} pts)`);
  if (performanceScore < 70) mediumReasons.push(`Performance needs attention (${performanceScore})`);

  if (mediumReasons.length > 0) {
    return { riskLevel: 'Medium', riskReasons: mediumReasons };
  }

  return { riskLevel: 'Low', riskReasons: ['Consistent performance across all indicators'] };
}

// 7. Calculate Teacher Performance Score from assigned student cohort
export function calculateTeacherPerformance(
  assignedStudents: Student[]
): TeacherPerformanceBreakdown {
  if (!assignedStudents || assignedStudents.length === 0) {
    return {
      score: 75.0,
      studentImprovement: 75.0,
      academicPerformance: 75.0,
      attendance: 75.0,
      homeworkBookCompletion: 75.0,
      engagement: 75.0,
      parentFeedback: 75.0,
    };
  }

  let totalAcademic = 0;
  let totalAttendance = 0;
  let totalHomeworkBook = 0;
  let totalEngagement = 0;
  let totalParentFeedback = 0;
  let totalImprovement = 0;

  assignedStudents.forEach((student) => {
    totalAcademic += student.performanceBreakdown.academicScore;
    totalAttendance += student.discipline.attendancePercentage;
    totalHomeworkBook +=
      (student.discipline.homeworkCompletionPercentage +
        student.discipline.bookCompletionPercentage) /
      2;
    totalEngagement += student.performanceBreakdown.engagementScore;
    totalParentFeedback += student.parentEngagement.parentFeedbackScore;

    const diff = student.assessmentTrend.current - student.assessmentTrend.pa1;
    const improvementScore = Math.min(100, Math.max(50, 80 + diff * 2.5));
    totalImprovement += improvementScore;
  });

  const count = assignedStudents.length;
  const academicPerformance = Number((totalAcademic / count).toFixed(1));
  const attendance = Number((totalAttendance / count).toFixed(1));
  const homeworkBookCompletion = Number((totalHomeworkBook / count).toFixed(1));
  const engagement = Number((totalEngagement / count).toFixed(1));
  const parentFeedback = Number((totalParentFeedback / count).toFixed(1));
  const studentImprovement = Number((totalImprovement / count).toFixed(1));

  // Weightings: Student Improvement 35%, Academic 25%, Attendance 15%, Homework/Book 10%, Engagement 10%, Parent Feedback 5%
  const compositeScore =
    studentImprovement * 0.35 +
    academicPerformance * 0.25 +
    attendance * 0.15 +
    homeworkBookCompletion * 0.10 +
    engagement * 0.10 +
    parentFeedback * 0.05;

  return {
    score: Number(compositeScore.toFixed(1)),
    studentImprovement,
    academicPerformance,
    attendance,
    homeworkBookCompletion,
    engagement,
    parentFeedback,
  };
}

// 8. Calculate Parent Payment Reliability (0-100) & Breakdown
export function calculatePaymentReliability(
  paymentHistory: { month: string; daysToPay: number; amount: number; status: 'On-Time' | 'Delayed' | 'Overdue' }[],
  outstandingAmount: number
): Parent['paymentReliabilityBreakdown'] {
  if (!paymentHistory || paymentHistory.length === 0) {
    return {
      score: 70,
      onTimeRate: 70,
      averageReleaseDays: 30,
      lateFrequency: 'Moderate',
      outstandingRatio: 0.1,
      consistencyScore: 70,
    };
  }

  const totalPayments = paymentHistory.length;
  const onTimeCount = paymentHistory.filter((p) => p.status === 'On-Time').length;
  const onTimeRate = Number(((onTimeCount / totalPayments) * 100).toFixed(1));

  const totalDays = paymentHistory.reduce((sum, p) => sum + p.daysToPay, 0);
  const averageReleaseDays = Math.round(totalDays / totalPayments);

  const lateCount = paymentHistory.filter((p) => p.status === 'Delayed' || p.status === 'Overdue').length;
  let lateFrequency: 'None' | 'Low' | 'Moderate' | 'High' = 'None';
  if (lateCount >= 6) lateFrequency = 'High';
  else if (lateCount >= 3) lateFrequency = 'Moderate';
  else if (lateCount >= 1) lateFrequency = 'Low';

  // Days penalty score calibrated to canonical 86 rating for 38 days average release
  const delayScore = Math.max(0, 100 - Math.max(0, averageReleaseDays - 30) * 1.5);
  const lateFreqScore = lateFrequency === 'None' ? 100 : lateFrequency === 'Low' ? 88 : lateFrequency === 'Moderate' ? 68 : 40;
  const outstandingPenalty = Math.max(0, 100 - Math.min(100, (outstandingAmount / 50000) * 20));

  const compositeScore =
    onTimeRate * 0.40 +
    delayScore * 0.30 +
    lateFreqScore * 0.20 +
    outstandingPenalty * 0.10;

  const finalScore = Math.min(100, Math.max(0, Math.round(compositeScore)));

  return {
    score: finalScore,
    onTimeRate,
    averageReleaseDays,
    lateFrequency,
    outstandingRatio: Number((outstandingAmount / 50000).toFixed(2)),
    consistencyScore: Math.round(lateFreqScore),
  };
}

// 9. Calculate Fee Credit Eligibility (Decision Support Metric)
export function calculateFeeCreditEligibility(
  reliabilityScore: number,
  outstandingAmount: number,
  onTimeRate: number
): Parent['feeCreditEligibility'] {
  let recommendedAmount = 0;
  const factors: string[] = [];

  if (reliabilityScore >= INTELLIGENCE_CONFIG.PARENT_RELIABILITY_HIGH_THRESHOLD) {
    recommendedAmount = 30000;
    factors.push('Strong payment reliability score');
    if (onTimeRate >= 80) factors.push(`${onTimeRate}% on-time payment track record`);
    factors.push('Consistent 24-month fee settlement behavior');
    if (outstandingAmount < 25000) factors.push('Manageable outstanding balance ratio');
  } else if (reliabilityScore >= INTELLIGENCE_CONFIG.PARENT_RELIABILITY_MODERATE_THRESHOLD) {
    recommendedAmount = 15000;
    factors.push('Moderate payment reliability score');
    factors.push(`${onTimeRate}% on-time payment history`);
    factors.push('Low-to-moderate payment release delays');
  } else {
    recommendedAmount = 5000;
    factors.push('Payment reliability needs monitoring');
    factors.push('Higher frequency of delayed fee settlements');
  }

  return {
    recommendedAmount,
    explanationFactors: factors,
  };
}
