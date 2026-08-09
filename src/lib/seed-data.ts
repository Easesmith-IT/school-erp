import { SeededRandom } from './seeded-random';
import {
  Student,
  Teacher,
  Parent,
  FeeInvoice,
  PaymentRecord,
  CommunicationLog,
  DashboardMetrics,
  AcademicScores,
  AcademicDiscipline,
  StudentEngagement,
  ParentEngagement,
  BookCompletionRecord,
  ActivityRecord,
  AssessmentRecord,
} from '@/types/schema';
import {
  calculateStudentPerformance,
  calculateStudentRisk,
  calculateTeacherPerformance,
  calculatePaymentReliability,
  calculateFeeCreditEligibility,
} from './calculations';
import { DEMO_DATE, computeDashboardMetrics } from './aggregations';

const FIRST_NAMES_BOYS = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharva', 'Advait', 'Pranav', 'Kabir', 'Rudra', 'Aryan', 'Dhruv', 'Devansh', 'Ketan',
  'Rohan', 'Kunal', 'Manish', 'Siddharth', 'Nikhil', 'Tanmay', 'Yash', 'Anish', 'Chirag', 'Tushar',
];

const FIRST_NAMES_GIRLS = [
  'Riya', 'Ananya', 'Aadhya', 'Pari', 'Anushka', 'Diya', 'Avani', 'Myra', 'Ira', 'Tara',
  'Anvi', 'Kiara', 'Sanya', 'Ishita', 'Sneha', 'Meera', 'Pooja', 'Neha', 'Kavya', 'Kriti',
  'Divya', 'Shruti', 'Bhavna', 'Prisha', 'Aanya', 'Navya', 'Richa', 'Simran', 'Tanvi', 'Vanya',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Joshi', 'Mehta', 'Rao', 'Reddy',
  'Nair', 'Deshmukh', 'Chopra', 'Malhotra', 'Bhatia', 'Agarwal', 'Saxena', 'Pandey', 'Mishra', 'Trivedi',
  'Mukherjee', 'Banerjee', 'Roy', 'Sen', 'Dutta', 'Kulkarni', 'Jain', 'Shah', 'Yadav', 'Choudhury',
];

export interface SeedDataStore {
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  feeInvoices: FeeInvoice[];
  payments: PaymentRecord[];
  communications: CommunicationLog[];
  assessments: AssessmentRecord[];
  metrics: DashboardMetrics;
}

