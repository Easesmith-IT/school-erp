export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PerformanceTier = 'Excellent' | 'Strong' | 'Average' | 'Needs Attention' | 'Critical';

export interface AcademicScores {
  english: number;
  hindi: number;
  mathematics: number;
  science: number;
  socialStudies: number;
  gk: number;
}

export interface AcademicDiscipline {
  attendancePercentage: number;
  bookCompletionPercentage: number;
  homeworkCompletionPercentage: number;
}

export interface StudentEngagement {
  activityParticipation: number;
  competitionParticipation: number;
}

export interface ParentEngagement {
  ptmParticipation: number;
  parentFeedbackScore: number;
}

export interface StudentPerformanceBreakdown {
  score: number;
  tier?: string;
  academicScore: number;
  disciplineScore: number;
  engagementScore: number;
  parentEngagementScore: number;
}

export interface AssessmentTrend {
  pa1: number;
  pa2: number;
  sa1: number;
  current: number;
}

export interface HomeworkAssignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'Completed' | 'Pending' | 'Overdue';
  score?: number;
}

export interface BookCompletionRecord {
  id: string;
  subject: string;
  bookTitle: string;
  totalChapters: number;
  completedChapters: number;
  status: 'Complete' | 'Incomplete' | 'Pending Verification';
  verifiedDate: string;
}

export interface ActivityRecord {
  id: string;
  title: string;
  category: 'Sports' | 'Arts' | 'Debate' | 'Science' | 'Music' | 'Science Fair';
  level: 'School' | 'Zonal' | 'State' | 'National';
  achievement: string;
  date: string;
}

export interface MonthlyAttendance {
  month: string;
  presentDays: number;
  workingDays: number;
  percentage: number;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  classId: string;
  className: string;
  gender: 'Male' | 'Female';
  parentId: string;
  teacherId: string;
  academics: AcademicScores;
  discipline: AcademicDiscipline;
  engagement: StudentEngagement;
  parentEngagement: ParentEngagement;
  performanceBreakdown: StudentPerformanceBreakdown;
  riskLevel: RiskLevel;
  riskReasons: string[];
  assessmentTrend: AssessmentTrend;
  monthlyAttendance: MonthlyAttendance[];
  recentHomework: HomeworkAssignment[];
  bookCompletions?: BookCompletionRecord[];
  activities: ActivityRecord[];
  studentOutstandingFee: number;
}

export interface TeacherPerformanceBreakdown {
  score: number;
  studentImprovement: number;
  academicPerformance: number;
  attendance: number;
  homeworkBookCompletion: number;
  engagement: number;
  parentFeedback: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  assignedClasses: string[];
  performanceBreakdown: TeacherPerformanceBreakdown;
  studentCount: number;
  avgStudentPerformance: number;
  avgAttendance: number;
  studentsNeedingAttentionCount: number;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  className: string;
  feeType: 'Q1 Tuition' | 'Q2 Tuition' | 'Q3 Tuition' | 'Q4 Tuition' | 'Annual Development Fee' | 'Activity & Lab Fee';
  amountDue: number;
  amountPaid: number;
  outstandingBalance: number;
  dueDate: string;
  academicYear: string;
  status: 'CURRENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  agingDays: number;
}

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  className: string;
  feeType: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash';
  status: 'Success' | 'Processing';
}

export interface PaymentReliabilityBreakdown {
  score: number; // 0 - 100
  onTimeRate: number; // percentage
  averageReleaseDays: number; // days past due
  lateFrequency: 'None' | 'Low' | 'Moderate' | 'High';
  outstandingRatio: number;
  consistencyScore: number;
}

export interface FeeCreditEligibility {
  recommendedAmount: number;
  explanationFactors: string[];
}

export interface ParentPaymentHistory {
  month: string;
  daysToPay: number;
  amount: number;
  status: 'On-Time' | 'Delayed' | 'Overdue';
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  childrenIds: string[];
  paymentReliabilityScore: number;
  paymentReliabilityBreakdown: PaymentReliabilityBreakdown;
  feeCreditEligibility: FeeCreditEligibility;
  familyTotalOutstanding: number;
  familyPaymentHistory: ParentPaymentHistory[];
}

export type CommunicationMode = 'LIVE' | 'DEMO';
export type CommunicationStatus = 'SENT' | 'DELIVERED' | 'FAILED' | 'SIMULATED';

export interface CommunicationLog {
  id: string;
  schoolId: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  invoiceId?: string;
  type: 'Overdue Fee' | 'Fee Due' | 'Fee Credit Offer' | 'Credit Eligibility' | 'PTM Notice';
  recipientPhone: string;
  template: string;
  mode: CommunicationMode;
  status: CommunicationStatus;
  referenceId: string;
  amountMentioned?: number;
  createdAt: string;
}

export interface AgingBuckets {
  currentNotDue: number; // Current / Not Due
  days0_30: number;      // 0-30 Days Overdue
  days31_60: number;     // 31-60 Days Overdue
  days61_90: number;     // 61-90 Days Overdue
  days90Plus: number;    // 90+ Days Overdue
}

export interface DashboardMetrics {
  totalStudents: number;
  avgPerformance: number;
  avgAttendance: number;
  totalFeeExpected: number;
  totalFeeCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  collectionRate: number;
  studentsAtRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  agingBuckets: AgingBuckets;
}

export type UserRole = 'Principal' | 'Accountant' | 'Teacher' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface UserRoleRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface AssessmentRecord {
  id: string;
  assessmentName: 'PA-I' | 'PA-II' | 'SA-I' | 'SA-II';
  subject: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}
