# APAM (Aplikasi Pasien RS Atila Medika)

APAM adalah aplikasi pasien berbasis **Expo + React Native** untuk layanan RS Atila Medika, terintegrasi dengan API **mLITE/SIMRS**. Aplikasi ini menyediakan beranda ringkas, pendaftaran mandiri, jadwal dokter, tarif layanan, serta riwayat perawatan.

Dokumentasi ini menjelaskan cara pemasangan, konfigurasi, menjalankan aplikasi, build, dan troubleshooting umum.

## Fitur Utama

- Login pasien menggunakan **No. Rekam Medis** dan **NIK/Password personal**.
- Beranda pasien dengan data ringkas, jadwal dokter, dan artikel kesehatan terbaru.
- Akses modul layanan:
  - Rawat Jalan
  - Rawat Inap
  - Jadwal Dokter
  - Kamar tersedia
  - Tarif Laboratorium, Radiologi, dan Farmasi
  - Riwayat perawatan
  - Pendaftaran mandiri
- Integrasi API melalui `axios` dengan interceptor untuk token dan kredensial pasien.

## Alur Penggunaan (Singkat)

- Pengguna tamu tetap dapat membuka Beranda dan sebagian menu informasi (jadwal dokter, tarif, kamar, dll).
- Fitur yang memerlukan kredensial pasien (contoh: Booking/Riwayat/Profile/Detail tertentu) akan menampilkan layar **Login Diperlukan** jika belum login.
- Setelah login, aplikasi menyimpan sesi dan mengaktifkan fitur pasien (riwayat, pendaftaran, tiket booking, dsb).

## Teknologi

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- Axios

## Prasyarat

- Node.js 20+ (disarankan LTS)
- npm
- Expo CLI (opsional, karena bisa via `npx expo ...`)

## Kebutuhan Backend (mLITE/SIMRS)

APAM membutuhkan backend mLITE yang:

- Mengaktifkan endpoint API yang digunakan aplikasi (misal: `api/master/list/...`, `api/website/list`, modul rawat jalan, dll).
- Memiliki **API key** dan user sistem yang memiliki permission sesuai (misal `can_read`, `can_create`, `can_update`).
- Untuk penggunaan **Web (browser)**, backend harus mengizinkan request CORS. Jika CORS tidak benar, biasanya di browser akan muncul `AxiosError: Network Error` atau `net::ERR_FAILED`.

Catatan modul opsional:

- Jika modul `rawat_inap` tidak tersedia/disabled, set flag env Rawat Inap ke `false` agar aplikasi tidak memanggil endpoint yang akan 404.

## Konfigurasi Environment

Buat atau sesuaikan file `.env` di root project:

```env
EXPO_PUBLIC_API_URL=https://demo.mlite.id
EXPO_PUBLIC_API_ADMIN=admin
EXPO_PUBLIC_API_KEY=YOUR_API_KEY_HERE
EXPO_PUBLIC_API_USERNAME=admin
EXPO_PUBLIC_API_PASSWORD=admin
EXPO_PUBLIC_ENABLE_RAWAT_INAP=true
EXPO_PUBLIC_ENABLE_RAWAT_INAP_WEB=true
```

Keterangan:

- `EXPO_PUBLIC_API_URL`: base URL API backend.
- `EXPO_PUBLIC_API_ADMIN`: admin prefix API (misal: `admin`).
- `EXPO_PUBLIC_API_KEY`: API key yang valid.
- `EXPO_PUBLIC_API_USERNAME` dan `EXPO_PUBLIC_API_PASSWORD`: kredensial sistem untuk login awal.
- `EXPO_PUBLIC_ENABLE_RAWAT_INAP`: aktif/nonaktifkan fitur dan request Rawat Inap (global).
- `EXPO_PUBLIC_ENABLE_RAWAT_INAP_WEB`: override khusus platform Web. Jika diset, nilai ini akan dipakai saat berjalan di Web.

## Instalasi (Pemasangan)

1. Clone project:

```bash
git clone <repo-url> apam
cd apam
```

2. Install dependency:

```bash
npm install
```

3. Siapkan `.env`:

- Copy dari contoh di atas
- Sesuaikan `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_ADMIN`, `EXPO_PUBLIC_API_KEY`, dan kredensial sistem

