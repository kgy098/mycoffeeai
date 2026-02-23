"use client";

import { useState } from "react";
import Link from "next/link";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

/* ── 단품 배송 (주문 기반) ── */

type OrderItem = {
  id: number;
  blend_name?: string | null;
  collection_name?: string | null;
  quantity: number;
  unit_price?: number | null;
};

type OrderResponse = {
  id: number;
  order_number: string;
  order_type: string;
  status: string;
  user_id: number;
  user_name?: string | null;
  total_amount?: number | null;
  created_at: string;
  items: OrderItem[];
};

const ORDER_STATUS: Record<string, { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }> = {
  "1": { label: "주문 접수", tone: "default" },
  "2": { label: "배송 준비", tone: "info" },
  "3": { label: "배송중", tone: "warning" },
  "4": { label: "배송 완료", tone: "success" },
  "5": { label: "취소", tone: "danger" },
  "6": { label: "반품", tone: "danger" },
};

/* ── 구독 배송 (subscription_cycles 기반) ── */

type CycleItem = {
  id: number;
  subscription_id: number;
  cycle_number: number;
  user_id: number;
  user_name?: string | null;
  blend_name?: string | null;
  status: string;
  scheduled_date?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  amount?: number | null;
  note?: string | null;
  created_at?: string | null;
};

const CYCLE_STATUS: Record<string, { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }> = {
  scheduled: { label: "예정", tone: "default" },
  payment_pending: { label: "결제대기", tone: "info" },
  paid: { label: "결제완료", tone: "info" },
  preparing: { label: "배송준비", tone: "warning" },
  shipped: { label: "배송중", tone: "warning" },
  delivered: { label: "배송완료", tone: "success" },
  failed: { label: "실패", tone: "danger" },
  skipped: { label: "건너뜀", tone: "default" },
  cancelled: { label: "취소", tone: "danger" },
};

type Tab = "single" | "subscription";

