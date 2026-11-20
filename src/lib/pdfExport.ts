import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyItemSummary } from '@/types/stock';

export function generateDailyStockPDF(
  dateStr: string,
  summaries: DailyItemSummary[],
  totalBags: number,
  totalQuintals: number
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header banner
  doc.setFillColor(180, 83, 9); // Amber 700 / Mandi Gold
  doc.rect(0, 0, 210, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('JAIN BHANDAR', 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Wholesale Stock & Mandi Inventory Register', 14, 20);

  // Date and Metadata on right
  doc.setFontSize(10);
  doc.text(`Date: ${dateStr}`, 155, 13);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleTimeString('en-IN')}`, 155, 20);

  // Summary box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.rect(14, 33, 182, 16, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.rect(14, 33, 182, 16, 'S');

  doc.setTextColor(120, 53, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Varieties: ${summaries.length} Items`, 18, 43);
  doc.text(`Closing Stock: ${totalBags.toLocaleString('en-IN')} Bags`, 80, 43);
  doc.text(`Total Weight: ${totalQuintals.toLocaleString('en-IN')} Quintals`, 140, 43);

  // Table Data
  const tableRows = summaries.map((s, index) => [
    (index + 1).toString(),
    `${s.item.name}\n[${s.item.brand} - ${s.item.variety}]`,
    `${s.item.weightPerBagKg} kg`,
    s.openingBags.toString(),
    s.purchaseBags > 0 ? `+${s.purchaseBags}` : '0',
    s.saleBags > 0 ? `-${s.saleBags}` : '0',
    s.closingBags.toString(),
    `${s.closingQuintals} Qtl`,
    s.isLowStock ? 'LOW STOCK' : 'OK',
  ]);

  autoTable(doc, {
    startY: 53,
    head: [[
      '#',
      'Item Description & Brand',
      'Pack',
      'Opening (Bags)',
      'Purchased (+)',
      'Sold (-)',
      'Closing (Bags)',
      'Total (Qtl)',
      'Status'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [180, 83, 9],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 58 },
      2: { halign: 'center', cellWidth: 14 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 18, textColor: [5, 150, 105] }, // green for purchases
      5: { halign: 'center', cellWidth: 18, textColor: [225, 29, 72] }, // red for sales
      6: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 18 },
    },
    didParseCell: (data) => {
      // Highlight low stock status in red
      if (data.column.index === 8 && data.cell.text[0] === 'LOW STOCK') {
        data.cell.styles.textColor = [225, 29, 72];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    foot: [[
      '',
      'TOTAL SUMMARY',
      '',
      summaries.reduce((acc, c) => acc + c.openingBags, 0).toString(),
      `+${summaries.reduce((acc, c) => acc + c.purchaseBags, 0)}`,
      `-${summaries.reduce((acc, c) => acc + c.saleBags, 0)}`,
      totalBags.toString(),
      `${totalQuintals} Qtl`,
      ''
    ]],
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
      halign: 'center',
    }
  });

  // Footer notes & signature space
  const finalY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 240) + 12;
  if (finalY < 270) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Note: Verified daily closing stock tally. Formula: Opening + Purchases - Sales = Closing Stock.', 14, finalY);
    doc.text('Authorized Signatory: _________________________', 130, finalY);
  }

  doc.save(`Jain_Bhandar_Stock_${dateStr}.pdf`);
}
