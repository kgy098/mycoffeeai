"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet } from "@/hooks/useApi";
import { api } from "@/lib/api";

type Blend = { id: number; name: string };

export default function AdminBannerNewPage() {
  const router = useRouter();
  const [blendId, setBlendId] = useState("");
  const [month, setMonth] = useState("");
  const [comment, setComment] = useState("");
  const [desc, setDesc] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: blendsData } = useGet<Blend[] | { data?: Blend[] }>(
    ["admin-blends-list"],
    "/api/admin/blends",
    { params: { limit: 200 } }
  );
  const blends = Array.isArray(blendsData) ? blendsData : blendsData?.data ?? [];

  useEffect(() => {
    const now = new Date();
    setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!blendId || !month) {
      setError("블렌드와 월을 선택하세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/api/admin/monthly-coffees", {
        blend_id: Number(blendId),
        month: month + "-01",
        comment: comment.trim() || null,
        desc: desc.trim() || null,
        banner_url: bannerUrl.trim() || null,
        is_visible: isVisible,
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
        description="메인 배너에 노출할 이달의 커피를 등록합니다."
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
          <label className="block text-xs text-white/60 mb-1.5">블렌드(커피 상품) *</label>
          <select
            value={blendId}
            onChange={(e) => setBlendId(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
            required
          >
            <option value="">선택</option>
            {blends.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5">노출 월 *</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
            required
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
          <label className="block text-xs text-white/60 mb-1.5">배너 이미지 URL</label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="https://..."
          />
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
            disabled={isSubmitting}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010] hover:bg-white/90 disabled:opacity-50"
          >
            {isSubmitting ? "등록 중..." : "등록"}
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
