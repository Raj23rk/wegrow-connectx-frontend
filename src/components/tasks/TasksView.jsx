import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  ExternalLink,
  RotateCw,
  Globe,
  Laptop,
  Maximize2,
  Minimize2,
  Crown,
  UserCheck,
  ArrowLeft
} from 'lucide-react';

export const TasksView = () => {
  const { user } = useAuth();
  const { currentBrand, setCurrentApp } = useApp();
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const localBase = 'http://localhost:5173';
  const cloudBase = import.meta.env.VITE_TASKTOGGLE_URL || 'https://tasktoggle.vercel.app';

  const [selectedBase, setSelectedBase] = useState(isLocal ? localBase : cloudBase);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Extract the exact logged-in person identity from ConnectX auth
  const empId = user?.employeeId || user?.empId || '';
  const email = user?.email || '';
  const name = user?.name || '';
  const role = user?.role || 'staff';

  // Build the personalized embedded URL passing exact person identity
  const iframeUrl = `${selectedBase.replace(/\/+$/, '')}/?embedded=true&empId=${encodeURIComponent(empId)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    const standaloneUrl = `${selectedBase.replace(/\/+$/, '')}/?empId=${encodeURIComponent(empId)}&email=${encodeURIComponent(email)}`;
    window.open(standaloneUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleMsg = (e) => {
      if (e.data?.type === 'RETURN_TO_CONNECTX' || e.data?.type === 'NAVIGATE_CONNECTX') {
        const target = e.data?.app || 'chat';
        if (setCurrentApp) setCurrentApp(target);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [setCurrentApp]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full w-full bg-white dark:bg-[#1C1C1C] overflow-hidden select-none"
    >
      {/* Top Embedded Status Bar */}
      <header className="h-11 border-b border-gray-200 dark:border-[#2C2C2C] bg-[#F7F7F8] dark:bg-[#181818] flex items-center justify-between px-3 sm:px-4 flex-none gap-2">
        {/* Left: Back to ConnectX Button & Identity Check Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setCurrentApp && setCurrentApp('chat')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5B5FC7] hover:bg-[#4A4EB8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex-none active:scale-95"
            title="Return to ConnectX Chat & Channels"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to ConnectX</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-none">
            <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5 truncate text-xs">
            <span className="font-extrabold text-gray-900 dark:text-white">TaskToggle</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-[10px] truncate">
              {role === 'admin' ? (
                <Crown className="w-3 h-3 text-amber-500" />
              ) : (
                <UserCheck className="w-3 h-3 text-indigo-500" />
              )}
              <span className="truncate">Active Personnel: {name} ({empId || 'WG-EMP'})</span>
            </span>
          </div>
        </div>

        {/* Center: Environment Selector (Localhost 5173 vs Cloud) */}
        <div className="hidden sm:flex items-center bg-gray-200/70 dark:bg-[#252525] p-0.5 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-300">
          <button
            type="button"
            onClick={() => {
              if (selectedBase !== localBase) {
                setIsLoading(true);
                setSelectedBase(localBase);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
              selectedBase === localBase
                ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white font-bold shadow-xs'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Local Vite Server (http://localhost:5173)"
          >
            <Laptop className="w-3 h-3 text-emerald-500" />
            <span>Local (5173)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedBase !== cloudBase) {
                setIsLoading(true);
                setSelectedBase(cloudBase);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
              selectedBase === cloudBase
                ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white font-bold shadow-xs'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Production Cloud App"
          >
            <Globe className="w-3 h-3 text-blue-500" />
            <span>Cloud</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Tasks"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            title="Open TaskToggle in New Window as Current User"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Open in Tab</span>
          </button>
        </div>
      </header>

      {/* Embedded Iframe Container */}
      <div className="flex-1 relative w-full h-full bg-gray-50 dark:bg-[#141414] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-[#1C1C1C]/80 backdrop-blur-xs z-10">
            <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-2.5"></div>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Loading {name ? `${name}'s Workspace` : 'TaskToggle'}...
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Authenticated via ConnectX ID: {empId || 'WG-EMP'}</div>
          </div>
        )}

        <iframe
          key={`${iframeUrl}-${refreshKey}`}
          ref={iframeRef}
          src={iframeUrl}
          title="TaskToggle Management System"
          onLoad={handleIframeLoad}
          className="w-full h-full border-none"
          allow="clipboard-read; clipboard-write; microphone; camera; display-capture; autoplay"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
        />
      </div>
    </div>
  );
};
