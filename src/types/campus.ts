export type UserRole =
  | 'super_admin'
  | 'college_admin'
  | 'faculty'
  | 'student'
  | 'parent';

export interface UserAccount {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  department?: string;
  linkedStudentId?: string;
  facultyId?: string;
  studentId?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatarInitials: string;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  semester: number;
  section: string;
  guardianName: string;
  guardianPhone: string;
  attendancePct: number;
  totalClasses: number;
  attendedClasses: number;
  cgpa: number;
  sgpaHistory: Array<{ semester: number; sgpa: number; credits: number }>;
  feeStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  totalFee: number;
  paidFee: number;
  status: 'Active' | 'Graduated' | 'Inactive';
  skills: string[];
  certifications: string[];
}

export interface FacultyMember {
  id: string;
  facultyId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  experienceYears: number;
  assignedSubjects: string[];
  assignedSemesters: number[];
  weeklyHours: number;
  maxWeeklyHours: number;
  attendancePct: number;
  menteesCount: number;
  status: 'Active' | 'On Leave';
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
  hodFacultyId: string;
  programs: string[];
  totalStudents: number;
  totalFaculty: number;
  avgAttendance: number;
  avgCgpa: number;
  annualBudgetAllocated: number;
  annualBudgetUtilized: number;
}

export interface CourseSubject {
  id: string;
  code: string;
  title: string;
  department: string;
  program: string;
  semester: number;
  credits: number;
  facultyId: string;
  facultyName: string;
  enrolledCount: number;
  type: 'Core' | 'Elective' | 'Laboratory';
}

export interface AttendanceSessionItem {
  id: string;
  sessionCode: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  facultyId: string;
  facultyName: string;
  date: string;
  timeSlot: string;
  status: 'active' | 'closed';
  presentStudentIds: string[];
  lateStudentIds: string[];
  totalStudents: number;
}

