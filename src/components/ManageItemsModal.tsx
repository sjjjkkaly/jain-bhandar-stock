'use client';

import React, { useState } from 'react';
import { Item } from '@/types/stock';
import { X, Plus, Edit2, Trash2, Search, Package } from 'lucide-react';

interface ManageItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onAddNew: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ManageItemsModal: React.FC<ManageItemsModalProps> = ({
  isOpen,
  onClose,
  items,
  onAddNew,
  onEditItem,
  onDeleteItem,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = items.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (it: Item) => {
    if (confirm(`Are you sure you want to delete "${it.name} (${it.brand})"?\nThis will remove it from both Supabase and current stock.`)) {
      onDeleteItem(it.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-green-400" />
            <h2 className="text-base font-bold">Manage Items Catalog</h2>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-mono">
              {items.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Actions: Search + Add New Button */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-green-600"
            />
          </div>

          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>

        {/* Items List Table */}
        <div className="overflow-y-auto flex-1 p-0">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-sm font-semibold">No items found</p>
              <button
                onClick={onAddNew}
                className="mt-3 text-xs font-bold text-green-700 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add your first item</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[11px] sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4">Brand</th>
                  <th className="py-2.5 px-4 text-center">Packaging Unit</th>
                  <th className="py-2.5 px-4 text-right">Initial Stock</th>
                  <th className="py-2.5 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {it.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      {it.brand}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500 font-medium">
                      {it.unit || 'Bags'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800">
                      {it.openingStock} {it.unit || 'Bags'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditItem(it)}
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs flex items-center gap-1 transition"
                          title="Edit this item"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(it)}
                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs flex items-center gap-1 transition"
                          title="Delete this item"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Changes are synced live with Supabase cloud.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs rounded-lg transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
