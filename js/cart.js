// @ts-check
/* ============================================================
   HATAY HASADI – SEPET SİSTEMİ
   localStorage tabanlı sepet. Kendi panel arayüzünü sayfaya
   otomatik ekler. Sipariş şimdilik WhatsApp üzerinden
   tamamlanır; online ödeme altyapısı eklendiğinde yalnızca
   checkout() fonksiyonu güncellenecektir.

   Kullanım: HHCart.add(productId, sizeIndex, qty)
   ============================================================ */

const HHCart = (() => {
  const KEY = 'hh_cart_v1';
  const WA_NUMBER = '905441230776';
  const FREE_SHIP = 1500; // ₺ — ücretsiz kargo eşiği

  /* ---------- Veri ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    renderBadge();
    renderDrawer();
  }
  function add(productId, sizeIndex = 0, qty = 1) {
    const items = load();
    const found = items.find(i => i.id === productId && i.size === sizeIndex);
    if (found) found.qty += qty;
    else items.push({ id: productId, size: sizeIndex, qty });
    save(items);
    toast('Sepete eklendi ✓', { label: 'Sepete Git →', onClick: open });
  }
  function setQty(productId, sizeIndex, qty) {
    let items = load();
    const found = items.find(i => i.id === productId && i.size === sizeIndex);
    if (!found) return;
    found.qty = qty;
    if (found.qty <= 0) items = items.filter(i => i !== found);
    save(items);
  }
  function clear() { save([]); }
  function count() { return load().reduce((s, i) => s + i.qty, 0); }
  function total() {
    return load().reduce((s, i) => {
      const p = getProduct(i.id);
      return p ? s + p.sizes[i.size].price * i.qty : s;
    }, 0);
  }

  /* ---------- Checkout ----------
     Üye girişi varsa sipariş önce veritabanına kaydedilir ve
     WhatsApp mesajına sipariş numarası eklenir. Girişsiz veya
     kayıt başarısız olsa bile WhatsApp siparişi her zaman çalışır.
     Online ödeme eklendiğinde yalnızca bu fonksiyon güncellenecek. */
  async function checkout() {
    const items = load();
    if (!items.length) return;

    let orderLine = '';
    try {
      if (typeof HHAuth !== 'undefined' && HHAuth.isReady()) {
        const orderNo = await HHAuth.saveOrder(items, total());
        if (orderNo) orderLine = `\nSipariş No: #${orderNo}`;
      }
    } catch (e) {
      console.warn('Sipariş veritabanına kaydedilemedi, WhatsApp ile devam ediliyor:', e.message);
    }

    const lines = items.map(i => {
      const p = getProduct(i.id);
      const s = p.sizes[i.size];
      return `• ${p.name} (${s.label}) x ${i.qty} — ${formatTL(s.price * i.qty)}`;
    });
    const msg = `Merhaba, sipariş vermek istiyorum:\n\n${lines.join('\n')}\n\nToplam: ${formatTL(total())}${orderLine}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    if (orderLine) clear();
  }

  /* ---------- Arayüz ---------- */
  const CSS = `
    .hh-cart-overlay { position: fixed; inset: 0; background: rgba(45,31,16,0.5); z-index: 300; opacity: 0; visibility: hidden; transition: opacity 0.3s; }
    .hh-cart-overlay.open { opacity: 1; visibility: visible; }
    .hh-cart-drawer { position: fixed; top: 0; right: -400px; width: min(400px, 100vw); height: 100vh; height: 100dvh; background: #F7F2E8; z-index: 310; display: flex; flex-direction: column; box-shadow: -8px 0 32px rgba(0,0,0,0.2); transition: right 0.35s ease; }
    .hh-cart-drawer.open { right: 0; }
    .hh-cart-head { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid rgba(92,122,46,0.2); }
    .hh-cart-head h3 { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #3D2B1F; }
    .hh-cart-close { background: none; border: none; font-size: 26px; line-height: 1; cursor: pointer; color: #6B4E35; padding: 4px 8px; }
    .hh-cart-items { flex: 1; overflow-y: auto; padding: 1rem 1.4rem; }
    .hh-cart-empty { text-align: center; color: #6B4E35; font-size: 14px; padding: 3rem 1rem; line-height: 1.7; }
    .hh-cart-item { display: flex; gap: 0.8rem; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(61,43,31,0.08); }
    .hh-cart-item img { width: 56px; height: 56px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
    .hh-ci-info { flex: 1; min-width: 0; }
    .hh-ci-name { font-size: 13.5px; font-weight: 700; color: #3D2B1F; line-height: 1.3; }
    .hh-ci-size { font-size: 12px; color: #6B4E35; }
    .hh-ci-price { font-size: 13.5px; font-weight: 700; color: #5C7A2E; margin-top: 2px; }
    .hh-ci-qty { display: flex; align-items: center; gap: 2px; }
    .hh-ci-qty button { width: 26px; height: 26px; border-radius: 8px; border: 1px solid rgba(92,122,46,0.35); background: #fff; color: #3E5420; font-size: 15px; font-weight: 700; cursor: pointer; line-height: 1; }
    .hh-ci-qty button:hover { background: #EDE5D0; }
    .hh-ci-qty span { min-width: 26px; text-align: center; font-size: 14px; font-weight: 700; color: #2D1F10; }
    .hh-cart-foot { border-top: 1px solid rgba(92,122,46,0.2); padding: 1.1rem 1.4rem 1.3rem; background: #EDE5D0; }
    .hh-cart-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.9rem; }
    .hh-cart-total span { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6B4E35; }
    .hh-cart-total strong { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #3E5420; }
    .hh-cart-wa { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: #25D366; color: #fff; border: none; padding: 0.9rem 1rem; border-radius: 30px; font-size: 14.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; }
    .hh-cart-wa:hover { background: #1ebe5d; }
    .hh-cart-note { font-size: 11.5px; color: #6B4E35; text-align: center; margin-top: 0.7rem; line-height: 1.5; }
    .hh-cart-clear { display: block; margin: 0.6rem auto 0; background: none; border: none; font-size: 12px; color: #a05c4a; cursor: pointer; text-decoration: underline; font-family: inherit; }
    .hh-toast { position: fixed; bottom: 5.5rem; left: 50%; transform: translate(-50%, 20px); background: #3E5420; color: #fff; padding: 0.7rem 1.5rem; border-radius: 30px; font-size: 14px; font-weight: 700; z-index: 400; opacity: 0; transition: all 0.3s ease; pointer-events: none; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
    .hh-toast.show { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
    .hh-toast-act { margin-left: 12px; background: #E8C97A; color: #2D1F10; border: none; border-radius: 16px; padding: 4px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .hh-toast-act:hover { background: #f0d692; }
    .hh-ship { margin-bottom: 1rem; display: none; }
    .hh-ship-txt { font-size: 12.5px; color: #3D2B1F; margin-bottom: 6px; }
    .hh-ship-txt strong { color: #3E5420; }
    .hh-ship-bar { height: 8px; border-radius: 6px; background: rgba(61,43,31,0.12); overflow: hidden; }
    .hh-ship-bar span { display: block; height: 100%; width: 0; border-radius: 6px; background: linear-gradient(90deg, #C4963A, #5C7A2E); transition: width 0.4s ease; }
    .hh-ship-bar span.done { background: #5C7A2E; }
    .nav-cart-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 6px; color: #3D2B1F; }
    .nav-cart-btn svg { width: 24px; height: 24px; stroke: currentColor; stroke-width: 1.8; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .nav-cart-btn:hover { color: #5C7A2E; }
    .nav-cart-count { position: absolute; top: -2px; right: -4px; min-width: 18px; height: 18px; border-radius: 9px; background: #5C7A2E; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
    .nav-cart-count.empty { display: none; }
  `;

  const BAG_SVG = `<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`;

  function injectUI() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'hh-cart-overlay';
    overlay.id = 'hhCartOverlay';
    overlay.addEventListener('click', close);

    const drawer = document.createElement('aside');
    drawer.className = 'hh-cart-drawer';
    drawer.id = 'hhCartDrawer';
    drawer.innerHTML = `
      <div class="hh-cart-head">
        <h3>Sepetim</h3>
        <button class="hh-cart-close" aria-label="Kapat">×</button>
      </div>
      <div class="hh-cart-items" id="hhCartItems"></div>
      <div class="hh-cart-foot">
        <div class="hh-ship" id="hhShip">
          <div class="hh-ship-txt" id="hhShipTxt"></div>
          <div class="hh-ship-bar"><span id="hhShipFill"></span></div>
        </div>
        <div class="hh-cart-total"><span>Toplam</span><strong id="hhCartTotal">0 ₺</strong></div>
        <button class="hh-cart-wa" id="hhCartCheckout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp ile Siparişi Tamamla
        </button>
        <p class="hh-cart-note">Online ödeme çok yakında! Şimdilik siparişiniz WhatsApp üzerinden alınır, ödeme IBAN ile yapılır.</p>
        <button class="hh-cart-clear" id="hhCartClear">Sepeti Boşalt</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    drawer.querySelector('.hh-cart-close').addEventListener('click', close);
    drawer.querySelector('#hhCartCheckout').addEventListener('click', checkout);
    drawer.querySelector('#hhCartClear').addEventListener('click', () => {
      if (confirm('Sepetiniz boşaltılsın mı?')) clear();
    });

    const toastEl = document.createElement('div');
    toastEl.className = 'hh-toast';
    toastEl.id = 'hhToast';
    document.body.appendChild(toastEl);

    // Nav'a sepet butonu ekle (hamburger'den önce)
    const nav = document.querySelector('nav');
    if (nav) {
      const btn = document.createElement('button');
      btn.className = 'nav-cart-btn';
      btn.setAttribute('aria-label', 'Sepeti aç');
      btn.innerHTML = `${BAG_SVG}<span class="nav-cart-count empty" id="hhCartCount">0</span>`;
      btn.addEventListener('click', open);
      const hamburger = nav.querySelector('.hamburger');
      if (hamburger) nav.insertBefore(btn, hamburger);
      else nav.appendChild(btn);
    }

    renderBadge();
    renderDrawer();
  }

  function open() {
    document.getElementById('hhCartDrawer').classList.add('open');
    document.getElementById('hhCartOverlay').classList.add('open');
  }
  function close() {
    document.getElementById('hhCartDrawer').classList.remove('open');
    document.getElementById('hhCartOverlay').classList.remove('open');
  }

  let toastTimer;
  function toast(text, action) {
    const el = document.getElementById('hhToast');
    if (!el) return;
    el.innerHTML = '';
    el.appendChild(document.createTextNode(text));
    if (action) {
      const btn = document.createElement('button');
      btn.className = 'hh-toast-act';
      btn.textContent = action.label;
      btn.addEventListener('click', () => { el.classList.remove('show'); action.onClick(); });
      el.appendChild(btn);
    }
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), action ? 3200 : 1800);
  }

  function renderBadge() {
    const el = document.getElementById('hhCartCount');
    if (!el) return;
    const c = count();
    el.textContent = c;
    el.classList.toggle('empty', c === 0);
  }

  function renderDrawer() {
    const wrap = document.getElementById('hhCartItems');
    if (!wrap) return;
    const items = load();
    if (!items.length) {
      wrap.innerHTML = `<div class="hh-cart-empty">Sepetiniz henüz boş.<br>Ürünlerimize göz atarak başlayabilirsiniz. 🌿</div>`;
    } else {
      wrap.innerHTML = items.map(i => {
        const p = getProduct(i.id);
        if (!p) return '';
        const s = p.sizes[i.size];
        return `
          <div class="hh-cart-item">
            <img src="${p.images[0]}" alt="${p.name}">
            <div class="hh-ci-info">
              <div class="hh-ci-name">${p.name}</div>
              <div class="hh-ci-size">${s.label}</div>
              <div class="hh-ci-price">${formatTL(s.price * i.qty)}</div>
            </div>
            <div class="hh-ci-qty">
              <button data-act="dec" data-id="${i.id}" data-size="${i.size}" aria-label="Azalt">−</button>
              <span>${i.qty}</span>
              <button data-act="inc" data-id="${i.id}" data-size="${i.size}" aria-label="Artır">+</button>
            </div>
          </div>`;
      }).join('');
      wrap.querySelectorAll('button[data-act]').forEach((btn) => {
        const b = /** @type {HTMLButtonElement} */ (btn);
        b.addEventListener('click', () => {
          const { act, id } = b.dataset;
          const size = parseInt(b.dataset.size, 10);
          const item = load().find(x => x.id === id && x.size === size);
          if (item) setQty(id, size, item.qty + (act === 'inc' ? 1 : -1));
        });
      });
    }
    const totalEl = document.getElementById('hhCartTotal');
    if (totalEl) totalEl.textContent = formatTL(total());

    // Ücretsiz kargo ilerleme çubuğu
    const shipEl = document.getElementById('hhShip');
    if (shipEl) {
      const t = total();
      shipEl.style.display = t > 0 ? 'block' : 'none';
      const fill = document.getElementById('hhShipFill');
      const txt = document.getElementById('hhShipTxt');
      const pct = Math.min(100, Math.round(t / FREE_SHIP * 100));
      fill.style.width = pct + '%';
      if (t >= FREE_SHIP) {
        txt.innerHTML = '🎉 Tebrikler, <strong>kargonuz ücretsiz!</strong>';
        fill.classList.add('done');
      } else {
        txt.innerHTML = 'Ücretsiz kargoya <strong>' + formatTL(FREE_SHIP - t) + '</strong> kaldı';
        fill.classList.remove('done');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', injectUI);

  return { add, setQty, clear, open, close, checkout, count, total };
})();
