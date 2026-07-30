import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format harus JPG, PNG, atau WebP" },
      { status: 415 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran maksimal 5 MB" },
      { status: 413 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ALLOWED_TYPES.some((t) =>
    t.endsWith(ext === "jpg" ? "jpeg" : ext),
  )
    ? ext
    : "jpg";

  const fileName = `${randomUUID()}.${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, fileName);

  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan file" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
