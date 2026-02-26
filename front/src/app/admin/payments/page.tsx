"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

const PAYMENT_STATUS: Record<string, { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }> = {
  "1": { label: "대기", tone: "warning" },
  "2": { label: "결제완료", tone: "success" },
  "3": { label: "결제실패", tone: "danger" },
  "4": { label: "환불완료", tone: "info" },
  "5": { label: "결제취소", tone: "danger" },
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

function PaymentsPage() {
  const searchParams = useSearchParams();
  const initialUserName = searchParams.get("user_name") || "";

  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [userName, setUserName] = useState(initialUserName);
  const [blendName, setBlendName] = useState("");

  const { data: payments = [], isLoading, error } = useGet<PaymentItem[]>(
    ["admin-payments", status, query, userName, blendName],
    "/api/admin/payments",
    {
      params: {
        status_filter: status || undefined,
        q: query || undefined,
        user_name: userName || undefined,
        blend_name: blendName || undefined,
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

      {/* 상태값 필터 버튼 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("")}
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
            status === ""
              ? "border-white/30 bg-white/10 text-white"
              : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
          }`}
        >
          전체
        </button>
        {Object.entries(PAYMENT_STATUS).map(([code, { label, tone }]) => (
          <button
            key={code}
            onClick={() => setStatus(status === code ? "" : code)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition ${
              status === code
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
            }`}
          >
            <AdminBadge label={label} tone={tone} />
          </button>
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
            <label className="text-xs text-white/60">주문번호</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="주문번호"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">회원 이름</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원 이름"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">상품명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="상품명"
              value={blendName}
              onChange={(e) => setBlendName(e.target.value)}
            />
          </div>
          <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101010]">
            검색
          </button>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setStatus("");
              setQuery("");
              setUserName("");
              setBlendName("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          결제 데이터를 불러오지 못했습니다. {(error as any)?.response?.data?.detail || (error as any)?.message || ""}
        </div>
      )}

      <AdminTable
        columns={["결제 ID", "결제일시", "주문번호", "주문자", "상품명", "결제수단", "결제금액", "상태", "관리"]}
        rows={
          isLoading
            ? []
            : payments.map((payment) => [
                payment.id,
                new Date(payment.created_at).toLocaleString(),
                payment.order_number || "-",
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
            : "조회된 결제/환불 내역이 없습니다. 결제가 완료된 주문이 있는지 확인해주세요."
        }
      />
    </div>
  );
}

export default function PaymentsPageWrapper() {
  return (
    <Suspense>
      <PaymentsPage />
    </Suspense>
  );
}
