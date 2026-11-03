let adminData = {
  store: {},
  snacks: [],
  packages: []
};

// Rupiah Formatter
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Show Toast
function showToast(message) {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Switch Admin Tabs
function showAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));

  const targetPane = document.getElementById(tabId);
  if (targetPane) targetPane.style.display = 'block';

  // Find active button
  const buttons = document.querySelectorAll('.admin-tab');
  if (tabId === 'tab-store') buttons[0].classList.add('active');
  if (tabId === 'tab-snacks') buttons[1].classList.add('active');
  if (tabId === 'tab-packages') buttons[2].classList.add('active');
}

// Load Data on Startup
async function loadAdminData() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Gagal memuat data admin');
    adminData = await res.json();
    populateStoreTab();
    populateSnacksTable();
    populatePackagesTable();
  } catch (err) {
    console.error(err);
    showToast('Gagal memuat data dari server.');
  }
}

// ==========================================
// STORE SETTINGS & LOGO
// ==========================================
function populateStoreTab() {
  const s = adminData.store || {};
  document.getElementById('input-store-name').value = s.name || '';
  document.getElementById('input-store-tagline').value = s.tagline || '';
  document.getElementById('input-store-wa').value = s.whatsapp_number || '';
  document.getElementById('input-store-logo-url').value = s.logo_url || '';
  
  const manualInput = document.getElementById('input-store-logo-url-manual');
  if (manualInput) manualInput.value = s.logo_url || '';

  if (s.logo_url) {
    document.getElementById('admin-logo-preview').src = s.logo_url;
  }
}

function toggleLogoUrlInput() {
  const wrap = document.getElementById('logo-url-wrapper');
  if (wrap) wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
}

function toggleSnackUrlInput() {
  const wrap = document.getElementById('snack-url-wrapper');
  if (wrap) wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
}

// Handle Logo File Upload
async function handleLogoUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  const statusEl = document.getElementById('logo-upload-status');
  statusEl.textContent = 'Mengunggah logo...';

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById('admin-logo-preview').src = result.url;
      document.getElementById('input-store-logo-url').value = result.url;
      
      const manualInput = document.getElementById('input-store-logo-url-manual');
      if (manualInput) manualInput.value = result.url;

      // Otomatis simpan logo ke database tanpa perlu repot
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: result.url })
      });
      if (adminData.store) adminData.store.logo_url = result.url;

      statusEl.textContent = '✓ Logo berhasil diunggah & tersimpan!';
      showToast('Logo berhasil diunggah dan disimpan!');
    } else {
      statusEl.textContent = result.error || 'Gagal mengunggah';
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Terjadi kesalahan unggah.';
  }
}

// Save Store Settings
async function saveStoreSettings(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('input-store-name').value.trim(),
    tagline: document.getElementById('input-store-tagline').value.trim(),
    whatsapp_number: document.getElementById('input-store-wa').value.trim(),
    logo_url: document.getElementById('input-store-logo-url').value.trim()
  };

  const newPwdInput = document.getElementById('input-admin-pwd');
  if (newPwdInput && newPwdInput.value.trim()) {
    payload.admin_password = newPwdInput.value.trim();
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 401) {
      alert('Sesi admin berakhir. Silakan login kembali.');
      window.location.href = '/admin/login';
      return;
    }
    const result = await res.json();
    if (result.success) {
      adminData.store = result.store;
      populateStoreTab();
      if (newPwdInput) newPwdInput.value = '';
      showToast('Pengaturan nama, logo & password berhasil disimpan!');
    } else {
      showToast('Gagal menyimpan: ' + (result.error || 'Error'));
    }
  } catch (err) {
    console.error(err);
    showToast('Terjadi kesalahan jaringan.');
  }
}

