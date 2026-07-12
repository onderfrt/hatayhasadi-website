/* ============================================================
   HATAY HASADI – ÜYELİK SİSTEMİ (Supabase Auth)
   - Kayıt / giriş / çıkış
   - Nav'a "Giriş Yap" / "Hesabım" bağlantısı ekler
   - Sipariş kaydetme ve okuma (orders + order_items)
   - Yorum okuma/yazma (reviews) – Adım 4'te arayüze bağlanır

   Supabase yapılandırılmamışsa (js/supabase-config.js
   doldurulmamışsa) sessizce devre dışı kalır; site üyeliksiz
   çalışmaya devam eder.
   ============================================================ */

const HHAuth = (() => {
  let client = null;

  function isConfigured() {
    return typeof SUPABASE_URL !== 'undefined'
      && typeof window.supabase !== 'undefined'
      && !SUPABASE_URL.includes('PROJE-ADINIZ')
      && !SUPABASE_ANON_KEY.includes('BURAYA');
  }
  function isReady() { return client !== null; }
  function getClient() { return client; }

  async function getUser() {
    if (!client) return null;
    const { data: { user } } = await client.auth.getUser();
    return user;
  }

  /* ---------- Kayıt / Giriş / Çıkış ---------- */
  async function signUp(email, password, fullName, phone) {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone } }
    });
    if (error) throw error;
    // E-posta doğrulaması açıksa session null döner
    return { needsConfirmation: !data.session, user: data.user };
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async function signOut() {
    if (client) await client.auth.signOut();
  }

  /** Şifre sıfırlama e-postası gönderir; bağlantı hesap.html'e döner. */
  async function resetPassword(email) {
    const redirectTo = location.origin + location.pathname.replace(/[^/]*$/, '') + 'hesap.html';
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  /** Kurtarma bağlantısından gelen oturum için yeni şifre belirler. */
  async function updatePassword(newPassword) {
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  /* ---------- Profil ---------- */
  async function getProfile() {
    const user = await getUser();
    if (!user) return null;
    const { data } = await client.from('profiles').select('*').eq('id', user.id).single();
    return data ? { ...data, email: user.email } : { id: user.id, email: user.email, full_name: '', phone: '' };
  }

  async function updateProfile(fullName, phone) {
    const user = await getUser();
    if (!user) throw new Error('Oturum bulunamadı');
    const { error } = await client.from('profiles')
      .update({ full_name: fullName, phone: phone })
      .eq('id', user.id);
    if (error) throw error;
  }

  /* ---------- Siparişler ---------- */
  /** Sepeti veritabanına kaydeder, order_no döner (giriş yoksa null). */
  async function saveOrder(cartItems, totalAmount) {
    const user = await getUser();
    if (!user) return null;

    const { data: order, error } = await client.from('orders')
      .insert({ user_id: user.id, total: totalAmount })
      .select('id, order_no')
      .single();
    if (error) throw error;

    const rows = cartItems.map(i => {
      const p = getProduct(i.id);
      const s = p.sizes[i.size];
      return {
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        size_label: s.label,
        qty: i.qty,
        unit_price: s.price
      };
    });
    const { error: itemErr } = await client.from('order_items').insert(rows);
    if (itemErr) throw itemErr;

    return order.order_no;
  }

  async function getMyOrders() {
    const user = await getUser();
    if (!user) return [];
    const { data, error } = await client.from('orders')
      .select('id, order_no, status, total, created_at, order_items ( product_name, size_label, qty, unit_price )')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /* ---------- Yorumlar (Adım 4 altyapısı) ---------- */
  async function getReviews(productId) {
    if (!client) return [];
    const { data } = await client.from('reviews')
      .select('display_name, rating, comment, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  /** Ana sayfa vitrini için en yüksek puanlı son yorumlar. */
  async function getTopReviews(limit = 3) {
    if (!client) return [];
    const { data } = await client.from('reviews')
      .select('product_id, display_name, rating, comment, created_at')
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }

  async function addReview(productId, rating, comment) {
    const user = await getUser();
    if (!user) throw new Error('Yorum yapabilmek için giriş yapmalısınız.');
    const profile = await getProfile();
    const name = (profile.full_name || user.email.split('@')[0]).trim();
    // 'Ayşe Kaya' -> 'Ayşe K.'
    const parts = name.split(/\s+/);
    const displayName = parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
      : parts[0];
    const { error } = await client.from('reviews')
      .insert({ product_id: productId, user_id: user.id, display_name: displayName, rating, comment });
    if (error) {
      if (error.code === '42501') throw new Error('Yalnızca satın aldığınız ürünlere yorum yapabilirsiniz.');
      if (error.code === '23505') throw new Error('Bu ürüne zaten bir yorumunuz var.');
      throw error;
    }
  }

  /* ---------- Yönetim paneli (admin) ---------- */
  async function isAdmin() {
    const user = await getUser();
    if (!user) return false;
    const { data } = await client.from('profiles').select('is_admin').eq('id', user.id).single();
    return !!(data && data.is_admin);
  }

  /** Tüm siparişler + müşteri bilgisi (yalnızca admin RLS'i geçer). */
  async function getAllOrders() {
    const { data: orders, error } = await client.from('orders')
      .select('id, order_no, status, total, created_at, user_id, order_items ( product_name, size_label, qty, unit_price )')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!orders || !orders.length) return [];
    const ids = [...new Set(orders.map(o => o.user_id))];
    const { data: profiles } = await client.from('profiles')
      .select('id, full_name, phone, email').in('id', ids);
    const byId = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    return orders.map(o => ({ ...o, customer: byId[o.user_id] || null }));
  }

  async function updateOrderStatus(orderId, status) {
    const { error } = await client.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
  }

  /** Moderasyon için tüm yorumlar (id dahil). */
  async function getAllReviewsAdmin() {
    const { data, error } = await client.from('reviews')
      .select('id, product_id, display_name, rating, comment, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function deleteReview(reviewId) {
    const { error } = await client.from('reviews').delete().eq('id', reviewId);
    if (error) throw error;
  }

  /* ---------- Nav entegrasyonu ---------- */
  function updateNavLink(session) {
    const link = document.getElementById('hhAuthLink');
    if (!link) return;
    if (session && session.user) {
      const name = (session.user.user_metadata && session.user.user_metadata.full_name || '').split(' ')[0];
      link.textContent = name ? `Hesabım (${name})` : 'Hesabım';
    } else {
      link.textContent = 'Giriş Yap';
    }
  }

  function injectNavLink() {
    const ul = document.querySelector('.nav-links');
    if (!ul) return;
    const li = document.createElement('li');
    li.innerHTML = '<a href="hesap.html" id="hhAuthLink">Giriş Yap</a>';
    const mobileCta = ul.querySelector('.mobile-cta');
    if (mobileCta) ul.insertBefore(li, mobileCta.parentElement);
    else ul.appendChild(li);
  }

  /* ---------- Başlatma ---------- */
  async function init() {
    if (!isConfigured()) return;
    // URL'yi normalize et: yanlışlıkla eklenen /rest/v1 gibi yolları
    // ve sondaki eğik çizgileri temizle (istemci yolları kendisi ekler)
    const baseUrl = SUPABASE_URL
      .replace(/\/(rest|auth|storage|realtime|functions)\/v\d+\/?$/i, '')
      .replace(/\/+$/, '');
    client = window.supabase.createClient(baseUrl, SUPABASE_ANON_KEY);
    injectNavLink();
    const { data: { session } } = await client.auth.getSession();
    updateNavLink(session);
    client.auth.onAuthStateChange((event, s) => {
      updateNavLink(s);
      if (event === 'PASSWORD_RECOVERY') {
        document.dispatchEvent(new CustomEvent('hh-password-recovery'));
      }
    });
    document.dispatchEvent(new CustomEvent('hh-auth-ready'));
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    isConfigured, isReady, getClient, getUser,
    signUp, signIn, signOut,
    resetPassword, updatePassword,
    getProfile, updateProfile,
    isAdmin, getAllOrders, updateOrderStatus, getAllReviewsAdmin, deleteReview,
    saveOrder, getMyOrders,
    getReviews, getTopReviews, addReview
  };
})();
