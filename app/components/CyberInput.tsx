"use client";

interface CyberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "url";
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export function CyberInput({ 
  value, 
  onChange, 
  placeholder = "", 
  type = "text", 
  disabled = false,
  className = "",
  multiline = false,
  rows = 3
}: CyberInputProps) {
  const baseStyles = `
    px-3 py-2 rounded-lg bg-cyber-bg-secondary border border-gray-600
    text-white placeholder-gray-400 focus:border-cyber-blue-primary
    focus:ring-2 focus:ring-cyber-blue-primary focus:ring-opacity-50
    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={baseStyles}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={baseStyles}
    />
  );
}
