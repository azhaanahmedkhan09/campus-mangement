import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Building2, Calendar, FolderGit2, GraduationCap, Search, Users, X } from 'lucide-react';
import { useCampus } from '../contexts/CampusContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule: (moduleKey: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateModule,
}) => {
  const {
    currentUser,
    students,
    faculty,
    departments,
    courses,
    notices,
    facilities,
    events,
    collabProjects,
  } = useCampus();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const role = currentUser.role;
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: string;
      targetModule: string;
    }> = [];

    // Role-based access filtering
    if (role === 'college_admin' || role === 'super_admin' || role === 'faculty') {
      students.forEach((s) => {
        if (!q || s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)) {
          items.push({
            id: `stu_${s.id}`,
            title: s.fullName,
            subtitle: `${s.studentId} · ${s.department} · Sem ${s.semester}`,
            category: 'Students',
            targetModule: 'students',
          });
        }
      });
    }

    if (role !== 'parent') {
      faculty.forEach((f) => {
        if (!q || f.fullName.toLowerCase().includes(q) || f.department.toLowerCase().includes(q)) {
          items.push({
            id: `fac_${f.id}`,
            title: f.fullName,
            subtitle: `${f.designation} · ${f.department}`,
            category: 'Faculty',
            targetModule: role === 'college_admin' ? 'faculty' : 'overview',
          });
        }
      });

      departments.forEach((d) => {
        if (!q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)) {
          items.push({
            id: `dept_${d.id}`,
            title: `${d.name} (${d.code})`,
            subtitle: `HOD: ${d.hodName} · ${d.totalStudents} Students`,
            category: 'Departments',
            targetModule: role === 'college_admin' ? 'departments' : 'overview',
          });
        }
      });

      courses.forEach((c) => {
        if (!q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) {
          items.push({
            id: `crs_${c.id}`,
            title: `${c.code}: ${c.title}`,
            subtitle: `${c.department} · Sem ${c.semester} · ${c.credits} Credits`,
            category: 'Courses & Subjects',
            targetModule: role === 'college_admin' ? 'courses' : role === 'student' ? 'academics' : 'classes',
          });
        }
      });

      collabProjects.forEach((p) => {
        if (!q || p.title.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q)) {
          items.push({
            id: `proj_${p.id}`,
            title: p.title,
            subtitle: `${p.domain} · Team: ${p.teamName} · ${p.status}`,
            category: 'Collaboration Projects',
            targetModule: 'collaboration',
          });
        }
      });
    }

    notices.forEach((n) => {
      if (!q || n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)) {
        items.push({
          id: `not_${n.id}`,
          title: n.title,
          subtitle: `${n.category} · Published ${n.publishedAt}`,
          category: 'Notices',
          targetModule: role === 'parent' ? 'notices' : 'overview',
        });
      }
    });

    facilities.forEach((f) => {
      if (!q || f.name.toLowerCase().includes(q) || f.building.toLowerCase().includes(q)) {
        items.push({
          id: `facil_${f.id}`,
          title: f.name,
          subtitle: `${f.type} · ${f.building} · Capacity ${f.capacity}`,
          category: 'Facilities',
          targetModule: role === 'college_admin' ? 'facilities' : 'overview',
        });
      }
    });

    events.forEach((e) => {
      if (!q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        items.push({
          id: `evt_${e.id}`,
          title: e.title,
          subtitle: `${e.category} · ${e.date} · ${e.venue}`,
          category: 'Events',
          targetModule: 'events',
        });
      }
    });

    return items.slice(0, 14);
  }, [query, currentUser.role, students, faculty, departments, courses, notices, facilities, events, collabProjects]);

  if (!isOpen) return null;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Students':
        return <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'Faculty':
        return <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Departments':
        return <Building2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
      case 'Courses & Subjects':
        return <BookOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
      case 'Collaboration Projects':
        return <FolderGit2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 pt-20 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, courses, projects, faculty, notices, facilities... (Role-filtered)"
            aria-label="Global search input"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Command Palette"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching records found for &ldquo;{query}&rdquo; within your {currentUser.role.replace('_', ' ')} permissions.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigateModule(item.targetModule);
                  onClose();
                }}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.title}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.category} · {item.subtitle}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <span>Role Context: {currentUser.displayName}</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
