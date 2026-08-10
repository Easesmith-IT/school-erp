import { generateSeedData } from './seed-data';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[TEST FAILURE] ${message}`);
  }
}

function runTests() {
  console.log('=== RUNNING SCHOOL INTELLIGENCE RECONCILIATION TESTS ===\n');

  const seedStore = generateSeedData();
  const { students, teachers, parents, feeInvoices, payments, metrics } = seedStore;

  // 1. Basic Cohort Target Checks
  assert(students.length === 1248, `Expected 1248 students, got ${students.length}`);
  console.log(`✓ Total Students: ${students.length} (Expected: 1248)`);

  assert(parents.length === 850, `Expected 850 parents, got ${parents.length}`);
  console.log(`✓ Total Parents: ${parents.length} (Expected: 850)`);

  assert(teachers.length === 20, `Expected 20 teachers, got ${teachers.length}`);
  console.log(`✓ Total Teachers: ${teachers.length} (Expected: 20)`);

  assert(feeInvoices.length > 5000, `Expected >5000 invoices for 24-month history, got ${feeInvoices.length}`);
  console.log(`✓ Total Invoices: ${feeInvoices.length}`);

  assert(payments.length > 5000, `Expected >5000 payments for 24-month history, got ${payments.length}`);
  console.log(`✓ Total Payments: ${payments.length}`);

  // 2. Hero Student 1: Aarav Sharma
  const aarav = students.find((s) => s.id === 'student-aarav' || s.name === 'Aarav Sharma');
  assert(aarav !== undefined, 'Aarav Sharma missing from seed');
  if (aarav) {
    assert(aarav.admissionNo === '1024', `Aarav Admission expected 1024, got ${aarav.admissionNo}`);
    assert(aarav.className === 'Class 8-A', `Aarav Class expected Class 8-A, got ${aarav.className}`);
    assert(Math.abs(aarav.performanceBreakdown.score - 87.6) < 0.1, `Aarav Perf expected 87.6, got ${aarav.performanceBreakdown.score}`);
    assert(Math.abs(aarav.discipline.attendancePercentage - 94.2) < 0.1, `Aarav Att expected 94.2%, got ${aarav.discipline.attendancePercentage}`);
    assert(Math.abs(aarav.discipline.homeworkCompletionPercentage - 91.0) < 0.1, `Aarav HW expected 91%, got ${aarav.discipline.homeworkCompletionPercentage}`);
    assert(aarav.studentOutstandingFee === 8500, `Aarav Outstanding expected 8500, got ${aarav.studentOutstandingFee}`);
    console.log(`✓ Hero Student Aarav Performance Score: ${aarav.performanceBreakdown.score} (Target: 87.6)`);
    console.log(`✓ Hero Student Aarav Attendance: ${aarav.discipline.attendancePercentage}% (Target: 94.2%)`);
    console.log(`✓ Hero Student Aarav Homework: ${aarav.discipline.homeworkCompletionPercentage}% (Target: 91%)`);
    console.log(`✓ Hero Student Aarav Student Outstanding: ₹${aarav.studentOutstandingFee} (Expected ₹8,500)`);
  }

  // 3. Hero Student 2: Riya Sharma
  const riya = students.find((s) => s.id === 'student-riya' || s.name === 'Riya Sharma');
  assert(riya !== undefined, 'Riya Sharma missing from seed');
  if (riya) {
    assert(riya.admissionNo === '1088', `Riya Admission expected 1088, got ${riya.admissionNo}`);
    assert(riya.className === 'Class 8-A', `Riya Class expected Class 8-A, got ${riya.className}`);
    assert(Math.abs(riya.performanceBreakdown.score - 72.0) < 0.1, `Riya Perf expected 72.0, got ${riya.performanceBreakdown.score}`);
    assert(Math.abs(riya.discipline.attendancePercentage - 68.0) < 0.1, `Riya Att expected 68.0%, got ${riya.discipline.attendancePercentage}`);
    assert(Math.abs(riya.discipline.homeworkCompletionPercentage - 54.0) < 0.1, `Riya HW expected 54.0%, got ${riya.discipline.homeworkCompletionPercentage}`);
    assert(riya.riskLevel === 'High', `Riya Risk expected High, got ${riya.riskLevel}`);
    assert(riya.studentOutstandingFee === 10000, `Riya Outstanding expected 10000, got ${riya.studentOutstandingFee}`);
    console.log(`✓ Hero Student Riya Performance Score: ${riya.performanceBreakdown.score} (Target: 72.0)`);
    console.log(`✓ Hero Student Riya Attendance: ${riya.discipline.attendancePercentage}% (Target: 68%)`);
    console.log(`✓ Hero Student Riya Homework: ${riya.discipline.homeworkCompletionPercentage}% (Target: 54%)`);
    console.log(`✓ Hero Student Riya Risk Level: ${riya.riskLevel} (Expected High)`);
  }

  // 4. Hero Parent: Raj Sharma
  const raj = parents.find((p) => p.id === 'parent-raj' || p.name === 'Raj Sharma');
  assert(raj !== undefined, 'Raj Sharma missing from seed');
  if (raj) {
    assert(raj.paymentReliabilityScore === 86, `Raj Reliability expected 86, got ${raj.paymentReliabilityScore}`);
    assert(Math.abs(raj.paymentReliabilityBreakdown.onTimeRate - 81.8) < 0.5, `Raj On-Time Rate expected ~81.8%, got ${raj.paymentReliabilityBreakdown.onTimeRate}`);
    assert(raj.paymentReliabilityBreakdown.averageReleaseDays === 38, `Raj Release Days expected 38, got ${raj.paymentReliabilityBreakdown.averageReleaseDays}`);
    assert(raj.familyTotalOutstanding === 18500, `Raj Family Outstanding expected 18500, got ${raj.familyTotalOutstanding}`);
    assert(raj.feeCreditEligibility.recommendedAmount === 30000, `Raj Credit Limit expected 30000, got ${raj.feeCreditEligibility.recommendedAmount}`);
    console.log(`✓ Hero Parent Raj Sharma Reliability Score: ${raj.paymentReliabilityScore} (Expected 86)`);
    console.log(`✓ Hero Parent Raj On-Time Rate: ${raj.paymentReliabilityBreakdown.onTimeRate}% (Expected 82%)`);
    console.log(`✓ Hero Parent Raj Release Delay: ${raj.paymentReliabilityBreakdown.averageReleaseDays} days (Expected 38 days)`);
    console.log(`✓ Hero Parent Raj Family Outstanding: ₹${raj.familyTotalOutstanding} (Expected ₹18,500)`);
    console.log(`✓ Hero Parent Raj Fee Credit Limit: ₹${raj.feeCreditEligibility.recommendedAmount} (Expected ₹30,000)`);
  }

  // 5. Hero Teacher: Priya Sharma
  const priya = teachers.find((t) => t.name === 'Priya Sharma');
  assert(priya !== undefined, 'Priya Sharma missing from seed');
  if (priya) {
    const sortedTeachers = [...teachers].sort((a, b) => b.performanceBreakdown.score - a.performanceBreakdown.score);
    const priyaRank = sortedTeachers.findIndex((t) => t.id === priya.id) + 1;
    assert(priyaRank === 1, `Priya Rank expected #1, got #${priyaRank}`);
    assert(Math.abs(priya.performanceBreakdown.score - 91.4) < 1.5, `Priya Index expected ~91.4, got ${priya.performanceBreakdown.score}`);
    console.log(`✓ Hero Teacher Priya Sharma Index: ${priya.performanceBreakdown.score} (Target: 91.4, Rank #${priyaRank})`);
    console.log(`✓ Hero Teacher Priya Sharma Assigned Cohort: ${priya.assignedClasses.join(', ')}`);
  }

  console.log('\n=== FINANCIAL RECONCILIATION ===\n');

  const collected = metrics.totalFeeCollected;
  const outstanding = metrics.totalOutstanding;
  const expected = metrics.totalFeeExpected;
  const collectionRate = metrics.collectionRate;
  const aging = metrics.agingBuckets;
  const overdue = metrics.totalOverdue;

  assert(Math.abs(collected - 14200000) < 1, `Collected expected ₹1.42 Cr, got ${collected}`);
  console.log(`✓ Collected Fees: ₹${(collected / 10000000).toFixed(2)} Cr`);

  assert(Math.abs(outstanding - 4230000) < 1, `Outstanding expected ₹42.3 L, got ${outstanding}`);
  console.log(`✓ Total Outstanding: ₹${(outstanding / 100000).toFixed(1)} L`);

  assert(Math.abs(aging.currentNotDue - 1250000) < 1, `Current/Not Due expected ₹12.5 L, got ${aging.currentNotDue}`);
  console.log(`✓ Current / Not Due: ₹${(aging.currentNotDue / 100000).toFixed(1)} L`);

  assert(Math.abs(overdue - 2980000) < 1, `Overdue expected ₹29.8 L, got ${overdue}`);
  console.log(`✓ Total Overdue: ₹${(overdue / 100000).toFixed(1)} L`);

  assert(Math.abs(aging.days0_30 - 800000) < 1, `0-30 days expected ₹8.0 L, got ${aging.days0_30}`);
  console.log(`✓ 0-30 Days: ₹${(aging.days0_30 / 100000).toFixed(1)} L`);

  assert(Math.abs(aging.days31_60 - 900000) < 1, `31-60 days expected ₹9.0 L, got ${aging.days31_60}`);
  console.log(`✓ 31-60 Days: ₹${(aging.days31_60 / 100000).toFixed(1)} L`);

  assert(Math.abs(aging.days61_90 - 680000) < 1, `61-90 days expected ₹6.8 L, got ${aging.days61_90}`);
  console.log(`✓ 61-90 Days: ₹${(aging.days61_90 / 100000).toFixed(1)} L`);

  assert(Math.abs(aging.days90Plus - 600000) < 1, `90+ days expected ₹6.0 L, got ${aging.days90Plus}`);
  console.log(`✓ 90+ Days: ₹${(aging.days90Plus / 100000).toFixed(1)} L`);

  const agingOverdueSum = aging.days0_30 + aging.days31_60 + aging.days61_90 + aging.days90Plus;
  assert(Math.abs(agingOverdueSum - overdue) < 1, `Aging overdue sum (${agingOverdueSum}) does not equal total overdue (${overdue})`);
  console.log(`✓ Aging Overdue Sum: ₹${(agingOverdueSum / 100000).toFixed(1)} L`);

  const currentPlusOverdue = aging.currentNotDue + overdue;
  assert(Math.abs(currentPlusOverdue - outstanding) < 1, `Current + Overdue (${currentPlusOverdue}) does not equal total outstanding (${outstanding})`);
  console.log(`✓ Current + Overdue: ₹${(currentPlusOverdue / 100000).toFixed(1)} L`);

  assert(Math.abs(expected - (collected + outstanding)) < 1, `Expected fees (${expected}) does not equal collected + outstanding (${collected + outstanding})`);
  console.log(`✓ Expected Fees: ₹${(expected / 10000000).toFixed(3)} Cr`);

  assert(Math.abs(collectionRate - 77.0) < 0.2, `Collection rate expected 77.0%, got ${collectionRate}%`);
  console.log(`✓ Collection Rate: ${collectionRate.toFixed(1)}%`);

  console.log('\n=== ALL INTELLIGENCE & RECONCILIATION TESTS PASSED ===\n');
}

runTests();
