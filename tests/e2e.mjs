/* ============================================================
   HATAY HASADI – UÇTAN UCA TEST PAKETİ
   Siteyi gerçek bir tarayıcıda (Chromium) açar ve kritik
   akışları doğrular. Supabase çağrıları sahte (mock) istemciyle
   simüle edilir; internet bağlantısı gerekmez.

   Çalıştırma:  cd tests && npm install && npx playwright install chromium && npm test
   ============================================================ */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = (page) => 'file://' + resolve(ROOT, page);

const results = [];
const errors = [];
function check(name, ok) {
  results.push({ name, ok });
  console.log((ok ? '  ✓' : '  ✗ FAIL') + ' ' + name);
}

const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOpts);

function newPage(ctxName, opts = {}) {
  return browser.newPage({ viewport: { width: 1440, height: 900 }, ...opts }).then(p => {
    p.on('pageerror', e => errors.push(ctxName + ': ' + e.message));
    return p;
  });
}

/* ══════════ 1. ANA SAYFA ══════════ */
console.log('\nANA SAYFA');
{
  const p = await newPage('INDEX');
  await p.goto(url('index.html'));
  await p.waitForTimeout(1500);

  check('nav enjekte edildi', await p.locator('nav.hh-nav').count() === 1);
  check('footer enjekte edildi', await p.locator('footer.hh-footer').count() === 1);
  check('14 ürün kartı üretildi', await p.locator('#productGrid .product-card').count() === 14);
  check('fiyat tablosu üretildi', await p.locator('#pricingBody tr').count() === 13);
  check('SSS bölümü (7 soru)', await p.locator('.faq-item').count() === 7);

  // Boyut seçimi + sepet
  const card = p.locator('#productGrid .product-card').first();
  await card.locator('.size-row[data-size="1"]').click();
  check('kartta 250 gr seçilebiliyor', await card.locator('.size-row[data-size="1"].sel').count() === 1);
  await card.locator('[data-add]').click();
  await p.waitForTimeout(400);
  check('sepet sayacı güncellendi', (await p.locator('#hhCartCount').textContent()) === '1');
  check('bildirimde Sepete Git butonu var', await p.locator('.hh-toast-act').count() === 1);
  await p.locator('.hh-toast-act').click();
  await p.waitForTimeout(500);
  check('bildirimden sepet açılıyor', await p.locator('.hh-cart-drawer.open').count() === 1);
  check('sepete doğru boyut eklendi', (await p.locator('.hh-ci-size').first().textContent()).includes('250'));

  // Ücretsiz kargo çubuğu
  const ship1 = await p.locator('#hhShipTxt').textContent();
  check('kargo çubuğu kalan tutarı gösteriyor', ship1.includes('kaldı'));
  await p.evaluate(() => { for (let i = 0; i < 7; i++) HHCart.add('sumak', 1, 1); });
  await p.waitForTimeout(400);
  check('eşik aşılınca ücretsiz kargo mesajı', (await p.locator('#hhShipTxt').textContent()).includes('ücretsiz'));
  await p.evaluate(() => HHCart.clear());

  // Gerçek yorum vitrini (mock)
  await p.evaluate(() => {
    HHAuth.getTopReviews = async () => ([
      { product_id: 'isot', display_name: 'Test K.', rating: 5, comment: 'Harika ürün', created_at: '2026-01-01' }
    ]);
    document.dispatchEvent(new CustomEvent('hh-auth-ready'));
  });
  await p.waitForTimeout(500);
  check('gerçek yorumlar vitrine yükleniyor', (await p.locator('.testimonial-card').first().textContent()).includes('Test K.'));

  // Çoklu fotoğraflı üründe kartta ikinci görsel (hover geçişi)
  const kisnisCard = p.locator('.product-icon-wrap[href="urun.html?id=kisnis"]');
  check('kartta ikinci görsel (hover) hazır', await kisnisCard.locator('.pi-b').count() === 1);

  // Footer e-posta linki (Vercel uyumu)
  const mailto = await p.evaluate(() => {
    const a = [...document.querySelectorAll('footer a')].find(x => x.textContent === 'E-posta');
    return a ? a.getAttribute('href') : '';
  });
  check('footer e-posta linki mailto', mailto.startsWith('mailto:'));
  await p.close();
}

/* ══════════ 2. MOBİL ══════════ */
console.log('\nMOBİL');
{
  const p = await newPage('MOBILE', { viewport: { width: 390, height: 844 } });
  await p.goto(url('index.html'));
  await p.waitForTimeout(1200);
  await p.click('#hamburgerBtn');
  await p.waitForTimeout(500);
  check('hamburger menü açılıyor', await p.locator('.nav-links.active').count() === 1);
  await p.evaluate(() => document.getElementById('mobileOverlay').click());
  await p.waitForTimeout(400);
  const cols = await p.evaluate(() =>
    getComputedStyle(document.getElementById('productGrid')).gridTemplateColumns.split(' ').length);
  check('telefonda 2 sütunlu ürün ızgarası', cols === 2);

  // Ürün sayfası: yapışkan satın alma çubuğu
  await p.goto(url('urun.html') + '?id=isot');
  await p.waitForTimeout(1500);
  check('mobil satın alma çubuğu görünür', await p.locator('#mobileBuyBar').isVisible());
  check('çubukta fiyat var', (await p.locator('#mbPrice').textContent()).includes('₺'));
  await p.click('#mbAdd');
  await p.waitForTimeout(400);
  check('çubuktan sepete ekleniyor', (await p.locator('#hhCartCount').textContent()) === '1');
  await p.close();
}

