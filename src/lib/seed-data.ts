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
import { validateSeedData } from './seed-validation';

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
    'Class 8-A', 'Class 8-B', 'Class 5-A', 'Class 5-B', 'Class 6-A', 'Class 6-B', 'Class 7-A', 'Class 7-B',
    'Class 9-A', 'Class 9-B', 'Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 11-B', 'Class 12-A', 'Class 12-B',
  ];

  // 1. Create 20 Teachers (Priya Sharma assigned to Class 8-A, Class 8-B)
  const teacherNames = [
    { name: 'Priya Sharma', subject: 'Mathematics' }, // Demo hero teacher
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

  const nonPriyaClasses = classList.filter((c) => c !== 'Class 8-A' && c !== 'Class 8-B');

  const teachers: Teacher[] = teacherNames.map((t, idx) => {
    const id = `teacher-${idx + 1}`;
    const assignedClasses = idx === 0 ? ['Class 8-A', 'Class 8-B'] : [nonPriyaClasses[(idx - 1) % nonPriyaClasses.length]];
    if (idx !== 0 && idx % 2 === 0) {
      const secondClass = nonPriyaClasses[idx % nonPriyaClasses.length];
      if (!assignedClasses.includes(secondClass)) assignedClasses.push(secondClass);
    }

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
      avgStudentPerformance: 75,
      avgAttendance: 90,
      studentCount: 0,
      studentsNeedingAttentionCount: 0,
    };
  });

  // 2. Create 850 Parents (Including Hero Parent Raj Sharma)
  const parents: Parent[] = [];

  // Hero Parent: Raj Sharma (father of Aarav & Riya)
  const parentRajHistory = [
    { month: 'Jul 2026', daysToPay: 28, amount: 15000, status: 'On-Time' as const },
    { month: 'Apr 2026', daysToPay: 35, amount: 15000, status: 'On-Time' as const },
    { month: 'Jan 2026', daysToPay: 42, amount: 15000, status: 'Delayed' as const },
    { month: 'Oct 2025', daysToPay: 31, amount: 15000, status: 'On-Time' as const },
    { month: 'Jul 2025', daysToPay: 29, amount: 15000, status: 'On-Time' as const },
    { month: 'Apr 2025', daysToPay: 64, amount: 15000, status: 'Delayed' as const },
    { month: 'Jan 2025', daysToPay: 30, amount: 15000, status: 'On-Time' as const },
    { month: 'Oct 2024', daysToPay: 32, amount: 15000, status: 'On-Time' as const },
    { month: 'Jul 2024', daysToPay: 40, amount: 15000, status: 'On-Time' as const },
    { month: 'Apr 2024', daysToPay: 38, amount: 15000, status: 'On-Time' as const },
    { month: 'Jan 2024', daysToPay: 49, amount: 15000, status: 'On-Time' as const },
  ];
  const rajRel = calculatePaymentReliability(parentRajHistory, 18500);
  const rajCredit = calculateFeeCreditEligibility(rajRel.score, 18500, rajRel.onTimeRate);

  const parentRaj: Parent = {
    id: 'parent-raj',
    name: 'Raj Sharma',
    email: 'raj.sharma@example.com',
    phone: '+91 98765 43210',
    childrenIds: ['student-aarav', 'student-riya'],
    familyTotalOutstanding: 18500, // Aarav ₹8,500 + Riya ₹10,000
    paymentReliabilityScore: rajRel.score,
    paymentReliabilityBreakdown: rajRel,
    feeCreditEligibility: rajCredit,
    familyPaymentHistory: parentRajHistory,
  };
  parents.push(parentRaj);

  // Generate 849 remaining parents to reach total population of 850 parents
  for (let i = 2; i <= 850; i++) {
    const pGender = prng.next() > 0.5 ? 'male' : 'female';
    const fName = prng.pick(pGender === 'male' ? FIRST_NAMES_BOYS : FIRST_NAMES_GIRLS);
    const lName = prng.pick(LAST_NAMES);
    const pName = `${fName} ${lName}`;
    const pId = `parent-${i}`;
    const phone = `+91 ${prng.nextInt(70000, 99999)} ${prng.nextInt(10000, 99999)}`;

    const onTimeRate = prng.nextInt(60, 98);
    const avgDays = Math.round(15 + (100 - onTimeRate) * 0.4);

    const history = [
      { month: 'Apr 2026', daysToPay: avgDays, amount: 12000, status: onTimeRate > 75 ? ('On-Time' as const) : ('Delayed' as const) },
      { month: 'Jan 2026', daysToPay: avgDays + 4, amount: 12000, status: onTimeRate > 80 ? ('On-Time' as const) : ('Delayed' as const) },
      { month: 'Oct 2025', daysToPay: avgDays - 2, amount: 12000, status: 'On-Time' as const },
    ];

    const relBreakdown = calculatePaymentReliability(history, 0);

    parents.push({
      id: pId,
      name: pName,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      phone,
      childrenIds: [],
      familyTotalOutstanding: 0,
      paymentReliabilityScore: relBreakdown.score,
      paymentReliabilityBreakdown: relBreakdown,
      feeCreditEligibility: calculateFeeCreditEligibility(relBreakdown.score, 0, relBreakdown.onTimeRate),
      familyPaymentHistory: history,
    });
  }

  // 3. Create 1,248 Students
  const students: Student[] = [];

  // Hero Student 1: Aarav Sharma (Class 8-A, High Performer)
  const aaravAcademics: AcademicScores = { english: 82, hindi: 80, mathematics: 96, science: 89, socialStudies: 79, gk: 80 };
  const aaravDiscipline: AcademicDiscipline = { attendancePercentage: 94.2, bookCompletionPercentage: 92, homeworkCompletionPercentage: 91.0 };
  const aaravEngagement: StudentEngagement = { activityParticipation: 88, competitionParticipation: 90 };
  const aaravParentEng: ParentEngagement = { ptmParticipation: 95, parentFeedbackScore: 90 };
  const aaravPerf = calculateStudentPerformance(aaravAcademics, aaravDiscipline, aaravEngagement, aaravParentEng);

  const studentAarav: Student = {
    id: 'student-aarav',
    admissionNo: '1024',
    name: 'Aarav Sharma',
    classId: 'class-8a',
    className: 'Class 8-A',
    gender: 'Male',
    parentId: 'parent-raj',
    teacherId: 'teacher-1', // Priya Sharma
    academics: aaravAcademics,
    discipline: aaravDiscipline,
    engagement: aaravEngagement,
    parentEngagement: aaravParentEng,
    performanceBreakdown: aaravPerf,
    riskLevel: 'Low',
    riskReasons: ['Consistent performance across all indicators'],
    assessmentTrend: { pa1: 82.5, pa2: 85.0, sa1: 87.0, current: 87.6 },
    monthlyAttendance: [
      { month: 'Apr', presentDays: 22, workingDays: 23, percentage: 95.6 },
      { month: 'May', presentDays: 20, workingDays: 21, percentage: 95.2 },
      { month: 'Jul', presentDays: 21, workingDays: 23, percentage: 91.3 },
      { month: 'Aug', presentDays: 6, workingDays: 6, percentage: 100.0 },
    ],
    recentHomework: [
      { id: 'hw-1', subject: 'Mathematics', title: 'Quadratic Equations Practice', dueDate: '2026-08-07', status: 'Completed', score: 95 },
      { id: 'hw-2', subject: 'Science', title: 'Light & Refraction Lab Report', dueDate: '2026-08-05', status: 'Completed', score: 90 },
      { id: 'hw-3', subject: 'English', title: 'Essay: Technology in Education', dueDate: '2026-08-02', status: 'Completed', score: 88 },
    ],
    bookCompletions: [
      { id: 'bc-1', subject: 'Mathematics', bookTitle: 'NCERT Class 8 Math', totalChapters: 16, completedChapters: 14, status: 'Complete', verifiedDate: '2026-08-01' },
      { id: 'bc-2', subject: 'Science', bookTitle: 'Science Exemplar Class 8', totalChapters: 18, completedChapters: 15, status: 'Complete', verifiedDate: '2026-08-03' },
    ],
    activities: [
      { id: 'act-1', title: 'State Science Olympiad', category: 'Science', level: 'State', achievement: '1st Rank', date: '2026-07-15' },
      { id: 'act-2', title: 'Inter-School Debate', category: 'Debate', level: 'Zonal', achievement: 'Runner Up', date: '2026-06-20' },
    ],
    studentOutstandingFee: 8500,
  };
  students.push(studentAarav);

  // Hero Student 2: Riya Sharma (Class 8-A, High Risk Case)
  const riyaAcademics: AcademicScores = { english: 80, hindi: 78, mathematics: 68, science: 71, socialStudies: 80, gk: 96 };
  const riyaDiscipline: AcademicDiscipline = { attendancePercentage: 68.0, bookCompletionPercentage: 60, homeworkCompletionPercentage: 54.0 };
  const riyaEngagement: StudentEngagement = { activityParticipation: 65, competitionParticipation: 60 };
  const riyaParentEng: ParentEngagement = { ptmParticipation: 70, parentFeedbackScore: 75 };
  const riyaPerf = calculateStudentPerformance(riyaAcademics, riyaDiscipline, riyaEngagement, riyaParentEng);
  const riyaRisk = calculateStudentRisk(riyaDiscipline, { pa1: 80, pa2: 76, sa1: 72, current: 67.5 }, riyaPerf.score);

  const studentRiya: Student = {
    id: 'student-riya',
    admissionNo: '1088',
    name: 'Riya Sharma',
    classId: 'class-8a',
    className: 'Class 8-A',
    gender: 'Female',
    parentId: 'parent-raj',
    teacherId: 'teacher-1', // Priya Sharma
    academics: riyaAcademics,
    discipline: riyaDiscipline,
    engagement: riyaEngagement,
    parentEngagement: riyaParentEng,
    performanceBreakdown: riyaPerf,
    riskLevel: riyaRisk.riskLevel,
    riskReasons: riyaRisk.riskReasons,
    assessmentTrend: { pa1: 80.0, pa2: 76.0, sa1: 72.0, current: 67.5 },
    monthlyAttendance: [
      { month: 'Apr', presentDays: 18, workingDays: 23, percentage: 78.2 },
      { month: 'May', presentDays: 15, workingDays: 21, percentage: 71.4 },
      { month: 'Jul', presentDays: 14, workingDays: 23, percentage: 60.8 },
      { month: 'Aug', presentDays: 3, workingDays: 6, percentage: 50.0 },
    ],
    recentHomework: [
      { id: 'hw-r1', subject: 'Mathematics', title: 'Linear Equations Worksheet', dueDate: '2026-08-06', status: 'Pending' },
      { id: 'hw-r2', subject: 'Science', title: 'Chemical Effects Quiz', dueDate: '2026-08-04', status: 'Overdue' },
      { id: 'hw-r3', subject: 'English', title: 'Grammar Unit 5', dueDate: '2026-08-01', status: 'Completed', score: 70 },
    ],
    bookCompletions: [
      { id: 'bc-r1', subject: 'Mathematics', bookTitle: 'NCERT Class 8 Math', totalChapters: 16, completedChapters: 8, status: 'Incomplete', verifiedDate: '2026-08-02' },
    ],
    activities: [
      { id: 'act-r1', title: 'School Art Competition', category: 'Arts', level: 'School', achievement: 'Participant', date: '2026-05-10' },
    ],
    studentOutstandingFee: 10000,
  };
  students.push(studentRiya);

  // Generate remaining 1,246 students across classes and map to parents 2..850
  let remainingOutstandingTarget = 4230000 - (8500 + 10000); // Target ₹42.3L total outstanding

  for (let i = 3; i <= 1248; i++) {
    const gender = prng.next() > 0.48 ? 'Male' : 'Female';
    const fName = prng.pick(gender === 'Male' ? FIRST_NAMES_BOYS : FIRST_NAMES_GIRLS);
    const lName = prng.pick(LAST_NAMES);
    const name = `${fName} ${lName}`;

    const classIdx = (i - 1) % classList.length;
    const className = classList[classIdx];
    const classId = `class-${className.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const teacherId = `teacher-${(classIdx % 20) + 1}`;

    // Map 1246 students across parents 2 to 850
    const parentIdx = 1 + ((i - 3) % 849);
    const parent = parents[parentIdx];
    parent.childrenIds.push(`student-${i}`);

    const isPriyaCohort = className === 'Class 8-A' || className === 'Class 8-B';

    let att: number;
    let hw: number;
    let basePerf: number;

    if (isPriyaCohort) {
      att = prng.nextInt(94, 99);
      hw = prng.nextInt(92, 98);
      basePerf = prng.nextInt(90, 97);
    } else {
      const roll = prng.next();
      if (roll < 0.07) {
        att = prng.nextInt(52, 68);
        hw = prng.nextInt(45, 58);
        basePerf = prng.nextInt(48, 62);
      } else if (roll < 0.22) {
        att = prng.nextInt(69, 77);
        hw = prng.nextInt(60, 74);
        basePerf = prng.nextInt(63, 73);
      } else {
        att = prng.nextInt(80, 90);
        hw = prng.nextInt(76, 86);
        basePerf = prng.nextInt(65, 78);
      }
    }

    const mathScore = Math.min(100, Math.max(40, basePerf + prng.nextInt(-5, 5)));
    const sciScore = Math.min(100, Math.max(40, basePerf + prng.nextInt(-5, 5)));
    const engScore = Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4)));
    const hinScore = Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 4)));
    const ssScore = Math.min(100, Math.max(40, basePerf + prng.nextInt(-5, 5)));
    const gkScore = Math.min(100, Math.max(40, basePerf + prng.nextInt(-4, 5)));

    const academics: AcademicScores = { english: engScore, hindi: hinScore, mathematics: mathScore, science: sciScore, socialStudies: ssScore, gk: gkScore };
    const discipline: AcademicDiscipline = { attendancePercentage: att, bookCompletionPercentage: Math.min(100, hw + prng.nextInt(-2, 4)), homeworkCompletionPercentage: hw };
    const engagement: StudentEngagement = { activityParticipation: prng.nextInt(65, 95), competitionParticipation: prng.nextInt(60, 92) };
    const parentEng: ParentEngagement = { ptmParticipation: prng.nextInt(70, 98), parentFeedbackScore: prng.nextInt(70, 95) };

    const perfBreakdown = calculateStudentPerformance(academics, discipline, engagement, parentEng);

    // Dynamic assessment trend generation with PRNG variance
    const curr = perfBreakdown.score;
    const pa1Offset = isPriyaCohort ? prng.nextFloat(4.5, 6.0) : prng.nextFloat(-1.5, 2.5);
    const pa1 = Number(Math.min(100, Math.max(40, curr - pa1Offset)).toFixed(1));
    const pa2 = Number(Math.min(100, Math.max(40, pa1 + prng.nextFloat(0.5, 2.0))).toFixed(1));
    const sa1 = Number(Math.min(100, Math.max(40, pa2 + prng.nextFloat(0.5, 2.0))).toFixed(1));

    const trend = { pa1, pa2, sa1, current: curr };
    const risk = calculateStudentRisk(discipline, trend, perfBreakdown.score);

    let sOutstanding = 0;
    if (remainingOutstandingTarget > 0 && prng.next() < 0.25) {
      sOutstanding = Math.min(remainingOutstandingTarget, prng.pick([5000, 8000, 10000, 12000, 15000]));
      remainingOutstandingTarget -= sOutstanding;
      parent.familyTotalOutstanding += sOutstanding;
    }

    students.push({
      id: `student-${i}`,
      admissionNo: `${1000 + i}`,
      name,
      classId,
      className,
      gender,
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
        { month: 'Apr', presentDays: 22, workingDays: 23, percentage: att },
        { month: 'May', presentDays: 20, workingDays: 21, percentage: att },
        { month: 'Jul', presentDays: 21, workingDays: 23, percentage: Math.max(50, att - prng.nextInt(0, 4)) },
        { month: 'Aug', presentDays: 5, workingDays: 6, percentage: att },
      ],
      recentHomework: [
        { id: `hw-${i}-1`, subject: 'Mathematics', title: 'Chapter Practice', dueDate: '2026-08-05', status: hw >= 75 ? 'Completed' : 'Pending', score: hw >= 75 ? Math.round(hw) : undefined },
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

  // 4. Update Parent Reliability for ALL 850 parents dynamically
  parents.forEach((parent) => {
    const relBreakdown = calculatePaymentReliability(parent.familyPaymentHistory, parent.familyTotalOutstanding);
    const creditEligibility = calculateFeeCreditEligibility(relBreakdown.score, parent.familyTotalOutstanding, relBreakdown.onTimeRate);
    parent.paymentReliabilityScore = relBreakdown.score;
    parent.paymentReliabilityBreakdown = relBreakdown;
    parent.feeCreditEligibility = creditEligibility;
  });

  // 5. Update ALL Teachers dynamically using calculateTeacherPerformance
  teachers.forEach((teacher) => {
    const assigned = students.filter((s) => teacher.assignedClasses.includes(s.className) || teacher.assignedClasses.includes(s.classId));
    teacher.studentCount = assigned.length;

    // Dynamic calculation from assigned cohort (NO hardcoding for any teacher)
    const breakdown = calculateTeacherPerformance(assigned);
    teacher.performanceBreakdown = breakdown;
    teacher.avgStudentPerformance = Number((assigned.reduce((acc, s) => acc + s.performanceBreakdown.score, 0) / (assigned.length || 1)).toFixed(1));
    teacher.avgAttendance = Number((assigned.reduce((acc, s) => acc + s.discipline.attendancePercentage, 0) / (assigned.length || 1)).toFixed(1));
    teacher.studentsNeedingAttentionCount = assigned.filter((s) => s.riskLevel !== 'Low').length;
  });

  // Sort teachers dynamically by calculated performance breakdown score
  teachers.sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);

  // 6. Generate 24-Month Multi-Period Historical Invoices & Payment Records
  const feeInvoices: FeeInvoice[] = [];
  const payments: PaymentRecord[] = [];

  let invIdCounter = 10001;
  let payIdCounter = 20001;

  // Outstanding Buckets Anchored to DEMO_DATE (2026-08-09):
  // Collected: ₹1.42 Cr (₹14,200,000)
  // Current / Not Due: ₹12.5 L (₹1,250,000)
  // 0-30 Days Overdue: ₹8.0 L (₹800,000)
  // 31-60 Days Overdue: ₹9.0 L (₹900,000)
  // 61-90 Days Overdue: ₹6.8 L (₹680,000)
  // 90+ Days Overdue: ₹6.0 L (₹600,000)
  // Total Overdue = ₹29.8 L (₹2,980,000)
  // Total Outstanding = ₹42.3 L (₹4,230,000)
  // Total Expected = ₹18.43 Cr (₹18,430,000)

  interface OutstandingBucketSpec {
    bucketName: 'CURRENT' | '0-30' | '31-60' | '61-90' | '90+';
    targetAmount: number;
    dueDate: string;
  }

  const specs: OutstandingBucketSpec[] = [
    { bucketName: 'CURRENT', targetAmount: 1250000, dueDate: '2026-09-15' },
    { bucketName: '0-30', targetAmount: 800000 - 8500, dueDate: '2026-07-25' },
    { bucketName: '31-60', targetAmount: 900000, dueDate: '2026-06-25' },
    { bucketName: '61-90', targetAmount: 680000, dueDate: '2026-05-20' },
    { bucketName: '90+', targetAmount: 600000 - 10000, dueDate: '2026-04-10' },
  ];

  // Hero Student 1 Outstanding Invoice (Aarav - ₹8,500)
  const aaravParent = parents.find((p) => p.id === studentAarav.parentId)!;
  const invAaravId = `inv-${invIdCounter++}`;
  feeInvoices.push({
    id: invAaravId,
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
    dueDate: '2026-07-25',
    academicYear: '2026-2027',
    status: 'PARTIALLY_PAID',
    agingDays: 15,
  });

  payments.push({
    id: `pay-${payIdCounter++}`,
    receiptNo: `REC-2026-${payIdCounter}`,
    invoiceId: invAaravId,
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

  // Hero Student 2 Outstanding Invoice (Riya - ₹10,000)
  const invRiyaId = `inv-${invIdCounter++}`;
  feeInvoices.push({
    id: invRiyaId,
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
    dueDate: '2026-04-10',
    academicYear: '2026-2027',
    status: 'OVERDUE',
    agingDays: 121,
  });

  payments.push({
    id: `pay-${payIdCounter++}`,
    receiptNo: `REC-2026-${payIdCounter}`,
    invoiceId: invRiyaId,
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

  // Distribute remaining bucket target amounts across students
  let studentCursor = 2;

  specs.forEach((spec) => {
    let remainingInBucket = spec.targetAmount;
    const invAmount = 10000;

    while (remainingInBucket > 0 && studentCursor < students.length) {
      const student = students[studentCursor++];
      const parent = parents.find((p) => p.id === student.parentId) || parents[0];
      const chunk = Math.min(remainingInBucket, invAmount);

      const status: FeeInvoice['status'] = spec.bucketName === 'CURRENT' ? 'CURRENT' : chunk < invAmount ? 'PARTIALLY_PAID' : 'OVERDUE';
      const paid = invAmount - chunk;
      const invId = `inv-${invIdCounter++}`;

      feeInvoices.push({
        id: invId,
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
          invoiceId: invId,
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

  // Generate Multi-Period 24-Month Historical Invoices and Payments across ALL 1,248 students
  const currentPaymentsSum = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingPaidTarget = 14200000 - currentPaymentsSum;

  const historicalTerms = [
    { year: '2024-2025', feeType: 'Q1 Tuition' as const, dueDate: '2024-05-15', payDate: '2024-05-10' },
    { year: '2024-2025', feeType: 'Q2 Tuition' as const, dueDate: '2024-08-15', payDate: '2024-08-12' },
    { year: '2024-2025', feeType: 'Q3 Tuition' as const, dueDate: '2024-11-15', payDate: '2024-11-14' },
    { year: '2024-2025', feeType: 'Q4 Tuition' as const, dueDate: '2025-02-15', payDate: '2025-02-11' },
    { year: '2025-2026', feeType: 'Q1 Tuition' as const, dueDate: '2025-05-15', payDate: '2025-05-12' },
  ];

  if (remainingPaidTarget > 0) {
    const termsCount = historicalTerms.length;
    const totalSlots = students.length * termsCount;
    const baseChunk = Math.floor(remainingPaidTarget / totalSlots);
    let historicalResidue = remainingPaidTarget - baseChunk * totalSlots;

    students.forEach((student, sIdx) => {
      const parent = parents.find((p) => p.id === student.parentId) || parents[0];

      historicalTerms.forEach((term, tIdx) => {
        const slotIdx = sIdx * termsCount + tIdx;
        const pAmount = baseChunk + (slotIdx === 0 ? historicalResidue : 0);
        if (pAmount <= 0) return;

        const invId = `inv-${invIdCounter++}`;

        feeInvoices.push({
          id: invId,
          invoiceNo: `INV-${term.year.substring(0, 4)}-${invIdCounter}`,
          studentId: student.id,
          studentName: student.name,
          parentId: parent.id,
          parentName: parent.name,
          className: student.className,
          feeType: term.feeType,
          amountDue: pAmount,
          amountPaid: pAmount,
          outstandingBalance: 0,
          dueDate: term.dueDate,
          academicYear: term.year,
          status: 'PAID',
          agingDays: 0,
        });

        payments.push({
          id: `pay-${payIdCounter++}`,
          receiptNo: `REC-${term.year.substring(0, 4)}-${payIdCounter}`,
          invoiceId: invId,
          studentId: student.id,
          studentName: student.name,
          parentId: parent.id,
          parentName: parent.name,
          className: student.className,
          feeType: term.feeType,
          amount: pAmount,
          paymentDate: term.payDate,
          paymentMethod: prng.pick(['Bank Transfer', 'UPI', 'Cheque', 'Cash']),
          status: 'Success',
        });
      });
    });
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
      template: 'Dear Raj Sharma, your total family fee payment of ₹18,500 for Aarav & Riya is overdue. Please remit at your earliest convenience.',
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

  const seedStore: SeedDataStore = {
    students,
    teachers,
    parents,
    feeInvoices,
    payments,
    communications,
    assessments,
    metrics,
  };

  // Run strict seed data validation
  validateSeedData(seedStore);

  return seedStore;
}
