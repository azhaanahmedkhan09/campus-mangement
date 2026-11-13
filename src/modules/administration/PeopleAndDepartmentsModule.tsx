import React, { useMemo, useState } from 'react';
import {
  Building2,
  Download,
  Eye,
  FileUp,
  Plus,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { Student } from '../../types/campus';

export const StudentManagementModule: React.FC = () => {
  const {
    students,
    departments,
    addStudent,
    updateStudentStatus,
    bulkImportStudentsCsv,
  } = useCampus();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [semFilter, setSemFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState(
    'Name,Department,Course,Semester\nIshaan Verma,Computer Science,B.Tech CSE,5\nAnanya Sen,Data Science & AI,B.Tech AI & DS,3'
  );
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState('');

  const [newStu, setNewStu] = useState({
    fullName: '',
    email: '',
    phone: '+91 98201 55100',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    semester: 5,
    section: 'A',
    guardianName: '',
    guardianPhone: '+91 98201 55101',
    attendancePct: 92,
    cgpa: 8.8,
    feeStatus: 'Paid' as Student['feeStatus'],
  });

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesDept = deptFilter === 'All' || s.department === deptFilter;
      const matchesSem = semFilter === 'All' || String(s.semester) === semFilter;
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      return matchesDept && matchesSem && matchesQuery;
    });
  }, [students, deptFilter, semFilter, search]);

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStu.fullName.trim() || !newStu.email.trim()) {
      setFeedback('Please provide student full name and institutional email.');
      return;
    }
    const created = await addStudent({
      ...newStu,
      totalClasses: 50,
      attendedClasses: Math.round((newStu.attendancePct / 100) * 50),
      sgpaHistory: [{ semester: Math.max(1, newStu.semester - 1), sgpa: newStu.cgpa, credits: 20 }],
      totalFee: 145000,
      paidFee: newStu.feeStatus === 'Paid' ? 145000 : 80000,
      status: 'Active',
      skills: ['Algorithms', 'System Design'],
      certifications: [],
    });
    setShowAddForm(false);
    setNewStu({ ...newStu, fullName: '', email: '', guardianName: '' });
    setFeedback(`Enrolled ${created.fullName} with generated ID ${created.studentId}.`);
  };

  const handleExportCsv = () => {
    const header = 'StudentID,FullName,Department,Course,Semester,AttendancePct,CGPA,FeeStatus,Status\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `${s.studentId},"${s.fullName}","${s.department}","${s.course}",${s.semester},${s.attendancePct},${s.cgpa},${s.feeStatus},${s.status}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campus_orbit_students_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    const count = bulkImportStudentsCsv(csvText);
    setShowCsvModal(false);
    setFeedback(`Successfully imported ${count} student records from CSV batch.`);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Student Information Management System
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete lifecycle directory · Automated ID generation · Bulk CSV Import/Export
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileUp className="h-3.5 w-3.5" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
          {feedback}
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddStudentSubmit}
          className="rounded-xl border border-blue-200 bg-white p-6 dark:border-blue-900 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enroll New Student Record</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="stu-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="stu-name"
                type="text"
                required
                value={newStu.fullName}
                onChange={(e) => setNewStu({ ...newStu, fullName: e.target.value })}
                placeholder="e.g., Siddharth Rao"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="stu-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Institutional Email
              </label>
              <input
                id="stu-email"
                type="email"
                required
                value={newStu.email}
                onChange={(e) => setNewStu({ ...newStu, email: e.target.value })}
                placeholder="siddharth.rao@campusorbit.edu"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="stu-dept" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Department
              </label>
              <select
                id="stu-dept"
                value={newStu.department}
                onChange={(e) => setNewStu({ ...newStu, department: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stu-course" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Course Program
              </label>
              <input
                id="stu-course"
                type="text"
                value={newStu.course}
                onChange={(e) => setNewStu({ ...newStu, course: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="stu-sem" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Semester
              </label>
              <input
                id="stu-sem"
                type="number"
                min={1}
                max={8}
                value={newStu.semester}
                onChange={(e) => setNewStu({ ...newStu, semester: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="stu-guardian" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Parent / Guardian Name
              </label>
              <input
                id="stu-guardian"
                type="text"
                value={newStu.guardianName}
                onChange={(e) => setNewStu({ ...newStu, guardianName: e.target.value })}
                placeholder="Parent Full Name"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Generate Student ID &amp; Save
            </button>
          </div>
        </form>
      )}

      {showCsvModal && (
        <form
          onSubmit={handleBulkCsvImport}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bulk CSV Student Import</h3>
          <p className="mt-1 text-xs text-slate-500">Format: Name,Department,Course,Semester</p>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCsvModal(false)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white"
            >
              Import Records
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID (STU-2026-001), or email..."
            aria-label="Search students"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <select
          aria-label="Filter students by department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter students by semester"
          value={semFilter}
          onChange={(e) => setSemFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="All">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={String(sem)}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Full Name &amp; Email</th>
                <th className="py-3 px-4">Department &amp; Course</th>
                <th className="py-3 px-4 text-right">Sem</th>
                <th className="py-3 px-4 text-right">Attendance</th>
                <th className="py-3 px-4 text-right">CGPA</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700 dark:text-cyan-400 tabular-nums">
                    {stu.studentId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{stu.fullName}</div>
                    <div className="text-slate-500">{stu.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {stu.department} · {stu.course}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{stu.semester}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                    <span className={stu.attendancePct < 75 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {stu.attendancePct}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">{stu.cgpa.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {stu.feeStatus} · {stu.status}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(stu)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateStudentStatus(stu.id, stu.status === 'Active' ? 'Inactive' : 'Active')
                        }
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        {stu.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Profile Drawer/Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Student Profile Details"
        >
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <div className="font-mono text-xs text-blue-700 dark:text-cyan-400">
                  {selectedStudent.studentId} · {selectedStudent.status}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500">
                  {selectedStudent.department} · {selectedStudent.course} · Semester {selectedStudent.semester}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="text-slate-500">Attendance</div>
                <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {selectedStudent.attendancePct}% ({selectedStudent.attendedClasses}/{selectedStudent.totalClasses})
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="text-slate-500">Cumulative CGPA</div>
                <div className="mt-1 font-mono text-base font-bold text-blue-700 dark:text-cyan-400 tabular-nums">
                  {selectedStudent.cgpa.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="text-slate-500">Fee Ledger</div>
                <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {selectedStudent.feeStatus} (₹{selectedStudent.paidFee.toLocaleString()})
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="text-slate-500">Guardian Contact</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">{selectedStudent.guardianName}</div>
                <div className="font-mono text-slate-500">{selectedStudent.guardianPhone}</div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Verified Technical Skills &amp; Certifications</div>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Skills: {selectedStudent.skills.join(' · ') || 'None listed'}
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Certifications: {selectedStudent.certifications.join(' · ') || 'None listed'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FacultyManagementModule: React.FC = () => {
  const { faculty, departments, addFaculty } = useCampus();
  const [showAdd, setShowAdd] = useState(false);
  const [facForm, setFacForm] = useState({
    fullName: '',
    email: '',
    phone: '+91 98200 11099',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    qualification: 'Ph.D. Computer Science',
    experienceYears: 6,
    assignedSubjects: 'CS501, CS504',
  });

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facForm.fullName.trim() || !facForm.email.trim()) return;
    addFaculty({
      fullName: facForm.fullName,
      email: facForm.email,
      phone: facForm.phone,
      department: facForm.department,
      designation: facForm.designation,
      qualification: facForm.qualification,
      experienceYears: Number(facForm.experienceYears) || 5,
      assignedSubjects: facForm.assignedSubjects.split(',').map((s) => s.trim()),
      assignedSemesters: [5, 7],
      weeklyHours: 14,
      maxWeeklyHours: 18,
      attendancePct: 98.0,
      menteesCount: 10,
      status: 'Active',
    });
    setShowAdd(false);
    setFacForm({ ...facForm, fullName: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Faculty Administration &amp; Workload Registry
          </h2>
          <p className="text-xs text-slate-500">
            Subject allocations · Teaching hours · Mentorship responsibilities
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateFaculty}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appoint New Faculty</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              value={facForm.fullName}
              onChange={(e) => setFacForm({ ...facForm, fullName: e.target.value })}
              placeholder="Full Name (e.g., Dr. Rohan Kulkarni)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="email"
              required
              value={facForm.email}
              onChange={(e) => setFacForm({ ...facForm, email: e.target.value })}
              placeholder="Institutional Email"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <select
              value={facForm.department}
              onChange={(e) => setFacForm({ ...facForm, department: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={facForm.qualification}
              onChange={(e) => setFacForm({ ...facForm, qualification: e.target.value })}
              placeholder="Qualification"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="text"
              value={facForm.assignedSubjects}
              onChange={(e) => setFacForm({ ...facForm, assignedSubjects: e.target.value })}
              placeholder="Assigned Subject Codes (CS501, CS502)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Save Faculty Profile
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-4">Name &amp; Qualification</th>
                <th className="py-3 px-4">Department &amp; Designation</th>
                <th className="py-3 px-4">Assigned Subjects</th>
                <th className="py-3 px-4 text-right">Weekly Workload</th>
                <th className="py-3 px-4 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700 dark:text-cyan-400 tabular-nums">
                    {f.facultyId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{f.fullName}</div>
                    <div className="text-slate-500">{f.qualification} · {f.experienceYears} yrs exp</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {f.department} · {f.designation}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                    {f.assignedSubjects.join(' · ')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {f.weeklyHours}/{f.maxWeeklyHours} hrs
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {f.attendancePct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const DepartmentAndCourseModule: React.FC = () => {
  const { departments, courses, faculty, addDepartment, addCourse } = useCampus();
  const [deptForm, setDeptForm] = useState({ code: '', name: '', hodName: 'Dr. Aris Thorne' });
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    department: 'Computer Science',
    semester: 5,
    credits: 4,
    type: 'Core' as 'Core' | 'Elective' | 'Laboratory',
  });

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.code.trim() || !deptForm.name.trim()) return;
    addDepartment({
      code: deptForm.code.toUpperCase(),
      name: deptForm.name,
      hodName: deptForm.hodName,
      hodFacultyId: 'FAC-101',
      programs: [`B.Tech ${deptForm.code.toUpperCase()}`],
      totalStudents: 120,
      totalFaculty: 12,
      avgAttendance: 86.0,
      avgCgpa: 8.5,
      annualBudgetAllocated: 10000000,
      annualBudgetUtilized: 6500000,
    });
    setDeptForm({ code: '', name: '', hodName: 'Dr. Aris Thorne' });
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.title.trim()) return;
    addCourse({
      code: courseForm.code.toUpperCase(),
      title: courseForm.title,
      department: courseForm.department,
      program: 'B.Tech',
      semester: Number(courseForm.semester) || 5,
      credits: Number(courseForm.credits) || 4,
      facultyId: faculty[0]?.facultyId || 'FAC-101',
      facultyName: faculty[0]?.fullName || 'Dr. Aris Thorne',
      enrolledCount: 60,
      type: courseForm.type,
    });
    setCourseForm({ ...courseForm, code: '', title: '' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Create Department */}
        <form
          onSubmit={handleAddDept}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Academic Department</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              placeholder="Code (e.g., BIO)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="Department Name"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Add Department
            </button>
          </div>
        </form>

        {/* Create Course */}
        <form
          onSubmit={handleAddCourse}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Course / Curriculum Subject</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              placeholder="Code (e.g., CS509)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="text"
              required
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              placeholder="Subject Title"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600"
            >
              Create Subject
            </button>
          </div>
        </form>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {departments.map((d) => (
          <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-700 dark:text-cyan-400">{d.code}</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">{d.totalStudents} Students</span>
            </div>
            <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{d.name}</h4>
            <div className="mt-1 text-xs text-slate-500">HOD: {d.hodName} · {d.totalFaculty} Faculty</div>
            <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
              Avg Attendance: <strong className="font-mono">{d.avgAttendance}%</strong> · Avg CGPA:{' '}
              <strong className="font-mono">{d.avgCgpa}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Courses &amp; Subject Catalog</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Department &amp; Sem</th>
                <th className="py-3 px-4 text-right">Credits</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-right">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-cyan-400">{c.code}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {c.title} ({c.type})
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {c.department} · Sem {c.semester}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{c.credits}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{c.facultyName}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{c.enrolledCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
