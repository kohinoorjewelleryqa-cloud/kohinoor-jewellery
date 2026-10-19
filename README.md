# Kohinoor Jewellery — online store

Next.js + Supabase store for Kohinoor Jewellery, Doha. Built by Zyon Tech Solutions.
Same stack as Zyon HoloMenu: **Next.js** (website + admin panel), **Supabase** (database, login, photo storage), **Vercel** (hosting).

## What's included

**Shop (customers)**
- Home page, 12 category pages (`/jewellery/rings` …), 6 collection pages, edits (`/gold`, `/diamond`, `/bridal`, `/men`, `/kids`, `/gifts`, `/new-arrivals`, `/best-sellers`)
- Search and filters (category, metal, stone, occasion, gender, collection, price, ready to ship), sorting, pages of 24
- Product pages with their own URL, price breakdown (weight × today's rate + making + stones), sizes, photo gallery, Google product data
- **Order on WhatsApp** button (message pre-filled with product, SKU, size, price)
- Bag, wishlist, checkout with Qatar address (area, zone, street, building) and cash/card on delivery
- Gold-rate page with price calculator, About, Contact, FAQ, Delivery & returns, Privacy, Terms, sitemap.xml, robots.txt

**Admin panel (`/admin`)**
- Dashboard with **today's gold rate** box — saving it reprices every product instantly
- Products: search, filter, add, edit, hide, delete, **photo upload**
- **Import / export CSV**: add or update thousands of products at once (matched by SKU)
- Orders: live list, status (New → Confirmed → Packed → Out for delivery → Delivered), WhatsApp the customer
- Categories & collections, store contact details

**Demo mode:** until Supabase keys are added, the shop runs with 2,000 sample products so you can see everything working.

---

## Setup, step by step

### Step 1 — Accounts
Supabase project `kohinoor-jewellery` and an empty private GitHub repo `kohinoor-jewellery`.

### Step 2 — Database (Supabase, about 5 minutes)
1. Supabase → your project → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql`, copy everything, paste, click **Run**. You should see "Success. No rows returned".
3. **Authentication → Users → Add user → Create new user**: your email + a strong password, tick **Auto Confirm User**.
4. Click the new user, copy its **User UID**.
5. SQL Editor → New query → run (paste your ID):
   ```sql
   insert into admins (user_id) values ('PASTE-USER-UID-HERE');
   ```

### Step 3 — Run it on your Mac
1. Install **Node.js LTS** from nodejs.org (check in Terminal: `node -v` should show v20 or newer).
2. Unzip this project, e.g. to `~/Projects/kohinoor-jewellery`.
3. In Terminal:
   ```bash
   cd ~/Projects/kohinoor-jewellery
   npm install
   cp .env.example .env.local
   ```
4. Open `.env.local` and paste from Supabase → **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (secret — never share or commit it)
5. Start it: `npm run dev` → open http://localhost:3000 (shop) and http://localhost:3000/admin (log in with the user from step 2).

### Step 4 — Load products
- Admin → **Import products** → upload `supabase/demo-products-2000.csv` to test with 2,000 sample products.
- For the real catalogue: download the template there, give it to the client to fill, then import it. Re-importing the same SKUs updates them.
- Photos: upload per product in Admin → Products → Edit, or put photo links in the `image_urls` column.
- Admin → **Store settings**: enter the real phone, WhatsApp number (e.g. `97455551234`), email, address, hours.

### Step 5 — Push to GitHub
```bash
git init
git add .
git commit -m "Kohinoor Jewellery store"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/kohinoor-jewellery.git
git push -u origin main
```
(`.env.local` is ignored and will not be uploaded — that's correct.)

### Step 6 — Deploy on Vercel
1. vercel.com → **Add New → Project** → import `kohinoor-jewellery`.
2. Before deploying, open **Environment Variables** and add the same three keys as `.env.local`, plus `NEXT_PUBLIC_SITE_URL` (the live address, e.g. `https://www.kohinoorjewellery.qa`).
3. **Deploy**. Test the `…vercel.app` link: browse, add to bag, place a test order, check it appears in Admin → Orders.
4. Vercel's free Hobby plan is for personal, non-commercial projects; for the live client store use a paid plan.

### Step 7 — Domain & go live
1. Buy the domain (client pays). Vercel → Project → **Settings → Domains** → add it and follow the DNS instructions.
2. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the real domain → **Redeploy**.
3. Supabase → **Authentication → URL Configuration** → set Site URL to the real domain.
4. Google Search Console: add the domain and submit `https://YOUR-DOMAIN/sitemap.xml`.

### Step 8 — Hand over to the client
- Create the client's own admin login (repeat step 2.3–2.5 with their email).
- Show them: updating the gold rate every morning, adding/editing products and photos, importing the spreadsheet, handling orders.

---

## Optional: email alert for new orders
Create a free key at resend.com and set `RESEND_API_KEY` and `ORDER_NOTIFY_EMAIL` in Vercel. Until you verify your own domain in Resend, emails come from Resend's test address.

## Paid add-ons for later
Online card / Apple Pay payment (Qatar gateway), customer accounts, full Arabic version, delivery-rider screen, automated WhatsApp order updates.

## Project map
```
app/(shop)/          customer pages (home, listings, product, cart, checkout, info pages)
app/admin/           admin panel (login, dashboard, products, import, orders, catalogue, settings)
app/api/             product lookup for bag/wishlist, cache refresh after admin edits
components/          shared UI (header, cards, filters, gallery…)
lib/                 data loading, pricing, filters, CSV import, demo data, jewellery illustrations
supabase/schema.sql  database tables, security rules, photo storage, starting data
supabase/demo-products-2000.csv   sample catalogue for testing
```
Price formula (`lib/pricing.ts`): `weight_g × rate[metal] × (1 + making_pct%)` − making discount + `stone_value`, rounded to the nearest 5 QAR. Orders always re-price on the server.
