'use client';

import React, { useState, useEffect } from 'react';
import { Item, Transaction, TransactionType } from '@/types/stock';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  Package, 
  Truck, 
  FileText, 
  User, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  currentStockMap: Map<string, { currentBags: number; currentWeightKg: number }>;
  defaultItemId?: string;
  defaultType?: TransactionType;
  selectedDate: string;
  onSave: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  items,
  currentStockMap,
  defaultItemId,
  defaultType = 'SALE',
  selectedDate,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [itemId, setItemId] = useState<string>(defaultItemId || (items[0]?.id || ''));
  const [bags, setBags] = useState<string>('');
  const [ratePerBag, setRatePerBag] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [billNo, setBillNo] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [txDate, setTxDate] = useState<string>(selectedDate);
  const [error, setError] = useState<string | null>(null);

  // Sync defaults when modal opens or item changes
  useEffect(() => {
    if (defaultItemId) {
      setItemId(defaultItemId);
    } else if (items.length > 0 && !itemId) {
      setItemId(items[0].id);
    }
    if (defaultType) {
      setType(defaultType);
    }
    setTxDate(selectedDate);
  }, [defaultItemId, defaultType, isOpen, items, selectedDate]);

  const selectedItem = items.find((i) => i.id === itemId);
  const currentStockInfo = selectedItem ? currentStockMap.get(selectedItem.id) : null;
  const currentBags = currentStockInfo?.currentBags ?? 0;

  // Auto rate prefill if available
  useEffect(() => {
    if (selectedItem?.ratePerBag && !ratePerBag) {
      setRatePerBag(selectedItem.ratePerBag.toString());
    }
  }, [selectedItem]);

  if (!isOpen) return null;

  const bagsNum = parseInt(bags) || 0;
  const weightPerBag = selectedItem?.weightPerBagKg || 50;
  const totalWeightKg = bagsNum * weightPerBag;
  const totalQuintals = (totalWeightKg / 100).toFixed(2);
  const rateNum = parseFloat(ratePerBag) || 0;
  const totalAmount = bagsNum * rateNum;

  const handleQuickAddBags = (amount: number) => {
    const current = parseInt(bags) || 0;
    setBags((current + amount).toString());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      setError('Please select a wholesale item.');
      return;
    }
    if (bagsNum <= 0) {
      setError('Please enter a valid number of bags (greater than 0).');
      return;
    }

    // Safety check for sales exceeding available bags
    if (type === 'SALE' && bagsNum > currentBags) {
      const confirmExceed = window.confirm(
        `Warning: You are recording a sale of ${bagsNum} bags, but current stock is only ${currentBags} bags. This will result in negative stock. Do you wish to proceed?`
      );
      if (!confirmExceed) return;
    }

    onSave({
      date: txDate,
      type,
      itemId: selectedItem.id,
      bags: bagsNum,
      totalWeightKg,
      ratePerBag: rateNum > 0 ? rateNum : undefined,
      totalAmount: totalAmount > 0 ? totalAmount : undefined,
      partyName: partyName.trim() || undefined,
      billNo: billNo.trim() || undefined,
      vehicleNo: vehicleNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });

    // Reset form
    setBags('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between transition-colors ${
          type === 'PURCHASE'
            ? 'bg-gradient-to-r from-emerald-700 to-emerald-600'
            : type === 'SALE'
            ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700'
            : 'bg-gradient-to-r from-slate-700 to-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                {type === 'PURCHASE' ? 'Inward / आवक' : type === 'SALE' ? 'Outward / जावक' : 'Adjustment'}
              </span>
              <span className="text-xs text-white/80">Date: {txDate}</span>
            </div>
            <h2 className="text-xl font-black mt-1">
              {type === 'PURCHASE' ? 'Record Wholesale Purchase' : type === 'SALE' ? 'Record Wholesale Sale' : 'Stock Adjustment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Type Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setType('SALE')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              type === 'SALE'
                ? 'bg-white text-amber-800 shadow-sm border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            <span>Sale (जावक)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('PURCHASE')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              type === 'PURCHASE'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Purchase (आवक)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('ADJUSTMENT')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
              type === 'ADJUSTMENT'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Adjustment / Recount</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Wholesale Item & Brand *
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white"
            >
              {items.map((item) => {
                const stock = currentStockMap.get(item.id)?.currentBags ?? 0;
                return (
                  <option key={item.id} value={item.id}>
                    {item.name} • {item.brand} ({item.variety}) — Stock: {stock} Bags
                  </option>
                );
              })}
            </select>
            
            {/* Live Stock info badge */}
            {selectedItem && (
              <div className="mt-1.5 flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-600 font-medium">
                  Current Stock: <strong className="text-slate-900">{currentBags} Bags</strong> ({selectedItem.weightPerBagKg} kg/bag)
                </span>
                <span className="text-slate-500">
                  ≈ {((currentBags * selectedItem.weightPerBagKg) / 100).toFixed(1)} Qtl
                </span>
              </div>
            )}
          </div>

          {/* Quantity Bags & Quick Adder Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantity in Bags *
              </label>
              <span className="text-[11px] text-slate-400">Quick add:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 16 or 210"
                  value={bags}
                  onChange={(e) => {
                    setBags(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-lg font-black text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                  BAGS
                </span>
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAddBags(amt)}
                    className="px-2 py-2.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-xs font-bold text-slate-700 hover:text-amber-900 border border-slate-200 transition"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Weight Card */}
            {bagsNum > 0 && selectedItem && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs text-amber-950 font-medium">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Total Net Weight:</span>
                </div>
                <div>
                  <strong className="text-sm font-black text-amber-900">{totalQuintals} Qtl</strong>{' '}
                  <span className="text-amber-700">({totalWeightKg.toLocaleString('en-IN')} kg)</span>
                </div>
              </div>
            )}
          </div>

          {/* Rate per Bag & Total Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rate per Bag (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 2100"
                value={ratePerBag}
                onChange={(e) => setRatePerBag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Bill Amount (₹)
              </label>
              <div className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-800">
                {totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : '₹0'}
              </div>
            </div>
          </div>

          {/* Party Name & Bill/Challan No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{type === 'PURCHASE' ? 'Supplier / Mandi' : 'Customer / Retailer'}</span>
              </label>
              <input
                type="text"
                placeholder={type === 'PURCHASE' ? 'e.g. Shyam Agro Mills' : 'e.g. Radhe Wholesale Mart'}
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Bill / Challan / Bilty #</span>
              </label>
              <input
                type="text"
                placeholder="e.g. JB-1044 / INV-89"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Vehicle No & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Vehicle / Tempo #</span>
              </label>
              <input
                type="text"
                placeholder="e.g. WB-19-4821"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Entry Date
              </label>
              <input
                type="date"
                required
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Mandi Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Loaded from Godown 2, Direct payment"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition ${
                type === 'PURCHASE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : type === 'SALE'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                  : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                Confirm & Record{' '}
                {type === 'PURCHASE' ? 'Inward Purchase' : type === 'SALE' ? 'Outward Sale' : 'Adjustment'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
