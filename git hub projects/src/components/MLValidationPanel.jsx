import React from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  BarChart3, 
  Cpu, 
  Layers, 
  TrendingUp,
  FileCode2,
  Sparkles
} from 'lucide-react';

export function MLValidationPanel() {
  // Person 4's exact holdout test set results
  const metrics = [
    { label: "Overall Accuracy", value: "100.0%", sub: "721 / 721 Holdout Samples", color: "text-emerald-400" },
    { label: "Microburst Recall", value: "100.0%", sub: "60 / 60 True Positives", color: "text-cyan-400" },
    { label: "Pre-Disturbance F1", value: "1.000", sub: "36 / 36 Early Warnings", color: "text-amber-400" },
    { label: "Inference Latency", value: "< 1.8 ms", sub: "1 Hz Real-time Processing", color: "text-purple-400" },
  ];

  const classReports = [
    { class: "NORMAL", precision: "1.0000", recall: "1.0000", f1: "1.0000", support: 565, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
    { class: "PRE-DISTURBANCE", precision: "1.0000", recall: "1.0000", f1: "1.0000", support: 36, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
    { class: "RECOVERY", precision: "1.0000", recall: "1.0000", f1: "1.0000", support: 60, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    { class: "MICROBURST", precision: "1.0000", recall: "1.0000", f1: "1.0000", support: 60, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  ];

  const features = [
    { name: "delta_ias", desc: "1s Indicated Airspeed Delta (ΔIAS)", importance: 28.5 },
    { name: "wind_speed_kt", desc: "Atmospheric Wind Speed (knots)", importance: 24.2 },
    { name: "delta_vs_fpm", desc: "1s Vertical Speed Delta (ΔVS)", importance: 18.7 },
    { name: "agl_ft", desc: "Altitude Above Ground Level (ft)", importance: 12.4 },
    { name: "delta_alt_ft", desc: "1s Altitude Rate of Change (ΔALT)", importance: 7.1 },
    { name: "wind_direction_deg", desc: "Wind Vector Angle (degrees)", importance: 4.8 },
    { name: "vs_fpm", desc: "Vertical Speed (fpm)", importance: 2.5 },
    { name: "ias", desc: "Current Airspeed (knots)", importance: 1.8 },
  ];

  const confusionMatrix = [
    { actual: "NORMAL (565)", normal: 565, pre: 0, rec: 0, micro: 0 },
    { actual: "PRE-DIST (36)", normal: 0, pre: 36, rec: 0, micro: 0 },
    { actual: "RECOVERY (60)", normal: 0, pre: 0, rec: 60, micro: 0 },
    { actual: "MICROBURST (60)", normal: 0, pre: 0, rec: 0, micro: 60 },
  ];

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-lg p-4 font-mono shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
              PERSON 4: RANDOM FOREST CLASSIFIER VALIDATION
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                BENCHMARK EVALUATION
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              8-Feature Multi-Class ML Model trained on 60-Minute 1 Hz Flight Scenarios (`aircraft_telemetry_60min.csv`)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            MODEL: <strong className="text-purple-300">RandomForest (100 Trees)</strong>
          </span>
          <span className="text-[11px] px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            TEST SAMPLES: <strong className="text-cyan-300">721 (20% Holdout)</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-md p-3">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">{m.label}</div>
            <div className={`text-xl font-bold tracking-tight mt-0.5 ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* 3 Columns: Classification Report, Feature Importance, Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        
        {/* Col 1: 4-Class Classification Report */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-md p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              4-CLASS CLASSIFICATION REPORT
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Stratified Test Set</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-12 text-[10px] text-slate-400 font-bold border-b border-slate-800 pb-1 px-1">
              <span className="col-span-4">CLASS</span>
              <span className="col-span-2 text-right">PREC</span>
              <span className="col-span-2 text-right">REC</span>
              <span className="col-span-2 text-right">F1</span>
              <span className="col-span-2 text-right">SUPP</span>
            </div>

            {classReports.map((c, idx) => (
              <div key={idx} className={`grid grid-cols-12 items-center px-2 py-1.5 rounded border text-[11px] font-mono ${c.bg}`}>
                <span className={`col-span-4 font-bold ${c.color}`}>{c.class}</span>
                <span className="col-span-2 text-right text-slate-200">{c.precision}</span>
                <span className="col-span-2 text-right text-slate-200">{c.recall}</span>
                <span className="col-span-2 text-right font-bold text-white">{c.f1}</span>
                <span className="col-span-2 text-right text-slate-400">{c.support}</span>
              </div>
            ))}
          </div>

          <div className="p-2 rounded bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 leading-relaxed font-sans">
            💡 <strong>Observation:</strong> The model achieves 100% precision on holdout evaluation data, distinguishing early precursor wind shifts (<span className="text-amber-400 font-mono">PRE-DISTURBANCE</span>) from active severe shear (<span className="text-red-400 font-mono">MICROBURST</span>).
          </div>
        </div>

        {/* Col 2: Feature Importance Bar Chart */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-md p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              RANDOM FOREST FEATURE IMPORTANCE
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Gini Importance</span>
          </div>

          <div className="space-y-2 text-xs">
            {features.map((f, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-bold font-mono">{f.name}</span>
                  <span className="text-purple-300 font-mono">{f.importance}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${f.importance * 3.3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Confusion Matrix */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/80 rounded-md p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              CONFUSION MATRIX (721)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10px] font-mono border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="p-1 text-left">ACTUAL \ PRED</th>
                  <th className="p-1 text-emerald-400">NORM</th>
                  <th className="p-1 text-amber-400">PRE</th>
                  <th className="p-1 text-blue-400">REC</th>
                  <th className="p-1 text-red-400">MB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {confusionMatrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-1 text-left font-bold text-slate-300">{row.actual}</td>
                    <td className={`p-1 ${row.normal > 0 ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-600"}`}>{row.normal}</td>
                    <td className={`p-1 ${row.pre > 0 ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-600"}`}>{row.pre}</td>
                    <td className={`p-1 ${row.rec > 0 ? "bg-blue-500/20 text-blue-300 font-bold" : "text-slate-600"}`}>{row.rec}</td>
                    <td className={`p-1 ${row.micro > 0 ? "bg-red-500/20 text-red-300 font-bold" : "text-slate-600"}`}>{row.micro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1 font-sans">
            <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> 0 False Positives / 0 False Negatives
            </div>
            <p>Evaluated on 20% holdout split (random_state=42, stratify=y).</p>
          </div>
        </div>

      </div>

    </div>
  );
}
