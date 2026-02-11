"use client";

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CyberButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary", 
  size = "md",
  className = "" 
}: CyberButtonProps) {
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-cyber-blue-primary to-cyber-purple-primary border-cyber-blue-primary shadow-cyber";
      case "secondary":
        return "bg-gradient-to-r from-cyber-bg-secondary to-cyber-bg-tertiary border-gray-600 hover:border-cyber-blue-primary";
      case "danger":
        return "bg-gradient-to-r from-cyber-danger-primary to-cyber-danger-secondary border-cyber-danger-primary shadow-danger-glow";
      case "success":
        return "bg-gradient-to-r from-cyber-teal-primary to-cyber-teal-secondary border-cyber-teal-primary shadow-teal-glow";
      default:
        return "bg-gradient-to-r from-cyber-blue-primary to-cyber-purple-primary border-cyber-blue-primary shadow-cyber";
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case "sm":
        return "px-3 py-1 text-sm";
      case "md":
        return "px-4 py-2 text-base";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2 text-base";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantStyles(variant)}
        ${getSizeStyles(size)}
        rounded-lg font-medium text-white border transition-all duration-300
        hover:shadow-lg hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
        ${className}
      `}
    >
      {children}
    </button>
  );
}
