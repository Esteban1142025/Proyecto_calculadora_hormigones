import type {
  ConcreteInputs,
  CementInputs,
  FineAggregateInputs,
  CoarseAggregateInputs,
  AdmixtureInputs,
  TMN,
} from '../utils/calculator';

const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Error del servidor');
  return data as T;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  usuario: { id: number; nombre: string; email: string };
}

export const apiLogin = (email: string, password: string) =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (nombre: string, email: string, password: string) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, password }),
  });

// ── Consultas ────────────────────────────────────────────────────────────────

export interface ConsultaResumen {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultaDB extends ConsultaResumen {
  fcr_type: string;
  fc: number;
  s: number;
  data_count: number;
  fcr_input: number;
  slump_cm: number;
  has_air: boolean;
  exposure: number;
  freeze_thaw: boolean;
  pec: number;
  peaf: number;
  haf: number;
  absaf: number;
  mf: number;
  peag: number;
  hag: number;
  absag: number;
  tmn: string;
  puc: number;
  use_water_reducer: boolean;
  water_reduction_pct: number;
  use_pozzolan: boolean;
  pozzolan_replacement_pct: number;
  pe_pozzolan: number;
}

export const apiGetConsultas = () => request<ConsultaResumen[]>('/consultas');
export const apiGetConsulta  = (id: number) => request<ConsultaDB>(`/consultas/${id}`);
export const apiSaveConsulta = (data: object) =>
  request<ConsultaDB>('/consultas', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateConsulta = (id: number, data: object) =>
  request<ConsultaDB>(`/consultas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const apiDeleteConsulta = (id: number) =>
  request<{ mensaje: string }>(`/consultas/${id}`, { method: 'DELETE' });

// ── Conversores de formato ────────────────────────────────────────────────────

export function inputsToDbFormat(
  nombre: string,
  concrete: ConcreteInputs,
  cement: CementInputs,
  fine: FineAggregateInputs,
  coarse: CoarseAggregateInputs,
  admixture: AdmixtureInputs,
) {
  return {
    nombre,
    fcr_type:   concrete.fcrType,
    fc:         concrete.fc,
    s:          concrete.s,
    data_count: concrete.dataCount,
    fcr_input:  concrete.fcrInput,
    slump_cm:   concrete.slumpCm,
    has_air:    concrete.hasAir,
    exposure:   concrete.exposure,
    freeze_thaw: concrete.freezeThaw,
    pec:   cement.pec,
    peaf:  fine.peaf,
    haf:   fine.haf,
    absaf: fine.absaf,
    mf:    fine.mf,
    peag:  coarse.peag,
    hag:   coarse.hag,
    absag: coarse.absag,
    tmn:   coarse.tmn,
    puc:   coarse.puc,
    use_water_reducer:        admixture.useWaterReducer,
    water_reduction_pct:      admixture.waterReductionPct,
    use_pozzolan:             admixture.usePozzolan,
    pozzolan_replacement_pct: admixture.pozzolanReplacementPct,
    pe_pozzolan:              admixture.pePozzolan,
  };
}

export function dbToInputsFormat(row: ConsultaDB) {
  return {
    concrete: {
      fcrType:    row.fcr_type as 'E' | 'R',
      fc:         Number(row.fc),
      s:          Number(row.s),
      dataCount:  Number(row.data_count),
      fcrInput:   Number(row.fcr_input),
      slumpCm:    Number(row.slump_cm),
      hasAir:     Boolean(row.has_air),
      exposure:   Number(row.exposure) as 0 | 1 | 2 | 3,
      freezeThaw: Boolean(row.freeze_thaw),
    } satisfies ConcreteInputs,
    cement: { pec: Number(row.pec) } satisfies CementInputs,
    fineAggregate: {
      peaf:  Number(row.peaf),
      haf:   Number(row.haf),
      absaf: Number(row.absaf),
      mf:    Number(row.mf),
    } satisfies FineAggregateInputs,
    coarseAggregate: {
      peag:  Number(row.peag),
      hag:   Number(row.hag),
      absag: Number(row.absag),
      tmn:   row.tmn as TMN,
      puc:   Number(row.puc),
    } satisfies CoarseAggregateInputs,
    admixture: {
      useWaterReducer:        Boolean(row.use_water_reducer),
      waterReductionPct:      Number(row.water_reduction_pct),
      usePozzolan:            Boolean(row.use_pozzolan),
      pozzolanReplacementPct: Number(row.pozzolan_replacement_pct),
      pePozzolan:             Number(row.pe_pozzolan) || 2200,
    } satisfies AdmixtureInputs,
  };
}
