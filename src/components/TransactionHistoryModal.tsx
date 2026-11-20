'use client';

import React, { useState } from 'react';
import { Transaction, Item } from '@/types/stock';
import { 
  X, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  Search, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { exportAllTransactionsExcel } from '@/lib/excelExport';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  items: Item[];
  filterItemId?: string;
  onDeleteTransaction: (txId: string) => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  items,
  filterItemId,
  onDeleteTransaction,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(filterItemId || 'ALL');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PURCHASE' | 'SALE' | 'ADJUSTMENT'>('ALL');

  if (!isOpen) return null;

  const itemMap = new Map<string, Item>(items.map((i) => [i.id, i]));

  // Filter transactions
  const filtered = transactions
    .filter((tx) => {
      if (selectedItemId !== 'ALL' && tx.itemId !== selectedItemId) return false;
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const item = itemMap.get(tx.itemId);
        const matchItem = item?.name.toLowerCase().includes(q) || item?.brand.toLowerCase().includes(q);
        const matchParty = tx.partyName?.toLowerCase().includes(q);
        const matchBill = tx.billNo?.toLowerCase().includes(q);
        const matchVehicle = tx.vehicleNo?.toLowerCase().includes(q);
        return matchItem || matchParty || matchBill || matchVehicle;
      }
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleDelete = (tx: Transaction) => {
    const item = itemMap.get(tx.itemId);
    const confirmDelete = window.confirm(
      `Delete this ${tx.type} entry of ${tx.bags} bags for ${item?.name || 'Item'} (${tx.date})?\nThis will adjust current stock accordingly.`
    );
    if (confirmDelete) {
      onDeleteTransaction(tx.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Audit Ledger
              </span>
              <span className="text-xs text-slate-400">Total {filtered.length} entries</span>
            </div>
            <h2 className="text-xl font-bold mt-1">Transaction History & Day Records</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAllTransactionsExcel(filtered)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
              title="Export filtered records to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          {/* Item filter */}
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white outline-none"
          >
            <option value="ALL">All Items & Brands</option>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} - {it.brand}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <div className="flex items-center rounded-xl bg-slate-200/80 p-0.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('SALE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                typeFilter === 'SALE' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setTypeFilter('PURCHASE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                typeFilter === 'PURCHASE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setTypeFilter('ADJUSTMENT')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                typeFilter === 'ADJUSTMENT' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Adjustments
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search party, bill#, tempo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-amber-500 bg-white"
            />
          </div>
        </div>

        {/* Scrollable Ledger Table */}
        <div className="overflow-y-auto flex-1 p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No transactions found matching your criteria</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Item / Brand</th>
                  <th className="py-2.5 px-3 text-right">Bags</th>
                  <th className="py-2.5 px-3 text-right">Net Weight</th>
                  <th className="py-2.5 px-3 text-right">Rate & Amount</th>
                  <th className="py-2.5 px-3">Party / Bill #</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => {
                  const item = itemMap.get(tx.itemId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{tx.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {tx.type === 'PURCHASE' ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                            <ArrowDownLeft className="w-3 h-3" />
                            PURCHASE
                          </span>
                        ) : tx.type === 'SALE' ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
                            <ArrowUpRight className="w-3 h-3" />
                            SALE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700 text-[10px]">
                            ADJUST
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item?.name || 'Unknown Item'}</div>
                        <div className="text-[10px] text-slate-500">
                          {item?.brand} • {item?.variety}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {tx.type === 'PURCHASE' ? `+${tx.bags}` : tx.type === 'SALE' ? `-${tx.bags}` : tx.bags} Bags
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        {(tx.totalWeightKg / 100).toFixed(2)} Qtl
                        <div className="text-[10px] text-slate-400">({tx.totalWeightKg} kg)</div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {tx.ratePerBag ? (
                          <>
                            <div className="font-bold text-slate-900">₹{tx.totalAmount?.toLocaleString('en-IN') || 0}</div>
                            <div className="text-[10px] text-slate-400">@ ₹{tx.ratePerBag}/bag</div>
                          </>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {tx.partyName && <div className="font-semibold text-slate-800">{tx.partyName}</div>}
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          {tx.billNo && <span>Bill: {tx.billNo}</span>}
                          {tx.vehicleNo && <span>Veh: {tx.vehicleNo}</span>}
                        </div>
                        {tx.remarks && <div className="text-[10px] text-slate-500 italic mt-0.5">{tx.remarks}</div>}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDelete(tx)}
                          title="Delete / Undo this entry"
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center mx-auto transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition"
          >
            Close History
          </button>
        </div>

      </div>
    </div>
  );
};
