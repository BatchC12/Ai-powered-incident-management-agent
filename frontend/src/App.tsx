import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { IncidentList } from './pages/IncidentList';
import { IncidentDetail } from './pages/IncidentDetail';
import { SupervisorMonitor } from './pages/SupervisorMonitor';
import { AdminPanel } from './pages/AdminPanel';
import { OntologyViewer } from './pages/OntologyViewer';
import { SLADashboard } from './pages/SLADashboard';
import { CreateIncidentModal } from './components/CreateIncidentModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
  };

  const handleBackToQueue = () => {
    setSelectedIncidentId(null);
  };

  const handleIncidentCreated = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedIncidentId(null);
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto flex items-start">
        {/* Left ITIL Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedIncidentId(null);
          }}
        />

        {/* Center Content Workspace */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {selectedIncidentId ? (
            <IncidentDetail incidentId={selectedIncidentId} onBack={handleBackToQueue} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  onSelectIncident={handleSelectIncident}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedIncidentId(null);
                  }}
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
            </>
          )}
        </main>
      </div>

      {/* User Agent Reporting Modal (FR-3) */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onIncidentCreated={handleIncidentCreated}
      />
    </div>
  );
}
