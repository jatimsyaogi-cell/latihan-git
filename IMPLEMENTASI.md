# Aplikasi Pendataan Karyawan — Breakdown Implementasi

Dokumen ini merinci rencana implementasi aplikasi pendataan karyawan sederhana berbasis **Next.js**. Cakupan: analisis, arsitektur, model data, struktur file, API/Server Actions, UI, validasi, tahapan pengembangan, testing, dan deployment.

---

## 1. Ringkasan Produk

### 1.1 Tujuan
Membangun aplikasi web internal untuk mengelola data karyawan: melihat daftar, menambah, mengubah, menghapus, mencari, dan memfilter data.

### 1.2 Persona & use case
| Persona | Kebutuhan |
|---|---|
| Admin HR | CRUD data karyawan, filter per departemen/status |
| Viewer (fase lanjut) | Hanya melihat daftar & detail |

### 1.3 Scope v1 (in)
- CRUD karyawan
- List dengan search, filter, pagination, sort
- Validasi form server & client
- Empty state, loading state, error handling dasar
- Seed data dummy

### 1.4 Scope v1 (out)
- Multi-tenant / multi-perusahaan
- Absensi, cuti, payroll
- Role matrix kompleks
- Upload massal / import Excel (bisa fase 3)
- Realtime collaboration
- Mobile native app

### 1.5 Scope v2+ (opsional)
- Autentikasi & otorisasi
- Soft delete + restore
- Export CSV
- Upload foto karyawan
- Audit log perubahan data

---

## 2. Stack Teknologi

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, routing file-based |
| Bahasa | TypeScript | type safety end-to-end |
| Styling | Tailwind CSS | utility-first, cepat |
| Komponen UI | shadcn/ui | aksesibel, customizable, berbasis Radix |
| ORM | Prisma | schema-first, migrasi, type-safe query |
| Database (dev) | SQLite | zero setup lokal |
| Database (prod) | PostgreSQL (Neon/Supabase/Vercel Postgres) | production-ready |
| Validasi | Zod | shared schema form + server |
| Form | React Hook Form + `@hookform/resolvers` | performa form, integrasi Zod |
| Toast | sonner | feedback UX ringan |
| Auth (fase 2) | Auth.js (NextAuth v5) | standar ekosistem Next.js |
| Deploy | Vercel | native Next.js |

### 2.1 Keputusan arsitektur penting

1. **Server Actions** sebagai primary mutation path — tidak perlu REST API terpisah di v1.
2. **RSC untuk read** — list/detail di-fetch di server component.
3. **Client Components** hanya untuk form interaktif, filter, dialog.
4. **Single shared Zod schema** untuk validasi client & server (hindari drift).
5. **SQLite dulu, Postgres nanti** — ganti hanya connection string + provider Prisma.

---

## 3. Model Data

### 3.1 Entity: `Employee`

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | `String` (cuid/uuid) | PK | ID internal |
| `nip` | `String` | unique, required | Nomor Induk Pegawai |
| `name` | `String` | required, min 2 | Nama lengkap |
| `email` | `String` | unique, email format | Email kerja |
| `phone` | `String?` | optional | No. telepon |
| `department` | `String` | required | Departemen |
| `position` | `String` | required | Jabatan |
| `status` | `Enum` | default `ACTIVE` | `ACTIVE` \| `INACTIVE` |
| `joinedAt` | `DateTime` | required | Tanggal masuk |
| `createdAt` | `DateTime` | auto | Waktu dibuat |
| `updatedAt` | `DateTime` | auto | Waktu diubah |

### 3.2 Prisma schema (draft)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // ganti "postgresql" di production
  url      = env("DATABASE_URL")
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
}

