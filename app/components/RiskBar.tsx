"use client";

interface RiskBarProps {
  score: number; // 0-100
  label?: string;
  className?: string;
}

export function RiskBar({ score, label, className = "" }: RiskBarProps) {
  const getRiskColor = (s: number) => {
    if (s < 30) return "from-cyber-teal-primary to-cyber-teal-secondary";
    if (s < 60) return "from-cyber-warning-primary to-cyber-warning-secondary";
    return "from-cyber-danger-primary to-cyber-danger-secondary";
  };

  const getRiskGlow = (s: number) => {
    if (s < 30) return "shadow-teal-glow";
    if (s < 60) return "shadow-yellow-500/30";
    return "shadow-danger-glow";
  };

  const getRiskLabel = (s: number) => {
    if (s < 30) return "Low Risk";
    if (s < 60) return "Medium Risk";
    return "High Risk";
  };

  const getRiskTextColor = (s: number) => {
    if (s < 30) return "text-cyber-teal-primary";
    if (s < 60) return "text-cyber-warning-primary";
    return "text-cyber-danger-primary";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-300">{label || "Risk Score"}</span>
        <span className={`font-bold text-lg glow-text ${getRiskTextColor(score)}`}>
          {score}/100 - {getRiskLabel(score)}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-cyber-bg-secondary rounded-full h-4 border border-gray-600 overflow-hidden">
          <div
            className={`h-4 rounded-full bg-gradient-to-r ${getRiskColor(score)} transition-all duration-1000 ease-out relative ${getRiskGlow(score)}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          >
            {/* Scan line effect for high risk */}
            {score >= 60 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            )}
          </div>
        </div>
        
        {/* Glow effect overlay */}
        <div 
          className={`absolute top-0 h-4 rounded-full bg-gradient-to-r ${getRiskColor(score)} opacity-50 blur-sm`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}