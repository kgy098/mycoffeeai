"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type SubscriptionMember = {
  id: number;
  user_id: number;
  user_name?: string | null;
  blend_name?: string | null;
  status: string;
  next_billing_date?: string | null;
};

const SUB_STATUS_MAP: Record<string, string> = {
  active: "구독중",
  paused: "일시정지",
  cancelled: "해지",
  canceled: "해지",
  expired: "만료",
  pending_payment: "결제대기",
};

const SUB_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  active: "success",
  paused: "warning",
  cancelled: "danger",
  canceled: "danger",
  expired: "default",
  pending_payment: "info",
};

function SubscriptionMembersPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user_id") || "";

  const [userId, setUserId] = useState(initialUserId);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: members = [], isLoading, error } = useGet<SubscriptionMember[]>(
    ["admin-subscription-members", userId, statusFilter],
    "/api/admin/subscriptions",
    {
      params: {
        user_id: userId ? Number(userId) : undefined,
        status: statusFilter || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="구독 회원 관리"
        description="구독 중인 회원의 상태와 일정 관리."
      />

      {/* 검색 필터 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-24">
            <label className="text-xs text-white/60">회원 ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원 ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="w-28">
            <label className="text-xs text-white/60">구독 상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">전체</option>
              <option value="active">구독중</option>
              <option value="paused">일시정지</option>
              <option value="cancelled">해지</option>
              <option value="pending_payment">결제대기</option>
            </select>
          </div>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setUserId("");
              setStatusFilter("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={["회원", "구독 상품", "주기", "다음 결제일", "상태"]}
        rows={
          isLoading
            ? []
            : members.map((member) => [
                member.user_name || `회원 #${member.user_id}`,
                member.blend_name || "-",
                "-",
                member.next_billing_date
                  ? new Date(member.next_billing_date).toLocaleDateString()
                  : "-",
                <AdminBadge
                  key={`sub-member-${member.id}`}
                  label={SUB_STATUS_MAP[member.status] || member.status}
                  tone={SUB_STATUS_TONE[member.status] || "default"}
                />,
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "구독 회원 데이터를 불러오지 못했습니다."
            : "구독 회원이 없습니다."
        }
      />
    </div>
  );
}

export default function SubscriptionMembersPageWrapper() {
  return (
    <Suspense>
      <SubscriptionMembersPage />
    </Suspense>
  );
}
