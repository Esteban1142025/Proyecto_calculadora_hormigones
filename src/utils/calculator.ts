export type TMN = '3/8' | '1/2' | '3/4' | '1' | '1 1/2' | '2' | '3' | '6';

export interface ConcreteInputs {
  fcrType: 'E' | 'R';
  fc: number;
  s: number;
  dataCount: number;
  fcrInput: number;
  slumpCm: number;
  hasAir: boolean;
  exposure: 0 | 1 | 2 | 3;
  freezeThaw: boolean;
}

export interface CementInputs {
  pec: number;
}

export interface FineAggregateInputs {
  peaf: number;
  haf: number;
  absaf: number;
  mf: number;
}

export interface CoarseAggregateInputs {
  peag: number;
  hag: number;
  absag: number;
  tmn: TMN;
  puc: number;
}

export interface CalculatorInputs {
  concrete: ConcreteInputs;
  cement: CementInputs;
  fineAggregate: FineAggregateInputs;
  coarseAggregate: CoarseAggregateInputs;
}

export interface CalculatorResults {
  fcr: number;
  h2o: number;
  air: number;
  wcr: number;
  cement: number;
  vag: number;
  ag: number;
  ph: number;
  afMalo: number;
  af: number;
  hsaf: number;
  hsag: number;
  afCorr: number;
  agCorr: number;
  h2oCorr: number;
  caf: number;
  cag: number;
  ch2o: number;
}

