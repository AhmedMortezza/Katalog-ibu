// Format number into Indonesian Rupiah (e.g., Rp 15.000)
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Global state
let storeData = null;
let orderCart = [];

// Fetch and render catalog data
async function loadCatalog() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Gagal mengambil data katalog');
    storeData = await res.json();
    renderStoreInfo(storeData.store);
    renderSnacks(storeData.snacks);
    renderPackages(storeData.packages);
    populateQuickAddDropdown();
    renderOrderSection();
  } catch (err) {
    console.error(err);
    document.getElementById('snacks-container').innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        Gagal memuat katalog. Pastikan server aktif.
      </div>
    `;
  }
}

// Render Store Information & Logo
function renderStoreInfo(store) {
  if (!store) return;
  document.getElementById('store-name').textContent = store.name || 'Dapur Snack Ibu';
  document.getElementById('store-tagline').textContent = store.tagline || 'Snack Renyah & Lezat Buatan Rumah';
  document.getElementById('footer-store-name').innerHTML = `<strong>${store.name || 'Dapur Snack Ibu'}</strong>`;
  document.title = `${store.name || 'Dapur Snack Ibu'} - Katalog`;

  const logoImg = document.getElementById('store-logo');
  if (store.logo_url) {
    logoImg.src = store.logo_url;
  }
}

// Render Snacks List
function renderSnacks(snacks) {
  const container = document.getElementById('snacks-container');
  const countEl = document.getElementById('snacks-count');
  
  if (!snacks || snacks.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #fff; border-radius: 12px; border: 1px dashed var(--border-beige);">
        <p style="font-weight: 600; color: var(--text-primary);">Belum ada snack yang terdaftar.</p>
        <p style="font-size: 0.9rem; margin-top: 6px;">Buka panel <a href="/admin">Kelola Toko</a> untuk menambahkan menu snack pertama Anda.</p>
      </div>
    `;
    countEl.textContent = '0 menu';
    return;
  }

  countEl.textContent = `${snacks.length} menu tersedia`;

  container.innerHTML = snacks.map(snack => {
    const badgeHtml = snack.badge ? `<span class="card-badge">${snack.badge}</span>` : '';
    const imgUrl = snack.image_url || '/static/images/default-logo.svg';

    return `
      <article class="snack-card">
        <div class="snack-img-box">
          <img src="${imgUrl}" alt="${snack.name}" class="snack-img" loading="lazy" onerror="this.src='/static/images/default-logo.svg'">
          ${badgeHtml}
        </div>
        <div class="snack-content">
          <h4 class="snack-title">${snack.name}</h4>
          <p class="snack-desc">${snack.description || 'Snack berkualitas buatan rumah.'}</p>
          <div class="snack-footer">
            <span class="snack-price">${formatRupiah(snack.price)}</span>
            <button type="button" class="btn btn-wa btn-sm" onclick="handleCardOrder('snack', ${snack.id})">
              🛒 + Pesan
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Render Packages List
function renderPackages(packages) {
  const container = document.getElementById('packages-container');
  const countEl = document.getElementById('packages-count');

  if (!packages || packages.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #fff; border-radius: 12px; border: 1px dashed var(--border-beige);">
        <p style="font-weight: 600; color: var(--text-primary);">Belum ada paket snack yang terdaftar.</p>
        <p style="font-size: 0.9rem; margin-top: 6px;">Buka panel <a href="/admin">Kelola Toko</a> untuk menambahkan paket pertama.</p>
      </div>
    `;
    countEl.textContent = '0 paket';
    return;
  }

  countEl.textContent = `${packages.length} paket pilihan`;

  container.innerHTML = packages.map(pkg => {
    const badgeHtml = pkg.badge ? `<span class="card-badge" style="position: static; display: inline-block;">${pkg.badge}</span>` : '';
    const itemsHtml = (pkg.items || []).map(item => `<li>${item}</li>`).join('');

    return `
      <article class="package-card">
        <div class="package-header">
          <div>
            <h4 class="package-title">${pkg.name}</h4>
          </div>
          ${badgeHtml}
        </div>
        <div class="package-body">
          <p class="package-desc">${pkg.description || 'Pilihan paket kombo hemat isi lengkap.'}</p>
          <div class="package-items-title">Isi Dalam Paket:</div>
          <ul class="package-items-list">
            ${itemsHtml}
          </ul>
        </div>
        <div class="package-footer">
          <div class="package-price-wrap">
            <span class="package-price-label">Harga Paket:</span>
            <span class="package-price">${formatRupiah(pkg.price)}</span>
          </div>
          <button type="button" class="btn btn-wa" onclick="handleCardOrder('package', ${pkg.id})">
            🛒 + Pesan Paket
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Tambahkan Kartu Highlight Menu Custom / By Request
  const customCardHtml = `
    <article class="package-card" style="border: 2px dashed var(--border-beige); background-color: var(--bg-beige-subtle); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div class="package-header">
          <div>
            <h4 class="package-title" style="color: var(--color-cocoa);">✨ Paket Custom / By Request</h4>
          </div>
          <span class="card-badge" style="position: static; display: inline-block; background-color: var(--color-cocoa);">By Request</span>
        </div>
        <div class="package-body">
          <p class="package-desc">Ingin kombinasi snack tertentu atau paket nasi box sesuai budget acara Anda? Kami buatkan khusus sesuai permintaan.</p>
          <div class="package-items-title">Kelebihan Menu Custom:</div>
          <ul class="package-items-list">
            <li>Bebas pilih kue / snack dan lauk</li>
            <li>Bisa disesuaikan budget acara per box</li>
            <li>Konsultasi gratis langsung ke WhatsApp</li>
          </ul>
        </div>
      </div>
      <div class="package-footer" style="margin-top: 18px;">
        <div class="package-price-wrap">
          <span class="package-price-label">Budget:</span>
          <span class="package-price" style="font-size: 1.05rem;">Sesuai Budget</span>
        </div>
        <button type="button" class="btn btn-primary" onclick="switchSection('custom'); document.getElementById('section-custom').scrollIntoView({behavior: 'smooth'});">
          ✨ Request Menu
        </button>
      </div>
    </article>
  `;

  container.innerHTML += customCardHtml;
}

// Tab Switcher
function switchSection(section) {
  const snackSec = document.getElementById('section-snacks');
  const pkgSec = document.getElementById('section-packages');
  const customSec = document.getElementById('section-custom');
  const orderSec = document.getElementById('section-order');
  const pills = document.querySelectorAll('.nav-pill');

  if (snackSec) snackSec.style.display = 'none';
  if (pkgSec) pkgSec.style.display = 'none';
  if (customSec) customSec.style.display = 'none';
  if (orderSec) orderSec.style.display = 'none';
  pills.forEach(p => p.classList.remove('active'));

  if (section === 'snacks') {
    if (snackSec) snackSec.style.display = 'block';
    if (pills[0]) pills[0].classList.add('active');
  } else if (section === 'packages') {
    if (pkgSec) pkgSec.style.display = 'block';
    if (pills[1]) pills[1].classList.add('active');
  } else if (section === 'custom') {
    if (customSec) customSec.style.display = 'block';
    if (pills[2]) pills[2].classList.add('active');
  } else if (section === 'order') {
    if (orderSec) orderSec.style.display = 'block';
    if (pills[3]) pills[3].classList.add('active');
  }
}

// ==========================================
// ORDER CART & WHATSAPP LOGIC
// ==========================================

// Quick action from Card "+ Pesan"
function handleCardOrder(type, id) {
  addToCart(type, id);
  // Switch to order tab so customer immediately sees their order
  switchSection('order');
  const orderSection = document.getElementById('section-order');
  orderSection.scrollIntoView({ behavior: 'smooth' });
}

// Add item to cart
function addToCart(type, id) {
  let targetItem = null;
  if (type === 'snack') {
    targetItem = (storeData?.snacks || []).find(s => s.id === id);
  } else {
    targetItem = (storeData?.packages || []).find(p => p.id === id);
  }
  if (!targetItem) return;

  const key = `${type}-${id}`;
  const existing = orderCart.find(item => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    orderCart.push({
      key: key,
      type: type,
      id: id,
      name: type === 'package' ? `[Paket] ${targetItem.name}` : targetItem.name,
      price: targetItem.price,
      qty: 1
    });
  }

  renderOrderSection();
}

// Update quantity (+ or -)
function updateCartQty(index, delta) {
  if (!orderCart[index]) return;
  orderCart[index].qty += delta;
  if (orderCart[index].qty <= 0) {
    orderCart.splice(index, 1);
  }
  renderOrderSection();
}

// Remove from cart
function removeFromCart(index) {
  if (!orderCart[index]) return;
  orderCart.splice(index, 1);
  renderOrderSection();
}

// Populate Quick Add dropdown
function populateQuickAddDropdown() {
  const select = document.getElementById('quick-add-select');
  if (!select) return;

  let optionsHtml = '<option value="">+ Tambah Snack ke Pesanan</option>';

  if (storeData?.snacks?.length) {
    optionsHtml += '<optgroup label="── Snack Satuan ──">';
    storeData.snacks.forEach(s => {
      optionsHtml += `<option value="snack-${s.id}">${s.name} (${formatRupiah(s.price)})</option>`;
    });
    optionsHtml += '</optgroup>';
  }

  if (storeData?.packages?.length) {
    optionsHtml += '<optgroup label="── Paket Snack ──">';
    storeData.packages.forEach(p => {
      optionsHtml += `<option value="package-${p.id}">[Paket] ${p.name} (${formatRupiah(p.price)})</option>`;
    });
    optionsHtml += '</optgroup>';
  }

  optionsHtml += '<optgroup label="── Menu Custom ──">';
  optionsHtml += '<option value="custom-request">✨ Request Menu Custom Sendiri</option>';
  optionsHtml += '</optgroup>';

  select.innerHTML = optionsHtml;
}

// Handle Quick Add selection
function handleQuickAddSelect(selectEl) {
  const val = selectEl.value;
  if (!val) return;
  if (val === 'custom-request') {
    switchSection('custom');
    const customSection = document.getElementById('section-custom');
    if (customSection) customSection.scrollIntoView({ behavior: 'smooth' });
    selectEl.value = '';
    return;
  }
  const [type, idStr] = val.split('-');
  addToCart(type, parseInt(idStr, 10));
  selectEl.value = '';
}

// Render Order Section & Floating Cart Bar
function renderOrderSection() {
  const container = document.getElementById('order-selected-items');
  const totalPriceEl = document.getElementById('order-total-price');
  const floatingBar = document.getElementById('floating-cart');
  const floatingText = document.getElementById('floating-cart-text');

  if (!container || !totalPriceEl) return;

  if (orderCart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 10px; color: var(--text-secondary);">
        <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">Belum ada snack yang dipilih.</p>
        <p style="font-size: 0.88rem;">Pilih snack melalui dropdown di atas, atau klik tombol <strong>"+ Pesan"</strong> pada kartu katalog.</p>
      </div>
    `;
    totalPriceEl.textContent = 'Rp 0';
    if (floatingBar) {
      floatingBar.style.display = 'none';
      document.body.classList.remove('has-cart-bar');
    }
    return;
  }

  let totalAmount = 0;
  let totalQty = 0;

  container.innerHTML = orderCart.map((item, idx) => {
    const subtotal = item.price * item.qty;
    totalAmount += subtotal;
    totalQty += item.qty;

    return `
      <div class="order-item-row">
        <div class="order-item-info">
          <div>
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-unit-price">${formatRupiah(item.price)} / porsi</div>
          </div>
        </div>
        <div class="order-item-controls">
          <button type="button" class="qty-btn" onclick="updateCartQty(${idx}, -1)" title="Kurangi 1">−</button>
          <span class="qty-number">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="updateCartQty(${idx}, 1)" title="Tambah 1">+</button>
          <span class="order-item-subtotal">${formatRupiah(subtotal)}</span>
          <button type="button" class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="removeFromCart(${idx})" title="Hapus menu ini">✕</button>
        </div>
      </div>
    `;
  }).join('');

  totalPriceEl.textContent = formatRupiah(totalAmount);

  // Update Floating Cart Bar
  if (floatingBar && floatingText) {
    floatingBar.style.display = 'flex';
    floatingText.textContent = `🛒 ${totalQty} pesanan (${formatRupiah(totalAmount)})`;
    document.body.classList.add('has-cart-bar');
  }
}

// Toggle Address Field based on Delivery Choice
function toggleAddressField(deliveryType) {
  const addressGroup = document.getElementById('address-group');
  const addressInput = document.getElementById('order-address');
  if (deliveryType === 'Ambil di Rumah' || deliveryType === 'Ambil Sendiri') {
    addressGroup.style.display = 'none';
    addressInput.removeAttribute('required');
  } else {
    addressGroup.style.display = 'block';
    addressInput.setAttribute('required', 'required');
  }
}

// Helper to sanitize Indonesian WhatsApp numbers to 628xxx (no +, no leading 0)
function cleanWaNumber(raw) {
  if (!raw) return '6281234567890';
  let num = String(raw).replace(/\D/g, ''); // hanya ambil angka
  if (num.startsWith('620')) {
    num = '62' + num.slice(3);
  } else if (num.startsWith('0')) {
    num = '62' + num.slice(1);
  } else if (num.startsWith('8')) {
    num = '62' + num;
  }
  return num;
}

// Send WhatsApp Order
function sendWhatsAppOrder(e) {
  e.preventDefault();

  if (orderCart.length === 0) {
    alert('Keranjang pesanan masih kosong. Silakan pilih minimal satu snack terlebih dahulu!');
    return;
  }

  const storeName = storeData?.store?.name || 'Dapur Snack Ibu';
  const waNumber = cleanWaNumber(storeData?.store?.whatsapp_number);

  const customerName = document.getElementById('order-name').value.trim();
  const deliveryType = document.getElementById('order-delivery-type').value;
  const address = document.getElementById('order-address').value.trim();
  const dateReq = document.getElementById('order-date').value.trim();
  const notes = document.getElementById('order-notes').value.trim();

  // Calculate items summary
  let itemsSummary = '';
  let grandTotal = 0;

  orderCart.forEach(item => {
    const subtotal = item.price * item.qty;
    grandTotal += subtotal;
    itemsSummary += `• ${item.qty}x ${item.name} (${formatRupiah(subtotal)})\n`;
  });

  // Compose Structured WhatsApp Message
  let waMessage = `Halo ${storeName}, saya ingin memesan snack:\n\n`;
  waMessage += `📋 *RINCIAN PESANAN:*\n${itemsSummary}\n`;
  waMessage += `💰 *Total Estimasi:* ${formatRupiah(grandTotal)}\n\n`;
  waMessage += `👤 *DATA PEMESAN:*\n`;
  waMessage += `• Nama: ${customerName}\n`;
  waMessage += `• Metode: ${deliveryType}\n`;

  if (deliveryType === 'Antar ke Alamat') {
    waMessage += `• Alamat Pengiriman: ${address}\n`;
  }
  if (dateReq) {
    waMessage += `• Waktu Diinginkan: ${dateReq}\n`;
  }
  if (notes) {
    waMessage += `• Catatan: ${notes}\n`;
  }

  waMessage += `\nMohon konfirmasi ketersediaan dan cara pembayarannya ya. Terima kasih! 🙏`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  window.open(waUrl, '_blank');
}

// Send Custom By Request Order to WhatsApp
function sendCustomWaRequest(e) {
  e.preventDefault();
  const storeName = storeData?.store?.name || 'Dapur Snack Ibu';
  const waNumber = cleanWaNumber(storeData?.store?.whatsapp_number);

  const type = document.getElementById('custom-type').value;
  const qty = document.getElementById('custom-qty').value.trim();
  const budget = document.getElementById('custom-budget').value.trim();
  const date = document.getElementById('custom-date').value.trim();
  const notes = document.getElementById('custom-notes').value.trim();

  let waMessage = `Halo ${storeName}, saya ingin konsultasi Menu Custom / By Request:\n\n`;
  waMessage += `📋 *DETAIL REQUEST MENU CUSTOM:*\n`;
  waMessage += `• Jenis: ${type}\n`;
  waMessage += `• Jumlah: ${qty}\n`;
  if (budget) {
    waMessage += `• Target Budget: ${budget}\n`;
  }
  if (date) {
    waMessage += `• Waktu Acara: ${date}\n`;
  }
  waMessage += `• Request Menu:\n${notes}\n\n`;
  waMessage += `Mohon info rekomendasi dan ketersediaannya ya. Terima kasih! 🙏`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  window.open(waUrl, '_blank');
}

// ==========================================
// FLOATING CS / CHAT ADMIN WIDGET
// ==========================================

// Toggle CS Popup visibility
function toggleCsPopup(forceState) {
  const popup = document.getElementById('cs-popup');
  if (!popup) return;
  const isOpening = forceState !== undefined ? forceState : (popup.style.display === 'none' || !popup.style.display);
  popup.style.display = isOpening ? 'block' : 'none';
}

// Open WhatsApp with pre-composed query
function openWaChat(customText) {
  const storeName = storeData?.store?.name || 'Dapur Snack Ibu';
  const waNumber = cleanWaNumber(storeData?.store?.whatsapp_number);
  const greeting = customText ? customText : `Halo ${storeName}, saya mau tanya-tanya seputar pemesanan snack dan rice box...`;
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(greeting)}`;
  window.open(url, '_blank');
  toggleCsPopup(false);
}

// Close CS popup when clicking outside the widget
document.addEventListener('click', (e) => {
  const widget = document.getElementById('cs-widget');
  const popup = document.getElementById('cs-popup');
  if (popup && popup.style.display === 'block' && widget && !widget.contains(e.target)) {
    toggleCsPopup(false);
  }
});

// Initial load
document.addEventListener('DOMContentLoaded', loadCatalog);
