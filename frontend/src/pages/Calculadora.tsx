import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, BookOpen, LogOut } from 'lucide-react';
import { InputField, SelectField } from '../components/InputField';
import { ResultDashboard } from '../components/ResultDashboard';
import { ConsultasPanel } from '../components/ConsultasPanel';
import { useAuth } from '../context/AuthContext';
import { dbToInputsFormat } from '../api/client';
import { calculateMixDesign, type CalculatorInputs, type TMN } from '../utils/calculator';

export function Calculadora() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);

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

  // Validación
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (concrete.fcrType === 'E') {
      if (concrete.fc < 0) missing.push("f'c (MPa)");
      if (concrete.s < 0) missing.push('Desviación Estándar');
      if (concrete.dataCount < 0) missing.push('Número de Ensayos');
    } else {
      if (concrete.fcrInput <= 0) missing.push("f'cr (MPa)");
    }
    if (concrete.slumpCm <= 0) missing.push('Asentamiento / Slump');
    if (cement.pec <= 0) missing.push('Peso Específico del Cemento');
    if (fineAggregate.peaf <= 0) missing.push('Peso Específico Árido Fino');
    if (fineAggregate.haf < 0) missing.push('Humedad Árido Fino');
    if (fineAggregate.absaf < 0) missing.push('Absorción Árido Fino');
    if (fineAggregate.mf < 0) missing.push('Módulo de Finura');
    if (coarseAggregate.peag <= 0) missing.push('Peso Específico Árido Grueso');
    if (coarseAggregate.hag < 0) missing.push('Humedad Árido Grueso');
    if (coarseAggregate.absag < 0) missing.push('Absorción Árido Grueso');
    if (coarseAggregate.puc <= 0) missing.push('Peso Unitario Compactado');
    return missing;
  }, [concrete, cement, fineAggregate, coarseAggregate]);

  const isValid = missingFields.length === 0;

  const results = useMemo(() => {
    if (!isValid) return null;
    return calculateMixDesign({ concrete, cement, fineAggregate, coarseAggregate });
  }, [concrete, cement, fineAggregate, coarseAggregate, isValid]);

  const [activeTab, setActiveTab] = useState<'concrete' | 'cement' | 'fine' | 'coarse'>('concrete');

  // Carga una consulta guardada en todos los campos
  function handleCargarConsulta(data: ReturnType<typeof dbToInputsFormat>) {
    setConcrete(data.concrete);
    setCement(data.cement);
    setFineAggregate(data.fineAggregate);
    setCoarseAggregate(data.coarseAggregate);
    setActiveTab('concrete');
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      <ConsultasPanel
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        concrete={concrete}
        cement={cement}
        fineAggregate={fineAggregate}
        coarseAggregate={coarseAggregate}
        onCargar={handleCargarConsulta}
      />

      {/* Calculator Device Container */}
      <div className="calc-body w-full max-w-2xl p-4 md:p-8 flex flex-col relative overflow-hidden border border-[#4b6584]">

        {/* Brand / Logo Area */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-white text-lg md:text-xl font-bold italic tracking-wider opacity-80">
            HORMIGÓN<span className="text-blue-400">CALC</span> 211
          </div>
          <div className="flex items-center gap-2">
            {/* Botón mis consultas */}
            <button
              onClick={() => setShowPanel(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#34495e]
                bg-[#1a252f] hover:bg-[#2c3e50] text-slate-300 hover:text-white
                text-[10px] uppercase tracking-wider font-bold transition-colors"
              title="Mis consultas guardadas"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mis consultas</span>
            </button>

            {/* Usuario + logout */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#34495e]">
              <span className="text-[10px] text-slate-400 hidden sm:block max-w-[100px] truncate">
                {usuario?.nombre}
              </span>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-1 ml-1">
              <div className="w-8 h-3 bg-[#1a252f] rounded shadow-inner border border-[#0f172a]"></div>
              <div className="w-8 h-3 bg-[#1a252f] rounded shadow-inner border border-[#0f172a]"></div>
            </div>
          </div>
        </div>

        {/* Screen */}
        <ResultDashboard results={results} isValid={isValid} missingFields={missingFields} />

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
                  tooltip="Especificada (E): se calcula el f'cr a partir del f'c del proyecto. Requerida (R): ingresas directamente el f'cr de diseño."
                >
                  <option value="E">Especificada (E)</option>
                  <option value="R">Requerida (R)</option>
                </SelectField>

                {concrete.fcrType === 'E' ? (
                  <>
                    <InputField
                      type="number"
                      label="f'c (MPa)"
                      tooltip="Resistencia especificada a la compresión del hormigón a 28 días, indicada en el proyecto estructural."
                      value={concrete.fc}
                      onChange={e => setConcrete({...concrete, fc: parseFloat(e.target.value) || 0})}
                      error={concrete.fc < 0 ? "Error" : undefined}
                      min="0"
                    />
                    <InputField
                      type="number"
                      label="Desviación Estándar (s)"
                      tooltip="Variabilidad estadística obtenida de ensayos de resistencia previos con el mismo tipo de hormigón. Ingresa 0 si no tienes registros."
                      value={concrete.s}
                      onChange={e => setConcrete({...concrete, s: parseFloat(e.target.value) || 0})}
                      error={concrete.s < 0 ? "Error" : undefined}
                      min="0"
                    />
                    {concrete.s > 0 && (
                      <InputField
                        type="number"
                        label="Número de Ensayos"
                        tooltip="Cantidad de ensayos de compresión que respaldan la desviación estándar ingresada. Con menos de 15 ensayos, el ACI 211.1 ignora la desviación estándar."
                        value={concrete.dataCount}
                        onChange={e => setConcrete({...concrete, dataCount: parseInt(e.target.value) || 0})}
                        error={concrete.dataCount < 0 ? "Error" : undefined}
                        min="0"
                      />
                    )}
                  </>
                ) : (
                  <InputField
                    type="number"
                    label="f'cr (MPa)"
                    tooltip="Resistencia requerida de diseño: ya incluye el margen de seguridad sobre el f'c. Se usa cuando el proyectista la define directamente."
                    value={concrete.fcrInput}
                    onChange={e => setConcrete({...concrete, fcrInput: parseFloat(e.target.value) || 0})}
                    error={concrete.fcrInput < 0 ? "Error" : undefined}
                    min="0"
                  />
                )}

                <InputField
                  type="number"
                  label="Asentamiento / Slump (cm)"
                  tooltip="Medida de la trabajabilidad del hormigón fresco. Mayor valor indica mezcla más fluida. Rango típico: 5–15 cm."
                  value={concrete.slumpCm}
                  onChange={e => setConcrete({...concrete, slumpCm: parseFloat(e.target.value) || 0})}
                  error={concrete.slumpCm <= 0 ? "Error" : undefined}
                  min="0.1"
                />

                <SelectField
                  label="Aire Incorporado"
                  value={concrete.hasAir ? "S" : "N"}
                  onChange={e => setConcrete({...concrete, hasAir: e.target.value === "S"})}
                  tooltip="Indica si la mezcla usa un aditivo incorporador de aire para mejorar la durabilidad ante ciclos de hielo-deshielo."
                >
                  <option value="N">No</option>
                  <option value="S">Sí</option>
                </SelectField>

                {concrete.hasAir && (
                  <SelectField
                    label="Nivel de Exposición Ambiental"
                    value={concrete.exposure}
                    onChange={e => setConcrete({...concrete, exposure: parseInt(e.target.value) as 0|1|2|3})}
                    tooltip="Condición ambiental a la que estará expuesto el hormigón. Define el contenido mínimo de aire requerido por ACI 211.1."
                  >
                    <option value="1">Ligera</option>
                    <option value="2">Moderada</option>
                    <option value="3">Severa</option>
                  </SelectField>
                )}

                {concrete.hasAir && concrete.exposure === 3 && (
                  <SelectField
                    label="Exposición a Congelamiento / Deshielo"
                    value={concrete.freezeThaw ? "S" : "N"}
                    onChange={e => setConcrete({...concrete, freezeThaw: e.target.value === "S"})}
                    tooltip="Indica si el hormigón estará sometido a ciclos repetidos de congelamiento y deshielo, lo que limita la relación agua/cemento máxima a 0.45."
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
                  tooltip="Densidad del cemento. Valor típico para cemento Portland: 3150 kg/m³."
                  value={cement.pec}
                  onChange={e => setCement({...cement, pec: parseFloat(e.target.value) || 0})}
                  error={cement.pec <= 0 ? "Error" : undefined}
                />
              </div>
            )}

            {activeTab === 'fine' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  label="Peso Específico (kg/m³)"
                  tooltip="Densidad de las partículas del árido fino, obtenida en laboratorio. Valor típico: 2600 kg/m³."
                  value={fineAggregate.peaf}
                  onChange={e => setFineAggregate({...fineAggregate, peaf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.peaf <= 0 ? "Error" : undefined}
                />
                <InputField
                  type="number"
                  label="Humedad Superficial (%)"
                  tooltip="Porcentaje de agua libre en la superficie de las partículas, medida en el árido tal como llega a obra. Puede ser positiva (húmedo) o cero (seco)."
                  value={fineAggregate.haf}
                  onChange={e => setFineAggregate({...fineAggregate, haf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.haf < 0 ? "Error" : undefined}
                />
                <InputField
                  type="number"
                  label="Absorción de Agua (%)"
                  tooltip="Porcentaje de agua que el árido puede absorber hasta saturarse. Se obtiene en laboratorio y se usa para corregir el agua de la mezcla."
                  value={fineAggregate.absaf}
                  onChange={e => setFineAggregate({...fineAggregate, absaf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.absaf < 0 ? "Error" : undefined}
                />
                <InputField
                  type="number"
                  label="Módulo de Finura"
                  tooltip="Índice de granulometría del árido fino. Valor entre 2.3 y 3.1. A mayor valor, arena más gruesa. Se calcula sumando los porcentajes retenidos acumulados en tamices normalizados y dividiendo por 100."
                  value={fineAggregate.mf}
                  onChange={e => setFineAggregate({...fineAggregate, mf: parseFloat(e.target.value) || 0})}
                  error={fineAggregate.mf < 0 ? "Error" : undefined}
                />
              </div>
            )}

            {activeTab === 'coarse' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  label="Peso Específico (kg/m³)"
                  tooltip="Densidad de las partículas del árido grueso, obtenida en laboratorio. Valor típico: 2650 kg/m³."
                  value={coarseAggregate.peag}
                  onChange={e => setCoarseAggregate({...coarseAggregate, peag: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.peag <= 0 ? "Error" : undefined}
                />
                <InputField
                  type="number"
                  label="Humedad Superficial (%)"
                  tooltip="Porcentaje de agua libre en la superficie de las partículas, medida en el árido tal como llega a obra."
                  value={coarseAggregate.hag}
                  onChange={e => setCoarseAggregate({...coarseAggregate, hag: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.hag < 0 ? "Error" : undefined}
                />
                <InputField
                  type="number"
                  label="Absorción de Agua (%)"
                  tooltip="Porcentaje de agua que el árido puede absorber hasta saturarse. Se obtiene en laboratorio."
                  value={coarseAggregate.absag}
                  onChange={e => setCoarseAggregate({...coarseAggregate, absag: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.absag < 0 ? "Error" : undefined}
                />
                <SelectField
                  label="Tamaño Máximo Nominal"
                  value={coarseAggregate.tmn}
                  onChange={e => setCoarseAggregate({...coarseAggregate, tmn: e.target.value as TMN})}
                  tooltip="Abertura del tamiz inmediatamente superior al que retiene más del 15% del árido grueso. Dato del análisis granulométrico."
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
                  label="Peso Unitario Compactado (kg/m³)"
                  tooltip="Masa del árido grueso por unidad de volumen, compactado con varilla según norma. Se usa para calcular el volumen de árido grueso por m³ de hormigón."
                  value={coarseAggregate.puc}
                  onChange={e => setCoarseAggregate({...coarseAggregate, puc: parseFloat(e.target.value) || 0})}
                  error={coarseAggregate.puc <= 0 ? "Error" : undefined}
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
