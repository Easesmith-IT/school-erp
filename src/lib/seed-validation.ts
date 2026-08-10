import { SeedDataStore } from './seed-data';
import { DEMO_DATE } from './config/intelligence-config';

export interface ValidationError {
  entityType: string;
  entityId: string;
  message: string;
}

export function validateSeedData(data: SeedDataStore): ValidationError[] {
  const errors: ValidationError[] = [];
  const demoTime = new Date(`${DEMO_DATE}T23:59:59.999Z`).getTime();

  const studentIds = new Set<string>();
  const parentIds = new Set<string>();
  const teacherIds = new Set<string>();
  const invoiceIds = new Set<string>();
  const paymentIds = new Set<string>();
  const commIds = new Set<string>();

  // 1. Validate Students
  data.students.forEach((s) => {
    if (studentIds.has(s.id)) {
      errors.push({ entityType: 'Student', entityId: s.id, message: `Duplicate student ID: ${s.id}` });
    }
    studentIds.add(s.id);

    if (!data.parents.some((p) => p.id === s.parentId)) {
      errors.push({ entityType: 'Student', entityId: s.id, message: `Student references non-existent parentId: ${s.parentId}` });
    }

    if (!data.teachers.some((t) => t.id === s.teacherId)) {
      errors.push({ entityType: 'Student', entityId: s.id, message: `Student references non-existent teacherId: ${s.teacherId}` });
    }
  });

  // 2. Validate Parents
  data.parents.forEach((p) => {
    if (parentIds.has(p.id)) {
      errors.push({ entityType: 'Parent', entityId: p.id, message: `Duplicate parent ID: ${p.id}` });
    }
    parentIds.add(p.id);

    p.childrenIds.forEach((childId) => {
      if (!studentIds.has(childId)) {
        errors.push({ entityType: 'Parent', entityId: p.id, message: `Parent references non-existent child student ID: ${childId}` });
      }
    });

    if (p.familyPaymentHistory) {
      p.familyPaymentHistory.forEach((ph, idx) => {
        if (ph.amount < 0) {
          errors.push({ entityType: 'Parent', entityId: p.id, message: `Payment history item ${idx} has invalid negative amount: ${ph.amount}` });
        }
      });
    }
  });

  // 3. Validate Teachers
  data.teachers.forEach((t) => {
    if (teacherIds.has(t.id)) {
      errors.push({ entityType: 'Teacher', entityId: t.id, message: `Duplicate teacher ID: ${t.id}` });
    }
    teacherIds.add(t.id);

    if (!t.assignedClasses || t.assignedClasses.length === 0) {
      errors.push({ entityType: 'Teacher', entityId: t.id, message: `Teacher has no assigned classes` });
    }
  });

  // 4. Validate Invoices
  data.feeInvoices.forEach((inv) => {
    if (invoiceIds.has(inv.id)) {
      errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Duplicate invoice ID: ${inv.id}` });
    }
    invoiceIds.add(inv.id);

    if (!studentIds.has(inv.studentId)) {
      errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Invoice references non-existent studentId: ${inv.studentId}` });
    }

    if (!parentIds.has(inv.parentId)) {
      errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Invoice references non-existent parentId: ${inv.parentId}` });
    }

    // Status consistency
    const expectedBalance = inv.amountDue - inv.amountPaid;
    if (Math.abs(expectedBalance - inv.outstandingBalance) > 0.01) {
      errors.push({
        entityType: 'FeeInvoice',
        entityId: inv.id,
        message: `Outstanding balance discrepancy: expected ${expectedBalance}, got ${inv.outstandingBalance}`,
      });
    }

    if (inv.status === 'PAID' && inv.outstandingBalance > 0) {
      errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Invoice marked PAID but has outstanding balance: ${inv.outstandingBalance}` });
    }

    if (inv.outstandingBalance === 0 && inv.status !== 'PAID') {
      errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Invoice has 0 balance but status is ${inv.status}` });
    }

    const dueTime = new Date(inv.dueDate).getTime();
    if (inv.outstandingBalance > 0) {
      if (dueTime < demoTime && inv.status === 'CURRENT') {
        errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Overdue invoice (due ${inv.dueDate}) has status CURRENT` });
      }
      if (dueTime > demoTime && inv.status === 'OVERDUE') {
        errors.push({ entityType: 'FeeInvoice', entityId: inv.id, message: `Future invoice (due ${inv.dueDate}) marked OVERDUE` });
      }
    }
  });

  // 5. Validate Payments
  data.payments.forEach((p) => {
    if (paymentIds.has(p.id)) {
      errors.push({ entityType: 'PaymentRecord', entityId: p.id, message: `Duplicate payment ID: ${p.id}` });
    }
    paymentIds.add(p.id);

    if (p.amount <= 0) {
      errors.push({ entityType: 'PaymentRecord', entityId: p.id, message: `Payment has non-positive amount: ${p.amount}` });
    }

    if (new Date(p.paymentDate).getTime() > demoTime) {
      errors.push({ entityType: 'PaymentRecord', entityId: p.id, message: `Payment date ${p.paymentDate} is in the future (> DEMO_DATE ${DEMO_DATE})` });
    }

    if (!invoiceIds.has(p.invoiceId)) {
      errors.push({ entityType: 'PaymentRecord', entityId: p.id, message: `Payment references non-existent invoiceId: ${p.invoiceId}` });
    }
  });

  // 6. Validate Communications
  data.communications.forEach((c) => {
    if (commIds.has(c.id)) {
      errors.push({ entityType: 'CommunicationLog', entityId: c.id, message: `Duplicate communication ID: ${c.id}` });
    }
    commIds.add(c.id);

    if (new Date(c.createdAt).getTime() > demoTime) {
      errors.push({ entityType: 'CommunicationLog', entityId: c.id, message: `Communication createdAt ${c.createdAt} is in the future (> DEMO_DATE ${DEMO_DATE})` });
    }
  });

  if (errors.length > 0) {
    const errorDetails = errors.map((e) => ` - [${e.entityType}:${e.entityId}] ${e.message}`).join('\n');
    throw new Error(`[SeedValidation] Seed data validation failed with ${errors.length} errors:\n${errorDetails}`);
  }

  console.log('[SeedValidation] Seed data validation passed cleanly (0 errors).');
  return errors;
}
