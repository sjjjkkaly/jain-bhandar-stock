'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '@/types/stock';
import { X, Trash2, Check, PackagePlus, Edit } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Item | null;
  onSave: (item: Item) => void;
  onDelete?: (itemId: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  editItem,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('Bags');
  const [openingStock, setOpeningStock] = useState('0');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setBrand(editItem.brand);
      setUnit(editItem.unit || 'Bags');
      setOpeningStock(editItem.openingStock.toString());
    } else {
      setName('');
      setBrand('');
      setUnit('Bags');
      setOpeningStock('0');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const item: Item = {
      id: editItem ? editItem.id : `item-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || 'General',
      unit: unit.trim() || 'Bags',
      openingStock: parseInt(openingStock) || 0,
    };

    onSave(item);
    onClose();
  };

  const handleDelete = () => {
    if (!editItem || !onDelete) return;
    if (confirm(`Are you sure you want to delete "${editItem.name} (${editItem.brand})"?\nThis will remove it from inventory.`)) {
      onDelete(editItem.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editItem ? (
              <Edit className="w-4 h-4 text-green-400" />
            ) : (
              <PackagePlus className="w-4 h-4 text-green-400" />
            )}
            <h2 className="text-sm font-bold">
              {editItem ? 'Edit Item Details' : 'Add New Item to Inventory'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Muri, Jeera, Chana Dal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Brand *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shyam, Ganesh, Swastik"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold outline-none focus:border-green-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Packaging Unit
              </label>
              <input
                type="text"
                placeholder="Bags"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-right outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            {editItem && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{editItem ? 'Save Changes' : 'Save Item'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
