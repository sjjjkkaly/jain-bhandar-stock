# Jain Bhandar — Wholesale Stock Management

A modern, fast, wholesale inventory and stock management web application built specifically for wholesale merchants, mandi traders, and godown operations (e.g. **Muri 16 bags**, **Jeera 210 bags** across multiple brands, pack sizes, and grades).

- **Production Domain Target:** `stock.jainbhandar.com`
- **Deployment Platform:** Vercel
- **Security Gatekeeper PIN:** `1326` (required before entering the web app)

---

## 🌟 Key Features

1. **Wholesale Stock Formula:**
   $$\text{Current Stock (Bags)} = \text{Opening Stock} + \text{Purchases (Inward)} - \text{Sales (Outward)} + \text{Adjustments}$$

2. **Dual Metric Tracking (Bags & Weight):**
   - Automatically tracks both wholesale packaging (**Bags / Katta / Bori**) and total net weight in **Kg & Quintals (Qtl)**.
   - Example: 210 Bags @ 50 kg/bag = 10,500 kg (105 Quintals).

3. **Brands, Varieties & Multi-Commodity:**
   - Preloaded with Jain Bhandar commodities:
     - **Muri (Puffed Rice):** Shyam Brand, Ganesh Brand (16 bags current stock)
     - **Jeera (Cumin Seeds):** Swastik Mandi 99% Clean, Royal Falcon Sortex (210 bags current stock)
     - **Chana Dal:** Hathi Gold
     - **Mustard / Rai:** Desi Mandi
     - **Sugar / Chini:** Dhampur M-30
   - Easily add unlimited custom commodities, mills, brands, pack sizes, and godown locations.

4. **Daily Record & Historical Day Stock Ledger:**
   - Day-wise date picker (Today, Yesterday, or any previous date).
   - View day opening stock, daily inward arrivals, daily outward dispatches, and daily closing tally.

5. **Quick 1-Click Counter Entry:**
   - 1-click `+` (Purchase/Inward) and `-` (Sale/Outward) buttons directly on every table row.
   - Quick bag increment buttons: `+10`, `+25`, `+50`, `+100` bags.
   - Optional Party Name, Challan/Bill No., Vehicle No., Rate per bag, and Total Amount.
   - Stock protection alert if attempting to sell more bags than available in the godown.

6. **Low-Stock Alert Badges:**
   - Automatically warns when stock drops below threshold.
   - 1-click filter to display only low-stock commodities needing reorder from mandi/mills.

7. **Reports & Exports (PDF & Excel):**
   - **Download PDF Closing Stock Sheet:** Formatted Jain Bhandar letterhead report with opening, purchases, sales, and closing bags/quintals for physical counter audits.
   - **Download Excel (.xlsx):** Formatted spreadsheets for accountants, CA, and tax filings.
   - **Audit Ledger:** Full transaction history with ability to delete or undo wrong entries.

8. **Gatekeeper Security PIN (`1326`):**
   - Numeric PIN pad and keyboard input before accessing any stock numbers.
   - Lock button in the top navigation to lock the screen instantly when stepping away from the counter.

9. **Data Safety & Backup:**
   - Browser storage + 1-click **Download Backup (.json)**.
   - 1-click **Restore from Backup** to sync data between phone and shop PC.

---

## 🚀 Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Run local development server
pnpm dev

# 3. Open in browser
http://localhost:3000
```

PIN to unlock: `1326`

---

## 🌐 Deploying to Vercel & Setting Up `stock.jainbhandar.com`

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial Jain Bhandar wholesale stock management app"
git branch -M main
git remote add origin https://github.com/<your-username>/jb-stock-management.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New Project"** and import your GitHub repository.
3. Framework Preset: **Next.js** (detected automatically).
4. Click **"Deploy"**.

### Step 3: Connect Custom Domain `stock.jainbhandar.com`
1. In your Vercel project dashboard, go to **Settings > Domains**.
2. Type `stock.jainbhandar.com` and click **Add**.
3. In your DNS provider for `jainbhandar.com` (GoDaddy, Cloudflare, Namecheap, etc.), add the following DNS record:
   - **Type:** `CNAME`
   - **Name / Host:** `stock`
   - **Value / Target:** `cname.vercel-dns.com`
4. Once DNS propagates (usually 1-5 minutes), Vercel automatically issues a free SSL certificate, and your site will be live at `https://stock.jainbhandar.com`.
