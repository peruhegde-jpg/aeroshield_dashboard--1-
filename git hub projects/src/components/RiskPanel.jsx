import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  FileCheck,
  Check,
  ChevronRight
} from 'lucide-react';

export function RiskPanel({ riskData }) {
  if (!riskData) return null;

  const { level = 'LOW', reasons = [] } = riskData;

  const configByLevel = {
    HIGH: {
      title: "HIGH RISK",
      badge: "CRITICAL ALERT",
      bgGradient: "from-red-950/60 via-red-900/30 to-slate-950/80",
      borderColor: "border-red-500/60",
      glowClass: "border-glow-red glow-red",
      textColor: "text-red-400",
      badgeBg: "bg-red-500 text-black",
      icon: ShieldAlert
    },
    CAUTION: {
      title: "CAUTION RISK",
      badge: "ADVISORY",
      bgGradient: "from-amber-950/60 via-amber-900/30 to-slate-950/80",
      borderColor: "border-amber-500/60",
      glowClass: "border-glow-amber glow-amber",
      textColor: "text-amber-400",
      badgeBg: "bg-amber-500 text-black",
      icon: AlertTriangle
    },
    LOW: {
      title: "LOW RISK",
      badge: "NOMINAL",
      bgGradient: "from-emerald-950/50 via-emerald-900/20 to-slate-950/80",
      borderColor: "border-emerald-500/50",
      glowClass: "border-glow-green glow-green",
      textColor: "text-emerald-400",
      badgeBg: "bg-emerald-500 text-black",
      icon: ShieldCheck
    }
  };

  const currentCfg = configByLevel[level] || configByLevel.LOW;
  const IconComponent = currentCfg.icon;

  return (
    <div className={`cockpit-panel rounded-xl overflow-hidden flex flex-col border ${currentCfg.borderColor} shadow-xl ${currentCfg.glowClass}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${currentCfg.textColor} bg-slate-950`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
            RISK STATUS & DECISION LOGIC
          </h3>
        </div>
        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded tracking-wide ${currentCfg.badgeBg}`}>
          {currentCfg.badge}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-3.5 space-y-3 font-mono flex-1 flex flex-col justify-between">
        
        {/* Risk State Display */}
        <div className={`rounded-lg p-3 bg-gradient-to-r ${currentCfg.bgGradient} border ${currentCfg.borderColor} flex items-center justify-between`}>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              EVALUATED ENCOUNTER RISK
            </div>
            <div className={`text-2xl font-black tracking-wide ${currentCfg.textColor}`}>
              {currentCfg.title}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-slate-700/50">
            <IconComponent className={`w-7 h-7 ${currentCfg.textColor}`} />
          </div>
        </div>

        {/* Transparent Reasons List */}
        <div className="space-y-1.5 bg-slate-950/70 rounded-lg p-3 border border-slate-800 flex-1">
          <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Decision Rationale / Trigger Conditions:</span>
          </div>

          <ul className="space-y-1.5 pt-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-xs flex items-start gap-2 text-slate-300">
                <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${currentCfg.textColor}`} />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Engine Transparency Footer */}
        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
          <span>Engine: Multi-Param Geodesic Decision Matrix</span>
          <span className="text-slate-400 font-bold">Latency: &lt;1ms</span>
        </div>

      </div>
    </div>
  );
}
