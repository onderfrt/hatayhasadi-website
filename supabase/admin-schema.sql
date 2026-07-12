-- ============================================================
-- HATAY HASADI – YÖNETİM PANELİ ŞEMASI (schema.sql'den SONRA çalıştırın)
-- Supabase Dashboard > SQL Editor'e yapıştırıp Run deyin.
--
-- Kendinizi admin yapmak için EN ALTTAKİ update satırındaki
-- e-postayı kendi üyelik e-postanızla değiştirin.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Profil tablosuna admin bayrağı ve e-posta kolonu
--    (e-posta, yönetim panelinde müşteriyi gösterebilmek için)
-- ------------------------------------------------------------
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists email text;

-- Mevcut üyelerin e-postasını doldur
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Yeni üyelerde e-posta da kaydedilsin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    new.email
  );
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 2) is_admin() yardımcı fonksiyonu
--    security definer: profiles üzerindeki RLS'e takılmadan
--    bayrağı okur (politikalarda özyineleme oluşmaz).
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ------------------------------------------------------------
-- 3) Admin politikaları
-- ------------------------------------------------------------
create policy "Siparis: admin hepsini okur"
  on public.orders for select
  using (public.is_admin());

create policy "Siparis: admin durum gunceller"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Siparis kalemi: admin hepsini okur"
  on public.order_items for select
  using (public.is_admin());

create policy "Profil: admin hepsini okur"
  on public.profiles for select
  using (public.is_admin());

create policy "Yorum: admin siler"
  on public.reviews for delete
  using (public.is_admin());

-- ------------------------------------------------------------
-- 4) KENDİNİZİ ADMIN YAPIN
--    Aşağıdaki e-postayı kendi üyelik e-postanızla değiştirip
--    bu satırı çalıştırın:
-- ------------------------------------------------------------
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'SIZIN-EPOSTANIZ@ornek.com');
