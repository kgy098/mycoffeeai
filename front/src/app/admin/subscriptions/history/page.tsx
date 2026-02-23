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

type CyclePaginated = {
  items: CycleListItem[];
  total: number;
};

const PAGE_SIZE = 10;

export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const [nameInput, setNameInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useGet<CyclePaginated>(
    ["admin-subscription-history", appliedStatus, appliedName, appliedStartDate, appliedEndDate, page],
    "/api/admin/subscriptions/history",
    {
      params: {
        status: appliedStatus || undefined,
        q: appliedName || undefined,
        start_date: appliedStartDate || undefined,
        end_date: appliedEndDate || undefined,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const cycles = data?.items ?? [];
  const total = data?.total ?? 0;

  const applyFilter = () => {
    setAppliedName(nameInput.trim());
    setAppliedStatus(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="구독 내역"
        description="모든 구독의 회차별 내역을 확인합니다."
        resultCount={total}
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">회원명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원명"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
          <div className="w-28">
            <label className="text-xs text-white/60">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
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
          <div className="w-32">
            <label className="text-xs text-white/60">시작일</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-white/60">종료일</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101010]"
            onClick={applyFilter}
          >
            검색
          </button>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setNameInput("");
              setAppliedName("");
              setStatusFilter("");
              setAppliedStatus("");
              setStartDate("");
              setAppliedStartDate("");
              setEndDate("");
              setAppliedEndDate("");
              setPage(0);
            }}
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
        totalItems={total}
        currentPage={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
