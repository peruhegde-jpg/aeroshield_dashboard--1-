import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Area, 
  AreaChart 
} from 'recharts';
import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react';

export function ProbabilityChart({ 
  currentProbability = 0, 
  history = [], 
  thresholds 
}) {
  const probVal = Number(currentProbability) || 0;
  const cautionThresh = thresholds?.probCaution || 45;
  const highThresh = thresholds?.probHigh || 75;

  // Format data for Recharts
  const chartData = useMemo(() => {
    return history.map((item, idx) => ({
      step: item.step || idx + 1,
      prob: Number(item.ml?.microburst_probability || 0),
      timestamp: item.timestamp || `T+${idx * 5}`
    }));
  }, [history]);

  return (
    <div className="cockpit-panel rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
              MICROBURST PROBABILITY
            </h3>
          </div>
        </div>

        {/* Disclaimer Tag */}
        <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
          SIMULATED / EXPERIMENTAL DATA
        </div>
      </div>

      {/* Main Gauge & Chart */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3 font-mono">
        
        {/* Real-time Probability Scorecard */}
        <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-lg p-3">
          <div>
            <div className="text-[11px] text-slate-400">CURRENT ML OUTPUT</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black ${
                probVal >= highThresh ? 'text-red-400 glow-red' : probVal >= cautionThresh ? 'text-amber-400 glow-amber' : 'text-emerald-400 glow-green'
              }`}>
                {probVal.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {probVal >= highThresh ? '(HIGH RISK LEVEL)' : probVal >= cautionThresh ? '(CAUTION LEVEL)' : '(NOMINAL / LOW)'}
              </span>
            </div>
          </div>

          {/* Probability Mini Visual Indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-slate-400">MODEL INFERENCE</div>
            <div className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${probVal >= cautionThresh ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`w-2.5 h-2.5 rounded-full ${probVal >= highThresh ? 'bg-red-500 animate-ping' : 'bg-slate-800'}`} />
              <span className="text-xs font-bold text-slate-300">
                {probVal >= highThresh ? 'CRITICAL' : probVal >= cautionThresh ? 'ELEVATED' : 'CLEAR'}
              </span>
            </div>
          </div>
        </div>

        {/* Probability Trend Line Chart */}
        <div className="h-44 sm:h-48 w-full relative pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="step" 
                stroke="#475569" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#475569" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs font-mono text-white">
                        <div className="text-slate-400">Step: {data.step} ({data.timestamp})</div>
                        <div className="text-cyan-400 font-bold">Probability: {data.prob}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Caution Threshold Reference */}
              <ReferenceLine 
                y={cautionThresh} 
                stroke="#ffb700" 
                strokeDasharray="3 3"
                label={{ value: `Caution (${cautionThresh}%)`, fill: '#ffb700', fontSize: 9, position: 'insideTopLeft' }}
              />
              {/* High Threshold Reference */}
              <ReferenceLine 
                y={highThresh} 
                stroke="#ff003c" 
                strokeDasharray="3 3"
                label={{ value: `High (${highThresh}%)`, fill: '#ff003c', fontSize: 9, position: 'insideTopLeft' }}
              />
              <Area 
                type="monotone" 
                dataKey="prob" 
                stroke="#00f0ff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#probGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Info footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          <span>Trained on synthetic Doppler & meso-met data</span>
          <span>Rolling Window: Current Step</span>
        </div>

      </div>
    </div>
  );
}
