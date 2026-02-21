"use client";

import { useState } from "react";
import Link from "next/link";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

const SUB_STATUS_MAP: Record<string, string> = {
  active: "구독중",
  paused: "일시정지",
  cancelled: "해지",
  expired: "만료",
  pending_payment: "결제대기",
};

const SUB_STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  active: "success",
  paused: "warning",
  cancelled: "danger",
  expired: "default",
  pending_payment: "info",
};

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

type CycleItem = {
  id: number;
  subscription_id: number;
  cycle_number: number;
  status: string;
  scheduled_date?: string | null;
  billed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  amount?: number | null;
  payment_id?: number | null;
  shipment_id?: number | null;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SubscriptionDetail = {
  id: number;
  user_id: number;
  user_name?: string | null;
  blend_id: number;
  blend_name?: string | null;
  status: string;
  start_date?: string | null;
  next_billing_date?: string | null;
  delivery_address?: {
    id?: number;
    recipient_name?: string;
    phone_number?: string;
    postal_code?: string;
    address_line1?: string;
    address_line2?: string;
  } | null;
  options?: Record<string, any> | null;
  quantity: number;
  total_cycles: number;
  current_cycle: number;
  total_amount?: number | null;
  payment_method?: string | null;
  created_at?: string | null;
  cycles: CycleItem[];
};

export default function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = useQueryClient();
  const queryKey = ["admin-subscription-detail", params.id];

  const { data: sub, isLoading, error } = useGet<SubscriptionDetail>(
    queryKey,
    `/api/admin/subscriptions/${params.id}`,
    undefined,
    { refetchOnWindowFocus: false }
  );

  const [editingCycleId, setEditingCycleId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNote, setEditNote] = useState("");

  const { mutate: updateCycle, isPending: isSaving } = usePut(
    `/api/admin/subscriptions/cycles/${editingCycleId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        setEditingCycleId(null);
        alert("저장되었습니다.");
      },
      onError: (err: any) =>
        alert(err?.response?.data?.detail || "저장에 실패했습니다."),
    }
  );

  const startEdit = (cycle: CycleItem) => {
    setEditingCycleId(cycle.id);
    setEditStatus(cycle.status);
    setEditNote(cycle.note || "");
  };

  const handleSaveCycle = () => {
    if (!editingCycleId) return;
    updateCycle({ status: editStatus, note: editNote });
  };

  const addr = sub?.delivery_address;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="구독 상세"
        description="구독 정보와 회차별 내역을 확인합니다."
        actions={
          <Link
            href="/admin/subscriptions"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      {isLoading && <p className="text-sm text-white/60">로딩 중...</p>}
      {error && <p className="text-sm text-rose-200">구독 정보를 불러오지 못했습니다.</p>}

      {sub && (
        <>
          {/* 구독 기본 정보 */}
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">구독 정보</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-white/50">구독 ID</p>
                  <p className="text-sm text-white">{sub.id}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">상태</p>
                  <AdminBadge
                    label={SUB_STATUS_MAP[sub.status] || sub.status}
                    tone={SUB_STATUS_TONE[sub.status] || "default"}
                  />
                </div>
                <div>
                  <p className="text-xs text-white/50">회원</p>
                  <p className="text-sm text-white">{sub.user_name || `회원 #${sub.user_id}`}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">상품</p>
                  <p className="text-sm text-white">{sub.blend_name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">수량</p>
                  <p className="text-sm text-white">{sub.quantity}개</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">결제금액</p>
                  <p className="text-sm text-white">
                    {sub.total_amount
                      ? `${Number(sub.total_amount).toLocaleString()}원`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">결제수단</p>
                  <p className="text-sm text-white">{sub.payment_method || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">시작일</p>
                  <p className="text-sm text-white">
                    {sub.start_date
                      ? new Date(sub.start_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">다음 결제일</p>
                  <p className="text-sm text-white">
                    {sub.next_billing_date
                      ? new Date(sub.next_billing_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">회차</p>
                  <p className="text-sm text-white">
                    {sub.total_cycles > 0
                      ? `${sub.current_cycle}/${sub.total_cycles}`
                      : `${sub.current_cycle}회 (무제한)`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">구독 등록일</p>
                  <p className="text-sm text-white">
                    {sub.created_at
                      ? new Date(sub.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">배송 정보</h2>
              {addr ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/50">수령인</p>
                    <p className="text-sm text-white">{addr.recipient_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">연락처</p>
                    <p className="text-sm text-white">{addr.phone_number || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">우편번호</p>
                    <p className="text-sm text-white">{addr.postal_code || "-"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-white/50">주소</p>
                    <p className="text-sm text-white">
                      {[addr.address_line1, addr.address_line2].filter(Boolean).join(" ") || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/60">배송지 정보가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 회차별 내역 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">
              회차별 내역 ({sub.cycles.length}건)
            </h2>

            {sub.cycles.length === 0 ? (
              <p className="text-sm text-white/60">등록된 회차 내역이 없습니다.</p>
            ) : (
              <AdminTable
                columns={["회차", "상태", "예정일", "결제일", "발송일", "배송완료일", "금액", "메모", ""]}
                rows={sub.cycles.map((cycle) => [
                  `${cycle.cycle_number}회`,
                  <AdminBadge
                    key={`cycle-status-${cycle.id}`}
                    label={CYCLE_STATUS_MAP[cycle.status] || cycle.status}
                    tone={CYCLE_STATUS_TONE[cycle.status] || "default"}
                  />,
                  cycle.scheduled_date
                    ? new Date(cycle.scheduled_date).toLocaleDateString()
                    : "-",
                  cycle.billed_at
                    ? new Date(cycle.billed_at).toLocaleString()
                    : "-",
                  cycle.shipped_at
                    ? new Date(cycle.shipped_at).toLocaleString()
                    : "-",
                  cycle.delivered_at
                    ? new Date(cycle.delivered_at).toLocaleString()
                    : "-",
                  cycle.amount
                    ? `${Number(cycle.amount).toLocaleString()}원`
                    : "-",
                  cycle.note || "-",
                  <button
                    key={`cycle-edit-${cycle.id}`}
                    className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/70 hover:bg-white/5"
                    onClick={() => startEdit(cycle)}
                  >
                    수정
                  </button>,
                ])}
              />
            )}
          </div>

          {/* 회차 수정 모달 */}
          {editingCycleId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">회차 수정</h3>
                <div>
                  <label className="text-xs text-white/50">상태</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    {Object.entries(CYCLE_STATUS_MAP).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">메모</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                    rows={3}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="관리자 메모"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
                    onClick={() => setEditingCycleId(null)}
                  >
                    취소
                  </button>
                  <button
                    className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#101010]"
                    onClick={handleSaveCycle}
                    disabled={isSaving}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
