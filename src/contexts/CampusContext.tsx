import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../services/firebase/config';
import {
  loadSnapshotFromIndexedDB,
  saveSnapshotToIndexedDB,
} from '../services/storage/indexedDbCache';
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_CERTIFICATES,
  INITIAL_COLLAB_DISCUSSIONS,
  INITIAL_COLLAB_PROFILES,
  INITIAL_COLLAB_PROJECTS,
  INITIAL_COLLAB_REQUESTS,
  INITIAL_COLLAB_TASKS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_COURSES,
  INITIAL_DEPARTMENTS,
  INITIAL_EVENTS,
  INITIAL_EXAMS,
  INITIAL_FACILITIES,
  INITIAL_FACULTY,
  INITIAL_GRIEVANCES,
  INITIAL_INVOICES,
  INITIAL_MARKS,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLACEMENTS,
  INITIAL_RESOURCES,
  INITIAL_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_STUDY_GROUPS,
  INITIAL_TIMETABLE,
  ROLE_DEMO_ACCOUNTS,
} from '../services/seedData';
import {
  AppNotification,
  AssignmentItem,
  AttendanceCorrectionRequest,
  AttendanceSessionItem,
  AuditLogItem,
  CampusEvent,
  CampusFacility,
  CertificateRequest,
  CollaborationDiscussionPost,
  CollaborationJoinRequest,
  CollaborationProfile,
  CollaborationProjectItem,
  CollaborationTask,
  CourseSubject,
  Department,
  ExamScheduleItem,
  FacilityBooking,
  FacultyMember,
  FeeInvoice,
  GrievanceTicket,
  InstitutionalSettingsConfig,
  LearningResource,
  NoticeAnnouncement,
  PlacementOpportunity,
  Student,
  StudentMarkEntry,
  StudyGroupItem,
  UserAccount,
  UserRole,
} from '../types/campus';
import {
  detectTimetableConflicts,
  GradeRange,
  DEFAULT_GRADING_SCHEME,
  sanitizeAndValidateId,
  TimetableConflict,
  TimetableSlotEntry,
  truncateString,
  validateQRCheckIn,
} from '../utils/academicLogic';

interface CampusContextType {
  currentUser: UserAccount;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  syncMode: 'cloud_firestore' | 'sandbox_demo';
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  switchRoleSession: (role: UserRole) => void;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<void>;
  logoutSession: () => Promise<void>;

  // Core Data Collections
  students: Student[];
  faculty: FacultyMember[];
  departments: Department[];
  courses: CourseSubject[];
  attendanceSessions: AttendanceSessionItem[];
  correctionRequests: AttendanceCorrectionRequest[];
  exams: ExamScheduleItem[];
  marks: StudentMarkEntry[];
  gradingScheme: GradeRange[];
  timetable: TimetableSlotEntry[];
  assignments: AssignmentItem[];
  resources: LearningResource[];
  grievances: GrievanceTicket[];
  invoices: FeeInvoice[];
  notices: NoticeAnnouncement[];
  facilities: CampusFacility[];
  bookings: FacilityBooking[];
  certificates: CertificateRequest[];
  events: CampusEvent[];
  collabProfiles: CollaborationProfile[];
  collabProjects: CollaborationProjectItem[];
  collabTasks: CollaborationTask[];
  collabDiscussions: CollaborationDiscussionPost[];
  collabRequests: CollaborationJoinRequest[];
  placements: PlacementOpportunity[];
  studyGroups: StudyGroupItem[];
  notifications: AppNotification[];
  auditLogs: AuditLogItem[];
  settings: InstitutionalSettingsConfig;

  // Actions
  addStudent: (student: Omit<Student, 'id' | 'studentId'>) => Promise<Student>;
  updateStudentStatus: (id: string, status: Student['status']) => void;
  bulkImportStudentsCsv: (csvText: string) => number;
  addFaculty: (member: Omit<FacultyMember, 'id' | 'facultyId'>) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  addCourse: (course: Omit<CourseSubject, 'id'>) => void;
  createAttendanceSession: (payload: {
    subjectCode: string;
    subjectName: string;
    department: string;
    semester: number;
    timeSlot: string;
  }) => Promise<AttendanceSessionItem>;
  closeAttendanceSession: (sessionId: string) => void;
  submitStudentQRCheckIn: (sessionCode: string, studentId: string) => { valid: boolean; message: string };
  resolveCorrectionRequest: (id: string, status: 'Approved' | 'Rejected') => void;
  addTimetableSlot: (slot: Omit<TimetableSlotEntry, 'id'>) => TimetableConflict;
  addOrUpdateMark: (entry: Omit<StudentMarkEntry, 'id'>) => void;
  createAssignment: (asg: Omit<AssignmentItem, 'id' | 'submissions'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, studentName: string, fileName: string) => void;
  evaluateSubmission: (assignmentId: string, studentId: string, marks: number, feedback: string) => void;
  addLearningResource: (res: Omit<LearningResource, 'id' | 'downloads' | 'uploadedDate'>) => void;
  submitGrievance: (grv: {
    title: string;
    category: GrievanceTicket['category'];
    priority: GrievanceTicket['priority'];
    description: string;
  }) => Promise<void>;
  updateGrievanceStatus: (id: string, status: GrievanceTicket['status'], resolutionNotes: string) => void;
  recordVerifiedFeePayment: (invoiceId: string, amount: number, gatewayTxnRef: string) => void;
  publishNotice: (notice: Omit<NoticeAnnouncement, 'id' | 'publishedAt'>) => Promise<void>;
  requestFacilityBooking: (booking: Omit<FacilityBooking, 'id' | 'status'>) => { ok: boolean; message: string };
  updateFacilityBookingStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  requestCertificate: (certType: CertificateRequest['certificateType'], purpose: string) => void;
  approveCertificate: (id: string, status: CertificateRequest['status']) => void;
  createEvent: (evt: Omit<CampusEvent, 'id' | 'registeredStudentIds'>) => void;
  toggleEventRegistration: (eventId: string, studentId: string) => void;

