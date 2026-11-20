'use client';

import React from 'react';
import { 
  PlusCircle, 
  ArrowDownUp, 
  FileText, 
  Database, 
  Lock, 
  Sparkles, 
  Warehouse
} from 'lucide-react';

interface HeaderProps {
  onOpenQuickTx: (defaultType?: 'PURCHASE' | 'SALE') => void;
  onOpenNewItem: () => void;
  onOpenReport: () => void;
  onOpenBackup: () => void;
  onLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickTx,
  onOpenNewItem,
  onOpenReport,
  onOpenBackup,
  onLock,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-amber-900/40 text-white shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand & Subdomain Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Warehouse className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  JAIN BHANDAR
                  <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    WHOLESALE
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-amber-400/90 hover:underline cursor-pointer">
                  stock.jainbhandar.com
                </span>
                <span>•</span>
                <span className="hidden sm:inline text-slate-300">Purchase - Sales = Stock</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Inward (Purchase) */}
            <button
              onClick={() => onOpenQuickTx('PURCHASE')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
              title="Record Inward / New Purchase"
            >
              <ArrowDownUp className="w-4 h-4 text-emerald-400" />
              <span>+ Purchase (Inward)</span>
            </button>

            {/* Quick Outward (Sale) */}
            <button
              onClick={() => onOpenQuickTx('SALE')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>New Entry</span>
            </button>

            {/* Add Item */}
            <button
              onClick={onOpenNewItem}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Add Brand or New Commodity"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Item</span>
            </button>

            {/* Daily Report PDF / Excel */}
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Download Daily Stock PDF or Excel"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Daily Reports</span>
            </button>

            {/* Backup & Restore */}
            <button
              onClick={onOpenBackup}
              className="inline-flex items-center p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Backup & Restore Data"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Lock / Exit */}
            <button
              onClick={onLock}
              className="inline-flex items-center gap-1 p-2 text-slate-400 hover:text-red-300 rounded-lg hover:bg-slate-800/80 transition"
              title="Lock Screen (Requires PIN 1326)"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline text-xs font-medium text-slate-400">Lock</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
