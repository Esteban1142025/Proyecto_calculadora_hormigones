import React from 'react';
import { Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  tooltip?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, tooltip, error, className, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <div className="flex items-center gap-1">
        <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>
        {tooltip && (
          <div className="group relative flex items-center justify-center">
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 text-center border border-slate-700">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <input
        className={cn(
          "px-3 py-2 bg-[#2c3e50] border-2 shadow-inner text-white font-mono rounded outline-none transition-colors",
          error ? "border-red-500 focus:border-red-400" : "border-[#1a252f] focus:border-[#4b6584]",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        {...props}
      />
      {error && <span className="text-[10px] text-red-400 font-bold">{error}</span>}
    </div>
  );
};

export const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, tooltip?: string, error?: string }> = ({ label, tooltip, error, className, children, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <div className="flex items-center gap-1">
        <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>
        {tooltip && (
          <div className="group relative flex items-center justify-center">
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 text-center border border-slate-700">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <select
        className={cn(
          "px-3 py-2 bg-[#2c3e50] border-2 shadow-inner text-white font-mono rounded outline-none transition-colors",
          error ? "border-red-500 focus:border-red-400" : "border-[#1a252f] focus:border-[#4b6584]",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-[10px] text-red-400 font-bold">{error}</span>}
    </div>
  );
};
