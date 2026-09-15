import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Navigation, Clock, Gauge, Target } from 'lucide-react';

export function AlertBanner({ riskData, mlProbability }) {
  if (!riskData) return null;

  const { level, distanceKm, isApproaching, tteFormatted, insideHazard } = riskData;
  const prob = Number(mlProbability) || 0;

  if (level === 'HIGH') {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-red-500/80 bg-gradient-to-r from-red-950/90 via-red-900/60 to-red-950/90 p-4 text-white shadow-2xl shadow-red-500/25 border-glow-red animate-pulse-fast">
        {/* Flashing scanline accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Main Alarm Title */}
          <div className="flex items-center gap-3.5 text-center lg:text-left">
            <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/40 text-red-400 shrink-0">
              <AlertOctagon className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="px-2 py-0.5 rounded bg-red-500 text-black text-xs font-black tracking-wider uppercase">
                  MASTER WARNING
                </span>
                <span className="text-red-400 text-xs font-mono font-bold animate-pulse">
                  CRITICAL CONVECTIVE HAZARD
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-wide font-mono text-white glow-red mt-0.5">
                ⚠ MICROBURST HAZARD AHEAD
              </h2>
            </div>
          </div>

          {/* Key Danger Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto font-mono">
            
            {/* Approach Vector */}
            <div className="bg-black/40 border border-red-500/40 rounded-lg p-2.5 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-[11px] text-red-300">
                <Navigation className="w-3 h-3 text-red-400" />
                <span>APPROACHING</span>
              </div>
              <span className="text-base font-bold text-red-100">
                {insideHazard ? "INSIDE CELL" : (isApproaching ? "YES (CONVERGING)" : "NO")}
              </span>
            </div>

            {/* Probability */}
            <div className="bg-black/40 border border-red-500/40 rounded-lg p-2.5 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-[11px] text-red-300">
                <Gauge className="w-3 h-3 text-red-400" />
                <span>ML PROBABILITY</span>
              </div>
              <span className="text-base font-bold text-red-100">
                {prob.toFixed(1)}%
              </span>
            </div>

            {/* Distance */}
            <div className="bg-black/40 border border-red-500/40 rounded-lg p-2.5 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-[11px] text-red-300">
                <Target className="w-3 h-3 text-red-400" />
                <span>DISTANCE</span>
              </div>
              <span className="text-base font-bold text-red-100">
                {distanceKm} km
              </span>
            </div>

            {/* Time to Encounter */}
            <div className="bg-black/40 border border-red-500/40 rounded-lg p-2.5 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 text-[11px] text-red-300">
                <Clock className="w-3 h-3 text-red-400" />
                <span>ENCOUNTER TIME</span>
              </div>
              <span className="text-base font-bold text-red-100">
                {insideHazard ? "00:00 (ACTIVE)" : tteFormatted}
              </span>
            </div>

          </div>

        </div>
      </div>
    );
  }

  if (level === 'CAUTION') {
    return (
      <div className="relative overflow-hidden rounded-xl border border-amber-500/70 bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-amber-950/80 p-3 text-amber-100 shadow-lg shadow-amber-500/10 border-glow-amber">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/40 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black tracking-wider uppercase">
                  CAUTION
                </span>
                <span className="text-amber-400 text-xs font-mono font-bold">
                  ATMOSPHERIC HAZARD ADVISORY
                </span>
              </div>
              <p className="text-sm font-semibold font-mono text-amber-100">
                Elevated microburst probability detected along aircraft vector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/30">
            <div>
              <span className="text-amber-400/80">PROB: </span>
              <span className="font-bold text-amber-200">{prob.toFixed(1)}%</span>
            </div>
            <div className="w-px h-4 bg-amber-500/30" />
            <div>
              <span className="text-amber-400/80">DIST: </span>
              <span className="font-bold text-amber-200">{distanceKm} km</span>
            </div>
            <div className="w-px h-4 bg-amber-500/30" />
            <div>
              <span className="text-amber-400/80">TTE: </span>
              <span className="font-bold text-amber-200">{tteFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOW / NOMINAL STATE
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between border-glow-green">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-bold tracking-wide text-emerald-400">STATUS NOMINAL:</span>
        <span className="text-emerald-300/90">
          No imminent microburst hazard along flight path ({distanceKm} km separation, ML Risk: {prob.toFixed(1)}%)
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
        <span>SAFE SEPARATION MAINTAINED</span>
      </div>
    </div>
  );
}
