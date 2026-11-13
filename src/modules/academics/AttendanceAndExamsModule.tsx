import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Plus,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import {
  calculateAttendanceMetrics,
  calculateCGPA,
  calculateSGPA,
  evaluateGrade,
} from '../../utils/academicLogic';

export const SmartAttendanceModule: React.FC = () => {
  const {
    currentUser,
    students,
    courses,
    attendanceSessions,
    correctionRequests,
    createAttendanceSession,
    closeAttendanceSession,
    submitStudentQRCheckIn,
    resolveCorrectionRequest,
  } = useCampus();

  const [selectedCourseCode, setSelectedCourseCode] = useState(courses[0]?.code || 'CS501');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00');
  const [scanCodeInput, setScanCodeInput] = useState(
    attendanceSessions[0]?.sessionCode || 'ORBIT-CS501-8842'
  );
  const [scanStudentId, setScanStudentId] = useState(currentUser.studentId || 'STU-2026-002');
  const [scanFeedback, setScanFeedback] = useState<{ valid: boolean; message: string } | null>(null);

  const canManageAttendance =
    currentUser.role === 'faculty' ||
    currentUser.role === 'college_admin' ||
    currentUser.role === 'super_admin';

  const activeSession = attendanceSessions.find((s) => s.status === 'active') || attendanceSessions[0];

  const handleLaunchSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === selectedCourseCode) || courses[0];
    if (!course) return;
    const created = await createAttendanceSession({
      subjectCode: course.code,
      subjectName: course.title,
      department: course.department,
      semester: course.semester,
      timeSlot,
    });
    setScanCodeInput(created.sessionCode);
  };

  const handleVerifyQRScan = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitStudentQRCheckIn(scanCodeInput, scanStudentId);
    setScanFeedback(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: QR Attendance Generator & Scanner */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                QR-Code Smart Attendance Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Server-validated session code with duplicate scan protection
              </p>
            </div>
            <QrCode className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
          </div>

          {activeSession && (
            <div className="mt-5 flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-950">
              <div className="rounded-xl bg-white p-3 shadow-xs">
                <QRCodeSVG value={activeSession.sessionCode} size={148} level="M" />
              </div>
              <div className="mt-3 font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {activeSession.sessionCode}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {activeSession.subjectCode}: {activeSession.subjectName} · {activeSession.timeSlot}
              </div>
              <div className="mt-2 text-xs font-mono text-blue-700 dark:text-cyan-400 tabular-nums">
                Status: {activeSession.status.toUpperCase()} · Checked-in: {activeSession.presentStudentIds.length}/{activeSession.totalStudents}
              </div>
              {canManageAttendance && activeSession.status === 'active' && (
                <button
                  type="button"
                  onClick={() => closeAttendanceSession(activeSession.id)}
                  className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                >
                  Lock &amp; Close Session
                </button>
              )}
            </div>
          )}

          {/* Student QR Check-In Simulator / Verification */}
          <form onSubmit={handleVerifyQRScan} className="mt-5 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Student QR Check-In &amp; Duplicate Guard Verifier
            </h4>
            {scanFeedback && (
              <div
                role="alert"
                className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                  scanFeedback.valid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {scanFeedback.message}
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={scanCodeInput}
                onChange={(e) => setScanCodeInput(e.target.value)}
                placeholder="Session QR Code"
                aria-label="Session QR Code"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <select
                value={scanStudentId}
                onChange={(e) => setScanStudentId(e.target.value)}
                aria-label="Student ID checking in"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.studentId}>
                    {s.studentId} — {s.fullName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
            >
              Verify &amp; Mark Attendance
            </button>
          </form>
        </div>

        {/* Right: Launch Session + Student Attendance Threshold Analytics */}
        <div className="space-y-6 lg:col-span-7">
          {canManageAttendance && (
            <form
              onSubmit={handleLaunchSession}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Generate New Faculty Attendance Session
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  aria-label="Select course for attendance"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="Lecture Slot (e.g., 11:00 - 12:00)"
                  aria-label="Lecture time slot"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate QR Session</span>
                </button>
              </div>
            </form>
          )}

          {/* Attendance Analytics & <75% Threshold Register */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Student Attendance Analytics &amp; 75% Mandatory Threshold Monitor
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4 text-right">Conducted</th>
                    <th className="py-3 px-4 text-right">Attended</th>
                    <th className="py-3 px-4 text-right">Missed</th>
                    <th className="py-3 px-4 text-right">Attendance %</th>
                    <th className="py-3 px-4">Threshold Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
                  {students.map((stu) => {
                    const stats = calculateAttendanceMetrics(stu.totalClasses, stu.attendedClasses);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{stu.fullName}</div>
                          <div className="text-slate-500">{stu.studentId} · {stu.department}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{stats.totalConducted}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{stats.attended}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{stats.missed}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          <span className={stats.isBelowThreshold ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {stats.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {stats.isBelowThreshold ? (
                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              Warning: Needs {stats.classesNeededFor75} classes for 75%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              Eligible (&ge;75%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance Correction Requests */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attendance Correction Requests
            </h3>
            <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
              {correctionRequests.map((req) => (
                <div key={req.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {req.studentName} ({req.studentId}) · {req.subjectCode} on {req.date}
                    </div>
                    <div className="text-xs text-slate-500">{req.reason} · Status: <strong>{req.status}</strong></div>
                  </div>
                  {canManageAttendance && req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => resolveCorrectionRequest(req.id, 'Approved')}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Approve Credit
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveCorrectionRequest(req.id, 'Rejected')}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExaminationAndResultsModule: React.FC = () => {
  const { currentUser, students, courses, exams, marks, gradingScheme, addOrUpdateMark } = useCampus();
  const [selectedStudentId, setSelectedStudentId] = useState(
    currentUser.studentId || students[0]?.studentId || 'STU-2026-001'
  );
  const [markForm, setMarkForm] = useState({
    subjectCode: 'CS501',
    internalMarks: 28,
    externalMarks: 65,
  });

  const canEnterMarks =
    currentUser.role === 'faculty' ||
    currentUser.role === 'college_admin' ||
    currentUser.role === 'super_admin';

  const studentMarks = useMemo(
    () => marks.filter((m) => m.studentId === selectedStudentId),
    [marks, selectedStudentId]
  );

  const sgpaCalculation = useMemo(() => {
    return calculateSGPA(
      studentMarks.map((m) => ({
        subjectCode: m.subjectCode,
        credits: m.credits,
        marksObtained: m.internalMarks + m.externalMarks,
        maxMarks: m.maxMarks,
      })),
      gradingScheme
    );
  }, [studentMarks, gradingScheme]);

  const targetStudent = students.find((s) => s.studentId === selectedStudentId) || students[0];
  const cumulativeCgpa = useMemo(() => {
    if (!targetStudent) return 0;
    return calculateCGPA([
      ...targetStudent.sgpaHistory,
      ...(sgpaCalculation.totalCredits > 0
        ? [{ sgpa: sgpaCalculation.sgpa, credits: sgpaCalculation.totalCredits }]
        : []),
    ]);
  }, [targetStudent, sgpaCalculation]);

  const handleSaveMark = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === markForm.subjectCode) || courses[0];
    if (!course || !targetStudent) return;
    addOrUpdateMark({
      examId: 'exm_1',
      studentId: targetStudent.studentId,
      studentName: targetStudent.fullName,
      department: targetStudent.department,
      semester: targetStudent.semester,
      subjectCode: course.code,
      subjectName: course.title,
      credits: course.credits,
      internalMarks: Number(markForm.internalMarks),
      externalMarks: Number(markForm.externalMarks),
      maxMarks: 100,
      published: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Selected Student Record</div>
          <select
            aria-label="Select student for transcript"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={currentUser.role === 'student' || currentUser.role === 'parent'}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {students.map((s) => (
              <option key={s.id} value={s.studentId}>
                {s.studentId} — {s.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Current Semester SGPA</div>
          <div className="mt-1 font-mono text-2xl font-bold text-blue-700 dark:text-cyan-400 tabular-nums">
            {sgpaCalculation.sgpa.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">{sgpaCalculation.totalCredits} Credits Evaluated</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Cumulative CGPA</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {cumulativeCgpa.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">Credit-Weighted Across Semesters</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Grading Formula</div>
          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
            10-Point Absolute &amp; Relative Scale
          </div>
          <div className="text-xs text-slate-500">O (10) · A+ (9) · A (8) · B+ (7)</div>
        </div>
      </div>

      {/* Faculty Marks Entry Form */}
      {canEnterMarks && (
        <form
          onSubmit={handleSaveMark}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Enter / Update Subject-Wise Examination Marks (Faculty &amp; Exam Controller)
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <select
              value={markForm.subjectCode}
              onChange={(e) => setMarkForm({ ...markForm, subjectCode: e.target.value })}
              aria-label="Subject code for marks"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.title} ({c.credits} Cr)
                </option>
              ))}
            </select>
            <div>
              <input
                type="number"
                min={0}
                max={30}
                value={markForm.internalMarks}
                onChange={(e) => setMarkForm({ ...markForm, internalMarks: Number(e.target.value) })}
                placeholder="Internal Marks (Max 30)"
                aria-label="Internal assessment marks"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <input
                type="number"
                min={0}
                max={70}
                value={markForm.externalMarks}
                onChange={(e) => setMarkForm({ ...markForm, externalMarks: Number(e.target.value) })}
                placeholder="End-Sem Marks (Max 70)"
                aria-label="External examination marks"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
            >
              Publish Subject Marks
            </button>
          </div>
        </form>
      )}

      {/* Official Semester Grade Transcript Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Published Semester Grade Sheet — {targetStudent?.fullName} ({targetStudent?.studentId})
            </h3>
            <p className="text-xs text-slate-500">
              {targetStudent?.department} · Semester {targetStudent?.semester}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Subject Code &amp; Title</th>
                <th className="py-3 px-4 text-right">Credits</th>
                <th className="py-3 px-4 text-right">Internal (30)</th>
                <th className="py-3 px-4 text-right">External (70)</th>
                <th className="py-3 px-4 text-right">Total (100)</th>
                <th className="py-3 px-4 text-right">Grade</th>
                <th className="py-3 px-4 text-right">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {studentMarks.map((m) => {
                const total = m.internalMarks + m.externalMarks;
                const evaluated = evaluateGrade(total, m.maxMarks, gradingScheme);
                return (
                  <tr key={m.id}>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {m.subjectCode} — {m.subjectName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{m.credits}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{m.internalMarks}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{m.externalMarks}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">{total}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 dark:text-cyan-400">
                      {evaluated.grade}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{evaluated.gradePoint}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Examination Schedule Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Published Examination Schedules
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Exam Type</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Examination Venue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {exams.map((ex) => (
                <tr key={ex.id}>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {ex.subjectCode}: {ex.subjectName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ex.examType}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                    {ex.date} · {ex.time}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ex.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TimetableManagementModule: React.FC = () => {
  const { currentUser, timetable, courses, faculty, addTimetableSlot } = useCampus();
  const [slotForm, setSlotForm] = useState({
    day: 'Monday',
    timeSlot: '09:00 - 10:00',
    subjectCode: 'CS501',
    room: 'LH-301',
  });
  const [conflictResult, setConflictResult] = useState<{
    hasConflict: boolean;
    reasons: string[];
    successMsg?: string;
  } | null>(null);

  const canEditTimetable =
    currentUser.role === 'college_admin' || currentUser.role === 'super_admin';

  const handleScheduleSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === slotForm.subjectCode) || courses[0];
    if (!course) return;
    const conflict = addTimetableSlot({
      day: slotForm.day,
      timeSlot: slotForm.timeSlot,
      department: course.department,
      semester: course.semester,
      subjectCode: course.code,
      subjectName: course.title,
      facultyId: course.facultyId,
      facultyName: course.facultyName,
      room: slotForm.room,
    });
    if (conflict.hasConflict) {
      setConflictResult({ hasConflict: true, reasons: conflict.reasons });
    } else {
      setConflictResult({
        hasConflict: false,
        reasons: [],
        successMsg: `Scheduled ${course.code} on ${slotForm.day} (${slotForm.timeSlot}) in ${slotForm.room} with zero conflicts.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {canEditTimetable && (
        <form
          onSubmit={handleScheduleSlot}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interactive Timetable Scheduler &amp; Automatic Collision Engine
              </h3>
              <p className="text-xs text-slate-500">
                Validates faculty availability, classroom occupancy, and student cohort schedules before publishing.
              </p>
            </div>
            <Calendar className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
          </div>

          {conflictResult && (
            <div
              role="alert"
              className={`mt-4 rounded-lg border p-3.5 text-xs ${
                conflictResult.hasConflict
                  ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              {conflictResult.hasConflict ? (
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Scheduling Conflict Detected — Publication Blocked:</span>
                  </div>
                  <ul className="mt-1.5 list-disc pl-5 space-y-1">
                    {conflictResult.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="font-semibold">{conflictResult.successMsg}</div>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
            <select
              value={slotForm.day}
              onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
              aria-label="Timetable day"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={slotForm.timeSlot}
              onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
              aria-label="Timetable time slot"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '14:00 - 16:00'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={slotForm.subjectCode}
              onChange={(e) => setSlotForm({ ...slotForm, subjectCode: e.target.value })}
              aria-label="Timetable course"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.facultyName}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={slotForm.room}
              onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
              placeholder="Classroom (e.g., LH-301)"
              aria-label="Classroom code"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
            >
              Validate &amp; Schedule
            </button>
          </div>
        </form>
      )}

      {/* Master Weekly Timetable Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Master Weekly Academic Timetable
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Day &amp; Time Slot</th>
                <th className="py-3 px-4">Subject Code &amp; Title</th>
                <th className="py-3 px-4">Department &amp; Sem</th>
                <th className="py-3 px-4">Assigned Faculty</th>
                <th className="py-3 px-4">Classroom / Lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {timetable.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                    {slot.day} · {slot.timeSlot}
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-700 dark:text-cyan-400">
                    {slot.subjectCode}: {slot.subjectName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {slot.department} · Sem {slot.semester}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{slot.facultyName}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{slot.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
