import { Item, Transaction, DayStockRow } from '@/types/stock';

const STORAGE_KEYS = {
  ITEMS: 'jb_simple_items_v2',
  TRANSACTIONS: 'jb_simple_tx_v2',
  AUTH: 'jb_auth_v2',
};

export const MASTER_PIN = '1326';

const isClient = typeof window !== 'undefined';

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'muri-shyam',
    name: 'Muri',
    brand: 'Shyam',
    unit: 'Bags',
    openingStock: 20,
  },
  {
    id: 'muri-ganesh',
    name: 'Muri',
    brand: 'Ganesh',
    unit: 'Bags',
    openingStock: 50,
  },
  {
    id: 'jeera-swastik',
    name: 'Jeera',
    brand: 'Swastik',
    unit: 'Bags',
    openingStock: 250,
  },
  {
    id: 'jeera-falcon',
    name: 'Jeera',
    brand: 'Royal Falcon',
    unit: 'Bags',
    openingStock: 100,
  },
];

const todayStr = new Date().toISOString().split('T')[0];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Muri (Shyam): 20 + 10 purchase - 14 sales = 16 bags
  {
    id: 'tx-1',
    date: todayStr,
    itemId: 'muri-shyam',
    type: 'PURCHASE',
    quantity: 10,
  },
  {
    id: 'tx-2',
    date: todayStr,
    itemId: 'muri-shyam',
    type: 'SALE',
    quantity: 14,
  },
  // Jeera (Swastik): 250 - 40 sales = 210 bags
  {
    id: 'tx-3',
    date: todayStr,
    itemId: 'jeera-swastik',
    type: 'SALE',
    quantity: 40,
  },
];

// --- AUTH ---
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

// --- ITEMS ---
export function getItems(): Item[] {
  if (!isClient) return INITIAL_ITEMS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: Item[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

// --- TRANSACTIONS ---
export function getTransactions(): Transaction[] {
  if (!isClient) return INITIAL_TRANSACTIONS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
}

// --- CORE STOCK CALCULATION ---
// Formula: Opening Stock + Purchase - Sales = Current/Closing Stock
export function calculateDayStock(
  targetDate: string,
  items: Item[],
  transactions: Transaction[]
): DayStockRow[] {
  return items.map((item) => {
    let opening = item.openingStock || 0;
    let purchase = 0;
    let sales = 0;

    for (const tx of transactions) {
      if (tx.itemId !== item.id) continue;

      if (tx.date < targetDate) {
        // Prior date
        if (tx.type === 'PURCHASE') opening += tx.quantity;
        if (tx.type === 'SALE') opening -= tx.quantity;
      } else if (tx.date === targetDate) {
        // Today / selected date
        if (tx.type === 'PURCHASE') purchase += tx.quantity;
        if (tx.type === 'SALE') sales += tx.quantity;
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
