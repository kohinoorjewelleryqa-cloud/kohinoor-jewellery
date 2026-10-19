-- Kohinoor Jewellery — Supabase database setup
-- Run once: Supabase → SQL Editor → New query → paste this whole file → Run.

-- ---------------------------------------------------------------- tables
create table if not exists settings (
  id int primary key default 1 check (id = 1),           -- single row
  store_name text not null default 'Kohinoor Jewellery',
  phone text not null default '+974 0000 0000',
  whatsapp text not null default '97400000000',          -- digits only, with country code
  email text not null default 'info@example.com',
  address text not null default 'Showroom address, Doha, Qatar',
  hours text not null default 'Sat–Thu 10 am–10 pm · Fri 4 pm–10 pm',
  rates jsonb not null default '{"yg24":468,"yg22":430,"yg21":410,"yg18":352,"wg18":352,"rg18":352,"pt":145,"ag":6.2}',
  rates_updated_at timestamptz
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  intro text,
  sizes text[] not null default '{}',
  sort_order int not null default 0
);

create table if not exists collections (
  slug text primary key,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name text not null,
  category text not null references categories(slug) on update cascade,
  style text,
  metal text not null check (metal in ('yg24','yg22','yg21','yg18','wg18','rg18','pt','ag')),
  stone text not null default 'none',
  carat numeric(8,2) not null default 0,
  weight_g numeric(10,3) not null check (weight_g > 0),
  making_pct numeric(6,2) not null default 0,
  making_discount_pct numeric(5,2) not null default 0,
  stone_value numeric(12,2) not null default 0,
  stock int not null default 0,
  occasions text[] not null default '{}',
  gender text not null default 'Women',
  collection text references collections(slug) on update cascade on delete set null,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  is_active boolean not null default true,
  description text,
  images text[] not null default '{}',
  art_variant int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on products(category);
create index if not exists products_active_idx on products(is_active);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  area text, zone text, street text, building text,
  delivery_slot text,
  payment_method text,
  notes text,
  items jsonb not null,           -- snapshot: sku, name, weight, rate and price at order time
  total numeric(12,2) not null,
  status text not null default 'new' check (status in ('new','confirmed','packed','out_for_delivery','delivered','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists orders_created_idx on orders(created_at desc);

-- People allowed into /admin
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- keep products.updated_at current
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on products;
create trigger products_touch before update on products for each row execute function touch_updated_at();

-- ---------------------------------------------------------------- security
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

alter table settings enable row level security;
alter table categories enable row level security;
alter table collections enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table admins enable row level security;

drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);
drop policy if exists "admin update settings" on settings;
create policy "admin update settings" on settings for update using (is_admin()) with check (is_admin());

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());

drop policy if exists "public read collections" on collections;
create policy "public read collections" on collections for select using (true);
drop policy if exists "admin write collections" on collections;
create policy "admin write collections" on collections for all using (is_admin()) with check (is_admin());

drop policy if exists "public read live products" on products;
create policy "public read live products" on products for select using (is_active or is_admin());
drop policy if exists "admin write products" on products;
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());

-- Orders are created by the website server (service role) and only admins can read them.
drop policy if exists "admin manage orders" on orders;
create policy "admin manage orders" on orders for all using (is_admin()) with check (is_admin());

drop policy if exists "read own admin row" on admins;
create policy "read own admin row" on admins for select using (user_id = auth.uid());

-- ---------------------------------------------------------------- photo storage
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and is_admin());
drop policy if exists "admin change product images" on storage.objects;
create policy "admin change product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and is_admin());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and is_admin());

-- live order notifications in the admin panel
do $$ begin
  alter publication supabase_realtime add table orders;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- ---------------------------------------------------------------- starting data
insert into settings (id) values (1) on conflict (id) do nothing;

insert into categories (slug, name, sort_order, sizes, intro) values
 ('rings','Rings',1,'{6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22}','Solitaires, eternity bands, signet and cocktail rings in 18K, 21K and 22K gold and platinum. Free resizing within 30 days.'),
 ('necklaces','Necklaces',2,'{}','Chokers, collar necklaces and Rani haars, from light everyday pieces to full bridal statements.'),
 ('earrings','Earrings',3,'{}','Jhumkas, chandbalis, hoops, studs and huggies set with diamonds, pearls and coloured stones.'),
 ('bangles','Bangles',4,'{2.2,2.4,2.6,2.8,2.10}','Kadas, filigree and openable bangles sold singly or in pairs, in Gulf sizes 2.2 to 2.10.'),
 ('bracelets','Bracelets',5,'{}','Tennis, link, charm and cuff bracelets for women and men.'),
 ('pendants','Pendants',6,'{}','Hearts, initials, crescents and drops in yellow, white and rose gold.'),
 ('chains','Chains',7,'{"16 in","18 in","20 in","22 in","24 in"}','Rope, box, Cuban, Figaro and Singapore chains from 16 to 24 inches, priced by weight.'),
 ('anklets','Anklets',8,'{}','Traditional payals and charm anklets with fine bells.'),
 ('nosepins','Nose Pins',9,'{}','Delicate studs and naths in gold with diamond and pearl accents.'),
 ('sets','Bridal Sets',10,'{}','Necklace and earring sets in Royal Kundan, polki, emerald and ruby for the wedding season.'),
 ('coins','Coins & Bars',11,'{}','24K 999.9 fine gold coins and bars from 1 g to 100 g, for gifting and saving.'),
 ('cufflinks','Cufflinks',12,'{}','Engraved and stone-set cufflinks in 21K gold for formal occasions.')
on conflict (slug) do nothing;

insert into collections (slug, name, description, sort_order) values
 ('mughal-heritage','Mughal Heritage','Temple motifs, filigree and antique finish',1),
 ('doha-pearl','Doha Pearl','Gulf pearls set in 18K and 21K gold',2),
 ('royal-kundan','Royal Kundan','Hand-set kundan and polki for brides',3),
 ('everyday-lite','Everyday Lite','Light 18K pieces under 5 grams',4),
 ('bridal-grandeur','Bridal Grandeur','Statement sets for the wedding day',5),
 ('men-of-gold','Men of Gold','Chains, signets and cufflinks',6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- make yourself an admin
-- 1. Supabase → Authentication → Users → Add user (email + password, tick "Auto confirm").
-- 2. Copy that user's ID, then run (replace the ID):
--    insert into admins (user_id) values ('PASTE-USER-ID-HERE');