export interface AttendanceCorrectionRequest {
  id: string;
  studentId: string;
  studentName: string;
  subjectCode: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ExamScheduleItem {
  id: string;
  examTitle: string;
  examType: 'Mid-Semester' | 'End-Semester' | 'Internal Assessment' | 'Practical';
  department: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  date: string;
  time: string;
  venue: string;
  maxMarks: number;
  published: boolean;
}

export interface StudentMarkEntry {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  department: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  maxMarks: number;
  published: boolean;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  facultyName: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  attachmentName: string;
  submissions: Array<{
    studentId: string;
    studentName: string;
    submittedAt: string;
    fileName: string;
    marks?: number;
    feedback?: string;
    status: 'Submitted' | 'Evaluated' | 'Late';
  }>;
}

export interface LearningResource {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  department: string;
  semester: number;
  type: 'Lecture Notes' | 'Reference PDF' | 'Lab Manual' | 'Question Bank';
  uploadedBy: string;
  uploadedDate: string;
  fileSize: string;
  downloads: number;
}

export interface GrievanceTicket {
  id: string;
  ticketCode: string;
  title: string;
  category: 'Academic' | 'Infrastructure' | 'Hostel & Dining' | 'Examination' | 'Finance' | 'Confidential Harassment';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  submittedByRole: UserRole;
  submittedById: string;
  submittedByName: string;
  assignedTo: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  resolutionNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  department: string;
  semester: number;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  examFee: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  lastPaymentRef?: string;
  lastPaymentDate?: string;
}

export interface NoticeAnnouncement {
  id: string;
  title: string;
  category: 'Institutional' | 'Department' | 'Examination' | 'Event' | 'Placement';
  audience: 'All' | 'Students' | 'Faculty' | 'Parents' | 'Admins';
  department?: string;
  content: string;
  authorName: string;
  publishedAt: string;
  pinned: boolean;
}

export interface CampusFacility {
  id: string;
  name: string;
  type: 'Classroom' | 'Laboratory' | 'Seminar Hall' | 'Auditorium' | 'Library' | 'Sports Facility' | 'Equipment';
  building: string;
  capacity: number;
  equipmentList: string[];
  status: 'Available' | 'Maintenance';
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  requestedBy: string;
  requesterRole: UserRole;
  purpose: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface CertificateRequest {
  id: string;
  certNo: string;
  studentId: string;
  studentName: string;
  department: string;
  semester: number;
  certificateType: 'Bonafide Certificate' | 'Study Certificate' | 'Transfer Certificate' | 'Character Certificate' | 'No Dues Certificate';
  purpose: string;
  requestedAt: string;
  status: 'Pending Approval' | 'Approved & Issued' | 'Rejected';
}

export interface CampusEvent {
  id: string;
  title: string;
  category: 'Workshop' | 'Seminar' | 'Technical Competition' | 'Cultural Activity' | 'Sports Event';
  department: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  maxParticipants: number;
  registeredStudentIds: string[];
  description: string;
}

export type ProjectDomain =
  | 'AI and Machine Learning'
  | 'Internet of Things'
  | 'Web Development'
  | 'Mobile Applications'
  | 'Robotics'
  | 'Cloud Computing'
  | 'Cybersecurity'
  | 'Data Science'
  | 'Electronics'
  | 'Social Innovation';

export interface CollaborationProfile {
  id: string;
  studentId: string;
  name: string;
  department: string;
  semester: number;
  technicalInterests: string[];
  preferredDomains: ProjectDomain[];
  previousProjectsCount: number;
  bio: string;
  availability: 'Open to Lead' | 'Seeking Team' | 'Mentored Research';
}

export interface CollaborationTask {
  id: string;
  projectId: string;
  title: string;
  assigneeName: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
  milestoneTitle: string;
}

export interface CollaborationDiscussionPost {
  id: string;
  projectId: string;
  authorName: string;
  authorRole: string;
  message: string;
  timestamp: string;
  isAnnouncement?: boolean;
}

export interface CollaborationProjectItem {
  id: string;
  title: string;
  domain: ProjectDomain;
  department: string;
  description: string;
  problemStatement: string;
  proposedSolution: string;
  technologies: string[];
  leadStudentId: string;
  leadStudentName: string;
  teamName: string;
  teamMembers: Array<{ id: string; name: string; department: string; role: string }>;
  requiredTeamSize: number;
  mentorFacultyId?: string;
  mentorFacultyName?: string;
  mentorStatus: 'None' | 'Requested' | 'Assigned';
  mentorFeedback?: string;
  status: 'Planning' | 'In Progress' | 'Under Review' | 'Completed' | 'On Hold';
  progressPct: number;
  githubUrl?: string;
  demoUrl?: string;
  outcomes?: string;
  showcased: boolean;
}

export interface CollaborationJoinRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  studentId: string;
  studentName: string;
  department: string;
  semester: number;
  type: 'Join Request' | 'Team Invitation';
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';
  createdAt: string;
}

export interface PlacementOpportunity {
  id: string;
  companyName: string;
  roleTitle: string;
  type: 'Full-Time Placement' | 'Summer Internship' | 'Research Fellowship';
  packageOrStipend: string;
  location: string;
  eligibleDepartments: string[];
  minCgpa: number;
  deadline: string;
  appliedStudentIds: string[];
  description: string;
}

export interface StudyGroupItem {
  id: string;
  name: string;
  subjectCode: string;
  department: string;
  semester: number;
  membersCount: number;
  nextSession: string;
  topic: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'Attendance' | 'Timetable' | 'Assignment' | 'Exam' | 'Finance' | 'Grievance' | 'Collaboration' | 'Event';
  targetRoles: UserRole[];
  createdAt: string;
  read: boolean;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  module: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Security';
}

export interface InstitutionalSettingsConfig {
  institutionName: string;
  institutionCode: string;
  academicYear: string;
  activeSemesterCycle: 'Odd Semesters (1, 3, 5, 7)' | 'Even Semesters (2, 4, 6, 8)';
  minAttendanceThresholdPct: number;
  allowStudentSelfRegistration: boolean;
  enableParentVerificationGate: boolean;
  enableQrSessionGeoFence: boolean;
  paymentGatewayProvider: 'Razorpay Enterprise' | 'Stripe Education' | 'Sandbox Test Gateway';
}
