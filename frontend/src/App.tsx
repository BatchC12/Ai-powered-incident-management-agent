import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Dashboard } from './pages/Dashboard';
import { IncidentList } from './pages/IncidentList';
import { IncidentDetail } from './pages/IncidentDetail';
import { SupervisorMonitor } from './pages/SupervisorMonitor';
import { AdminPanel } from './pages/AdminPanel';
import { OntologyViewer } from './pages/OntologyViewer';
import { SLADashboard } from './pages/SLADashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { NotFound } from './pages/NotFound';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { useAuth } from './context/AuthContext';
import { analytics } from './services/analytics';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Command Center | MA-IMS ITIL Multi-Agent',
  incidents: 'Incident Queue (IMDB) | MA-IMS',
  supervisor: 'Supervisor Real-Time Monitor | MA-IMS',
  admin: 'Agent Administration & Weights | MA-IMS',
  ontology: 'OWL Incident Ontology Browser | MA-IMS',
  sla: 'SLA Performance & Governance | MA-IMS',
  privacy: 'Privacy Policy & Compliance | MA-IMS',
  terms: 'Terms and Conditions | MA-IMS',
  '404': 'Page Not Found (404) | MA-IMS',
};

export default function App() {
  useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Update dynamic document title & track page view
  useEffect(() => {
    const title = selectedIncidentId
      ? `Incident ${selectedIncidentId} | MA-IMS`
      : TAB_TITLES[activeTab] || 'MA-IMS | ITIL Multi-Agent Incident Management';
    document.title = title;

    analytics.trackPageView(selectedIncidentId ? `incident_${selectedIncidentId}` : activeTab);
  }, [activeTab, selectedIncidentId]);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
  };

  const handleBackToQueue = () => {
    setSelectedIncidentId(null);
  };

  const handleIncidentCreated = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedIncidentId(null);
  };

  const isValidTab = [
    'dashboard',
    'incidents',
    'supervisor',
    'admin',
    'ontology',
    'sla',
    'privacy',
    'terms',
  ].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto flex items-start">
        {/* Left ITIL Sidebar (desktop) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
        />

        {/* Center Content Workspace */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto min-h-[calc(100vh-140px)]">
          {selectedIncidentId ? (
            <IncidentDetail incidentId={selectedIncidentId} onBack={handleBackToQueue} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  onSelectIncident={handleSelectIncident}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {activeTab === 'incidents' && (
                <IncidentList
                  onSelectIncident={handleSelectIncident}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />
              )}

              {activeTab === 'supervisor' && <SupervisorMonitor />}

              {activeTab === 'admin' && <AdminPanel />}

              {activeTab === 'ontology' && <OntologyViewer />}

              {activeTab === 'sla' && <SLADashboard />}

              {activeTab === 'privacy' && (
                <PrivacyPolicy onBack={() => handleNavigateTab('dashboard')} />
              )}

              {activeTab === 'terms' && (
                <TermsAndConditions onBack={() => handleNavigateTab('dashboard')} />
              )}

              {!isValidTab && (
                <NotFound
                  onNavigateTab={handleNavigateTab}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Site-Wide Accessible Footer */}
      <Footer onNavigateTab={handleNavigateTab} />

      {/* User Agent Reporting Modal (FR-3) */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onIncidentCreated={handleIncidentCreated}
      />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner onOpenPrivacyPolicy={() => handleNavigateTab('privacy')} />
    </div>
  );
}
