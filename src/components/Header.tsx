'use client';

import React from 'react';
import { Plus, Minus, Printer, Database, Lock, Package } from 'lucide-react';

interface HeaderProps {
  onOpenBulkPurchase: () => void;
  onOpenBulkSale: () => void;
  onOpenManageItems: () => void;
  onPrintPDF: () => void;
  onOpenSupabase: () => void;
  onLock: () => void;
  isSupabaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBulkPurchase,
  onOpenBulkSale,
  onOpenManageItems,
  onPrintPDF,
  onOpenSupabase,
  onLock,
  isSupabaseConnected,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Simple Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Jain Bhandar
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Bulk Purchase */}
          <button
            onClick={onOpenBulkPurchase}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk Purchase</span>
            <span className="sm:hidden">Purchase</span>
          </button>

          {/* Bulk Sale */}
          <button
            onClick={onOpenBulkSale}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-300 text-xs font-bold transition flex items-center gap-1"
          >
            <Minus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk Sale</span>
            <span className="sm:hidden">Sale</span>
          </button>

          {/* Manage Items (Add / Edit / Delete) */}
          <button
            onClick={onOpenManageItems}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5"
            title="Add, Edit, or Delete Items"
          >
            <Package className="w-3.5 h-3.5 text-gray-600" />
            <span>Items</span>
          </button>

          {/* Print Stock PDF */}
          <button
            onClick={onPrintPDF}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition flex items-center gap-1"
            title="Print Stock PDF"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span className="hidden md:inline">Print Stock</span>
          </button>

          {/* Supabase Link */}
          <button
            onClick={onOpenSupabase}
            className={`p-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
              isSupabaseConnected
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-800'
            }`}
            title="Supabase Database Settings"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {isSupabaseConnected ? 'Cloud Active' : 'Supabase'}
            </span>
          </button>

          {/* Lock */}
          <button
            onClick={onLock}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            title="Lock Portal (Password 1326)"
          >
            <Lock className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
