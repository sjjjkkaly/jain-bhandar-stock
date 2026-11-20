'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '@/types/stock';
import { X, Check, Plus, Minus } from 'lucide-react';

interface QuickAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  type: 'PURCHASE' | 'SALE';
  currentStock: number;
  onConfirm: (quantity: number) => Promise<void>;
}

export const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({
  isOpen,
  onClose,
  item,
  type,
  currentStock,
  onConfirm,
}) => {
  const [qty, setQty] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQty('1');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isPurchase = type === 'PURCHASE';
  const qtyNum = parseInt(qty) || 0;

  const handleQuickAdd = (amt: number) => {
    setQty((prev) => {
      const current = parseInt(prev) || 0;
      return Math.max(1, current + amt).toString();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyNum <= 0) {
      alert('Please enter a quantity greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(qtyNum);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-center">
        
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          isPurchase ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              {isPurchase ? '+ Purchase (Inward)' : '- Sale (Outward)'}
            </span>
            <h3 className="text-base font-black mt-1">{item.name}</h3>
            <p className="text-xs text-white/90">Brand: {item.brand}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="bg-gray-50 border-b border-gray-100 py-2 px-4 text-xs text-gray-600 flex items-center justify-between">
          <span>Current Stock:</span>
          <strong className="text-gray-900 font-bold">{currentStock} {item.unit || 'Bags'}</strong>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Number of {item.unit || 'Bags'} to {isPurchase ? 'Add' : 'Deduct'}
            </label>

            {/* Stepper Input */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(-1)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center text-gray-700 active:scale-95 transition"
              >
                -
              </button>

              <input
                type="number"
                min="1"
                step="1"
                required
                autoFocus
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-24 text-center font-black text-2xl py-2 px-2 border-2 border-gray-300 rounded-xl outline-none focus:border-green-600 text-gray-900"
              />

              <button
                type="button"
                onClick={() => handleQuickAdd(1)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center text-gray-700 active:scale-95 transition"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[2, 4, 10, 20].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQty(amt.toString())}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* New Stock Preview */}
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
            <span>Resulting Stock:</span>
            <strong className={`text-sm font-bold ${
              isPurchase ? 'text-green-700' : (currentStock - qtyNum < 0 ? 'text-red-600' : 'text-gray-900')
            }`}>
              {isPurchase ? currentStock + qtyNum : currentStock - qtyNum} {item.unit || 'Bags'}
            </strong>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 ${
              isPurchase ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving to Cloud...' : `Confirm ${isPurchase ? 'Purchase' : 'Sale'}`}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
