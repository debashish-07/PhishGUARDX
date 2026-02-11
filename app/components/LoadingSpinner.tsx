"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-cyber-bg-secondary rounded-full" />
        
        {/* Animated ring */}
        <div className="absolute inset-0 border-2 border-transparent border-t-cyber-blue-primary border-r-cyber-purple-primary rounded-full animate-spin" />
        
        {/* Inner glow */}
        <div className="absolute inset-1 border border-transparent border-t-cyber-teal-primary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyber-blue-primary rounded-full animate-pulse" />
      </div>
    </div>
  );
}

interface CyberLoaderProps {
  message?: string;
  className?: string;
}

export function CyberLoader({ message = "Loading...", className = "" }: CyberLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <LoadingSpinner size="lg" />
      <div className="text-center">
        <p className="text-cyber-blue-primary font-medium glow-text">{message}</p>
        <div className="mt-2 w-32 h-1 bg-cyber-bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyber-blue-primary to-cyber-purple-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
