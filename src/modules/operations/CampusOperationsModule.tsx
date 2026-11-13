import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  Lock,
  MessageSquareWarning,
  Plus,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { CertificateRequest, GrievanceTicket } from '../../types/campus';
import { calculateAttendanceMetrics } from '../../utils/academicLogic';

export const AssignmentsAndResourcesModule: React.FC = () => {
  const {
    currentUser,
    assignments,
    resources,
    courses,
    createAssignment,
    submitAssignment,
    addLearningResource,
  } = useCampus();

  const [asgTitle, setAsgTitle] = useState('');
  const [asgCourse, setAsgCourse] = useState(courses[0]?.code || 'CS501');
  const [asgDue, setAsgDue] = useState('2026-11-28');
  const [resTitle, setResTitle] = useState('');
  const [submissionFile, setSubmissionFile] = useState('Aarav_Mehta_Solution_Report.pdf');

  const canCreate =
    currentUser.role === 'faculty' ||
    currentUser.role === 'college_admin' ||
    currentUser.role === 'super_admin';

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;
    const course = courses.find((c) => c.code === asgCourse) || courses[0];
    createAssignment({
      title: asgTitle,
      subjectCode: course.code,
      subjectName: course.title,
      department: course.department,
      semester: course.semester,
      facultyName: currentUser.displayName,
      dueDate: asgDue,
      maxMarks: 25,
      description: 'Complete implementation and attach benchmark verification report.',
      attachmentName: `${course.code}_Specification.pdf`,
    });
    setAsgTitle('');
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    const course = courses.find((c) => c.code === asgCourse) || courses[0];
    addLearningResource({
      title: resTitle,
      subjectCode: course.code,
      subjectName: course.title,
      department: course.department,
      semester: course.semester,
      type: 'Lecture Notes',
      uploadedBy: currentUser.displayName,
      fileSize: '2.4 MB',
    });
    setResTitle('');
  };

  return (
    <div className="space-y-6">
      {canCreate && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleAddAssignment}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish New Course Assignment</h3>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                required
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                placeholder="Assignment Title"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={asgCourse}
                  onChange={(e) => setAsgCourse(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={asgDue}
                  onChange={(e) => setAsgDue(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Create Assignment
              </button>
            </div>
          </form>

          <form
            onSubmit={handleAddResource}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Study Material &amp; Learning Resource</h3>
            <div className="mt-3 space-y-3">
              <input
                type="text"
                required
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="Resource Title (e.g., Module 4 Lecture Slides PDF)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Publish Resource to Storage</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Coursework &amp; Student Submissions</h3>
        <div className="mt-4 space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {a.subjectCode}: {a.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    Instructor: {a.facultyName} · Due: <span className="font-mono">{a.dueDate}</span> · Max Marks: {a.maxMarks}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={submissionFile}
                    onChange={(e) => setSubmissionFile(e.target.value)}
                    aria-label="Submission file name"
                    className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      submitAssignment(
                        a.id,
                        currentUser.studentId || 'STU-2026-001',
                        currentUser.displayName,
                        submissionFile
                      )
                    }
                    className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                  >
                    Submit Document
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{a.description}</p>
              {a.submissions.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800">
                  Submissions ({a.submissions.length}):{' '}
                  {a.submissions.map((s) => `${s.studentName} (${s.fileName} — ${s.status}${s.marks ? ` ${s.marks}/${a.maxMarks}` : ''})`).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Resources Repository */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject-Wise Learning Resource Repository</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {resources.map((r) => (
            <div key={r.id} className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                  {r.subjectCode} · {r.type}
                </div>
                <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{r.title}</h4>
                <div className="mt-1 text-xs text-slate-500">
                  By {r.uploadedBy} · {r.fileSize} · {r.downloads} downloads
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([`Campus Orbit Learning Resource\nTitle: ${r.title}\nCourse: ${r.subjectCode}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${r.subjectCode}_${r.title.replace(/\s+/g, '_')}.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline dark:text-cyan-400"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Material</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GrievanceManagementModule: React.FC = () => {
  const { currentUser, grievances, submitGrievance, updateGrievanceStatus } = useCampus();
  const [form, setForm] = useState({
    title: '',
    category: 'Academic' as GrievanceTicket['category'],
    priority: 'Medium' as GrievanceTicket['priority'],
    description: '',
  });
  const [resNote, setResNote] = useState('');

  const isAdmin = currentUser.role === 'college_admin' || currentUser.role === 'super_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    await submitGrievance(form);
    setForm({ title: '', category: 'Academic', priority: 'Medium', description: '' });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Confidential Grievance Redressal Desk
            </h3>
            <p className="text-xs text-slate-500">
              Protected by Firestore ownership isolation — only you and authorized redressal officers can view your ticket.
            </p>
          </div>
          <MessageSquareWarning className="h-5 w-5 text-amber-600" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Grievance Subject / Title"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as GrievanceTicket['category'] })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {['Academic', 'Infrastructure', 'Hostel & Dining', 'Examination', 'Finance', 'Confidential Harassment'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as GrievanceTicket['priority'] })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {['Low', 'Medium', 'High', 'Critical'].map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide detailed description for the Grievance Redressal Committee..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 shrink-0"
          >
            Submit Confidential Ticket
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {grievances.map((g) => (
          <div key={g.id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                  {g.ticketCode} · {g.category} · Priority: {g.priority} · Status: <strong>{g.status}</strong>
                </div>
                <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{g.title}</h4>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">Updated: {g.updatedAt}</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{g.description}</p>
            <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <strong>Resolution Log:</strong> {g.resolutionNotes}
            </div>
            {isAdmin && g.status !== 'Resolved' && g.status !== 'Rejected' && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <input
                  type="text"
                  value={resNote}
                  onChange={(e) => setResNote(e.target.value)}
                  placeholder="Enter administrative resolution notes..."
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateGrievanceStatus(g.id, 'Resolved', resNote || 'Issue resolved and verified by administration.');
                    setResNote('');
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Mark Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FinanceManagementModule: React.FC = () => {
  const { invoices, recordVerifiedFeePayment, settings } = useCampus();
  const [selectedInvId, setSelectedInvId] = useState(invoices[1]?.id || 'inv_2');
  const [payAmount, setPayAmount] = useState(50000);
  const [gatewayRef, setGatewayRef] = useState('TXN-RZP-2026-99412');
  const [payMsg, setPayMsg] = useState('');

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayRef.trim() || payAmount <= 0) {
      setPayMsg('Verified payment gateway transaction reference is required before marking payment successful.');
      return;
    }
    recordVerifiedFeePayment(selectedInvId, Number(payAmount), gatewayRef);
    setPayMsg(`Verified gateway transaction ${gatewayRef} and updated invoice ledger.`);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleVerifyPayment}
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Fee &amp; Finance Ledger — Verified Gateway Confirmation ({settings.paymentGatewayProvider})
            </h3>
            <p className="text-xs text-slate-500">
              Payments are only recorded upon verified gateway transaction reference confirmation.
            </p>
          </div>
          <CreditCard className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
        </div>
        {payMsg && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            {payMsg}
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
            aria-label="Select invoice"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNo} — {inv.studentName} (Bal: ₹{(inv.totalAmount - inv.paidAmount).toLocaleString()})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1000}
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            placeholder="Amount (₹)"
            aria-label="Payment amount"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <input
            type="text"
            required
            value={gatewayRef}
            onChange={(e) => setGatewayRef(e.target.value)}
            placeholder="Verified Gateway Ref (TXN-...)"
            aria-label="Gateway transaction reference"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
          >
            Confirm Verified Payment
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-right">Total Fee</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Status &amp; Gateway Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {invoices.map((inv) => {
                const balance = inv.totalAmount - inv.paidAmount;
                return (
                  <tr key={inv.id}>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700 dark:text-cyan-400 tabular-nums">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{inv.studentName}</div>
                      <div className="text-slate-500">{inv.studentId} · {inv.department}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ₹{inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-red-600 dark:text-red-400 tabular-nums">
                      ₹{balance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {inv.status} {inv.lastPaymentRef ? `· ${inv.lastPaymentRef}` : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const FacilitiesCertificatesEventsModule: React.FC<{
  subView?: 'facilities' | 'certificates' | 'events';
}> = ({ subView = 'facilities' }) => {
  const {
    currentUser,
    facilities,
    bookings,
    certificates,
    events,
    requestFacilityBooking,
    updateFacilityBookingStatus,
    requestCertificate,
    approveCertificate,
    createEvent,
    toggleEventRegistration,
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'facilities' | 'certificates' | 'events'>(subView);
  const [bkForm, setBkForm] = useState({
    facilityId: facilities[0]?.id || 'facil_1',
    purpose: 'IEEE Technical Symposium Rehearsal',
    date: '2026-11-20',
    timeSlot: '14:00 - 16:00',
  });
  const [bkMsg, setBkMsg] = useState('');
  const [certType, setCertType] = useState<CertificateRequest['certificateType']>('Bonafide Certificate');
  const [certPurpose, setCertPurpose] = useState('Passport & Research Internship Application');
  const [evtTitle, setEvtTitle] = useState('');

  const handleBookFacility = (e: React.FormEvent) => {
    e.preventDefault();
    const target = facilities.find((f) => f.id === bkForm.facilityId) || facilities[0];
    const res = requestFacilityBooking({
      facilityId: target.id,
      facilityName: target.name,
      requestedBy: currentUser.displayName,
      requesterRole: currentUser.role,
      purpose: bkForm.purpose,
      date: bkForm.date,
      timeSlot: bkForm.timeSlot,
    });
    setBkMsg(res.message);
  };

  const handleDownloadCertificate = (cert: CertificateRequest) => {
    const content = `=============================================================
CAMPUS ORBIT INSTITUTE OF TECHNOLOGY & SCIENCES
OFFICIAL DIGITAL CERTIFICATE (${cert.certNo})
=============================================================
Certificate Type : ${cert.certificateType}
Issued To        : ${cert.studentName} (${cert.studentId})
Department       : ${cert.department} — Semester ${cert.semester}
Purpose          : ${cert.purpose}
Issue Date       : ${cert.requestedAt}
Verification     : ${cert.status} (Digitally Signed by Registrar)
=============================================================`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certNo}_${cert.certificateType.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-lg bg-slate-200/70 p-1 w-fit dark:bg-slate-800">
        {[
          { id: 'facilities', label: 'Campus Facilities & Booking' },
          { id: 'certificates', label: 'Certificates & Document Issuance' },
          { id: 'events', label: 'Campus Events & Registrations' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === t.id
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'facilities' && (
        <div className="space-y-6">
          <form
            onSubmit={handleBookFacility}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reserve Auditorium, Seminar Hall, or Research Lab (Conflict-Checked)
            </h3>
            {bkMsg && <div className="mt-2 text-xs font-medium text-blue-700 dark:text-cyan-400">{bkMsg}</div>}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <select
                value={bkForm.facilityId}
                onChange={(e) => setBkForm({ ...bkForm, facilityId: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Cap: {f.capacity})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={bkForm.date}
                onChange={(e) => setBkForm({ ...bkForm, date: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                value={bkForm.purpose}
                onChange={(e) => setBkForm({ ...bkForm, purpose: e.target.value })}
                placeholder="Event / Academic Purpose"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Request Booking
              </button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Facility Reservation Queue</h4>
            <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {b.facilityName} · {b.date} ({b.timeSlot})
                    </div>
                    <div className="text-slate-500">
                      Requested by {b.requestedBy} · Purpose: {b.purpose} · Status: <strong>{b.status}</strong>
                    </div>
                  </div>
                  {(currentUser.role === 'college_admin' || currentUser.role === 'super_admin') &&
                    b.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateFacilityBookingStatus(b.id, 'Approved')}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFacilityBookingStatus(b.id, 'Rejected')}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs"
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
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Request Institutional Certificate (Bonafide, Study, Transfer)
            </h3>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as CertificateRequest['certificateType'])}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {[
                  'Bonafide Certificate',
                  'Study Certificate',
                  'Transfer Certificate',
                  'Character Certificate',
                  'No Dues Certificate',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={certPurpose}
                onChange={(e) => setCertPurpose(e.target.value)}
                placeholder="Purpose of certificate request"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={() => requestCertificate(certType, certPurpose)}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Submit Request
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Certificate Ledger &amp; Digital Download</h4>
            <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
              {certificates.map((c) => (
                <div key={c.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {c.certNo} · {c.certificateType} — {c.studentName}
                    </div>
                    <div className="text-slate-500">
                      Purpose: {c.purpose} · Requested: {c.requestedAt} · Status: <strong>{c.status}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(currentUser.role === 'college_admin' || currentUser.role === 'super_admin') &&
                      c.status === 'Pending Approval' && (
                        <button
                          type="button"
                          onClick={() => approveCertificate(c.id, 'Approved & Issued')}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Approve &amp; Issue
                        </button>
                      )}
                    {c.status === 'Approved & Issued' && (
                      <button
                        type="button"
                        onClick={() => handleDownloadCertificate(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-cyan-400 dark:text-cyan-400"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish Campus Event, Hackathon, or Workshop</h3>
            <div className="mt-3 flex gap-3">
              <input
                type="text"
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                placeholder="Event Title (e.g., Cloud Native Kubernetes Day)"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!evtTitle.trim()) return;
                  createEvent({
                    title: evtTitle,
                    category: 'Workshop',
                    department: 'Computer Science',
                    date: '2026-12-10',
                    time: '10:00 AM',
                    venue: 'Turing Main Auditorium',
                    organizer: currentUser.displayName,
                    maxParticipants: 200,
                    description: 'Interactive technical symposium and hands-on engineering workshop.',
                  });
                  setEvtTitle('');
                }}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Create Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((ev) => {
              const stuId = currentUser.studentId || 'STU-2026-001';
              const isReg = ev.registeredStudentIds.includes(stuId);
              return (
                <div key={ev.id} className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                    {ev.category} · {ev.date} at {ev.time}
                  </div>
                  <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{ev.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <span className="font-mono text-slate-500 tabular-nums">
                      Venue: {ev.venue} · {ev.registeredStudentIds.length}/{ev.maxParticipants} Registered
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleEventRegistration(ev.id, stuId)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        isReg
                          ? 'border border-emerald-600 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-900 text-white dark:bg-blue-600'
                      }`}
                    >
                      {isReg ? 'Registered ✓' : 'Register Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const PlacementsAndCareerModule: React.FC = () => {
  const { currentUser, placements, studyGroups, applyPlacement, joinStudyGroup } = useCampus();
  const stuId = currentUser.studentId || 'STU-2026-001';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Student Skill Portfolio &amp; Campus Placement Opportunities
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Verified career opportunities, internships, and research fellowships separate from project collaboration.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {placements.map((p) => {
            const applied = p.appliedStudentIds.includes(stuId);
            return (
              <div key={p.id} className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                    {p.type} · {p.packageOrStipend}
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{p.companyName}</h4>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.roleTitle}</div>
                  <p className="mt-2 text-xs text-slate-500">{p.description}</p>
                  <div className="mt-2 text-xs text-slate-500">
                    Min CGPA: <strong className="font-mono">{p.minCgpa}</strong> · Deadline: {p.deadline}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => applyPlacement(p.id, stuId)}
                  className={`mt-4 w-full rounded-lg py-2 text-xs font-semibold ${
                    applied
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  {applied ? 'Application Submitted ✓' : 'Apply with Verified Transcript'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Peer Study Groups &amp; Reading Circles</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {studyGroups.map((sg) => (
            <div key={sg.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{sg.name}</div>
                <div className="text-xs text-slate-500">
                  {sg.subjectCode} · {sg.nextSession} · {sg.membersCount} Members
                </div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Topic: {sg.topic}</div>
              </div>
              <button
                type="button"
                onClick={() => joinStudyGroup(sg.id)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Join Circle
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ParentGuardianPortalModule: React.FC = () => {
  const { currentUser, students, marks, invoices, notices, faculty } = useCampus();
  const linkedStudent =
    students.find((s) => s.studentId === (currentUser.linkedStudentId || 'STU-2026-001')) ||
    students[0];
  const studentMarks = marks.filter((m) => m.studentId === linkedStudent.studentId);
  const studentInvoices = invoices.filter((i) => i.studentId === linkedStudent.studentId);
  const attStats = calculateAttendanceMetrics(linkedStudent.totalClasses, linkedStudent.attendedClasses);
  const mentor = faculty[0];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/60 dark:bg-blue-950/30">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-mono font-semibold text-blue-700 dark:text-cyan-400">
              VERIFIED PARENT-STUDENT LINK · STRICT DATA ISOLATION
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
              Ward Profile: {linkedStudent.fullName} ({linkedStudent.studentId})
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {linkedStudent.department} · {linkedStudent.course} · Semester {linkedStudent.semester} · Guardian: {linkedStudent.guardianName}
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-600 dark:text-slate-300">
            <div>Attendance: <strong>{attStats.percentage}%</strong></div>
            <div>Cumulative CGPA: <strong>{linkedStudent.cgpa.toFixed(2)}</strong></div>
            <div>Fee Status: <strong>{linkedStudent.feeStatus}</strong></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Published Examination Marks</h3>
          <div className="mt-3 divide-y divide-slate-200 text-xs dark:divide-slate-800">
            {studentMarks.map((m) => (
              <div key={m.id} className="flex justify-between py-2.5">
                <span>{m.subjectCode}: {m.subjectName}</span>
                <span className="font-mono font-bold tabular-nums">
                  {m.internalMarks + m.externalMarks}/{m.maxMarks}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Faculty Mentor &amp; Fee Status</h3>
          <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div><strong>Assigned Faculty Advisor:</strong> {mentor.fullName} ({mentor.designation})</div>
            <div><strong>Advisor Email &amp; Phone:</strong> {mentor.email} · {mentor.phone}</div>
            {studentInvoices.map((inv) => (
              <div key={inv.id} className="mt-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                Invoice <strong>{inv.invoiceNo}</strong>: Paid ₹{inv.paidAmount.toLocaleString()} of ₹{inv.totalAmount.toLocaleString()} ({inv.status})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Institutional Notices for Parents</h3>
        <div className="mt-3 space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="rounded-lg border border-slate-100 p-3 text-xs dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">{n.title}</div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SuperAdminGovernanceModule: React.FC = () => {
  const { auditLogs, settings, updateSettings } = useCampus();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Super Administrator — Institutional Governance &amp; Security Controls
            </h3>
            <p className="text-xs text-slate-500">
              Configure platform-wide thresholds, RBAC policies, and inspect immutable audit logs.
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <label htmlFor="sa-inst-name" className="font-semibold text-slate-700 dark:text-slate-300">
              Institution Name
            </label>
            <input
              id="sa-inst-name"
              type="text"
              value={settings.institutionName}
              onChange={(e) => updateSettings({ institutionName: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <label htmlFor="sa-att-thresh" className="font-semibold text-slate-700 dark:text-slate-300">
              Mandatory Attendance Threshold (%)
            </label>
            <input
              id="sa-att-thresh"
              type="number"
              min={50}
              max={95}
              value={settings.minAttendanceThresholdPct}
              onChange={(e) => updateSettings({ minAttendanceThresholdPct: Number(e.target.value) })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Zero-Trust Enforcement</div>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableParentVerificationGate}
                onChange={(e) => updateSettings({ enableParentVerificationGate: e.target.checked })}
              />
              <span>Enforce Verified Parent-Student Link</span>
            </label>
            <label className="mt-1.5 flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableQrSessionGeoFence}
                onChange={(e) => updateSettings({ enableQrSessionGeoFence: e.target.checked })}
              />
              <span>Prevent Duplicate QR Check-In</span>
            </label>
          </div>
        </div>
      </div>

      {/* Security & System Audit Logs */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Immutable Security &amp; Operational Audit Trail
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor &amp; Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action Description</th>
                <th className="py-3 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">{log.timestamp}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {log.actorName} ({log.actorRole})
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.module}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700 dark:text-cyan-400">
                    {log.severity}
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
