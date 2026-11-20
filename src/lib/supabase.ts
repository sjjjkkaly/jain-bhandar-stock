import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Item, Transaction } from '@/types/stock';

const SUPABASE_CONFIG_KEY = 'jb_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  if (typeof window === 'undefined') return null;
  
  // 1. Check localStorage settings
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch {
    // Ignore error
  }

  // 2. Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  try {
    return createClient(config.url, config.anonKey);
  } catch (e) {
    console.error('Supabase init error:', e);
    return null;
  }
}

// Fetch items from Supabase
export async function fetchSupabaseItems(): Promise<Item[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('items').select('*');
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      unit: row.unit || 'Bags',
      openingStock: Number(row.opening_stock ?? 0),
    }));
  } catch (e) {
    console.error('Supabase fetch items error:', e);
    return null;
  }
}

// Fetch transactions from Supabase
export async function fetchSupabaseTransactions(): Promise<Transaction[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      date: row.date,
      itemId: row.item_id,
      type: row.type,
      quantity: Number(row.quantity ?? 0),
    }));
  } catch (e) {
    console.error('Supabase fetch transactions error:', e);
    return null;
  }
}

// Sync Item to Supabase
export async function syncItemToSupabase(item: Item): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('items').upsert({
      id: item.id,
      name: item.name,
      brand: item.brand,
      unit: item.unit,
      opening_stock: item.openingStock,
    });
    return !error;
  } catch {
    return false;
  }
}

// Delete Item from Supabase
export async function deleteItemFromSupabase(itemId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    await supabase.from('transactions').delete().eq('item_id', itemId);
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    return !error;
  } catch {
    return false;
  }
}

// Sync Transaction to Supabase
export async function syncTransactionToSupabase(tx: Transaction): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('transactions').upsert({
      id: tx.id,
      date: tx.date,
      item_id: tx.itemId,
      type: tx.type,
      quantity: tx.quantity,
    });
    return !error;
  } catch {
    return false;
  }
}

export const SUPABASE_SQL_SETUP = `
-- Run this in your Supabase SQL Editor:
create table if not exists items (
  id text primary key,
  name text not null,
  brand text not null,
  unit text default 'Bags',
  opening_stock numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists transactions (
  id text primary key,
  date text not null,
  item_id text references items(id) on delete cascade,
  type text not null, -- 'PURCHASE' or 'SALE'
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (or allow public anon read/write)
alter table items enable row level security;
alter table transactions enable row level security;

create policy "Allow all on items" on items for all using (true) with check (true);
create policy "Allow all on transactions" on transactions for all using (true) with check (true);
`;
