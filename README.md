# Web Katalog Snack Ibu

Aplikasi web katalog camilan & paket snack rumahan yang elegan, bersih, dan fleksibel dengan panel backend untuk mengelola nama toko, logo, foto makanan, harga, paket snack, dan pemesanan WhatsApp langsung.

Dibangun dengan mematuhi standar desain **[anti-slop](https://github.com/miqdadbadjuber/anti-slop)** dan panduan [DESIGN.md](DESIGN.md).

---

## Fitur Utama

1. **Halaman Awal (Header)**:
   - Menampilkan Nama Usaha & Logo toko secara bersih, proporsional, dan elegan.
   - Tombol akses cepat ke Panel Backend Pengelola (`/admin`).

2. **Halaman Utama (Katalog)**:
   - **Galeri Gambar Makanan & Harga**: Tampilan foto makanan menggugah selera dengan aspek rasio rapi (4:3), label harga Rupiah yang jelas, dan tombol `+ Pesan`.
   - **Paket Snack Kombo**: Kartu paket kombo lengkap dengan rincian isi item dan total harga hemat.
   - **Formulir Pemesanan WhatsApp Lengkap**: Pilihan porsi dengan tombol `+`/`−`, pemilihan metode antar/ambil sendiri, data pemesan, dan tombol kirim WhatsApp yang otomatis terformat rapi.

3. **Panel Backend Pengelola (`/admin`)**:
   - **Identitas & Logo Toko**: Unggah logo baru langsung dari file komputer/HP (PNG, JPG, WebP, SVG) langsung tersimpan otomatis.
   - **Kelola Gambar & Harga Snack**: Tambah snack baru, unggah foto makanan, ubah harga satuan (bebas nominal berapapun), ganti deskripsi, atau hapus menu.
   - **Kelola Paket Snack**: Tambah/edit paket kombo dan atur daftar isi item snack.

---

## Cara Menjalankan di Komputer Lokal

### Cara 1 (Paling Cepat):
Cukup **klik dua kali** file:
```
run.bat
```
Browser akan otomatis membuka `http://127.0.0.1:5000`.

### Cara 2 (Terminal):
```bash
python app.py
```

---

## 🚀 Panduan Deploy Online ke Render.com (Gratis)

### Langkah 1: Upload Proyek ke GitHub
1. Buat repository baru di [github.com](https://github.com) (misal: `katalog-snack-ibu`).
2. Di folder proyek ini, jalankan perintah Git (atau gunakan GitHub Desktop / VS Code):
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi web katalog snack ibu"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/katalog-snack-ibu.git
   git push -u origin main
   ```

### Langkah 2: Hubungkan ke Render.com
1. Buka [render.com](https://render.com) dan buat akun (bisa login langsung pakai akun GitHub).
2. Di dashboard Render, klik tombol **"New +"** lalu pilih **"Web Service"**.
3. Pilih opsi **"Build and deploy from a Git repository"** dan pilih repository `katalog-snack-ibu` Anda.
4. Render akan otomatis mendeteksi file konfigurasi `render.yaml` kita. Jika diminta mengisi formulir manual:
   - **Name**: `katalog-snack-ibu`
   - **Region**: Singapore (paling dekat & cepat untuk Indonesia)
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`
5. Klik **"Deploy Web Service"**.
6. Tunggu proses build 1–2 menit hingga muncul status **Live**. Web katalog Anda kini resmi online di alamat seperti:
   `https://katalog-snack-ibu.onrender.com` 🎉