export default function ShipmentsPage() {
  const [tab, setTab] = useState<Tab>("single");

  /* ── 단품 필터 ── */
  const [singleStatus, setSingleStatus] = useState("");
  const [singleUserName, setSingleUserName] = useState("");
  const [singleBlendName, setSingleBlendName] = useState("");

  /* ── 구독 필터 ── */
  const [subStatus, setSubStatus] = useState("");
  const [subUserName, setSubUserName] = useState("");
  const [subBlendName, setSubBlendName] = useState("");

  /* ── 단품 주문 데이터 (order_type=single) ── */
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useGet<OrderResponse[]>(
    ["admin-shipments-single", singleStatus, singleUserName, singleBlendName],
    "/api/admin/orders",
    {
      params: {
        order_type: "single",
        status_filter: singleStatus || undefined,
        user_name: singleUserName || undefined,
        blend_name: singleBlendName || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  /* ── 구독 배송 데이터 (subscription_cycles) ── */
  const { data: cycles = [], isLoading: cyclesLoading, error: cyclesError } = useGet<CycleItem[]>(
    ["admin-shipments-sub", subStatus, subUserName, subBlendName],
    "/api/admin/shipments",
    {
      params: {
        status_filter: subStatus || undefined,
        user_name: subUserName || undefined,
        blend_name: subBlendName || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "single", label: "단품 배송" },
    { key: "subscription", label: "구독 배송" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="배송 현황"
        description="단품 주문과 구독 회차별 배송 상태를 관리합니다."
        resultCount={tab === "single" ? orders.length : cycles.length}
      />

      {/* 탭 */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "border-b-2 border-white text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 단품 배송 탭 ── */}
      {tab === "single" && (
        <>
          {/* 상태 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSingleStatus("")}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
                singleStatus === ""
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
              }`}
            >
              전체
            </button>
            {Object.entries(ORDER_STATUS).map(([code, { label, tone }]) => (
              <button
                key={code}
                onClick={() => setSingleStatus(singleStatus === code ? "" : code)}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition ${
                  singleStatus === code
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
                }`}
              >
                <AdminBadge label={label} tone={tone} />
              </button>
            ))}
          </div>

          {/* 검색 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[100px] flex-1">
                <label className="text-xs text-white/60">주문자</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
                  placeholder="주문자 이름"
                  value={singleUserName}
                  onChange={(e) => setSingleUserName(e.target.value)}
                />
              </div>
              <div className="min-w-[100px] flex-1">
                <label className="text-xs text-white/60">상품명</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
                  placeholder="상품명"
                  value={singleBlendName}
                  onChange={(e) => setSingleBlendName(e.target.value)}
                />
              </div>
              <button
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
                onClick={() => {
                  setSingleStatus("");
                  setSingleUserName("");
                  setSingleBlendName("");
                }}
              >
                초기화
              </button>
            </div>
          </div>

          <AdminTable
            columns={["주문번호", "주문일시", "주문자", "상품명", "결제금액", "상태", "관리"]}
            rows={
              ordersLoading
                ? []
                : orders.map((order) => [
                    order.order_number,
                    new Date(order.created_at).toLocaleString(),
                    order.user_name || `회원 #${order.user_id}`,
                    order.items?.[0]?.blend_name || order.items?.[0]?.collection_name || "-",
                    order.total_amount ? `${Number(order.total_amount).toLocaleString()}원` : "-",
                    <AdminBadge
                      key={`${order.id}-status`}
                      label={ORDER_STATUS[order.status]?.label || order.status}
                      tone={ORDER_STATUS[order.status]?.tone || "default"}
                    />,
                    <Link
                      key={`${order.id}-link`}
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-sky-200 hover:text-sky-100"
                    >
                      상세보기
                    </Link>,
                  ])
            }
            emptyMessage={
              ordersLoading
                ? "로딩 중..."
                : ordersError
                ? "단품 배송 데이터를 불러오지 못했습니다."
                : "단품 배송 내역이 없습니다."
            }
          />
        </>
      )}

      {/* ── 구독 배송 탭 ── */}
      {tab === "subscription" && (
        <>
          {/* 상태 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubStatus("")}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
                subStatus === ""
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
              }`}
            >
              전체
            </button>
            {Object.entries(CYCLE_STATUS).map(([code, { label, tone }]) => (
              <button
                key={code}
                onClick={() => setSubStatus(subStatus === code ? "" : code)}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition ${
                  subStatus === code
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
                }`}
              >
                <AdminBadge label={label} tone={tone} />
              </button>
            ))}
          </div>

          {/* 검색 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[100px] flex-1">
                <label className="text-xs text-white/60">회원명</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
                  placeholder="회원명"
                  value={subUserName}
                  onChange={(e) => setSubUserName(e.target.value)}
                />
              </div>
              <div className="min-w-[100px] flex-1">
                <label className="text-xs text-white/60">상품명</label>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
                  placeholder="상품명"
                  value={subBlendName}
                  onChange={(e) => setSubBlendName(e.target.value)}
                />
              </div>
              <button
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
                onClick={() => {
                  setSubStatus("");
                  setSubUserName("");
                  setSubBlendName("");
                }}
              >
                초기화
              </button>
            </div>
          </div>

          <AdminTable
            columns={["구독ID", "회차", "회원", "상품", "배송예정일", "상태", "금액", "배송시작", "배송완료"]}
            rows={
              cyclesLoading
                ? []
                : cycles.map((c) => [
                    c.subscription_id,
                    `${c.cycle_number}회차`,
                    c.user_name || `회원 #${c.user_id}`,
                    c.blend_name || "-",
                    c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : "-",
                    <AdminBadge
                      key={`${c.id}-status`}
                      label={CYCLE_STATUS[c.status]?.label || c.status}
                      tone={CYCLE_STATUS[c.status]?.tone || "default"}
                    />,
                    c.amount ? `${c.amount.toLocaleString()}원` : "-",
                    c.shipped_at ? new Date(c.shipped_at).toLocaleDateString() : "-",
                    c.delivered_at ? new Date(c.delivered_at).toLocaleDateString() : "-",
                  ])
            }
            emptyMessage={
              cyclesLoading
                ? "로딩 중..."
                : cyclesError
                ? "구독 배송 데이터를 불러오지 못했습니다."
                : "구독 배송 내역이 없습니다."
            }
          />
        </>
      )}
    </div>
  );
}