export function calculateMixDesign(inputs: CalculatorInputs): CalculatorResults {
  const { concrete, cement, fineAggregate, coarseAggregate } = inputs;

  // -- Preprocess inputs --
  let fc = concrete.fc;
  if (fc > 100) fc = fc / 10;
  
  let s = concrete.s;
  if (s > 0) {
    const q = concrete.dataCount;
    if (q > 0 && q < 15) s = 0;
    else if (q === 15) s = s * 1.16;
    else if (q === 20) s = s * 1.08;
    else if (q === 25) s = s * 1.03;
    // q >= 30 remains s
  }

  // Paso 1: Fcr
  let fcr = 0;
  if (concrete.fcrType === 'E') {
    if (s > 0) {
      const a = fc > 35 ? fc + 1.34 * s : fc + 1.34 * s;
      const b = fc > 35 ? 0.9 * fc + 2.33 * s : fc + 2.33 * s - 3.5;
      fcr = Math.max(a, b);
    } else {
      if (fc < 21) fcr = fc + 7;
      else if (fc >= 21 && fc <= 35) fcr = fc + 8.5;
      else fcr = 1.1 * fc + 5;
    }
  } else {
    fcr = concrete.fcrInput;
    if (fcr > 100) fcr = fcr / 10;
  }

  // Slump category
  let rv = 1;
  const scm = concrete.slumpCm;
  if (scm >= 2.5 && scm < 5) rv = 1;
  else if (scm >= 7.5 && scm <= 10) rv = 2;
  else if (scm >= 15 && scm <= 17.5) rv = 3;

  const tmn = coarseAggregate.tmn;
  const exp = concrete.hasAir ? concrete.exposure : 0;

  // Paso 2: Water and Air
  let h2o = 0;
  let air = 0;

  if (exp === 0) {
    if (rv === 1) {
      if (tmn === "3/8") { h2o = 207; air = 3; }
      else if (tmn === "1/2") { h2o = 199; air = 2.5; }
      else if (tmn === "3/4") { h2o = 190; air = 2; }
      else if (tmn === "1") { h2o = 179; air = 1.5; }
      else if (tmn === "1 1/2") { h2o = 166; air = 1; }
      else if (tmn === "2") { h2o = 154; air = 0.5; }
      else if (tmn === "3") { h2o = 130; air = 0.3; }
      else if (tmn === "6") { h2o = 113; air = 0.2; }
    } else if (rv === 2) {
      if (tmn === "3/8") { h2o = 228; air = 3; }
      else if (tmn === "1/2") { h2o = 216; air = 2.5; }
      else if (tmn === "3/4") { h2o = 205; air = 2; }
      else if (tmn === "1") { h2o = 193; air = 1.5; }
      else if (tmn === "1 1/2") { h2o = 181; air = 1; }
      else if (tmn === "2") { h2o = 169; air = 0.5; }
      else if (tmn === "3") { h2o = 145; air = 0.3; }
      else if (tmn === "6") { h2o = 124; air = 0.2; }
    } else if (rv === 3) {
      if (tmn === "3/8") { h2o = 243; air = 3; }
      else if (tmn === "1/2") { h2o = 228; air = 2.5; }
      else if (tmn === "3/4") { h2o = 216; air = 2; }
      else if (tmn === "1") { h2o = 202; air = 1.5; }
      else if (tmn === "1 1/2") { h2o = 190; air = 1; }
      else if (tmn === "2") { h2o = 178; air = 0.5; }
      else if (tmn === "3") { h2o = 160; air = 0.3; }
    }
  } else {
    if (rv === 1) {
      if (tmn === "3/8") h2o = 181;
      else if (tmn === "1/2") h2o = 175;
      else if (tmn === "3/4") h2o = 168;
      else if (tmn === "1") h2o = 160;
      else if (tmn === "1 1/2") h2o = 150;
      else if (tmn === "2") h2o = 142;
      else if (tmn === "3") h2o = 122;
      else if (tmn === "6") h2o = 107;
    } else if (rv === 2) {
      if (tmn === "3/8") h2o = 202;
      else if (tmn === "1/2") h2o = 193;
      else if (tmn === "3/4") h2o = 184;
      else if (tmn === "1") h2o = 175;
      else if (tmn === "1 1/2") h2o = 165;
      else if (tmn === "2") h2o = 157;
      else if (tmn === "3") h2o = 133;
      else if (tmn === "6") h2o = 119;
    } else if (rv === 3) {
      if (tmn === "3/8") h2o = 216;
      else if (tmn === "1/2") h2o = 205;
      else if (tmn === "3/4") h2o = 197;
      else if (tmn === "1") h2o = 174;
      else if (tmn === "1 1/2") h2o = 174;
      else if (tmn === "2") h2o = 166;
      else if (tmn === "3") h2o = 154;
    }

    if (exp === 1) {
      if (tmn === "3/8") air = 7.5;
      else if (tmn === "1/2") air = 4 + 2.5;
      else if (tmn === "3/4") air = 3.5 + 2;
      else if (tmn === "1") air = 3 + 1.5;
      else if (tmn === "1 1/2") air = 2.5 + 1;
      else if (tmn === "2") air = 2 + 0.5;
      else if (tmn === "3") air = 1.5 + 0.3;
      else if (tmn === "6") air = 1 + 0.2;
    } else if (exp === 2) {
      if (tmn === "3/8") air = 6 + 3;
      else if (tmn === "1/2") air = 5.5 + 2.5;
      else if (tmn === "3/4") air = 5.5 + 2;
      else if (tmn === "1") air = 4.5 + 1.5;
      else if (tmn === "1 1/2") air = 4.5 + 1;
      else if (tmn === "2") air = 4 + 0.5;
      else if (tmn === "3") air = 3.5 + 0.3;
      else if (tmn === "6") air = 3 + 0.2;
    } else if (exp === 3) {
      if (tmn === "3/8") air = 7.5 + 3;
      else if (tmn === "1/2") air = 7 + 2.5;
      else if (tmn === "3/4") air = 6 + 2;
      else if (tmn === "1") air = 6 + 1.5;
      else if (tmn === "1 1/2") air = 5.5 + 1;
      else if (tmn === "2") air = 5 + 0.5;
      else if (tmn === "3") air = 4.5 + 0.3;
      else if (tmn === "6") air = 4 + 0.2;
    }
  }

  // Paso 3: a/c
  const f1 = 42, f2 = 35, f3 = 28, f4 = 21;
  const ac1 = 0.41, ac2 = 0.48, ac3 = 0.57, ac4 = 0.68, ac5 = 0.82;
  const ac2a = 0.40, ac3a = 0.48, ac4a = 0.59, ac5a = 0.74;

  let rel_ac = 0.5;
  if (exp === 0) {
    if (fcr >= f1) rel_ac = ac1;
    else if (fcr >= f2) rel_ac = ac2 + (ac1 - ac2) * (fcr - f2) / (f1 - f2);
    else if (fcr >= f3) rel_ac = ac3 + (ac2 - ac3) * (fcr - f3) / (f2 - f3);
    else if (fcr >= f4) rel_ac = ac4 + (ac3 - ac4) * (fcr - f4) / (f3 - f4);
    else rel_ac = ac5;
  } else if (exp === 1 || exp === 2) {
    if (fcr >= f2) rel_ac = ac2a;
    else if (fcr >= f3) rel_ac = ac3a + (ac2a - ac3a) * (fcr - f3) / (f2 - f3);
    else if (fcr >= f4) rel_ac = ac4a + (ac3a - ac4a) * (fcr - f4) / (f3 - f4);
    else rel_ac = ac5a;
  } else if (exp === 3) {
    if (concrete.freezeThaw) rel_ac = 0.5;
    else rel_ac = 0.45;
  }

  rel_ac = Math.round(rel_ac * 1000) / 1000;
  let C = h2o / rel_ac;
  C = Math.round(C * 1000) / 1000;

  // Paso 4: VAG
  const MF1 = 2.40, MF2 = 2.60, MF3 = 2.80, MF4 = 3.00;
  let v1 = 0, v2 = 0, v3 = 0, v4 = 0;
  if (tmn === "3/8") { v1 = 0.50; v2 = 0.48; v3 = 0.46; v4 = 0.44; }
  else if (tmn === "1/2") { v1 = 0.59; v2 = 0.57; v3 = 0.55; v4 = 0.53; }
  else if (tmn === "3/4") { v1 = 0.66; v2 = 0.64; v3 = 0.62; v4 = 0.60; }
  else if (tmn === "1") { v1 = 0.71; v2 = 0.69; v3 = 0.67; v4 = 0.65; }
  else if (tmn === "1 1/2") { v1 = 0.75; v2 = 0.73; v3 = 0.71; v4 = 0.69; }
  else if (tmn === "2") { v1 = 0.78; v2 = 0.76; v3 = 0.74; v4 = 0.72; }
  else if (tmn === "3") { v1 = 0.82; v2 = 0.80; v3 = 0.78; v4 = 0.76; }
  else if (tmn === "6") { v1 = 0.87; v2 = 0.85; v3 = 0.83; v4 = 0.81; }

  const mf = fineAggregate.mf;
  let vag = 0;
  if (mf <= MF1) vag = v1;
  else if (mf > MF1 && mf <= MF2) vag = v1 + (v2 - v1) * (mf - MF1) / (MF2 - MF1);
  else if (mf > MF2 && mf <= MF3) vag = v2 + (v3 - v2) * (mf - MF2) / (MF3 - MF2);
  else if (mf > MF3 && mf <= MF4) vag = v3 + (v4 - v3) * (mf - MF3) / (MF4 - MF3);
  else vag = v4;

  vag = Math.round(vag * 1000) / 1000;
  
  let puc = coarseAggregate.puc;
  if (puc < 1000) puc = puc * 1000;
  let ag = vag * puc;
  ag = Math.round(ag * 1000) / 1000;

  // Paso 5: Peso
  let ph = 0;
  if (exp === 0) {
    if (tmn === "3/8") ph = 2280;
    else if (tmn === "1/2") ph = 2310;
    else if (tmn === "3/4") ph = 2345;
    else if (tmn === "1") ph = 2380;
    else if (tmn === "1 1/2") ph = 2410;
    else if (tmn === "2") ph = 2445;
    else if (tmn === "3") ph = 2490;
    else if (tmn === "6") ph = 2530;
  } else {
    if (tmn === "3/8") ph = 2200;
    else if (tmn === "1/2") ph = 2230;
    else if (tmn === "3/4") ph = 2275;
    else if (tmn === "1") ph = 2290;
    else if (tmn === "1 1/2") ph = 2350;
    else if (tmn === "2") ph = 2345;
    else if (tmn === "3") ph = 2405;
    else if (tmn === "6") ph = 2435;
  }

  // Paso 6: AF_malo
  const afMalo = ph - C - h2o - ag;

  // Paso 7: VAF
  let pec = cement.pec;
  if (pec < 1000) pec *= 1000;
  let peag = coarseAggregate.peag;
  if (peag < 1000) peag *= 1000;
  let peaf = fineAggregate.peaf;
  if (peaf < 1000) peaf *= 1000;

  const vaf = 1 - (C / pec) - (h2o / 1000) - (ag / peag) - (air / 100);
  let af = vaf * peaf;
  af = Math.round(af * 1000) / 1000;

  // Paso 8: HS
  const hsaf = Math.round((fineAggregate.haf - fineAggregate.absaf) * 1000) / 1000;
  const hsag = Math.round((coarseAggregate.hag - coarseAggregate.absag) * 1000) / 1000;

  // Paso 9: Corrections
  let afCorr = af * (1 + fineAggregate.haf / 100);
  let agCorr = ag * (1 + coarseAggregate.hag / 100);
  let h2oCorr = h2o - (af * hsaf / 100) - (ag * hsag / 100);

  afCorr = Math.round(afCorr * 1000) / 1000;
  agCorr = Math.round(agCorr * 1000) / 1000;
  h2oCorr = Math.round(h2oCorr * 1000) / 1000;

  // Paso 10: Relations
  const caf = Math.round((afCorr / C) * 1000) / 1000;
  const cag = Math.round((agCorr / C) * 1000) / 1000;
  const ch2o = Math.round((h2oCorr / C) * 1000) / 1000;

  return {
    fcr: Math.round(fcr * 1000) / 1000,
    h2o,
    air,
    wcr: rel_ac,
    cement: C,
    vag,
    ag,
    ph,
    afMalo,
    af,
    hsaf,
    hsag,
    afCorr,
    agCorr,
    h2oCorr,
    caf,
    cag,
    ch2o
  };
}
