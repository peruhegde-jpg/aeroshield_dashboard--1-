import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export function EventLog({ events = [], onClearLog }) {
  const [filterLevel, setFilterLevel] = useState('ALL'); // 'ALL', 'HIGH', 'CAUTION', 'LOW'

  const filteredEvents = events.filter((evt) => {
    if (filterLevel === 'ALL') return true;
    return evt.level === filterLevel;
  });

  const exportLog = () => {
    const jsonStr = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeroshield_event_log_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cockpit-panel rounded-xl overflow-hidden flex flex-col border border-slate-800 shadow-xl h-full">
      
      {/* Header with Actions */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            EVENT LOG
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 font-mono">
              {filteredEvents.length}
            </span>
          </h3>
        </div>

        {/* Filter and Export buttons */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="HIGH">HIGH ONLY</option>
            <option value="CAUTION">CAUTION ONLY</option>
            <option value="LOW">LOW ONLY</option>
          </select>

          {/* Export */}
          <button
            onClick={exportLog}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Export event log JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          {onClearLog && (
            <button
              onClick={onClearLog}
              className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
              title="Clear event log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrolling Events Feed (Newest at Top) */}
      <div className="p-2 space-y-2 overflow-y-auto max-h-[300px] lg:max-h-[360px] font-mono">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No events recorded yet. Run track replay to observe state transitions.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isHigh = evt.level === 'HIGH';
            const isCaution = evt.level === 'CAUTION';

            return (
              <div
                key={evt.id || idx}
                className={`rounded-lg p-2.5 border transition-all text-xs ${
                  isHigh
                    ? 'bg-red-950/40 border-red-500/50 text-red-200'
                    : isCaution
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <div className="flex items-center gap-1.5">
                    {isHigh ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    ) : isCaution ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-slate-400">T+{String(evt.step * 5).padStart(3, '0')}s</span>
                    <span className="text-slate-500">|</span>
                    <span className="flex items-center gap-1">
                      RISK <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className={isHigh ? 'text-red-400 font-bold' : isCaution ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {evt.level}
                      </span>
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {evt.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] pt-1 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500">Probability: </span>
                    <span className="font-bold text-slate-200">{Number(evt.probability).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Distance: </span>
                    <span className="font-bold text-slate-200">{evt.distanceKm} km</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500">TTE: </span>
                    <span className="font-bold text-slate-200">{evt.tteFormatted || "--:--"}</span>
                  </div>
                </div>

                {evt.reason && (
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {evt.reason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