4. Jalankan:

```bash
npx expo start
```

## Menjalankan Project (Lokal)

1. Install dependency:

```bash
npm install
```

2. Jalankan development server Expo:

```bash
npm run dev
```

Alternatif langsung via Expo CLI:

```bash
npx expo start
```

3. Jalankan target platform (opsional):

```bash
npm run android
npm run ios
```

## Menjalankan di Web

Expo Web akan berjalan dari dev server yang sama:

```bash
npx expo start --web
```

Jika request API tertentu gagal di Web namun normal di Android/iOS, hampir selalu karena konfigurasi **CORS** pada backend atau endpoint yang 404 (modul nonaktif). Lihat bagian Troubleshooting.

## Compile Android dan iOS via Expo

### Opsi 1: Compile lokal (native build)

Gunakan opsi ini jika Anda ingin build langsung di mesin lokal.

1. Generate folder native:

```bash
npx expo prebuild
```

2. Compile Android:

```bash
npx expo run:android
```

3. Compile iOS (hanya macOS + Xcode):

```bash
npx expo run:ios
```

Catatan:

- Android membutuhkan Android Studio + SDK.
- iOS membutuhkan Xcode, CocoaPods, dan simulator/perangkat iOS.

### Opsi 2: Compile cloud dengan EAS Build (disarankan untuk release)

1. Install dan login EAS CLI:

```bash
npm install -g eas-cli
eas login
```

2. Inisialisasi konfigurasi EAS:

```bash
eas build:configure
```

3. Build Android (AAB/APK):

```bash
eas build -p android
```

4. Build iOS (IPA):

```bash
eas build -p ios
```

5. Download hasil build dari link output EAS setelah proses selesai.

## Mengganti Icon & Splash

- Icon aplikasi: ubah `expo.icon` di [app.json](file:///Users/basoro/Server/data/www/apam/app.json)
- Splash screen: ubah konfigurasi `splash` di [app.json](file:///Users/basoro/Server/data/www/apam/app.json)

## Scripts

- `npm run dev` menjalankan Expo dev server.
- `npm run build:web` export web build.
- `npm run lint` menjalankan lint bawaan Expo.
- `npm run typecheck` pengecekan TypeScript tanpa emit.
- `npm run android` build/run Android native.
- `npm run ios` build/run iOS native.

## Deploy dengan Docker

Project sudah menyediakan `Dockerfile` untuk menjalankan Expo server pada port `8080`.

Contoh build & run:

```bash
docker build -t apam --build-arg EXPO_PUBLIC_API_URL=https://demo.mlite.id .
docker run --rm -p 8080:8080 apam
```


Jika variabel ini tidak diatur, QR code bisa menunjuk IP internal yang tidak dapat diakses dari perangkat HP.

## Troubleshooting

### 1) Web: `AxiosError: Network Error` / `net::ERR_FAILED`

Penyebab umum:

- Backend tidak mengizinkan CORS (preflight `OPTIONS` gagal).
- Endpoint 404 karena modul/plugin backend tidak aktif.

Langkah cek cepat:

- Buka DevTools → Network, lihat status request (404/403/500).
- Pastikan backend mengirim header CORS, misalnya `Access-Control-Allow-Origin`.
- Jika endpoint 404 (mis. `api/rawat_inap/list`), set `EXPO_PUBLIC_ENABLE_RAWAT_INAP_WEB=false` agar aplikasi tidak melakukan request tersebut.

### 2) Rawat Inap 404 (modul tidak aktif)

Jika backend tidak memiliki modul rawat inap, nonaktifkan di `.env`:

```env
EXPO_PUBLIC_ENABLE_RAWAT_INAP=false
```

atau khusus Web:

```env
EXPO_PUBLIC_ENABLE_RAWAT_INAP_WEB=false
```

Restart dev server setelah mengganti `.env`.

### 3) Build Android gagal karena resource gambar

Jika build Android error AAPT terkait file `.png`, pastikan file gambar benar-benar format PNG (bukan JPEG yang di-rename).

## Struktur Folder Ringkas

```text
app/          -> route dan screen Expo Router
contexts/     -> context global (autentikasi)
lib/          -> API client dan endpoint wrapper
assets/       -> gambar dan aset statis
hooks/        -> custom hooks
```
