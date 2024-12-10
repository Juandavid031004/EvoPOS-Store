import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { SupabaseProvider } from './context/SupabaseContext';
import { initializeApp } from './services/initializeApp';
import { Loading } from './components/Loading';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

const rootInstance = createRoot(root);

// Render loading state
rootInstance.render(
  <React.StrictMode>
    <Loading />
  </React.StrictMode>
);

// Initialize app and render when ready
initializeApp()
  .then(() => {
    rootInstance.render(
      <React.StrictMode>
        <BrowserRouter>
          <SupabaseProvider>
            <AuthProvider>
              <DataProvider>
                <App />
              </DataProvider>
            </AuthProvider>
          </SupabaseProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
  })
  .catch(error => {
    console.error('Failed to initialize app:', error);
    rootInstance.render(
      <React.StrictMode>
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h1 className="text-xl font-bold text-red-600 mb-2">Initialization Error</h1>
            <p className="text-gray-600">
              There was an error initializing the application. Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
        </div>
      </React.StrictMode>
    );
  });