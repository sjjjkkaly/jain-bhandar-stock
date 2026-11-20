# Jain Bhandar — Wholesale Stock Management

A simple, real-time wholesale stock calculator for **Jain Bhandar** admin and staff.

$$\text{Opening Stock} + \text{Purchase (+)} - \text{Sales (-)} = \text{Current / Closing Stock}$$

- **Target Domain:** `stock.jainbhandar.com`
- **Gatekeeper Password:** `1326`
- **Database:** Supabase (PostgreSQL with Realtime Live Sync across all phones & computers)
- **Deployment:** Vercel

---

## ⚡ Supabase Setup (For Admin & Staff Multi-User Sync)

### Step 1: Create a Free Project on Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project named `jain-bhandar-stock`.
2. Choose your database password and region (e.g. `ap-south-1` Mumbai).

### Step 2: Run the SQL Table Setup
1. In your Supabase project dashboard, open the **SQL Editor** on the left menu.
2. Paste and run this SQL query:

```sql
-- 1. Items Table
create table if not exists public.items (
  id text primary key,
  name text not null,
  brand text not null,
  unit text default 'Bags',
  opening_stock numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Transactions Table
create table if not exists public.transactions (
  id text primary key,
  date text not null,
  item_id text references public.items(id) on delete cascade,
  type text not null,
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Realtime Live Sync
alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.transactions;

-- 4. Enable Public Access for Staff & Admin
alter table public.items enable row level security;
alter table public.transactions enable row level security;

create policy "Allow all on items" on public.items for all using (true) with check (true);
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
```

### Step 3: Get your API Keys
In Supabase, go to **Project Settings > API**:
- **Project URL** (e.g. `https://xyzabc.supabase.co`)
- **Project API Keys > anon / public** (e.g. `eyJhbGciOi...`)

---

## 🚀 Push to GitHub

In your terminal:

```bash
git add .
git commit -m "feat: real-time multi-user wholesale stock app for Jain Bhandar"
git branch -M main
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/jb-stock-management.git
git push -u origin main
```

*(If you already have a repository on GitHub, replace `<YOUR-GITHUB-USERNAME>` with your GitHub username or paste your repo URL).*

---

## 🌐 Deploy to Vercel (For Everyone to Use)

1. Open [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your `jb-stock-management` GitHub repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Anon Key
4. Click **Deploy**.

### Add Custom Subdomain (`stock.jainbhandar.com`)
1. On Vercel, go to **Settings > Domains**.
2. Enter `stock.jainbhandar.com` and click **Add**.
3. In your DNS manager for `jainbhandar.com`, add:
   - **Type:** `CNAME`
   - **Name:** `stock`
   - **Target:** `cname.vercel-dns.com`

---

## 📱 How Staff & Admin Use the App
- Everyone opens **`stock.jainbhandar.com`** (or `localhost:3000`).
- Enter **`1326`** to unlock.
- Any purchase or sale logged by staff on their mobile phone instantly updates on the admin's computer screen via Supabase Realtime!
