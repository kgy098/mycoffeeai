"use client";

import { use } from "react";
import Link from "next/link";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const REVIEW_STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  "1": { label: "대기", tone: "warning" },
  "2": { label: "승인", tone: "success" },
  "3": { label: "반려", tone: "danger" },
};

type ReviewDetail = {
  id: number;
  user_id: number;
  user_display_name?: string | null;
  user_email?: string | null;
  blend_id: number;
  blend_name?: string | null;
  blend_thumbnail_url?: string | null;
  order_item_id?: number | null;
  rating?: number | null;
  content?: string | null;
  photo_url?: string | null;
  status: string;
  points_awarded: boolean;
  moderated_by?: number | null;
  moderator_name?: string | null;
  moderated_at?: string | null;
  created_at: string;
};

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = use(params);
  const queryClient = useQueryClient();
  const queryKey = ["admin-review-detail", reviewId];

  const { data: review, isLoading, error } = useGet<ReviewDetail>(
    queryKey,
    `/api/admin/reviews/${reviewId}`,
    undefined,
    { refetchOnWindowFocus: false }
  );

  const changeStatus = async (newStatus: string) => {
    const label = newStatus === "2" ? "승인" : "반려";
    if (!window.confirm(`이 리뷰를 ${label}하시겠습니까?`)) return;
    try {
      await api.put(`/api/admin/reviews/${reviewId}/status`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      alert(`${label} 처리되었습니다.`);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "상태 변경에 실패했습니다.");
    }
  };

  const statusInfo = review ? REVIEW_STATUS[review.status] : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="리뷰 상세"
        description="리뷰 상세 정보를 확인하고 승인/반려 처리합니다."
        actions={
          <Link
            href="/admin/reviews"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      {isLoading && <p className="text-sm text-white/60">로딩 중...</p>}
      {error && <p className="text-sm text-rose-200">리뷰 정보를 불러오지 못했습니다.</p>}

      {review && (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            {/* 리뷰 기본 정보 */}
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">리뷰 정보</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/50">리뷰 ID</p>
                  <p className="text-sm text-white">{review.id}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">상태</p>
                  <AdminBadge
                    label={statusInfo?.label || review.status}
                    tone={statusInfo?.tone || "default"}
                  />
                </div>
                <div>
                  <p className="text-xs text-white/50">평점</p>
                  <p className="text-sm text-white">
                    {review.rating ? `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}점)` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">작성일</p>
                  <p className="text-sm text-white">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">포인트 지급</p>
                  <p className="text-sm text-white">
                    {review.points_awarded ? "지급 완료" : "미지급"}
                  </p>
                </div>
                {review.order_item_id && (
                  <div>
                    <p className="text-xs text-white/50">주문 상품 ID</p>
                    <p className="text-sm text-white">{review.order_item_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 작성자 / 상품 정보 */}
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">작성자 / 상품</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/50">작성자</p>
                  <p className="text-sm text-white">
                    {review.user_display_name || `회원 #${review.user_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">이메일</p>
                  <p className="text-sm text-white">{review.user_email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">상품명</p>
                  <p className="text-sm text-white">{review.blend_name || "-"}</p>
                </div>
                {review.blend_thumbnail_url && (
                  <div>
                    <p className="text-xs text-white/50">상품 이미지</p>
                    <img
                      src={review.blend_thumbnail_url}
                      alt={review.blend_name || "상품"}
                      className="mt-1 h-16 w-16 rounded-lg object-cover border border-white/10"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 리뷰 본문 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">리뷰 내용</h2>
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {review.content || "(내용 없음)"}
            </p>
            {review.photo_url && (
              <div>
                <p className="text-xs text-white/50 mb-2">첨부 사진</p>
                <a href={review.photo_url} target="_blank" rel="noreferrer">
                  <img
                    src={review.photo_url}
                    alt="리뷰 사진"
                    className="max-h-64 rounded-lg border border-white/10 object-contain"
                  />
                </a>
              </div>
            )}
          </div>

          {/* 검수 정보 */}
          {review.moderated_by && (
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">검수 정보</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/50">처리자</p>
                  <p className="text-sm text-white">{review.moderator_name || `관리자 #${review.moderated_by}`}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">처리일시</p>
                  <p className="text-sm text-white">
                    {review.moderated_at ? new Date(review.moderated_at).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 승인/반려 버튼 */}
          <div className="flex gap-2">
            {review.status !== "2" && (
              <button
                onClick={() => changeStatus("2")}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                승인
              </button>
            )}
            {review.status !== "3" && (
              <button
                onClick={() => changeStatus("3")}
                className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-500"
              >
                반려
              </button>
            )}
            <Link
              href="/admin/reviews"
              className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
            >
              목록으로
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
