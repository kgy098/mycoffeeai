"use client";

import Link from "next/link";
import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

const PAYMENT_STATUS: Record<string, { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "대기", tone: "warning" },
  completed: { label: "결제완료", tone: "success" },
  failed: { label: "결제실패", tone: "danger" },
  refunded: { label: "환불완료", tone: "info" },
};

type PaymentItem = {
  id: number;
  subscription_id?: number | null;
  order_id?: number | null;
  order_number?: string | null;
  cycle_number?: number | null;
  user_id: number;
  user_name?: string | null;
  blend_name?: string | null;
  amount: number;
  status: string;
  payment_method?: string | null;
  transaction_id?: string | null;
  created_at: string;
};

export default function PaymentsPage() {
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [query, setQuery] = useState("");

  const { data: payments = [], isLoading, error } = useGet<PaymentItem[]>(
    ["admin-payments", status, userId, query],
    "/api/admin/payments",
    {
      params: {
        status_filter: status || undefined,
        user_id: userId ? Number(userId) : undefined,
        q: query || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="결제/환불 내역"
        description="결제 상태와 환불 처리를 관리합니다."
        resultCount={payments.length}
      />

      {/* 상태값 범례 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PAYMENT_STATUS).map(([code, { label, tone }]) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#141414] px-3 py-1.5 text-xs text-white/80"
          >
            <AdminBadge label={label} tone={tone} />
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-28">
            <label className="text-xs text-white/60">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">전체</option>
              {Object.entries(PAYMENT_STATUS).map(([code, { label }]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">거래번호</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="거래번호"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-white/60">회원 ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원 ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101010]">
            검색
          </button>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setStatus("");
              setUserId("");
              setQuery("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={["결제 ID", "결제일시", "유형", "주문자", "상품명", "결제수단", "결제금액", "상태", "관리"]}
        rows={
          isLoading
            ? []
            : payments.map((payment) => [
                payment.id,
                new Date(payment.created_at).toLocaleString(),
                payment.subscription_id
                  ? payment.cycle_number
                    ? `구독 ${payment.cycle_number}회차`
                    : `구독 #${payment.subscription_id}`
                  : payment.order_number || `주문 #${payment.order_id ?? "-"}`,
                payment.user_name || `회원 #${payment.user_id}`,
                payment.blend_name || "-",
                payment.payment_method || "-",
                `${Number(payment.amount).toLocaleString()}원`,
                <AdminBadge
                  key={`${payment.id}-status`}
                  label={PAYMENT_STATUS[payment.status]?.label || payment.status}
                  tone={PAYMENT_STATUS[payment.status]?.tone || "default"}
                />,
                <Link
                  key={`${payment.id}-link`}
                  href={`/admin/payments/${payment.id}`}
                  className="text-xs text-sky-200 hover:text-sky-100"
                >
                  상세보기
                </Link>,
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "결제 데이터를 불러오지 못했습니다."
            : "결제 내역이 없습니다."
        }
      />
    </div>
  );
}
