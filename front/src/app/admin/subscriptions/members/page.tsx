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
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/60">회원 ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="회원 ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">구독 상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="paused">일시중지</option>
              <option value="canceled">해지</option>
              <option value="pending_payment">결제대기</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
            onClick={() => {
              setUserId("");
              setStatusFilter("");
            }}
          >
            검색 초기화
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
                  label={member.status}
                  tone={member.status === "active" ? "success" : "warning"}
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
