"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

const CYCLE_STATUS_MAP: Record<string, string> = {
  scheduled: "예정",
  payment_pending: "결제대기",
  paid: "결제완료",
  preparing: "배송준비",
  shipped: "배송중",
  delivered: "배송완료",
  failed: "실패",
  skipped: "건너뜀",
  cancelled: "취소",
};

const CYCLE_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  scheduled: "default",
  payment_pending: "info",
  paid: "info",
  preparing: "warning",
  shipped: "warning",
  delivered: "success",
  failed: "danger",
  skipped: "default",
  cancelled: "danger",
};

type CycleListItem = {
  id: number;
  subscription_id: number;
  cycle_number: number;
  status: string;
  scheduled_date?: string | null;
  billed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  amount?: number | null;
  note?: string | null;
  user_name?: string | null;
  blend_name?: string | null;
  subscription_status?: string | null;
};

export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: cycles = [], isLoading, error } = useGet<CycleListItem[]>(
    ["admin-subscription-history", statusFilter],
    "/api/admin/subscriptions/history",
    {
      params: {
        status: statusFilter || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="구독 내역"
        description="모든 구독의 회차별 내역을 확인합니다."
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-white/60">상태 필터</label>
            <select
              className="mt-1 block w-40 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">전체</option>
              <option value="scheduled">예정</option>
              <option value="payment_pending">결제대기</option>
              <option value="paid">결제완료</option>
              <option value="preparing">배송준비</option>
              <option value="shipped">배송중</option>
              <option value="delivered">배송완료</option>
              <option value="failed">실패</option>
              <option value="skipped">건너뜀</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
          <button
            className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
            onClick={() => setStatusFilter("")}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={["구독ID", "회원", "상품", "회차", "상태", "예정일", "결제일", "배송일", "금액"]}
        rows={
          isLoading
            ? []
            : cycles.map((item) => [
                item.subscription_id,
                item.user_name || "-",
                item.blend_name || "-",
                `${item.cycle_number}회`,
                <AdminBadge
                  key={`cycle-${item.id}`}
                  label={CYCLE_STATUS_MAP[item.status] || item.status}
                  tone={CYCLE_STATUS_TONE[item.status] || "default"}
                />,
                item.scheduled_date
                  ? new Date(item.scheduled_date).toLocaleDateString()
                  : "-",
                item.billed_at
                  ? new Date(item.billed_at).toLocaleDateString()
                  : "-",
                item.delivered_at
                  ? new Date(item.delivered_at).toLocaleDateString()
                  : item.shipped_at
                  ? new Date(item.shipped_at).toLocaleDateString()
                  : "-",
                item.amount
                  ? `${Number(item.amount).toLocaleString()}원`
                  : "-",
              ])
        }
        onRowClick={(rowIndex) => {
          const item = cycles[rowIndex];
          if (item) {
            router.push(`/admin/subscriptions/${item.subscription_id}`);
          }
        }}
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "구독 내역을 불러오지 못했습니다."
            : "구독 내역이 없습니다."
        }
      />
    </div>
  );
}
