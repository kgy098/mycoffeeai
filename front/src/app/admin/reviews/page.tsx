"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ReviewItem = {
  id: number;
  blend_name?: string | null;
  user_display_name?: string | null;
  rating?: number | null;
  content?: string | null;
  photo_url?: string | null;
  status: string;
  created_at: string;
};

const REVIEW_STATUS: Record<
  string,
  { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }
> = {
  "1": { label: "대기", tone: "warning" },
  "2": { label: "승인", tone: "success" },
  "3": { label: "반려", tone: "danger" },
};

export default function ReviewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [userName, setUserName] = useState("");
  const [blendName, setBlendName] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const queryKey = ["admin-reviews", statusFilter, userName, blendName, ratingFilter];

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useGet<ReviewItem[]>(
    queryKey,
    "/api/admin/reviews",
    {
      params: {
        status_filter: statusFilter || undefined,
        user_name: userName || undefined,
        blend_name: blendName || undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const changeStatus = async (e: React.MouseEvent, reviewId: number, newStatus: string) => {
    e.stopPropagation();
    const label = newStatus === "2" ? "승인" : "반려";
    if (!window.confirm(`이 리뷰를 ${label}하시겠습니까?`)) return;
    try {
      await api.put(`/api/admin/reviews/${reviewId}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="리뷰 모니터링"
        description="최근 작성된 리뷰를 관리합니다. 행을 클릭하면 상세 정보를 확인할 수 있습니다."
      />

      {/* 상태 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
            statusFilter === ""
              ? "border-white/30 bg-white/10 text-white"
              : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
          }`}
        >
          전체
        </button>
        {Object.entries(REVIEW_STATUS).map(([code, { label, tone }]) => (
          <button
            key={code}
            onClick={() => setStatusFilter(statusFilter === code ? "" : code)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition ${
              statusFilter === code
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
            }`}
          >
            <AdminBadge label={label} tone={tone} />
          </button>
        ))}
      </div>

      {/* 검색 필터 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">작성자</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="작성자 이름"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">상품명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="커피 이름"
              value={blendName}
              onChange={(e) => setBlendName(e.target.value)}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-white/60">평점</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">전체</option>
              <option value="5">5점</option>
              <option value="4">4점</option>
              <option value="3">3점</option>
              <option value="2">2점</option>
              <option value="1">1점</option>
            </select>
          </div>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setUserName("");
              setBlendName("");
              setRatingFilter("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={[
          "리뷰ID",
          "커피",
          "작성자",
          "평점",
          "내용",
          "사진",
          "작성일",
          "상태",
          "관리",
        ]}
        rows={
          isLoading
            ? []
            : reviews.map((review) => [
                review.id,
                review.blend_name || "-",
                review.user_display_name || "-",
                review.rating ? `${review.rating}점` : "-",
                review.content
                  ? review.content.length > 30
                    ? `${review.content.slice(0, 30)}...`
                    : review.content
                  : "-",
                review.photo_url ? (
                  <a
                    key={`${review.id}-photo`}
                    href={review.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-300 hover:text-sky-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    보기
                  </a>
                ) : (
                  "-"
                ),
                new Date(review.created_at).toLocaleDateString(),
                <AdminBadge
                  key={`${review.id}-status`}
                  label={REVIEW_STATUS[review.status]?.label || review.status}
                  tone={REVIEW_STATUS[review.status]?.tone || "default"}
                />,
                <div key={`${review.id}-actions`} className="flex gap-1">
                  {review.status !== "2" && (
                    <button
                      onClick={(e) => changeStatus(e, review.id, "2")}
                      className="rounded bg-emerald-600/80 px-2 py-1 text-[11px] text-white hover:bg-emerald-500"
                    >
                      승인
                    </button>
                  )}
                  {review.status !== "3" && (
                    <button
                      onClick={(e) => changeStatus(e, review.id, "3")}
                      className="rounded bg-rose-600/80 px-2 py-1 text-[11px] text-white hover:bg-rose-500"
                    >
                      반려
                    </button>
                  )}
                  <Link
                    href={`/admin/reviews/${review.id}`}
                    className="rounded border border-white/20 px-2 py-1 text-[11px] text-white/70 hover:bg-white/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    상세
                  </Link>
                </div>,
              ])
        }
        onRowClick={(rowIndex) => {
          const review = reviews[rowIndex];
          if (review) {
            router.push(`/admin/reviews/${review.id}`);
          }
        }}
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "리뷰 데이터를 불러오지 못했습니다."
            : "등록된 리뷰가 없습니다."
        }
      />
    </div>
  );
}
