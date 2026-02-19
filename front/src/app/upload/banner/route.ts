import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads/banners";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { detail: "파일이 없습니다." },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { detail: "이미지 파일만 업로드 가능합니다. (jpg, png, webp, gif)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { detail: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }
    const ext = path.extname(file.name) || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
      ? ext
      : ".jpg";
    const basename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, basename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    const url = `/uploads/banners/${basename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Banner upload error:", err);
    return NextResponse.json(
      { detail: "업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
