'use client';

import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Database 
} from 'lucide-react';
import { exportBackupData, importBackupData, resetToDemo } from '@/lib/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Jain_Bhandar_Stock_Backup_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Backup downloaded successfully to your computer/phone!', isError: false });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupData(content);
      if (res.success) {
        setStatusMessage({ text: res.message, isError: false });
        onDataChanged();
      } else {
        setStatusMessage({ text: res.message, isError: true });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleResetToDemo = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to restore the initial wholesale demo items (Muri 16 bags, Jeera 210 bags)? Current custom changes will be replaced.'
    );
    if (confirmReset) {
      resetToDemo();
      setStatusMessage({ text: 'Reset to initial Jain Bhandar wholesale demo stock data.', isError: false });
      onDataChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Data Backup & Safety</h2>
              <p className="text-xs text-slate-400">Protect and sync your stock data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* 1. Download Backup */}
            <button
              onClick={handleExportBackup}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 flex items-center justify-between group transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Download Stock Backup (.json)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Save a full backup of all items and transactions to your phone or computer.
                  </p>
                </div>
              </div>
            </button>

            {/* 2. Restore Backup */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 flex items-center justify-between group transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Restore from Backup File
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload a previous backup file to restore or sync across different devices.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* 3. Reset to Demo */}
            <button
              onClick={handleResetToDemo}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-between group transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-105 transition">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Reset to Initial Demo Data
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Restores Muri 16 bags, Jeera 210 bags sample transactions.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Your data is stored securely in this browser with offline support. We recommend downloading a backup weekly or before clearing browser cache.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
