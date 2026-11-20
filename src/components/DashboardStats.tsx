'use client';

import React from 'react';
import { OverallStockSummary } from '@/types/stock';
import { Package, Scale, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  summary: OverallStockSummary;
  selectedDate: string;
  isToday: boolean;
  onFilterLowStock: () => void;
  isLowStockFiltered: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  summary,
  selectedDate,
  isToday,
  onFilterLowStock,
  isLowStockFiltered,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Total Bags in Godown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Stock</span>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {summary.totalBags.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-slate-500">Bags</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Across {summary.totalItems} varieties</p>
      </div>

      {/* 2. Total Weight (Quintals) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Net Weight</span>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {summary.totalQuintals.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-slate-500">Qtl</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          ≈ {(summary.totalWeightKg / 1000).toFixed(1)} Metric Tonnes
        </p>
      </div>

      {/* 3. Inward / Purchases */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isToday ? 'Today Inward' : 'Day Inward'}
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            +{summary.todayPurchasesBags.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-slate-500">Bags</span>
        </div>
        <p className="text-[11px] text-emerald-600/80 mt-1 font-medium">Purchased / Received</p>
      </div>

      {/* 4. Outward / Sales */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isToday ? 'Today Outward' : 'Day Outward'}
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-rose-600">
            -{summary.todaySalesBags.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-semibold text-slate-500">Bags</span>
        </div>
        <p className="text-[11px] text-rose-600/80 mt-1 font-medium">Sold / Dispatched</p>
      </div>

      {/* 5. Low Stock Alert */}
      <button
        onClick={onFilterLowStock}
        className={`col-span-2 md:col-span-1 text-left rounded-2xl p-4 border transition ${
          isLowStockFiltered
            ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
            : summary.lowStockItemsCount > 0
            ? 'bg-amber-50/60 border-amber-300 text-amber-950 hover:bg-amber-100/60 shadow-sm'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Low Stock
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isLowStockFiltered
                ? 'bg-white/20 text-white'
                : 'bg-amber-200/70 text-amber-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black">
            {summary.lowStockItemsCount}
          </span>
          <span className="text-xs font-semibold opacity-80">Items</span>
        </div>
        <p className="text-[11px] mt-1 font-medium opacity-90">
          {isLowStockFiltered ? 'Click to show all' : 'Click to filter'}
        </p>
      </button>

    </div>
  );
};
