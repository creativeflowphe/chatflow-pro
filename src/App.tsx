import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Automations } from './pages/Automations';
import { Keywords } from './pages/Keywords';
import { FlowEditor } from './pages/FlowEditor';
import { Chat } from './pages/Chat';
import { Broadcasts } from './pages/Broadcasts';
import { Connections } from './pages/Connections';
import { Settings } from './pages/Settings';
import { InstagramCallback } from './pages/InstagramCallback';

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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/auth/instagram/callback"
        element={
          <ProtectedRoute>
            <InstagramCallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automations/editor/:id"
        element={
          <ProtectedRoute>
            <FlowEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/automations/basic" element={<Automations />} />
                <Route path="/automations/keywords" element={<Keywords />} />
                <Route path="/automations/sequences" element={<Automations />} />
                <Route path="/automations/rules" element={<Automations />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/broadcasts" element={<Broadcasts />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
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
