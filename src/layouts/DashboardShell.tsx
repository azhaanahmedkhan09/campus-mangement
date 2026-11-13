import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileSpreadsheet,
  FolderGit2,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Moon,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useCampus } from '../contexts/CampusContext';
import { UserRole } from '../types/campus';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { CommandPalette } from '../components/CommandPalette';
import { OverviewAnalyticsModule } from '../modules/analytics/OverviewAnalyticsModule';
import {
  DepartmentAndCourseModule,
  FacultyManagementModule,
  StudentManagementModule,
} from '../modules/administration/PeopleAndDepartmentsModule';
import {
  ExaminationAndResultsModule,
  SmartAttendanceModule,
  TimetableManagementModule,
} from '../modules/academics/AttendanceAndExamsModule';
import { CollaborationHubModule } from '../modules/collaboration/CollaborationHubModule';
import {
  AssignmentsAndResourcesModule,
  FacilitiesCertificatesEventsModule,
  FinanceManagementModule,
  GrievanceManagementModule,
  ParentGuardianPortalModule,
  PlacementsAndCareerModule,
  SuperAdminGovernanceModule,
} from '../modules/operations/CampusOperationsModule';

interface DashboardShellProps {
  onReturnLanding: () => void;
  onOpenAuthModal: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  onReturnLanding,
  onOpenAuthModal,
}) => {
  const {
    currentUser,
    syncMode,
    theme,
    toggleTheme,
    switchRoleSession,
    logoutSession,
    notifications,
    markAllNotificationsRead,
  } = useCampus();

  const [activeModule, setActiveModule] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Role-specific navigation menus matching Section 29
  const getRoleNavigation = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'college_admin':
        return [
          { key: 'overview', label: 'Overview & Analytics', icon: <LayoutDashboard className="h-4 w-4" /> },
          { key: 'students', label: 'Students', icon: <GraduationCap className="h-4 w-4" /> },
          { key: 'faculty', label: 'Faculty', icon: <Users className="h-4 w-4" /> },
          { key: 'departments', label: 'Departments & Courses', icon: <Building2 className="h-4 w-4" /> },
          { key: 'attendance', label: 'Smart Attendance (QR)', icon: <QrCode className="h-4 w-4" /> },
          { key: 'examinations', label: 'Examinations & Results', icon: <FileSpreadsheet className="h-4 w-4" /> },
          { key: 'timetable', label: 'Timetable', icon: <Calendar className="h-4 w-4" /> },
          { key: 'finance', label: 'Finance & Fees', icon: <CreditCard className="h-4 w-4" /> },
          { key: 'grievances', label: 'Grievances', icon: <MessageSquareWarning className="h-4 w-4" /> },
          { key: 'facilities', label: 'Facilities & Certificates', icon: <Award className="h-4 w-4" /> },
          { key: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
          { key: 'collaboration', label: 'Collaboration Hub', icon: <FolderGit2 className="h-4 w-4" /> },
          { key: 'placements', label: 'Placements & Career', icon: <Briefcase className="h-4 w-4" /> },
          { key: 'settings', label: 'Settings & Security', icon: <Settings className="h-4 w-4" /> },
        ];
      case 'faculty':
        return [
          { key: 'overview', label: 'Faculty Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
          { key: 'attendance', label: 'QR Attendance', icon: <QrCode className="h-4 w-4" /> },
          { key: 'timetable', label: 'My Timetable', icon: <Calendar className="h-4 w-4" /> },
          { key: 'assignments', label: 'Assignments & Resources', icon: <BookOpen className="h-4 w-4" /> },
          { key: 'examinations', label: 'Examinations & Marks', icon: <FileSpreadsheet className="h-4 w-4" /> },
          { key: 'students', label: 'Assigned Students', icon: <GraduationCap className="h-4 w-4" /> },
          { key: 'collaboration', label: 'Project Mentorship', icon: <FolderGit2 className="h-4 w-4" /> },
          { key: 'facilities', label: 'Lab & Hall Booking', icon: <Building2 className="h-4 w-4" /> },
        ];
      case 'student':
        return [
          { key: 'overview', label: 'Personal Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { key: 'collaboration', label: 'Campus Collaboration Hub', icon: <FolderGit2 className="h-4 w-4" /> },
          { key: 'attendance', label: 'My Attendance & QR Scan', icon: <QrCode className="h-4 w-4" /> },
          { key: 'examinations', label: 'Results & Transcripts', icon: <FileSpreadsheet className="h-4 w-4" /> },
          { key: 'timetable', label: 'Timetable', icon: <Calendar className="h-4 w-4" /> },
          { key: 'assignments', label: 'Assignments & Resources', icon: <BookOpen className="h-4 w-4" /> },
          { key: 'finance', label: 'Fee Invoices', icon: <CreditCard className="h-4 w-4" /> },
          { key: 'grievances', label: 'Grievances', icon: <MessageSquareWarning className="h-4 w-4" /> },
          { key: 'placements', label: 'Placements & Study Groups', icon: <Briefcase className="h-4 w-4" /> },
          { key: 'certificates', label: 'Certificates & Events', icon: <Award className="h-4 w-4" /> },
        ];
      case 'parent':
        return [
          { key: 'parent_portal', label: 'Ward Academic Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
          { key: 'attendance', label: 'Attendance Monitoring', icon: <ClipboardCheck className="h-4 w-4" /> },
          { key: 'examinations', label: 'Academic Results & Exams', icon: <FileSpreadsheet className="h-4 w-4" /> },
          { key: 'finance', label: 'Fee Status & Receipts', icon: <CreditCard className="h-4 w-4" /> },
        ];
      case 'super_admin':
        return [
          { key: 'settings', label: 'System Governance & Audit', icon: <ShieldCheck className="h-4 w-4" /> },
          { key: 'overview', label: 'Institutional Analytics', icon: <BarChart3 className="h-4 w-4" /> },
          { key: 'students', label: 'Student Directory', icon: <GraduationCap className="h-4 w-4" /> },
          { key: 'faculty', label: 'Administrator & Faculty', icon: <Users className="h-4 w-4" /> },
          { key: 'departments', label: 'Departments & Programs', icon: <Building2 className="h-4 w-4" /> },
          { key: 'grievances', label: 'Grievance Escalations', icon: <MessageSquareWarning className="h-4 w-4" /> },
        ];
    }
  };

  const navItems = getRoleNavigation(currentUser.role);
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const renderMainContent = () => {
    if (currentUser.role === 'parent' && activeModule === 'overview') {
      return <ParentGuardianPortalModule />;
    }
    if (currentUser.role === 'super_admin' && activeModule === 'overview') {
      return <SuperAdminGovernanceModule />;
    }
    switch (activeModule) {
      case 'overview':
        return <OverviewAnalyticsModule onNavigateModule={setActiveModule} />;
      case 'students':
        return <StudentManagementModule />;
      case 'faculty':
        return <FacultyManagementModule />;
      case 'departments':
      case 'courses':
        return <DepartmentAndCourseModule />;
      case 'attendance':
        return <SmartAttendanceModule />;
      case 'examinations':
      case 'results':
      case 'academics':
        return <ExaminationAndResultsModule />;
      case 'timetable':
        return <TimetableManagementModule />;
      case 'collaboration':
        return <CollaborationHubModule />;
      case 'assignments':
      case 'resources':
        return <AssignmentsAndResourcesModule />;
      case 'grievances':
        return <GrievanceManagementModule />;
      case 'finance':
        return <FinanceManagementModule />;
      case 'facilities':
        return <FacilitiesCertificatesEventsModule subView="facilities" />;
      case 'certificates':
        return <FacilitiesCertificatesEventsModule subView="certificates" />;
      case 'events':
        return <FacilitiesCertificatesEventsModule subView="events" />;
      case 'placements':
        return <PlacementsAndCareerModule />;
      case 'parent_portal':
        return <ParentGuardianPortalModule />;
      case 'settings':
        return <SuperAdminGovernanceModule />;
      default:
        return <OverviewAnalyticsModule onNavigateModule={setActiveModule} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col justify-between border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={onReturnLanding}
                className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
              >
                CAMPUS ORBIT
              </button>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Role Switcher inside Sidebar for instant multi-role inspection */}
          {!sidebarCollapsed && (
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <label htmlFor="sidebar-role-switcher" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Active Role Perspective
              </label>
              <select
                id="sidebar-role-switcher"
                value={currentUser.role}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  switchRoleSession(nextRole);
                  setActiveModule(nextRole === 'parent' ? 'parent_portal' : nextRole === 'super_admin' ? 'settings' : 'overview');
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="college_admin">College Administrator</option>
                <option value="faculty">Faculty / Professor</option>
                <option value="student">Student</option>
                <option value="parent">Parent / Guardian</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
          )}

          <nav aria-label="Dashboard Sidebar Navigation" className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  data-nav-key={item.key}
                  onClick={() => setActiveModule(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white dark:bg-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-3 space-y-1 dark:border-slate-800">
          <button
            type="button"
            onClick={onReturnLanding}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Home className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Public Landing Page</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              void logoutSession();
              onReturnLanding();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
          {/* Left: Mobile Menu Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open mobile navigation"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentUser.role.replace('_', ' ').toUpperCase()}
              </span>
              <span className="mx-2">/</span>
              <span className="font-medium text-blue-700 dark:text-cyan-400">
                {navItems.find((n) => n.key === activeModule)?.label || 'Overview'}
              </span>
              <span className="hidden md:inline ml-3 font-mono text-[11px] text-slate-400">
                · {syncMode === 'cloud_firestore' ? 'Cloud Firestore Live Sync' : 'Sandbox Role Preview (IndexedDB Sync)'}
              </span>
            </div>
          </div>

          {/* Right: Global Search (Ctrl+K), Notifications, Theme Switcher, Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="Open global command palette"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search Campus...</span>
              <kbd className="hidden sm:inline font-mono text-[10px] text-slate-400">Ctrl+K</kbd>
            </button>

            <PWAInstallButton />

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <Bell className="h-4 w-4 shrink-0" />
                {unreadNotifCount > 0 && (
                  <span className="font-mono text-xs font-bold text-blue-700 dark:text-cyan-400 tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Notifications ({unreadNotifCount} unread)
                    </span>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-blue-700 hover:underline dark:text-cyan-400"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">{n.title}</div>
                        <p className="mt-0.5 text-slate-600 dark:text-slate-400">{n.message}</p>
                        <div className="mt-1 font-mono text-[10px] text-slate-400">{n.createdAt}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Switch color theme"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User Profile Button */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-700 text-[11px] font-bold text-white">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                  {currentUser.displayName.split(' ')[0]} {currentUser.displayName.split(' ')[1] || ''}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-xs">
            <div className="w-72 bg-white p-4 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                  <span className="font-display font-bold text-slate-900 dark:text-white">CAMPUS ORBIT</span>
                  <button type="button" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="my-3">
                  <select
                    aria-label="Mobile Role Switcher"
                    value={currentUser.role}
                    onChange={(e) => {
                      switchRoleSession(e.target.value as UserRole);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="college_admin">College Administrator</option>
                    <option value="faculty">Faculty / Professor</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent / Guardian</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActiveModule(item.key);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                        activeModule === item.key
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onReturnLanding}
                className="w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300"
              >
                ← Public Landing Page
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {renderMainContent()}
        </main>
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigateModule={(modKey) => setActiveModule(modKey)}
      />
    </div>
  );
};
