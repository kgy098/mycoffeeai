"""Image upload routes"""
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


async def _save(file: UploadFile, upload_dir: Path, url_prefix: str) -> dict:
    if (file.content_type or "") not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다.")
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="파일 크기가 너무 큽니다. (최대 10MB)")
    os.makedirs(upload_dir, exist_ok=True)
    original = file.filename or "image.jpg"
    ext = original.rsplit(".", 1)[-1].lower() if "." in original else "jpg"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        ext = "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    with open(upload_dir / filename, "wb") as f:
        f.write(content)
    return {"url": f"/api/{url_prefix}/{filename}"}


def _serve(upload_dir: Path, filename: str) -> FileResponse:
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="잘못된 파일명입니다.")
    file_path = upload_dir / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다.")
    return FileResponse(file_path)


# ── Review images ──────────────────────────────────────────────
@router.post("/uploads/image")
async def upload_review_image(file: UploadFile = File(...)):
    return await _save(file, Path("uploads/reviews"), "uploads/image")


@router.get("/uploads/image/{filename}")
async def get_review_image(filename: str):
    return _serve(Path("uploads/reviews"), filename)


# ── Banner images ──────────────────────────────────────────────
@router.post("/uploads/banner")
async def upload_banner_image(file: UploadFile = File(...)):
    return await _save(file, Path("uploads/banners"), "uploads/banner")


@router.get("/uploads/banner/{filename}")
async def get_banner_image(filename: str):
    return _serve(Path("uploads/banners"), filename)


# ── Product (blend) thumbnail images ─────────────────────────
@router.post("/uploads/product")
async def upload_product_image(file: UploadFile = File(...)):
    return await _save(file, Path("uploads/products"), "uploads/product")


@router.get("/uploads/product/{filename}")
async def get_product_image(filename: str):
    return _serve(Path("uploads/products"), filename)
