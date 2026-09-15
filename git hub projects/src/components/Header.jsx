import React from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Settings, 
  UploadCloud, 
  Activity,
  Radio,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';

export function Header({
  isLiveMode,
  datasetSource,
  isAudioEnabled,
  onToggleAudio,
  onOpenUpload,
  onOpenSettings,
  onResetToDemo,
  isLiveP5Connected,
  onToggleLiveP5,
  currentPhase,
  currentStep,
  totalSteps
}) {
  return (
    <header className="border-b border-slate-800 bg-[#0b1120]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand & Identification */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
                  AERO<span className="text-cyan-400">SHIELD</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  v1.0-DEMO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                Aircraft-Specific Microburst Early Warning System
              </p>
            </div>
          </div>

          {/* Mobile Phase Pill */}
          <div className="md:hidden text-xs font-mono px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            {currentStep}/{totalSteps}
          </div>
        </div>

        {/* Center: System Status & Data Mode Banner */}
        <div className="flex items-center flex-wrap gap-2 justify-center">
          {/* Online status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-bold tracking-wide">SYSTEM ONLINE</span>
          </div>

          {/* Data Source Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">SOURCE:</span>
            <span className={isLiveMode ? "text-amber-400 font-bold" : "text-cyan-300 font-bold"}>
              {datasetSource}
            </span>
          </div>

          {/* Flight Phase indicator */}
          {currentPhase && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{currentPhase}</span>
            </div>
          )}

          {/* Prototype / Non-certified Notice Tag */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="hidden xl:inline">SIMULATED / EXPERIMENTAL DATA</span>
            <span className="xl:hidden">EXPERIMENTAL</span>
          </div>
        </div>

        {/* Right: Controls & Action Triggers */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Live Person 5 FastAPI Connect Button */}
          <button
            onClick={onToggleLiveP5}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition border ${
              isLiveP5Connected
                ? 'bg-red-500/20 border-red-500/60 text-red-300 shadow-sm shadow-red-500/20 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={isLiveP5Connected ? "Disconnect from Person 5 FastAPI backend" : "Connect live to Person 5 FastAPI Backend (localhost:8000)"}
          >
            {isLiveP5Connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-red-400" />
                <span className="font-bold">LIVE P5 (8000)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">LIVE P5 BRIDGE</span>
              </>
            )}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition border ${
              isAudioEnabled 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            title={isAudioEnabled ? "Cockpit audio alerts active" : "Enable cockpit audio alerts"}
          >
            {isAudioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">ENABLE SOUND</span>
              </>
            )}
          </button>

          {/* Reset Demo Button (if live mode) */}
          {isLiveMode && (
            <button
              onClick={onResetToDemo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition"
              title="Return to 78-step built-in demo scenario"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">DEMO</span>
            </button>
          )}

          {/* CSV Data Ingestion Trigger */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">LOAD CSV</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition"
            title="Configure hazard coordinates & risk thresholds"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
