'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Item, Transaction } from '@/types/stock';
import { 
  checkAuth, 
  setAuth, 
  getItems, 
  saveItems, 
  getTransactions, 
  saveTransactions, 
  calculateDayStock 
} from '@/lib/storage';
import { printStockPDF } from '@/lib/pdfExport';
import { 
  getSupabaseConfig, 
  fetchSupabaseItems, 
  fetchSupabaseTransactions,
  saveItemToSupabase,
  deleteItemFromSupabase,
  saveTransactionsToSupabase,
  subscribeToStockChanges
} from '@/lib/supabase';
import { GatekeeperModal } from '@/components/GatekeeperModal';
import { Header } from '@/components/Header';
import { DateBar } from '@/components/DateBar';
import { BulkEntryModal } from '@/components/BulkEntryModal';
import { ItemModal } from '@/components/ItemModal';
import { ManageItemsModal } from '@/components/ManageItemsModal';
import { SupabaseModal } from '@/components/SupabaseModal';
import { Plus, Minus, Printer, Edit2, Search, Trash2, Package } from 'lucide-react';

export default function HomePage() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [search, setSearch] = useState('');

  // Modals
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState<'PURCHASE' | 'SALE'>('PURCHASE');

  const [isManageItemsOpen, setIsManageItemsOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [hasSupabase, setHasSupabase] = useState(false);

  // Load latest data from Supabase (or localStorage fallback)
  const loadAllData = useCallback(async () => {
    const cfg = getSupabaseConfig();
    if (cfg) {
      setHasSupabase(true);
      const [cloudItems, cloudTx] = await Promise.all([
        fetchSupabaseItems(),
        fetchSupabaseTransactions(),
      ]);
      if (cloudItems !== null && cloudTx !== null) {
        setItems(cloudItems);
        setTransactions(cloudTx);
        saveItems(cloudItems);
        saveTransactions(cloudTx);
        return;
      }
    } else {
      setHasSupabase(false);
    }
    setItems(getItems());
    setTransactions(getTransactions());
  }, []);

  // Initial load
  useEffect(() => {
    setIsMounted(true);
    setIsAuthed(checkAuth());
    loadAllData();
  }, [loadAllData]);

  // Realtime Live Subscription: Auto-update when another staff/admin saves stock
  useEffect(() => {
    if (!hasSupabase) return;
    const channel = subscribeToStockChanges(() => {
      loadAllData();
    });
    return () => {
      channel?.unsubscribe();
    };
  }, [hasSupabase, loadAllData]);

  const handleLock = () => {
    setAuth(false);
    setIsAuthed(false);
  };

  // Calculate day stock rows: Opening + Purchase - Sales = Current/Closing Stock
  const stockRows = useMemo(() => {
    return calculateDayStock(selectedDate, items, transactions);
  }, [selectedDate, items, transactions]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return stockRows;
    const q = search.toLowerCase();
    return stockRows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q)
    );
  }, [stockRows, search]);

  // Bulk Purchase / Sale save
  const handleSaveBulk = async (entries: { itemId: string; quantity: number }[]) => {
    const newTxs: Transaction[] = entries.map((e) => ({
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: selectedDate,
      itemId: e.itemId,
      type: bulkType,
      quantity: e.quantity,
    }));

    const updated = [...transactions, ...newTxs];
    setTransactions(updated);
    saveTransactions(updated);

    // Save to Supabase (so all staff devices update immediately)
    if (hasSupabase) {
      await saveTransactionsToSupabase(newTxs);
    }
  };

  // Quick 1-item inline adjustment
  const handleQuickInline = async (itemId: string, type: 'PURCHASE' | 'SALE') => {
    const input = prompt(`Enter ${type === 'PURCHASE' ? 'Purchase (+)' : 'Sale (-)'} quantity:`);
    if (!input) return;
    const qty = parseInt(input.trim());
    if (isNaN(qty) || qty <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: selectedDate,
      itemId,
      type,
      quantity: qty,
    };

    const updated = [...transactions, newTx];
    setTransactions(updated);
    saveTransactions(updated);

    if (hasSupabase) {
      await saveTransactionsToSupabase([newTx]);
    }
  };

  // Item Save & Delete (Add / Edit / Delete)
  const handleSaveItem = async (saved: Item) => {
    const exists = items.some((i) => i.id === saved.id);
    let updated: Item[];
    if (exists) {
      updated = items.map((i) => (i.id === saved.id ? saved : i));
    } else {
      updated = [...items, saved];
    }
    setItems(updated);
    saveItems(updated);

    if (hasSupabase) {
      await saveItemToSupabase(saved);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedItems = items.filter((i) => i.id !== itemId);
    const updatedTx = transactions.filter((t) => t.itemId !== itemId);
    setItems(updatedItems);
    setTransactions(updatedTx);
    saveItems(updatedItems);
    saveTransactions(updatedTx);

    if (hasSupabase) {
      await deleteItemFromSupabase(itemId);
    }
  };

  // Print PDF
  const handlePrintPDF = () => {
    printStockPDF(selectedDate, stockRows);
  };

  // Totals
  const totalOpening = stockRows.reduce((a, b) => a + b.openingStock, 0);
  const totalPurchase = stockRows.reduce((a, b) => a + b.purchase, 0);
  const totalSales = stockRows.reduce((a, b) => a + b.sales, 0);
  const totalClosing = stockRows.reduce((a, b) => a + b.closingStock, 0);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* Password Gatekeeper (1326) */}
      {!isAuthed && (
        <GatekeeperModal onUnlock={() => setIsAuthed(true)} />
      )}

      {/* Clean Simple Header */}
      <Header
        onOpenBulkPurchase={() => {
          setBulkType('PURCHASE');
          setIsBulkOpen(true);
        }}
        onOpenBulkSale={() => {
          setBulkType('SALE');
          setIsBulkOpen(true);
        }}
        onOpenManageItems={() => setIsManageItemsOpen(true)}
        onPrintPDF={handlePrintPDF}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onLock={handleLock}
        isSupabaseConnected={hasSupabase}
      />

      <main className="max-w-6xl mx-auto px-4 py-5">
        
        {/* Simple Date Selector */}
        <DateBar
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />

        {/* Formula & Simple Summary Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
            <span className="font-bold text-gray-700 uppercase tracking-wide">
              Stock Calculation:
            </span>
            <span className="font-mono bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-semibold">
              Opening Stock + Purchase - Sales = Current/Closing Stock
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-[11px] text-gray-500 font-semibold uppercase">Opening Stock</div>
              <div className="text-xl font-bold text-gray-800 mt-0.5">{totalOpening}</div>
            </div>
            <div className="p-2.5 bg-green-50/70 rounded-lg border border-green-200">
              <div className="text-[11px] text-green-700 font-semibold uppercase">Purchase (+)</div>
              <div className="text-xl font-bold text-green-700 mt-0.5">+{totalPurchase}</div>
            </div>
            <div className="p-2.5 bg-red-50/70 rounded-lg border border-red-200">
              <div className="text-[11px] text-red-700 font-semibold uppercase">Sales (-)</div>
              <div className="text-xl font-bold text-red-600 mt-0.5">-{totalSales}</div>
            </div>
            <div className="p-2.5 bg-green-700 text-white rounded-lg shadow-sm">
              <div className="text-[11px] text-green-100 font-bold uppercase">Current Stock</div>
              <div className="text-xl font-black mt-0.5">{totalClosing} Bags</div>
            </div>
          </div>
        </div>

        {/* Controls row: Search + Bulk Buttons + Manage Items + Print */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search item or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-green-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Manage / Add Items Button */}
            <button
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-green-600" />
              <span>Add Item</span>
            </button>

            <button
              onClick={() => setIsManageItemsOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Package className="w-3.5 h-3.5 text-gray-500" />
              <span>Catalog ({items.length})</span>
            </button>

            {/* Bulk Purchase */}
            <button
              onClick={() => {
                setBulkType('PURCHASE');
                setIsBulkOpen(true);
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bulk Purchase</span>
            </button>

            {/* Bulk Sale */}
            <button
              onClick={() => {
                setBulkType('SALE');
                setIsBulkOpen(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-300 text-xs font-bold rounded-lg flex items-center gap-1 transition"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Bulk Sale</span>
            </button>

            {/* Print Stock */}
            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Stock (PDF)</span>
            </button>
          </div>
        </div>

        {/* The Clean Calculator Stock Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-700 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Opening Stock</th>
                  <th className="py-2.5 px-3 text-right text-green-700">Purchase (+)</th>
                  <th className="py-2.5 px-3 text-right text-red-600">Sales (-)</th>
                  <th className="py-2.5 px-3 text-right font-black bg-green-50/60 text-green-900">
                    Current Stock
                  </th>
                  <th className="py-2.5 px-3 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((r, idx) => (
                  <tr key={r.itemId} className="hover:bg-gray-50/80 transition">
                    <td className="py-2.5 px-3 text-center text-gray-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {r.name}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-700">
                      {r.brand}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                      {r.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700 font-semibold">
                      {r.openingStock}
                    </td>
                    <td className="py-2.5 px-3 text-right text-green-700 font-bold">
                      {r.purchase > 0 ? `+${r.purchase}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-600 font-bold">
                      {r.sales > 0 ? `-${r.sales}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-sm bg-green-50/40 text-gray-900">
                      {r.closingStock} <span className="text-[10px] text-gray-500 font-normal">{r.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Quick + Purchase */}
                        <button
                          onClick={() => handleQuickInline(r.itemId, 'PURCHASE')}
                          title="Add Purchase (+)"
                          className="w-6 h-6 rounded bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center font-bold border border-green-200"
                        >
                          +
                        </button>

                        {/* Quick - Sale */}
                        <button
                          onClick={() => handleQuickInline(r.itemId, 'SALE')}
                          title="Deduct Sale (-)"
                          className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center font-bold border border-red-200"
                        >
                          -
                        </button>

                        {/* Edit Item Details */}
                        <button
                          onClick={() => {
                            const it = items.find((i) => i.id === r.itemId);
                            if (it) {
                              setEditingItem(it);
                              setIsItemModalOpen(true);
                            }
                          }}
                          title="Edit Item Details"
                          className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-semibold flex items-center gap-0.5 transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Item */}
                        <button
                          onClick={() => {
                            const it = items.find((i) => i.id === r.itemId);
                            if (it && confirm(`Delete "${it.name} (${it.brand})"?`)) {
                              handleDeleteItem(it.id);
                            }
                          }}
                          title="Delete Item"
                          className="w-6 h-6 rounded hover:bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold border-t border-gray-200 text-gray-900">
                  <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[11px]">
                    Total:
                  </td>
                  <td className="py-2.5 px-3 text-right">{totalOpening}</td>
                  <td className="py-2.5 px-3 text-right text-green-700">+{totalPurchase}</td>
                  <td className="py-2.5 px-3 text-right text-red-600">-{totalSales}</td>
                  <td className="py-2.5 px-3 text-right text-sm font-black bg-green-100/70 text-green-950">
                    {totalClosing} Bags
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </main>

      {/* Bulk Entry Modal */}
      <BulkEntryModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        type={bulkType}
        date={selectedDate}
        items={items}
        stockRows={stockRows}
        onSave={handleSaveBulk}
      />

      {/* Item Modal (Add / Edit) */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      {/* Manage Items Catalog Modal (Add / Edit / Delete List) */}
      <ManageItemsModal
        isOpen={isManageItemsOpen}
        onClose={() => setIsManageItemsOpen(false)}
        items={items}
        onAddNew={() => {
          setEditingItem(null);
          setIsItemModalOpen(true);
        }}
        onEditItem={(item) => {
          setEditingItem(item);
          setIsItemModalOpen(true);
        }}
        onDeleteItem={handleDeleteItem}
      />

      {/* Supabase Link Modal */}
      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        items={items}
        transactions={transactions}
        onSynced={loadAllData}
      />

    </div>
  );
}
