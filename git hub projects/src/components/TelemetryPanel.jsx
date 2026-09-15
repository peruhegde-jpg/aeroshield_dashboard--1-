import React from 'react';
import { 
  Plane, 
  Compass, 
  Gauge, 
  MapPin, 
  ArrowUpRight, 
  Clock, 
  Target,
  Navigation2,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Activity
} from 'lucide-react';

export function TelemetryPanel({ aircraft, riskData, dynamicFeatures }) {
  if (!aircraft) return null;

  const {
    latitude = 0,
    longitude = 0,
    altitude = 0,
    airspeed = 0,
    heading = 0,
    vertical_speed = 0
  } = aircraft;

  const {
    bearingDeg = 0,
    headingDeltaDeg = 0,
    isApproaching = false,
    distanceKm = 0,
    tteFormatted = "--:--"
  } = riskData || {};

  const deltaIas = dynamicFeatures?.delta_ias ?? 0;
  const deltaVs = dynamicFeatures?.delta_vs ?? 0;

  return (
    <div className="cockpit-panel rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Plane className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
            AIRCRAFT TELEMETRY (1 Hz)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
          JSBSim: C172 / 737
        </div>
      </div>

      {/* Main Telemetry Grid */}
      <div className="p-3.5 space-y-3 font-mono">
        
        {/* Row 1: Geographic Position (Lat / Lon) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> LATITUDE
              </span>
              <span className="text-slate-500">DEG N</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-cyan-300 tracking-wide glow-cyan">
              {Number(latitude).toFixed(5)}°
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> LONGITUDE
              </span>
              <span className="text-slate-500">DEG E</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-cyan-300 tracking-wide glow-cyan">
              {Number(longitude).toFixed(5)}°
            </div>
          </div>
        </div>

        {/* Row 2: Altitude AGL & Airspeed (IAS + ΔIAS) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Altitude */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-cyan-400" /> ALTITUDE (AGL)
              </span>
              <span className="text-slate-500">{(altitude * 3.28084).toFixed(0)} ft</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tracking-wide">
                {altitude}
              </span>
              <span className="text-xs text-slate-400 font-sans">m AGL</span>
            </div>
            {/* Visual altitude bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (altitude / 2000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Airspeed with ΔIAS dynamic change */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" /> AIRSPEED (IAS)
              </span>
              <span className={`text-[10px] font-bold ${
                deltaIas < -3 ? 'text-red-400' : deltaIas > 2 ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                ΔIAS: {deltaIas > 0 ? `+${deltaIas}` : deltaIas} kt/s
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tracking-wide">
                {airspeed}
              </span>
              <span className="text-xs text-slate-400 font-sans">kt</span>
            </div>
            {/* Visual speed bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (airspeed / 160) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Row 3: Heading & Bearing to Hazard */}
        <div className="grid grid-cols-2 gap-2">
          {/* Aircraft Heading */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" /> HEADING
              </span>
              <span className="text-cyan-400 font-bold">HDG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-cyan-300 glow-cyan">
                {Math.round(heading)}°
              </span>
              <div 
                className="w-6 h-6 rounded-full border border-cyan-500/40 flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${heading}deg)` }}
              >
                <Navigation2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30" />
              </div>
            </div>
          </div>

          {/* Bearing to Hazard */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3 text-red-400" /> BEARING TO HAZARD
              </span>
              <span className="text-red-400 font-bold">BRG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-red-300">
                {Math.round(bearingDeg)}°
              </span>
              <div 
                className="w-6 h-6 rounded-full border border-red-500/40 flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${bearingDeg}deg)` }}
              >
                <Navigation2 className="w-3.5 h-3.5 text-red-400 fill-red-400/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Vector Alignment & Distance */}
        <div className="grid grid-cols-2 gap-2">
          {/* Heading Toward Hazard (YES/NO) */}
          <div className={`border rounded-lg p-2.5 transition-colors ${
            isApproaching 
              ? 'bg-red-950/30 border-red-500/50 text-red-200' 
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="text-[10px] text-slate-400 mb-0.5">HEADING TOWARD HAZARD</div>
            <div className="flex items-center gap-1.5 mt-1">
              {isApproaching ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-base font-bold text-red-400">YES</span>
                  <span className="text-[10px] text-red-300/80">(Δ {Math.round(headingDeltaDeg)}°)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-base font-bold text-emerald-400">NO</span>
                  <span className="text-[10px] text-emerald-300/80">(Δ {Math.round(headingDeltaDeg)}°)</span>
                </>
              )}
            </div>
          </div>

          {/* Distance */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[10px] text-slate-400 mb-0.5">DISTANCE TO HAZARD</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-lg font-bold ${
                distanceKm <= 5 ? 'text-red-400 glow-red' : distanceKm <= 15 ? 'text-amber-400' : 'text-slate-100'
              }`}>
                {distanceKm}
              </span>
              <span className="text-xs text-slate-400">km</span>
            </div>
          </div>
        </div>

        {/* Row 5: Time-to-Encounter banner */}
        <div className="bg-slate-950/90 border border-cyan-500/20 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">ESTIMATED TIME TO ENCOUNTER</div>
              <div className="text-[10px] text-slate-500">Calculated via geodesic closing vector</div>
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono px-3 py-0.5 rounded ${
            isApproaching && distanceKm <= 5 
              ? 'bg-red-500/20 border border-red-500/40 text-red-400 glow-red animate-pulse'
              : isApproaching && distanceKm <= 15
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border border-slate-700 text-slate-200'
          }`}>
            {tteFormatted}
          </div>
        </div>

      </div>
    </div>
  );
}
