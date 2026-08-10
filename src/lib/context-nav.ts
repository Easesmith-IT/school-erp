import { store } from './store';

export interface NavContext {
  id: string;
  name: string;
  type: 'Student' | 'Parent' | 'Teacher' | 'Class' | 'Finance' | 'Communication';
  backRoute: string;
}

export function parseEntityContext(fromParam: string | null): NavContext | null {
  if (!fromParam) return null;

  if (fromParam.startsWith('student-')) {
    const studentId = fromParam;
    const student = store.getStudentById(studentId);
    return {
      id: studentId,
      name: student ? student.name : 'Student Profile',
      type: 'Student',
      backRoute: `/students/${studentId}`,
    };
  }

  if (fromParam.startsWith('parent-')) {
    const parentId = fromParam;
    const parent = store.getParentById(parentId);
    return {
      id: parentId,
      name: parent ? parent.name : 'Parent Profile',
      type: 'Parent',
      backRoute: `/parents/${parentId}`,
    };
  }

  if (fromParam.startsWith('teacher-')) {
    const teacherId = fromParam;
    const teacher = store.getTeacherById(teacherId);
    return {
      id: teacherId,
      name: teacher ? teacher.name : 'Teacher Profile',
      type: 'Teacher',
      backRoute: `/teachers/${teacherId}`,
    };
  }

  if (fromParam.startsWith('class-')) {
    const className = fromParam.replace('class-', '').toUpperCase();
    return { id: fromParam, name: `Class ${className}`, type: 'Class', backRoute: '/students/class' };
  }

  if (fromParam === 'risk') {
    return { id: 'risk', name: 'Student Risk Dashboard', type: 'Student', backRoute: '/students/risk' };
  }

  if (fromParam === 'aging') {
    return { id: 'aging', name: 'Aging Portfolio', type: 'Finance', backRoute: '/finance/aging' };
  }

  if (fromParam === 'recovery') {
    return { id: 'recovery', name: 'Recovery Queue', type: 'Communication', backRoute: '/communications/recovery' };
  }

  return null;
}