  // Campus Collaboration Hub Actions
  createCollaborationProject: (proj: {
    title: string;
    domain: CollaborationProjectItem['domain'];
    department: string;
    description: string;
    problemStatement: string;
    proposedSolution: string;
    technologies: string[];
    teamName: string;
    requiredTeamSize: number;
  }) => Promise<void>;
  sendCollaborationRequest: (projectId: string, message: string) => { ok: boolean; message: string };
  handleCollaborationRequest: (requestId: string, decision: 'Accepted' | 'Rejected' | 'Withdrawn') => void;
  addCollaborationTask: (task: Omit<CollaborationTask, 'id'>) => void;
  cycleTaskStatus: (taskId: string) => void;
  postCollaborationDiscussion: (projectId: string, message: string, isAnnouncement?: boolean) => void;
  requestFacultyMentor: (projectId: string, facultyId: string, facultyName: string) => void;
  respondMentorshipRequest: (projectId: string, decision: 'Assigned' | 'None', feedback: string) => void;
  toggleProjectShowcase: (projectId: string) => void;

  // Placements & Study Groups
  applyPlacement: (opportunityId: string, studentId: string) => void;
  createPlacementOpportunity: (opp: Omit<PlacementOpportunity, 'id' | 'appliedStudentIds'>) => void;
  joinStudyGroup: (groupId: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (partial: Partial<InstitutionalSettingsConfig>) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('campus_orbit_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(ROLE_DEMO_ACCOUNTS.college_admin);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [courses, setCourses] = useState<CourseSubject[]>(INITIAL_COURSES);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSessionItem[]>(INITIAL_ATTENDANCE_SESSIONS);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>(INITIAL_CORRECTION_REQUESTS);
  const [exams] = useState<ExamScheduleItem[]>(INITIAL_EXAMS);
  const [marks, setMarks] = useState<StudentMarkEntry[]>(INITIAL_MARKS);
  const [gradingScheme] = useState<GradeRange[]>(DEFAULT_GRADING_SCHEME);
  const [timetable, setTimetable] = useState<TimetableSlotEntry[]>(INITIAL_TIMETABLE);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [resources, setResources] = useState<LearningResource[]>(INITIAL_RESOURCES);
  const [grievances, setGrievances] = useState<GrievanceTicket[]>(INITIAL_GRIEVANCES);
  const [invoices, setInvoices] = useState<FeeInvoice[]>(INITIAL_INVOICES);
  const [notices, setNotices] = useState<NoticeAnnouncement[]>(INITIAL_NOTICES);
  const [facilities] = useState<CampusFacility[]>(INITIAL_FACILITIES);
  const [bookings, setBookings] = useState<FacilityBooking[]>(INITIAL_BOOKINGS);
  const [certificates, setCertificates] = useState<CertificateRequest[]>(INITIAL_CERTIFICATES);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [collabProfiles] = useState<CollaborationProfile[]>(INITIAL_COLLAB_PROFILES);
  const [collabProjects, setCollabProjects] = useState<CollaborationProjectItem[]>(INITIAL_COLLAB_PROJECTS);
  const [collabTasks, setCollabTasks] = useState<CollaborationTask[]>(INITIAL_COLLAB_TASKS);
  const [collabDiscussions, setCollabDiscussions] = useState<CollaborationDiscussionPost[]>(INITIAL_COLLAB_DISCUSSIONS);
  const [collabRequests, setCollabRequests] = useState<CollaborationJoinRequest[]>(INITIAL_COLLAB_REQUESTS);
  const [placements, setPlacements] = useState<PlacementOpportunity[]>(INITIAL_PLACEMENTS);
  const [studyGroups, setStudyGroups] = useState<StudyGroupItem[]>(INITIAL_STUDY_GROUPS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<InstitutionalSettingsConfig>(INITIAL_SETTINGS);

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('campus_orbit_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load cached state from IndexedDB on initial mount
  useEffect(() => {
    void (async () => {
      const cachedStudents = await loadSnapshotFromIndexedDB<Student[]>('students');
      if (cachedStudents && cachedStudents.length > 0) {
        setStudents(cachedStudents);
      }
      const cachedProjects = await loadSnapshotFromIndexedDB<CollaborationProjectItem[]>('collabProjects');
      if (cachedProjects && cachedProjects.length > 0) {
        setCollabProjects(cachedProjects);
      }
    })();
  }, []);

  // Persist updates to IndexedDB for offline resilience
  useEffect(() => {
    void saveSnapshotToIndexedDB('students', students);
  }, [students]);

  useEffect(() => {
    void saveSnapshotToIndexedDB('collabProjects', collabProjects);
  }, [collabProjects]);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setFirebaseUser(usr);
      setIsAuthReady(true);
      if (usr) {
        const initials = (usr.displayName || usr.email || 'CO')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setCurrentUser((prev) => ({
          ...prev,
          uid: usr.uid,
          displayName: usr.displayName || prev.displayName,
          email: usr.email || prev.email,
          avatarInitials: initials || 'CO',
        }));
      }
    });
    return () => unsub();
  }, []);

