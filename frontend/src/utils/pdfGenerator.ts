import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculatorInputs, CalculatorResults, AdmixtureInputs } from './calculator';

export function generatePDFReport(
  concrete: CalculatorInputs['concrete'],
  cement: CalculatorInputs['cement'],
  fineAggregate: CalculatorInputs['fineAggregate'],
  coarseAggregate: CalculatorInputs['coarseAggregate'],
  admixture: AdmixtureInputs,
  results: CalculatorResults,
  usuarioNombre: string | undefined
) {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text('Diseño de Mezcla - Método ACI 211.1', 14, 22);
  
  // Metadatos
  doc.setFontSize(10);
  doc.setTextColor(100);
  const fecha = new Date().toLocaleString();
  doc.text(`Generado por: ${usuarioNombre || 'Usuario'}`, 14, 30);
  doc.text(`Fecha: ${fecha}`, 14, 36);

  // Tabla Parámetros de Entrada
  autoTable(doc, {
    startY: 42,
    head: [['Parámetro de Entrada', 'Valor']],
    body: [
      ["Resistencia f'c", `${concrete.fc} MPa`],
      ['Asentamiento (Slump)', `${concrete.slumpCm} cm`],
      ['P.E. Cemento', `${cement.pec} kg/m³`],
      ['P.E. Árido Fino', `${fineAggregate.peaf} kg/m³`],
      ['Humedad Árido Fino', `${fineAggregate.haf}%`],
      ['Absorción Árido Fino', `${fineAggregate.absaf}%`],
      ['Módulo de Finura', fineAggregate.mf.toString()],
      ['P.E. Árido Grueso', `${coarseAggregate.peag} kg/m³`],
      ['Humedad Árido Grueso', `${coarseAggregate.hag}%`],
      ['Absorción Árido Grueso', `${coarseAggregate.absag}%`],
      ['P.U.C. Árido Grueso', `${coarseAggregate.puc} kg/m³`],
      ['Tamaño Máximo Nominal', `${coarseAggregate.tmn}"`],
      ...(admixture.useWaterReducer ? [['Adit. Reductor Agua', `${admixture.waterReductionPct}% red.`]] as any : []),
      ...(admixture.usePozzolan ? [['Adit. Puzolana', `${admixture.pozzolanReplacementPct}% reemplazo`]] as any : [])
    ],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [52, 73, 94] }
  });

  // Tabla Resultados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY || 100;

  autoTable(doc, {
    startY: finalY + 10,
    head: [['Material', 'Cantidad (kg/m³)', 'Proporción (Masa)']],
    body: [
      ['Cemento', results.cementNet.toString(), '1'],
      ['Árido Fino', results.afCorr.toString(), results.caf.toString()],
      ['Árido Grueso', results.agCorr.toString(), results.cag.toString()],
      ['Agua de Diseño', results.h2oCorr.toString(), results.ch2o.toString()],
      ...(results.pozzolan > 0 ? [['Puzolana', results.pozzolan.toString(), '-']] : [])
    ],
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY2 = (doc as any).lastAutoTable.finalY || 150;
  
  // Resumen final
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Relación a/c: ${results.wcr}`, 14, finalY2 + 10);
  doc.text(`Peso Unitario Fresco: ${results.ph} kg/m³`, 14, finalY2 + 18);

  doc.save('diseno-mezcla-aci.pdf');
}