/* ══════════ 3. ÜRÜN DETAY ══════════ */
console.log('\nÜRÜN DETAY');
{
  const p = await newPage('URUN');
  await p.goto(url('urun.html') + '?id=isot');
  await p.waitForTimeout(1800);

  check('ürün başlığı yüklendi', (await p.locator('#pTitle').textContent()) === 'İsot Biberi');
  check('boyut seçenekleri', await p.locator('.size-opt').count() === 2);

  // JSON-LD
  const ld = await p.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
  check('JSON-LD Product şeması', ld['@type'] === 'Product' && ld.offers.lowPrice === 109);
  check('dinamik meta description', (await p.evaluate(() => document.querySelector('meta[name="description"]').getAttribute('content'))).startsWith('İsot Biberi:'));

  // Sekmeler
  await p.click('[data-tab="benefits"]');
  check('faydalar sekmesi', await p.locator('#tab-benefits.active .benefit-list li').count() >= 3);
  await p.click('[data-tab="recipes"]');
  check('tarifler sekmesi', await p.locator('#tab-recipes.active .recipe-card').count() >= 1);

  // Yorum akışı (mock)
  await p.click('[data-tab="reviews"]');
  await p.evaluate(async () => {
    HHAuth.isConfigured = () => true;
    HHAuth.isReady = () => true;
    HHAuth.getUser = async () => ({ id: 'u1', email: 't@t.com', user_metadata: { full_name: 'Test Kullanıcı' } });
    HHAuth.getReviews = async () => ([
      { display_name: 'Ayşe K.', rating: 5, comment: 'Süper!', created_at: '2026-01-01' },
      { display_name: 'Ali B.', rating: 4, comment: 'Güzel.', created_at: '2026-01-02' }
    ]);
    HHAuth.addReview = async () => { throw new Error('Yalnızca satın aldığınız ürünlere yorum yapabilirsiniz.'); };
    await window.HHReviewsRefresh();
  });
  await p.waitForTimeout(500);
  check('yorum listesi (2 yorum)', await p.locator('.review-item').count() === 2);
  check('sekme başlığında yorum sayısı', (await p.locator('[data-tab="reviews"]').textContent()) === 'Yorumlar (2)');
  check('yıldız ortalaması özeti', /4\.5/.test(await p.locator('#pRating').textContent()));
  check('JSON-LD yıldız ortalaması eklendi', await p.evaluate(() =>
    JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).aggregateRating.ratingValue === '4.5'));
  check('girişli kullanıcıya yorum formu', await p.locator('.review-form').count() === 1);

  await p.locator('.star-input button').nth(2).click();
  await p.fill('#reviewText', 'Deneme yorumu');
  await p.click('#reviewSubmit');
  await p.waitForTimeout(400);
  check('satın almamış hatası gösteriliyor', /satın aldığınız/.test(await p.locator('#reviewMsg').textContent()));

  await p.evaluate(() => { HHAuth.addReview = async () => {}; });
  await p.click('#reviewSubmit');
  await p.waitForTimeout(400);
  check('başarılı yorum mesajı', /yayınlandı/.test(await p.locator('#reviewMsg').textContent()));

  await p.evaluate(async () => { HHAuth.getUser = async () => null; await window.HHReviewsRefresh(); });
  await p.waitForTimeout(400);
  check('girişsiz kullanıcıya giriş çağrısı', await p.locator('.review-cta').count() === 1);

  // Çoklu fotoğraf galerisi (kişniş: 2 görsel)
  await p.goto(url('urun.html') + '?id=kisnis');
  await p.waitForTimeout(1500);
  check('galeri noktaları (2 görsel)', await p.locator('#gDots span').count() === 2);
  check('galeri okları görünür', await p.locator('#gNext').isVisible());
  await p.click('#gNext');
  await p.waitForTimeout(400);
  check('ok ile görsel değişiyor', await p.locator('#gDots span.on').evaluate(el => [...el.parentElement.children].indexOf(el)) === 1);
  await p.click('#galleryMain0');
  await p.waitForTimeout(400);
  check('lightbox açılıyor', await p.locator('.lightbox.open').count() === 1);
  check('lightbox sayaç 2/2', (await p.locator('#lbCount').textContent()) === '2 / 2');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  check('lightbox ESC ile kapanıyor', await p.locator('.lightbox.open').count() === 0);

  // Bilinmeyen ürün
  await p.goto(url('urun.html') + '?id=olmayan-urun');
  await p.waitForTimeout(1000);
  check('bilinmeyen ürün için hata sayfası', (await p.locator('.not-found h1').textContent()) === 'Ürün bulunamadı');
  await p.close();
}