// ==========================================
// SNACKS MANAGEMENT (GAMBAR & HARGA)
// ==========================================
function populateSnacksTable() {
  const tbody = document.getElementById('admin-snacks-table');
  const snacks = adminData.snacks || [];

  if (snacks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">
          Belum ada snack yang terdaftar. Klik "Tambah Snack Baru" untuk menambahkan.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = snacks.map(s => `
    <tr>
      <td>
        <img src="${s.image_url || '/static/images/default-logo.svg'}" alt="${s.name}" class="table-thumb" onerror="this.src='/static/images/default-logo.svg'">
      </td>
      <td>
        <strong>${s.name}</strong>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">${s.description || '-'}</p>
      </td>
      <td style="font-weight: 600; color: var(--color-cocoa);">
        ${formatRupiah(s.price)}
      </td>
      <td>
        ${s.badge ? `<span class="card-badge" style="position: static;">${s.badge}</span>` : '-'}
      </td>
      <td style="text-align: right;">
        <button class="btn btn-outline btn-sm" onclick="openSnackModal(${s.id})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSnack(${s.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// Generic Image Uploader
async function handleImageUpload(input, targetUrlInputId, previewImgId) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);
  const statusEl = document.getElementById('snack-upload-status');
  if (statusEl) statusEl.textContent = 'Mengunggah...';

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    if (result.success) {
      document.getElementById(targetUrlInputId).value = result.url;
      document.getElementById(previewImgId).src = result.url;
      const manualInput = document.getElementById('snack-image-url-manual');
      if (manualInput) manualInput.value = result.url;
      if (statusEl) statusEl.textContent = '✓ Foto terunggah!';
      showToast('Foto makanan berhasil diunggah!');
    } else {
      if (statusEl) statusEl.textContent = result.error || 'Gagal';
      alert(result.error || 'Gagal mengunggah foto');
    }
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = 'Error unggah';
    alert('Terjadi kesalahan unggah foto');
  }
}

// Open Snack Modal
function openSnackModal(snackId = null) {
  const modal = document.getElementById('snack-modal');
  const title = document.getElementById('snack-modal-title');
  const idInput = document.getElementById('snack-id');
  const nameInput = document.getElementById('snack-name');
  const priceInput = document.getElementById('snack-price');
  const urlInput = document.getElementById('snack-image-url');
  const manualUrlInput = document.getElementById('snack-image-url-manual');
  const descInput = document.getElementById('snack-desc');
  const badgeInput = document.getElementById('snack-badge');
  const previewImg = document.getElementById('snack-img-preview');
  const statusEl = document.getElementById('snack-upload-status');

  if (statusEl) statusEl.textContent = '';

  if (snackId) {
    title.textContent = 'Edit Snack & Harga';
    const snack = adminData.snacks.find(s => s.id === snackId);
    if (!snack) return;

    idInput.value = snack.id;
    nameInput.value = snack.name;
    priceInput.value = snack.price;
    urlInput.value = snack.image_url || '';
    if (manualUrlInput) manualUrlInput.value = snack.image_url || '';
    descInput.value = snack.description || '';
    badgeInput.value = snack.badge || '';
    previewImg.src = snack.image_url || '/static/images/default-logo.svg';
  } else {
    title.textContent = 'Tambah Snack Baru';
    idInput.value = '';
    nameInput.value = '';
    priceInput.value = '';
    urlInput.value = '';
    if (manualUrlInput) manualUrlInput.value = '';
    descInput.value = '';
    badgeInput.value = '';
    previewImg.src = '/static/images/default-logo.svg';
  }

  modal.classList.add('open');
}

function closeSnackModal() {
  document.getElementById('snack-modal').classList.remove('open');
}

// Submit Snack Form
async function submitSnackForm(e) {
  e.preventDefault();
  const id = document.getElementById('snack-id').value;
  const payload = {
    name: document.getElementById('snack-name').value.trim(),
    price: parseInt(document.getElementById('snack-price').value, 10) || 0,
    image_url: document.getElementById('snack-image-url').value.trim(),
    description: document.getElementById('snack-desc').value.trim(),
    badge: document.getElementById('snack-badge').value.trim()
  };

  const isEdit = Boolean(id);
  const endpoint = isEdit ? `/api/snacks/${id}` : '/api/snacks';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closeSnackModal();
      showToast(isEdit ? 'Snack berhasil diperbarui!' : 'Snack baru berhasil ditambahkan!');
      await loadAdminData();
    } else {
      alert(result.error || 'Gagal menyimpan snack');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan');
  }
}

// Delete Snack
async function deleteSnack(id) {
  const snack = adminData.snacks.find(s => s.id === id);
  if (!confirm(`Hapus snack "${snack?.name || 'ini'}"?`)) return;

  try {
    const res = await fetch(`/api/snacks/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Snack berhasil dihapus.');
      await loadAdminData();
    } else {
      alert(result.error || 'Gagal menghapus snack');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan');
  }
}

// ==========================================
// PACKAGES MANAGEMENT
// ==========================================
function populatePackagesTable() {
  const tbody = document.getElementById('admin-packages-table');
  const packages = adminData.packages || [];

  if (packages.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">
          Belum ada paket snack. Klik "Tambah Paket Baru" untuk membuat paket kombo.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = packages.map(p => `
    <tr>
      <td>
        <strong>${p.name}</strong>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">${p.description || '-'}</p>
      </td>
      <td style="font-weight: 600; color: var(--color-cocoa);">
        ${formatRupiah(p.price)}
      </td>
      <td>
        <ul style="padding-left: 16px; font-size: 0.82rem; color: var(--text-secondary);">
          ${(p.items || []).map(i => `<li>${i}</li>`).join('')}
        </ul>
      </td>
      <td>
        ${p.badge ? `<span class="card-badge" style="position: static;">${p.badge}</span>` : '-'}
      </td>
      <td style="text-align: right;">
        <button class="btn btn-outline btn-sm" onclick="openPackageModal(${p.id})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePackage(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openPackageModal(packageId = null) {
  const modal = document.getElementById('package-modal');
  const title = document.getElementById('package-modal-title');
  const idInput = document.getElementById('package-id');
  const nameInput = document.getElementById('package-name');
  const priceInput = document.getElementById('package-price');
  const descInput = document.getElementById('package-desc');
  const itemsInput = document.getElementById('package-items');
  const badgeInput = document.getElementById('package-badge');

  if (packageId) {
    title.textContent = 'Edit Paket Snack';
    const pkg = adminData.packages.find(p => p.id === packageId);
    if (!pkg) return;

    idInput.value = pkg.id;
    nameInput.value = pkg.name;
    priceInput.value = pkg.price;
    descInput.value = pkg.description || '';
    itemsInput.value = (pkg.items || []).join('\n');
    badgeInput.value = pkg.badge || '';
  } else {
    title.textContent = 'Tambah Paket Baru';
    idInput.value = '';
    nameInput.value = '';
    priceInput.value = '';
    descInput.value = '';
    itemsInput.value = '';
    badgeInput.value = '';
  }

  modal.classList.add('open');
}

function closePackageModal() {
  document.getElementById('package-modal').classList.remove('open');
}

async function submitPackageForm(e) {
  e.preventDefault();
  const id = document.getElementById('package-id').value;
  const payload = {
    name: document.getElementById('package-name').value.trim(),
    price: parseInt(document.getElementById('package-price').value, 10) || 0,
    description: document.getElementById('package-desc').value.trim(),
    items: document.getElementById('package-items').value.trim().split('\n').filter(i => i.trim()),
    badge: document.getElementById('package-badge').value.trim()
  };

  const isEdit = Boolean(id);
  const endpoint = isEdit ? `/api/packages/${id}` : '/api/packages';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closePackageModal();
      showToast(isEdit ? 'Paket berhasil diperbarui!' : 'Paket baru berhasil ditambahkan!');
      await loadAdminData();
    } else {
      alert(result.error || 'Gagal menyimpan paket');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan');
  }
}

async function deletePackage(id) {
  const pkg = adminData.packages.find(p => p.id === id);
  if (!confirm(`Hapus paket "${pkg?.name || 'ini'}"?`)) return;

  try {
    const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Paket berhasil dihapus.');
      await loadAdminData();
    } else {
      alert(result.error || 'Gagal menghapus paket');
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan');
  }
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadAdminData);

