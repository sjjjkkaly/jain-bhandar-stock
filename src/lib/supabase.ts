import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Item, Transaction } from '@/types/stock';

const SUPABASE_CONFIG_KEY = 'jb_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  // 1. Check environment variables (Vercel Production)
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey && envUrl.startsWith('http')) {
    return { url: envUrl.trim(), anonKey: envKey.trim() };
  }

  // 2. Check localStorage setting (entered from browser)
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey && parsed.url.startsWith('http')) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
        }
      }
    } catch {
      // Ignore error
    }
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  cachedClient = null;
}

export function clearSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    cachedClient = null;
    return null;
  }
  if (!cachedClient) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

export const INITIAL_DEFAULT_ITEMS: Item[] = [
  { id: 'muri-shyam', name: 'Muri', brand: 'Shyam', unit: 'Bags', openingStock: 20 },
  { id: 'muri-ganesh', name: 'Muri', brand: 'Ganesh', unit: 'Bags', openingStock: 50 },
  { id: 'jeera-swastik', name: 'Jeera', brand: 'Swastik', unit: 'Bags', openingStock: 250 },
  { id: 'jeera-falcon', name: 'Jeera', brand: 'Royal Falcon', unit: 'Bags', openingStock: 100 },
];

export const INITIAL_DEFAULT_TX: Transaction[] = [
  { id: 'tx-init-1', date: new Date().toISOString().split('T')[0], itemId: 'muri-shyam', type: 'PURCHASE', quantity: 10 },
  { id: 'tx-init-2', date: new Date().toISOString().split('T')[0], itemId: 'muri-shyam', type: 'SALE', quantity: 14 },
  { id: 'tx-init-3', date: new Date().toISOString().split('T')[0], itemId: 'jeera-swastik', type: 'SALE', quantity: 40 },
];

// Fetch all items directly from Supabase
export async function fetchSupabaseItems(): Promise<{ items: Item[]; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { items: [], error: 'Supabase client not connected' };

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('fetchSupabaseItems error:', error);
      return { items: [], error: error.message };
    }

    // Auto-seed initial items if database table is completely empty
    if (!data || data.length === 0) {
      for (const it of INITIAL_DEFAULT_ITEMS) {
        await saveItemToSupabase(it);
      }
      for (const tx of INITIAL_DEFAULT_TX) {
        await saveTransactionsToSupabase([tx]);
      }
      return { items: INITIAL_DEFAULT_ITEMS };
    }

    const items: Item[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      unit: row.unit || 'Bags',
      openingStock: Number(row.opening_stock ?? 0),
    }));

    return { items };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { items: [], error: msg };
  }
}

// Fetch all transactions directly from Supabase
export async function fetchSupabaseTransactions(): Promise<{ transactions: Transaction[]; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { transactions: [], error: 'Supabase client not connected' };

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchSupabaseTransactions error:', error);
      return { transactions: [], error: error.message };
    }

    const transactions: Transaction[] = (data || []).map((row) => ({
      id: row.id,
      date: row.date,
      itemId: row.item_id,
      type: row.type,
      quantity: Number(row.quantity ?? 0),
    }));

    return { transactions };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { transactions: [], error: msg };
  }
}

// Save or Update Item in Supabase
export async function saveItemToSupabase(item: Item): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not connected' };

  try {
    const { error } = await supabase.from('items').upsert({
      id: item.id,
      name: item.name,
      brand: item.brand,
      unit: item.unit || 'Bags',
      opening_stock: Number(item.openingStock || 0),
    });

    if (error) {
      console.error('saveItemToSupabase error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

// Delete Item from Supabase
export async function deleteItemFromSupabase(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not connected' };

  try {
    await supabase.from('transactions').delete().eq('item_id', itemId);
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

// Save transactions to Supabase (Bulk Purchase or Bulk Sale)
export async function saveTransactionsToSupabase(txs: Transaction[]): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase is not connected' };
  if (txs.length === 0) return { success: true };

  try {
    const rows = txs.map((tx) => ({
      id: tx.id,
      date: tx.date,
      item_id: tx.itemId,
      type: tx.type,
      quantity: Number(tx.quantity),
    }));

    const { error } = await supabase.from('transactions').upsert(rows);
    if (error) {
      console.error('saveTransactionsToSupabase error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

// Subscribe to Realtime Changes
export function subscribeToStockChanges(onDataChange: () => void): RealtimeChannel | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('stock-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => onDataChange())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => onDataChange())
      .subscribe();

    return channel;
  } catch (e) {
    console.error('Realtime subscription error:', e);
    return null;
  }
}

export const SUPABASE_SQL_SETUP = `
-- COPY AND RUN THIS QUERY IN SUPABASE SQL EDITOR:

-- 1. Create Items Table
create table if not exists public.items (
  id text primary key,
  name text not null,
  brand text not null,
  unit text default 'Bags',
  opening_stock numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Transactions Table
create table if not exists public.transactions (
  id text primary key,
  date text not null,
  item_id text not null,
  type text not null, -- 'PURCHASE' or 'SALE'
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Safely enable Realtime Live Sync (skips if already added)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'items'
  ) then
    alter publication supabase_realtime add table public.items;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'transactions'
  ) then
    alter publication supabase_realtime add table public.transactions;
  end if;
end $$;

-- 4. Enable Public Access (RLS) safely
alter table public.items enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Allow all on items" on public.items;
create policy "Allow all on items" on public.items for all using (true) with check (true);

drop policy if exists "Allow all on transactions" on public.transactions;
create policy "Allow all on transactions" on public.transactions for all using (true) with check (true);

-- 5. Seed Initial Items (Muri 16 bags, Jeera 210 bags)
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
