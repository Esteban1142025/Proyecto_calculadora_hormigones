import React from 'react';
import { Info, Plus, Minus } from 'lucide-react';
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
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 text-center border border-slate-700">
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

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  tooltip?: string;
  error?: string;
  value: number;
  onChange: (value: number) => void;
  allowDecimals?: boolean;
  step?: number;
  tooltipWidth?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({ 
  label, 
  tooltip, 
  error, 
  className, 
  value, 
  onChange, 
  allowDecimals = true,
  step = 1,
  min,
  max,
  disabled,
  tooltipWidth = 'w-48',
  ...props 
}) => {
  const [touched, setTouched] = React.useState(false);
  const minValue = min !== undefined ? parseFloat(min.toString()) : undefined;
  const maxValue = max !== undefined ? parseFloat(max.toString()) : undefined;

  const handleIncrement = () => {
    setTouched(true);
    const newValue = value + step;
    if (maxValue !== undefined && newValue > maxValue) return;
    if (minValue !== undefined && newValue < minValue) return;
    onChange(newValue);
  };

  const handleDecrement = () => {
    setTouched(true);
    const newValue = value - step;
    if (minValue !== undefined && newValue < minValue) return;
    if (maxValue !== undefined && newValue > maxValue) return;
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    const inputValue = e.target.value;
    if (inputValue === '' || inputValue === '-') {
      return;
    }
    
    const numValue = allowDecimals ? parseFloat(inputValue) : parseInt(inputValue, 10);
    
    if (isNaN(numValue)) return;
    
    if (minValue !== undefined && numValue < minValue) return;
    if (maxValue !== undefined && numValue > maxValue) return;
    
    onChange(numValue);
  };

  const handleBlur = () => {
    setTouched(true);
    if (minValue !== undefined && value < minValue) {
      onChange(minValue);
    }
  };

  const shouldShowError = touched && error;

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <div className="flex items-center gap-1">
        <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>
        {tooltip && (
          <div className="group relative flex items-center justify-center">
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
            <div className={`absolute right-0 top-full mt-2 hidden group-hover:block ${tooltipWidth} p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 text-center border border-slate-700`}>
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (minValue !== undefined && value <= minValue)}
          className="px-2 py-2 bg-[#2c3e50] border-2 border-[#1a252f] hover:border-[#4b6584] text-white font-mono rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          step={allowDecimals ? 'any' : '1'}
          min={min}
          max={max}
          className={cn(
            "flex-1 px-3 py-2 bg-[#2c3e50] border-2 shadow-inner text-white font-mono rounded outline-none transition-colors",
            shouldShowError ? "border-red-500 focus:border-red-400" : "border-[#1a252f] focus:border-[#4b6584]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          {...props}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (maxValue !== undefined && value >= maxValue)}
          className="px-2 py-2 bg-[#2c3e50] border-2 border-[#1a252f] hover:border-[#4b6584] text-white font-mono rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {shouldShowError && <span className="text-[10px] text-red-400 font-bold">{error}</span>}
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
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl z-10 text-center border border-slate-700">
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
