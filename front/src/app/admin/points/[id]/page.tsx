"use client";

import { use } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminBadge from "@/components/admin/AdminBadge";
import { useGet } from "@/hooks/useApi";

const TXN_TYPE_MAP: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  "1": { label: "적립", tone: "success" },
  "2": { label: "사용", tone: "warning" },
  "3": { label: "취소/환불", tone: "danger" },
};

const REASON_MAP: Record<string, string> = {
  "01": "회원가입",
  "02": "리뷰작성",
  "03": "구매적립",
  "04": "이벤트",
  "05": "관리자조정",
  "06": "상품구매",
  "07": "구독결제",
  "08": "환불",
  "09": "만료",
};

type PointsTransaction = {
  id: number;
  user_id: number;
  user_name?: string | null;
  change_amount: number;
  transaction_type: string;
  reason: string;
  related_id?: number | null;
  note?: string | null;
  created_at: string;
};

export default function PointDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: point, isLoading, error } = useGet<PointsTransaction>(
    ["admin-point-detail", id],
    `/api/admin/points/transactions/${id}`,
    undefined,
    { enabled: !!id }
  );

  const txnInfo = TXN_TYPE_MAP[point?.transaction_type || ""] || {
    label: point?.transaction_type || "-",
    tone: "warning" as const,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="포인트 내역 상세" description="로딩 중..." />
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="포인트 내역 상세" description="" />
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          포인트 내역을 불러오지 못했습니다.
        </div>
        <Link href="/admin/points" className="text-xs text-sky-200 hover:text-sky-100">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="포인트 내역 상세"
        description={`내역 ID: ${point.id}`}
        actions={
          <Link
            href="/admin/points"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* 기본 정보 */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <div>
            <p className="text-xs text-white/50">내역 ID</p>
            <p className="text-sm text-white">{point.id}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">회원</p>
            <p className="text-sm text-white">
              {point.user_name || `회원 #${point.user_id}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">구분</p>
            <AdminBadge label={txnInfo.label} tone={txnInfo.tone} />
          </div>
          <div>
            <p className="text-xs text-white/50">포인트</p>
            <p className={`text-sm font-semibold ${point.change_amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {point.change_amount >= 0 ? "+" : ""}
              {point.change_amount.toLocaleString()}P
            </p>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <div>
            <p className="text-xs text-white/50">사유</p>
            <p className="text-sm text-white">
              {REASON_MAP[point.reason] || point.reason}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">연관 ID</p>
            <p className="text-sm text-white">{point.related_id ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">메모</p>
            <p className="text-sm text-white">{point.note || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">일시</p>
            <p className="text-sm text-white">
              {new Date(point.created_at).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
