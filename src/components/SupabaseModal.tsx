'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig,
  SUPABASE_SQL_SETUP,
  fetchSupabaseItems,
  saveItemToSupabase,
  saveTransactionsToSupabase
} from '@/lib/supabase';
import { Item, Transaction } from '@/types/stock';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  transactions: Transaction[];
  onSynced: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  items,
  transactions,
  onSynced,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    if (cfg) {
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatus('Please enter both Supabase URL and Anon Key');
      setIsError(true);
      return;
    }

    saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    setStatus('Testing connection...');
    setIsError(false);

    const test = await fetchSupabaseItems();
    if (!test.error) {
      setStatus(`Connected successfully to Supabase! Loaded ${test.items.length} items.`);
      setIsError(false);
      onSynced();
    } else {
      setStatus(`Could not connect: ${test.error}. Please verify the URL/Key or run the SQL query below.`);
      setIsError(true);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatus('Disconnected from Supabase.');
    setIsError(false);
    onSynced();
  };

  const handleSyncLocalToCloud = async () => {
    setIsSyncing(true);
    setStatus('Syncing items and records to Supabase...');
    setIsError(false);

    let syncedItems = 0;
    for (const it of items) {
      const ok = await saveItemToSupabase(it);
      if (ok.success) syncedItems++;
    }

    let syncedTx = 0;
    for (const tx of transactions) {
      const ok = await saveTransactionsToSupabase([tx]);
      if (ok.success) syncedTx++;
    }

    setIsSyncing(false);
    setStatus(`Synced ${syncedItems} items and ${syncedTx} transactions to Supabase!`);
    setIsError(false);
    onSynced();
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-bold">Supabase Cloud Database</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          
          {status && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'
            }`}>
              {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{status}</span>
            </div>
          )}

          <form onSubmit={handleSaveAndTest} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:border-green-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {url && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Disconnect
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </form>

          {/* Sync Button */}
          {url && anonKey && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-600">Sync local items & stock to cloud:</span>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSyncLocalToCloud}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Upload to Supabase</span>
              </button>
            </div>
          )}

          {/* SQL Setup Helper */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-gray-600 uppercase">
                Supabase SQL Setup
              </span>
              <button
                onClick={handleCopySQL}
                className="text-[11px] font-semibold text-green-700 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied SQL' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-mono text-gray-700 max-h-28 overflow-y-auto">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
