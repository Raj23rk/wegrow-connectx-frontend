import React from 'react';
import { useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Gate } from './components/gate/Gate';
import { Shell } from './components/layout/Shell';

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#F4F6FB] dark:bg-[#151515] text-gray-800 dark:text-gray-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0A2A8C] to-[#FF6A13] flex items-center justify-center text-white font-extrabold text-base shadow-lg animate-pulse mb-4">
          WX
        </div>
        <div className="text-sm font-bold tracking-tight text-gray-700 dark:text-gray-300">
          Loading WeGrow ConnectX...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Gate />;
  }

  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default App;
