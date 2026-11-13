import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendanceMetrics,
  calculateCGPA,
  calculateSGPA,
  detectTimetableConflicts,
  evaluateGrade,
  validateQRCheckIn,
} from './academicLogic';

test('evaluateGrade and calculateSGPA follow configured grading rules accurately', () => {
  const g1 = evaluateGrade(92, 100);
  assert.equal(g1.grade, 'O');
  assert.equal(g1.gradePoint, 10);

  const sgpaRes = calculateSGPA([
    { subjectCode: 'CS501', credits: 4, marksObtained: 91, maxMarks: 100 }, // 10 * 4 = 40
    { subjectCode: 'CS502', credits: 3, marksObtained: 82, maxMarks: 100 }, // 9 * 3 = 27
    { subjectCode: 'CS503', credits: 3, marksObtained: 74, maxMarks: 100 }, // 8 * 3 = 24
  ]);
  assert.equal(sgpaRes.totalCredits, 10);
  assert.equal(sgpaRes.earnedCreditPoints, 91);
  assert.equal(sgpaRes.sgpa, 9.1);
});

test('calculateCGPA computes credit-weighted average across semesters', () => {
  const cgpa = calculateCGPA([
    { sgpa: 9.0, credits: 20 },
    { sgpa: 8.5, credits: 20 },
  ]);
  assert.equal(cgpa, 8.75);
});

test('calculateAttendanceMetrics flags <75% attendance and calculates classes needed', () => {
  const low = calculateAttendanceMetrics(40, 26); // 65%
  assert.equal(low.percentage, 65);
  assert.equal(low.isBelowThreshold, true);
  assert.equal(low.classesNeededFor75, 16); // (26+16)/(40+16) = 42/56 = 75%

  const good = calculateAttendanceMetrics(40, 34); // 85%
  assert.equal(good.percentage, 85);
  assert.equal(good.isBelowThreshold, false);
  assert.equal(good.classesNeededFor75, 0);
});

test('detectTimetableConflicts identifies faculty, room, and student group collisions', () => {
  const existing = [
    {
      id: 'slot_1',
      day: 'Monday',
      timeSlot: '09:00 - 10:00',
      department: 'Computer Science',
      semester: 5,
      subjectCode: 'CS501',
      subjectName: 'Distributed Systems',
      facultyId: 'FAC-101',
      facultyName: 'Dr. Aris Thorne',
      room: 'LH-301',
    },
  ];

  const conflictRes = detectTimetableConflicts(existing, {
    day: 'Monday',
    timeSlot: '09:00 - 10:00',
    department: 'Electronics',
    semester: 3,
    subjectCode: 'EC302',
    subjectName: 'Embedded Logic',
    facultyId: 'FAC-101',
    facultyName: 'Dr. Aris Thorne',
    room: 'LH-301',
  });
  assert.equal(conflictRes.hasConflict, true);
  assert.equal(conflictRes.reasons.length, 2); // faculty + room
});

test('validateQRCheckIn blocks duplicate student attendance and expired codes', () => {
  const ok = validateQRCheckIn('active', 'ORBIT-8821', 'orbit-8821', ['STU-1001'], 'STU-1002');
  assert.equal(ok.valid, true);

  const dup = validateQRCheckIn('active', 'ORBIT-8821', 'ORBIT-8821', ['STU-1001', 'STU-1002'], 'STU-1002');
  assert.equal(dup.valid, false);
  assert.ok(dup.error?.includes('Duplicate submission blocked'));

  const closed = validateQRCheckIn('closed', 'ORBIT-8821', 'ORBIT-8821', [], 'STU-1003');
  assert.equal(closed.valid, false);
});
