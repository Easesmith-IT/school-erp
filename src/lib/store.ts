import { generateSeedData, SeedDataStore } from './seed-data';
import {
  CommunicationLog,
  Student,
  Parent,
  Teacher,
  FeeInvoice,
  PaymentRecord,
  DashboardMetrics,
  AssessmentRecord,
} from '@/types/schema';

class AppStore {
  private data: SeedDataStore;

  constructor() {
    this.data = generateSeedData();
  }

  public getStudents(): Student[] {
    return this.data.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find((s) => s.id === id || s.admissionNo === id);
  }

  public getTeachers(): Teacher[] {
    return this.data.teachers;
  }

  public getTeacherById(id: string): Teacher | undefined {
    return this.data.teachers.find((t) => t.id === id);
  }

  public getParents(): Parent[] {
    return this.data.parents;
  }

  public getParentById(id: string): Parent | undefined {
    return this.data.parents.find((p) => p.id === id);
  }

  public getInvoices(): FeeInvoice[] {
    return this.data.feeInvoices;
  }

  public getInvoiceById(id: string): FeeInvoice | undefined {
    return this.data.feeInvoices.find((inv) => inv.id === id || inv.invoiceNo === id);
  }

  public getPayments(): PaymentRecord[] {
    return this.data.payments;
  }

  public getCommunications(): CommunicationLog[] {
    return this.data.communications;
  }

  public addCommunication(log: CommunicationLog): void {
    this.data.communications.unshift(log); // Add newest at top
  }

  public resetDemo(): void {
    this.data = generateSeedData();
  }

  public getAssessments(): AssessmentRecord[] {
    return this.data.assessments;
  }

  public getMetrics(): DashboardMetrics {
    return this.data.metrics;
  }

  // Global search across Students, Parents, Teachers, Invoices
  public globalSearch(query: string) {
    if (!query || query.trim().length < 2) return { students: [], parents: [], teachers: [], invoices: [] };
    const q = query.toLowerCase().trim();

    const students = this.data.students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.admissionNo.includes(q) || s.className.toLowerCase().includes(q)
    ).slice(0, 5);

    const parents = this.data.parents.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q)
    ).slice(0, 5);

    const teachers = this.data.teachers.filter(
      (t) => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
    ).slice(0, 5);

    const invoices = this.data.feeInvoices.filter(
      (inv) => inv.invoiceNo.toLowerCase().includes(q) || inv.studentName.toLowerCase().includes(q)
    ).slice(0, 5);

    return { students, parents, teachers, invoices };
  }
}

const globalStoreKey = Symbol.for('SCHOOL_INTELLIGENCE_STORE');

interface CustomGlobal {
  [globalStoreKey]?: AppStore;
}

const customGlobal = globalThis as CustomGlobal;

if (!customGlobal[globalStoreKey]) {
  customGlobal[globalStoreKey] = new AppStore();
}

export const store = customGlobal[globalStoreKey]!;
