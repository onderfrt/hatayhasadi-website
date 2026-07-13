// @ts-check
/* ============================================================
   HATAY HASADI – MERKEZİ ÜRÜN VERİSİ
   Yeni ürün eklemek veya fiyat güncellemek için sadece bu
   dosyayı düzenleyin. Ürün kartları, fiyat tablosu ve ürün
   detay sayfaları bu veriden otomatik oluşturulur.

   images: İlk görsel ana görseldir. Yeni fotoğraf eklemek için
   dosyayı images/ klasörüne koyup yolunu diziye ekleyin.
   ============================================================ */

/**
 * @typedef {Object} ProductSize
 * @property {string} label   Boyut etiketi ('100 gr', '250 gr', '5 L Teneke')
 * @property {number|null} old  Kampanya öncesi fiyat (yoksa null)
 * @property {number} price   Güncel satış fiyatı (₺)
 */
/**
 * @typedef {Object} Recipe
 * @property {string} title
 * @property {string} text
 */
/**
 * @typedef {Object} Product
 * @property {string} id          URL ve sepette kullanılan benzersiz kimlik
 * @property {string} name
 * @property {string} badge
 * @property {string[]} images    İlk görsel ana görseldir
 * @property {string} short       Kart ve özet açıklaması
 * @property {string} description Detay sayfası uzun açıklaması
 * @property {string[]} benefits
 * @property {Recipe[]} recipes
 * @property {ProductSize[]} sizes
 * @property {boolean} [featured] Vitrin ürünü (gridde ve tabloda gösterilmez)
 */

