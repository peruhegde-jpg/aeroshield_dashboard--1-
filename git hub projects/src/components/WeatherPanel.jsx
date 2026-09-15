import React from 'react';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  GaugeCircle, 
  Wind, 
  Navigation,
  CloudLightning,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

export function WeatherPanel({ weather, dynamicFeatures }) {
  if (!weather) return null;

  const {
    temperature = 25.0,
    humidity = 50.0,
    pressure = 1013.2,
    wind_speed = 5.0,
    wind_direction = 0,
    rain = "No"
  } = weather;

  const deltaWind = dynamicFeatures?.delta_wind_speed ?? 0;
  const hasRain = rain && rain !== "No" && rain !== "0" && rain !== 0 && rain !== "none";

  return (
    <div className="cockpit-panel rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-xl">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Wind className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
            ATMOSPHERIC CONDITIONS (1 Hz)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">
          ESP32 In-Situ
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="p-3.5 space-y-2.5 font-mono">
        
        {/* Row 1: Temperature & Humidity */}
        <div className="grid grid-cols-2 gap-2">
          
          {/* Temperature */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" /> TEMPERATURE
              </span>
              <span className="text-slate-500">°C</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-100">
                {Number(temperature).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">°C</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {temperature < 23 ? "Cold outflow air" : "Ambient boundary"}
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> HUMIDITY
              </span>
              <span className="text-slate-500">RH %</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${
                humidity >= 85 ? 'text-cyan-300 glow-cyan font-bold' : 'text-slate-100'
              }`}>
                {Number(humidity).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            {/* Humidity level bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  humidity >= 80 ? 'bg-cyan-400' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, humidity)}%` }}
              />
            </div>
          </div>

        </div>

        {/* Row 2: Barometric Pressure & Rain Status */}
        <div className="grid grid-cols-2 gap-2">
          
          {/* Pressure */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <GaugeCircle className="w-3 h-3 text-indigo-400" /> PRESSURE
              </span>
              <span className="text-slate-500">hPa</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${
                pressure < 1000 ? 'text-amber-400' : 'text-slate-100'
              }`}>
                {Number(pressure).toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">hPa</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {pressure < 1000 ? "Meso-low pressure drop" : "Standard atmosphere"}
            </div>
          </div>

          {/* Rain / Precipitation */}
          <div className={`border rounded-lg p-2.5 transition-colors ${
            hasRain 
              ? 'bg-blue-950/30 border-blue-500/40 text-blue-200' 
              : 'bg-slate-950/70 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <CloudRain className={`w-3 h-3 ${hasRain ? 'text-blue-400 animate-bounce' : 'text-slate-400'}`} /> PRECIPITATION
              </span>
            </div>
            <div className="text-sm font-bold truncate">
              {rain}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {hasRain ? "Reflectivity active" : "Dry air mass"}
            </div>
          </div>

        </div>

        {/* Row 3: Wind Vector (Speed, ΔWind, Direction) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 gap-2">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-teal-400" /> WIND VECTOR (1 Hz)
              </span>
              <span className={`font-bold ${
                deltaWind > 2 ? 'text-red-400' : deltaWind > 0.5 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                ΔWind: {deltaWind > 0 ? `+${deltaWind}` : deltaWind} m/s²
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-bold ${
                wind_speed >= 20 ? 'text-red-400 glow-red' : wind_speed >= 12 ? 'text-amber-400' : 'text-slate-100'
              }`}>
                {Number(wind_speed).toFixed(1)} <span className="text-xs font-normal text-slate-400">m/s</span>
              </span>
              <span className="text-xs text-slate-400">
                ({(wind_speed * 1.94384).toFixed(0)} kt)
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Direction: <span className="text-cyan-300 font-bold">{Math.round(wind_direction)}°</span>
            </div>
          </div>

          {/* Compass Wind Vector Needle */}
          <div className="flex flex-col items-center">
            <div 
              className="w-10 h-10 rounded-full border border-teal-500/40 bg-teal-950/20 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${wind_direction}deg)` }}
              title={`Wind from ${wind_direction}°`}
            >
              <Navigation className="w-5 h-5 text-teal-400 fill-teal-400/40" />
            </div>
            <span className="text-[9px] text-slate-500 mt-0.5">WIND DIR</span>
          </div>
        </div>

      </div>
    </div>
  );
}
