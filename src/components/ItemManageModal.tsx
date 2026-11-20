'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '@/types/stock';
import { X, Check, Trash2, Package, Sparkles } from 'lucide-react';

interface ItemManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Item | null;
  onSave: (item: Item) => void;
  onDelete?: (itemId: string) => void;
}

export const ItemManageModal: React.FC<ItemManageModalProps> = ({
  isOpen,
  onClose,
  editItem,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [variety, setVariety] = useState('');
  const [packagingUnit, setPackagingUnit] = useState('Bags');
  const [weightPerBagKg, setWeightPerBagKg] = useState('50');
  const [openingStockBags, setOpeningStockBags] = useState('0');
  const [minAlertBags, setMinAlertBags] = useState('20');
  const [ratePerBag, setRatePerBag] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setBrand(editItem.brand);
      setVariety(editItem.variety);
      setPackagingUnit(editItem.packagingUnit || 'Bags');
      setWeightPerBagKg(editItem.weightPerBagKg.toString());
      setOpeningStockBags(editItem.openingStockBags.toString());
      setMinAlertBags(editItem.minAlertBags.toString());
      setRatePerBag(editItem.ratePerBag ? editItem.ratePerBag.toString() : '');
      setLocation(editItem.location || '');
      setNotes(editItem.notes || '');
    } else {
      // Defaults for new item
      setName('');
      setBrand('');
      setVariety('');
      setPackagingUnit('Bags');
      setWeightPerBagKg('50');
      setOpeningStockBags('0');
      setMinAlertBags('20');
      setRatePerBag('');
      setLocation('Main Godown');
      setNotes('');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedItem: Item = {
      id: editItem ? editItem.id : `item-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || 'General / Desi',
      variety: variety.trim() || 'Standard Grade',
      packagingUnit: packagingUnit.trim() || 'Bags',
      weightPerBagKg: parseFloat(weightPerBagKg) || 50,
      openingStockBags: parseInt(openingStockBags) || 0,
      minAlertBags: parseInt(minAlertBags) || 15,
      ratePerBag: ratePerBag ? parseFloat(ratePerBag) : undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editItem ? editItem.createdAt : new Date().toISOString(),
    };

    onSave(savedItem);
    onClose();
  };

  const handleDelete = () => {
    if (!editItem || !onDelete) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${editItem.name} (${editItem.brand})" from your catalog?`
    );
    if (confirmDelete) {
      onDelete(editItem.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editItem ? 'Edit Wholesale Item' : 'Add New Wholesale Commodity'}
              </h2>
              <p className="text-xs text-slate-400">
                Setup brand, bag weight & opening stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Commodity Name & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Commodity Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muri, Jeera, Chana Dal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Mill Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shyam, Ganesh, Swastik"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            </div>
          </div>

          {/* Variety & Packaging Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Variety / Type / Grade
              </label>
              <input
                type="text"
                placeholder="e.g. Bhaata Super, Machine Clean"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Packaging Unit
              </label>
              <select
                value={packagingUnit}
                onChange={(e) => setPackagingUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:border-amber-500 outline-none"
              >
                <option value="Bags">Bags (बोरी / कट्टा)</option>
                <option value="Katta">Katta (छोटा कट्टा)</option>
                <option value="Bori">Bori (बड़ी बोरी)</option>
                <option value="Carton">Carton / Box</option>
                <option value="Tin">Tin / Pipa</option>
              </select>
            </div>
          </div>

          {/* Weight per Bag & Opening Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Weight per Bag (Kg) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  placeholder="50"
                  value={weightPerBagKg}
                  onChange={(e) => setWeightPerBagKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:border-amber-500 outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">
                  KG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">e.g. 25kg for Muri, 50kg for Jeera</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Stock (Bags)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={openingStockBags}
                  onChange={(e) => setOpeningStockBags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:border-amber-500 outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">
                  BAGS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Initial bags count in godown</p>
            </div>
          </div>

          {/* Min Alert Threshold & Reference Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Stock Alert Limit (Bags)
              </label>
              <input
                type="number"
                min="1"
                placeholder="20"
                value={minAlertBags}
                onChange={(e) => setMinAlertBags(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:border-amber-500 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Alerts when stock drops below this</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference Rate (₹ / Bag)
              </label>
              <input
                type="number"
                placeholder="e.g. 14500"
                value={ratePerBag}
                onChange={(e) => setRatePerBag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Godown Location & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Godown Location
              </label>
              <input
                type="text"
                placeholder="e.g. Godown 1 - Section A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh Mandi Lot"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            {editItem && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 transition border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              <Check className="w-4 h-4" />
              <span>{editItem ? 'Save Item Changes' : 'Save New Item to Catalog'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