/* ══════════ 4. HESAP ══════════ */
console.log('\nHESAP');
{
  const p = await newPage('HESAP');
  await p.goto(url('hesap.html'));
  await p.waitForTimeout(2000);

  const authVisible = await p.locator('#viewAuth:not(.hidden)').count() === 1;
  const setupVisible = await p.locator('#viewSetup:not(.hidden)').count() === 1;
  check('giriş formu veya kurulum rehberi görünüyor', authVisible || setupVisible);

  if (authVisible) {
    await p.click('#btnForgot');
    check('şifremi unuttum formu açılıyor', await p.locator('#formForgot:not(.hidden)').count() === 1);
    await p.click('#btnBackLogin');
    check('girişe geri dönülüyor', await p.locator('#formLogin:not(.hidden)').count() === 1);

    await p.evaluate(() => document.dispatchEvent(new CustomEvent('hh-password-recovery')));
    await p.waitForTimeout(300);
    check('şifre kurtarma formu açılıyor', await p.locator('#viewRecovery:not(.hidden)').count() === 1);
    await p.fill('#rcPass', 'yeni123');
    await p.fill('#rcPass2', 'farkli456');
    await p.click('#formRecovery button');
    await p.waitForTimeout(300);
    check('şifre uyuşmazlığı uyarısı', (await p.locator('#recoveryMsg').textContent()).includes('uyuşmuyor'));
  }
  await p.close();
}

/* ══════════ 5. YÖNETİM PANELİ ══════════ */
console.log('\nYÖNETİM PANELİ');
{
  const p = await newPage('YONETIM');
  await p.goto(url('yonetim.html'));
  await p.waitForTimeout(2000);
  check('yetkisiz kullanıcıya erişim reddi', await p.locator('#viewDenied:not(.hidden)').count() === 1);

  // Admin mock
  await p.evaluate(() => {
    HHAuth.isConfigured = () => true;
    HHAuth.isReady = () => true;
    HHAuth.isAdmin = async () => true;
    HHAuth.getAllOrders = async () => ([
      { id: 'o2', order_no: 2, status: 'alindi', total: 463, created_at: '2026-01-02T10:00:00Z', user_id: 'u1',
        customer: { full_name: 'Önder Kara', phone: '05441112233', email: 'onder@mail.com' },
        order_items: [{ product_name: 'İsot Biberi', size_label: '250 gr', qty: 1, unit_price: 245 }] },
      { id: 'o1', order_no: 1, status: 'teslim', total: 2500, created_at: '2026-01-01T10:00:00Z', user_id: 'u2',
        customer: { full_name: 'Ayşe Yılmaz', phone: '05551112233', email: 'ayse@mail.com' },
        order_items: [{ product_name: 'Naturel Sızma Zeytinyağı', size_label: '5 L Teneke', qty: 1, unit_price: 2500 }] }
    ]);
    HHAuth.updateOrderStatus = async () => {};
    HHAuth.getAllReviewsAdmin = async () => ([
      { id: 1, product_id: 'isot', display_name: 'Test K.', rating: 5, comment: 'Süper', created_at: '2026-01-01' }
    ]);
    HHAuth.deleteReview = async () => {};
    document.dispatchEvent(new CustomEvent('hh-auth-ready'));
  });
  await p.waitForTimeout(800);
  check('admin paneli açılıyor', await p.locator('#viewPanel:not(.hidden)').count() === 1);
  check('siparişler listeleniyor', await p.locator('.adm-order').count() === 2);
  check('istatistikler hesaplanıyor', (await p.locator('#statsRow').textContent()).includes('2.963'));

  await p.locator('.status-sel').first().selectOption('kargoda');
  await p.waitForTimeout(400);
  check('durum güncelleme geri bildirimi', await p.locator('.adm-saved.show').count() === 1);

  await p.locator('.chip[data-st="teslim"]').click();
  await p.waitForTimeout(300);
  check('durum filtresi çalışıyor', await p.locator('.adm-order').count() === 1);

  await p.locator('.chip[data-st=""]').click();
  await p.fill('#orderSearch', 'ayşe');
  await p.waitForTimeout(300);
  check('müşteri araması çalışıyor', await p.locator('.adm-order').count() === 1);

  await p.locator('.admin-tab[data-atab="reviews"]').click();
  await p.waitForTimeout(400);
  check('yorum moderasyonu listeleniyor', await p.locator('.adm-review').count() === 1);
  p.on('dialog', d => d.accept());
  await p.locator('.btn-del').first().click();
  await p.waitForTimeout(400);
  check('yorum silme çalışıyor', await p.locator('.adm-review').count() === 0);
  await p.close();
}

/* ══════════ SONUÇ ══════════ */
await browser.close();
const failed = results.filter(r => !r.ok);
console.log('\n' + '═'.repeat(50));
console.log(`SONUÇ: ${results.length - failed.length}/${results.length} test geçti`);
if (errors.length) {
  console.log('\nSayfa JS hataları:');
  errors.forEach(e => console.log('  ✗ ' + e));
}
if (failed.length || errors.length) {
  process.exit(1);
}
console.log('Tüm testler başarılı, JS hatası yok ✓');
