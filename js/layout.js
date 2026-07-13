// @ts-check
/* ============================================================
   HATAY HASADI – ORTAK YERLEŞİM (nav + footer + mobil menü)
   Tüm sayfalara aynı navigasyonu ve footer'ı enjekte eder.
   Menüye link eklemek için sadece bu dosyayı düzenleyin.

   Script sırası önemlidir: layout.js, auth.js ve cart.js'den
   ÖNCE eklenmelidir (ikisi de nav'a buton ekler).
   ============================================================ */

const HHLayout = (() => {
  const WA_ORDER = 'https://wa.me/905441230776?text=Merhaba%2C%20sipari%C5%9F%20vermek%20istiyorum.';

  function isHomePage() {
    const p = location.pathname;
    return p.endsWith('/') || p.endsWith('index.html');
  }

  function navHtml() {
    const pre = isHomePage() ? '' : 'index.html';
    return `
<nav class="hh-nav">
  <a class="nav-brand" href="${pre || '#anasayfa'}">
    <div class="nav-logo-wrapper">
      <img src="images/HH_seffaf_logo.webp" alt="Hatay Hasadı Logo" class="nav-logo-img">
    </div>
    <div class="nav-brand-text">
      <strong>Hatay Hasadı</strong>
      <span>Topraktan Gelen Lezzet</span>
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="${pre}#urunler">Ürünler</a></li>
    <li><a href="${pre}#hakkimizda">Hakkımızda</a></li>
    <li><a href="${pre}#fiyatlar">Fiyatlar</a></li>
    <li><a href="${pre}#toplu-siparis">Toplu Sipariş</a></li>
    <li><a class="mobile-cta" href="${WA_ORDER}" target="_blank">Sipariş Ver →</a></li>
  </ul>
  <a class="nav-cta" href="${WA_ORDER}" target="_blank">Sipariş Ver →</a>
  <button class="hamburger" id="hamburgerBtn" aria-label="Menü">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="mobile-overlay" id="mobileOverlay"></div>`;
  }

  function footerHtml() {
    const pre = isHomePage() ? '' : 'index.html';
    return `
<footer class="hh-footer">
  <div class="footer-inner">
    <div class="footer-brand"><h3>Hatay Hasadı</h3><p>Topraktan gelen lezzeti, Hatay'dan sofralarınıza taşıyoruz. Katkısız, standart kalite, güvenilir tedarik.</p></div>
    <div class="footer-col"><h4>Ürünler</h4><a href="urun.html?id=isot">İsot Biberi</a><a href="urun.html?id=sumak">Sumak</a><a href="urun.html?id=zahter">Zahter</a><a href="${pre}#urunler">Tüm Ürünler</a></div>
    <div class="footer-col"><h4>Bilgi</h4><a href="${pre}#hakkimizda">Hakkımızda</a><a href="${pre}#nasil-siparis">Nasıl Sipariş?</a><a href="${pre}#sss">S.S.S.</a><a href="${pre}#toplu-siparis">Toplu Sipariş</a><a href="hesap.html">Hesabım</a></div>
    <div class="footer-col"><h4>İletişim</h4><a href="https://wa.me/905441230776" target="_blank">WhatsApp</a><a href="https://instagram.com/hatayhasadi" target="_blank">Instagram</a><a href="mailto:info@hatayhasadi.com">E-posta</a></div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 Hatay Hasadı. Tüm hakları saklıdır.</span>
    <span>Dürüst, Özenli, Adil Anlayış 🌿 Hatay Sevgisiyle</span>
  </div>
</footer>`;
  }

  function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (!hamburgerBtn || !navLinks || !mobileOverlay) return;

    function toggleMenu() {
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }
    hamburgerBtn.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', toggleMenu);
    navLinks.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */ (e.target);
      if (t.tagName === 'A' && navLinks.classList.contains('active')) toggleMenu();
    });
  }

  function inject() {
    document.body.insertAdjacentHTML('afterbegin', navHtml());
    document.body.insertAdjacentHTML('beforeend', footerHtml());
    initMobileMenu();

    // Vercel Web Analytics (dashboard'dan Analytics etkinleştirildiğinde çalışır)
    if (location.protocol.startsWith('http')) {
      const va = document.createElement('script');
      va.defer = true;
      va.src = '/_vercel/insights/script.js';
      document.head.appendChild(va);
    }
  }

  document.addEventListener('DOMContentLoaded', inject);

  return { isHomePage };
})();
