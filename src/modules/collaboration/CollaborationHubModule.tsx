import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  GitBranch,
  MessageSquare,
  Plus,
  Search,
  Send,
  UserPlus,
  Users,
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { ProjectDomain } from '../../types/campus';

const PROJECT_DOMAINS: ProjectDomain[] = [
  'AI and Machine Learning',
  'Internet of Things',
  'Web Development',
  'Mobile Applications',
  'Robotics',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
  'Electronics',
  'Social Innovation',
];

type HubTab =
  | 'overview'
  | 'discover'
  | 'my_collaborations'
  | 'find_collaborators'
  | 'workspace'
  | 'tasks'
  | 'discussions'
  | 'showcase'
  | 'mentorship';

export const CollaborationHubModule: React.FC = () => {
  const {
    currentUser,
    collabProfiles,
    collabProjects,
    collabTasks,
    collabDiscussions,
    collabRequests,
    faculty,
    createCollaborationProject,
    sendCollaborationRequest,
    handleCollaborationRequest,
    addCollaborationTask,
    cycleTaskStatus,
    postCollaborationDiscussion,
    requestFacultyMentor,
    respondMentorshipRequest,
    toggleProjectShowcase,
  } = useCampus();

  const [activeTab, setActiveTab] = useState<HubTab>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    collabProjects[0]?.id || 'cproj_1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [collabFeedback, setCollabFeedback] = useState<string>('');

  // New project form
  const [showNewProjForm, setShowNewProjForm] = useState(false);
  const [projForm, setProjForm] = useState({
    title: '',
    domain: 'AI and Machine Learning' as ProjectDomain,
    department: currentUser.department || 'Computer Science',
    description: '',
    problemStatement: '',
    proposedSolution: '',
    technologies: 'PyTorch, TypeScript, FastAPI',
    teamName: '',
    requiredTeamSize: 4,
  });

  // New task form
  const [taskForm, setTaskForm] = useState({
    title: '',
    assigneeName: 'Aarav Mehta',
    dueDate: '2026-11-26',
    priority: 'High' as 'Low' | 'Medium' | 'High',
    milestoneTitle: 'Milestone 2: Prototype Validation',
  });

  // Discussion input
  const [discussionInput, setDiscussionInput] = useState('');
  const [isAnnouncementPost, setIsAnnouncementPost] = useState(false);

  // Mentor feedback input
  const [mentorNoteInput, setMentorNoteInput] = useState('');

  const selectedProject = useMemo(
    () => collabProjects.find((p) => p.id === selectedProjectId) || collabProjects[0],
    [collabProjects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    return collabProjects.filter((p) => {
      const matchesDomain = domainFilter === 'All' || p.domain === domainFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q)) ||
        p.department.toLowerCase().includes(q);
      return matchesDomain && matchesQuery;
    });
  }, [collabProjects, domainFilter, searchQuery]);

  const projectTasks = useMemo(
    () => collabTasks.filter((t) => t.projectId === selectedProject?.id),
    [collabTasks, selectedProject]
  );

  const projectDiscussions = useMemo(
    () => collabDiscussions.filter((d) => d.projectId === selectedProject?.id),
    [collabDiscussions, selectedProject]
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projForm.title.trim() || !projForm.teamName.trim() || projForm.description.trim().length < 10) {
      setCollabFeedback('Please provide a project title, team name, and description (at least 10 characters).');
      return;
    }
    await createCollaborationProject({
      title: projForm.title,
      domain: projForm.domain,
      department: projForm.department,
      description: projForm.description,
      problemStatement: projForm.problemStatement || 'Solving campus-scale operational bottlenecks.',
      proposedSolution: projForm.proposedSolution || 'Modular cloud-edge architecture.',
      technologies: projForm.technologies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      teamName: projForm.teamName,
      requiredTeamSize: Number(projForm.requiredTeamSize) || 4,
    });
    setProjForm({
      title: '',
      domain: 'AI and Machine Learning',
      department: currentUser.department || 'Computer Science',
      description: '',
      problemStatement: '',
      proposedSolution: '',
      technologies: 'PyTorch, TypeScript',
      teamName: '',
      requiredTeamSize: 4,
    });
    setShowNewProjForm(false);
    setCollabFeedback('New interdisciplinary project published to Campus Collaboration Hub.');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !selectedProject) return;
    addCollaborationTask({
      projectId: selectedProject.id,
      title: taskForm.title,
      assigneeName: taskForm.assigneeName,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: 'Todo',
      milestoneTitle: taskForm.milestoneTitle,
    });
    setTaskForm({ ...taskForm, title: '' });
  };

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionInput.trim() || !selectedProject) return;
    postCollaborationDiscussion(selectedProject.id, discussionInput.trim(), isAnnouncementPost);
    setDiscussionInput('');
    setIsAnnouncementPost(false);
  };

  const navItems: Array<{ id: HubTab; label: string }> = [
    { id: 'overview', label: '1. Overview' },
    { id: 'discover', label: '2. Discover Projects' },
    { id: 'my_collaborations', label: '3. My Collaborations' },
    { id: 'find_collaborators', label: '4. Find Collaborators' },
    { id: 'workspace', label: '5. Team Workspace' },
    { id: 'tasks', label: '6. Tasks & Milestones' },
    { id: 'discussions', label: '7. Discussions' },
    { id: 'showcase', label: '8. Project Showcase' },
    { id: 'mentorship', label: '9. Faculty Mentorship' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Project Context Selector */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
            SIGNATURE MODULE · INTERDISCIPLINARY RESEARCH &amp; PROJECT NETWORK
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
            Campus Collaboration Hub
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Connect across departments, form interdisciplinary teams, manage milestones, and showcase outcomes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="active-proj-select" className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Active Workspace:
            </label>
            <select
              id="active-proj-select"
              value={selectedProject?.id || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {collabProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.teamName}: {p.title.slice(0, 38)}...
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('discover');
              setShowNewProjForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Publish Project Idea</span>
          </button>
        </div>
      </div>

      {/* 9-Tab Sub-Navigation Bar */}
      <div className="flex overflow-x-auto rounded-lg border border-slate-200 bg-slate-100/80 p-1 gap-1 dark:border-slate-800 dark:bg-slate-900">
        {navItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-800 dark:text-cyan-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {collabFeedback && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
        >
          <span>{collabFeedback}</span>
          <button type="button" onClick={() => setCollabFeedback('')} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & COLLABORATION ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Projects</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {collabProjects.filter((p) => p.status !== 'Completed').length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Across {PROJECT_DOMAINS.length} domains</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Teams</div>
              <div className="mt-1 font-mono text-2xl font-bold text-blue-700 dark:text-cyan-400 tabular-nums">
                {collabProjects.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Interdisciplinary squads</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Collaborators</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {collabProjects.reduce((acc, p) => acc + p.teamMembers.length, 0)}
              </div>
              <div className="mt-1 text-xs text-slate-500">Students &amp; Faculty Mentors</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">Completed Projects</div>
              <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {collabProjects.filter((p) => p.status === 'Completed').length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Published in Showcase</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400">Pending Join Requests</div>
              <div className="mt-1 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {collabRequests.filter((r) => r.status === 'Pending').length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Awaiting team lead review</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Project Progress &amp; Interdisciplinary Team Health
              </h3>
              <div className="mt-4 space-y-4">
                {collabProjects.map((proj) => (
                  <div key={proj.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{proj.title}</div>
                      <span className="font-mono text-xs font-semibold text-blue-700 dark:text-cyan-400 tabular-nums">
                        {proj.progressPct}%
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {proj.domain} · Team: {proj.teamName} · Status: {proj.status} · Members: {proj.teamMembers.length}/{proj.requiredTeamSize}
                    </div>
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full bg-blue-600 dark:bg-cyan-500 transition-all"
                        style={{ width: `${proj.progressPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department-Wise Collaboration Participation
              </h3>
              <div className="mt-4 space-y-3">
                {[
                  { dept: 'Computer Science', count: 18, pct: 82 },
                  { dept: 'Electronics & Communication', count: 14, pct: 68 },
                  { dept: 'Mechanical & Robotics', count: 12, pct: 60 },
                  { dept: 'Data Science & AI', count: 15, pct: 74 },
                  { dept: 'Civil & Sustainable Infra', count: 8, pct: 45 },
                ].map((d) => (
                  <div key={d.dept}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{d.dept}</span>
                      <span className="font-mono text-slate-500 tabular-nums">{d.count} collaborators ({d.pct}%)</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-slate-800 dark:bg-blue-500" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVER PROJECTS */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {showNewProjForm && (
            <form
              onSubmit={handleCreateProject}
              className="rounded-xl border border-blue-200 bg-white p-6 shadow-xs dark:border-blue-900 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Publish New Interdisciplinary Project Idea
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewProjForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="np-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Project Title
                  </label>
                  <input
                    id="np-title"
                    type="text"
                    required
                    value={projForm.title}
                    onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                    placeholder="e.g., Autonomous Solar Micro-Grid Controller"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="np-team" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Team Name
                  </label>
                  <input
                    id="np-team"
                    type="text"
                    required
                    value={projForm.teamName}
                    onChange={(e) => setProjForm({ ...projForm, teamName: e.target.value })}
                    placeholder="e.g., Quantum Grid Collective"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="np-domain" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Project Domain
                  </label>
                  <select
                    id="np-domain"
                    value={projForm.domain}
                    onChange={(e) => setProjForm({ ...projForm, domain: e.target.value as ProjectDomain })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {PROJECT_DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="np-tech" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Technologies (comma-separated)
                  </label>
                  <input
                    id="np-tech"
                    type="text"
                    value={projForm.technologies}
                    onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="np-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Project Description &amp; Objectives
                </label>
                <textarea
                  id="np-desc"
                  rows={2}
                  required
                  value={projForm.description}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  placeholder="Describe the core engineering problem, interdisciplinary roles needed, and target outcomes..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  Create Project &amp; Initialize Workspace
                </button>
              </div>
            </form>
          )}

          {/* Search & Domain Filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, technology (Rust, ROS2, PyTorch), or department..."
                aria-label="Search collaboration projects"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <select
              aria-label="Filter by project domain"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="All">All 10 Project Domains</option>
              {PROJECT_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {proj.domain} · {proj.department} · Status: {proj.status}
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {proj.description}
                  </p>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Tech Stack:</span>{' '}
                    {proj.technologies.join(' · ')}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Team:</span> {proj.teamName} ({proj.teamMembers.length}/{proj.requiredTeamSize} members) · Lead: {proj.leadStudentName}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setActiveTab('workspace');
                    }}
                    className="text-xs font-semibold text-blue-700 hover:underline dark:text-cyan-400"
                  >
                    Open Team Workspace →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = sendCollaborationRequest(
                        proj.id,
                        `Interested in contributing to ${proj.title} with my ${currentUser.department || 'engineering'} background.`
                      );
                      setCollabFeedback(res.message);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Request to Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY COLLABORATIONS & REQUESTS */}
      {activeTab === 'my_collaborations' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Collaboration Requests &amp; Team Invitations
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Approve, reject, or withdraw interdisciplinary team join requests. Duplicate requests are automatically blocked.
            </p>

            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {collabRequests.map((req) => (
                <div key={req.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {req.studentName} ({req.studentId}) → {req.projectTitle}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {req.department} · Semester {req.semester} · {req.type} · Status: <strong>{req.status}</strong>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">&ldquo;{req.message}&rdquo;</p>
                  </div>
                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCollaborationRequest(req.id, 'Accepted')}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Accept into Team
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCollaborationRequest(req.id, 'Rejected')}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCollaborationRequest(req.id, 'Withdrawn')}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:border-slate-800"
                      >
                        Withdraw
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FIND COLLABORATORS DIRECTORY */}
      {activeTab === 'find_collaborators' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collabProfiles.map((prof) => (
            <div
              key={prof.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{prof.name}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {prof.studentId} · {prof.department} · Semester {prof.semester}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-blue-700 dark:text-cyan-400">
                    {prof.availability}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{prof.bio}</p>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Technical Interests:</strong>{' '}
                  {prof.technicalInterests.join(' · ')}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Preferred Domains:</strong>{' '}
                  {prof.preferredDomains.join(' · ')}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {prof.previousProjectsCount} Completed Projects
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCollabFeedback(`Invitation sent to ${prof.name} (${prof.department}) to join ${selectedProject?.teamName}.`)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-slate-800"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Invite to {selectedProject?.teamName}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: TEAM WORKSPACE */}
      {activeTab === 'workspace' && selectedProject && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                TEAM WORKSPACE · {selectedProject.teamName.toUpperCase()}
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{selectedProject.title}</h3>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Domain: {selectedProject.domain} · Status: {selectedProject.status} · Progress: {selectedProject.progressPct}%
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedProject.description}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Problem Statement</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {selectedProject.problemStatement}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Proposed Architecture &amp; Solution</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {selectedProject.proposedSolution}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Interdisciplinary Team Roster ({selectedProject.teamMembers.length}/{selectedProject.requiredTeamSize})
              </h4>
              <div className="mt-3 space-y-2.5">
                {selectedProject.teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.department} · {m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedProject.mentorFacultyName && (
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <strong>Faculty Mentor:</strong> {selectedProject.mentorFacultyName} ({selectedProject.mentorStatus})
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TASKS AND MILESTONES */}
      {activeTab === 'tasks' && selectedProject && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddTask}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assign New Task or Milestone Deliverable — {selectedProject.teamName}
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <input
                type="text"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Task title (e.g., Implement WebRTC telemetry channel)"
                aria-label="New task title"
                className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                value={taskForm.assigneeName}
                onChange={(e) => setTaskForm({ ...taskForm, assigneeName: e.target.value })}
                placeholder="Assignee Name"
                aria-label="Task assignee"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
              >
                Add Task
              </button>
            </div>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <th className="py-3 px-4">Task Deliverable</th>
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Status (Click to Advance)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs dark:divide-slate-800">
                {projectTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{t.title}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{t.milestoneTitle}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{t.assigneeName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">{t.dueDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{t.priority}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => cycleTaskStatus(t.id)}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {t.status} ↻
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: TEAM DISCUSSIONS */}
      {activeTab === 'discussions' && selectedProject && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Private Team Discussion Board — {selectedProject.teamName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restricted to authorized project members and assigned faculty mentors.
            </p>
          </div>

          <div className="my-4 space-y-3 max-h-80 overflow-y-auto">
            {projectDiscussions.map((post) => (
              <div
                key={post.id}
                className={`rounded-lg border p-3.5 ${
                  post.isAnnouncement
                    ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong className="text-slate-900 dark:text-white">{post.authorName}</strong> · {post.authorRole}
                    {post.isAnnouncement ? ' · Team Announcement' : ''}
                  </span>
                  <span className="font-mono tabular-nums">{post.timestamp}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">{post.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handlePostDiscussion} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={discussionInput}
              onChange={(e) => setDiscussionInput(e.target.value)}
              placeholder={`Post an engineering update to ${selectedProject.teamName}...`}
              aria-label="Discussion message"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
              <input
                type="checkbox"
                checked={isAnnouncementPost}
                onChange={(e) => setIsAnnouncementPost(e.target.checked)}
              />
              <span>Pin as Announcement</span>
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post Message</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: PROJECT SHOWCASE GALLERY */}
      {activeTab === 'showcase' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {collabProjects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="text-xs font-mono text-blue-700 dark:text-cyan-400">
                  {proj.domain} · {proj.showcased ? 'Featured Showcase' : 'Working Prototype'}
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <strong>Problem:</strong> {proj.problemStatement}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <strong>Solution:</strong> {proj.proposedSolution}
                </p>
                {proj.outcomes && (
                  <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <strong>Verified Outcome:</strong> {proj.outcomes}
                  </p>
                )}
                <div className="mt-3 text-xs text-slate-500">
                  Technologies: {proj.technologies.join(' · ')}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-4 text-xs font-semibold text-blue-700 dark:text-cyan-400">
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      <GitBranch className="h-3.5 w-3.5" />
                      <span>GitHub Repo</span>
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleProjectShowcase(proj.id)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {proj.showcased ? 'Shown in Public Gallery' : 'Publish to Showcase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 9: FACULTY MENTORSHIP */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Faculty Research &amp; Project Mentorship Desk
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Project teams can request domain faculty advisors; faculty can approve requests and record milestone reviews.
            </p>

            <div className="mt-4 space-y-4">
              {collabProjects.map((proj) => (
                <div key={proj.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{proj.title}</div>
                      <div className="text-xs text-slate-500">
                        Team: {proj.teamName} · Mentor: {proj.mentorFacultyName || 'Unassigned'} · Status: <strong>{proj.mentorStatus}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {proj.mentorStatus === 'None' && (
                        <button
                          type="button"
                          onClick={() =>
                            requestFacultyMentor(proj.id, faculty[0].facultyId, faculty[0].fullName)
                          }
                          className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                        >
                          Request {faculty[0].fullName} as Mentor
                        </button>
                      )}
                      {proj.mentorStatus === 'Requested' && (
                        <button
                          type="button"
                          onClick={() =>
                            respondMentorshipRequest(
                              proj.id,
                              'Assigned',
                              mentorNoteInput || 'Approved mentorship. Weekly architecture sync on Thursdays.'
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Accept Mentorship &amp; Save Feedback
                        </button>
                      )}
                    </div>
                  </div>

                  {proj.mentorFeedback && (
                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      <strong>Mentor Review Note:</strong> {proj.mentorFeedback}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={mentorNoteInput}
                      onChange={(e) => setMentorNoteInput(e.target.value)}
                      placeholder="Add faculty milestone review or technical suggestion..."
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!mentorNoteInput.trim()) return;
                        respondMentorshipRequest(proj.id, 'Assigned', mentorNoteInput.trim());
                        setMentorNoteInput('');
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      Save Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
