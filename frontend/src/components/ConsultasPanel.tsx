import { useState, useEffect, useCallback } from 'react';
import { X, Save, FolderOpen, Trash2, Loader2, BookOpen } from 'lucide-react';
import {
  apiGetConsultas,
  apiGetConsulta,
  apiSaveConsulta,
  apiDeleteConsulta,
  inputsToDbFormat,
  dbToInputsFormat,
  type ConsultaResumen,
  type ConsultaDB,
} from '../api/client';
import type {
  ConcreteInputs,
  CementInputs,
  FineAggregateInputs,
  CoarseAggregateInputs,
} from '../utils/calculator';

interface ConsultasPanelProps {
  isOpen: boolean;
  onClose: () => void;
  concrete: ConcreteInputs;
  cement: CementInputs;
  fineAggregate: FineAggregateInputs;
  coarseAggregate: CoarseAggregateInputs;
  onCargar: (data: ReturnType<typeof dbToInputsFormat>) => void;
}

export function ConsultasPanel({
  isOpen,
  onClose,
  concrete,
  cement,
  fineAggregate,
  coarseAggregate,
  onCargar,
}: ConsultasPanelProps) {
  const [consultas, setConsultas] = useState<ConsultaResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [cargandoId, setCargandoId] = useState<number | null>(null);
  const [mostrarFormGuardar, setMostrarFormGuardar] = useState(false);
  const [nombreNueva, setNombreNueva] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargarLista = useCallback(async () => {
    setCargando(true);
    try {
      const data = await apiGetConsultas();
      setConsultas(data);
    } catch {
      setError('No se pudo cargar la lista de consultas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      cargarLista();
      setError('');
      setExito('');
      setMostrarFormGuardar(false);
      setNombreNueva('');
    }
  }, [isOpen, cargarLista]);

  async function handleGuardar() {
    if (!nombreNueva.trim()) {
      setError('Ingresa un nombre para la consulta');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await apiSaveConsulta(
        inputsToDbFormat(nombreNueva.trim(), concrete, cement, fineAggregate, coarseAggregate)
      );
      setExito(`"${nombreNueva.trim()}" guardada correctamente`);
      setNombreNueva('');
      setMostrarFormGuardar(false);
      await cargarLista();
      setTimeout(() => setExito(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function handleCargar(id: number) {
    setCargandoId(id);
    setError('');
    try {
      const row = await apiGetConsulta(id) as ConsultaDB;
      onCargar(dbToInputsFormat(row));
      onClose();
    } catch {
      setError('No se pudo cargar la consulta');
    } finally {
      setCargandoId(null);
    }
  }

  async function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    setEliminando(id);
    setError('');
    try {
      await apiDeleteConsulta(id);
      setConsultas(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('No se pudo eliminar la consulta');
    } finally {
      setEliminando(null);
    }
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  return (
    <>
      {/* Overlay oscuro */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
          borderLeft: '1px solid rgba(75,101,132,0.4)',
        }}
      >
        {/* Cabecera del panel */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#34495e]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              Mis Consultas
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botón guardar consulta actual */}
        <div className="px-4 py-3 border-b border-[#34495e]/50">
          {!mostrarFormGuardar ? (
            <button
              onClick={() => { setMostrarFormGuardar(true); setError(''); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold
                uppercase tracking-wider rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar consulta actual
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={nombreNueva}
                onChange={e => setNombreNueva(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuardar()}
                placeholder="Nombre de la consulta..."
                autoFocus
                className="w-full px-3 py-2 bg-[#2c3e50] border border-[#4b6584]
                  text-white text-xs rounded outline-none focus:border-blue-400
                  placeholder-slate-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2
                    bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                    text-xs font-bold rounded transition-colors"
                >
                  {guardando
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />
                  }
                  Guardar
                </button>
                <button
                  onClick={() => { setMostrarFormGuardar(false); setNombreNueva(''); setError(''); }}
                  className="px-3 py-2 bg-[#2c3e50] hover:bg-[#34495e] text-slate-300
                    text-xs font-bold rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 bg-red-900/30 border border-red-700/40
            rounded text-red-400 text-xs">
            {error}
          </div>
        )}
        {exito && (
          <div className="mx-4 mt-3 px-3 py-2 bg-green-900/30 border border-green-700/40
            rounded text-green-400 text-xs">
            {exito}
          </div>
        )}

        {/* Lista de consultas */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {cargando ? (
            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Cargando...</span>
            </div>
          ) : consultas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-3">
              <BookOpen className="w-8 h-8 opacity-30" />
              <p className="text-xs text-center leading-relaxed">
                Aún no tienes consultas guardadas.<br />
                Guarda la consulta actual para poder retomar el cálculo después.
              </p>
            </div>
          ) : (
            consultas.map(c => (
              <div
                key={c.id}
                className="bg-[#1a252f] border border-[#2c3e50] rounded-lg p-3
                  hover:border-[#4b6584] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-white text-xs font-semibold leading-tight flex-1 min-w-0 truncate">
                    {c.nombre}
                  </span>
                </div>
                <p className="text-slate-500 text-[10px] mb-2.5">
                  {formatFecha(c.updated_at)}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleCargar(c.id)}
                    disabled={cargandoId === c.id}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5
                      bg-[#2c3e50] hover:bg-[#34495e] text-blue-400 hover:text-blue-300
                      text-[10px] font-bold uppercase tracking-wide rounded
                      disabled:opacity-50 transition-colors"
                  >
                    {cargandoId === c.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <FolderOpen className="w-3 h-3" />
                    }
                    Cargar
                  </button>
                  <button
                    onClick={() => handleEliminar(c.id, c.nombre)}
                    disabled={eliminando === c.id}
                    className="flex items-center justify-center px-2 py-1.5
                      bg-[#2c3e50] hover:bg-red-900/40 text-slate-500 hover:text-red-400
                      rounded disabled:opacity-50 transition-colors"
                  >
                    {eliminando === c.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#34495e]/50 text-center">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">
            {consultas.length} consulta{consultas.length !== 1 ? 's' : ''} guardada{consultas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </>
  );
}
