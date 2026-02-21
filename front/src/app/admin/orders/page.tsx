"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

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

function OrdersPage() {
  const searchParams = useSearchParams();
  const initialUserName = searchParams.get("user_name") || "";

  const [orderType, setOrderType] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [userName, setUserName] = useState(initialUserName);
  const [blendName, setBlendName] = useState("");

  const {
    data: orders = [],
    isLoading,
    error,
  } = useGet<OrderResponse[]>(
    ["admin-orders", orderType, status, query, userName, blendName],
    "/api/admin/orders",
    {
      params: {
        order_type: orderType || undefined,
        status_filter: status || undefined,
        q: query || undefined,
        user_name: userName || undefined,
        blend_name: blendName || undefined,
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="주문 내역"
        description="주문 상태별로 관리하고 처리합니다."
      />

      {/* 상태값 범례 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ORDER_STATUS).map(([code, { label, tone }]) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#141414] px-3 py-1.5 text-xs text-white/80"
          >
            <AdminBadge label={label} tone={tone} />
            <span className="text-white/40">({code})</span>
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-24">
            <label className="text-xs text-white/60">구분</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="">전체</option>
              <option value="single">단품</option>
              <option value="subscription">구독</option>
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs text-white/60">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">전체</option>
              {Object.entries(ORDER_STATUS).map(([code, { label }]) => (
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
              setOrderType("");
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

      <AdminTable
        columns={["주문번호", "주문일시", "구분", "주문자", "상품명", "결제금액", "상태", "관리"]}
        rows={
          isLoading
            ? []
            : orders.map((order) => [
                order.order_number,
                new Date(order.created_at).toLocaleString(),
                order.order_type === "subscription" ? "구독" : "단품",
                order.user_name || `회원 #${order.user_id}`,
                order.items?.[0]?.blend_name ||
                  order.items?.[0]?.collection_name ||
                  "-",
                order.total_amount
                  ? `${Number(order.total_amount).toLocaleString()}원`
                  : "-",
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
          isLoading
            ? "로딩 중..."
            : error
            ? "주문 데이터를 불러오지 못했습니다."
            : "주문 내역이 없습니다."
        }
      />
    </div>
  );
}

export default function OrdersPageWrapper() {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
