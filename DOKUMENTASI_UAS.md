# Dokumentasi UAS PSS - PinjemAja

## 1. Deskripsi Proyek
PinjemAja adalah platform sharing economy berbasis kampus yang memungkinkan mahasiswa saling pinjam-meminjam barang menggunakan verifikasi email akademik (.ac.id).

## 2. Desain Database
Proyek terdiri dari 4 aplikasi utama:
- **accounts**: Menangani autentikasi user, role, dan validasi email kampus.
- **listings**: Mengelola barang yang disewakan, kategori, dan foto.
- **transactions**: Mengatur alur peminjaman, pembayaran manual, dan ulasan.
- **notifications**: Sistem notifikasi in-app untuk setiap perubahan status transaksi.

## 3. API Endpoints Utama
### Accounts
- `POST /api/auth/register/`: Registrasi user baru.
- `POST /api/auth/login/`: Login dan mendapatkan token JWT.

### Listings
- `GET /api/listings/`: List barang (tersedia pagination, filtering, searching).
- `POST /api/listings/`: Tambah barang baru.

### Transactions
- `POST /api/transactions/`: Ajukan peminjaman.
- `POST /api/transactions/{id}/confirm/`: Konfirmasi pengajuan (oleh owner).
- `GET /api/transactions/earnings_summary/`: Ringkasan pendapatan owner.

## 4. Autentikasi & Authorization
- Menggunakan JWT (JSON Web Token) via `djangorestframework-simplejwt`.
- Validasi email wajib berakhiran `.ac.id`.
- Permission berbasis role: Owner hanya bisa konfirmasi transaksinya sendiri, Admin (`is_staff`) bisa memverifikasi pembayaran.

## 5. Fitur Tambahan (Kriteria UAS)
- **Throttling**: Anon (20/mnt), User (60/mnt).
- **Pagination**: Default 10 item per halaman.
- **Filtering**: Berdasarkan kategori, harga, dan lokasi.

## 6. Unit Testing
Dijalankan dengan: `python manage.py test`
Coverage meliputi:
- Registrasi & Login.
- Validasi deposit listing.
- Alur konfirmasi transaksi.
- Notifikasi otomatis.

## 7. Deployment
- **Platform**: Render.
- **Web Server**: Gunicorn.
- **Static Files**: Whitenoise.
- **Background Task**: Celery + Redis.
