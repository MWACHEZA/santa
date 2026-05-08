import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthenticatedApp from './components/AuthenticatedApp';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';
import './styles/global-scrollable.css';

// Main App Wrapper Component
const AppContent: React.FC = () => {
  console.log('🚀 App starting...');
  
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AdminProvider>
              <Router 
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <div className="App">
                  <AuthenticatedApp />
                </div>
              </Router>
            </AdminProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

function App() {
  return <AppContent />;
}

export default App;
