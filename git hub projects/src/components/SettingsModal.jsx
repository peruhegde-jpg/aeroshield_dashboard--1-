import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sliders, 
  MapPin, 
  ShieldAlert, 
  RotateCcw,
  Check
} from 'lucide-react';
import { DEFAULT_CONFIG } from '../config/riskConfig';

export function SettingsModal({
  isOpen,
  onClose,
  currentHazard,
  currentThresholds,
  onSaveSettings
}) {
  const [hazard, setHazard] = useState({ ...currentHazard });
  const [thresholds, setThresholds] = useState({ ...currentThresholds });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    setHazard({ ...DEFAULT_CONFIG.hazard });
    setThresholds({ ...DEFAULT_CONFIG.thresholds });
  };

  const handleSave = () => {
    onSaveSettings({ hazard, thresholds });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                SYSTEM CONFIGURATION & THRESHOLDS
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Fine-tune microburst coordinates, warning buffers, and risk logic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Section 1: Simulated Hazard Geolocation */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs pb-1 border-b border-slate-800">
              <MapPin className="w-4 h-4" />
              <span>1. HAZARD CENTROID & PERIMETER</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Hazard Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={hazard.latitude}
                  onChange={(e) => setHazard({ ...hazard, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Hazard Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={hazard.longitude}
                  onChange={(e) => setHazard({ ...hazard, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Warning Radius (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="20"
                  value={hazard.radiusKm}
                  onChange={(e) => setHazard({ ...hazard, radiusKm: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Severe Core Radius (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="10"
                  value={hazard.coreRadiusKm}
                  onChange={(e) => setHazard({ ...hazard, coreRadiusKm: parseFloat(e.target.value) || 0.5 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ML Probability & Proximity Thresholds */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs pb-1 border-b border-slate-800">
              <Sliders className="w-4 h-4" />
              <span>2. RISK ENGINE CLASSIFICATION THRESHOLDS</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">
                  Caution ML Probability: <span className="text-amber-400 font-bold">{thresholds.probCaution}%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={thresholds.probCaution}
                  onChange={(e) => setThresholds({ ...thresholds, probCaution: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">
                  High ML Probability: <span className="text-red-400 font-bold">{thresholds.probHigh}%</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="99"
                  value={thresholds.probHigh}
                  onChange={(e) => setThresholds({ ...thresholds, probHigh: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-red-400"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Caution Distance (km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={thresholds.distanceCautionKm}
                  onChange={(e) => setThresholds({ ...thresholds, distanceCautionKm: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">High-Risk Distance (km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={thresholds.distanceHighKm}
                  onChange={(e) => setThresholds({ ...thresholds, distanceHighKm: parseFloat(e.target.value) || 5 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Caution TTE Window (sec)</label>
                <input
                  type="number"
                  step="5"
                  value={thresholds.tteCautionSec}
                  onChange={(e) => setThresholds({ ...thresholds, tteCautionSec: parseInt(e.target.value) || 120 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Critical TTE Window (sec)</label>
                <input
                  type="number"
                  step="5"
                  value={thresholds.tteHighSec}
                  onChange={(e) => setThresholds({ ...thresholds, tteHighSec: parseInt(e.target.value) || 45 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 text-[11px] block mb-1">
                  Trajectory Alignment Tolerance: <span className="text-cyan-400 font-bold">{thresholds.approachAngleThresholdDeg}°</span>
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={thresholds.approachAngleThresholdDeg}
                  onChange={(e) => setThresholds({ ...thresholds, approachAngleThresholdDeg: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  If |Heading - Bearing| ≤ {thresholds.approachAngleThresholdDeg}°, aircraft is classified as "Heading toward hazard".
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black transition shadow-lg shadow-cyan-500/20 text-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVED</span>
                </>
              ) : (
                <span>SAVE CONFIGURATION</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
