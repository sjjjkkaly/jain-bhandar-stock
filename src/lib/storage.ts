import { Item, Transaction, DayStockRow } from '@/types/stock';

const STORAGE_KEYS = {
  AUTH: 'jb_auth_v2',
};

export const MASTER_PIN = '1326';

const isClient = typeof window !== 'undefined';

// --- AUTH ONLY ---
export function checkAuth(): boolean {
  if (!isClient) return false;
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function setAuth(status: boolean): void {
  if (!isClient) return;
  if (status) {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}

// --- CORE STOCK CALCULATION ---
// Formula: Opening Stock + Purchase - Sales = Current/Closing Stock
export function calculateDayStock(
  targetDate: string,
  items: Item[],
  transactions: Transaction[]
): DayStockRow[] {
  return items.map((item) => {
    let opening = Number(item.openingStock || 0);
    let purchase = 0;
    let sales = 0;

    for (const tx of transactions) {
      if (tx.itemId !== item.id) continue;

      const qty = Number(tx.quantity || 0);
      if (tx.date < targetDate) {
        // Prior date belongs to opening stock
        if (tx.type === 'PURCHASE') opening += qty;
        if (tx.type === 'SALE') opening -= qty;
      } else if (tx.date === targetDate) {
        // Selected day
        if (tx.type === 'PURCHASE') purchase += qty;
        if (tx.type === 'SALE') sales += qty;
      }
    }

    const closing = opening + purchase - sales;

    return {
      itemId: item.id,
      name: item.name,
      brand: item.brand,
      unit: item.unit || 'Bags',
      openingStock: opening,
      purchase,
      sales,
      closingStock: closing,
    };
  });
}
