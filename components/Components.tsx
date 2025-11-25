import React from 'react';
import { Loader2 } from 'lucide-react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`glass-card rounded-2xl p-4 md:p-6 text-white ${className}`}>
    {children}
  </div>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-bold mb-4 text-white/90 flex items-center gap-2">
    {children}
  </h2>
);

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = "Exploring..." }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-900/80 backdrop-blur-md">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
      <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
    </div>
    <p className="mt-4 text-lg font-medium text-white/90 animate-pulse">{message}</p>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'glass' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-indigo-500/30",
    secondary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20",
    glass: "glass-panel hover:bg-white/20 text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
