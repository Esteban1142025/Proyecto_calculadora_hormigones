import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, BookOpen, LogOut } from 'lucide-react';
import { SelectField, NumberInput } from '../components/InputField';
import { ResultDashboard } from '../components/ResultDashboard';
import { ConsultasPanel } from '../components/ConsultasPanel';
import { useAuth } from '../context/AuthContext';
import { dbToInputsFormat } from '../api/client';
import { calculateMixDesign, type CalculatorInputs, type AdmixtureInputs, type TMN } from '../utils/calculator';

export function Calculadora() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);

  const [concrete, setConcrete] = useState<CalculatorInputs['concrete']>({
    fcrType: 'E',
    fc: 0,
    s: 0,
    dataCount: 0,
    fcrInput: 0,
    slumpCm: 0,
    hasAir: false,
    exposure: 1,
    freezeThaw: false,
  });

  const [cement, setCement] = useState<CalculatorInputs['cement']>({
    pec: 0,
  });

  const [fineAggregate, setFineAggregate] = useState<CalculatorInputs['fineAggregate']>({
    peaf: 0,
    haf: 0,
    absaf: 0,
    mf: 0,
  });

  const [coarseAggregate, setCoarseAggregate] = useState<CalculatorInputs['coarseAggregate']>({
    peag: 0,
    hag: 0,
    absag: 0,
    tmn: '1',
    puc: 0,
  });

  const [admixture, setAdmixture] = useState<AdmixtureInputs>({
    useWaterReducer: false,
    waterReductionPct: 0,
    usePozzolan: false,
    pozzolanReplacementPct: 0,
    pePozzolan: 0,
  });

  // Validación
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (concrete.fcrType === 'E') {
      if (concrete.fc < 15 || concrete.fc > 60) missing.push("f'c");
      if (concrete.s < 0 || concrete.s > 15) missing.push('Desv. Estándar');
      if (concrete.s > 0 && (concrete.dataCount < 1 || concrete.dataCount > 100)) missing.push('Nº Ensayos');
    } else {
      if (concrete.fcrInput < 15 || concrete.fcrInput > 80) missing.push("f'cr");
    }
    if (concrete.slumpCm < 2 || concrete.slumpCm > 25) missing.push('Asentamiento');
    if (cement.pec < 2000 || cement.pec > 3500) missing.push('P.E. Cemento');
    if (fineAggregate.peaf < 2000 || fineAggregate.peaf > 3200) missing.push('P.E. Árido Fino');
    if (fineAggregate.haf < 0 || fineAggregate.haf > 20) missing.push('Humedad A.F.');
    if (fineAggregate.absaf < 0 || fineAggregate.absaf > 15) missing.push('Absorción A.F.');
    if (fineAggregate.mf < 2 || fineAggregate.mf > 4) missing.push('Módulo Finura');
    if (coarseAggregate.peag < 2000 || coarseAggregate.peag > 3200) missing.push('P.E. Árido Grueso');
    if (coarseAggregate.hag < 0 || coarseAggregate.hag > 20) missing.push('Humedad A.G.');
    if (coarseAggregate.absag < 0 || coarseAggregate.absag > 15) missing.push('Absorción A.G.');
    if (coarseAggregate.puc < 1000 || coarseAggregate.puc > 2500) missing.push('P.U.C.');
    
    if (admixture.useWaterReducer && (admixture.waterReductionPct < 1 || admixture.waterReductionPct > 40)) missing.push('Reductor Agua');
    if (admixture.usePozzolan && (admixture.pozzolanReplacementPct < 1 || admixture.pozzolanReplacementPct > 50)) missing.push('% Puzolana');
    if (admixture.usePozzolan && (admixture.pePozzolan < 1000 || admixture.pePozzolan > 3500)) missing.push('P.E. Puzolana');
    
    return missing;
  }, [concrete, cement, fineAggregate, coarseAggregate, admixture]);

  const isValid = missingFields.length === 0;

  const results = useMemo(() => {
    if (!isValid) return null;
    return calculateMixDesign({ concrete, cement, fineAggregate, coarseAggregate, admixture });
  }, [concrete, cement, fineAggregate, coarseAggregate, admixture, isValid]);

  const [activeTab, setActiveTab] = useState<'concrete' | 'cement' | 'fine' | 'coarse' | 'admixture'>('concrete');

  // Carga una consulta guardada en todos los campos
  function handleCargarConsulta(data: ReturnType<typeof dbToInputsFormat>) {
    setConcrete(data.concrete);
    setCement(data.cement);
    setFineAggregate(data.fineAggregate);
    setCoarseAggregate(data.coarseAggregate);
    if (data.admixture) setAdmixture(data.admixture);
    setActiveTab('concrete');
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  async function handleDownloadPDF() {
    if (!results || !isValid) return;
    try {
      const { generatePDFReport } = await import('../utils/pdfGenerator');
      generatePDFReport(
        concrete,
        cement,
        fineAggregate,
        coarseAggregate,
        admixture,
        results,
        usuario?.nombre
      );
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Hubo un error al preparar el PDF. Intenta de nuevo.");
    }
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
        admixture={admixture}
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
        <ResultDashboard 
          results={results} 
          isValid={isValid} 
          missingFields={missingFields} 
          onDownloadPDF={handleDownloadPDF}
        />

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
            <TabButton active={activeTab === 'admixture'} onClick={() => setActiveTab('admixture')}>
              Aditivos{(admixture.useWaterReducer || admixture.usePozzolan) ? ' ●' : ''}
            </TabButton>
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
                    <NumberInput
                      label="f'c (MPa)"
                      tooltip="Resistencia especificada a la compresión del hormigón a 28 días, indicada en el proyecto estructural."
                      value={concrete.fc}
                      onChange={value => setConcrete({...concrete, fc: value})}
                      error={concrete.fc < 15 || concrete.fc > 60 ? "Rango: 15 - 60" : undefined}
                      min={15}
                      max={60}
                      allowDecimals={true}
                      step={1}
                    />
                    <NumberInput
                      label="Desviación Estándar (s)"
                      tooltip="Variabilidad estadística obtenida de ensayos de resistencia previos con el mismo tipo de hormigón. Ingresa 0 si no tienes registros."
                      value={concrete.s}
                      onChange={value => setConcrete({...concrete, s: value})}
                      error={concrete.s < 0 || concrete.s > 15 ? "Rango: 0 - 15" : undefined}
                      min={0}
                      max={15}
                      allowDecimals={true}
                      step={1}
                    />
                    {concrete.s > 0 && (
                      <NumberInput
                        label="Número de Ensayos"
                        tooltip="Cantidad de ensayos de compresión que respaldan la desviación estándar ingresada. Con menos de 15 ensayos, el ACI 211.1 ignora la desviación estándar."
                        value={concrete.dataCount}
                        onChange={value => setConcrete({...concrete, dataCount: value})}
                        error={concrete.dataCount < 1 || concrete.dataCount > 100 ? "Rango: 1 - 100" : undefined}
                        min={1}
                        max={100}
                        allowDecimals={false}
                        step={1}
                      />
                    )}
                  </>
                ) : (
                  <NumberInput
                    label="f'cr (MPa)"
                    tooltip="Resistencia requerida de diseño: ya incluye el margen de seguridad sobre el f'c. Se usa cuando el proyectista la define directamente."
                    value={concrete.fcrInput}
                    onChange={value => setConcrete({...concrete, fcrInput: value})}
                    error={concrete.fcrInput < 15 || concrete.fcrInput > 80 ? "Rango: 15 - 80" : undefined}
                    min={15}
                    max={80}
                    allowDecimals={true}
                    step={1}
                  />
                )}

                <NumberInput
                  label="Asentamiento / Slump (cm)"
                  tooltip="Medida de la trabajabilidad del hormigón fresco. Mayor valor indica mezcla más fluida. Rango típico: 5–15 cm."
                  value={concrete.slumpCm}
                  onChange={value => setConcrete({...concrete, slumpCm: value})}
                  error={concrete.slumpCm < 2 || concrete.slumpCm > 25 ? "Rango: 2 - 25" : undefined}
                  min={2}
                  max={25}
                  allowDecimals={true}
                  step={1}
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
                <NumberInput
                  label="Peso Específico (kg/m³)"
                  tooltip="Densidad del cemento. Valor típico para cemento Portland: 3150 kg/m³."
                  value={cement.pec}
                  onChange={value => setCement({...cement, pec: value})}
                  error={cement.pec < 2000 || cement.pec > 3500 ? "Rango: 2000 - 3500" : undefined}
                  min={2000}
                  max={3500}
                  allowDecimals={true}
                  step={1}
                />
              </div>
            )}

            {activeTab === 'fine' && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Peso Específico (kg/m³)"
                  tooltip="Densidad de las partículas del árido fino, obtenida en laboratorio. Valor típico: 2600 kg/m³."
                  value={fineAggregate.peaf}
                  onChange={value => setFineAggregate({...fineAggregate, peaf: value})}
                  error={fineAggregate.peaf < 2000 || fineAggregate.peaf > 3200 ? "Rango: 2000 - 3200" : undefined}
                  min={2000}
                  max={3200}
                  allowDecimals={true}
                  step={1}
                />
                <NumberInput
                  label="Humedad Superficial (%)"
                  tooltip="Porcentaje de agua libre en la superficie de las partículas, medida en el árido tal como llega a obra. Puede ser positiva (húmedo) o cero (seco)."
                  value={fineAggregate.haf}
                  onChange={value => setFineAggregate({...fineAggregate, haf: value})}
                  error={fineAggregate.haf < 0 || fineAggregate.haf > 20 ? "Rango: 0 - 20" : undefined}
                  min={0}
                  max={20}
                  allowDecimals={true}
                  step={1}
                />
                <NumberInput
                  label="Absorción de Agua (%)"
                  tooltip="Porcentaje de agua que el árido puede absorber hasta saturarse. Se obtiene en laboratorio y se usa para corregir el agua de la mezcla."
                  value={fineAggregate.absaf}
                  onChange={value => setFineAggregate({...fineAggregate, absaf: value})}
                  error={fineAggregate.absaf < 0 || fineAggregate.absaf > 15 ? "Rango: 0 - 15" : undefined}
                  min={0}
                  max={15}
                  allowDecimals={true}
                  step={1}
                />
                <NumberInput
                  label="Módulo de Finura"
                  tooltip="Índice de granulometría del árido fino. Valor entre 2.3 y 3.1. A mayor valor, arena más gruesa. Se calcula sumando los porcentajes retenidos acumulados en tamices normalizados y dividiendo por 100."
                  value={fineAggregate.mf}
                  onChange={value => setFineAggregate({...fineAggregate, mf: value})}
                  error={fineAggregate.mf < 2 || fineAggregate.mf > 4 ? "Rango: 2.0 - 4.0" : undefined}
                  min={2}
                  max={4}
                  allowDecimals={true}
                  step={0.1}
                  tooltipWidth="w-72"
                />
              </div>
            )}

            {activeTab === 'coarse' && (
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Peso Específico (kg/m³)"
                  tooltip="Densidad de las partículas del árido grueso, obtenida en laboratorio. Valor típico: 2650 kg/m³."
                  value={coarseAggregate.peag}
                  onChange={value => setCoarseAggregate({...coarseAggregate, peag: value})}
                  error={coarseAggregate.peag < 2000 || coarseAggregate.peag > 3200 ? "Rango: 2000 - 3200" : undefined}
                  min={2000}
                  max={3200}
                  allowDecimals={true}
                  step={1}
                />
                <NumberInput
                  label="Humedad Superficial (%)"
                  tooltip="Porcentaje de agua libre en la superficie de las partículas, medida en el árido tal como llega a obra."
                  value={coarseAggregate.hag}
                  onChange={value => setCoarseAggregate({...coarseAggregate, hag: value})}
                  error={coarseAggregate.hag < 0 || coarseAggregate.hag > 20 ? "Rango: 0 - 20" : undefined}
                  min={0}
                  max={20}
                  allowDecimals={true}
                  step={1}
                />
                <NumberInput
                  label="Absorción de Agua (%)"
                  tooltip="Porcentaje de agua que el árido puede absorber hasta saturarse. Se obtiene en laboratorio."
                  value={coarseAggregate.absag}
                  onChange={value => setCoarseAggregate({...coarseAggregate, absag: value})}
                  error={coarseAggregate.absag < 0 || coarseAggregate.absag > 15 ? "Rango: 0 - 15" : undefined}
                  min={0}
                  max={15}
                  allowDecimals={true}
                  step={1}
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
                <NumberInput
                  label="Peso Unitario Compactado (kg/m³)"
                  tooltip="Masa del árido grueso por unidad de volumen, compactado con varilla según norma. Se usa para calcular el volumen de árido grueso por m³ de hormigón."
                  value={coarseAggregate.puc}
                  onChange={value => setCoarseAggregate({...coarseAggregate, puc: value})}
                  error={coarseAggregate.puc < 1000 || coarseAggregate.puc > 2500 ? "Rango: 1000 - 2500" : undefined}
                  min={1000}
                  max={2500}
                  allowDecimals={true}
                  step={1}
                />
              </div>
            )}

            {activeTab === 'admixture' && (
              <div className="flex flex-col gap-5">

                {/* Reductor de agua */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setAdmixture({...admixture, useWaterReducer: !admixture.useWaterReducer})}
                      className={`w-10 h-5 rounded-full transition-colors relative ${admixture.useWaterReducer ? 'bg-blue-500' : 'bg-[#34495e]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${admixture.useWaterReducer ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Aditivo Reductor de Agua</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Plastificante o superplastificante que reduce la demanda de agua de la mezcla</p>
                    </div>
                  </label>
                  {admixture.useWaterReducer && (
                    <div className="pl-4 border-l-2 border-blue-500/40">
                      <NumberInput
                        label="Reducción de Agua (%)"
                        tooltip="Porcentaje de reducción de agua que ofrece el aditivo según ficha técnica del fabricante. Plastificantes: 5–15%. Superplastificantes: 15–30%."
                        value={admixture.waterReductionPct}
                        onChange={value => setAdmixture({...admixture, waterReductionPct: value})}
                        error={admixture.waterReductionPct < 1 || admixture.waterReductionPct > 40 ? "Rango: 1 - 40" : undefined}
                        min={1}
                        max={40}
                        allowDecimals={true}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#2c3e50]" />

                {/* Puzolana */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setAdmixture({...admixture, usePozzolan: !admixture.usePozzolan})}
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${admixture.usePozzolan ? 'bg-blue-500' : 'bg-[#34495e]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${admixture.usePozzolan ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Reemplazo por Puzolana</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Microsílice, ceniza volante u otro material cementante que sustituye parcialmente al cemento</p>
                    </div>
                  </label>
                  {admixture.usePozzolan && (
                    <div className="pl-4 border-l-2 border-blue-500/40 grid grid-cols-2 gap-4">
                      <NumberInput
                        label="Reemplazo de Cemento (%)"
                        tooltip="Porcentaje en masa del cemento que será reemplazado por la puzolana. Rango típico: 5–30%."
                        value={admixture.pozzolanReplacementPct}
                        onChange={value => setAdmixture({...admixture, pozzolanReplacementPct: value})}
                        error={admixture.pozzolanReplacementPct < 1 || admixture.pozzolanReplacementPct > 50 ? "Rango: 1 - 50" : undefined}
                        min={1}
                        max={50}
                        allowDecimals={true}
                        step={1}
                      />
                      <NumberInput
                        label="Peso Específico Puzolana (kg/m³)"
                        tooltip="Densidad de la puzolana. Microsílice: ~2200 kg/m³. Ceniza volante: ~2300 kg/m³. Escoria: ~2900 kg/m³."
                        value={admixture.pePozzolan}
                        onChange={value => setAdmixture({...admixture, pePozzolan: value})}
                        error={admixture.pePozzolan < 1000 || admixture.pePozzolan > 3500 ? "Rango: 1000 - 3500" : undefined}
                        min={1000}
                        max={3500}
                        allowDecimals={true}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                {!admixture.useWaterReducer && !admixture.usePozzolan && (
                  <p className="text-[10px] text-slate-600 text-center py-2">
                    Los aditivos son opcionales. Actívalos con los interruptores para incluirlos en el cálculo.
                  </p>
                )}
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
