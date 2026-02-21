"use client";

import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

const TXN_TYPE_MAP: Record<string, string> = {
  "1": "적립",
  "2": "사용",
  "3": "취소/환불",
  earned: "적립",
  used: "사용",
  canceled: "취소/환불",
  refunded: "취소/환불",
};

const REASON_MAP: Record<string, string> = {
  "01": "회원가입",
  "02": "리뷰작성",
  "03": "구매적립",
  "04": "이벤트",
  "05": "관리자조정",
  "06": "상품구매",
  "07": "구독결제",
  "08": "환불",
  "09": "만료",
  signup: "회원가입",
  review: "리뷰작성",
  purchase: "구매적립",
  event: "이벤트",
  admin: "관리자조정",
  order: "상품구매",
  subscription: "구독결제",
  refund: "환불",
  expiry: "만료",
};

type PointsTransaction = {
  id: number;
  user_id: number;
  user_name?: string | null;
  change_amount: number;
  transaction_type: string;
  reason: string;
  note?: string | null;
  created_at: string;
};

export default function PointsPage() {
  const [nameInput, setNameInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [txnType, setTxnType] = useState("");
  const [reasonCode, setReasonCode] = useState("");

  const { data: transactions = [], isLoading, error } = useGet<PointsTransaction[]>(
    ["admin-points", appliedName, txnType, reasonCode],
    "/api/admin/points/transactions",
    {
      params: {
        q: appliedName || undefined,
        txn_type: txnType || undefined,
        reason_code: reasonCode || undefined,
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const applyFilter = () => {
    setAppliedName(nameInput.trim());
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="포인트 관리"
        description="회원 포인트 내역을 관리합니다."
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">회원명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원명"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-white/60">구분</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={txnType}
              onChange={(event) => setTxnType(event.target.value)}
            >
              <option value="">전체</option>
              <option value="1">적립</option>
              <option value="2">사용</option>
              <option value="3">취소/환불</option>
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs text-white/60">사유</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={reasonCode}
              onChange={(event) => setReasonCode(event.target.value)}
            >
              <option value="">전체</option>
              {Object.entries(REASON_MAP).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
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
              setTxnType("");
              setReasonCode("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={["내역ID", "회원", "구분", "포인트", "사유", "일자"]}
        rows={
          isLoading
            ? []
            : transactions.map((point) => [
                point.id,
                point.user_name || `회원 #${point.user_id}`,
                <AdminBadge
                  key={`${point.id}-type`}
                  label={TXN_TYPE_MAP[point.transaction_type] || point.transaction_type}
                  tone={
                    point.transaction_type === "1"
                      ? "success"
                      : point.transaction_type === "2"
                      ? "warning"
                      : "danger"
                  }
                />,
                `${point.change_amount >= 0 ? "+" : ""}${point.change_amount.toLocaleString()}P`,
                REASON_MAP[point.reason] || point.reason,
                new Date(point.created_at).toLocaleDateString(),
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "포인트 데이터를 불러오지 못했습니다."
            : "내역이 없습니다."
        }
      />
    </div>
  );
}
