'use client';

import React from 'react';
import { DailyItemSummary } from '@/types/stock';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit3, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';

interface DailyStockTableProps {
  summaries: DailyItemSummary[];
  searchQuery: string;
  onQuickAction: (itemId: string, type: 'PURCHASE' | 'SALE') => void;
  onEditItem: (itemId: string) => void;
  onViewHistory: (itemId: string) => void;
  onAddNewItem: () => void;
}

export const DailyStockTable: React.FC<DailyStockTableProps> = ({
  summaries,
  searchQuery,
  onQuickAction,
  onEditItem,
  onViewHistory,
  onAddNewItem,
}) => {
  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          {searchQuery ? 'No items match your search' : 'No items found in stock register'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          {searchQuery
            ? `No wholesale stock matching "${searchQuery}". Try searching for Muri, Jeera, or a brand name.`
            : 'Start by adding your first wholesale item or commodity to track inventory.'}
        </p>
        <button
          onClick={onAddNewItem}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Wholesale Item</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table header bar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Wholesale Stock Ledger</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {summaries.length} Items
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Realtime calculation: <span className="font-semibold text-slate-700">Opening + Purchase - Sales = Current Stock</span>
          </p>
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Adequate Stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Low Stock Alert
          </span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Item & Variety</th>
              <th className="py-3 px-3 text-center">Pack / Bag</th>
              <th className="py-3 px-3 text-right">Opening</th>
              <th className="py-3 px-3 text-right text-emerald-700">Purchases (+)</th>
              <th className="py-3 px-3 text-right text-rose-700">Sales (-)</th>
              <th className="py-3 px-4 text-right bg-amber-50/60 text-amber-950 font-black">
                Current Stock (Bags)
              </th>
              <th className="py-3 px-3 text-right">Net Weight</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {summaries.map((s) => {
              const item = s.item;
              return (
                <tr 
                  key={s.itemId}
                  className={`hover:bg-slate-50/90 transition-colors ${
                    s.isLowStock ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* Item Name & Brand */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {s.isLowStock && (
                        <span 
                          title={`Low Stock! Below ${item.minAlertBags} bags threshold`}
                          className="text-amber-600 cursor-help"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded text-[10px]">
                        {item.brand}
                      </span>
                      <span>•</span>
                      <span>{item.variety}</span>
                      {item.location && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 text-[10px]">{item.location}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Pack / Bag Size */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 font-semibold text-slate-700 text-xs">
                      {item.weightPerBagKg} kg
                    </span>
                  </td>

                  {/* Opening Bags */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-600">
                    {s.openingBags.toLocaleString('en-IN')}
                  </td>

                  {/* Purchases (+) */}
                  <td className="py-3.5 px-3 text-right">
                    {s.purchaseBags > 0 ? (
                      <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        +{s.purchaseBags}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Sales (-) */}
                  <td className="py-3.5 px-3 text-right">
                    {s.saleBags > 0 ? (
                      <span className="inline-flex items-center gap-0.5 font-bold text-rose-600">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        -{s.saleBags}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Current / Closing Stock (Bags) - Highlighted */}
                  <td className="py-3.5 px-4 text-right bg-amber-50/40">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`text-base font-black ${
                        s.closingBags <= 0 ? 'text-red-600' : 'text-slate-900'
                      }`}>
                        {s.closingBags.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-amber-800">
                        Bags
                      </span>
                    </div>
                  </td>

                  {/* Net Weight in Quintals */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-semibold text-slate-800 text-xs">
                      {s.closingQuintals} <span className="text-[11px] font-normal text-slate-500">Qtl</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ({s.closingWeightKg.toLocaleString('en-IN')} kg)
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center">
                    {s.isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        LOW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        OK
                      </span>
                    )}
                  </td>

                  {/* Quick Action buttons */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* 1-click Quick Outward (Sale) */}
                      <button
                        onClick={() => onQuickAction(s.itemId, 'SALE')}
                        title="Record Sale / Outward"
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition border border-rose-200 shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* 1-click Quick Inward (Purchase) */}
                      <button
                        onClick={() => onQuickAction(s.itemId, 'PURCHASE')}
                        title="Record Purchase / Inward"
                        className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition border border-emerald-200 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      {/* View Ledger History */}
                      <button
                        onClick={() => onViewHistory(s.itemId)}
                        title="View item ledger history"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Item specs */}
                      <button
                        onClick={() => onEditItem(s.itemId)}
                        title="Edit Item Details"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer with grand totals */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-4 font-semibold text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">Total Stock Tally:</span>
          <span className="text-slate-300">
            {summaries.reduce((a, b) => a + b.closingBags, 0).toLocaleString('en-IN')} Bags in Mandi / Godown
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>
            Total Net Weight:{' '}
            <strong className="text-amber-300 font-bold">
              {Number(
                (summaries.reduce((a, b) => a + b.closingWeightKg, 0) / 100).toFixed(2)
              ).toLocaleString('en-IN')}{' '}
              Quintals
            </strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">
            +{summaries.reduce((a, b) => a + b.purchaseBags, 0)} Bags Inward
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-rose-400">
            -{summaries.reduce((a, b) => a + b.saleBags, 0)} Bags Outward
          </span>
        </div>
      </div>
    </div>
  );
};
