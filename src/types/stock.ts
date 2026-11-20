export type TransactionType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT';

export interface Item {
  id: string;
  name: string; // e.g. "Muri", "Jeera"
  brand: string; // e.g. "Ganesh", "Shyam", "Swastik", "Desi Mandi"
  variety: string; // e.g. "Special 1st Grade", "Medium", "Machine Clean"
  packagingUnit: string; // "Bags", "Katta", "Bori", "Carton", "Tin"
  weightPerBagKg: number; // e.g. 50, 25, 30, 40 kg
  minAlertBags: number; // low stock alert threshold
  openingStockBags: number; // Starting balance bags
  ratePerBag?: number; // Approximate current rate (INR)
  location?: string; // Godown 1, Godown 2, Counter
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  type: TransactionType;
  itemId: string;
  bags: number;
  totalWeightKg: number;
  ratePerBag?: number;
  totalAmount?: number;
  partyName?: string; // Supplier (Inward) or Customer/Retailer (Outward)
  billNo?: string; // Invoice / Challan / Bilty #
  vehicleNo?: string; // Tempo / Truck #
  remarks?: string;
}

export interface DailyItemSummary {
  itemId: string;
  item: Item;
  openingBags: number;
  openingWeightKg: number;
  purchaseBags: number;
  purchaseWeightKg: number;
  saleBags: number;
  saleWeightKg: number;
  adjustmentBags: number;
  closingBags: number;
  closingWeightKg: number;
  closingQuintals: number;
  isLowStock: boolean;
}

export interface OverallStockSummary {
  totalItems: number;
  totalBags: number;
  totalWeightKg: number;
  totalQuintals: number;
  lowStockItemsCount: number;
  todayPurchasesBags: number;
  todaySalesBags: number;
}
