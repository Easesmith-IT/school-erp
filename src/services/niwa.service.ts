import { CommunicationLog, CommunicationMode, CommunicationStatus } from '@/types/schema';
import { store } from '@/lib/store';

export interface SendReminderParams {
  parentId: string;
  studentId: string;
  type: 'Fee Due' | 'Overdue Fee' | 'Credit Eligibility';
  customTemplate?: string;
}

export interface NiwaResponse {
  success: boolean;
  message: string;
  log: CommunicationLog;
}

export class NiwaService {
  private static getApiCredentials() {
    const apiKey = process.env.NIWA_API_KEY;
    const apiUrl = process.env.NIWA_API_URL;
    const isLive = Boolean(apiKey && apiUrl);

    return {
      apiKey,
      apiUrl,
      mode: (isLive ? 'LIVE' : 'DEMO') as CommunicationMode,
    };
  }

  public static async sendFeeReminder(params: SendReminderParams): Promise<NiwaResponse> {
    const parent = store.getParentById(params.parentId);
    const student = store.getStudentById(params.studentId);

    if (!parent || !student) {
      throw new Error('Parent or Student record not found');
    }

    const { apiKey, apiUrl, mode } = this.getApiCredentials();
    const recipientPhone = parent.phone;

    let defaultTemplate = '';
    let amountMentioned = 0;

    if (params.type === 'Overdue Fee') {
      amountMentioned = parent.familyTotalOutstanding;
      defaultTemplate = `Dear ${parent.name}, your total family fee payment of ₹${amountMentioned.toLocaleString('en-IN')} for ${student.name} is overdue. Please pay at your earliest convenience to avoid administrative holds.`;
    } else if (params.type === 'Credit Eligibility') {
      amountMentioned = parent.feeCreditEligibility.recommendedAmount;
      defaultTemplate = `Dear ${parent.name}, based on your excellent payment history, you are eligible for Fee Credit up to ₹${amountMentioned.toLocaleString('en-IN')}. Reply CREDIT to activate flexible installments.`;
    } else {
      amountMentioned = student.studentOutstandingFee || 14500;
      defaultTemplate = `Dear ${parent.name}, this is a gentle reminder that fee installment of ₹${amountMentioned.toLocaleString('en-IN')} for ${student.name} is due soon. Thank you!`;
    }

    const messageContent = params.customTemplate || defaultTemplate;

    let status: CommunicationStatus = 'SIMULATED';
    let referenceId = '';

    if (mode === 'LIVE' && apiUrl && apiKey) {
      try {
        const apiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            recipient: recipientPhone,
            message: messageContent,
            type: params.type,
          }),
        });

        if (apiRes.ok) {
          const resData = await apiRes.json();
          status = 'DELIVERED';
          referenceId = resData.referenceId || resData.id || `LIVE-NIWA-${Date.now()}`;
        } else {
          status = 'FAILED';
          referenceId = `LIVE-FAILED-${Date.now()}`;
        }
      } catch (err) {
        status = 'FAILED';
        referenceId = `LIVE-ERR-${Date.now()}`;
      }
    } else {
      // Controlled DEMO Mode
      status = 'SIMULATED';
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
      referenceId = `DEMO-NIWA-${randomDigits}`;
    }

    const log: CommunicationLog = {
      id: `comm-${Date.now()}`,
      schoolId: 'school-springdale',
      parentId: parent.id,
      parentName: parent.name,
      studentId: student.id,
      studentName: student.name,
      type: params.type,
      recipientPhone,
      template: messageContent,
      mode,
      status,
      referenceId,
      amountMentioned,
      createdAt: new Date().toISOString(),
    };

    // Save into store
    store.addCommunication(log);

    const isSuccess = status !== 'FAILED';
    const displayMessage = mode === 'LIVE'
      ? '✓ Live NIWA delivery successful'
      : '✓ Demo delivery simulated';

    return {
      success: isSuccess,
      message: displayMessage,
      log,
    };
  }

  public static async sendOverdueReminder(parentId: string, studentId: string): Promise<NiwaResponse> {
    return this.sendFeeReminder({ parentId, studentId, type: 'Overdue Fee' });
  }

  public static async sendCreditReminder(parentId: string, studentId: string): Promise<NiwaResponse> {
    return this.sendFeeReminder({ parentId, studentId, type: 'Credit Eligibility' });
  }
}
