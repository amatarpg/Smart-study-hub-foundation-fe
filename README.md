# Smart Study Hub Foundation — Frontend

Antarmuka web untuk [Smart-study-hub-foundation](https://github.com/amatarpg/Smart-study-hub-foundation)
(backend FastAPI di `/api/v1`). Dibangun dengan **React 18 + TypeScript + Vite**, TanStack Query,
React Router, Zustand, Tailwind CSS, dan komponen bergaya shadcn/ui. UI berbahasa Indonesia.

## Struktur

```text
src/
  app/            # router, provider, route guard (auth, role, school)
  components/     # ui/ (button, card, dialog, table, …) + layout/ (sidebar, topbar, app-shell)
  features/       # auth, schools, dashboard, directory, academics, exams, my-exams, jobs
  lib/
    api/          # client.ts (token di memori, refresh terserialisasi, X-School-ID, 409/422),
                  # errors.ts, types.ts, mock.ts, generated.d.ts (openapi-typescript)
    ws/           # client.ts (ticket sekali pakai, ping, dedup event_id, reconnect + refetch)
    query.ts      # konfigurasi QueryClient
  store/          # auth, school, realtime (zustand)
  i18n/           # kamus Bahasa Indonesia
  mock/           # data contoh untuk mode demo tanpa backend
scripts/generate-types.mjs   # ambil OpenAPI backend → src/lib/api/generated.d.ts
```

## Menjalankan

```bash
cp .env.example .env
npm install
npm run dev        # http://127.0.0.1:5173, proxy /api → localhost:8000
```

Tanpa backend, set `VITE_APP_MOCK=1` di `.env` untuk mode demo dengan data contoh
(login berhasil dengan email apa pun asalkan kata sandi bukan `salah`).

Saat backend berjalan di `http://localhost:8000` (lihat README backend), set
`VITE_APP_MOCK=0` dan jalankan `npm run dev`; Vite mem-proxy `/api` (termasuk WebSocket)
ke backend, dengan `STUDYHUB_ALLOWED_ORIGINS=http://127.0.0.1:5173`.

## Pemeriksaan

```bash
npm run typecheck
npm test           # vitest: client API (refresh single-flight, 401/409/422, header)
npm run lint
npm run build
npm run gen:types  # perlu backend aktif di localhost:8000
```

## Catatan keamanan (mengikuti docs backend)

- Access token disimpan **di memori saja**; refresh token juga hanya di memori dan
  pemakaiannya **diserialisasi** (satu permintaan refresh berjalan dalam satu waktu).
- Refresh token tidak pernah disimpan di localStorage.
- `X-School-ID` dikirim otomatis dari sekolah aktif; server tetap yang menegakkan otorisasi.
- Konflik `409` ditampilkan sebagai banner "muat ulang"; `422` dipetakan ke error field form.
- WebSocket memakai ticket sekali pakai 30 detik, ping `{"type":"ping"}`, dedup `event_id`,
  dan state diambil ulang lewat HTTP saat reconnect.
