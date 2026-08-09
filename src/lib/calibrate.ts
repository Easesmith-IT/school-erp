import { generateSeedData } from './seed-data';

const data = generateSeedData();
console.log('=== CALIBRATION CHECK ===');
console.log(`Total Students: ${data.metrics.totalStudents}`);
console.log(`Average Performance: ${data.metrics.avgPerformance}% (Target ~78.6%)`);
console.log(`Average Attendance: ${data.metrics.avgAttendance}% (Target ~91.8%)`);
console.log(`Total Fee Collected: ₹${(data.metrics.totalFeeCollected / 10000000).toFixed(2)} Cr (Target ₹1.42 Cr)`);
console.log(`Total Outstanding: ₹${(data.metrics.totalOutstanding / 100000).toFixed(1)} L (Target ₹42.3 L)`);
console.log(`Collection Rate: ${data.metrics.collectionRate}% (Target 77.2%)`);

const aarav = data.students.find((s) => s.name === 'Aarav Sharma');
console.log(`Aarav Performance: ${aarav?.performanceBreakdown.score}`);
console.log(`Aarav Attendance: ${aarav?.discipline.attendancePercentage}%`);

const raj = data.parents.find((p) => p.name === 'Raj Sharma');
console.log(`Raj Reliability: ${raj?.paymentReliabilityScore}`);
console.log(`Raj Outstanding: ₹${raj?.familyTotalOutstanding}`);

const priya = data.teachers.find((t) => t.name === 'Priya Sharma');
console.log(`Priya Score: ${priya?.performanceBreakdown.score}, Rank: #${data.teachers.findIndex((t) => t.name === 'Priya Sharma') + 1}`);
