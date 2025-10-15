import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Automations } from './pages/Automations';
import { FlowEditor } from './pages/FlowEditor';
import { Chat } from './pages/Chat';
import { Broadcasts } from './pages/Broadcasts';
import { Connections } from './pages/Connections';
import { Settings } from './pages/Settings';
import { NewAutomationModal } from './components/automations/NewAutomationModal';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const [showNewAutomationModal, setShowNewAutomationModal] = useState(false);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Layout onNewAutomation={() => setShowNewAutomationModal(true)}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automations"
            element={
              <ProtectedRoute>
                <Automations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automations/basic"
            element={
              <ProtectedRoute>
                <Automations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automations/keywords"
            element={
              <ProtectedRoute>
                <Automations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automations/sequences"
            element={
              <ProtectedRoute>
                <Automations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automations/rules"
            element={
              <ProtectedRoute>
                <Automations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/broadcasts"
            element={
              <ProtectedRoute>
                <Broadcasts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <Connections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>

      <Routes>
        <Route
          path="/automations/editor/:id"
          element={
            <ProtectedRoute>
              <FlowEditor />
            </ProtectedRoute>
          }
        />
      </Routes>

      <NewAutomationModal
        isOpen={showNewAutomationModal}
        onClose={() => setShowNewAutomationModal(false)}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