  // Attach Firestore real-time listeners when authenticated
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) return;

    const uid = firebaseUser.uid;
    const studentsQuery = query(collection(db, 'students'), where('ownerId', '==', uid));
    const unsubStudents = onSnapshot(
      studentsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteStudents: Student[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              studentId: String(data.studentId || d.id),
              fullName: String(data.fullName || 'Student'),
              email: `${String(data.studentId || 'student').toLowerCase()}@campusorbit.edu`,
              phone: '+91 98201 00000',
              department: String(data.department || 'Computer Science'),
              course: String(data.course || 'B.Tech CSE'),
              semester: Number(data.semester || 1),
              section: 'A',
              guardianName: 'Verified Guardian',
              guardianPhone: '+91 98201 00001',
              attendancePct: Number(data.attendancePct ?? 85),
              totalClasses: 50,
              attendedClasses: Math.round((Number(data.attendancePct ?? 85) / 100) * 50),
              cgpa: Number(data.cgpa ?? 8.5),
              sgpaHistory: [{ semester: 1, sgpa: Number(data.cgpa ?? 8.5), credits: 20 }],
              feeStatus: (data.feeStatus as Student['feeStatus']) || 'Paid',
              totalFee: 145000,
              paidFee: data.feeStatus === 'Paid' ? 145000 : 80000,
              status: (data.status as Student['status']) || 'Active',
              skills: ['Cloud Computing', 'Algorithms'],
              certifications: [],
            };
          });
          setStudents((prev) => {
            const existingIds = new Set(remoteStudents.map((r) => r.studentId));
            return [...remoteStudents, ...prev.filter((p) => !existingIds.has(p.studentId))];
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'students');
      }
    );

    const grievancesQuery = query(collection(db, 'grievances'), where('ownerId', '==', uid));
    const unsubGrievances = onSnapshot(
      grievancesQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteGrv: GrievanceTicket[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ticketCode: `GRV-${d.id.slice(0, 6).toUpperCase()}`,
              title: String(data.title || ''),
              category: (data.category as GrievanceTicket['category']) || 'Academic',
              priority: (data.priority as GrievanceTicket['priority']) || 'Medium',
              description: String(data.description || ''),
              submittedByRole: currentUser.role,
              submittedById: uid,
              submittedByName: currentUser.displayName,
              assignedTo: 'Administration Desk',
              status: (data.status as GrievanceTicket['status']) || 'Submitted',
              resolutionNotes: String(data.resolutionNotes || ''),
              createdAt: 'Live Cloud Sync',
              updatedAt: 'Live Cloud Sync',
            };
          });
          setGrievances((prev) => {
            const ids = new Set(remoteGrv.map((g) => g.id));
            return [...remoteGrv, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'grievances');
      }
    );

    return () => {
      unsubStudents();
      unsubGrievances();
    };
  }, [isAuthReady, firebaseUser, currentUser.displayName, currentUser.role]);

  const appendAudit = (action: string, moduleName: string, severity: AuditLogItem['severity'] = 'Info') => {
    const newLog: AuditLogItem = {
      id: `aud_${Date.now()}`,
      actorName: currentUser.displayName,
      actorRole: currentUser.role,
      action,
      module: moduleName,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const pushNotification = (
    title: string,
    message: string,
    category: AppNotification['category'],
    targetRoles: UserRole[]
  ) => {
    const item: AppNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      category,
      targetRoles,
      createdAt: 'Just now',
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const switchRoleSession = (role: UserRole) => {
    const demoAccount = ROLE_DEMO_ACCOUNTS[role] || ROLE_DEMO_ACCOUNTS.student;
    if (firebaseUser) {
      setCurrentUser({
        ...demoAccount,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || demoAccount.displayName,
        email: firebaseUser.email || demoAccount.email,
      });
    } else {
      setCurrentUser(demoAccount);
    }
    appendAudit(`Switched active operational role view to ${role.toUpperCase()}`, 'Authentication');
  };

  const signInWithGoogle = async (preferredRole: UserRole = 'student') => {
    const cred = await signInWithPopup(auth, googleProvider);
    const usr = cred.user;
    const safeUid = sanitizeAndValidateId(usr.uid, 128);
    const safeRole = ['student', 'faculty', 'parent'].includes(preferredRole) ? preferredRole : 'student';
    const userDocPath = `users/${safeUid}`;
    try {
      await setDoc(doc(db, 'users', safeUid), {
        uid: safeUid,
        displayName: truncateString(usr.displayName || usr.email || 'Campus User', 120),
        role: safeRole,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userDocPath);
    }
  };

  const logoutSession = async () => {
    if (firebaseUser) {
      await signOut(auth);
    }
    setCurrentUser(ROLE_DEMO_ACCOUNTS.student);
  };

  const addStudent = async (payload: Omit<Student, 'id' | 'studentId'>): Promise<Student> => {
    const nextNum = students.length + 1;
    const generatedId = `STU-2026-00${nextNum}`;
    const docId = sanitizeAndValidateId(`stu_${Date.now()}`, 64);
    const newStudent: Student = {
      ...payload,
      id: docId,
      studentId: generatedId,
    };
    setStudents((prev) => [newStudent, ...prev]);
    // Update department student count
    setDepartments((prev) =>
      prev.map((d) => (d.name === payload.department ? { ...d, totalStudents: d.totalStudents + 1 } : d))
    );
    appendAudit(`Enrolled student ${newStudent.fullName} (${newStudent.studentId}) in ${newStudent.department}`, 'Students');

    if (firebaseUser && firebaseUser.emailVerified) {
      const safeOwnerId = sanitizeAndValidateId(firebaseUser.uid, 128);
      try {
        await setDoc(doc(db, 'students', docId), {
          studentId: sanitizeAndValidateId(generatedId, 64),
          fullName: truncateString(newStudent.fullName, 120),
          department: truncateString(newStudent.department, 80),
          course: truncateString(newStudent.course, 80),
          semester: Math.min(12, Math.max(1, Number(newStudent.semester) || 1)),
          attendancePct: Math.min(100, Math.max(0, Number(newStudent.attendancePct) || 100)),
          cgpa: Math.min(10, Math.max(0, Number(newStudent.cgpa) || 0)),
          feeStatus: newStudent.feeStatus,
          status: newStudent.status,
          ownerId: safeOwnerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `students/${docId}`);
      }
    }
    return newStudent;
  };

  const updateStudentStatus = (id: string, status: Student['status']) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    appendAudit(`Updated student record ${id} status to ${status}`, 'Students');
  };

  const bulkImportStudentsCsv = (csvText: string): number => {
    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let importedCount = 0;
    const newEntries: Student[] = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('name')) return;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        const [fullName, department, course, semStr] = parts;
        importedCount++;
        newEntries.push({
          id: `stu_csv_${Date.now()}_${idx}`,
          studentId: `STU-2026-${100 + students.length + importedCount}`,
          fullName: fullName || 'Imported Student',
          email: `${(fullName || 'student').toLowerCase().replace(/\s+/g, '.')}@campusorbit.edu`,
          phone: '+91 98000 00000',
          department: department || 'Computer Science',
          course: course || 'B.Tech CSE',
          semester: Number(semStr) || 1,
          section: 'A',
          guardianName: 'Guardian Record',
          guardianPhone: '+91 98000 00001',
          attendancePct: 100,
          totalClasses: 10,
          attendedClasses: 10,
          cgpa: 8.5,
          sgpaHistory: [{ semester: 1, sgpa: 8.5, credits: 20 }],
          feeStatus: 'Paid',
          totalFee: 145000,
          paidFee: 145000,
          status: 'Active',
          skills: ['Problem Solving'],
          certifications: [],
        });
      }
    });
    if (newEntries.length > 0) {
      setStudents((prev) => [...newEntries, ...prev]);
      appendAudit(`Bulk imported ${newEntries.length} student records via CSV`, 'Students');
    }
    return newEntries.length;
  };

  const addFaculty = (member: Omit<FacultyMember, 'id' | 'facultyId'>) => {
    const nextId = `FAC-${101 + faculty.length}`;
    const newFac: FacultyMember = {
      ...member,
      id: `fac_${Date.now()}`,
      facultyId: nextId,
    };
    setFaculty((prev) => [newFac, ...prev]);
    appendAudit(`Appointed faculty member ${newFac.fullName} (${newFac.facultyId}) in ${newFac.department}`, 'Faculty');
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept_${Date.now()}`,
    };
    setDepartments((prev) => [...prev, newDept]);
    appendAudit(`Created academic department ${newDept.name} (${newDept.code})`, 'Departments');
  };

  const addCourse = (course: Omit<CourseSubject, 'id'>) => {
    const newCourse: CourseSubject = {
      ...course,
      id: `crs_${Date.now()}`,
    };
    setCourses((prev) => [newCourse, ...prev]);
    appendAudit(`Created course ${newCourse.code}: ${newCourse.title}`, 'Courses');
  };

  const createAttendanceSession = async (payload: {
    subjectCode: string;
    subjectName: string;
    department: string;
    semester: number;
    timeSlot: string;
  }): Promise<AttendanceSessionItem> => {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const sessionCode = `ORBIT-${payload.subjectCode.toUpperCase()}-${randomPin}`;
    const docId = sanitizeAndValidateId(`att_${Date.now()}`, 64);
    const sessionItem: AttendanceSessionItem = {
      id: docId,
      sessionCode,
      subjectCode: payload.subjectCode,
      subjectName: payload.subjectName,
      department: payload.department,
      semester: payload.semester,
      facultyId: currentUser.facultyId || 'FAC-101',
      facultyName: currentUser.displayName,
      date: new Date().toISOString().slice(0, 10),
      timeSlot: payload.timeSlot,
      status: 'active',
      presentStudentIds: [],
      lateStudentIds: [],
      totalStudents: 64,
    };
    setAttendanceSessions((prev) => [sessionItem, ...prev]);
    pushNotification(
      `Live QR Attendance: ${payload.subjectCode}`,
      `${currentUser.displayName} initiated QR session ${sessionCode} for ${payload.subjectName}.`,
      'Attendance',
      ['student', 'faculty']
    );
    appendAudit(`Launched QR attendance session ${sessionCode}`, 'Attendance');

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'attendanceSessions', docId), {
          sessionCode: truncateString(sessionCode, 64),
          subjectCode: truncateString(payload.subjectCode, 32),
          subjectName: truncateString(payload.subjectName, 120),
          department: truncateString(payload.department, 80),
          semester: Math.min(12, Math.max(1, Number(payload.semester) || 1)),
          facultyId: sanitizeAndValidateId(firebaseUser.uid, 128),
          status: 'active',
          presentCount: 0,
          totalStudents: 64,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `attendanceSessions/${docId}`);
      }
    }
    return sessionItem;
  };

  const closeAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'closed' } : s))
    );
    appendAudit(`Closed QR attendance session ${sessionId}`, 'Attendance');
  };

  const submitStudentQRCheckIn = (
    sessionCode: string,
    studentId: string
  ): { valid: boolean; message: string } => {
    const target = attendanceSessions.find(
      (s) => s.sessionCode.trim().toUpperCase() === sessionCode.trim().toUpperCase()
    );
    if (!target) {
      return { valid: false, error: 'No active attendance session matches that QR code.', message: 'No active attendance session matches that QR code.' } as { valid: boolean; message: string };
    }
    const validation = validateQRCheckIn(
      target.status,
      target.sessionCode,
      sessionCode,
      target.presentStudentIds,
      studentId
    );
    if (!validation.valid) {
      return { valid: false, message: validation.error || 'Check-in rejected.' };
    }

    setAttendanceSessions((prev) =>
      prev.map((s) =>
        s.id === target.id
          ? { ...s, presentStudentIds: [...s.presentStudentIds, studentId] }
          : s
      )
    );
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.studentId === studentId) {
          const nextTotal = stu.totalClasses + 1;
          const nextAttended = stu.attendedClasses + 1;
          return {
            ...stu,
            totalClasses: nextTotal,
            attendedClasses: nextAttended,
            attendancePct: Number(((nextAttended / nextTotal) * 100).toFixed(1)),
          };
        }
        return stu;
      })
    );
    appendAudit(`Verified QR attendance check-in for ${studentId} in session ${target.sessionCode}`, 'Attendance');
    return {
      valid: true,
      message: `Attendance verified for ${target.subjectCode} (${target.subjectName}).`,
    };
  };

  const resolveCorrectionRequest = (id: string, status: 'Approved' | 'Rejected') => {
    setCorrectionRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    appendAudit(`${status} attendance correction request ${id}`, 'Attendance');
  };

  const addTimetableSlot = (slot: Omit<TimetableSlotEntry, 'id'>): TimetableConflict => {
    const conflict = detectTimetableConflicts(timetable, slot);
    if (!conflict.hasConflict) {
      const newSlot: TimetableSlotEntry = {
        ...slot,
        id: `tt_${Date.now()}`,
      };
      setTimetable((prev) => [...prev, newSlot]);
      pushNotification(
        `Timetable Updated: ${slot.department} Sem ${slot.semester}`,
        `${slot.subjectCode} scheduled on ${slot.day} (${slot.timeSlot}) in ${slot.room}.`,
        'Timetable',
        ['student', 'faculty', 'college_admin']
      );
      appendAudit(`Scheduled ${slot.subjectCode} on ${slot.day} ${slot.timeSlot} in ${slot.room}`, 'Timetable');
    }
    return conflict;
  };

  const addOrUpdateMark = (entry: Omit<StudentMarkEntry, 'id'>) => {
    setMarks((prev) => {
      const existingIdx = prev.findIndex(
        (m) => m.studentId === entry.studentId && m.subjectCode === entry.subjectCode
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...entry };
        return updated;
      }
      return [{ ...entry, id: `mrk_${Date.now()}` }, ...prev];
    });
    pushNotification(
      `Examination Marks Published: ${entry.subjectCode}`,
      `Updated marks for ${entry.studentName} in ${entry.subjectName}.`,
      'Exam',
      ['student', 'parent']
    );
    appendAudit(`Published marks for ${entry.studentId} in ${entry.subjectCode}`, 'Examinations');
  };

  const createAssignment = (asg: Omit<AssignmentItem, 'id' | 'submissions'>) => {
    const newAsg: AssignmentItem = {
      ...asg,
      id: `asg_${Date.now()}`,
      submissions: [],
    };
    setAssignments((prev) => [newAsg, ...prev]);
    pushNotification(
      `New Assignment: ${asg.subjectCode}`,
      `${asg.title} due on ${asg.dueDate}.`,
      'Assignment',
      ['student']
    );
    appendAudit(`Created assignment "${asg.title}" for ${asg.subjectCode}`, 'Assignments');
  };

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    studentName: string,
    fileName: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const filtered = a.submissions.filter((s) => s.studentId !== studentId);
        return {
          ...a,
          submissions: [
            ...filtered,
            {
              studentId,
              studentName,
              submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              fileName,
              status: 'Submitted',
            },
          ],
        };
      })
    );
    appendAudit(`Student ${studentId} submitted assignment ${assignmentId}`, 'Assignments');
  };

  const evaluateSubmission = (
    assignmentId: string,
    studentId: string,
    marksAwarded: number,
    feedback: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((s) =>
            s.studentId === studentId
              ? { ...s, marks: marksAwarded, feedback, status: 'Evaluated' }
              : s
          ),
        };
      })
    );
    appendAudit(`Evaluated submission for ${studentId} on assignment ${assignmentId}`, 'Assignments');
  };

  const addLearningResource = (
    res: Omit<LearningResource, 'id' | 'downloads' | 'uploadedDate'>
  ) => {
    const newRes: LearningResource = {
      ...res,
      id: `res_${Date.now()}`,
      uploadedDate: new Date().toISOString().slice(0, 10),
      downloads: 1,
    };
    setResources((prev) => [newRes, ...prev]);
    appendAudit(`Uploaded learning resource "${res.title}" for ${res.subjectCode}`, 'Resources');
  };

  const submitGrievance = async (grv: {
    title: string;
    category: GrievanceTicket['category'];
    priority: GrievanceTicket['priority'];
    description: string;
  }) => {
    const docId = sanitizeAndValidateId(`grv_${Date.now()}`, 64);
    const ticket: GrievanceTicket = {
      id: docId,
      ticketCode: `GRV-2026-${100 + grievances.length}`,
      title: grv.title,
      category: grv.category,
      priority: grv.priority,
      description: grv.description,
      submittedByRole: currentUser.role,
      submittedById: currentUser.studentId || currentUser.uid,
      submittedByName: currentUser.displayName,
      assignedTo: 'Institutional Grievance Cell',
      status: 'Submitted',
      resolutionNotes: 'Awaiting initial review by Grievance Redressal Officer.',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setGrievances((prev) => [ticket, ...prev]);
    pushNotification(
      `Grievance Logged: ${ticket.ticketCode}`,
      `Ticket "${ticket.title}" submitted with ${ticket.priority} priority.`,
      'Grievance',
      ['college_admin', 'super_admin']
    );
    appendAudit(`Submitted confidential grievance ${ticket.ticketCode}`, 'Grievances', 'Warning');

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'grievances', docId), {
          title: truncateString(grv.title, 140),
          category: truncateString(grv.category, 64),
          priority: grv.priority,
          description: truncateString(grv.description, 1500),
          status: 'Submitted',
          resolutionNotes: 'Awaiting initial review.',
          ownerId: sanitizeAndValidateId(firebaseUser.uid, 128),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `grievances/${docId}`);
      }
    }
  };

  const updateGrievanceStatus = (
    id: string,
    status: GrievanceTicket['status'],
    resolutionNotes: string
  ) => {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status,
              resolutionNotes,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : g
      )
    );
    pushNotification(
      `Grievance Status Updated`,
      `Grievance ${id} moved to "${status}".`,
      'Grievance',
      ['student', 'college_admin']
    );
    appendAudit(`Updated grievance ${id} status to ${status}`, 'Grievances');
  };

  const recordVerifiedFeePayment = (
    invoiceId: string,
    amount: number,
    gatewayTxnRef: string
  ) => {
    if (!gatewayTxnRef.trim()) return;
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const nextPaid = Math.min(inv.totalAmount, inv.paidAmount + amount);
        const nextStatus: FeeInvoice['status'] =
          nextPaid >= inv.totalAmount ? 'Paid' : nextPaid > 0 ? 'Partial' : inv.status;
        return {
          ...inv,
          paidAmount: nextPaid,
          status: nextStatus,
          lastPaymentRef: gatewayTxnRef.trim().toUpperCase(),
          lastPaymentDate: new Date().toISOString().slice(0, 10),
        };
      })
    );
    appendAudit(
      `Verified gateway transaction ${gatewayTxnRef} for invoice ${invoiceId} (₹${amount.toLocaleString()})`,
      'Finance',
      'Security'
    );
  };

  const publishNotice = async (notice: Omit<NoticeAnnouncement, 'id' | 'publishedAt'>) => {
    const docId = sanitizeAndValidateId(`not_${Date.now()}`, 64);
    const newNotice: NoticeAnnouncement = {
      ...notice,
      id: docId,
      publishedAt: new Date().toISOString().slice(0, 10),
    };
    setNotices((prev) => [newNotice, ...prev]);
    pushNotification(
      `New ${notice.category} Notice`,
      notice.title,
      'Event',
      ['student', 'faculty', 'parent', 'college_admin']
    );
    appendAudit(`Published institutional notice "${notice.title}"`, 'Notices');

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'notices', docId), {
          title: truncateString(notice.title, 140),
          category: notice.category,
          audience: notice.audience,
          content: truncateString(notice.content, 2000),
          authorId: sanitizeAndValidateId(firebaseUser.uid, 128),
          authorName: truncateString(notice.authorName, 120),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `notices/${docId}`);
      }
    }
  };

  const requestFacilityBooking = (
    booking: Omit<FacilityBooking, 'id' | 'status'>
  ): { ok: boolean; message: string } => {
    const conflict = bookings.find(
      (b) =>
        b.facilityId === booking.facilityId &&
        b.date === booking.date &&
        b.timeSlot === booking.timeSlot &&
        b.status === 'Approved'
    );
    if (conflict) {
      return {
        ok: false,
        message: `Conflict detected: ${booking.facilityName} is already reserved on ${booking.date} (${booking.timeSlot}) for "${conflict.purpose}".`,
      };
    }
    const newBooking: FacilityBooking = {
      ...booking,
      id: `bk_${Date.now()}`,
      status: 'Pending',
    };
    setBookings((prev) => [newBooking, ...prev]);
    appendAudit(`Requested facility reservation for ${booking.facilityName} on ${booking.date}`, 'Facilities');
    return { ok: true, message: 'Facility booking request submitted for administrative approval.' };
  };

  const updateFacilityBookingStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    appendAudit(`${status} facility booking ${id}`, 'Facilities');
  };

  const requestCertificate = (
    certificateType: CertificateRequest['certificateType'],
    purpose: string
  ) => {
    const newCert: CertificateRequest = {
      id: `cert_${Date.now()}`,
      certNo: `CERT-2026-${420 + certificates.length}`,
      studentId: currentUser.studentId || 'STU-2026-001',
      studentName: currentUser.displayName,
      department: currentUser.department || 'Computer Science',
      semester: 5,
      certificateType,
      purpose,
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'Pending Approval',
    };
    setCertificates((prev) => [newCert, ...prev]);
    appendAudit(`Requested ${certificateType} (${newCert.certNo})`, 'Certificates');
  };

  const approveCertificate = (id: string, status: CertificateRequest['status']) => {
    setCertificates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    appendAudit(`Updated certificate ${id} status to ${status}`, 'Certificates');
  };

  const createEvent = (evt: Omit<CampusEvent, 'id' | 'registeredStudentIds'>) => {
    const newEvt: CampusEvent = {
      ...evt,
      id: `evt_${Date.now()}`,
      registeredStudentIds: [],
    };
    setEvents((prev) => [newEvt, ...prev]);
    pushNotification(`New Campus Event: ${evt.title}`, `${evt.category} on ${evt.date} at ${evt.venue}`, 'Event', [
      'student',
      'faculty',
    ]);
    appendAudit(`Created campus event "${evt.title}"`, 'Events');
  };

  const toggleEventRegistration = (eventId: string, studentId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const exists = e.registeredStudentIds.includes(studentId);
        return {
          ...e,
          registeredStudentIds: exists
            ? e.registeredStudentIds.filter((id) => id !== studentId)
            : [...e.registeredStudentIds, studentId],
        };
      })
    );
  };

  const createCollaborationProject = async (proj: {
    title: string;
    domain: CollaborationProjectItem['domain'];
    department: string;
    description: string;
    problemStatement: string;
    proposedSolution: string;
    technologies: string[];
    teamName: string;
    requiredTeamSize: number;
  }) => {
    const docId = sanitizeAndValidateId(`cproj_${Date.now()}`, 64);
    const newProj: CollaborationProjectItem = {
      id: docId,
      title: proj.title,
      domain: proj.domain,
      department: proj.department,
      description: proj.description,
      problemStatement: proj.problemStatement,
      proposedSolution: proj.proposedSolution,
      technologies: proj.technologies,
      leadStudentId: currentUser.studentId || 'STU-2026-001',
      leadStudentName: currentUser.displayName,
      teamName: proj.teamName,
      teamMembers: [
        {
          id: currentUser.studentId || 'STU-2026-001',
          name: currentUser.displayName,
          department: currentUser.department || 'Computer Science',
          role: 'Project Lead',
        },
      ],
      requiredTeamSize: proj.requiredTeamSize,
      mentorStatus: 'None',
      status: 'Planning',
      progressPct: 15,
      showcased: false,
    };
    setCollabProjects((prev) => [newProj, ...prev]);
    pushNotification(
      `New Collaboration Project: ${proj.title}`,
      `${currentUser.displayName} created team "${proj.teamName}" in ${proj.domain}.`,
      'Collaboration',
      ['student', 'faculty']
    );
    appendAudit(`Launched interdisciplinary project "${proj.title}"`, 'Collaboration Hub');

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'collaborationProjects', docId), {
          title: truncateString(proj.title, 140),
          domain: truncateString(proj.domain, 80),
          department: truncateString(proj.department, 80),
          description: truncateString(proj.description, 1500),
          ownerId: sanitizeAndValidateId(firebaseUser.uid, 128),
          ownerName: truncateString(currentUser.displayName, 120),
          teamSizeTarget: Math.min(20, Math.max(1, Number(proj.requiredTeamSize) || 4)),
          currentMembersCount: 1,
          status: 'Planning',
          progressPct: 15,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `collaborationProjects/${docId}`);
      }
    }
  };

  const sendCollaborationRequest = (
    projectId: string,
    message: string
  ): { ok: boolean; message: string } => {
    const stuId = currentUser.studentId || 'STU-2026-005';
    const duplicate = collabRequests.find(
      (r) => r.projectId === projectId && r.studentId === stuId && r.status === 'Pending'
    );
    if (duplicate) {
      return { ok: false, message: 'Duplicate request prevented: You already have a pending request for this project.' };
    }
    const targetProject = collabProjects.find((p) => p.id === projectId);
    if (!targetProject) {
      return { ok: false, message: 'Project not found.' };
    }
    const newReq: CollaborationJoinRequest = {
      id: `creq_${Date.now()}`,
      projectId,
      projectTitle: targetProject.title,
      studentId: stuId,
      studentName: currentUser.displayName,
      department: currentUser.department || 'Computer Science',
      semester: 5,
      type: 'Join Request',
      message,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCollabRequests((prev) => [newReq, ...prev]);
    pushNotification(
      `Collaboration Request Received`,
      `${currentUser.displayName} requested to join "${targetProject.title}".`,
      'Collaboration',
      ['student']
    );
    return { ok: true, message: `Join request sent to ${targetProject.teamName}.` };
  };

  const handleCollaborationRequest = (
    requestId: string,
    decision: 'Accepted' | 'Rejected' | 'Withdrawn'
  ) => {
    const targetReq = collabRequests.find((r) => r.id === requestId);
    setCollabRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: decision } : r))
    );
    if (decision === 'Accepted' && targetReq) {
      setCollabProjects((prev) =>
        prev.map((p) => {
          if (p.id !== targetReq.projectId) return p;
          if (p.teamMembers.some((m) => m.id === targetReq.studentId)) return p;
          return {
            ...p,
            teamMembers: [
              ...p.teamMembers,
              {
                id: targetReq.studentId,
                name: targetReq.studentName,
                department: targetReq.department,
                role: 'Interdisciplinary Collaborator',
              },
            ],
          };
        })
      );
    }
  };

  const addCollaborationTask = (task: Omit<CollaborationTask, 'id'>) => {
    const newTask: CollaborationTask = {
      ...task,
      id: `ctsk_${Date.now()}`,
    };
    setCollabTasks((prev) => [newTask, ...prev]);
  };

  const cycleTaskStatus = (taskId: string) => {
    const order: CollaborationTask['status'][] = ['Todo', 'In Progress', 'Done'];
    setCollabTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextIdx = (order.indexOf(t.status) + 1) % order.length;
        return { ...t, status: order[nextIdx] };
      })
    );
  };

  const postCollaborationDiscussion = (
    projectId: string,
    message: string,
    isAnnouncement = false
  ) => {
    const post: CollaborationDiscussionPost = {
      id: `cdisc_${Date.now()}`,
      projectId,
      authorName: currentUser.displayName,
      authorRole: currentUser.role === 'faculty' ? 'Faculty Mentor' : 'Team Collaborator',
      message,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isAnnouncement,
    };
    setCollabDiscussions((prev) => [...prev, post]);
  };

  const requestFacultyMentor = (
    projectId: string,
    facultyId: string,
    facultyName: string
  ) => {
    setCollabProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, mentorFacultyId: facultyId, mentorFacultyName: facultyName, mentorStatus: 'Requested' }
          : p
      )
    );
    pushNotification(
      `Faculty Mentorship Requested`,
      `Project team requested ${facultyName} as faculty mentor.`,
      'Collaboration',
      ['faculty']
    );
  };

  const respondMentorshipRequest = (
    projectId: string,
    decision: 'Assigned' | 'None',
    feedback: string
  ) => {
    setCollabProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, mentorStatus: decision, mentorFeedback: feedback || p.mentorFeedback }
          : p
      )
    );
  };

  const toggleProjectShowcase = (projectId: string) => {
    setCollabProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, showcased: !p.showcased } : p))
    );
  };

  const applyPlacement = (opportunityId: string, studentId: string) => {
    setPlacements((prev) =>
      prev.map((p) => {
        if (p.id !== opportunityId) return p;
        if (p.appliedStudentIds.includes(studentId)) return p;
        return { ...p, appliedStudentIds: [...p.appliedStudentIds, studentId] };
      })
    );
    appendAudit(`Student ${studentId} applied to placement drive ${opportunityId}`, 'Placements');
  };

  const createPlacementOpportunity = (
    opp: Omit<PlacementOpportunity, 'id' | 'appliedStudentIds'>
  ) => {
    const newOpp: PlacementOpportunity = {
      ...opp,
      id: `plc_${Date.now()}`,
      appliedStudentIds: [],
    };
    setPlacements((prev) => [newOpp, ...prev]);
    appendAudit(`Published career opportunity at ${opp.companyName} (${opp.roleTitle})`, 'Placements');
  };

  const joinStudyGroup = (groupId: string) => {
    setStudyGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, membersCount: g.membersCount + 1 } : g))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateSettings = (partial: Partial<InstitutionalSettingsConfig>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    appendAudit(`Updated institutional configuration parameters`, 'Institutional Settings', 'Security');
  };

  return (
    <CampusContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthReady,
        syncMode: firebaseUser ? 'cloud_firestore' : 'sandbox_demo',
        theme,
        toggleTheme,
        switchRoleSession,
        signInWithGoogle,
        logoutSession,
        students,
        faculty,
        departments,
        courses,
        attendanceSessions,
        correctionRequests,
        exams,
        marks,
        gradingScheme,
        timetable,
        assignments,
        resources,
        grievances,
        invoices,
        notices,
        facilities,
        bookings,
        certificates,
        events,
        collabProfiles,
        collabProjects,
        collabTasks,
        collabDiscussions,
        collabRequests,
        placements,
        studyGroups,
        notifications,
        auditLogs,
        settings,
        addStudent,
        updateStudentStatus,
        bulkImportStudentsCsv,
        addFaculty,
        addDepartment,
        addCourse,
        createAttendanceSession,
        closeAttendanceSession,
        submitStudentQRCheckIn,
        resolveCorrectionRequest,
        addTimetableSlot,
        addOrUpdateMark,
        createAssignment,
        submitAssignment,
        evaluateSubmission,
        addLearningResource,
        submitGrievance,
        updateGrievanceStatus,
        recordVerifiedFeePayment,
        publishNotice,
        requestFacilityBooking,
        updateFacilityBookingStatus,
        requestCertificate,
        approveCertificate,
        createEvent,
        toggleEventRegistration,
        createCollaborationProject,
        sendCollaborationRequest,
        handleCollaborationRequest,
        addCollaborationTask,
        cycleTaskStatus,
        postCollaborationDiscussion,
        requestFacultyMentor,
        respondMentorshipRequest,
        toggleProjectShowcase,
        applyPlacement,
        createPlacementOpportunity,
        joinStudyGroup,
        markAllNotificationsRead,
        updateSettings,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = (): CampusContextType => {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return ctx;
};
