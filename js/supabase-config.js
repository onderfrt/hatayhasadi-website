// @ts-check
/* ============================================================
   SUPABASE BAĞLANTI AYARLARI
   Değerleri Supabase Dashboard > Project Settings > API
   sayfasından alın ve aşağıya yapıştırın.

   NOT: anon key istemci tarafında kullanılmak üzere
   tasarlanmıştır, herkese açık olması normaldir. Veri
   güvenliği RLS politikalarıyla (supabase/schema.sql)
   veritabanı seviyesinde sağlanır.

   Bu değerler doldurulana kadar site üyeliksiz modda çalışır:
   sepet ve WhatsApp siparişi aynen çalışmaya devam eder.
   ============================================================ */

/* DİKKAT: Çıplak proje URL'si kullanın — sonuna /rest/v1 gibi
   yol EKLEMEYİN; istemci kütüphanesi yolları kendisi ekler. */
const SUPABASE_URL = 'https://nsxxizklgfhkfjvfkbtx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeHhpemtsZ2Zoa2ZqdmZrYnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MjAxNzYsImV4cCI6MjA5OTE5NjE3Nn0.S_3D8mmSFRJwhmqUROpGyouu-oXppwmEeKrWeYXEPy0';
