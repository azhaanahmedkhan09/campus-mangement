import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  QrCode,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { UserRole } from '../../types/campus';
import { PWAInstallButton } from '../../components/PWAInstallButton';

interface LandingPageProps {
  onOpenAuth: (defaultRole?: UserRole) => void;
  onEnterDashboard: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterDashboard,
}) => {
  const [selectedRolePreview, setSelectedRolePreview] = useState<UserRole>('college_admin');
  const [contactForm, setContactForm] = useState({
    institution: '',
    name: '',
    email: '',
    role: 'College Administrator',
    message: '',
  });
  const [contactError, setContactError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.institution.trim() || !contactForm.name.trim()) {
      setContactError('Please enter your institution name and full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      setContactError('Please enter a valid institutional email address.');
      return;
    }
    setContactError('');
    setContactSubmitted(true);
  };

  const roleDetails: Record<
    UserRole,
    {
      title: string;
      subtitle: string;
      capabilities: string[];
      metrics: string;
    }
  > = {
    super_admin: {
      title: 'Super Administrator',
      subtitle: 'Institutional governance, zero-trust security rules, and multi-campus audit oversight.',
      capabilities: [
        'First-administrator server bootstrap and role privilege management',
        'Real-time Firestore ABAC security audit logs and anomaly monitoring',
        'Academic year, grading scheme, and payment gateway configuration',
        'Cross-department compliance and system activity telemetry',
      ],
      metrics: '100% Zero-Trust Rule Coverage · Real-Time Audit Trail',
    },
    college_admin: {
      title: 'College Administrator & Dean',
      subtitle: 'Centralized student lifecycle, faculty workload, timetable conflict detection, and finance.',
      capabilities: [
        'Complete student & faculty directory with bulk CSV import/export',
        'Automated timetable conflict engine across rooms, faculty, and cohorts',
        'Department budget tracking, fee invoicing, and verified gateway receipts',
        'Confidential grievance resolution desk and certificate issuance',
      ],
      metrics: '5 Departments · 1,680+ Active Students · 0 Scheduling Conflicts',
    },
    faculty: {
      title: 'Faculty & Professors',
      subtitle: 'Streamlined QR attendance sessions, internal assessments, SGPA grading, and project mentorship.',
      capabilities: [
        'Dynamic QR attendance sessions with duplicate check-in prevention',
        'Subject-wise mark entry with automated grade point calculation',
        'Assignment creation, PDF learning resource distribution, and grading',
        'Interdisciplinary capstone mentorship in Campus Collaboration Hub',
      ],
      metrics: 'Sub-5s QR Session Launch · Automated Grade Computation',
    },
    student: {
      title: 'Students',
      subtitle: 'Real-time attendance tracking, academic transcripts, placements, and the Campus Collaboration Hub.',
      capabilities: [
        'Instant QR attendance check-in and <75% threshold recovery alerts',
        'Published semester SGPA/CGPA transcripts and downloadable certificates',
        'Interdisciplinary project discovery, team workspace, and milestone tracking',
        'Placement opportunity applications, study groups, and grievance filing',
      ],
      metrics: '9 Collaboration Hub Sub-Modules · Live SGPA/CGPA Tracker',
    },
    parent: {
      title: 'Parents & Guardians',
      subtitle: 'Verified student linking for transparent attendance oversight, exam results, and fee status.',
      capabilities: [
        'Verified access strictly isolated to linked student academic records',
        'Real-time subject-wise attendance monitoring and low-attendance alerts',
        'Official examination schedules, published grades, and fee payment receipts',
        'Direct faculty mentor contact and institutional notice feed',
      ],
      metrics: 'Strict PII Isolation · Instant Attendance & Fee Transparency',
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-950/95">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          CAMPUS ORBIT
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
            About
          </a>
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
            Features
          </a>
          <a href="#modules" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
            Modules
          </a>
          <a href="#collaboration" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
            Collaboration
          </a>
          <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAuth('college_admin')}
            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
          >
            Login to Campus Orbit
          </button>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="top" className="relative border-b border-slate-200 bg-slate-50/60 py-16 lg:py-24 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-xs font-semibold tracking-wider text-blue-700 dark:text-cyan-400">
                Unified Multi-Role Academic Operations &amp; Smart Campus System
              </p>
              <h1
                className="mt-3 font-display font-extrabold tracking-tight text-slate-900 dark:text-white"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', lineHeight: 1.1, textWrap: 'balance' }}
              >
                One Campus. One Connected Ecosystem.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Campus Orbit brings academic management, student collaboration, faculty operations and institutional administration together in one intelligent digital platform.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEnterDashboard('college_admin')}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('student')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Login to Campus Orbit</span>
                </button>
                <PWAInstallButton />
              </div>

              {/* Quick Role Launch Bar */}
              <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Instant Interactive Role Workspaces (Live Firestore + IndexedDB State):
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(
                    [
                      { role: 'college_admin', label: 'College Admin' },
                      { role: 'faculty', label: 'Faculty Portal' },
                      { role: 'student', label: 'Student & Collaboration Hub' },
                      { role: 'parent', label: 'Parent Portal' },
                      { role: 'super_admin', label: 'Super Admin' },
                    ] as Array<{ role: UserRole; label: string }>
                  ).map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => onEnterDashboard(item.role)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-600 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
                    >
                      {item.label} →
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orbital Ecosystem Interactive Preview Card */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-900 p-6 text-white shadow-lg lg:col-span-5 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Campus Orbit Architecture</h2>
                  <p className="text-xs text-slate-400">5 Connected Roles · 22 Integrated Modules · Cloud Firestore</p>
                </div>
                <span className="text-xs font-medium text-cyan-400">Cloud ERP</span>
              </div>

              <div className="my-6 flex items-center justify-center">
                <svg className="h-56 w-56" viewBox="0 0 320 320" fill="none" aria-label="Campus Orbit Architecture Illustration">
                  <circle cx="160" cy="160" r="130" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="6 6" />
                  <circle cx="160" cy="160" r="92" stroke="#0284C7" strokeWidth="1.5" strokeOpacity="0.6" />
                  <ellipse cx="160" cy="160" rx="135" ry="56" transform="rotate(-24 160 160)" stroke="#38BDF8" strokeWidth="2" />
                  <ellipse cx="160" cy="160" rx="135" ry="56" transform="rotate(28 160 160)" stroke="#3B82F6" strokeWidth="1.5" />
                  <circle cx="160" cy="160" r="36" fill="#1D4ED8" />
                  <text x="160" y="157" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">CAMPUS</text>
                  <text x="160" y="170" textAnchor="middle" fill="#BAE6FD" fontSize="9" fontWeight="600">ORBIT</text>

                  {/* Orbital Role Nodes */}
                  <circle cx="160" cy="30" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="160" y="34" textAnchor="middle" fill="#E0F2FE" fontSize="8" fontWeight="600">ADMIN</text>

                  <circle cx="282" cy="118" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="282" y="122" textAnchor="middle" fill="#E0F2FE" fontSize="8" fontWeight="600">FACULTY</text>

                  <circle cx="240" cy="264" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="240" y="268" textAnchor="middle" fill="#E0F2FE" fontSize="8" fontWeight="600">STUDENT</text>

                  <circle cx="80" cy="264" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="80" y="268" textAnchor="middle" fill="#E0F2FE" fontSize="8" fontWeight="600">PARENT</text>

                  <circle cx="38" cy="118" r="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="38" y="122" textAnchor="middle" fill="#E0F2FE" fontSize="8" fontWeight="600">DEAN</text>
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-center">
                <div>
                  <div className="font-mono text-lg font-bold text-white tabular-nums">100%</div>
                  <div className="text-xs text-slate-400">Paperless Ops</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-cyan-400 tabular-nums">5 Roles</div>
                  <div className="text-xs text-slate-400">Zero-Trust RBAC</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-white tabular-nums">Real-Time</div>
                  <div className="text-xs text-slate-400">Firestore Sync</div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-column institutional metrics bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">1,680+</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enrolled Students Across 5 Departments</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-blue-700 dark:text-cyan-400 tabular-nums">122</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Faculty &amp; Research Mentors</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">98.4%</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">QR Attendance Session Verification Accuracy</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">42+</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Interdisciplinary Collaboration Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Campus Orbit & 3. Platform Features */}
      <section id="about" className="py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-blue-700 dark:text-cyan-400">01. Institutional Vision</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Eliminating Disconnected Registers and Fragmented Academic Systems
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Universities and engineering colleges often struggle with isolated attendance spreadsheets, manual timetable clashes, opaque grievance handling, and siloed student talent. Campus Orbit unifies the entire institutional lifecycle into a real-time, cloud-native operating platform.
            </p>
          </div>

          <div id="features" className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-cyan-400">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                01. Smart QR Attendance &amp; Analytics
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Faculty launch dynamic QR attendance sessions with server-side duplicate check-in prevention. Automated alerts flag students falling below 75% attendance and calculate exact classes required for recovery.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-cyan-400">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                02. Conflict-Free Timetable &amp; Grading Engine
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Real-time collision detection prevents double-booking faculty, classrooms, or student cohorts. Configurable grading schemes compute credit-weighted SGPA and cumulative CGPA automatically.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-cyan-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                03. Zero-Trust Security &amp; PWA Offline Shell
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Protected by Attribute-Based Firestore Security Rules, verified parent-student linking, and an installable Progressive Web App with IndexedDB caching for uninterrupted access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Academic Management Overview */}
      <section id="modules" className="py-16 lg:py-20 bg-slate-50/70 border-b border-slate-200 dark:bg-slate-900/30 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-cyan-400">02. Comprehensive Enterprise Modules</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Every Core Academic &amp; Administrative Workflow in One Place
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onEnterDashboard('college_admin')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-cyan-400 whitespace-nowrap shrink-0"
            >
              <span>Open Live Administrative Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Student Information System',
                meta: 'Lifecycle · CSV Import · Academic Profiles',
                desc: 'Manage admissions, department/semester allocation, guardian links, attendance history, and transcripts.',
              },
              {
                title: 'Faculty Administration',
                meta: 'Workload · Subject Mapping · Mentorship',
                desc: 'Allocate subjects, track weekly teaching hours, monitor attendance, and assign project mentees.',
              },
              {
                title: 'Departments & Programs',
                meta: 'HOD Assignment · Credits · Analytics',
                desc: 'Configure B.Tech/M.Tech programs, credit structures, and track departmental budget utilization.',
              },
              {
                title: 'Examinations & Transcripts',
                meta: 'Internal Marks · SGPA/CGPA · Schedules',
                desc: 'Publish exam timetables, enter subject marks with role locks, and compute verified grade sheets.',
              },
              {
                title: 'Assignments & Resources',
                meta: 'Deadlines · Submissions · Study Materials',
                desc: 'Distribute lecture notes and lab manuals, collect student submissions, and record evaluation feedback.',
              },
              {
                title: 'Fee & Finance Management',
                meta: 'Invoices · Gateway Verification · Ledgers',
                desc: 'Generate semester fee structures, track pending dues, and issue verified payment receipts.',
              },
              {
                title: 'Confidential Grievance Desk',
                meta: 'Priority Routing · Audit Trail · SLA',
                desc: 'Secure grievance submission with category routing, administrative assignment, and resolution history.',
              },
              {
                title: 'Facilities, Certificates & Events',
                meta: 'Room Booking · Bonafide PDF · Calendar',
                desc: 'Book labs and auditoriums with conflict checks, issue digital certificates, and manage campus events.',
              },
            ].map((mod, i) => (
              <div
                key={mod.title}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    0{i + 1} · {mod.meta}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{mod.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{mod.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Campus Collaboration Hub Showcase */}
      <section id="collaboration" className="py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold text-blue-700 dark:text-cyan-400">
                03. Signature Feature · Interdisciplinary Innovation
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Campus Collaboration Hub
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Break down departmental silos. Enable students from Computer Science, Electronics, Robotics, AI, and Civil Engineering to discover project ideas, form interdisciplinary teams, manage milestones, and receive faculty mentorship.
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Collaboration Profiles &amp; Directory:</strong> Filter peers by technical skills, project domains, and semester.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Dedicated Team Workspaces:</strong> Kanban tasks, milestone tracking, private team discussions, and file resources.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Faculty Mentorship &amp; Showcase:</strong> Request faculty advisors for milestone reviews and publish completed work to the institutional gallery.</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onEnterDashboard('student')}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                >
                  <FolderGit2 className="h-4 w-4" />
                  <span>Launch Collaboration Hub Workspace</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Live Interdisciplinary Projects in Campus Orbit
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      9 Integrated Sub-Modules · Team Formation · Mentorship · Showcase
                    </p>
                  </div>
                  <span className="text-xs font-mono text-blue-700 dark:text-cyan-400">3 Active Teams</span>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      title: 'AeroGrid — Autonomous Micro-Grid Load Balancing & LoRa Telemetry Mesh',
                      meta: 'Internet of Things · CSE + ECE + AI & DS · Mentor: Dr. Aris Thorne',
                      progress: '74% Complete · 3 Team Members',
                    },
                    {
                      title: 'MediRover — Autonomous Hospital Corridor Sterilization & Supply UGV',
                      meta: 'Robotics · Robotics + CSE · Mentor: Prof. Marcus Sterling',
                      progress: '100% Completed · National Smart Mobility Winner',
                    },
                    {
                      title: 'ZeroVerify — Post-Quantum Academic Credential & Transcript Verifier',
                      meta: 'Cybersecurity · Computer Science · Seeking 2 Collaborators',
                      progress: '25% Planning · zk-SNARKs & Rust',
                    },
                  ].map((p) => (
                    <div
                      key={p.title}
                      className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{p.title}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.meta}</div>
                      <div className="mt-2 text-xs font-mono font-medium text-blue-700 dark:text-cyan-400">
                        {p.progress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Role-Based Platform Overview & 7-9. Benefits for Students, Faculty, and Administrators */}
      <section className="py-16 lg:py-20 bg-slate-50/70 border-b border-slate-200 dark:bg-slate-900/30 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-blue-700 dark:text-cyan-400">04. Role-Based Access Architecture</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Tailored Workspaces for Every Institutional Stakeholder
            </h2>
          </div>

          {/* Interactive Filter Tabs for Role Inspection */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-200/70 p-1.5 w-fit dark:bg-slate-800">
            {(
              [
                { id: 'college_admin', label: 'College Administrator' },
                { id: 'faculty', label: 'Faculty' },
                { id: 'student', label: 'Student' },
                { id: 'parent', label: 'Parent / Guardian' },
                { id: 'super_admin', label: 'Super Administrator' },
              ] as Array<{ id: UserRole; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRolePreview(tab.id)}
                className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selectedRolePreview === tab.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                  {roleDetails[selectedRolePreview].metrics}
                </div>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {roleDetails[selectedRolePreview].title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {roleDetails[selectedRolePreview].subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterDashboard(selectedRolePreview)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open {roleDetails[selectedRolePreview].title} Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
              {roleDetails[selectedRolePreview].capabilities.map((cap) => (
                <div key={cap} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Stakeholder Benefit Columns (Sections 7, 8, 9) */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Benefits for Students</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Real-time attendance percentages with threshold calculators, verified digital transcripts, one-click bonafide certificate requests, career placement tracking, and interdisciplinary project networking.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Benefits for Faculty</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Zero paper attendance registers, automated SGPA/CGPA grading sheets, conflict-free personal timetables, assignment evaluation workflows, and structured research mentorship tools.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-blue-700 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Benefits for Administrators</h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Live institutional KPIs across all departments, automated fee reconciliation, SLA-tracked grievance redressal, facility utilization control, and complete security audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Contact & Institutional Deployment Inquiry Section */}
      <section id="contact" className="py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-10 dark:border-slate-800 dark:bg-slate-900">
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-blue-700 dark:text-cyan-400">05. Institutional Onboarding</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">
                Deploy Campus Orbit at Your Institution
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Connect with our academic systems engineering team to configure custom departments, grading schemes, or ERP migration.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                <div className="font-semibold">Institutional Inquiry Received</div>
                <p className="mt-1 text-xs">
                  Thank you, {contactForm.name}. Our deployment architects have logged your inquiry for{' '}
                  <strong>{contactForm.institution}</strong> and sent a confirmation to {contactForm.email}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactForm({ institution: '', name: '', email: '', role: 'College Administrator', message: '' });
                  }}
                  className="mt-3 text-xs font-semibold underline"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-6 space-y-4" noValidate>
                {contactError && (
                  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                    {contactError}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-inst" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      University / College Name
                    </label>
                    <input
                      id="contact-inst"
                      type="text"
                      value={contactForm.institution}
                      onChange={(e) => setContactForm({ ...contactForm, institution: e.target.value })}
                      placeholder="e.g., National Institute of Technology"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Your Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Dr. / Prof. Full Name"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Institutional Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="dean@university.edu"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-role" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Institutional Role
                    </label>
                    <select
                      id="contact-role"
                      value={contactForm.role}
                      onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option>College Administrator</option>
                      <option>Principal / Dean</option>
                      <option>Department Head (HOD)</option>
                      <option>IT / Cloud Director</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-msg" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Campus Requirements &amp; Student Capacity
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Specify number of departments, student strength, or custom modules..."
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Request Institutional Briefing</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. Quiet Footer */}
      <footer className="bg-slate-950 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="font-display text-base font-bold text-white">CAMPUS ORBIT</div>
              <p className="mt-1 text-xs text-slate-400">
                Unified Multi-Role Academic Operations &amp; Smart Campus Management System.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#modules" className="hover:text-white transition-colors">Modules</a>
              <a href="#collaboration" className="hover:text-white transition-colors">Collaboration Hub</a>
              <button
                type="button"
                onClick={() => onOpenAuth('college_admin')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Role Login Portal
              </button>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800/80 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <span>© 2026 Campus Orbit Digital Ecosystem. Built with React 19, Cloud Firestore &amp; Zero-Trust RBAC.</span>
            <span>PWA Standalone &amp; Android TWA Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