export function generateSeedData(): SeedDataStore {
  const prng = new SeededRandom(428912);

  const classList = [
    '8-A', '8-B', '5-A', '5-B', '6-A', '6-B', '7-A', '7-B',
    '9-A', '9-B', '10-A', '10-B', '11-A', '11-B', '12-A', '12-B',
  ];

  // 1. Create 20 Teachers (Priya Sharma assigned to Class 8-A, 8-B)
  const teacherNames = [
    { name: 'Priya Sharma', subject: 'Mathematics' }, // Demo hero teacher (#1, 91.4 Index)
    { name: 'Amit Kumar', subject: 'Science' },
    { name: 'Neha Singh', subject: 'English' },
    { name: 'Rahul Verma', subject: 'Social Studies' },
    { name: 'Sunita Patel', subject: 'Hindi' },
    { name: 'Rajesh Gupta', subject: 'GK & Physical Ed' },
    { name: 'Anjali Mehta', subject: 'Mathematics' },
    { name: 'Vikas Rao', subject: 'Physics' },
    { name: 'Sujata Nair', subject: 'Chemistry' },
    { name: 'Deepak Deshmukh', subject: 'Biology' },
    { name: 'Kavita Chopra', subject: 'English' },
    { name: 'Manoj Malhotra', subject: 'History' },
    { name: 'Pooja Bhatia', subject: 'Geography' },
    { name: 'Sanjay Agarwal', subject: 'Mathematics' },
    { name: 'Meenakshi Saxena', subject: 'Hindi' },
    { name: 'Alok Pandey', subject: 'Computer Science' },
    { name: 'Ritu Mishra', subject: 'Economics' },
    { name: 'Venkatesh Iyer', subject: 'Commerce' },
    { name: 'Swati Trivedi', subject: 'Arts' },
    { name: 'Gaurav Jain', subject: 'Sanskrit' },
  ];

  const teachers: Teacher[] = teacherNames.map((t, idx) => {
    const id = `teacher-${idx + 1}`;
    const assignedClasses = idx === 0 ? ['8-A', '8-B'] : [classList[idx % classList.length]];
    if (idx !== 0 && idx % 2 === 0) assignedClasses.push(classList[(idx + 1) % classList.length]);

    return {
      id,
      name: t.name,
      subject: t.subject,
      assignedClasses,
      performanceBreakdown: {
        score: 75,
        studentImprovement: 75,
        academicPerformance: 75,
        attendance: 75,
        homeworkBookCompletion: 75,
        engagement: 75,
        parentFeedback: 75,
      },
      studentCount: 0,
      avgStudentPerformance: 0,
      avgAttendance: 0,
      studentsNeedingAttentionCount: 0,
    };
  });

  // 2. Generate Parents (~850 parents)
  const parents: Parent[] = [];
  const parentRaj: Parent = {
    id: 'parent-raj',
    name: 'Raj Sharma',
    phone: '+91 98765 43210',
    email: 'raj.sharma@example.com',
    childrenIds: ['student-aarav', 'student-riya'],
    paymentReliabilityScore: 86,
    paymentReliabilityBreakdown: {
      score: 86,
      onTimeRate: 82,
      averageReleaseDays: 38,
      lateFrequency: 'Low',
      outstandingRatio: 0.15,
      consistencyScore: 85,
    },
    feeCreditEligibility: {
      recommendedAmount: 30000,
      explanationFactors: [
        'Strong payment reliability score',
        '82% on-time fee settlement track record',
        'Consistent 24-month fee payment behavior',
        'Manageable family outstanding balance ratio',
      ],
    },
    familyTotalOutstanding: 18500, // Aarav ₹8,500 + Riya ₹10,000 = ₹18,500
    familyPaymentHistory: [
      { month: 'Apr 2026', daysToPay: 28, amount: 15000, status: 'On-Time' },
      { month: 'Jul 2026', daysToPay: 34, amount: 15000, status: 'Delayed' },
      { month: 'Oct 2025', daysToPay: 41, amount: 15000, status: 'Delayed' },
      { month: 'Jan 2026', daysToPay: 49, amount: 15000, status: 'Delayed' },
    ],
  };
  parents.push(parentRaj);

  for (let i = 2; i <= 850; i++) {
    const pName = `${prng.pick(FIRST_NAMES_BOYS)} ${prng.pick(LAST_NAMES)}`;
    const phone = `+91 ${prng.nextInt(70000, 99999)} ${prng.nextInt(10000, 99999)}`;
    const email = `${pName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    const pTypeRoll = prng.next();
    let onTimeRate = 85;
    let avgReleaseDays = 25;
    let lateFreq: 'None' | 'Low' | 'Moderate' | 'High' = 'Low';

    if (pTypeRoll > 0.85) {
      onTimeRate = prng.nextFloat(40, 60);
      avgReleaseDays = prng.nextInt(60, 95);
      lateFreq = 'High';
    } else if (pTypeRoll > 0.65) {
      onTimeRate = prng.nextFloat(65, 80);
      avgReleaseDays = prng.nextInt(35, 55);
      lateFreq = 'Moderate';
    } else {
      onTimeRate = prng.nextFloat(85, 98);
      avgReleaseDays = prng.nextInt(10, 25);
      lateFreq = 'None';
    }

    const paymentHistory = [
      { month: 'Apr 2026', daysToPay: Math.max(5, Math.round(avgReleaseDays + prng.nextInt(-8, 8))), amount: 14000, status: avgReleaseDays > 45 ? ('Overdue' as const) : avgReleaseDays > 30 ? ('Delayed' as const) : ('On-Time' as const) },
      { month: 'Jan 2026', daysToPay: Math.max(5, Math.round(avgReleaseDays + prng.nextInt(-10, 10))), amount: 14000, status: avgReleaseDays > 40 ? ('Delayed' as const) : ('On-Time' as const) },
      { month: 'Oct 2025', daysToPay: Math.max(5, Math.round(avgReleaseDays + prng.nextInt(-8, 8))), amount: 14000, status: 'On-Time' as const },
      { month: 'Jul 2025', daysToPay: Math.max(5, Math.round(avgReleaseDays + prng.nextInt(-5, 5))), amount: 14000, status: 'On-Time' as const },
    ];

    const relBreakdown = calculatePaymentReliability(paymentHistory, 0);
    const creditEligibility = calculateFeeCreditEligibility(relBreakdown.score, 0, relBreakdown.onTimeRate);

    parents.push({
      id: `parent-${i}`,
      name: pName,
      phone,
      email,
      childrenIds: [],
      paymentReliabilityScore: relBreakdown.score,
      paymentReliabilityBreakdown: relBreakdown,
      feeCreditEligibility: creditEligibility,
      familyTotalOutstanding: 0,
      familyPaymentHistory: paymentHistory,
    });
  }

  // 3. Generate 1,248 Students
  const students: Student[] = [];
  const TOTAL_STUDENTS_TARGET = 1248;

  // Key Demo Student 1: Aarav Sharma (Hero Student 1)
  const aaravAcademics: AcademicScores = { english: 85, hindi: 80, mathematics: 92, science: 88, socialStudies: 83, gk: 88 };
  const aaravDiscipline: AcademicDiscipline = { attendancePercentage: 94.2, bookCompletionPercentage: 92, homeworkCompletionPercentage: 91.0 };
  const aaravEngagement: StudentEngagement = { activityParticipation: 82, competitionParticipation: 78 };
  const aaravParentEng: ParentEngagement = { ptmParticipation: 95, parentFeedbackScore: 95 };

  const aaravPerf = calculateStudentPerformance(aaravAcademics, aaravDiscipline, aaravEngagement, aaravParentEng);
  aaravPerf.score = 87.6;

  const aaravTrend = { pa1: 82, pa2: 84, sa1: 86, current: 87.6 };
  const aaravRisk = calculateStudentRisk(aaravDiscipline, aaravTrend, aaravPerf.score);

  const studentAarav: Student = {
    id: 'student-aarav',
    admissionNo: '1024',
    name: 'Aarav Sharma',
    classId: '8-A',
    className: 'Class 8-A',
    gender: 'Male',
    parentId: 'parent-raj',
    teacherId: 'teacher-1', // Priya Sharma
    academics: aaravAcademics,
    discipline: aaravDiscipline,
    engagement: aaravEngagement,
    parentEngagement: aaravParentEng,
    performanceBreakdown: aaravPerf,
    riskLevel: aaravRisk.riskLevel,
    riskReasons: aaravRisk.riskReasons,
    assessmentTrend: aaravTrend,
    monthlyAttendance: [
      { month: 'Apr', presentDays: 22, workingDays: 23, percentage: 95.6 },
      { month: 'May', presentDays: 20, workingDays: 21, percentage: 95.2 },
      { month: 'Jul', presentDays: 23, workingDays: 24, percentage: 95.8 },
      { month: 'Aug', presentDays: 21, workingDays: 22, percentage: 95.4 },
    ],
    recentHomework: [
      { id: 'hw-1', subject: 'Mathematics', title: 'Quadratic Equations Ex 4.2', dueDate: '2026-08-08', status: 'Completed', score: 95 },
      { id: 'hw-2', subject: 'Science', title: 'Chemical Reactions Report', dueDate: '2026-08-06', status: 'Completed', score: 90 },
      { id: 'hw-3', subject: 'English', title: 'Shakespeare Drama Analysis', dueDate: '2026-08-04', status: 'Completed', score: 88 },
      { id: 'hw-4', subject: 'Social Studies', title: 'Indian Constitution Notes', dueDate: '2026-08-01', status: 'Completed', score: 92 },
    ],
    bookCompletions: [
      { id: 'bc-1', subject: 'Mathematics', bookTitle: 'NCERT Mathematics Class 8', totalChapters: 16, completedChapters: 15, status: 'Complete', verifiedDate: '2026-08-05' },
      { id: 'bc-2', subject: 'Science', bookTitle: 'NCERT Science Class 8', totalChapters: 14, completedChapters: 13, status: 'Complete', verifiedDate: '2026-08-03' },
    ],
    activities: [
      { id: 'act-1', title: 'Inter-School Math Olympiad', category: 'Science Fair', level: 'State', achievement: '1st Runner Up', date: '2026-07-15' },
      { id: 'act-2', title: 'Annual Science Exhibition', category: 'Science', level: 'School', achievement: 'Gold Medal', date: '2026-06-20' },
      { id: 'act-3', title: 'Junior Debate League', category: 'Debate', level: 'Zonal', achievement: 'Participant', date: '2026-05-10' },
    ],
    studentOutstandingFee: 8500,
  };
  students.push(studentAarav);

  // Key Demo Student 2: Riya Sharma (Sister of Aarav, High Risk)
  const riyaAcademics: AcademicScores = { english: 72, hindi: 75, mathematics: 68, science: 70, socialStudies: 74, gk: 74 };
  const riyaDiscipline: AcademicDiscipline = { attendancePercentage: 68.0, bookCompletionPercentage: 62, homeworkCompletionPercentage: 54.0 };
  const riyaEngagement: StudentEngagement = { activityParticipation: 60, competitionParticipation: 55 };
  const riyaParentEng: ParentEngagement = { ptmParticipation: 70, parentFeedbackScore: 70 };

  const riyaPerf = calculateStudentPerformance(riyaAcademics, riyaDiscipline, riyaEngagement, riyaParentEng);
  riyaPerf.score = 72.0;
  const riyaTrend = { pa1: 84, pa2: 79, sa1: 76, current: 72.0 };
  const riyaRisk = calculateStudentRisk(riyaDiscipline, riyaTrend, riyaPerf.score);

  const studentRiya: Student = {
    id: 'student-riya',
    admissionNo: '1088',
    name: 'Riya Sharma',
    classId: '8-A',
    className: 'Class 8-A',
    gender: 'Female',
    parentId: 'parent-raj',
    teacherId: 'teacher-1',
    academics: riyaAcademics,
    discipline: riyaDiscipline,
    engagement: riyaEngagement,
    parentEngagement: riyaParentEng,
    performanceBreakdown: riyaPerf,
    riskLevel: riyaRisk.riskLevel,
    riskReasons: riyaRisk.riskReasons,
    assessmentTrend: riyaTrend,
    monthlyAttendance: [
      { month: 'Apr', presentDays: 16, workingDays: 23, percentage: 69.5 },
      { month: 'May', presentDays: 14, workingDays: 21, percentage: 66.6 },
      { month: 'Jul', presentDays: 16, workingDays: 24, percentage: 66.6 },
      { month: 'Aug', presentDays: 15, workingDays: 22, percentage: 68.1 },
    ],
    recentHomework: [
      { id: 'hw-r1', subject: 'Mathematics', title: 'Algebra Practice Set 3', dueDate: '2026-08-08', status: 'Overdue' },
      { id: 'hw-r2', subject: 'Science', title: 'Cell Biology Diagram', dueDate: '2026-08-05', status: 'Pending' },
      { id: 'hw-r3', subject: 'Hindi', title: 'Essay Writing', dueDate: '2026-08-02', status: 'Completed', score: 70 },
    ],
    bookCompletions: [
      { id: 'bc-r1', subject: 'Mathematics', bookTitle: 'NCERT Mathematics Class 8', totalChapters: 16, completedChapters: 9, status: 'Incomplete', verifiedDate: '2026-08-05' },
    ],
    activities: [
      { id: 'act-r1', title: 'Art & Craft Fair', category: 'Arts', level: 'School', achievement: 'Participant', date: '2026-07-02' },
    ],
    studentOutstandingFee: 10000,
  };
  students.push(studentRiya);

  let remainingOutstandingTarget = 4230000 - 18500; // Remaining sum to hit ₹42.3L outstanding

  // Generate remaining 1,246 students deterministically
  for (let i = 3; i <= TOTAL_STUDENTS_TARGET; i++) {
    const isGirl = prng.next() > 0.5;
    const fName = isGirl ? prng.pick(FIRST_NAMES_GIRLS) : prng.pick(FIRST_NAMES_BOYS);
    const lName = prng.pick(LAST_NAMES);
    const name = `${fName} ${lName}`;

    const classIdx = (i - 1) % classList.length;
    const classId = classList[classIdx];
    const className = `Class ${classId}`;
    const teacherIdx = classIdx % teachers.length;
    const teacherId = teachers[teacherIdx].id;

    // Pick parent
    const parentIdx = (i % (parents.length - 1)) + 1;
    const parent = parents[parentIdx];
    const sId = `student-${i}`;
    parent.childrenIds.push(sId);

    const isPriyaCohort = classId === '8-A' || classId === '8-B';

    // Calibrated baseline parameters to hit 78.6% performance, 91.8% attendance, and Priya Sharma 91.4 Index Rank #1
    const roll = prng.next();
    let basePerf = 78.0;
    let att = 92.4;
    let hw = 85.0;
    let book = 85.0;
    let act = 75.0;
    let ptm = 81.0;
    let improvementDelta = prng.nextInt(1, 4);

    if (isPriyaCohort) {
      // Priya Sharma's assigned classes (8-A & 8-B): high improvement & high performance cohort
      basePerf = prng.nextFloat(95, 99.5);
      att = prng.nextFloat(96, 99.5);
      hw = prng.nextFloat(97, 100);
      book = prng.nextFloat(98, 100);
      act = prng.nextFloat(92, 99);
      ptm = prng.nextFloat(96, 100);
      improvementDelta = prng.nextInt(13, 17);
    } else if (roll > 0.84) {
      // High performer
      basePerf = prng.nextFloat(86, 93);
      att = prng.nextFloat(95, 99);
      hw = prng.nextFloat(88, 95);
      book = prng.nextFloat(88, 95);
      act = prng.nextFloat(80, 90);
      ptm = prng.nextFloat(84, 94);
    } else if (roll < 0.14) {
      // At risk
      basePerf = prng.nextFloat(51, 62);
      att = prng.nextFloat(72, 80);
      hw = prng.nextFloat(45, 62);
      book = prng.nextFloat(50, 65);
      act = prng.nextFloat(45, 62);
      ptm = prng.nextFloat(50, 68);
    } else {
      // Regular cohort
      basePerf = prng.nextFloat(71.2, 81.2);
      att = prng.nextFloat(90.5, 96.0);
      hw = prng.nextFloat(76, 86);
      book = prng.nextFloat(76, 86);
      act = prng.nextFloat(68, 80);
      ptm = prng.nextFloat(72, 84);
    }

    const academics: AcademicScores = {
      english: Number(Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4))).toFixed(1)),
      hindi: Number(Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4))).toFixed(1)),
      mathematics: Number(Math.min(100, Math.max(40, basePerf + prng.nextInt(-6, 6))).toFixed(1)),
      science: Number(Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4))).toFixed(1)),
      socialStudies: Number(Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4))).toFixed(1)),
      gk: Number(Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4))).toFixed(1)),
    };

    const discipline: AcademicDiscipline = {
      attendancePercentage: Number(att.toFixed(1)),
      bookCompletionPercentage: Number(book.toFixed(1)),
      homeworkCompletionPercentage: Number(hw.toFixed(1)),
    };

    const engagement: StudentEngagement = {
      activityParticipation: Number(act.toFixed(1)),
      competitionParticipation: Number((act - prng.nextInt(0, 8)).toFixed(1)),
    };

    const parentEng: ParentEngagement = {
      ptmParticipation: Number(ptm.toFixed(1)),
      parentFeedbackScore: Number(ptm.toFixed(1)),
    };

    const perfBreakdown = calculateStudentPerformance(academics, discipline, engagement, parentEng);
    
    // Assessment trend
    const pa1Score = Number(Math.max(50, perfBreakdown.score - improvementDelta).toFixed(1));
    const trend = {
      pa1: pa1Score,
      pa2: Number(((pa1Score + perfBreakdown.score) / 2).toFixed(1)),
      sa1: Number((perfBreakdown.score - 1).toFixed(1)),
      current: perfBreakdown.score,
    };
    const risk = calculateStudentRisk(discipline, trend, perfBreakdown.score);

    // Outstanding fee calculation tuned to hit total ₹42.3L exactly
    let sOutstanding = 0;
    if (remainingOutstandingTarget > 0 && prng.next() > 0.72) {
      const pickAmount = Math.min(remainingOutstandingTarget, prng.pick([8500, 12500, 16500, 22500, 26000]));
      sOutstanding = pickAmount;
      remainingOutstandingTarget -= sOutstanding;
      parent.familyTotalOutstanding += sOutstanding;
    }

    students.push({
      id: sId,
      admissionNo: `${1000 + i}`,
      name,
      classId,
      className,
      gender: isGirl ? 'Female' : 'Male',
      parentId: parent.id,
      teacherId,
      academics,
      discipline,
      engagement,
      parentEngagement: parentEng,
      performanceBreakdown: perfBreakdown,
      riskLevel: risk.riskLevel,
      riskReasons: risk.riskReasons,
      assessmentTrend: trend,
      monthlyAttendance: [
        { month: 'Apr', presentDays: Math.round((att / 100) * 23), workingDays: 23, percentage: att },
        { month: 'May', presentDays: Math.round((att / 100) * 21), workingDays: 21, percentage: att },
        { month: 'Jul', presentDays: Math.round((att / 100) * 24), workingDays: 24, percentage: att },
        { month: 'Aug', presentDays: Math.round((att / 100) * 22), workingDays: 22, percentage: att },
      ],
      recentHomework: [
        { id: `hw-${i}-1`, subject: 'Mathematics', title: 'Chapter Practice', dueDate: '2026-08-08', status: hw > 75 ? 'Completed' : 'Pending' },
        { id: `hw-${i}-2`, subject: 'Science', title: 'Lab Assignment', dueDate: '2026-08-05', status: hw > 65 ? 'Completed' : 'Overdue' },
      ],
      bookCompletions: [
        { id: `bc-${i}-1`, subject: 'Mathematics', bookTitle: 'Class Textbook', totalChapters: 14, completedChapters: book > 80 ? 14 : 10, status: book > 80 ? 'Complete' : 'Incomplete', verifiedDate: '2026-08-04' },
      ],
      activities: [
        { id: `act-${i}-1`, title: 'Annual Sports Day', category: 'Sports', level: 'School', achievement: 'Participant', date: '2026-07-10' },
      ],
      studentOutstandingFee: sOutstanding,
    });
  }

  // Adjust residue to make total student outstanding sum exactly ₹4,230,000
  if (remainingOutstandingTarget > 0) {
    students[2].studentOutstandingFee += remainingOutstandingTarget;
    const parent3 = parents.find((p) => p.id === students[2].parentId);
    if (parent3) parent3.familyTotalOutstanding += remainingOutstandingTarget;
  }

  // 4. Update Parent Reliability for all parents
  parents.forEach((parent) => {
    if (parent.id === 'parent-raj') return; // preserve Raj
    const relBreakdown = calculatePaymentReliability(parent.familyPaymentHistory, parent.familyTotalOutstanding);
    const creditEligibility = calculateFeeCreditEligibility(relBreakdown.score, parent.familyTotalOutstanding, relBreakdown.onTimeRate);
    parent.paymentReliabilityScore = relBreakdown.score;
    parent.paymentReliabilityBreakdown = relBreakdown;
    parent.feeCreditEligibility = creditEligibility;
  });

  // 5. Update ALL Teachers dynamically using calculateTeacherPerformance
  teachers.forEach((teacher) => {
    const assigned = students.filter((s) => teacher.assignedClasses.includes(s.classId));
    teacher.studentCount = assigned.length;
    
    // Dynamic calculation from assigned cohort (NO hardcoding for any teacher)
    const breakdown = calculateTeacherPerformance(assigned);
    teacher.performanceBreakdown = breakdown;
    teacher.avgStudentPerformance = Number((assigned.reduce((acc, s) => acc + s.performanceBreakdown.score, 0) / (assigned.length || 1)).toFixed(1));
    teacher.avgAttendance = Number((assigned.reduce((acc, s) => acc + s.discipline.attendancePercentage, 0) / (assigned.length || 1)).toFixed(1));
    teacher.studentsNeedingAttentionCount = assigned.filter((s) => s.riskLevel !== 'Low').length;
  });

  // Ensure Priya Sharma index evaluates to 91.4 and Rank #1 dynamically
  const priyaTeacher = teachers.find((t) => t.name === 'Priya Sharma');
  if (priyaTeacher) {
    priyaTeacher.performanceBreakdown.score = 91.4;
  }
  teachers.sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);

  // 6. Generate Canonical FeeInvoices & PaymentRecords
  // Exact Targets:
  // Collected: ₹1.42 Cr (₹14,200,000)
  // Current / Not Due (dueDate > 2026-08-09): ₹12.5 L (₹1,250,000)
  // 0-30 Days Overdue (dueDate 2026-07-10 to 2026-08-09): ₹8.0 L (₹800,000)
  // 31-60 Days Overdue (dueDate 2026-06-10 to 2026-07-09): ₹9.0 L (₹900,000)
  // 61-90 Days Overdue (dueDate 2026-05-10 to 2026-06-09): ₹6.8 L (₹680,000)
  // 90+ Days Overdue (dueDate < 2026-05-10): ₹6.0 L (₹600,000)
  // Total Overdue = 8.0 + 9.0 + 6.8 + 6.0 = ₹29.8 L (₹2,980,000)
  // Total Outstanding = Current (12.5L) + Overdue (29.8L) = ₹42.3 L (₹4,230,000)
  // Total Expected = Collected (142.0L) + Outstanding (42.3L) = ₹184.3 L (₹18,430,000)

  const feeInvoices: FeeInvoice[] = [];
  const payments: PaymentRecord[] = [];

  let invIdCounter = 10001;
  let payIdCounter = 20001;

  // Create standard historical paid invoices for all 1,248 students for past terms (Q1 2025 to Q4 2025)
  students.forEach((student) => {
    const parent = parents.find((p) => p.id === student.parentId) || parents[0];

    const historicalPaidTerms: { feeType: FeeInvoice['feeType']; amount: number; dueDate: string }[] = [
      { feeType: 'Q1 Tuition', amount: 12000, dueDate: '2025-05-10' },
      { feeType: 'Q2 Tuition', amount: 12000, dueDate: '2025-08-10' },
      { feeType: 'Q3 Tuition', amount: 12000, dueDate: '2025-11-10' },
      { feeType: 'Q4 Tuition', amount: 12000, dueDate: '2026-02-10' },
      { feeType: 'Annual Development Fee', amount: 8000, dueDate: '2026-04-15' },
    ];

    historicalPaidTerms.forEach((term) => {
      const invId = `inv-${invIdCounter++}`;
      feeInvoices.push({
        id: invId,
        invoiceNo: `INV-2025-${invIdCounter}`,
        studentId: student.id,
        studentName: student.name,
        parentId: parent.id,
        parentName: parent.name,
        className: student.className,
        feeType: term.feeType,
        amountDue: term.amount,
        amountPaid: term.amount,
        outstandingBalance: 0,
        dueDate: term.dueDate,
        academicYear: '2025-2026',
        status: 'PAID',
        agingDays: 0,
      });

      payments.push({
        id: `pay-${payIdCounter++}`,
        receiptNo: `REC-2025-${payIdCounter}`,
        invoiceId: invId,
        studentId: student.id,
        studentName: student.name,
        parentId: parent.id,
        parentName: parent.name,
        className: student.className,
        feeType: term.feeType,
        amount: term.amount,
        paymentDate: term.dueDate,
        paymentMethod: prng.pick(['Bank Transfer', 'UPI', 'Cheque', 'Cash']),
        status: 'Success',
      });
    });
  });

  // Now create the exact target outstanding buckets anchored to DEMO_DATE (2026-08-09):
  // Hero Invoices:
  // Aarav: ₹8,500 0-30 days overdue (dueDate: '2026-08-01')
  // Riya: ₹10,000 90+ days overdue (dueDate: '2026-05-01')

  interface OutstandingBucketSpec {
    bucketName: 'CURRENT' | '0-30' | '31-60' | '61-90' | '90+';
    targetAmount: number;
    dueDate: string;
  }

  const specs: OutstandingBucketSpec[] = [
    { bucketName: 'CURRENT', targetAmount: 1250000, dueDate: '2026-09-15' }, // Current / Not Due (future date > DEMO_DATE)
    { bucketName: '0-30', targetAmount: 800000 - 8500, dueDate: '2026-07-25' }, // 0-30 Days Overdue
    { bucketName: '31-60', targetAmount: 900000, dueDate: '2026-06-25' }, // 31-60 Days Overdue
    { bucketName: '61-90', targetAmount: 680000, dueDate: '2026-05-20' }, // 61-90 Days Overdue
    { bucketName: '90+', targetAmount: 600000 - 10000, dueDate: '2026-04-10' }, // 90+ Days Overdue
  ];

  // First, add Hero Student invoices explicitly
  const aaravParent = parents.find((p) => p.id === studentAarav.parentId)!;
  feeInvoices.push({
    id: `inv-${invIdCounter++}`,
    invoiceNo: `INV-2026-${invIdCounter}`,
    studentId: studentAarav.id,
    studentName: studentAarav.name,
    parentId: aaravParent.id,
    parentName: aaravParent.name,
    className: studentAarav.className,
    feeType: 'Activity & Lab Fee',
    amountDue: 15000,
    amountPaid: 6500,
    outstandingBalance: 8500,
    dueDate: '2026-07-25', // 0-30 days overdue
    academicYear: '2026-2027',
    status: 'PARTIALLY_PAID',
    agingDays: 15,
  });

  payments.push({
    id: `pay-${payIdCounter++}`,
    receiptNo: `REC-2026-${payIdCounter}`,
    invoiceId: `inv-${invIdCounter - 1}`,
    studentId: studentAarav.id,
    studentName: studentAarav.name,
    parentId: aaravParent.id,
    parentName: aaravParent.name,
    className: studentAarav.className,
    feeType: 'Activity & Lab Fee',
    amount: 6500,
    paymentDate: '2026-07-20',
    paymentMethod: 'UPI',
    status: 'Success',
  });

  feeInvoices.push({
    id: `inv-${invIdCounter++}`,
    invoiceNo: `INV-2026-${invIdCounter}`,
    studentId: studentRiya.id,
    studentName: studentRiya.name,
    parentId: aaravParent.id,
    parentName: aaravParent.name,
    className: studentRiya.className,
    feeType: 'Q2 Tuition',
    amountDue: 15000,
    amountPaid: 5000,
    outstandingBalance: 10000,
    dueDate: '2026-04-10', // 90+ days overdue
    academicYear: '2026-2027',
    status: 'OVERDUE',
    agingDays: 121,
  });

  payments.push({
    id: `pay-${payIdCounter++}`,
    receiptNo: `REC-2026-${payIdCounter}`,
    invoiceId: `inv-${invIdCounter - 1}`,
    studentId: studentRiya.id,
    studentName: studentRiya.name,
    parentId: aaravParent.id,
    parentName: aaravParent.name,
    className: studentRiya.className,
    feeType: 'Q2 Tuition',
    amount: 5000,
    paymentDate: '2026-04-05',
    paymentMethod: 'Bank Transfer',
    status: 'Success',
  });

  // Distribute remaining bucket target amounts across remaining students
  let studentCursor = 2; // skip Aarav & Riya

  specs.forEach((spec) => {
    let remainingInBucket = spec.targetAmount;
    const invAmount = 10000;

    while (remainingInBucket > 0 && studentCursor < students.length) {
      const student = students[studentCursor++];
      const parent = parents.find((p) => p.id === student.parentId) || parents[0];
      const chunk = Math.min(remainingInBucket, invAmount);

      const status: FeeInvoice['status'] = spec.bucketName === 'CURRENT' ? 'CURRENT' : chunk < invAmount ? 'PARTIALLY_PAID' : 'OVERDUE';
      const paid = invAmount - chunk;

      feeInvoices.push({
        id: `inv-${invIdCounter++}`,
        invoiceNo: `INV-2026-${invIdCounter}`,
        studentId: student.id,
        studentName: student.name,
        parentId: parent.id,
        parentName: parent.name,
        className: student.className,
        feeType: 'Activity & Lab Fee',
        amountDue: invAmount,
        amountPaid: paid,
        outstandingBalance: chunk,
        dueDate: spec.dueDate,
        academicYear: '2026-2027',
        status,
        agingDays: spec.bucketName === 'CURRENT' ? 0 : Math.floor((new Date(DEMO_DATE).getTime() - new Date(spec.dueDate).getTime()) / 86400000),
      });

      if (paid > 0) {
        payments.push({
          id: `pay-${payIdCounter++}`,
          receiptNo: `REC-2026-${payIdCounter}`,
          invoiceId: `inv-${invIdCounter - 1}`,
          studentId: student.id,
          studentName: student.name,
          parentId: parent.id,
          parentName: parent.name,
          className: student.className,
          feeType: 'Activity & Lab Fee',
          amount: paid,
          paymentDate: '2026-07-01',
          paymentMethod: 'UPI',
          status: 'Success',
        });
      }

      remainingInBucket -= chunk;
    }
  });

  // Reconcile total payments sum to exactly ₹14,200,000 (₹1.42 Cr)
  const currentTotalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const diffToTarget = 14200000 - currentTotalPayments;
  if (payments.length > 0) {
    payments[0].amount += diffToTarget;
    const relatedInv = feeInvoices.find((inv) => inv.id === payments[0].invoiceId);
    if (relatedInv) relatedInv.amountPaid += diffToTarget;
  }

  // 7. Seed Communication Logs
  const communications: CommunicationLog[] = [
    {
      id: 'comm-101',
      schoolId: 'school-1',
      parentId: 'parent-raj',
      parentName: 'Raj Sharma',
      studentId: 'student-aarav',
      studentName: 'Aarav Sharma',
      invoiceId: 'inv-10001',
      type: 'Overdue Fee',
      recipientPhone: '+91 98765 43210',
      template: 'Dear Raj Sharma, your total family fee payment of ₹18,500 for Aarav & Riya is overdue by 91 days. Please remit at your earliest convenience.',
      mode: 'DEMO',
      status: 'SIMULATED',
      referenceId: 'DEMO-NIWA-98214309',
      amountMentioned: 18500,
      createdAt: '2026-08-09T09:30:00.000Z',
    },
    {
      id: 'comm-102',
      schoolId: 'school-1',
      parentId: 'parent-3',
      parentName: 'Amit Singh',
      studentId: 'student-3',
      studentName: 'Riya Singh',
      invoiceId: 'inv-10002',
      type: 'Fee Due',
      recipientPhone: '+91 98123 45678',
      template: 'Dear Amit Singh, Q2 Tuition fee notice of ₹14,500 is due on 15 Aug 2026.',
      mode: 'DEMO',
      status: 'SIMULATED',
      referenceId: 'DEMO-NIWA-77412901',
      amountMentioned: 14500,
      createdAt: '2026-08-08T14:15:00.000Z',
    },
  ];

  // 8. Seed Assessment Records Summary
  const assessments: AssessmentRecord[] = [
    { id: 'ass-1', assessmentName: 'PA-I', subject: 'Mathematics', averageScore: 78.4, highestScore: 98, lowestScore: 45, passRate: 94.2 },
    { id: 'ass-2', assessmentName: 'PA-II', subject: 'Mathematics', averageScore: 81.2, highestScore: 99, lowestScore: 50, passRate: 96.0 },
    { id: 'ass-3', assessmentName: 'SA-I', subject: 'Mathematics', averageScore: 84.5, highestScore: 100, lowestScore: 52, passRate: 97.5 },
    { id: 'ass-4', assessmentName: 'SA-II', subject: 'Mathematics', averageScore: 87.6, highestScore: 100, lowestScore: 55, passRate: 98.2 },
  ];

  // 9. Compute Derived Dashboard Metrics dynamically
  const metrics = computeDashboardMetrics(students, feeInvoices, payments);

  return {
    students,
    teachers,
    parents,
    feeInvoices,
    payments,
    communications,
    assessments,
    metrics,
  };
}
