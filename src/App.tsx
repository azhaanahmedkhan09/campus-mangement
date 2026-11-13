import React, { useState } from 'react';
import { CampusProvider, useCampus } from './contexts/CampusContext';
import { LandingPage } from './pages/public/LandingPage';
import { AuthPortalModal } from './pages/public/AuthPortalModal';
import { DashboardShell } from './layouts/DashboardShell';
import { OfflineIndicator } from './components/PWAInstallButton';
import { UserRole } from './types/campus';

const CampusOrbitRoot: React.FC = () => {
  const { switchRoleSession } = useCampus();
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('view') === 'dashboard') {
        return 'dashboard';
      }
    }
    return 'landing';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('college_admin');

  const handleOpenAuth = (role: UserRole = 'college_admin') => {
    setAuthInitialRole(role);
    setAuthModalOpen(true);
  };

  const handleEnterDashboard = (role: UserRole) => {
    switchRoleSession(role);
    setAuthModalOpen(false);
    setViewMode('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {viewMode === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterDashboard={handleEnterDashboard}
        />
      ) : (
        <DashboardShell
          onReturnLanding={() => setViewMode('landing')}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
      )}

      <AuthPortalModal
        isOpen={authModalOpen}
        initialRole={authInitialRole}
        onClose={() => setAuthModalOpen(false)}
        onSuccessEnter={handleEnterDashboard}
      />

      <OfflineIndicator />
    </>
  );
};

export default function App() {
  return (
    <CampusProvider>
      <CampusOrbitRoot />
    </CampusProvider>
  );
}
