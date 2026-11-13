/**
 * Pure academic calculation, grading, attendance, conflict detection, and payload validation logic
 * for Campus Orbit.
 */

export interface GradeRange {
  minPercentage: number;
  grade: string;
  gradePoint: number;
}

export const DEFAULT_GRADING_SCHEME: GradeRange[] = [
  { minPercentage: 90, grade: 'O', gradePoint: 10 },
  { minPercentage: 80, grade: 'A+', gradePoint: 9 },
  { minPercentage: 70, grade: 'A', gradePoint: 8 },
  { minPercentage: 60, grade: 'B+', gradePoint: 7 },
  { minPercentage: 50, grade: 'B', gradePoint: 6 },
  { minPercentage: 40, grade: 'C', gradePoint: 5 },
  { minPercentage: 0, grade: 'F', gradePoint: 0 },
];

export interface SubjectMarkInput {
  subjectCode: string;
  credits: number;
  marksObtained: number;
  maxMarks: number;
}

export interface CalculatedSubjectGrade extends SubjectMarkInput {
  percentage: number;
  grade: string;
  gradePoint: number;
  creditPoints: number;
}

export function evaluateGrade(
  marksObtained: number,
  maxMarks: number,
  scheme: GradeRange[] = DEFAULT_GRADING_SCHEME
): { percentage: number; grade: string; gradePoint: number } {
  if (maxMarks <= 0) {
    return { percentage: 0, grade: 'F', gradePoint: 0 };
  }
  const clampedMarks = Math.max(0, Math.min(marksObtained, maxMarks));
  const percentage = Number(((clampedMarks / maxMarks) * 100).toFixed(2));
  const sorted = [...scheme].sort((a, b) => b.minPercentage - a.minPercentage);
  for (const r of sorted) {
    if (percentage >= r.minPercentage) {
      return { percentage, grade: r.grade, gradePoint: r.gradePoint };
    }
  }
  return { percentage, grade: 'F', gradePoint: 0 };
}

export function calculateSGPA(
  subjects: SubjectMarkInput[],
  scheme: GradeRange[] = DEFAULT_GRADING_SCHEME
): { sgpa: number; totalCredits: number; earnedCreditPoints: number; breakdown: CalculatedSubjectGrade[] } {
  let totalCredits = 0;
  let earnedCreditPoints = 0;
  const breakdown: CalculatedSubjectGrade[] = subjects.map((sub) => {
    const { percentage, grade, gradePoint } = evaluateGrade(sub.marksObtained, sub.maxMarks, scheme);
    const creditPoints = sub.credits * gradePoint;
    totalCredits += sub.credits;
    earnedCreditPoints += creditPoints;
    return {
      ...sub,
      percentage,
      grade,
      gradePoint,
      creditPoints,
    };
  });
  const sgpa = totalCredits > 0 ? Number((earnedCreditPoints / totalCredits).toFixed(2)) : 0;
  return { sgpa, totalCredits, earnedCreditPoints, breakdown };
}

export function calculateCGPA(
  semesters: Array<{ sgpa: number; credits: number }>
): number {
  let totalCredits = 0;
  let weightedSum = 0;
  for (const sem of semesters) {
    if (sem.credits > 0) {
      totalCredits += sem.credits;
      weightedSum += sem.sgpa * sem.credits;
    }
  }
  return totalCredits > 0 ? Number((weightedSum / totalCredits).toFixed(2)) : 0;
}

export interface AttendanceStats {
  totalConducted: number;
  attended: number;
  missed: number;
  percentage: number;
  isBelowThreshold: boolean;
  classesNeededFor75: number;
}

export function calculateAttendanceMetrics(totalConducted: number, attended: number): AttendanceStats {
  const safeTotal = Math.max(0, Math.floor(totalConducted));
  const safeAttended = Math.max(0, Math.min(safeTotal, Math.floor(attended)));
  const missed = safeTotal - safeAttended;
  const percentage = safeTotal > 0 ? Number(((safeAttended / safeTotal) * 100).toFixed(1)) : 100;
  const isBelowThreshold = safeTotal > 0 && percentage < 75;
  // Solve (attended + x) / (total + x) >= 0.75 => attended + x >= 0.75*total + 0.75*x => 0.25*x >= 0.75*total - attended => x >= 3*total - 4*attended
  const rawNeeded = 3 * safeTotal - 4 * safeAttended;
  const classesNeededFor75 = rawNeeded > 0 ? Math.ceil(rawNeeded) : 0;

  return {
    totalConducted: safeTotal,
    attended: safeAttended,
    missed,
    percentage,
    isBelowThreshold,
    classesNeededFor75,
  };
}

export interface TimetableSlotEntry {
  id: string;
  day: string;
  timeSlot: string;
  department: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  room: string;
}

export interface TimetableConflict {
  hasConflict: boolean;
  reasons: string[];
}

export function detectTimetableConflicts(
  existingSlots: TimetableSlotEntry[],
  candidate: Omit<TimetableSlotEntry, 'id'>,
  ignoreSlotId?: string
): TimetableConflict {
  const reasons: string[] = [];
  for (const slot of existingSlots) {
    if (ignoreSlotId && slot.id === ignoreSlotId) continue;
    if (slot.day === candidate.day && slot.timeSlot === candidate.timeSlot) {
      if (slot.facultyId === candidate.facultyId) {
        reasons.push(`Faculty ${candidate.facultyName} is already assigned to ${slot.subjectCode} in ${slot.room} at ${candidate.day} ${candidate.timeSlot}.`);
      }
      if (slot.room.trim().toLowerCase() === candidate.room.trim().toLowerCase()) {
        reasons.push(`Classroom ${candidate.room} is already occupied by ${slot.department} Sem ${slot.semester} (${slot.subjectCode}) at ${candidate.day} ${candidate.timeSlot}.`);
      }
      if (slot.department === candidate.department && slot.semester === candidate.semester) {
        reasons.push(`Student group ${candidate.department} Sem ${candidate.semester} already has ${slot.subjectCode} scheduled at ${candidate.day} ${candidate.timeSlot}.`);
      }
    }
  }
  return {
    hasConflict: reasons.length > 0,
    reasons,
  };
}

export function validateQRCheckIn(
  sessionStatus: 'active' | 'closed',
  sessionCode: string,
  submittedCode: string,
  alreadyCheckedInStudentIds: string[],
  studentId: string
): { valid: boolean; error?: string } {
  if (sessionStatus !== 'active') {
    return { valid: false, error: 'Attendance session is closed and no longer accepts submissions.' };
  }
  if (sessionCode.trim().toUpperCase() !== submittedCode.trim().toUpperCase()) {
    return { valid: false, error: 'Invalid or expired QR session code.' };
  }
  if (alreadyCheckedInStudentIds.includes(studentId)) {
    return { valid: false, error: `Duplicate submission blocked: Student ${studentId} is already marked present.` };
  }
  return { valid: true };
}

export const ID_REGEX_PATTERN = /^[a-zA-Z0-9_\-]+$/;

export function sanitizeAndValidateId(rawId: string, maxLength = 128): string {
  const cleaned = rawId.trim().replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : 'doc_1';
}

export function truncateString(val: string, maxLength: number): string {
  return val.trim().slice(0, maxLength);
}
