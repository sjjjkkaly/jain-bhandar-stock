import * as XLSX from 'xlsx';
import { DailyItemSummary, Transaction } from '@/types/stock';

export function exportDailyStockExcel(
  dateStr: string,
  summaries: DailyItemSummary[]
): void {
  // Format data for sheet
  const rows = summaries.map((s, idx) => ({
    'Sr No': idx + 1,
    'Item Name': s.item.name,
    'Brand': s.item.brand,
    'Variety / Grade': s.item.variety,
    'Packaging Unit': s.item.packagingUnit,
    'Weight per Bag (Kg)': s.item.weightPerBagKg,
    'Opening Stock (Bags)': s.openingBags,
    'Purchases Today (Bags)': s.purchaseBags,
    'Sales Today (Bags)': s.saleBags,
    'Closing Stock (Bags)': s.closingBags,
    'Total Net Weight (Kg)': s.closingWeightKg,
    'Total Net Weight (Quintals)': s.closingQuintals,
    'Min Alert Threshold': s.item.minAlertBags,
    'Stock Status': s.isLowStock ? 'LOW STOCK ALERT' : 'ADEQUATE',
    'Godown Location': s.item.location || 'Main Godown',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // Sr No
    { wch: 22 }, // Item Name
    { wch: 18 }, // Brand
    { wch: 25 }, // Variety
    { wch: 14 }, // Packaging Unit
    { wch: 18 }, // Weight per bag
    { wch: 18 }, // Opening
    { wch: 18 }, // Purchases
    { wch: 18 }, // Sales
    { wch: 18 }, // Closing
    { wch: 18 }, // Net weight
    { wch: 22 }, // Quintals
    { wch: 18 }, // Min alert
    { wch: 16 }, // Stock Status
    { wch: 22 }, // Godown location
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Stock_${dateStr}`);

  XLSX.writeFile(workbook, `Jain_Bhandar_Stock_${dateStr}.xlsx`);
}

export function exportAllTransactionsExcel(
  transactions: Transaction[]
): void {
  const rows = transactions.map((t, idx) => ({
    'Sr No': idx + 1,
    'Date': t.date,
    'Type': t.type,
    'Item ID': t.itemId,
    'Bags Count': t.bags,
    'Total Weight (Kg)': t.totalWeightKg,
    'Rate per Bag (₹)': t.ratePerBag || '',
    'Total Amount (₹)': t.totalAmount || '',
    'Party / Trader Name': t.partyName || '',
    'Bill / Bilty No': t.billNo || '',
    'Vehicle No': t.vehicleNo || '',
    'Remarks': t.remarks || '',
    'Timestamp': new Date(t.timestamp).toLocaleString('en-IN'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger_History');
  XLSX.writeFile(workbook, `Jain_Bhandar_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
}
