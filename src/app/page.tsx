'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Item, Transaction, TransactionType } from '@/types/stock';
import { 
  checkAuth, 
  setAuthenticated, 
  getStoredItems, 
  saveItems, 
  getStoredTransactions, 
  saveTransactions,
  calculateDailyStockSummary,
  calculateOverallSummary,
  calculateCurrentStock
} from '@/lib/storage';
import { GatekeeperModal } from '@/components/GatekeeperModal';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { DateSelector } from '@/components/DateSelector';
import { DailyStockTable } from '@/components/DailyStockTable';
import { QuickTransactionModal } from '@/components/QuickTransactionModal';
import { ItemManageModal } from '@/components/ItemManageModal';
import { TransactionHistoryModal } from '@/components/TransactionHistoryModal';
import { ExportReportModal } from '@/components/ExportReportModal';
import { BackupRestoreModal } from '@/components/BackupRestoreModal';
import { Search, Filter, Plus, FileSpreadsheet, PackagePlus } from 'lucide-react';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Core Data State
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Date & View Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLowStockOnly, setIsLowStockOnly] = useState<boolean>(false);

  // Modals state
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [quickTxDefaultType, setQuickTxDefaultType] = useState<TransactionType>('SALE');
  const [quickTxDefaultItemId, setQuickTxDefaultItemId] = useState<string | undefined>(undefined);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyFilterItemId, setHistoryFilterItemId] = useState<string | undefined>(undefined);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Mount effect to check auth and load data
  useEffect(() => {
    setIsMounted(true);
    const authed = checkAuth();
    setIsAuthenticated(authed);
    setItems(getStoredItems());
    setTransactions(getStoredTransactions());
  }, []);

  // Reload data from storage
  const reloadData = () => {
    setItems(getStoredItems());
    setTransactions(getStoredTransactions());
  };

  // Lock handler (requires PIN 1326 again)
  const handleLock = () => {
    setAuthenticated(false);
    setIsAuthenticated(false);
  };

  // Calculations
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isToday = selectedDate === todayStr;

  const currentStockMap = useMemo(() => {
    return calculateCurrentStock(items, transactions);
  }, [items, transactions]);

  const dailySummaries = useMemo(() => {
    return calculateDailyStockSummary(selectedDate, items, transactions);
  }, [selectedDate, items, transactions]);

  const overallSummary = useMemo(() => {
    return calculateOverallSummary(selectedDate, items, transactions);
  }, [selectedDate, items, transactions]);

  // Filter summaries based on search and low stock toggle
  const filteredSummaries = useMemo(() => {
    return dailySummaries.filter((ds) => {
      if (isLowStockOnly && !ds.isLowStock) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ds.item.name.toLowerCase().includes(q);
        const matchBrand = ds.item.brand.toLowerCase().includes(q);
        const matchVariety = ds.item.variety.toLowerCase().includes(q);
        const matchLocation = ds.item.location?.toLowerCase().includes(q);
        return matchName || matchBrand || matchVariety || matchLocation;
      }
      return true;
    });
  }, [dailySummaries, isLowStockOnly, searchQuery]);

  // Transaction Handler
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (txId: string) => {
    const updated = transactions.filter((t) => t.id !== txId);
    setTransactions(updated);
    saveTransactions(updated);
  };

  // Item Handlers
  const handleSaveItem = (itemToSave: Item) => {
    const exists = items.some((i) => i.id === itemToSave.id);
    let updated: Item[];
    if (exists) {
      updated = items.map((i) => (i.id === itemToSave.id ? itemToSave : i));
    } else {
      updated = [...items, itemToSave];
    }
    setItems(updated);
    saveItems(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter((i) => i.id !== itemId);
    const updatedTransactions = transactions.filter((t) => t.itemId !== itemId);
    setItems(updatedItems);
    saveItems(updatedItems);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  // Quick Action from table row (+ or -)
  const handleRowQuickAction = (itemId: string, actionType: 'PURCHASE' | 'SALE') => {
    setQuickTxDefaultItemId(itemId);
    setQuickTxDefaultType(actionType);
    setIsQuickTxOpen(true);
  };

  // Row Edit Item
  const handleRowEditItem = (itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (it) {
      setEditingItem(it);
      setIsItemModalOpen(true);
    }
  };

  // Row View History
  const handleRowViewHistory = (itemId: string) => {
    setHistoryFilterItemId(itemId);
    setIsHistoryModalOpen(true);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-300 font-bold">
        Loading Jain Bhandar Wholesale Stock...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Security Gatekeeper (requires PIN 1326) */}
      {!isAuthenticated && (
        <GatekeeperModal onUnlock={() => setIsAuthenticated(true)} />
      )}

      {/* Main App Content (only accessible when authenticated) */}
      <Header
        onOpenQuickTx={(type) => {
          setQuickTxDefaultItemId(undefined);
          setQuickTxDefaultType(type || 'SALE');
          setIsQuickTxOpen(true);
        }}
        onOpenNewItem={() => {
          setEditingItem(null);
          setIsItemModalOpen(true);
        }}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onLock={handleLock}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Date Selector Banner */}
        <DateSelector
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />

        {/* Dashboard Top Metrics */}
        <DashboardStats
          summary={overallSummary}
          selectedDate={selectedDate}
          isToday={isToday}
          isLowStockFiltered={isLowStockOnly}
          onFilterLowStock={() => setIsLowStockOnly((prev) => !prev)}
        />

        {/* Search & Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Muri, Jeera, Brand (e.g. Shyam, Ganesh)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLowStockOnly((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                isLowStockOnly
                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isLowStockOnly ? 'Showing: Low Stock' : 'Filter Low Stock'}</span>
            </button>

            <button
              onClick={() => {
                setHistoryFilterItemId(undefined);
                setIsHistoryModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">All Ledger History</span>
              <span className="sm:hidden">Ledger</span>
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Item</span>
            </button>
          </div>

        </div>

        {/* Primary Wholesale Daily Stock Table */}
        <DailyStockTable
          summaries={filteredSummaries}
          searchQuery={searchQuery}
          onQuickAction={handleRowQuickAction}
          onEditItem={handleRowEditItem}
          onViewHistory={handleRowViewHistory}
          onAddNewItem={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
        />

        {/* Help / Guidance note */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              <strong>Formula:</strong> Opening Balance + Purchases (Inward) - Sales (Outward) = Current Stock
            </span>
          </div>
          <div className="font-mono text-slate-400">
            stock.jainbhandar.com • Ready for Vercel Deployment
          </div>
        </div>

      </main>

      {/* Quick Inward / Outward Transaction Modal */}
      <QuickTransactionModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
        items={items}
        currentStockMap={currentStockMap}
        defaultItemId={quickTxDefaultItemId}
        defaultType={quickTxDefaultType}
        selectedDate={selectedDate}
        onSave={handleSaveTransaction}
      />

      {/* Item Create / Edit Modal */}
      <ItemManageModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      {/* Transaction History & Audit Modal */}
      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        transactions={transactions}
        items={items}
        filterItemId={historyFilterItemId}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Export Report (PDF / Excel / Print) Modal */}
      <ExportReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedDate={selectedDate}
        summaries={dailySummaries}
        totalBags={overallSummary.totalBags}
        totalQuintals={overallSummary.totalQuintals}
      />

      {/* Data Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={reloadData}
      />

    </div>
  );
}