/** @type {Product[]} */
const PRODUCTS = [
  {
    id: "isot",
    name: "İsot Biberi",
    badge: "Hatay'a Özgü",
    images: ["images/Isot.webp"],
    short: "Hatay'ın simge baharatı. Kendine özgü duman aroması ve orta ateşiyle.",
    description: "İsot, güneşte kurutulan kırmızı biberlerin geleneksel yöntemle terletilerek karartılmasıyla elde edilir. Hatay ve Güneydoğu mutfağının simgesi olan bu baharat; dumansı, hafif meyvemsi aroması ve orta seviye acısıyla yemeklere derinlik katar. İsotumuz katkısız ve boyasızdır; rengini ve kokusunu yalnızca doğal kurutma sürecinden alır.",
    benefits: [
      "İçerdiği kapsaisin ile metabolizmanın çalışmasına destek olduğu bilinir",
      "C vitamini ve doğal antioksidanlar bakımından zengindir",
      "İştah açıcı özelliğiyle sindirime yardımcı olarak bilinir",
      "Yapay renklendirici ve koruyucu içermez"
    ],
    recipes: [
      { title: "Çiğ Köfte", text: "Bol isotlu geleneksel çiğ köftenin vazgeçilmezi. İnce bulgurla yoğrulurken avuç avuç isot eklenir; dumansı aroması köfteye rengini ve karakterini verir." },
      { title: "İsotlu Kebap Harcı", text: "Kıymaya isot, tuz ve az miktarda sarımsak ekleyin. Mangala girmeden 1 saat dinlendirdiğinizde Hatay usulü kebabın o meşhur aromasını yakalarsınız." }
    ],
    sizes: [
      { label: "100 gr", old: 129, price: 109 },
      { label: "250 gr", old: 299, price: 245 }
    ]
  },
  {
    id: "pul-biber",
    name: "Kırmızı Pul Biber",
    badge: "En Çok Satan",
    images: ["images/PulBiber.webp"],
    short: "Acı çeşidi. Güneydoğu'nun bereket yüklü kırmızısı, yoğun renk ve aroma.",
    description: "Güneşte kurutulmuş kırmızı biberlerin çekirdeğiyle birlikte çekilmesiyle hazırlanan pul biberimiz, yoğun rengi ve dengeli acısıyla her mutfağın temel taşıdır. Tamamen doğal kurutma ile hazırlanır; içine yağ, tuz veya renklendirici karıştırılmaz.",
    benefits: [
      "Kapsaisin içeriğiyle kan dolaşımını desteklediği bilinir",
      "A ve C vitamini kaynağıdır",
      "Yemeklere doğal renk ve aroma verir, yapay katkı gerektirmez",
      "Çekirdekli çekim sayesinde aroması uzun süre korunur"
    ],
    recipes: [
      { title: "Tereyağlı Pul Biber Sosu", text: "Tereyağını eritip kısık ateşte pul biberi 30 saniye çevirin. Mantı, çorba ve makarnanın üzerinde efsanedir." },
      { title: "Et Marinasyonu", text: "Zeytinyağı, pul biber, kekik ve sarımsakla hazırlanan karışımda etinizi 2 saat dinlendirin; hem renk hem lezzet katar." }
    ],
    sizes: [
      { label: "100 gr", old: 119, price: 99 },
      { label: "250 gr", old: 259, price: 219 }
    ]
  },
  {
    id: "sumak",
    name: "Sumak (Çekilmiş)",
    badge: "Restoran Seçimi",
    images: ["images/Sumak.webp"],
    short: "1. kalite Hatay sumağı. Ekşi, aromatik, salatada ve mezede vazgeçilmez.",
    description: "Sumak ağacının olgun meyvelerinin kurutulup çekilmesiyle elde edilir. Hatay sumağı, yoğun bordo rengi ve dengeli ekşiliğiyle Türkiye'nin en kaliteli sumakları arasında gösterilir. Salatalardan kebap yanı soğan piyazına kadar geniş bir kullanım alanı vardır; limonun yerini tutan doğal bir ekşilik sunar.",
    benefits: [
      "Güçlü antioksidan içeriğiyle bilinir",
      "C vitamini bakımından zengindir",
      "Limona doğal bir alternatif olarak tuz ve asit dengesini destekler",
      "Sindirimi rahatlattığı geleneksel olarak bilinir"
    ],
    recipes: [
      { title: "Sumaklı Soğan Piyazı", text: "İnce doğranmış soğanı sumak, maydanoz ve az tuzla ovun. Kebapların ve ızgaraların değişmez eşlikçisidir." },
      { title: "Sumaklı Salata Sosu", text: "Zeytinyağı, nar ekşisi ve bir tatlı kaşığı sumağı çırpın. Mevsim salatasına Hatay dokunuşu katar." }
    ],
    sizes: [
      { label: "100 gr", old: 209, price: 175 },
      { label: "250 gr", old: 499, price: 425 }
    ]
  },
  {
    id: "zahter",
    name: "Zahter",
    badge: "Hatay Aroması",
    images: ["images/zahter.webp"],
    short: "Kurutulmuş kekik karışımı. Kahvaltıda zeytinyağıyla, etlerde, pidelerde.",
    description: "Zahter, Hatay yöresine özgü yabani kekik türünün kurutulup harmanlanmasıyla hazırlanan aromatik bir karışımdır. Kahvaltı sofralarının yıldızıdır: zeytinyağıyla buluştuğunda ekmek banmalık eşsiz bir lezzete dönüşür. Et yemeklerinde ve hamur işlerinde de yoğun aromasıyla fark yaratır.",
    benefits: [
      "Kekik ailesinin doğal yağlarını (timol) içerir",
      "Bağışıklığı desteklediği geleneksel olarak bilinir",
      "Sindirimi rahatlatıcı etkisiyle bilinir",
      "Katkısız, doğal harman"
    ],
    recipes: [
      { title: "Zahterli Kahvaltı Sosu", text: "Bir kaseye sızma zeytinyağı koyup üzerine bolca zahter serpin. Sıcak ekmekle banarak Hatay kahvaltısının tadını çıkarın." },
      { title: "Zahterli Pide", text: "Pide hamurunun üzerine zeytinyağı-zahter karışımını sürüp fırınlayın; Antakya usulü 'zahter pidesi' hazır." }
    ],
    sizes: [
      { label: "100 gr", old: 124, price: 105 },
      { label: "250 gr", old: 310, price: 251 }
    ]
  },
  {
    id: "karabiber",
    name: "Karabiber (Çekilmiş)",
    badge: "Mutfağın Temeli",
    images: ["images/Karabiber.webp"],
    short: "Et, tavuk, çorba ve sosların derinliğini artıran güçlü baharat notu.",
    description: "Taze çekilmiş karabiberimiz, tane biberin aromasını kaybetmeden öğütülmesiyle hazırlanır. Keskin ve odunsu aromasıyla dünya mutfağının en temel baharatıdır; etten çorbaya, sostan salataya her yemeğin lezzetini tamamlar.",
    benefits: [
      "İçerdiği piperin ile besinlerin emilimini desteklediği bilinir",
      "Sindirim sistemini uyarıcı etkisiyle bilinir",
      "Antioksidan özellik taşır",
      "Taze çekim sayesinde aroması yoğundur"
    ],
    recipes: [
      { title: "Karabiberli Tavuk Sote", text: "Tavuğu tereyağında soteleyin, ocaktan almadan hemen önce bol taze çekilmiş karabiber ekleyin; aroması uçmadan sofraya gelsin." },
      { title: "Kremalı Karabiber Sos", text: "Krema, az tuz ve 1 tatlı kaşığı karabiberi kısık ateşte koyulaştırın. Bonfile ve makarnalarla mükemmel uyum sağlar." }
    ],
    sizes: [
      { label: "100 gr", old: 199, price: 169 },
      { label: "250 gr", old: 499, price: 415 }
    ]
  },
  {
    id: "corek-otu",
    name: "Çörek Otu",
    badge: "Sağlık",
    images: ["images/CorekOtu.webp"],
    short: "Tam tane, saf ve katkısız. Ekmeklerde, peynirde, çaylarda kullanım.",
    description: "Binlerce yıldır 'bereket tohumu' olarak bilinen çörek otu, tam tane ve eleme olarak sunulur. Hafif kekremsi, kendine has aromasıyla hamur işlerinden peynire, çaydan bala kadar pek çok alanda kullanılır.",
    benefits: [
      "Timokinon içeriğiyle bağışıklık sistemine destek olduğu bilinir",
      "Geleneksel olarak yüzyıllardır şifa amaçlı tüketilir",
      "Zengin sabit yağ ve mineral içeriğine sahiptir",
      "Tam tane olduğu için tazeliğini uzun süre korur"
    ],
    recipes: [
      { title: "Çörek Otlu Poğaça", text: "Hamura ve poğaçaların üzerine serpin; hem görüntü hem aroma kazandırır." },
      { title: "Bal & Çörek Otu Karışımı", text: "Bir kaşık balın içine yarım tatlı kaşığı çörek otu ekleyip sabahları aç karnına tüketmek geleneksel bir alışkanlıktır." }
    ],
    sizes: [
      { label: "100 gr", old: 79, price: 65 },
      { label: "250 gr", old: 139, price: 119 }
    ]
  },
  {
    id: "kimyon",
    name: "Çekilmiş Kimyon",
    badge: "Temel Baharat",
    images: ["images/KimyonNew.webp"],
    short: "Her mutfakta tükenen, düzenli alım. Aromatik ve güçlü aroma profili.",
    description: "Kimyon tohumlarının taze çekilmesiyle hazırlanır. Sıcak, topraksı ve hafif narenciye notaları taşıyan aroması; köftenin, kebabın ve baklagil yemeklerinin karakteristik lezzetini oluşturur.",
    benefits: [
      "Sindirimi kolaylaştırıcı etkisiyle geleneksel olarak bilinir",
      "Gaz ve şişkinliği azaltmaya yardımcı olduğu bilinir",
      "Demir bakımından zengindir",
      "Taze çekim ile yoğun aroma"
    ],
    recipes: [
      { title: "Ev Köftesi", text: "500 gr kıymaya 1 tatlı kaşığı kimyon, soğan ve maydanoz ekleyin. Kimyonsuz köfte olmaz!" },
      { title: "Mercimek Çorbası", text: "Çorbanın son aşamasında bir çay kaşığı kimyon ekleyin; servis ederken üzerine pul biberli tereyağı gezdirin." }
    ],
    sizes: [
      { label: "100 gr", old: 129, price: 109 },
      { label: "250 gr", old: 289, price: 245 }
    ]
  },
  {
    id: "kuru-nane",
    name: "Kuru Nane",
    badge: "Klasik",
    images: ["images/KuruNane.webp"],
    short: "Yemekte, çayda, ayranın içinde. Taze renk, güçlü aroma, zarif görüntü.",
    description: "Taze nane yapraklarının gölgede kurutulup ufalanmasıyla elde edilir. Canlı yeşil rengi ve ferahlatıcı aromasıyla çorbaların, salataların ve yoğurtlu mezelerin tamamlayıcısıdır.",
    benefits: [
      "Sindirim sistemini rahatlattığı geleneksel olarak bilinir",
      "Ferahlatıcı etkisiyle çay olarak da tüketilir",
      "Mentol içeriğiyle bilinir",
      "Gölgede kurutma sayesinde rengi ve aroması korunur"
    ],
    recipes: [
      { title: "Yayla Çorbası", text: "Yoğurtlu çorbanın üzerine eritilmiş tereyağında çevrilmiş kuru nane gezdirin; klasik lezzet tamamlansın." },
      { title: "Naneli Ayran", text: "Ayranınıza bir tutam kuru nane ekleyin; özellikle yaz günlerinde ferahlatıcıdır." }
    ],
    sizes: [
      { label: "100 gr", old: 79, price: 65 },
      { label: "250 gr", old: 139, price: 119 }
    ]
  },
  {
    id: "kisnis",
    name: "Kişniş",
    badge: "Klasik",
    images: ["images/Kisnis.webp", "images/Kisnis-2.webp"],
    short: "Limonumsu ve hafif baharatlı aromasıyla et yemeklerinde, çorbalarda ve turşularda.",
    description: "Kişniş tohumlarının öğütülmesiyle hazırlanır. Limonumsu, hafif tatlı aroması ile et yemeklerine, çorbalara ve turşulara incelikli bir tat katar. Dünya mutfaklarında köri karışımlarının da temel bileşenidir.",
    benefits: [
      "Sindirime yardımcı olduğu geleneksel olarak bilinir",
      "Hafif ve dengeli aromasıyla her yemeğe uyum sağlar",
      "Antioksidan içeriğiyle bilinir",
      "Katkısız saf öğütüm"
    ],
    recipes: [
      { title: "Kişnişli Et Yahnisi", text: "Yahniye pişirme suyunu eklerken 1 çay kaşığı kişniş katın; ete hafif narenciye dokunuşu verir." },
      { title: "Ev Turşusu", text: "Turşu suyuna bir tutam kişniş tohumu ekleyin; aroması turşuya derinlik katar." }
    ],
    sizes: [
      { label: "100 gr", old: 59, price: 49 },
      { label: "250 gr", old: 109, price: 89 }
    ]
  },
  {
    id: "rezene",
    name: "Rezene",
    badge: "Klasik",
    images: ["images/Rezene.webp"],
    short: "Tatlı anason aromasıyla balık yemeklerinde, bitki çaylarında ve sindirim için geleneksel kullanım.",
    description: "Rezene tohumu, anasonu andıran tatlı ve ferah aromasıyla hem mutfakta hem çay olarak kullanılır. Balık yemeklerinde, ekmeklerde ve bitki çayı harmanlarında kendine özgü bir tat sunar.",
    benefits: [
      "Sindirimi rahatlatan etkisiyle geleneksel olarak bilinir",
      "Şişkinlik ve hazımsızlığa iyi geldiği bilinir",
      "Anne sütünü desteklediğine geleneksel olarak inanılır",
      "Çay olarak günün her saati içilebilir"
    ],
    recipes: [
      { title: "Rezene Çayı", text: "1 tatlı kaşığı rezene tohumunu sıcak suda 7-8 dakika demleyin. Yemek sonrası rahatlatıcıdır." },
      { title: "Fırında Balık", text: "Balığın üzerine zeytinyağı, limon ve bir tutam rezene serpip fırınlayın; Ege usulü hafif bir aroma verir." }
    ],
    sizes: [
      { label: "100 gr", old: 79, price: 65 },
      { label: "250 gr", old: 139, price: 119 }
    ]
  },
  {
    id: "biberiye",
    name: "Biberiye",
    badge: "Klasik",
    images: ["images/Biberiye.webp"],
    short: "Güçlü aromatik yapısıyla fırın etlerinde, tavukta, patates ve zeytinyağlı yemeklerde.",
    description: "Kurutulmuş biberiye yaprakları, çam ve narenciyeyi andıran güçlü aromasıyla özellikle fırın yemeklerinin vazgeçilmezidir. Kırmızı ete, tavuğa ve patatese eşsiz bir koku katar.",
    benefits: [
      "Antioksidan bakımından zengin olduğu bilinir",
      "Hafızayı desteklediğine geleneksel olarak inanılır",
      "Doğal aromasıyla yapay çeşni ihtiyacını ortadan kaldırır",
      "Uzun pişirmelerde aromasını korur"
    ],
    recipes: [
      { title: "Biberiyeli Fırın Patates", text: "Elma dilimi patatesleri zeytinyağı, tuz ve biberiyeyle harmanlayıp fırınlayın; restoran lezzeti evinizde." },
      { title: "Biberiyeli Tavuk", text: "Bütün tavuğu biberiye, sarımsak ve limonla marine edip fırınlayın; kokusu tüm eve yayılır." }
    ],
    sizes: [
      { label: "100 gr", old: 69, price: 59 },
      { label: "250 gr", old: 119, price: 105 }
    ]
  },
  {
    id: "karanfil",
    name: "Karanfil",
    badge: "Klasik",
    images: ["images/Karanfil.webp"],
    short: "Yoğun ve sıcak aromasıyla et sularında, pilavlarda, tatlılarda ve kış çaylarında derinlik katar.",
    description: "Karanfil tomurcuklarının kurutulmuş halidir. Yoğun, tatlımsı ve sıcak aromasıyla hem tuzlu hem tatlı mutfağın özel dokunuşudur; et sularından komposto ve kış çaylarına kadar geniş kullanım alanı vardır.",
    benefits: [
      "Öjenol içeriğiyle doğal antiseptik olarak bilinir",
      "Diş ve diş eti sağlığına geleneksel olarak iyi geldiği bilinir",
      "Güçlü antioksidan kaynağıdır",
      "Nefes tazeleyici olarak da kullanılır"
    ],
    recipes: [
      { title: "Kış Çayı", text: "Tarçın, elma kabuğu ve 3-4 karanfil tanesini birlikte kaynatın; kış akşamlarının içinizi ısıtan çayı hazır." },
      { title: "Karanfilli Pilav", text: "Pirinci kavururken 2-3 tane karanfil ekleyin, servis etmeden önce çıkarın; pilava zarif bir koku bırakır." }
    ],
    sizes: [
      { label: "100 gr", old: 119, price: 95 },
      { label: "250 gr", old: 239, price: 199 }
    ]
  },
  {
    id: "sarimsak-tozu",
    name: "Sarımsak Tozu",
    badge: "Klasik",
    images: ["images/Sarımsak.webp"],
    short: "Pratik kullanımıyla marinelerde, soslarda, köftelerde doğal sarımsak lezzeti.",
    description: "Kurutulmuş sarımsağın öğütülmesiyle elde edilir. Taze sarımsağın pratik alternatifi olarak soslarda, marinasyonlarda ve köfte harçlarında eşit dağılım ve yoğun lezzet sağlar. Katkısız, %100 sarımsaktır.",
    benefits: [
      "Bağışıklık sistemine destek olduğu geleneksel olarak bilinir",
      "Allisin bileşiğiyle tanınır",
      "Pratik kullanım: soyma, doğrama derdi yok",
      "Soslarda topaklanmadan eşit dağılır"
    ],
    recipes: [
      { title: "Sarımsaklı Yoğurt Sosu", text: "Yoğurda yarım çay kaşığı sarımsak tozu ve tuz ekleyip çırpın; kızartmaların ve mantının yanına birebir." },
      { title: "Kanat Marinasyonu", text: "Zeytinyağı, sarımsak tozu, pul biber ve kekikle kanatları harmanlayıp 1 saat bekletin; mangalın yıldızı olur." }
    ],
    sizes: [
      { label: "100 gr", old: 79, price: 65 },
      { label: "250 gr", old: 289, price: 245 }
    ]
  },
  {
    id: "zeytinyagi",
    name: "Naturel Sızma Zeytinyağı",
    badge: "Öne Çıkan",
    images: ["images/zeytinyagi-on.webp", "images/zeytinyagi-arka.webp"],
    short: "Antakya'nın ilaçsız yetiştirilen Gemlik tipi zeytinlerinden geleneksel sıkım.",
    description: "Antakya'nın bereketli topraklarında, ilaçsız yetiştirilen Gemlik tipi zeytinlerden geleneksel yöntemlerle sıkıldı. Toprağın gerçek lezzetini ve Hatay'ın gastronomi mirasını sofranıza taşır. 5 litrelik teneke ambalajda, ışık görmeden size ulaşır.",
    benefits: [
      "Naturel sızma: ilk sıkım, düşük asit",
      "İlaçsız tarımla yetiştirilen zeytinlerden",
      "Zeytinyağının doğal polifenollerini içerir",
      "Teneke ambalaj ışık ve havadan korur"
    ],
    recipes: [
      { title: "Zahterli Kahvaltı Banması", text: "Bir kaseye zeytinyağı koyup üzerine Hatay zahteri serpin; sıcak ekmekle banarak tüketin." },
      { title: "Zeytinyağlı Mevsim Salatası", text: "Mevsim yeşilliklerine sadece sızma zeytinyağı, limon ve tuz yeter; yağın aroması salatanın önüne geçmez, tamamlar." }
    ],
    sizes: [
      { label: "5 L Teneke", old: null, price: 2500 }
    ],
    featured: true
  }
];

/* Yardımcılar */
/** @param {string} id @returns {Product | undefined} */
function getProduct(id) { return PRODUCTS.find(p => p.id === id); }
/** @param {number} n @returns {string} */
function formatTL(n) { return n.toLocaleString('tr-TR') + ' ₺'; }
/** @param {number} oldP @param {number} newP @returns {number} */
function discountPct(oldP, newP) { return Math.round((1 - newP / oldP) * 100); }
