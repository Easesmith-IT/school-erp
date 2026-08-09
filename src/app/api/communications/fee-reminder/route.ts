import { NextRequest, NextResponse } from 'next/server';
import { NiwaService } from '@/services/niwa.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentId, studentId, type, customTemplate } = body;

    if (!parentId || !studentId) {
      return NextResponse.json(
        { error: 'Missing required parameters: parentId and studentId are required' },
        { status: 400 }
      );
    }

    const result = await NiwaService.sendFeeReminder({
      parentId,
      studentId,
      type: type || 'Overdue Fee',
      customTemplate,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch NIWA fee reminder' },
      { status: 500 }
    );
  }
}
