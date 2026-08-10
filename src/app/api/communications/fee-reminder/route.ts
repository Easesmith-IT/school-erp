import { NextRequest, NextResponse } from 'next/server';
import { NiwaService } from '@/services/niwa.service';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentId, studentId, type, customTemplate } = body;

    if (!parentId || typeof parentId !== 'string' || !studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid parameters: parentId and studentId must be non-empty strings' },
        { status: 400 }
      );
    }

    const parent = store.getParentById(parentId);
    const student = store.getStudentById(studentId);

    if (!parent || !student) {
      return NextResponse.json(
        { error: 'Invalid entity reference: Parent or Student record not found in canonical store' },
        { status: 404 }
      );
    }

    // Verify canonical entity relationship
    const isChildOfParent = parent.childrenIds.includes(student.id) || student.parentId === parent.id;
    if (!isChildOfParent) {
      return NextResponse.json(
        { error: 'Entity mismatch: Student does not belong to specified Parent' },
        { status: 400 }
      );
    }

    const validTypes = ['Overdue Fee', 'Fee Due', 'Credit Eligibility'];
    const reminderType = validTypes.includes(type) ? type : 'Overdue Fee';

    const result = await NiwaService.sendFeeReminder({
      parentId: parent.id,
      studentId: student.id,
      type: reminderType,
      customTemplate: typeof customTemplate === 'string' ? customTemplate : undefined,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to dispatch NIWA fee reminder';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
