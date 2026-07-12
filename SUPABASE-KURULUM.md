# Hatay Hasadı – Supabase Kurulum Rehberi

Üyelik sistemi (kayıt/giriş, sipariş geçmişi, yorumlar) Supabase üzerinde çalışır.
Yapılandırma tamamlanana kadar site **üyeliksiz modda** çalışır: sepet ve WhatsApp
siparişleri etkilenmez, `hesap.html` sayfası kurulum talimatı gösterir.

## 1. Proje oluşturma

1. [supabase.com](https://supabase.com) adresinde ücretsiz hesap açın.
2. **New Project** deyin; proje adı (örn. `hatayhasadi`), güçlü bir veritabanı
   şifresi ve bölge olarak `Central EU (Frankfurt)` seçin (Türkiye'ye en yakın).
3. Proje açıldıktan sonra 1-2 dakika hazırlanmasını bekleyin.

## 2. Veritabanı şemasını kurma

1. Sol menüden **SQL Editor**'ü açın.
2. Bu repodaki [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını
   yapıştırıp **Run** deyin.
3. Şema şunları oluşturur:
   - `profiles` – üye profilleri (kayıtta trigger ile otomatik oluşur)
   - `orders` + `order_items` – sipariş kayıtları
   - `reviews` – ürün yorumları
   - **RLS politikaları** – herkes yalnızca kendi verisini görür;
     yorum yazma hakkı yalnızca o ürünü satın almış üyelere tanınır.
     Bu kurallar veritabanı seviyesinde uygulanır, istemci kodundan atlatılamaz.

## 3. API anahtarlarını siteye tanıtma

1. **Project Settings → API** sayfasını açın.
2. `Project URL` ve `anon public` key değerlerini kopyalayın.
3. Bu repodaki [`js/supabase-config.js`](js/supabase-config.js) dosyasına yapıştırın:

```js
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

> `anon` key'in herkese açık olması normaldir (tarayıcıya inen her istekte
> zaten görünür). Güvenlik RLS politikalarından gelir. `service_role` key'i
> ise **asla** bu dosyaya koymayın.

## 4. E-posta doğrulama ayarı (isteğe bağlı)

Varsayılan olarak Supabase, yeni üyelere doğrulama e-postası gönderir ve
doğrulanmadan giriş yapılamaz. Site bu akışı destekler ("e-postanızı doğrulayın"
mesajı gösterir).

- Test aşamasında kolaylık isterseniz: **Authentication → Providers → Email →
  Confirm email** seçeneğini kapatabilirsiniz.
- Canlıda açık tutmanız önerilir. **Authentication → Email Templates**
  bölümünden e-posta metinlerini Türkçeleştirebilirsiniz.

## 5. Yönetim paneli kurulumu

1. [`supabase/admin-schema.sql`](supabase/admin-schema.sql) dosyasını SQL
   Editor'de çalıştırın (ana şemadan **sonra**).
2. Dosyanın en altındaki yorumlu `update` satırındaki e-postayı kendi üyelik
   e-postanızla değiştirip çalıştırın — hesabınız yönetici olur.
3. Siteye giriş yaptıktan sonra **Hesabım** sayfasındaki "⚙ Yönetim Paneli"
   butonundan veya doğrudan `/yonetim.html` adresinden panele girin.

Panelde yapabilecekleriniz:
- Tüm siparişleri görüntüleme; durum güncelleme (Alındı → Hazırlanıyor →
  Kargoda → Teslim / İptal) — müşteri Hesabım sayfasında anında görür
- Duruma göre filtreleme, sipariş no / müşteri adı ile arama
- Müşterinin telefonuna tek tıkla WhatsApp açma
- Toplam sipariş / bekleyen / kargoda / ciro istatistikleri
- Yorum moderasyonu (uygunsuz yorumları silme)

Geçerli sipariş durumları: `alindi` · `hazirlaniyor` · `kargoda` · `teslim` · `iptal`

## Mimari not (.NET tarafı için)

Supabase standart bir PostgreSQL veritabanıdır. İleride bir ASP.NET Core API
katmanı eklemek isterseniz:
- Aynı Postgres'e `Npgsql` ile doğrudan bağlanabilir,
- veya [supabase-csharp](https://github.com/supabase-community/supabase-csharp)
  istemcisini kullanabilirsiniz.
- JWT doğrulaması için Supabase'in `JWT Secret`'ı (Project Settings → API)
  ASP.NET Core `JwtBearer` middleware'ine tanıtılabilir; böylece sitedeki
  oturum token'ları API'nizde de geçerli olur.

## Dosya haritası

| Dosya | Görev |
|---|---|
| `js/supabase-config.js` | URL + anon key (sizin doldurmanız gereken tek dosya) |
| `js/auth.js` | Kayıt/giriş/çıkış, profil, sipariş kaydetme-okuma, yorum API'si |
| `js/cart.js` | Sepet; girişli kullanıcıda siparişi veritabanına yazar |
| `hesap.html` | Giriş/kayıt formları, profil ve sipariş geçmişi sayfası |
| `yonetim.html` | Yönetim paneli: sipariş takibi, durum güncelleme, yorum moderasyonu |
| `supabase/admin-schema.sql` | Admin rolü + yönetici RLS politikaları |
| `supabase/schema.sql` | Veritabanı şeması + RLS politikaları |
