import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { TacticalRadar } from './components/TacticalRadar';
import { TelemetryPanel } from './components/TelemetryPanel';
import { WeatherPanel } from './components/WeatherPanel';
import { ProbabilityChart } from './components/ProbabilityChart';
import { RiskPanel } from './components/RiskPanel';
import { EventLog } from './components/EventLog';
import { TrackReplay } from './components/TrackReplay';
import { MLValidationPanel } from './components/MLValidationPanel';
import { DataUploadModal } from './components/DataUploadModal';
import { SettingsModal } from './components/SettingsModal';

import { DEMO_DATASET } from './data/demoDataset';
import { DEFAULT_CONFIG } from './config/riskConfig';
import { evaluateRisk } from './logic/riskEngine';
import { soundManager } from './logic/audioAlerts';
import { liveStreamClient } from './logic/liveStream';

export function App() {
  // 1. Dataset & Replay State
  const [dataset, setDataset] = useState(DEMO_DATASET);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [datasetSource, setDatasetSource] = useState("SIMULATION / REPLAY");
  const [isLiveP5Connected, setIsLiveP5Connected] = useState(false);

  // 2. Configuration & Modals State
  const [hazard, setHazard] = useState(DEFAULT_CONFIG.hazard);
  const [thresholds, setThresholds] = useState(DEFAULT_CONFIG.thresholds);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 3. Event Log State
  const [eventLogs, setEventLogs] = useState([]);
  const previousRiskLevelRef = useRef(null);

  // Current Step Data
  const currentStepData = dataset[currentStepIndex] || dataset[0];
  const prevStepData = currentStepIndex > 0 ? dataset[currentStepIndex - 1] : null;

  const aircraft = currentStepData.aircraft;
  const weather = currentStepData.weather;
  const mlProb = currentStepData.ml?.microburst_probability || 0;

  // 4. Compute 1 Hz Dynamic Features
  const dynamicFeatures = useMemo(() => {
    if (!prevStepData) {
      return currentStepData.dynamicFeatures || { delta_wind_speed: 0, delta_ias: 0, delta_vs: 0 };
    }
    const dWind = currentStepData.dynamicFeatures?.delta_wind_speed !== undefined && currentStepData.dynamicFeatures?.delta_wind_speed !== 0
      ? currentStepData.dynamicFeatures.delta_wind_speed
      : Number((weather.wind_speed - prevStepData.weather.wind_speed).toFixed(1));
    const dIas = currentStepData.dynamicFeatures?.delta_ias !== undefined && currentStepData.dynamicFeatures?.delta_ias !== 0
      ? currentStepData.dynamicFeatures.delta_ias
      : Number((aircraft.airspeed - prevStepData.aircraft.airspeed).toFixed(1));
    const prevAlt = prevStepData.aircraft.altitude || 0;
    const currAlt = aircraft.altitude || 0;
    const dVs = currentStepData.dynamicFeatures?.delta_vs !== undefined && currentStepData.dynamicFeatures?.delta_vs !== 0
      ? currentStepData.dynamicFeatures.delta_vs
      : Math.round((currAlt - prevAlt) * 196.85);

    return {
      delta_wind_speed: dWind,
      delta_ias: dIas,
      delta_vs: dVs
    };
  }, [currentStepData, prevStepData, weather, aircraft]);

  // 5. Synchronous Risk Engine Evaluation
  const riskData = useMemo(() => {
    return evaluateRisk({
      aircraft,
      weather,
      mlProbability: mlProb,
      hazard,
      thresholds
    });
  }, [aircraft, weather, mlProb, hazard, thresholds]);

  // Trajectory points up to current time step
  const trajectory = useMemo(() => {
    return dataset.slice(0, currentStepIndex + 1);
  }, [dataset, currentStepIndex]);

  // Probability history up to current step
  const probabilityHistory = useMemo(() => {
    return dataset.slice(0, currentStepIndex + 1);
  }, [dataset, currentStepIndex]);

  // 6. Track Risk Transitions & Event Log Dispatch
  useEffect(() => {
    if (!riskData) return;

    const currentLevel = riskData.level;
    const prevLevel = previousRiskLevelRef.current;

    soundManager.handleRiskTransition(currentLevel);

    if (prevLevel !== currentLevel) {
      const newLog = {
        id: `${Date.now()}-${currentStepIndex}`,
        step: currentStepData.step || currentStepIndex + 1,
        timestamp: currentStepData.timestamp || new Date().toLocaleTimeString(),
        level: currentLevel,
        probability: mlProb,
        distanceKm: riskData.distanceKm,
        tteFormatted: riskData.tteFormatted,
        reason: riskData.reasons[0] || "State transition recorded"
      };

      setEventLogs(prev => [newLog, ...prev]);
      previousRiskLevelRef.current = currentLevel;
    }
  }, [riskData, currentStepIndex, currentStepData, mlProb]);

  // 7. Playback Interval Loop
  useEffect(() => {
    if (!isPlaying) return;

    const stepIntervalMs = DEFAULT_CONFIG.replay.defaultStepMs / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIndex((prevIdx) => {
        if (prevIdx >= dataset.length - 1) {
          if (isLooping) {
            return 0;
          } else {
            setIsPlaying(false);
            return prevIdx;
          }
        }
        return prevIdx + 1;
      });
    }, stepIntervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, dataset.length, isLooping]);

  // 8. Live FastAPI Stream Listener (for Person 5 Integration)
  useEffect(() => {
    const unsubscribe = liveStreamClient.onData((type, payload) => {
      if (type === 'data' && payload) {
        setDataset(prev => {
          const next = [...prev, payload];
          // Limit live buffer to latest 200 items to conserve memory
          return next.length > 200 ? next.slice(-200) : next;
        });
        setCurrentStepIndex(prev => prev + 1);
        setIsLiveMode(true);
        setDatasetSource("LIVE FASTAPI (P5)");
      } else if (type === 'status') {
        if (payload === 'CONNECTED') {
          setIsLiveP5Connected(true);
        } else if (payload === 'DISCONNECTED' || payload === 'BACKEND_OFFLINE') {
          setIsLiveP5Connected(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handlers
  const handleToggleLiveP5 = () => {
    if (isLiveP5Connected) {
      liveStreamClient.disconnect();
      setIsLiveP5Connected(false);
    } else {
      liveStreamClient.startFastApiPolling('http://localhost:8000/alert', 1000);
      setIsLiveP5Connected(true);
    }
  };

  const handleToggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    soundManager.setEnabled(nextState);
  };

  const handleApplyCustomDataset = (newDataset, sourceName) => {
    setDataset(newDataset);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsLiveMode(true);
    setDatasetSource(sourceName);
    setEventLogs([]);
    previousRiskLevelRef.current = null;
  };

  const handleResetToDemo = () => {
    liveStreamClient.disconnect();
    setIsLiveP5Connected(false);
    setDataset(DEMO_DATASET);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsLiveMode(false);
    setDatasetSource("SIMULATION / REPLAY");
    setEventLogs([]);
    previousRiskLevelRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Header */}
      <Header
        isLiveMode={isLiveMode}
        datasetSource={datasetSource}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetToDemo={handleResetToDemo}
        isLiveP5Connected={isLiveP5Connected}
        onToggleLiveP5={handleToggleLiveP5}
        currentPhase={currentStepData.phaseName}
        currentStep={currentStepIndex + 1}
        totalSteps={dataset.length}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-4 space-y-3.5">
        
        {/* Dynamic Alert Banner */}
        <AlertBanner
          riskData={riskData}
          mlProbability={mlProb}
        />

        {/* Primary Row: Radar & Instruments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          
          {/* Left Column: Tactical Situation Radar */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
            <TacticalRadar
              aircraft={aircraft}
              hazard={hazard}
              trajectory={trajectory}
              riskData={riskData}
              mlProbability={mlProb}
            />
          </div>

          {/* Right Column: Telemetry & Weather Stack with 1 Hz Dynamic Features */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-3.5">
            <TelemetryPanel
              aircraft={aircraft}
              riskData={riskData}
              dynamicFeatures={dynamicFeatures}
            />
            <WeatherPanel
              weather={weather}
              dynamicFeatures={dynamicFeatures}
            />
          </div>

        </div>

        {/* Secondary Row: Probability Trend, Risk Decision Status, & Event Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          {/* 1. Microburst Probability History Chart */}
          <div className="flex flex-col">
            <ProbabilityChart
              currentProbability={mlProb}
              history={probabilityHistory}
              thresholds={thresholds}
            />
          </div>

          {/* 2. Risk Status & Explainable Rationale */}
          <div className="flex flex-col">
            <RiskPanel
              riskData={riskData}
            />
          </div>

          {/* 3. Real-time Event Log */}
          <div className="flex flex-col md:col-span-2 lg:col-span-1">
            <EventLog
              events={eventLogs}
              onClearLog={() => setEventLogs([])}
            />
          </div>

        </div>

        {/* Replay Controller Bar */}
        <div className="sticky bottom-2 z-30 shadow-2xl">
          <TrackReplay
            isPlaying={isPlaying}
            currentStepIndex={currentStepIndex}
            totalSteps={dataset.length}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onReset={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            onStepChange={(idx) => setCurrentStepIndex(idx)}
            onStepForward={() => setCurrentStepIndex(prev => Math.min(dataset.length - 1, prev + 1))}
            onStepBackward={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            playbackSpeed={playbackSpeed}
            onSpeedChange={(spd) => setPlaybackSpeed(spd)}
            isLooping={isLooping}
            onToggleLoop={() => setIsLooping(prev => !prev)}
            currentStepData={currentStepData}
          />
        </div>

        {/* Lower Section: ML Model Validation Benchmark */}
        <div className="pt-2">
          <MLValidationPanel />
        </div>

      </main>

      {/* Footer & Aviation Disclaimer */}
      <footer className="mt-8 border-t border-slate-800/80 bg-[#060a12] py-4 px-4 text-center text-xs font-mono text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">
          AEROSHIELD: Affordable Terminal-Area Early Warning System for Atmospheric Microburst Risk to Aircraft
        </p>
        <p className="text-[11px] text-amber-400/90">
          ⚠ DISCLAIMER: This is a hackathon prototype demonstration using simulated/experimental data. It is not flight-certified or validated for operational aviation use.
        </p>
        <p className="text-[10px] text-slate-400">
          Built with React • Vite • Tailwind CSS • Web Audio API • Leaflet • Recharts • 1 Hz Sampling • FastAPI Bridge
        </p>
      </footer>

      {/* Modals */}
      <DataUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={handleApplyCustomDataset}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentHazard={hazard}
        currentThresholds={thresholds}
        onSaveSettings={({ hazard: newH, thresholds: newT }) => {
          setHazard(newH);
          setThresholds(newT);
        }}
      />

    </div>
  );
}

export default App;
