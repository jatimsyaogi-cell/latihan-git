# Pendataan Karyawan

Aplikasi web sederhana untuk mengelola data karyawan (CRUD + search/filter/pagination) menggunakan **Next.js App Router**, **Prisma**, **SQLite**, **Zod**, dan **shadcn/ui**.

## Fitur

- Daftar karyawan dengan statistik ringkas
- Tambah, detail, edit, hapus karyawan
- Search (nama / NIP / email)
- Filter departemen & status
- Pagination server-side
- Validasi form client + server (Zod)
- Seed data dummy

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Prisma + SQLite
- React Hook Form + Zod
- Server Actions

## Setup

### Prasyarat

- Node.js 18+ (disarankan 20+)
- npm

### Instalasi

```bash
npm install
```

### Environment

Salin contoh env:

```bash
cp .env.example .env
```

Isi default:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="Pendataan Karyawan"
```

### Database

```bash
npx prisma migrate dev
npm run db:seed
```

Atau cepat tanpa migrasi formal:

```bash
npm run db:push
npm run db:seed
```

### Jalankan development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — otomatis redirect ke `/employees`.

## Script penting

| Script | Keterangan |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Jalankan build production |
| `npm run db:migrate` | Migrasi development |
| `npm run db:seed` | Isi data dummy |
| `npm run db:studio` | Buka Prisma Studio |

## Struktur utama

```
app/(dashboard)/employees/   # list, create, detail, edit
components/employees/        # table, form, filters, dialog
lib/employees/               # queries + server actions
lib/validations/             # Zod schemas
prisma/                      # schema, migrations, seed
```

## Catatan

- Auth ditunda (lihat `IMPLEMENTASI.md` fase 3)
- Search SQLite bersifat case-sensitive tergantung collation
- Jangan commit file `.env` dan database lokal `*.db`

Detail perencanaan ada di [`IMPLEMENTASI.md`](./IMPLEMENTASI.md).
