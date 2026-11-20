import { Item, Transaction, DailyItemSummary, OverallStockSummary } from '@/types/stock';
import { INITIAL_ITEMS, INITIAL_TRANSACTIONS } from './initialData';

const STORAGE_KEYS = {
  ITEMS: 'jb_stock_items_v1',
  TRANSACTIONS: 'jb_stock_transactions_v1',
  AUTH: 'jb_stock_auth_session_v1',
  LAST_ACTIVE: 'jb_stock_last_active_v1',
};

export const MASTER_PIN = '1326';

// Check if running in browser
const isClient = typeof window !== 'undefined';

// --- AUTHENTICATION HELPERS ---
export function checkAuth(): boolean {
  if (!isClient) return false;
  try {
    const isAuthed = localStorage.getItem(STORAGE_KEYS.AUTH);
    return isAuthed === 'true';
  } catch {
    return false;
  }
}

export function setAuthenticated(status: boolean): void {
  if (!isClient) return;
  try {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  } catch (e) {
    console.error('Failed to set auth state', e);
  }
}

export function verifyPin(pin: string): boolean {
  return pin.trim() === MASTER_PIN;
}

// --- ITEMS STORAGE ---
export function getStoredItems(): Item[] {
  if (!isClient) return INITIAL_ITEMS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!data) {
      // First time initialization
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading items from storage', e);
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: Item[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items', e);
  }
}

// --- TRANSACTIONS STORAGE ---
export function getStoredTransactions(): Transaction[] {
  if (!isClient) return INITIAL_TRANSACTIONS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      // First time initialization
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading transactions from storage', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (!isClient) return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
}

// --- STOCK CALCULATIONS ---
/**
 * Calculates stock balances for each item on a specific target date (YYYY-MM-DD).
 * Opening for target date = Item openingStockBags + sum of all past purchases before target date - sum of all past sales before target date + past adjustments
 * Day purchases = purchases on target date
 * Day sales = sales on target date
 * Closing = Opening + Purchases - Sales + Adjustments
 */
export function calculateDailyStockSummary(
  targetDate: string,
  items: Item[],
  transactions: Transaction[]
): DailyItemSummary[] {
  return items.map((item) => {
    let openingBags = item.openingStockBags || 0;
    let purchaseBags = 0;
    let saleBags = 0;
    let adjustmentBags = 0;

    for (const tx of transactions) {
      if (tx.itemId !== item.id) continue;

      if (tx.date < targetDate) {
        // Prior to this date -> belongs to opening stock calculation
        if (tx.type === 'PURCHASE') {
          openingBags += tx.bags;
        } else if (tx.type === 'SALE') {
          openingBags -= tx.bags;
        } else if (tx.type === 'ADJUSTMENT') {
          openingBags += tx.bags;
        }
      } else if (tx.date === targetDate) {
        // Occurred on the selected target date
        if (tx.type === 'PURCHASE') {
          purchaseBags += tx.bags;
        } else if (tx.type === 'SALE') {
          saleBags += tx.bags;
        } else if (tx.type === 'ADJUSTMENT') {
          adjustmentBags += tx.bags;
        }
      }
    }

    const closingBags = openingBags + purchaseBags - saleBags + adjustmentBags;
    const weightPerBag = item.weightPerBagKg || 50;

    const openingWeightKg = openingBags * weightPerBag;
    const purchaseWeightKg = purchaseBags * weightPerBag;
    const saleWeightKg = saleBags * weightPerBag;
    const closingWeightKg = closingBags * weightPerBag;
    const closingQuintals = Number((closingWeightKg / 100).toFixed(2));

    const isLowStock = closingBags <= (item.minAlertBags || 10);

    return {
      itemId: item.id,
      item,
      openingBags,
      openingWeightKg,
      purchaseBags,
      purchaseWeightKg,
      saleBags,
      saleWeightKg,
      adjustmentBags,
      closingBags,
      closingWeightKg,
      closingQuintals,
      isLowStock,
    };
  });
}

/**
 * Calculates current real-time stock for all items across all time up to present
 */
export function calculateCurrentStock(
  items: Item[],
  transactions: Transaction[]
): Map<string, { currentBags: number; currentWeightKg: number; isLowStock: boolean }> {
  const stockMap = new Map<string, { currentBags: number; currentWeightKg: number; isLowStock: boolean }>();

  items.forEach((item) => {
    let bags = item.openingStockBags || 0;
    for (const tx of transactions) {
      if (tx.itemId === item.id) {
        if (tx.type === 'PURCHASE') bags += tx.bags;
        else if (tx.type === 'SALE') bags -= tx.bags;
        else if (tx.type === 'ADJUSTMENT') bags += tx.bags;
      }
    }
    const weightPerBag = item.weightPerBagKg || 50;
    stockMap.set(item.id, {
      currentBags: bags,
      currentWeightKg: bags * weightPerBag,
      isLowStock: bags <= (item.minAlertBags || 10),
    });
  });

  return stockMap;
}

/**
 * Calculate overall dashboard metrics
 */
export function calculateOverallSummary(
  targetDate: string,
  items: Item[],
  transactions: Transaction[]
): OverallStockSummary {
  const dailySummary = calculateDailyStockSummary(targetDate, items, transactions);

  let totalBags = 0;
  let totalWeightKg = 0;
  let lowStockCount = 0;
  let todayPurchases = 0;
  let todaySales = 0;

  dailySummary.forEach((ds) => {
    totalBags += ds.closingBags;
    totalWeightKg += ds.closingWeightKg;
    if (ds.isLowStock) lowStockCount++;
    todayPurchases += ds.purchaseBags;
    todaySales += ds.saleBags;
  });

  return {
    totalItems: items.length,
    totalBags,
    totalWeightKg,
    totalQuintals: Number((totalWeightKg / 100).toFixed(2)),
    lowStockItemsCount: lowStockCount,
    todayPurchasesBags: todayPurchases,
    todaySalesBags: todaySales,
  };
}

// --- BACKUP & RESTORE ---
export function exportBackupData(): string {
  const items = getStoredItems();
  const transactions = getStoredTransactions();
  const backupObject = {
    appName: 'Jain Bhandar Wholesale Stock Management',
    version: '1.0',
    exportTimestamp: new Date().toISOString(),
    data: {
      items,
      transactions,
    },
  };
  return JSON.stringify(backupObject, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data || !Array.isArray(parsed.data.items) || !Array.isArray(parsed.data.transactions)) {
      return { success: false, message: 'Invalid backup format. Missing items or transactions list.' };
    }
    saveItems(parsed.data.items);
    saveTransactions(parsed.data.transactions);
    return { success: true, message: `Successfully restored ${parsed.data.items.length} items and ${parsed.data.transactions.length} records.` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: `Failed to parse file: ${errorMsg}` };
  }
}

export function resetToDemo(): void {
  saveItems(INITIAL_ITEMS);
  saveTransactions(INITIAL_TRANSACTIONS);
}
