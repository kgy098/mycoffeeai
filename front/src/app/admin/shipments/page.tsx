"use client";

import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type ShipmentItem = {
  id: number;
  subscription_id: number;
  user_id: number;
  user_name?: string | null;
  blend_name?: string | null;
  tracking_number?: string | null;
  status: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
};

const SHIPMENT_STATUS: Record<
  string,
  { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }
> = {
  pending: { label: "배송준비중", tone: "default" },
  processing: { label: "배송중", tone: "warning" },
  delivered: { label: "배송완료", tone: "success" },
};

export default function ShipmentsPage() {
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [blendName, setBlendName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: shipments = [], isLoading, error } = useGet<ShipmentItem[]>(
    ["admin-shipments", status, query, trackingNumber, userName, blendName, dateFrom, dateTo],
    "/api/admin/shipments",
    {
      params: {
        status_filter: status || undefined,
        q: query || undefined,
        tracking_number: trackingNumber || undefined,
        user_name: userName || undefined,
        blend_name: blendName || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const resetFilters = () => {
    setStatus("");
    setQuery("");
    setTrackingNumber("");
    setUserName("");
    setBlendName("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="배송 관리"
        description="배송 상태를 확인하고 송장 업로드를 관리합니다."
      />

      {/* 상태값 범례 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SHIPMENT_STATUS).map(([code, { label, tone }]) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#141414] px-3 py-1.5 text-xs text-white/80"
          >
            <AdminBadge label={label} tone={tone} />
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="text-xs text-white/60">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">전체</option>
              {Object.entries(SHIPMENT_STATUS).map(([code, { label }]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">주문번호</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="주문번호"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">회원 이름</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="회원 이름"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">송장번호</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="송장번호"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">상품명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="상품명"
              value={blendName}
              onChange={(e) => setBlendName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">주문일시 (시작)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">주문일시 (종료)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#101010]">
            조회
          </button>
          <button
            className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
            onClick={resetFilters}
          >
            검색 초기화
          </button>
          <button className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70">
            운송장 일괄 업로드
          </button>
        </div>
      </div>

      <AdminTable
        columns={[
          "주문번호",
          "주문일시",
          "주문자",
          "상품명",
          "송장번호",
          "상태",
          "배송시작",
          "배송완료",
        ]}
        rows={
          isLoading
            ? []
            : shipments.map((shipment) => [
                shipment.id,
                new Date(shipment.created_at).toLocaleString(),
                shipment.user_name || `회원 #${shipment.user_id}`,
                shipment.blend_name || "-",
                shipment.tracking_number || "-",
                <AdminBadge
                  key={`${shipment.id}-status`}
                  label={
                    SHIPMENT_STATUS[shipment.status]?.label || shipment.status
                  }
                  tone={
                    SHIPMENT_STATUS[shipment.status]?.tone || "default"
                  }
                />,
                shipment.shipped_at
                  ? new Date(shipment.shipped_at).toLocaleDateString()
                  : "-",
                shipment.delivered_at
                  ? new Date(shipment.delivered_at).toLocaleDateString()
                  : "-",
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "배송 데이터를 불러오지 못했습니다."
            : "배송 내역이 없습니다."
        }
      />
    </div>
  );
}
