"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

const STATUS_MAP: Record<string, string> = {
  active: "구독중",
  paused: "일시정지",
  cancelled: "해지",
  expired: "만료",
  pending_payment: "결제대기",
};

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  active: "success",
  paused: "warning",
  cancelled: "danger",
  expired: "default",
  pending_payment: "info",
};

type SubscriptionItem = {
  id: number;
  user_id: number;
  user_name?: string | null;
  blend_id: number;
  blend_name?: string | null;
  status: string;
  start_date?: string | null;
  next_billing_date?: string | null;
  total_amount?: number | null;
  quantity: number;
  total_cycles: number;
  current_cycle: number;
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: subscriptions = [], isLoading, error } = useGet<SubscriptionItem[]>(
    ["admin-subscriptions", statusFilter],
    "/api/admin/subscriptions",
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
        title="구독 관리"
        description="전체 구독 현황을 관리합니다. 행을 클릭하면 상세 정보를 확인할 수 있습니다."
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-white/60">상태 필터</label>
            <select
              className="mt-1 block w-40 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">전체</option>
              <option value="active">구독중</option>
              <option value="paused">일시정지</option>
              <option value="cancelled">해지</option>
              <option value="expired">만료</option>
              <option value="pending_payment">결제대기</option>
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
        columns={["구독ID", "회원", "상품", "수량", "회차", "다음결제일", "상태"]}
        rows={
          isLoading
            ? []
            : subscriptions.map((item) => [
                item.id,
                item.user_name || `회원 #${item.user_id}`,
                item.blend_name || "-",
                `${item.quantity}개`,
                item.total_cycles > 0
                  ? `${item.current_cycle}/${item.total_cycles}`
                  : `${item.current_cycle}회`,
                item.next_billing_date
                  ? new Date(item.next_billing_date).toLocaleDateString()
                  : "-",
                <AdminBadge
                  key={`sub-${item.id}`}
                  label={STATUS_MAP[item.status] || item.status}
                  tone={STATUS_TONE[item.status] || "default"}
                />,
              ])
        }
        onRowClick={(rowIndex) => {
          const item = subscriptions[rowIndex];
          if (item) {
            router.push(`/admin/subscriptions/${item.id}`);
          }
        }}
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "구독 데이터를 불러오지 못했습니다."
            : "구독 내역이 없습니다."
        }
      />
    </div>
  );
}
