import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await register(nombre, email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="calc-body w-full max-w-sm p-8 flex flex-col gap-6 border border-[#4b6584]">

        {/* Marca */}
        <div className="text-center">
          <div className="text-2xl font-bold italic tracking-wider text-white">
            HORMIGÓN<span className="text-blue-400">CALC</span> 211
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            ACI_211.1_SISTEMA
          </div>
        </div>

        {/* Línea separadora */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#34495e]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Nueva cuenta</span>
          <div className="flex-1 h-px bg-[#34495e]" />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              autoComplete="name"
              className="px-3 py-2.5 bg-[#2c3e50] border-2 border-[#1a252f]
                focus:border-[#4b6584] text-white font-mono rounded outline-none
                transition-colors text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="px-3 py-2.5 bg-[#2c3e50] border-2 border-[#1a252f]
                focus:border-[#4b6584] text-white font-mono rounded outline-none
                transition-colors text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="px-3 py-2.5 bg-[#2c3e50] border-2 border-[#1a252f]
                focus:border-[#4b6584] text-white font-mono rounded outline-none
                transition-colors text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              required
              autoComplete="new-password"
              className={`px-3 py-2.5 bg-[#2c3e50] border-2 text-white font-mono
                rounded outline-none transition-colors text-sm
                ${confirmar && confirmar !== password
                  ? 'border-red-500'
                  : 'border-[#1a252f] focus:border-[#4b6584]'
                }`}
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-900/30 border border-red-700/40 rounded
              text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 flex items-center justify-center gap-2 px-4 py-3
              bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white
              font-bold text-sm uppercase tracking-wider rounded
              transition-colors shadow-lg"
          >
            {cargando
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <UserPlus className="w-4 h-4" />
            }
            Crear Cuenta
          </button>
        </form>

        {/* Enlace a login */}
        <div className="text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Iniciar sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
