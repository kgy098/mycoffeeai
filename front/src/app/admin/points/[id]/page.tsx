"use client";

import { use } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminTable from "@/components/admin/AdminTable";
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

type UserInfo = {
  id: number;
  email: string;
  display_name?: string | null;
  point_balance: number;
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

  const { data: user, isLoading: userLoading } = useGet<UserInfo>(
    ["admin-point-user", id],
    `/api/admin/users/${id}`,
    undefined,
    { enabled: !!id }
  );

  const { data: transactions = [], isLoading: txnLoading } = useGet<PointsTransaction[]>(
    ["admin-point-user-txns", id],
    `/api/admin/points/users/${id}/transactions`,
    undefined,
    { enabled: !!id }
  );

  const isLoading = userLoading || txnLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="회원 포인트 상세" description="로딩 중..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="회원 포인트 상세" description="" />
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          회원 정보를 불러오지 못했습니다.
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
        title="회원 포인트 상세"
        description={`${user.display_name || user.email} 님의 포인트 내역`}
        actions={
          <Link
            href="/admin/points"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록
          </Link>
        }
      />

      {/* 회원 정보 요약 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-xs text-white/50">회원</p>
            <p className="text-sm text-white">{user.display_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">이메일</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">포인트 잔액</p>
            <p className={`text-lg font-bold ${user.point_balance > 0 ? "text-emerald-300" : "text-white/60"}`}>
              {user.point_balance.toLocaleString()}P
            </p>
          </div>
        </div>
      </div>

      {/* 포인트 내역 테이블 */}
      <AdminTable
        columns={["내역ID", "구분", "포인트", "사유", "메모", "일시"]}
        rows={transactions.map((txn) => {
          const txnInfo = TXN_TYPE_MAP[txn.transaction_type] || {
            label: txn.transaction_type,
            tone: "warning" as const,
          };
          return [
            txn.id,
            <AdminBadge key={`${txn.id}-type`} label={txnInfo.label} tone={txnInfo.tone} />,
            <span
              key={`${txn.id}-amt`}
              className={`font-semibold ${txn.change_amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}
            >
              {txn.change_amount >= 0 ? "+" : ""}
              {txn.change_amount.toLocaleString()}P
            </span>,
            REASON_MAP[txn.reason] || txn.reason,
            txn.note
              ? txn.note.length > 30
                ? `${txn.note.slice(0, 30)}...`
                : txn.note
              : "-",
            new Date(txn.created_at).toLocaleString("ko-KR"),
          ];
        })}
        emptyMessage="포인트 내역이 없습니다."
      />
    </div>
  );
}
