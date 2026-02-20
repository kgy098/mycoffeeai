"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { api } from "@/lib/api";

export default function AdminBannerNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [desc, setDesc] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const bannerUrlRef = useRef(bannerUrl);
  useEffect(() => {
    bannerUrlRef.current = bannerUrl;
  }, [bannerUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const urlToSend = (bannerUrlRef.current || bannerUrl || "").trim() || null;
    setIsSubmitting(true);
    try {
      await api.post("/api/admin/banners", {
        title: title.trim() || null,
        comment: comment.trim() || null,
        desc: desc.trim() || null,
        banner_url: urlToSend,
        is_visible: isVisible,
        sort_order: sortOrder,
      });
      router.replace("/admin/banners");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="배너 등록"
        description="메인 배너를 등록합니다."
        actions={
          <Link
            href="/admin/banners"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            목록으로
          </Link>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-[#141414] p-6">
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">제목 (부제)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="예: 앱 출시 이벤트"
          />
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5">한줄평 (comment)</label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="짧은 문구"
          />
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5">설명 (desc)</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="상세 설명"
          />
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5">노출 순서</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
            min={0}
          />
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-1.5">배너 이미지</label>
          <p className="text-xs text-amber-200/90 mb-1.5">
            권장 이미지 크기: 가로 800px × 세로 400px (비율 2:1)
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white file:mr-2 file:rounded file:border-0 file:bg-white/20 file:px-3 file:py-1 file:text-sm file:text-white"
              disabled={isUploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setIsUploading(true);
                setError("");
                try {
                  const form = new FormData();
                  form.append("file", f);
                  const res = await api.post<{ url: string }>("/api/uploads/banner", form);
                  setBannerUrl(res.data.url);
                } catch (err: any) {
                  setError(err?.message ?? "이미지 업로드에 실패했습니다.");
                } finally {
                  setIsUploading(false);
                  e.target.value = "";
                }
              }}
            />
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="또는 이미지 URL 입력 (파일 업로드 시 자동 입력)"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isVisible"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="rounded border-white/20 bg-white/5"
          />
          <label htmlFor="isVisible" className="text-sm text-white/80">
            메인에 노출
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010] hover:bg-white/90 disabled:opacity-50"
          >
            {isUploading ? "이미지 업로드 중..." : isSubmitting ? "등록 중..." : "등록"}
          </button>
          <Link
            href="/admin/banners"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
