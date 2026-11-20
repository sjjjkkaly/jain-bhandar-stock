'use client';

import React, { useState } from 'react';
import { Item, DayStockRow } from '@/types/stock';
import { X, Check } from 'lucide-react';

interface BulkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'PURCHASE' | 'SALE';
  date: string;
  items: Item[];
  stockRows: DayStockRow[];
  onSave: (entries: { itemId: string; quantity: number }[]) => void;
}

export const BulkEntryModal: React.FC<BulkEntryModalProps> = ({
  isOpen,
  onClose,
  type,
  date,
  items,
  stockRows,
  onSave,
}) => {
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const isPurchase = type === 'PURCHASE';

  const handleQtyChange = (itemId: string, val: string) => {
    setQuantities((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entries: { itemId: string; quantity: number }[] = [];

    for (const item of items) {
      const q = parseInt(quantities[item.id] || '0');
      if (q > 0) {
        entries.push({ itemId: item.id, quantity: q });
      }
    }

    if (entries.length === 0) {
      alert('Please enter a quantity for at least one item.');
      return;
    }

    onSave(entries);
    setQuantities({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className={`p-4 flex items-center justify-between text-white ${
          isPurchase ? 'bg-green-700' : 'bg-red-700'
        }`}>
          <div>
            <h2 className="text-base font-bold">
              {isPurchase ? 'Bulk Purchase (Inward Stock)' : 'Bulk Sale (Outward Stock)'}
            </h2>
            <p className="text-xs text-white/80">Date: {date}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item rows */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-gray-500">
            Enter {isPurchase ? 'purchased' : 'sold'} bags for each item below:
          </p>

          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {items.map((it) => {
              const row = stockRows.find((r) => r.itemId === it.id);
              const currentStock = row ? row.closingStock : it.openingStock;

              return (
                <div key={it.id} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      {it.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Brand: <span className="font-medium text-gray-700">{it.brand}</span> • Current: <strong>{currentStock} {it.unit || 'Bags'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-32">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={quantities[it.id] || ''}
                      onChange={(e) => handleQtyChange(it.id, e.target.value)}
                      className="w-full text-right font-bold text-sm px-2.5 py-1.5 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-100"
                    />
                    <span className="text-xs text-gray-400 font-semibold">
                      {it.unit || 'Bags'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition flex items-center gap-1.5 ${
                isPurchase ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Save {isPurchase ? 'Purchases' : 'Sales'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
