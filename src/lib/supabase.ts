import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Item, Transaction } from '@/types/stock';

const SUPABASE_CONFIG_KEY = 'jb_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  if (typeof window === 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (envUrl && envKey) return { url: envUrl, anonKey: envKey };
    return null;
  }

  // 1. Check environment variables first (used in Vercel production)
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // 2. Check localStorage settings (manual input from UI)
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch {
    // Ignore error
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

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    cachedClient = null;
    return null;
  }
  const currentKey = `${config.url}|${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (e) {
    console.error('Supabase init error:', e);
    return null;
  }
}

// Fetch all items from Supabase
export async function fetchSupabaseItems(): Promise<Item[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name', { ascending: true });
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

// Fetch all transactions from Supabase
export async function fetchSupabaseTransactions(): Promise<Transaction[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
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

// Save or Update Item in Supabase
export async function saveItemToSupabase(item: Item): Promise<boolean> {
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
    if (error) console.error('Error saving item:', error);
    return !error;
  } catch (e) {
    console.error('saveItemToSupabase catch:', e);
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

// Add batch transactions to Supabase (e.g. Bulk Purchase or Bulk Sale)
export async function saveTransactionsToSupabase(txs: Transaction[]): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || txs.length === 0) return false;
  try {
    const rows = txs.map((tx) => ({
      id: tx.id,
      date: tx.date,
      item_id: tx.itemId,
      type: tx.type,
      quantity: tx.quantity,
    }));
    const { error } = await supabase.from('transactions').upsert(rows);
    if (error) console.error('Error saving transactions:', error);
    return !error;
  } catch (e) {
    console.error('saveTransactionsToSupabase catch:', e);
    return false;
  }
}

// Subscribe to Realtime Changes for live sync across Admin & Staff devices
export function subscribeToStockChanges(onDataChange: () => void): RealtimeChannel | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('stock-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => onDataChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => onDataChange()
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.error('Realtime subscription error:', e);
    return null;
  }
}

export const syncItemToSupabase = saveItemToSupabase;
export const syncTransactionToSupabase = async (tx: Transaction) => saveTransactionsToSupabase([tx]);

export const SUPABASE_SQL_SETUP = `
-- COPY & RUN THIS IN SUPABASE SQL EDITOR (ONE CLICK):

-- 1. Create Items table
create table if not exists public.items (
  id text primary key,
  name text not null,
  brand text not null,
  unit text default 'Bags',
  opening_stock numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Transactions table
create table if not exists public.transactions (
  id text primary key,
  date text not null,
  item_id text references public.items(id) on delete cascade,
  type text not null, -- 'PURCHASE' or 'SALE'
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Realtime for Live Sync across all Staff & Admin devices
alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.transactions;

-- 4. Enable Public Read & Write (or configure RLS policies)
alter table public.items enable row level security;
alter table public.transactions enable row level security;

create policy "Allow all on items" on public.items for all using (true) with check (true);
create policy "Allow all on transactions" on public.transactions for all using (true) with check (true);

-- 5. Seed initial items (Muri 16 bags, Jeera 210 bags)
insert into public.items (id, name, brand, unit, opening_stock) values
  ('muri-shyam', 'Muri', 'Shyam', 'Bags', 20),
  ('muri-ganesh', 'Muri', 'Ganesh', 'Bags', 50),
  ('jeera-swastik', 'Jeera', 'Swastik', 'Bags', 250),
  ('jeera-falcon', 'Jeera', 'Royal Falcon', 'Bags', 100)
on conflict (id) do nothing;

insert into public.transactions (id, date, item_id, type, quantity) values
  ('tx-init-1', to_char(current_date, 'YYYY-MM-DD'), 'muri-shyam', 'PURCHASE', 10),
  ('tx-init-2', to_char(current_date, 'YYYY-MM-DD'), 'muri-shyam', 'SALE', 14),
  ('tx-init-3', to_char(current_date, 'YYYY-MM-DD'), 'jeera-swastik', 'SALE', 40)
on conflict (id) do nothing;
`;
