import React from 'react';
import type { CalculatorResults } from '../utils/calculator';

interface ResultDashboardProps {
  results: CalculatorResults | null;
  isValid: boolean;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ results, isValid }) => {
  return (
    <div className="mb-6">
      {/* Solar Panel decoration */}
      <div className="flex justify-end mb-2 pr-2">
        <div className="w-24 h-6 bg-[#2a1715] border border-[#000] rounded-sm flex gap-[1px] p-[1px] opacity-80 shadow-inner">
          <div className="flex-1 bg-[#4a2e2b]"></div>
          <div className="flex-1 bg-[#4a2e2b]"></div>
          <div className="flex-1 bg-[#4a2e2b]"></div>
          <div className="flex-1 bg-[#4a2e2b]"></div>
        </div>
      </div>

      {/* Main LCD Screen */}
      <div className="lcd-screen rounded-lg p-4 md:p-6 flex flex-col justify-between h-64 border-[6px] border-[#6b7662]">
        <div className="flex justify-between items-start text-[10px] md:text-xs uppercase tracking-widest opacity-70 mb-2">
          <span>ACI_211.1_SYSTEM</span>
          <span className="flex items-center gap-2">
            STATUS: {isValid ? "READY" : "ERR_INPUT"} <span className="w-2 h-2 rounded-full bg-[#1a2421] opacity-50 animate-pulse"></span>
          </span>
        </div>

        {!isValid || !results ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl md:text-3xl tracking-widest text-center opacity-90 blinking-cursor">
              AWAITING_DATA
            </div>
            <div className="text-[10px] md:text-xs mt-3 opacity-60 uppercase tracking-widest">
              Please enter valid parameters below
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 text-[10px] opacity-50 uppercase tracking-widest blinking-cursor">CALC_COMPLETE</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs md:text-sm mt-4">
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">CEMENT</span>
                <span className="font-bold text-base">{results.cement} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">WATER</span>
                <span className="font-bold text-base">{results.h2oCorr} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">FINE_AGG</span>
                <span className="font-bold text-base">{results.afCorr} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">COARSE_AGG</span>
                <span className="font-bold text-base">{results.agCorr} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
            </div>

            <div className="mt-4 bg-[#8b9580] p-2 rounded border border-[#1a2421]/10">
              <div className="text-[10px] opacity-70 uppercase mb-1 flex justify-between">
                <span>Ratio [ C : AF : AG : W ]</span>
                <span>VOL_PROPORTION</span>
              </div>
              <div className="text-xl md:text-3xl font-bold tracking-widest flex justify-between items-center px-2">
                <span>1</span>
                <span className="opacity-40 text-lg">:</span>
                <span>{results.caf}</span>
                <span className="opacity-40 text-lg">:</span>
                <span>{results.cag}</span>
                <span className="opacity-40 text-lg">:</span>
                <span>{results.ch2o}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] md:text-xs mt-3 pt-2 border-t border-[#1a2421]/30 opacity-80">
              <span>W/C: <b className="text-sm">{results.wcr}</b></span>
              <span>f'cr: <b className="text-sm">{results.fcr}</b> MPa</span>
              <span>Air: <b className="text-sm">{results.air}</b>%</span>
              <span>Wt: <b className="text-sm">{results.ph}</b> kg/m³</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
