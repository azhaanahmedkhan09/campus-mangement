import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CreditCard,
  FolderGit2,
  GraduationCap,
  Plus,
  QrCode,
  Users,
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { NoticeAnnouncement } from '../../types/campus';

interface OverviewAnalyticsModuleProps {
  onNavigateModule: (moduleKey: string) => void;
}

export const OverviewAnalyticsModule: React.FC<OverviewAnalyticsModuleProps> = ({
  onNavigateModule,
}) => {
  const {
    currentUser,
    students,
    faculty,
    departments,
    courses,
    attendanceSessions,
    grievances,
    invoices,
    exams,
    notices,
    events,
    auditLogs,
    publishNotice,
  } = useCampus();

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'Institutional' as NoticeAnnouncement['category'],
    audience: 'All' as NoticeAnnouncement['audience'],
    content: '',
  });

  // Calculated dynamically from actual database/context records
  const stats = useMemo(() => {
    const totalStudents = departments.reduce((sum, d) => sum + d.totalStudents, 0);
    const totalFaculty = departments.reduce((sum, d) => sum + d.totalFaculty, 0);
    const totalDepartments = departments.length;
    const totalCourses = courses.length;
    const activeClasses = attendanceSessions.filter((s) => s.status === 'active').length + courses.length;
    const overallAttendance =
      students.length > 0
        ? Number((students.reduce((s, stu) => s + stu.attendancePct, 0) / students.length).toFixed(1))
        : 0;
    const avgCgpa =
      students.length > 0
        ? Number((students.reduce((s, stu) => s + stu.cgpa, 0) / students.length).toFixed(2))
        : 0;
    const pendingFees = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
    const activeGrievances = grievances.filter(
      (g) => g.status !== 'Resolved' && g.status !== 'Rejected'
    ).length;
    const upcomingExams = exams.length;

    return {
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalCourses,
      activeClasses,
      overallAttendance,
      avgCgpa,
      pendingFees,
      activeGrievances,
      upcomingExams,
    };
  }, [departments, courses, attendanceSessions, students, invoices, grievances, exams]);

  const deptChartData = useMemo(() => {
    return departments.map((d) => ({
      name: d.code,
      students: d.totalStudents,
      attendance: d.avgAttendance,
      cgpa: Number((d.avgCgpa * 10).toFixed(1)),
    }));
  }, [departments]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    await publishNotice({
      title: noticeForm.title,
      category: noticeForm.category,
      audience: noticeForm.audience,
      content: noticeForm.content,
      authorName: currentUser.displayName,
      pinned: true,
    });
    setNoticeForm({ title: '', category: 'Institutional', audience: 'All', content: '' });
    setShowNoticeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Quick Institutional Actions:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: '+ Add Student', target: 'students' },
            { label: '+ Add Faculty', target: 'faculty' },
            { label: '+ Department / Course', target: 'departments' },
            { label: 'QR Attendance', target: 'attendance' },
            { label: 'Create Timetable', target: 'timetable' },
            { label: 'View Grievances', target: 'grievances' },
            { label: 'Collaboration Hub', target: 'collaboration' },
          ].map((act) => (
            <button
              key={act.label}
              type="button"
              onClick={() => onNavigateModule(act.target)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              {act.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowNoticeModal(!showNoticeModal)}
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
          >
            + Publish Notice
          </button>
        </div>
      </div>

      {showNoticeModal && (
        <form
          onSubmit={handleCreateNotice}
          className="rounded-xl border border-blue-200 bg-white p-6 dark:border-blue-900 dark:bg-slate-900"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Publish Institutional Notice or Announcement
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              placeholder="Announcement Headline"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <select
              value={noticeForm.category}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, category: e.target.value as NoticeAnnouncement['category'] })
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {['Institutional', 'Department', 'Examination', 'Event', 'Placement'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={noticeForm.audience}
              onChange={(e) =>
                setNoticeForm({ ...noticeForm, audience: e.target.value as NoticeAnnouncement['audience'] })
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {['All', 'Students', 'Faculty', 'Parents', 'Admins'].map((a) => (
                <option key={a} value={a}>
                  Audience: {a}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-3">
            <input
              type="text"
              required
              value={noticeForm.content}
              onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
              placeholder="Notice body details..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Broadcast Notice
            </button>
          </div>
        </form>
      )}

      {/* 10 Institutional KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Students</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.totalStudents.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500">{students.length} in active cohort view</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Faculty</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {stats.totalFaculty}
          </div>
          <div className="mt-1 text-xs text-slate-500">{faculty.length} HODs &amp; Leads</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Departments &amp; Courses</div>
          <div className="mt-1 font-mono text-2xl font-bold text-blue-700 dark:text-cyan-400 tabular-nums">
            {stats.totalDepartments} / {stats.totalCourses}
          </div>
          <div className="mt-1 text-xs text-slate-500">{stats.activeClasses} Active Classes</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Overall Attendance</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.overallAttendance}%
          </div>
          <div className="mt-1 text-xs text-slate-500">Avg CGPA: {stats.avgCgpa}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Pending Fees &amp; Alerts</div>
          <div className="mt-1 font-mono text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            ₹{(stats.pendingFees / 1000).toFixed(0)}k
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.activeGrievances} Grievances · {stats.upcomingExams} Exams
          </div>
        </div>
      </div>

      {/* Charts & Visualizations Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Student Enrollment &amp; Attendance by Department
              </h3>
              <p className="text-xs text-slate-500">
                Real-time aggregation across CSE, ECE, Robotics, AI &amp; DS, and Civil Engineering
              </p>
            </div>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="students" name="Enrolled Students" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendance" name="Avg Attendance %" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notices & Announcements Feed */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional Notices &amp; Broadcasts
            </h3>
            <span className="font-mono text-xs text-blue-700 dark:text-cyan-400">{notices.length} Live</span>
          </div>
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
            {notices.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="text-xs font-mono text-slate-500">
                  {n.category} · Audience: {n.audience} · {n.publishedAt}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{n.title}</div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Campus Events & Recent Audit Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Institutional Events</h3>
            <button
              type="button"
              onClick={() => onNavigateModule('events')}
              className="text-xs font-semibold text-blue-700 hover:underline dark:text-cyan-400"
            >
              Manage Events →
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-xs dark:border-slate-800">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{ev.title}</div>
                  <div className="text-slate-500">
                    {ev.category} · {ev.date} · {ev.venue}
                  </div>
                </div>
                <span className="font-mono text-blue-700 dark:text-cyan-400 tabular-nums">
                  {ev.registeredStudentIds.length}/{ev.maxParticipants}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent System &amp; Academic Activity</h3>
            <span className="font-mono text-xs text-slate-500">Real-Time Audit</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span>{log.actorName} · {log.module}</span>
                  <span className="font-mono tabular-nums">{log.timestamp.slice(11)}</span>
                </div>
                <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{log.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
