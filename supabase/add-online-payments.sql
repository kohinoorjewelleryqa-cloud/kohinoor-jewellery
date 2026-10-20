-- Kohinoor Jewellery — add online payment tracking (SkipCash) to orders.
-- Run ONCE before uploading the payment code: Supabase → SQL Editor → New query → paste → Run.
-- Safe to run again. Existing orders are kept and marked "unpaid" (cash/card on delivery).
-- Nothing changes on the shop until SkipCash keys are added in Vercel.

alter table orders add column if not exists payment_status text not null default 'unpaid';
alter table orders drop constraint if exists orders_payment_status_check;
alter table orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid','pending','paid','failed','refunded','review'));
alter table orders add column if not exists payment_ref text;        -- SkipCash payment id
alter table orders add column if not exists paid_amount numeric(12,2);
alter table orders add column if not exists paid_at timestamptz;

-- On/off switch for "Pay online" at checkout (Admin → Settings).
alter table settings add column if not exists online_payments boolean not null default true;

-- Check: should list the five new columns.
select table_name, column_name from information_schema.columns
where (table_name = 'orders' and column_name in ('payment_status','payment_ref','paid_amount','paid_at'))
   or (table_name = 'settings' and column_name = 'online_payments');
