# Alfamart Shift Scheduler

Aplikasi web untuk manajemen jadwal shift karyawan Alfamart secara otomatis dan manual. Memudahkan pengaturan dan penjadwalan shift kerja di toko Alfamart dengan berbagai fitur fleksibel.

## Fitur Utama

- Generate jadwal shift otomatis, manual, hybrid, dan mingguan.
- Manajemen data karyawan dan toko.
- Tampilan kalender jadwal shift yang interaktif.
- Filter dan pencarian jadwal berdasarkan toko dan tanggal.
- CRUD data karyawan, shift, dan toko.
- Responsif dan mudah digunakan.

## Teknologi

- Backend: Laravel PHP Framework
- Frontend: Vue.js
- Database: MySQL
- Validasi input menggunakan Laravel Validator

## Instalasi

1. Clone repository ini:

```bash
   git clone https://github.com/codesyariah122/alfamart-shift.git
   cd alfamart-shift
```

2. Install dependencies PHP:  
```  

composer install
``` 

3. Install dependencies frontend:  
```
yarn install
yarn dev
```  

4. Copy file environment dan sesuaikan konfigurasi database:  
```
cp .env.example .env
php artisan key:generate
```  

5. Migrasi database:  
```
php artisan migrate --seed
```  

6. Jalankan server:  
```
php artisan serve
```  
### Tinker 
```
php artisan tinker

\App\Models\Schedule::truncate();

```  

### Queue untuk schedule send email

```
php artisan queue:work --queue=default
```  

## Cara Penggunaan

- Masuk ke dashboard admin.

- Pilih menu Jadwal Shift.

- Pilih tipe generate jadwal: auto, manual, hybrid, atau weekly.

- Pilih toko dan tanggal rentang jadwal.

- Klik Generate untuk membuat jadwal baru.

- Lihat hasil jadwal pada tampilan kalender.

### Kontribusi

> Kontribusi sangat diterima, silakan buat issue atau pull request jika menemukan bug atau ingin menambahkan fitur. Lisensi

MIT License © 2024 Codesyariah  

### Dokumentasi Singkat
Endpoint API Utama
| Endpoint                | Method | Deskripsi                              |
| ----------------------- | ------ | -------------------------------------- |
| `/api/generateSchedule` | POST   | Generate jadwal shift sesuai parameter |
| `/api/stores`           | GET    | Mendapatkan list toko                  |
| `/api/employees`        | GET    | Mendapatkan list karyawan              |
| `/api/shifts`           | GET    | Mendapatkan list shift                 |
| `/api/schedules`        | GET    | Mendapatkan jadwal shift               |

#### Struktur Data Request generateSchedule  
```
{
  "generation_type": "auto|manual|hybrid|weekly",
  "store_id": 1,
  "from": "2025-07-01",
  "to": "2025-07-07"
}
```  

### Cara Generate Jadwal

    auto: Sistem membuat jadwal otomatis berdasarkan aturan default.

    manual: Admin memasukkan jadwal secara manual.

    hybrid: Kombinasi antara manual dan otomatis.

    weekly: Generate jadwal berdasarkan minggu tertentu.

### Teknologi Pendukung

>Laravel12 Validator untuk validasi request.

>ReactJS ```Create React App (CRA)``` untuk interaktifitas UI dan kalender.

>MySQL untuk penyimpanan data jadwal, karyawan, toko, dan shift.
