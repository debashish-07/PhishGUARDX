"use client";

interface AnalysisCardProps {
  title: string;
  score: number;
  url: string;
  timestamp: number;
  details?: any;
  className?: string;
}

export function AnalysisCard({ 
  title, 
  score, 
  url, 
  timestamp, 
  details,
  className = "" 
}: AnalysisCardProps) {
  const getScoreColor = (s: number) => {
    if (s < 30) return "text-cyber-teal-primary";
    if (s < 60) return "text-cyber-warning-primary";
    return "text-cyber-danger-primary";
  };

  const getBorderColor = (s: number) => {
    if (s < 30) return "border-cyber-teal-primary/30";
    if (s < 60) return "border-cyber-warning-primary/30";
    return "border-cyber-danger-primary/30";
  };

  return (
    <div className={`glass rounded-xl p-4 border ${getBorderColor(score)} hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-200">{title}</h3>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-mono text-gray-300 truncate" title={url}>
          {url}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(timestamp).toLocaleString()}
        </div>
        
        {/* Risk bar */}
        <div className="w-full bg-cyber-bg-secondary rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              score < 30 ? "bg-gradient-to-r from-cyber-teal-primary to-cyber-teal-secondary" :
              score < 60 ? "bg-gradient-to-r from-cyber-warning-primary to-cyber-warning-secondary" :
              "bg-gradient-to-r from-cyber-danger-primary to-cyber-danger-secondary"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        
        {details && (
          <div className="mt-3 text-xs text-gray-400">
            <div className="flex flex-wrap gap-1">
              {Object.entries(details).slice(0, 3).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-cyber-bg-secondary rounded text-gray-300">
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
