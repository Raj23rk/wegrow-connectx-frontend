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
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';

export const TasksView = () => {
  const { user } = useAuth();
  const { currentBrand } = useApp();
  const iframeRef = useRef(null);

  // Available sources: Production Vercel or Localhost Vite
  const defaultUrl = import.meta.env.VITE_TASKTOGGLE_URL || 'https://tasktoggle.vercel.app';
  const localUrl = 'http://localhost:5174';

  const [activeUrl, setActiveUrl] = useState(defaultUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef(null);

  // Send user context to TaskToggle once iframe loads
  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      if (iframeRef.current && iframeRef.current.contentWindow && user) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'CONNECTX_USER_SESSION',
            payload: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              branch: user.branch || 'sivakasi 1.0',
              brand: currentBrand
            }
          },
          '*'
        );
      }
    } catch (e) {
      console.warn('[TasksView] PostMessage error:', e);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(activeUrl, '_blank', 'noopener,noreferrer');
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
      {/* Top Utility Header */}
      <header className="h-12 border-b border-gray-200 dark:border-[#2C2C2C] bg-[#F7F7F8] dark:bg-[#181818] flex items-center justify-between px-3 sm:px-4 flex-none gap-2">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs flex-none">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <h1 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white truncate">
              TaskToggle
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operations
            </span>
          </div>
        </div>

        {/* Center: Environment Switcher (Cloud vs Local) */}
        <div className="hidden sm:flex items-center bg-gray-200/70 dark:bg-[#252525] p-0.5 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-300">
          <button
            type="button"
            onClick={() => {
              if (activeUrl !== defaultUrl) {
                setIsLoading(true);
                setActiveUrl(defaultUrl);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeUrl === defaultUrl
                ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white font-bold shadow-xs'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Production Cloud App"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Cloud</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeUrl !== localUrl) {
                setIsLoading(true);
                setActiveUrl(localUrl);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeUrl === localUrl
                ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white font-bold shadow-xs'
                : 'hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Local Development Port (5174)"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-500" />
            <span>Local Dev</span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Refresh Frame */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload TaskToggle"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Open in Separate Tab */}
          <button
            type="button"
            onClick={handleOpenExternal}
            title="Open TaskToggle in New Tab"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in Tab</span>
          </button>
        </div>
      </header>

      {/* Main Iframe Canvas */}
      <div className="flex-1 relative w-full h-full bg-gray-50 dark:bg-[#141414] overflow-hidden">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-[#1C1C1C]/80 backdrop-blur-xs z-10 transition-opacity">
            <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Loading TaskToggle Workspace...
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Connecting to {activeUrl}</div>
          </div>
        )}

        {/* Embedded Application Frame */}
        <iframe
          key={`${activeUrl}-${refreshKey}`}
          ref={iframeRef}
          src={activeUrl}
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

