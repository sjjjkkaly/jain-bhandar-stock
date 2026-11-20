'use client';

import React from 'react';
import { DailyItemSummary } from '@/types/stock';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Download,
  Warehouse
} from 'lucide-react';
import { generateDailyStockPDF } from '@/lib/pdfExport';
import { exportDailyStockExcel } from '@/lib/excelExport';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  summaries: DailyItemSummary[];
  totalBags: number;
  totalQuintals: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  summaries,
  totalBags,
  totalQuintals,
}) => {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    generateDailyStockPDF(selectedDate, summaries, totalBags, totalQuintals);
  };

  const handleDownloadExcel = () => {
    exportDailyStockExcel(selectedDate, summaries);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Daily Closing Stock Report</h2>
              <p className="text-xs text-amber-200">Date: {selectedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Quick snapshot preview */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-center">
            <div className="text-xs uppercase font-bold text-amber-900 tracking-wider mb-1">
              Jain Bhandar Stock Summary
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalBags.toLocaleString('en-IN')} Bags
            </div>
            <div className="text-xs font-semibold text-amber-800 mt-0.5">
              {totalQuintals.toLocaleString('en-IN')} Quintals Net Weight across {summaries.length} commodities
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 flex items-center justify-between group transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Download PDF Closing Sheet</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      .PDF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official Jain Bhandar letterhead format with opening, purchase, sales & closing tally.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-700 shrink-0" />
            </button>

            {/* 2. Excel Download */}
            <button
              onClick={handleDownloadExcel}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 flex items-center justify-between group transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Export to Microsoft Excel</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      .XLSX
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formatted spreadsheet table for CA, accountant, tax audit, or record keeping.
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
            </button>

            {/* 3. Direct Print */}
            <button
              onClick={handlePrint}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 flex items-center justify-between group transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Print Daily Register Sheet
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Print directly to shop counter A4 printer for physical godown verification.
                  </p>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </button>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-400">
            Formula verified: Closing Stock = Opening + Purchase - Sales
          </div>

        </div>

      </div>
    </div>
  );
};
