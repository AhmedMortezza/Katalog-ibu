# DESIGN.md - Panduan Desain Katalog Snack Ibu

## 1. Identitas & Visi Desain
- **Karakter Usaha**: Katalog kuliner camilan rumahan (home-made snack) yang hangat, bersih, menggugah selera, dan dapat dipercaya.
- **Tujuan Antarmuka**: Memberikan pengalaman belanja yang nyaman dan to-the-point bagi pelanggan untuk melihat nama toko, logo, menu camilan, paket snack, dan harga dengan jelas, serta memudahkan pemilik untuk memperbarui data lewat panel backend.

---

## 2. The Three Dials
- **ENERGY: 2 (Balanced)** - Hangat dan mengundang, fokus kuat pada estetika foto makanan tanpa elemen heboh yang mengalihkan perhatian.
- **RHYTHM: 2 (Consistent with clear grouping)** - Tata letak konsisten antara katalog snack satuan dan paket kombo, dengan kontras visual pembeda paket.
- **MOTION: 1 (Calm)** - Transisi halus saat kursor menyentuh kartu foto (*subtle hover scale*), tanpa animasi pantul (*bounce/float*) berlebihan.

---

## 3. Palet Warna (Tema Beige Hangat)
Dirancang dengan standar kontras rasio tinggi (WCAG AA & AAA) untuk kenyamanan baca di layar HP dan laptop:
- **Background Utama**: `#FAF7F2` (Warm Ivory / Linen lembut)
- **Background Kartu & Panel**: `#FFFFFF` dan `#F4EFE6` (Creamy Sand)
- **Border & Pembatas**: `#DFD7CB` (Soft Warm Beige)
- **Aksen Primer & Tombol**: `#5A3825` (Deep Warm Cocoa - kontras tinggi, elegan dan terpercaya)
- **Aksen Sekunder / Badge**: `#8C593E` (Terracotta Warm Earth)
- **Teks Utama**: `#2A211B` (Dark Espresso - kontras tajam untuk keterbacaan sempurna)
- **Teks Sekunder**: `#6A5C52` (Muted Warm Umber)
- **Aksen Sukses / WhatsApp**: `#2E6F40` (Forest Green natural, menyatu dengan nuansa earthy)

---

## 4. Tipografi
- **Font Utama**: `Montserrat`, sans-serif
  - **Headings & Judul Toko**: Montserrat Semi-Bold (font-weight: 600) & Bold (700)
  - **Nama Snack & Harga**: Montserrat Semi-Bold (600)
  - **Deskripsi & Body Text**: Montserrat Regular (400) & Medium (500)

---

## 5. Tata Letak (Layout Structure)
Sesuai arahan spesifik:
1. **Header / Halaman Awal**:
   - Menampilkan Nama Usaha & Logo secara bersih, anggun, dan proporsional.
   - Tombol akses cepat ke Panel Admin / Kelola Toko.
2. **Katalog Produk Utama (Makanan & Harga)**:
   - Galeri kartu makanan berfokus pada foto produk dengan rasio aspek konsisten (4:3 atau 1:1).
   - Nama snack dan label harga format Rupiah yang tegas dan jelas.
   - Tombol aksi pemesanan langsung via WhatsApp.
3. **Bagian Paket Snack**:
   - Kartu paket kombo/hampers dengan rincian isi snack di dalamnya dan total harga paket yang hemat.
4. **Backend / Admin Space**:
   - Form ganti nama toko dan unggah/ganti logo.
   - Form tambah, ubah harga, ganti foto, dan hapus snack.
   - Form kelola paket snack (nama paket, harga, item isi, dan foto).

---

## 6. Standar Anti-Slop
- Tanpa badge "AI Magic" atau ikon glitter/bintang mengapung.
- Tanpa counter statistik palsu ("99.9% Happy Customers", "10,000+ Orders").
- Foto makanan asli atau placeholder jujur dengan aspek rasio rapi.
- Input dan tombol memiliki status `:hover`, `:active`, dan `:focus-visible` yang jelas untuk aksesibilitas.

