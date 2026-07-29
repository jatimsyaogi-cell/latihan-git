import { z } from "zod";
import { DEPARTMENTS } from "@/lib/constants";

export const employeeStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const employeeFormSchema = z.object({
  nip: z
    .string()
    .trim()
    .min(3, "NIP minimal 3 karakter")
    .max(30, "NIP maksimal 30 karakter"),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Email tidak valid"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
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

export const employeeIdSchema = z.string().min(1);

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

export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
