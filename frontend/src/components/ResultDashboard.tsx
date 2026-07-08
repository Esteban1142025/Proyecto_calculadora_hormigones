import React from 'react';
import type { CalculatorResults } from '../utils/calculator';

interface ResultDashboardProps {
  results: CalculatorResults | null;
  isValid: boolean;
  missingFields?: string[];
  onDownloadPDF?: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ results, isValid, missingFields = [], onDownloadPDF }) => {
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
          <span>ACI_211.1_SISTEMA</span>
          <span className="flex items-center gap-2">
            ESTADO: {isValid ? "LISTO" : "ERR_ENTRADA"} <span className="w-2 h-2 rounded-full bg-[#1a2421] opacity-50 animate-pulse"></span>
          </span>
        </div>

        {!isValid || !results ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl md:text-3xl tracking-widest text-center opacity-90 blinking-cursor">
              ESPERANDO_DATOS
            </div>
            <div className="text-[10px] md:text-xs mt-3 opacity-60 uppercase tracking-widest">
              Ingrese los parámetros válidos a continuación
            </div>
            {missingFields.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1 max-w-xs">
                {missingFields.map(field => (
                  <span key={field} className="text-[9px] md:text-[10px] bg-[#1a2421]/40 border border-[#1a2421]/30 rounded px-2 py-0.5 uppercase tracking-wide opacity-80">
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 text-[10px] opacity-50 uppercase tracking-widest blinking-cursor">CÁLCULO_COMPLETO</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs md:text-sm mt-4">
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">{results.pozzolan > 0 ? 'CEMENTO NETO' : 'CEMENTO'}</span>
                <span className="font-bold text-base">{results.cementNet} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">AGUA</span>
                <span className="font-bold text-base">{results.h2oCorr} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
              {results.pozzolan > 0 && (
                <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                  <span className="opacity-80">PUZOLANA</span>
                  <span className="font-bold text-base">{results.pozzolan} <span className="text-[10px] opacity-70">kg</span></span>
                </div>
              )}
              <div className="flex justify-between border-b border-[#1a2421]/20 pb-1">
                <span className="opacity-80">ÁR. FINO</span>
                <span className="font-bold text-base">{results.afCorr} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
              <div className={`flex justify-between border-b border-[#1a2421]/20 pb-1 ${results.pozzolan > 0 ? 'col-span-2' : ''}`}>
                <span className="opacity-80">ÁR. GRUESO</span>
                <span className="font-bold text-base">{results.agCorr} <span className="text-[10px] opacity-70">kg</span></span>
              </div>
            </div>

            <div className="mt-4 bg-[#8b9580] p-2 rounded border border-[#1a2421]/10">
              <div className="text-[10px] opacity-70 uppercase mb-1 flex justify-between">
                <span>Proporción [ C : AF : AG : A ]</span>
                <span>PROPORC. EN MASA</span>
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
              <span>a/c: <b className="text-sm">{results.wcr}</b></span>
              <span>f'cr: <b className="text-sm">{results.fcr}</b> MPa</span>
              <span>Aire: <b className="text-sm">{results.air}</b>%</span>
              <span>Peso fresco: <b className="text-sm">{results.ph}</b> kg/m³</span>
            </div>
          </div>
        )}
      </div>

      {isValid && results && onDownloadPDF && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 bg-[#2c3e50] hover:bg-[#34495e] border border-[#4b6584] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar Reporte PDF
          </button>
        </div>
      )}
    </div>
  );
};
