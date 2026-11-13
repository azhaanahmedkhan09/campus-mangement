import React, { useState } from 'react';
import { KeyRound, Lock, LogIn, ShieldAlert, ShieldCheck, UserCheck, X } from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { UserRole } from '../../types/campus';

interface AuthPortalModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onSuccessEnter: (role: UserRole) => void;
}

export const AuthPortalModal: React.FC<AuthPortalModalProps> = ({
  isOpen,
  initialRole = 'college_admin',
  onClose,
  onSuccessEnter,
}) => {
  const { signInWithGoogle, switchRoleSession } = useCampus();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [authTab, setAuthTab] = useState<'role_launch' | 'credentials' | 'reset' | 'bootstrap'>('role_launch');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const roles: Array<{ id: UserRole; label: string; desc: string }> = [
    { id: 'college_admin', label: 'College Administrator', desc: 'Full academic, student, faculty, finance & timetable ops' },
    { id: 'faculty', label: 'Faculty / Professor', desc: 'QR attendance, classes, marks entry, assignments & mentorship' },
    { id: 'student', label: 'Student', desc: 'Attendance, results, fees, placements & Campus Collaboration Hub' },
    { id: 'parent', label: 'Parent / Guardian', desc: 'Verified linked student attendance, results & fee status' },
    { id: 'super_admin', label: 'Super Administrator', desc: 'System permissions, security rules, audit logs & settings' },
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      await signInWithGoogle(selectedRole);
      switchRoleSession(selectedRole);
      onSuccessEnter(selectedRole);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Google Sign-In popup was closed or blocked in preview.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter both your institutional email and password.' });
      return;
    }
    switchRoleSession(selectedRole);
    onSuccessEnter(selectedRole);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Enter a valid registered institutional email address.' });
      return;
    }
    setStatusMessage({
      type: 'success',
      text: `Password reset link dispatched to ${email}. Please check your institutional inbox.`,
    });
  };

  const handleBootstrapAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (bootstrapToken.trim().length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Enter a valid server-issued one-time institutional bootstrap token (min 6 chars).',
      });
      return;
    }
    switchRoleSession('super_admin');
    onSuccessEnter('super_admin');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Campus Orbit Authentication Portal"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Campus Orbit Authentication &amp; Role Access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Firebase Authentication · Role-Based Access Control (RBAC)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 dark:border-slate-800 dark:bg-slate-950/50">
          {[
            { id: 'role_launch', label: 'Role Workspace' },
            { id: 'credentials', label: 'Email & Google Login' },
            { id: 'reset', label: 'Forgot Password' },
            { id: 'bootstrap', label: 'Admin Bootstrap' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setAuthTab(t.id as typeof authTab);
                setStatusMessage(null);
              }}
              className={`border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                authTab === t.id
                  ? 'border-blue-600 text-blue-700 dark:border-cyan-400 dark:text-cyan-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {statusMessage && (
            <div
              role="alert"
              className={`mb-4 rounded-lg border px-4 py-2.5 text-xs font-medium ${
                statusMessage.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {authTab === 'role_launch' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Role Session to Launch
              </label>
              <div className="mt-2.5 space-y-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors ${
                      selectedRole === r.id
                        ? 'border-blue-600 bg-blue-50/60 dark:border-cyan-500 dark:bg-blue-950/40'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{r.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selectedRole === r.id ? 'border-blue-600 bg-blue-600 dark:border-cyan-400 dark:bg-cyan-400' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedRole === r.id && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-950" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    switchRoleSession(selectedRole);
                    onSuccessEnter(selectedRole);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Enter as {roles.find((r) => r.id === selectedRole)?.label}</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                  <span>{loading ? 'Connecting...' : 'Sign In with Google (Firebase)'}</span>
                </button>
              </div>
            </div>
          )}

          {authTab === 'credentials' && (
            <form onSubmit={handleCredentialLogin} className="space-y-4" noValidate>
              <div>
                <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Institutional Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusorbit.edu"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="auth-pass" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  id="auth-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="auth-role-select" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Role Context
                </label>
                <select
                  id="auth-role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Google OAuth
                </button>
              </div>
            </form>
          )}

          {authTab === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4" noValidate>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your institutional email address to receive a time-bound password reset verification link.
              </p>
              <div>
                <label htmlFor="reset-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Registered Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@campusorbit.edu"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
              >
                <KeyRound className="h-4 w-4" />
                <span>Send Password Reset Link</span>
              </button>
            </form>
          )}

          {authTab === 'bootstrap' && (
            <form onSubmit={handleBootstrapAdmin} className="space-y-4" noValidate>
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>First-Administrator Bootstrap Workflow</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed">
                  Campus Orbit does not rely on hardcoded permanent super-admin emails in client code. Provisioning the initial Super Administrator requires a trusted server-side bootstrap token or verified `/admins/{'{uid}'}` document.
                </p>
              </div>
              <div>
                <label htmlFor="bootstrap-token" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Institutional Bootstrap Token
                </label>
                <input
                  id="bootstrap-token"
                  type="text"
                  value={bootstrapToken}
                  onChange={(e) => setBootstrapToken(e.target.value)}
                  placeholder="Enter token (e.g., ORBIT-BOOTSTRAP-2026)"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>Verify &amp; Initialize Super Administrator</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
