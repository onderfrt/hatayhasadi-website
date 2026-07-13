# Hatay Hasadı – hatayhasadi.com

Hatay'ın doğal baharatlarını satan **Hatay Hasadı** markasının e-ticaret sitesi.
Statik HTML + vanilla JS önyüz, [Supabase](https://supabase.com) (PostgreSQL) arka uç,
[Vercel](https://vercel.com) hosting.

## Mimari

```
Görünüm    index.html · urun.html · hesap.html · yonetim.html
Yerleşim   js/layout.js (ortak nav+footer) · css/style.css (tema)
Mantık     js/cart.js (sepet) · js/auth.js (üyelik/sipariş/yorum API'si)
Veri       js/products.js (ürün kataloğu) · Supabase (üyeler, siparişler, yorumlar)
Güvenlik   supabase/*.sql — RLS politikaları (veritabanı seviyesinde yetkilendirme)
```

- **Ürün eklemek / fiyat değiştirmek:** yalnızca `js/products.js` düzenlenir;
  kartlar, fiyat tablosu, detay sayfaları ve sepet otomatik güncellenir.
- **Menü / footer değişikliği:** yalnızca `js/layout.js`.
- **Sipariş yönetimi:** `/yonetim.html` (admin girişi gerekir) — durum güncelleme,
  filtreleme, yorum moderasyonu.
- **Supabase kurulumu ve yönetimi:** [SUPABASE-KURULUM.md](SUPABASE-KURULUM.md).

## Geliştirme

Build adımı yoktur; dosyaları bir statik sunucuyla açmak yeterlidir:

```bash
npx serve .        # veya python3 -m http.server
```

`main`'e (veya bağlı dala) push edilen her commit Vercel tarafından otomatik yayınlanır.

### Tip kontrolü

Kod tabanı `// @ts-check` + JSDoc ile tiplenmiştir (`jsconfig.json`).
VS Code hataları anlık gösterir; komut satırından:

```bash
cd tests && npm install && npm run typecheck
```

### Testler

Uçtan uca Playwright testleri kritik akışları doğrular (sepet, boyut seçimi,
yorumlar, üyelik formları, yönetim paneli). Her push'ta GitHub Actions'ta
otomatik koşar (`.github/workflows/test.yml`). Yerelde:

```bash
cd tests
npm install
npx playwright install chromium   # ilk seferde
npm test
```

## Sipariş akışı

1. Müşteri sepeti doldurur → **WhatsApp ile Siparişi Tamamla**
2. Girişli müşteride sipariş Supabase'e kaydedilir ve mesaja sipariş no eklenir
3. Siz `/yonetim.html`'den durumu ilerletirsiniz: `alindi → hazirlaniyor → kargoda → teslim`
4. Müşteri güncel durumu **Hesabım** sayfasında görür

> Online ödeme (iyzico/PayTR) bir sonraki fazdır; öncesinde ürün kataloğunun
> Supabase `products` tablosuna taşınması ve tutarın sunucu tarafında
> hesaplanması gerekir.
