export interface Item {
  id: string;
  name: string; // e.g. "Muri", "Jeera"
  brand: string; // e.g. "Shyam", "Ganesh"
  unit: string; // e.g. "Bags"
  openingStock: number; // initial starting stock
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  itemId: string;
  type: 'PURCHASE' | 'SALE';
  quantity: number;
}

export interface DayStockRow {
  itemId: string;
  name: string;
  brand: string;
  unit: string;
  openingStock: number;
  purchase: number;
  sales: number;
  closingStock: number;
}
