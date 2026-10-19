-- Kohinoor Jewellery — switch the LIVE database to the silver-only store.
-- Run ONCE: Supabase → SQL Editor → New query → paste this whole file → Run.
--
-- What it does:
--   • deletes ALL products (the 2,000 gold sample products) — re-import the silver CSV afterwards
--   • keeps orders, admin logins and store contact details
--   • replaces the 12 gold categories with 6 silver categories, and the collections
--   • switches the daily rates to silver (999 and 925)
--   • adds an optional fixed (tag) price per product
-- Everything runs as one transaction: if any line fails, nothing is changed.

begin;

-- 1. Remove the old sample products (orders keep their own copy of what was bought).
delete from products;

-- 2. Silver finishes only.
alter table products drop constraint if exists products_metal_check;
alter table products add constraint products_metal_check
  check (metal in ('ag925','ag925ox','ag925gp','ag925rp','ag999'));

-- 3. Optional fixed price per product.
alter table products add column if not exists fixed_price numeric(12,2);

-- 4. Categories: 12 → 6.
delete from categories where slug not in ('rings','earrings','necklaces','bracelets','anklets','sets');
insert into categories (slug, name, sort_order, sizes, intro) values
 ('rings','Rings',1,'{6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22}','Sterling silver bands, statement rings and stackables, plain or set with cubic zirconia and coloured stones. Free resizing within 30 days.'),
 ('earrings','Earrings',2,'{}','Studs, hoops, huggies, drops and oxidised jhumkas in 925 silver.'),
 ('necklaces','Necklaces & Pendants',3,'{"16 in","18 in","20 in","22 in"}','Pendants, chains, chokers and layered necklaces in sterling, oxidised and gold-plated silver.'),
 ('bracelets','Bracelets & Bangles',4,'{}','Tennis and link bracelets, cuffs, kadas and bangles in 925 silver.'),
 ('anklets','Anklets',5,'{}','Traditional silver payals and light everyday anklets.'),
 ('sets','Jewellery Sets',6,'{}','Matching necklace and earring sets, ready to gift.')
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, sizes = excluded.sizes, intro = excluded.intro;

-- 5. Collections.
delete from collections;
insert into collections (slug, name, description, sort_order) values
 ('everyday-sterling','Everyday Sterling','Light 925 pieces for daily wear',1),
 ('oxidised-heritage','Oxidised Heritage','Antique-finish jhumkas, chokers and payals',2),
 ('golden-touch','Golden Touch','Gold-plated sterling silver',3),
 ('doha-pearl','Doha Pearl','Pearls set in sterling silver',4),
 ('men-in-silver','Men in Silver','Chains, bands and bracelets for men',5);

-- 6. Silver rates (QAR per gram) — update them in the admin panel each morning.
alter table settings alter column rates set default '{"ag999":6.4,"ag925":5.95}';
update settings set rates = '{"ag999":6.4,"ag925":5.95}', rates_updated_at = now() where id = 1;

commit;

-- Check: should show 6 categories, 5 collections, 0 products.
select (select count(*) from categories) as categories,
       (select count(*) from collections) as collections,
       (select count(*) from products) as products;
