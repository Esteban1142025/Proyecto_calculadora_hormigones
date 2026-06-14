import { useState, useMemo } from 'react';
import { InputField, SelectField } from './components/InputField';
import { ResultDashboard } from './components/ResultDashboard';
import { calculateMixDesign, type CalculatorInputs, type TMN } from './utils/calculator';
import { Settings } from 'lucide-react';

function App() {
  const [concrete, setConcrete] = useState<CalculatorInputs['concrete']>({
    fcrType: 'E',
    fc: 21,
    s: 0,
    dataCount: 0,
    fcrInput: 0,
    slumpCm: 10,
    hasAir: false,
    exposure: 1,
    freezeThaw: false,
  });

  const [cement, setCement] = useState<CalculatorInputs['cement']>({
    pec: 3150,
  });

  const [fineAggregate, setFineAggregate] = useState<CalculatorInputs['fineAggregate']>({
    peaf: 2600,
    haf: 5,
    absaf: 2,
    mf: 2.8,
  });

  const [coarseAggregate, setCoarseAggregate] = useState<CalculatorInputs['coarseAggregate']>({
    peag: 2650,
    hag: 2,
    absag: 1,
    tmn: '1',
    puc: 1600,
  });

  // Validation
  const isValid = useMemo(() => {
    if (concrete.fc < 0 || concrete.s < 0 || concrete.dataCount < 0 || concrete.fcrInput < 0 || concrete.slumpCm <= 0) return false;
    if (cement.pec <= 0) return false;
    if (fineAggregate.peaf <= 0 || fineAggregate.haf < 0 || fineAggregate.absaf < 0 || fineAggregate.mf < 0) return false;
    if (coarseAggregate.peag <= 0 || coarseAggregate.hag < 0 || coarseAggregate.absag < 0 || coarseAggregate.puc <= 0) return false;
    return true;
  }, [concrete, cement, fineAggregate, coarseAggregate]);

  const results = useMemo(() => {
    if (!isValid) return null;
    return calculateMixDesign({ concrete, cement, fineAggregate, coarseAggregate });
  }, [concrete, cement, fineAggregate, coarseAggregate, isValid]);

  const [activeTab, setActiveTab] = useState<'concrete' | 'cement' | 'fine' | 'coarse'>('concrete');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      {/* Calculator Device Container */}
      <div className="calc-body w-full max-w-2xl p-4 md:p-8 flex flex-col relative overflow-hidden border border-[#4b6584]">
        
        {/* Brand / Logo Area */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-white text-lg md:text-xl font-bold italic tracking-wider opacity-80">
            HORMIGÓN<span className="text-blue-400">CALC</span> 211
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-3 bg-[#1a252f] rounded shadow-inner border border-[#0f172a]"></div>
            <div className="w-10 h-3 bg-[#1a252f] rounded shadow-inner border border-[#0f172a]"></div>
          </div>
        </div>

        {/* Screen */}
        <ResultDashboard results={results} isValid={isValid} />

        {/* Brand Bar */}
        <div className="flex justify-between items-end mb-4 border-b border-[#34495e] pb-2">
          <div className="text-xs text-slate-400 uppercase tracking-widest">Parámetros de Entrada</div>
          <Settings className="w-4 h-4 text-slate-500" />
        </div>

        {/* Keypad / Tabs Area */}
        <div className="flex flex-col gap-4">
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton active={activeTab === 'concrete'} onClick={() => setActiveTab('concrete')}>Hormigón</TabButton>
            <TabButton active={activeTab === 'cement'} onClick={() => setActiveTab('cement')}>Cemento</TabButton>
            <TabButton active={activeTab === 'fine'} onClick={() => setActiveTab('fine')}>Árido Fino</TabButton>
            <TabButton active={activeTab === 'coarse'} onClick={() => setActiveTab('coarse')}>Árido Grueso</TabButton>
          </div>

          <div className="bg-[#1a252f] p-4 rounded-lg shadow-inner border border-[#0f172a]">
            {activeTab === 'concrete' && (
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Tipo de Resistencia"
                  value={concrete.fcrType}
                  onChange={e => setConcrete({...concrete, fcrType: e.target.value as 'E' | 'R'})}
                  tooltip="Especificada (f'c) o Requerida (f'cr)."
                >
                  <option value="E">Especificada (E)</option>
                  <option value="R">Requerida (R)</option>
                </SelectField>

                {concrete.fcrType === 'E' ? (
                  <>
                    <InputField
                      type="number"
                      label="f'c (MPa)"
                      value={concrete.fc}
                      onChange={e => setConcrete({...concrete, fc: parseFloat(e.target.value) || 0})}
                      error={concrete.fc < 0 ? "Err" : undefined}
                      min="0"
                    />
                    <InputField
                      type="number"
                      label="Desviación Estándar (s)"
                      value={concrete.s}
                      onChange={e => setConcrete({...concrete, s: parseFloat(e.target.value) || 0})}
                      error={concrete.s < 0 ? "Err" : undefined}
                      min="0"
                    />
                    {concrete.s > 0 && (
                      <InputField
                        type="number"
                        label="Número de Datos"
                        value={concrete.dataCount}
                        onChange={e => setConcrete({...concrete, dataCount: parseInt(e.target.value) || 0})}
                        error={concrete.dataCount < 0 ? "Err" : undefined}
                        min="0"
                      />
                    )}
                  </>
                ) : (
                  <InputField
                    type="number"
                    label="f'cr (MPa)"
                    value={concrete.fcrInput}
                    onChange={e => setConcrete({...concrete, fcrInput: parseFloat(e.target.value) || 0})}
                    error={concrete.fcrInput < 0 ? "Err" : undefined}
                    min="0"
                  />
                )}

                <InputField
                  type="number"
                  label="Asentamiento / Slump (cm)"
                  value={concrete.slumpCm}
                  onChange={e => setConcrete({...concrete, slumpCm: parseFloat(e.target.value) || 0})}
                  error={concrete.slumpCm <= 0 ? "Err" : undefined}
                  min="0.1"
                />

                <SelectField
                  label="Aire"
                  value={concrete.hasAir ? "S" : "N"}
                  onChange={e => setConcrete({...concrete, hasAir: e.target.value === "S"})}
                >
                  <option value="N">No</option>
                  <option value="S">Sí</option>
                </SelectField>

                {concrete.hasAir && (
                  <SelectField
                    label="Exposición"
                    value={concrete.exposure}
                    onChange={e => setConcrete({...concrete, exposure: parseInt(e.target.value) as 0|1|2|3})}
                  >
                    <option value="1">Ligera</option>
                    <option value="2">Moderada</option>
                    <option value="3">Severa</option>
                  </SelectField>
                )}

                {concrete.hasAir && concrete.exposure === 3 && (
                  <SelectField
                    label="Congelamiento / Deshielo"
                    value={concrete.freezeThaw ? "S" : "N"}
                    onChange={e => setConcrete({...concrete, freezeThaw: e.target.value === "S"})}
                  >
                    <option value="N">No</option>
                    <option value="S">Sí</option>
                  </SelectField>
                )}
              </div>
            )}

            {activeTab === 'cement' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  label="Peso Específico (kg/m³)"
                  value={cement.pec}
                  onChange={e => setCement({...cement, pec: parseFloat(e.target.value) || 0})}
                  error={cement.pec <= 0 ? "Err" : undefined}
                />
              </div>
            )}

            {activeTab === 'fine' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  label="Peso Específico"
                  value={fineAggregate.peaf}
                  onChange={e => setFineAggregate({...fineAggregate, peaf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.peaf <= 0 ? "Err" : undefined}
                />
                <InputField
                  type="number"
                  label="Humedad (%)"
                  value={fineAggregate.haf}
                  onChange={e => setFineAggregate({...fineAggregate, haf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.haf < 0 ? "Err" : undefined}
                />
                <InputField
                  type="number"
                  label="Absorción (%)"
                  value={fineAggregate.absaf}
                  onChange={e => setFineAggregate({...fineAggregate, absaf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.absaf < 0 ? "Err" : undefined}
                />
                <InputField
                  type="number"
                  label="Módulo de Finura"
                  value={fineAggregate.mf}
                  onChange={e => setFineAggregate({...fineAggregate, mf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.mf < 0 ? "Err" : undefined}
                />
              </div>
            )}

            {activeTab === 'coarse' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  label="Peso Específico"
                  value={coarseAggregate.peag}
                  onChange={e => setCoarseAggregate({...coarseAggregate, peag: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.peag <= 0 ? "Err" : undefined}
                />
                <InputField
                  type="number"
                  label="Humedad (%)"
                  value={coarseAggregate.hag}
                  onChange={e => setCoarseAggregate({...coarseAggregate, hag: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.hag < 0 ? "Err" : undefined}
                />
                <InputField
                  type="number"
                  label="Absorción (%)"
                  value={coarseAggregate.absag}
                  onChange={e => setCoarseAggregate({...coarseAggregate, absag: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.absag < 0 ? "Err" : undefined}
                />
                <SelectField
                  label="Tam. Máximo Nominal"
                  value={coarseAggregate.tmn}
                  onChange={e => setCoarseAggregate({...coarseAggregate, tmn: e.target.value as TMN})}
                >
                  <option value="3/8">3/8"</option>
                  <option value="1/2">1/2"</option>
                  <option value="3/4">3/4"</option>
                  <option value="1">1"</option>
                  <option value="1 1/2">1 1/2"</option>
                  <option value="2">2"</option>
                  <option value="3">3"</option>
                  <option value="6">6"</option>
                </SelectField>
                <InputField
                  type="number"
                  label="Peso Unit. Compactado (kg/m³)"
                  value={coarseAggregate.puc}
                  onChange={e => setCoarseAggregate({...coarseAggregate, puc: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.puc <= 0 ? "Err" : undefined}
                />
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`tactile-tab px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded border-b-4 transition-all ${
        active 
          ? "bg-[#34495e] text-white border-blue-500 shadow-inner translate-y-1" 
          : "bg-[#2c3e50] text-slate-400 border-[#1a252f] hover:bg-[#3d566e] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default App;
