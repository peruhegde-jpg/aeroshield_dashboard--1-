import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Repeat,
  FastForward,
  Clock,
  Navigation
} from 'lucide-react';

export function TrackReplay({
  isPlaying,
  currentStepIndex,
  totalSteps,
  onPlay,
  onPause,
  onReset,
  onStepChange,
  onStepForward,
  onStepBackward,
  playbackSpeed,
  onSpeedChange,
  isLooping,
  onToggleLoop,
  currentStepData
}) {
  const currentStepNum = currentStepIndex + 1;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="cockpit-panel rounded-xl overflow-hidden border border-slate-800 shadow-2xl p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Playback Controls & Speed */}
        <div className="flex items-center gap-2 font-mono w-full lg:w-auto justify-center lg:justify-start">
          
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Backward */}
          <button
            onClick={onStepBackward}
            disabled={currentStepIndex <= 0}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Step backward 1 frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm tracking-wider transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>PLAY REPLAY</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Step forward 1 frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Loop Toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-lg border transition ${
              isLooping
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isLooping ? "Continuous Loop: ON" : "Continuous Loop: OFF"}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 ml-2">
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`px-2 py-1 rounded text-xs transition ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500 text-black font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

        </div>

        {/* Timeline Slider with Phase Annotations */}
        <div className="flex-1 w-full flex flex-col gap-1.5 px-2">
          
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">
                TIMELINE SCRUBBER:
              </span>
              <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {currentStepNum} / {totalSteps}
              </span>
              {currentStepData && (
                <span className="text-slate-400 text-[11px] hidden md:inline">
                  [{currentStepData.timestamp}] • {currentStepData.phaseName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>PROGRESS: {progressPercent.toFixed(0)}%</span>
            </div>
          </div>

          {/* Interactive Range Input Scrubber */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIndex}
              onChange={(e) => onStepChange(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none border border-slate-700"
            />
          </div>

          {/* Phase Markers Track (for the 78-step demo) */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-500 pt-0.5 text-center">
            <div className="border-t border-slate-800 pt-0.5 truncate text-emerald-400/80">
              P1: Approach (1-22)
            </div>
            <div className="border-t border-slate-800 pt-0.5 truncate text-amber-400/80">
              P2: Deterioration (23-44)
            </div>
            <div className="border-t border-slate-800 pt-0.5 truncate text-red-400/80">
              P3: Encounter (45-62)
            </div>
            <div className="border-t border-slate-800 pt-0.5 truncate text-cyan-400/80">
              P4: Breakout (63-78)
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
