# Fullstack Web Alumni Modern

Sistem manajemen Alumni yang dibangun menggunakan React, Tailwind CSS, Node.js, Express, dan Prisma ORM dengan SQLite.
Siap untuk produksi dan dideploy menggunakan Docker.

## Fitur
- **Landing Page**: Informasi, Event, Berita, Donasi, Direktori.
- **Autentikasi**: Login dan Register menggunakan JWT.
- **Dashboard Admin**: Mengelola data alumni, event, lowongan kerja, donasi, berita, dan tracer study.
- **Dashboard Alumni**: Melengkapi profil, melihat lowongan, event, dan mengisi tracer study.

## Teknologi
- **Frontend**: React (Vite), React Router, Tailwind CSS, Shadcn UI.
- **Backend**: Node.js, Express.js, Prisma ORM, SQLite.
- **DevOps**: Docker, Docker Compose, Nginx.

## Prasyarat
- Node.js (v18 atau lebih baru)
- NPM atau Yarn
- Docker & Docker Compose (untuk deployment)

## Instalasi & Menjalankan Lokal

### 1. Setup Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js # Menjalankan seeder untuk superadmin
npm run dev # (tambahkan script "dev": "nodemon src/server.js" di package.json)
```

Akun Superadmin Default:
- Email: `superadmin@alumni.com`
- Password: `admin123`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment di VPS Linux

### 1. Clone Repository & Setup
Masuk ke VPS Linux Anda, lalu clone repository ini.

### 2. Build & Run dengan Docker Compose
Aplikasi ini sudah dilengkapi dengan Dockerfile dan docker-compose.yml.
```bash
docker-compose up -d --build
```
Perintah ini akan membangun image backend dan frontend (dengan Nginx), lalu menjalankannya di background.

### 3. Akses Aplikasi
Aplikasi frontend sekarang dapat diakses melalui port 80 pada alamat IP VPS Anda, dan backend berjalan di port 5000 (di-proxy oleh Nginx).

## Transisi ke MySQL (Production Ready)

Aplikasi saat ini menggunakan SQLite untuk proses *development* lokal. Untuk melakukan deploy ke *production* menggunakan MySQL, ikuti langkah berikut:

1. **Ubah Provider Prisma**
   Buka `backend/prisma/schema.prisma` lalu ubah `provider` menjadi `mysql`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
2. **Generate Ulang Prisma Client**
   Hapus folder `backend/prisma/migrations` jika ada, lalu jalankan:
   ```bash
   cd backend
   npx prisma generate
   ```
3. **Gunakan Docker Compose Prod**
   Jalankan environment menggunakan file spesifik production yang sudah berisi MySQL Server:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
4. **Jalankan Migrasi & Seed**
   Setelah container database berjalan:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run db:push
   docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
   ```
