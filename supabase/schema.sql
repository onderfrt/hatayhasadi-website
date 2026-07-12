-- ============================================================
-- HATAY HASADI – SUPABASE VERİTABANI ŞEMASI
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- Tamamı idempotent değildir; temiz bir projede bir kez çalıştırın.
-- ============================================================

-- ------------------------------------------------------------
-- 1) PROFİLLER
--    auth.users'a 1:1 bağlı profil tablosu. Yeni üye
--    kaydolduğunda trigger ile otomatik satır açılır.
-- ------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profil: kendi profilini okur"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profil: kendi profilini günceller"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Yeni kullanıcı -> otomatik profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2) SİPARİŞLER
--    Sepetten "Siparişi Tamamla" denildiğinde kaydedilir.
--    order_no: müşteriye söylenecek kısa, insan dostu numara.
-- ------------------------------------------------------------
create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  order_no    bigint generated always as identity unique,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status      text not null default 'alindi',   -- alindi | hazirlaniyor | kargoda | teslim | iptal
  total       numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   text not null,          -- js/products.js içindeki id (örn. 'isot')
  product_name text not null,
  size_label   text not null,          -- '100 gr' / '250 gr' / '5 L Teneke'
  qty          int  not null check (qty > 0),
  unit_price   numeric(10,2) not null
);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "Sipariş: kendi siparişini ekler"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Sipariş: kendi siparişlerini okur"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Sipariş kalemi: kendi siparişine ekler"
  on public.order_items for insert
  with check (exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  ));

create policy "Sipariş kalemi: kendi kalemlerini okur"
  on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  ));

create index order_items_order_idx   on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);
create index orders_user_idx         on public.orders (user_id);

-- ------------------------------------------------------------
-- 3) YORUMLAR (Adım 4 için hazır)
--    Kural: bir ürüne yalnızca o ürünü SATIN ALMIŞ üyeler
--    yorum yazabilir. Bu kural RLS politikasıyla veritabanı
--    seviyesinde zorunlu kılınır - istemci kodu atlatamaz.
-- ------------------------------------------------------------
create table public.reviews (
  id           bigint generated always as identity primary key,
  product_id   text not null,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null,           -- yorumda görünecek isim (örn. 'Ayşe K.')
  rating       smallint not null check (rating between 1 and 5),
  comment      text not null check (char_length(comment) between 3 and 2000),
  created_at   timestamptz not null default now(),
  unique (product_id, user_id)          -- ürün başına 1 yorum
);

alter table public.reviews enable row level security;

create policy "Yorum: herkes okur"
  on public.reviews for select
  using (true);

create policy "Yorum: yalnizca satin alan yazar"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.user_id = auth.uid()
        and oi.product_id = reviews.product_id
        and o.status <> 'iptal'
    )
  );

create policy "Yorum: kendi yorumunu gunceller"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Yorum: kendi yorumunu siler"
  on public.reviews for delete
  using (auth.uid() = user_id);

create index reviews_product_idx on public.reviews (product_id);