model Employee {
  id         String         @id @default(cuid())
  nip        String         @unique
  name       String
  email      String         @unique
  phone      String?
  department String
  position   String
  status     EmployeeStatus @default(ACTIVE)
  joinedAt   DateTime
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
}
```

### 3.3 Enum & konstanta domain

Departemen (konstanta app, bukan tabel terpisah di v1):

```ts
export const DEPARTMENTS = [
  "Human Resources",
  "Engineering",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
] as const;
```

Status label UI:

```ts
export const STATUS_LABELS = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
} as const;
```

### 3.4 Evolusi schema (fase lanjut)

| Fase | Perubahan |
|---|---|
| Soft delete | tambah `deletedAt DateTime?` |
| Foto | tambah `avatarUrl String?` |
| Auth | model `User`, relasi optional `createdBy` |
| Audit | model `EmployeeAuditLog` |

---

## 4. Struktur Proyek

```
latihan-git/
├── app/
│   ├── layout.tsx                 # root layout (font, providers)
│   ├── page.tsx                   # redirect → /employees
│   ├── globals.css
│   ├── (dashboard)/
│   │   ├── layout.tsx             # shell: sidebar/header
│   │   └── employees/
│   │       ├── page.tsx           # list + search/filter
│   │       ├── loading.tsx        # skeleton list
│   │       ├── error.tsx          # error boundary
│   │       ├── new/
│   │       │   └── page.tsx       # form create
│   │       └── [id]/
│   │           ├── page.tsx       # detail
│   │           ├── edit/
│   │           │   └── page.tsx   # form edit
│   │           └── not-found.tsx
│   └── api/                       # opsional; v1 utamanya Server Actions
│       └── health/route.ts
├── components/
│   ├── ui/                        # shadcn generated
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   ├── app-header.tsx
│   │   └── page-header.tsx
│   └── employees/
│       ├── employee-table.tsx
│       ├── employee-form.tsx
│       ├── employee-filters.tsx
│       ├── employee-status-badge.tsx
│       ├── delete-employee-dialog.tsx
│       └── empty-state.tsx
├── lib/
│   ├── db.ts                      # Prisma client singleton
│   ├── utils.ts                   # cn() dsb.
│   ├── constants.ts               # DEPARTMENTS, status labels
│   ├── validations/
│   │   └── employee.ts            # Zod schemas
│   └── employees/
│       ├── queries.ts             # read helpers
│       └── actions.ts             # Server Actions (mutations)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── types/
│   └── employee.ts                # shared types (opsional; bisa infer dari Zod/Prisma)
├── public/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── components.json                # shadcn config
├── IMPLEMENTASI.md                # dokumen ini
└── README.md
```

### 4.1 Pemisahan tanggung jawab

| Folder/file | Tanggung jawab |
|---|---|
| `app/**/page.tsx` | Komposisi UI + fetch data (RSC) |
| `lib/employees/queries.ts` | Query read-only ke DB |
| `lib/employees/actions.ts` | Mutasi + revalidate |
| `lib/validations/*` | Kontrak data (Zod) |
| `components/employees/*` | Presentasi & interaksi |
| `prisma/*` | Schema, migrasi, seed |

---

## 5. Routing & Halaman

| Route | Method data | Komponen utama | Keterangan |
|---|---|---|---|
| `/` | — | redirect | ke `/employees` |
| `/employees` | RSC query | `EmployeeTable`, `EmployeeFilters` | list |
| `/employees/new` | Server Action create | `EmployeeForm` | create |
| `/employees/[id]` | RSC `getById` | detail card | detail |
| `/employees/[id]/edit` | Server Action update | `EmployeeForm` (prefill) | edit |

### 5.1 Search params (list)

```
/employees?q=andi&department=Engineering&status=ACTIVE&page=1&pageSize=10&sort=name&order=asc
```

| Param | Default | Keterangan |
|---|---|---|
| `q` | `""` | search di `name`, `nip`, `email` |
| `department` | all | filter exact |
| `status` | all | `ACTIVE` / `INACTIVE` |
| `page` | `1` | halaman |
| `pageSize` | `10` | item per halaman |
| `sort` | `createdAt` | field sort |
| `order` | `desc` | `asc` \| `desc` |

---

## 6. Validasi (Zod)

File: `lib/validations/employee.ts`

```ts
import { z } from "zod";
import { DEPARTMENTS } from "@/lib/constants";

export const employeeStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const employeeFormSchema = z.object({
  nip: z
    .string()
    .trim()
    .min(3, "NIP minimal 3 karakter")
    .max(30, "NIP maksimal 30 karakter"),
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100),
  email: z.string().trim().email("Email tidak valid"),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  department: z.enum(DEPARTMENTS, {
    errorMap: () => ({ message: "Departemen tidak valid" }),
  }),
  position: z.string().trim().min(2, "Jabatan wajib diisi").max(100),
  status: employeeStatusSchema.default("ACTIVE"),
  joinedAt: z.coerce.date({
    errorMap: () => ({ message: "Tanggal masuk tidak valid" }),
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const employeeIdSchema = z.string().cuid();

export const employeeListQuerySchema = z.object({
  q: z.string().optional().default(""),
  department: z.string().optional(),
  status: employeeStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(50).default(10),
  sort: z
    .enum(["name", "nip", "department", "joinedAt", "createdAt"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
```

### 6.1 Aturan bisnis tambahan (server)

- `nip` & `email` harus unique — tangkap `P2002` dari Prisma, map ke field error.
- Tidak boleh update `id`.
- Delete: hard delete di v1; soft delete di v2.

---

## 7. Layer Data Access

### 7.1 Prisma client singleton — `lib/db.ts`

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 7.2 Queries — `lib/employees/queries.ts`

| Fungsi | Input | Output | Dipakai di |
|---|---|---|---|
| `getEmployees(query)` | list query (search/filter/page) | `{ data, total, page, pageSize }` | `/employees` |
| `getEmployeeById(id)` | id | `Employee \| null` | detail & edit |
| `getEmployeeStats()` | — | count per status (opsional) | dashboard mini |

Contoh logika filter:

```ts
where: {
  AND: [
    q
      ? {
          OR: [
            { name: { contains: q } },
            { nip: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {},
    department ? { department } : {},
    status ? { status } : {},
  ],
}
```

> Catatan SQLite: `contains` case-sensitive tergantung collation. Untuk case-insensitive sederhana, normalisasi input atau gunakan raw query / pindah ke Postgres.

### 7.3 Server Actions — `lib/employees/actions.ts`

Pola return seragam:

```ts
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

| Action | Perilaku | Revalidate |
|---|---|---|
| `createEmployee(values)` | parse Zod → create → redirect list | `/employees` |
| `updateEmployee(id, values)` | parse → update → redirect detail | `/employees`, `/employees/[id]` |
| `deleteEmployee(id)` | delete → redirect list | `/employees` |

Checklist tiap action:

1. `"use server"`
2. Validasi Zod (`safeParse`)
3. Operasi Prisma di `try/catch`
4. Map error unique → `fieldErrors`
5. `revalidatePath(...)`
6. `redirect(...)` atau return result untuk client handling

Contoh kerangka:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { employeeFormSchema } from "@/lib/validations/employee";

export async function createEmployee(raw: unknown) {
  const parsed = employeeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "Validasi gagal",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.employee.create({
      data: {
        ...parsed.data,
        phone: parsed.data.phone || null,
      },
    });
  } catch (e) {
    // map Prisma P2002 → fieldErrors nip/email
    return { success: false as const, error: "Gagal menyimpan data" };
  }

  revalidatePath("/employees");
  redirect("/employees");
}
```

---

## 8. Komponen UI

### 8.1 shadcn/ui yang diperlukan

Install awal:

```bash
npx shadcn@latest init
npx shadcn@latest add button input label select textarea table badge dialog alert-dialog dropdown-menu form card separator sonner skeleton pagination
```

### 8.2 Komponen domain

#### `EmployeeTable`
- Props: `data: Employee[]`
- Kolom: NIP, Nama, Email, Departemen, Jabatan, Status, Tanggal Masuk, Aksi
- Aksi per baris: Detail, Edit, Hapus
- Responsive: horizontal scroll di mobile atau card list alternatif

#### `EmployeeFilters`
- Client component
- Controlled via `useRouter` + `useSearchParams` (update URL, jangan local-only state untuk source of truth)
- Debounce search (~300ms)
- Reset filter button

#### `EmployeeForm`
- Dipakai create & edit (`mode: "create" | "edit"`)
- React Hook Form + `zodResolver(employeeFormSchema)`
- Fields: nip, name, email, phone, department (Select), position, status (Select), joinedAt (date input)
- Submit → Server Action
- Tampilkan `fieldErrors` dari server

#### `DeleteEmployeeDialog`
- AlertDialog konfirmasi
- Trigger dari table/detail
- Call `deleteEmployee(id)`

#### `EmployeeStatusBadge`
- `ACTIVE` → badge hijau/default
- `INACTIVE` → badge secondary/destructive soft

#### `EmptyState`
- Muncul saat `total === 0`
- CTA: "Tambah Karyawan"

#### Layout
- Sidebar sederhana: logo + nav "Karyawan"
- Header: judul halaman + action button (Tambah)
- `PageHeader` reusable: title, description, actions

### 8.3 State UI

| State | Implementasi |
|---|---|
| Loading list | `loading.tsx` + Skeleton table |
| Not found detail | `not-found.tsx` + `notFound()` |
| Error runtime | `error.tsx` (error boundary) |
| Success mutation | toast sonner + redirect |
| Validation error | inline field errors |
| Empty data | `EmptyState` |
| Delete confirm | AlertDialog |

---

## 9. Alur Fitur (User Flow)

### 9.1 Lihat daftar
1. User buka `/employees`
2. Server parse searchParams → query Prisma
3. Render table + pagination
4. User ketik search → URL update → RSC re-render (atau soft navigation)

### 9.2 Tambah karyawan
1. Klik "Tambah" → `/employees/new`
2. Isi form → submit
3. Client validasi (RHF+Zod) → Server Action validasi ulang
4. Sukses → redirect list + toast
5. Gagal unique → error di field NIP/email

### 9.3 Edit karyawan
1. Dari list/detail → `/employees/[id]/edit`
2. Prefill dari `getEmployeeById`
3. Submit update → revalidate → redirect detail

### 9.4 Hapus karyawan
1. Klik Hapus → dialog konfirmasi
2. Confirm → `deleteEmployee`
3. Redirect list + toast

### 9.5 Detail
1. `/employees/[id]`
2. Jika null → `notFound()`
3. Tampilkan semua field + tombol Edit/Hapus/Kembali

---

## 10. Environment & Konfigurasi

### 10.1 `.env.example`

```env
# Database
DATABASE_URL="file:./dev.db"

# App
NEXT_PUBLIC_APP_NAME="Pendataan Karyawan"

# Auth (fase 2)
# AUTH_SECRET=
# AUTH_URL=http://localhost:3000
```

### 10.2 Script `package.json` (disarankan)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

### 10.3 Seed data — `prisma/seed.ts`

Minimal 8–12 karyawan dummy lintas departemen & status, untuk demo filter/search.

---

## 11. Tahapan Pengembangan (Roadmap)

### Fase 0 — Project bootstrap
**Estimasi:** 0.5 hari  
**Tujuan:** repo jalan, DB siap, UI kit siap.

Checklist:
- [ ] `create-next-app` (TS, Tailwind, App Router, ESLint, `src/` opsional — dokumen ini tanpa `src/`)
- [ ] Inisialisasi Git commit awal (jika belum)
- [ ] Install Prisma, Zod, RHF, resolvers, sonner
- [ ] `prisma init` + schema Employee
- [ ] Migrasi pertama (`prisma migrate dev --name init_employee`)
- [ ] `lib/db.ts` singleton
- [ ] shadcn init + komponen dasar
- [ ] Root layout + provider toaster
- [ ] `.env` / `.env.example`
- [ ] `README.md` cara menjalankan

**Definition of Done:** `npm run dev` jalan; Prisma Studio menampilkan tabel kosong.

---

### Fase 1 — CRUD inti
**Estimasi:** 1–2 hari  
**Tujuan:** create/read/update/delete berfungsi end-to-end.

Checklist:
- [ ] Zod schema `employeeFormSchema`
- [ ] `queries.ts`: `getEmployees` (tanpa filter dulu), `getEmployeeById`
- [ ] `actions.ts`: create, update, delete
- [ ] Halaman list sederhana (table tanpa filter)
- [ ] Halaman create + `EmployeeForm`
- [ ] Halaman detail
- [ ] Halaman edit (form prefill)
- [ ] Dialog hapus
- [ ] Handling error unique NIP/email
- [ ] `revalidatePath` + redirect
- [ ] Empty state
- [ ] loading/error/not-found routes

**Definition of Done:** bisa menambah, melihat, mengubah, menghapus karyawan tanpa error; data persist setelah refresh.

---

### Fase 2 — List UX (search, filter, pagination, sort)
**Estimasi:** 0.5–1 hari  
**Tujuan:** list usable untuk data > 10 rows.

Checklist:
- [ ] Parse `searchParams` dengan `employeeListQuerySchema`
- [ ] Query Prisma: where + orderBy + skip/take + count
- [ ] `EmployeeFilters` (q, department, status)
- [ ] Debounced search ke URL
- [ ] Pagination controls
- [ ] Sort header kolom (opsional tapi disarankan)
- [ ] Seed data
- [ ] Pastikan filter + pagination komposisi benar (total mengikuti filter)

**Definition of Done:** search "nama" mempersempit hasil; ganti halaman tidak mereset filter secara tak terduga (filter di URL).

---

### Fase 3 — Hardening & fitur sekunder
**Estimasi:** 1–2 hari  
**Tujuan:** lebih aman & siap demo/production kecil.

Checklist:
- [ ] Auth.js credentials///OAuth sederhana (minimal protect semua route dashboard)
- [ ] Middleware proteksi route
- [ ] Soft delete (`deletedAt`) + default filter `deletedAt: null`
- [ ] Export CSV (Server Action atau route handler)
- [ ] Ganti provider DB ke PostgreSQL
- [ ] Validasi server-side ketat + rate limit sederhana (opsional)
- [ ] Halaman 401/403 sederhana

**Definition of Done:** tanpa login tidak bisa akses data; delete tidak langsung hilang permanen (jika soft delete dipilih).

---

### Fase 4 — Polish & deploy
**Estimasi:** 0.5–1 hari  
**Tujuan:** UX rapi, production build hijau.

Checklist:
- [ ] Skeleton loading konsisten
- [ ] Toast sukses/gagal di semua mutasi
- [ ] Responsive mobile
- [ ] Metadata/title per halaman
- [ ] `npm run build` sukses
- [ ] Deploy Vercel + env production
- [ ] Migrasi production (`prisma migrate deploy`)
- [ ] Smoke test post-deploy

**Definition of Done:** URL production bisa CRUD dengan DB cloud.

---

## 12. Urutan Implementasi File-per-File (Fase 0–1)

Urutan ini meminimalkan blocker (dependency dulu, UI kemudian).

| # | File / perintah | Keterangan |
|---|---|---|
| 1 | Scaffold Next.js | `npx create-next-app@latest .` |
| 2 | Install deps | prisma, zod, rhf, sonner, dll. |
| 3 | `prisma/schema.prisma` | model Employee |
| 4 | migrate | buat tabel |
| 5 | `lib/db.ts` | client |
| 6 | `lib/constants.ts` | DEPARTMENTS, labels |
| 7 | `lib/validations/employee.ts` | Zod |
| 8 | `lib/employees/queries.ts` | read |
| 9 | `lib/employees/actions.ts` | write |
| 10 | shadcn components | UI primitives |
| 11 | `components/employees/*` | domain UI |
| 12 | `app/(dashboard)/layout.tsx` | shell |
| 13 | `app/(dashboard)/employees/page.tsx` | list |
| 14 | `.../new/page.tsx` | create |
| 15 | `.../[id]/page.tsx` | detail |
| 16 | `.../[id]/edit/page.tsx` | edit |
| 17 | `prisma/seed.ts` | dummy data |
| 18 | loading/error/not-found | resilience UI |

---

## 13. Kontrak UI Form (field spec)

| Field | Input UI | Required | Catatan |
|---|---|---|---|
| NIP | text | ya | unique |
| Nama | text | ya | |
| Email | email | ya | unique |
| Telepon | tel | tidak | simpan `null` jika kosong |
| Departemen | select | ya | dari `DEPARTMENTS` |
| Jabatan | text | ya | |
| Status | select | ya | default ACTIVE |
| Tanggal masuk | date | ya | `z.coerce.date` |

Tombol form:
- Create: **Simpan** / **Batal** (ke list)
- Edit: **Update** / **Batal** (ke detail)

---

## 14. Error Handling Matrix

| Skenario | Deteksi | Respons UX |
|---|---|---|
| Field kosong/invalid (client) | RHF + Zod | inline error |
| Field invalid (server) | `safeParse` | return `fieldErrors` |
| NIP duplikat | Prisma `P2002` | error di field `nip` |
| Email duplikat | Prisma `P2002` | error di field `email` |
| ID tidak ditemukan (detail) | `null` query | `notFound()` |
| ID tidak ditemukan (update/delete) | count 0 / catch | toast error + redirect list |
| DB down | Prisma throw | `error.tsx` / toast generik |
| Unauthorized (fase 3) | session null | redirect login |

---

## 15. Testing Strategy

### 15.1 Manual QA checklist
- [ ] Create karyawan valid → muncul di list
- [ ] Create dengan NIP sama → error
- [ ] Create dengan email sama → error
- [ ] Edit mengubah data → detail & list ter-update
- [ ] Delete → hilang dari list
- [ ] Search by nama/NIP/email
- [ ] Filter department & status
- [ ] Pagination next/prev
- [ ] Direct URL detail ID palsu → 404
- [ ] Refresh halaman tidak hilangkan data

### 15.2 Automated (opsional, fase lanjut)
- Unit: Zod schema tests (valid/invalid cases)
- Integration: Server Actions dengan test DB
- E2E: Playwright flow CRUD utama

---

## 16. Keamanan (baseline)

Bahkan di app sederhana, terapkan:

1. **Validasi server selalu** — jangan percaya client.
2. **Prisma parameterized queries** — hindari raw SQL string concatenation.
3. **Jangan commit `.env`** — hanya `.env.example`.
4. **Auth sebelum data sensitif** (fase 3) — email/telepon karyawan = PII.
5. **CSP & headers default Next.js** — review saat production.
6. **Least privilege DB user** di production.

---

## 17. Performa

| Teknik | Penerapan |
|---|---|
| Server Components | list & detail default RSC |
| Pagination | wajib sebelum data besar |
| `revalidatePath` targeted | jangan revalidate berlebihan |
| Select kolom | opsional `select` Prisma jika query gemuk |
| Debounce search | kurangi navigasi beruntun |
| Index DB | `@unique` pada nip/email; pertimbangkan index `department`, `status` di Postgres |

---

## 18. Migrasi SQLite → PostgreSQL

Langkah ringkas:

1. Buat DB Postgres (Neon/Supabase/dll.)
2. Ubah `provider = "postgresql"` di `schema.prisma`
3. Set `DATABASE_URL` production
4. `prisma migrate deploy` (atau baseline migration baru)
5. Seed ulang jika perlu
6. Test unique constraints & date timezone

> Perhatian: SQLite dan Postgres beda perilaku case-insensitive search, tipe, dan timezone. Uji ulang filter/search.

---

## 19. Kriteria Sukses Produk (MVP)

MVP dianggap selesai jika:

1. User dapat mengelola siklus hidup data karyawan (CRUD) tanpa error blocking.
2. User dapat menemukan karyawan lewat search/filter.
3. Data aman dari input invalid berkat validasi ganda.
4. Aplikasi bisa dijalankan lokal dengan satu perintah setup terdokumentasi di README.
5. Build production (`next build`) sukses.

---

## 20. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope creep (HRIS penuh) | molor | kunci scope v1 di dokumen ini |
| Unique conflict handling kurang | UX buruk | map `P2002` ke field |
| Search case-sensitivity SQLite | hasil membingungkan | dokumentasikan; upgrade Postgres |
| Lupa auth di production | kebocoran PII | fase 3 wajib sebelum share publik |
| Amnesia revalidate | UI stale | checklist `revalidatePath` tiap mutasi |

---

## 21. Rencana Kerja Mingguan (contoh)

| Hari | Fokus |
|---|---|
| Hari 1 | Fase 0 + queries/actions skeleton + list read-only |
| Hari 2 | Create + Edit + Delete + validasi unique |
| Hari 3 | Filter, search, pagination, seed, polish UI |
| Hari 4 | (Opsional) Auth + soft delete + export |
| Hari 5 | Deploy + QA + perbaikanasi README |

---

## 22. Lampiran: Snippet Inti

### 22.1 Redirect root

```ts
// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/employees");
}
```

### 22.2 List page (kerangka)

```ts
// app/(dashboard)/employees/page.tsx
import { getEmployees } from "@/lib/employees/queries";
import { employeeListQuerySchema } from "@/lib/validations/employee";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeFilters } from "@/components/employees/employee-filters";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = employeeListQuerySchema.parse(await searchParams);
  const result = await getEmployees(params);

  return (
    <div className="space-y-6">
      <EmployeeFilters />
      <EmployeeTable data={result.data} />
      {/* Pagination memakai result.total, result.page, result.pageSize */}
    </div>
  );
}
```

### 22.3 Form action binding (kerangka)

```ts
// di client component EmployeeForm
const onSubmit = async (values: EmployeeFormValues) => {
  const result = await createEmployee(values);
  if (!result?.success) {
    // setError per field dari result.fieldErrors
    // toast error
    return;
  }
  // jika action tidak redirect, handle sukses di sini
};
```

---

## 23. Keputusan yang Sudah Dikunci untuk v1

| Topik | Keputusan |
|---|---|
| Framework | Next.js App Router |
| Mutasi | Server Actions |
| DB dev | SQLite + Prisma |
| UI | Tailwind + shadcn/ui |
| Validasi | Zod shared |
| Auth | Ditunda ke fase 3 |
| Delete | Hard delete di v1 |
| Bahasa UI | Indonesia |

---

## 24. Langkah Berikutnya

Setelah dokumen ini disetujui:

1. Eksekusi **Fase 0** (scaffold + Prisma + shadcn).
2. Langsung **Fase 1** sampai CRUD hijau.
3. Baru **Fase 2** untuk list UX.
4. Review ulang apakah auth/export diperlukan sebelum deploy publik.

---

*Dokumen ini menjadi acuan implementasi. Ubah scope lewat revisi bagian 1.3/1.4 agar keputusan tetap eksplisit.*
