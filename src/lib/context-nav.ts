/**
 * Global Entity Context Navigation Helper
 * Handles mapping of `?from=` entity query parameters into human-readable context labels and routes.
 */

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
    if (studentId === 'student-riya') {
      return { id: studentId, name: 'Riya Sharma', type: 'Student', backRoute: '/students/student-riya' };
    }
    if (studentId === 'student-aarav') {
      return { id: studentId, name: 'Aarav Sharma', type: 'Student', backRoute: '/students/student-aarav' };
    }
    return { id: studentId, name: 'Student Profile', type: 'Student', backRoute: `/students/${studentId}` };
  }

  if (fromParam.startsWith('parent-')) {
    const parentId = fromParam;
    if (parentId === 'parent-raj') {
      return { id: parentId, name: 'Raj Sharma', type: 'Parent', backRoute: '/parents/parent-raj' };
    }
    return { id: parentId, name: 'Parent Profile', type: 'Parent', backRoute: `/parents/${parentId}` };
  }

  if (fromParam.startsWith('teacher-')) {
    const teacherId = fromParam;
    if (teacherId === 'teacher-1') {
      return { id: teacherId, name: 'Priya Sharma', type: 'Teacher', backRoute: '/teachers/teacher-1' };
    }
    return { id: teacherId, name: 'Teacher Profile', type: 'Teacher', backRoute: `/teachers/${teacherId}` };
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
