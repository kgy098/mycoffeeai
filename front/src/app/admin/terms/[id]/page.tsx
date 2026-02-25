"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet } from "@/hooks/useApi";
import { api } from "@/lib/api";

const ToastEditor = dynamic(() => import("@/components/admin/ToastEditor"), {
  ssr: false,
  loading: () => <p className="text-white/40 py-4">에디터 로딩 중...</p>,
});

type TermsItem = {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  sort_order: number;
  effective_date?: string | null;
};

export default function AdminTermsEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: item, isLoading } = useGet<TermsItem>(
    ["admin-terms", id],
    `/api/admin/terms/${id}`,
    undefined,
    { enabled: !!id }
  );

  useEffect(() => {
    if (!item) return;
    setSlug(item.slug);
    setTitle(item.title);
    setContent(item.content);
    setIsActive(item.is_active);
    setSortOrder(item.sort_order ?? 0);
    setEffectiveDate(item.effective_date ?? "");
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!slug.trim() || !title.trim()) {
      setError("슬러그와 제목은 필수입니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/api/admin/terms/${id}`, {
        slug: slug.trim(),
        title: title.trim(),
        content,
        is_active: isActive,
        sort_order: sortOrder,
        effective_date: effectiveDate.trim() || null,
      });
      router.replace("/admin/terms");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !item) {
    return (
      <div>
        <AdminPageHeader title="약관 수정" />
        <p className="text-white/60">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="약관 수정"
        description="약관 내용을 수정합니다."
        actions={
          <Link
            href="/admin/terms"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            목록으로
          </Link>
        }
      />
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-white/10 bg-[#141414] p-6"
      >
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1.5">
              슬러그 (고유 식별자)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="예: service_terms"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1.5">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="예: 이용약관"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1.5">
              노출 순서
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none"
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1.5">
              시행일
            </label>
            <input
              type="text"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="예: 2025-01-01"
            />
          </div>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-white/20 bg-white/5"
              />
              <label htmlFor="isActive" className="text-sm text-white/80">
                활성 상태
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5">
            약관 내용
          </label>
          {content !== "" && (
            <ToastEditor
              initialValue={content}
              onChange={(html) => setContent(html)}
              height="500px"
            />
          )}
        </div>
        <div>
          <label className="block text-xs text-white/60 mb-1.5">미리보기</label>
          <div
            className="rounded-lg border border-white/10 bg-white p-4 text-sm text-black max-h-[300px] overflow-y-auto toastui-editor-contents"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010] hover:bg-white/90 disabled:opacity-50"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
          <Link
            href="/admin/terms"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
