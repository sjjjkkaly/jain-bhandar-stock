import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DayStockRow } from '@/types/stock';

export function printStockPDF(date: string, rows: DayStockRow[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Green header bar
  doc.setFillColor(22, 163, 74); // #16a34a
  doc.rect(0, 0, 210, 22, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JAIN BHANDAR', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Daily Closing Stock Report', 14, 17);

  // Date on right
  doc.setFontSize(10);
  doc.text(`Date: ${date}`, 160, 11);
  doc.setFontSize(8);
  doc.text(`Time: ${new Date().toLocaleTimeString('en-US')}`, 160, 17);

  // Table rows
  const tableData = rows.map((r, i) => [
    (i + 1).toString(),
    r.name,
    r.brand,
    r.unit,
    r.openingStock.toString(),
    r.purchase > 0 ? `+${r.purchase}` : '0',
    r.sales > 0 ? `-${r.sales}` : '0',
    r.closingStock.toString(),
  ]);

  const totalOpening = rows.reduce((acc, r) => acc + r.openingStock, 0);
  const totalPurchase = rows.reduce((acc, r) => acc + r.purchase, 0);
  const totalSales = rows.reduce((acc, r) => acc + r.sales, 0);
  const totalClosing = rows.reduce((acc, r) => acc + r.closingStock, 0);

  autoTable(doc, {
    startY: 28,
    head: [[
      '#',
      'Item Name',
      'Brand',
      'Unit',
      'Opening Stock',
      'Purchase (+)',
      'Sales (-)',
      'Closing Stock',
    ]],
    body: tableData,
    foot: [[
      '',
      'TOTAL',
      '',
      '',
      totalOpening.toString(),
      `+${totalPurchase}`,
      `-${totalSales}`,
      totalClosing.toString(),
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 40, fontStyle: 'bold' },
      2: { halign: 'left', cellWidth: 35 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25, textColor: [22, 163, 74] },
      6: { halign: 'right', cellWidth: 25, textColor: [220, 38, 38] },
      7: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      halign: 'right',
    },
  });

  doc.save(`Jain_Bhandar_Stock_${date}.pdf`);
}
