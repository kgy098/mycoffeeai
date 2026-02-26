"use client";

import { use, useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminBadge from "@/components/admin/AdminBadge";
import { useGet, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

const PAYMENT_STATUS: Record<string, { label: string; tone: "default" | "info" | "warning" | "success" | "danger" }> = {
  "1": { label: "대기", tone: "warning" },
  "2": { label: "결제완료", tone: "success" },
  "3": { label: "결제실패", tone: "danger" },
  "4": { label: "환불완료", tone: "info" },
  "5": { label: "결제취소", tone: "danger" },
};

type PaymentDetail = {
  id: number;
  subscription_id: number | null;
  order_id: number | null;
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

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = use(params);
  const queryClient = useQueryClient();
  const { data: payment, isLoading, error } = useGet<PaymentDetail>(
    ["admin-payment", paymentId],
    `/api/admin/payments/${paymentId}`,
    undefined,
    { refetchOnWindowFocus: false }
  );

  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const currentStatus = editStatus ?? payment?.status ?? "";

  const { mutate: updateStatus, isPending: isSaving } = usePut(
    `/api/admin/payments/${paymentId}/status`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-payment", paymentId] });
        queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
        setEditStatus(null);
        setReason("");
        alert("결제 상태가 변경되었습니다.");
      },
      onError: (err: any) =>
        alert(err?.response?.data?.detail || "상태 변경에 실패했습니다."),
    }
  );

  const handleStatusChange = () => {
    if (!editStatus || editStatus === payment?.status) {
      alert("변경된 항목이 없습니다.");
      return;
    }

    const statusLabel = PAYMENT_STATUS[editStatus]?.label || editStatus;
    let confirmMsg = `결제 상태를 '${statusLabel}'(으)로 변경하시겠습니까?`;

    if (editStatus === "5") {
      confirmMsg = `결제를 취소하시겠습니까?\n\n실제 결제 취소(토스페이먼츠)가 진행됩니다.\n이 작업은 되돌릴 수 없습니다.`;
    } else if (editStatus === "4") {
      confirmMsg = `환불 처리하시겠습니까?\n\n결제 상태가 '환불완료'로 변경됩니다.`;
    }

    if (!window.confirm(confirmMsg)) return;

    updateStatus({ status: editStatus, reason: reason || undefined });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="결제/환불 상세"
        description="결제 및 환불 처리 정보를 확인하고 상태를 변경합니다."
        actions={
          <Link
            href="/admin/payments"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      {error && (
        <p className="text-sm text-rose-200">
          결제 정보를 불러오지 못했습니다.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <div>
            <p className="text-xs text-white/50">결제 ID</p>
            <p className="text-sm text-white">{payment?.id || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">결제일시</p>
            <p className="text-sm text-white">
              {payment?.created_at
                ? new Date(payment.created_at).toLocaleString()
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">주문번호</p>
            <p className="text-sm text-white">
              {payment?.order_number ? (
                <Link
                  href={`/admin/orders/${payment.order_id}`}
                  className="text-sky-200 hover:text-sky-100"
                >
                  {payment.order_number}
                </Link>
              ) : (
                "-"
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">거래 ID (PG)</p>
            <p className="text-sm text-white font-mono">{payment?.transaction_id || "-"}</p>
          </div>
          <div>
            <label className="text-xs text-white/50">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={currentStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {Object.entries(PAYMENT_STATUS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {/* 취소/환불 사유 입력 (상태가 취소 또는 환불로 변경될 때) */}
          {editStatus && ["4", "5"].includes(editStatus) && editStatus !== payment?.status && (
            <div>
              <label className="text-xs text-white/50">
                {editStatus === "5" ? "취소 사유" : "환불 사유"}
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                placeholder="사유를 입력하세요 (선택)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <div>
            <p className="text-xs text-white/50">회원</p>
            <p className="text-sm text-white">
              {payment?.user_name || (payment ? `회원 #${payment.user_id}` : "-")}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">결제수단</p>
            <p className="text-sm text-white">{payment?.payment_method || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">결제 금액</p>
            <p className="text-sm text-white">
              {payment?.amount
                ? `${Number(payment.amount).toLocaleString()}원`
                : "-"}
            </p>
          </div>
          {payment?.subscription_id && (
            <div>
              <p className="text-xs text-white/50">구독 ID</p>
              <p className="text-sm text-white">{payment.subscription_id}</p>
            </div>
          )}
          {payment?.cycle_number && (
            <div>
              <p className="text-xs text-white/50">회차</p>
              <p className="text-sm text-white">{payment.cycle_number}회차</p>
            </div>
          )}
          <div>
            <p className="text-xs text-white/50">현재 상태</p>
            <AdminBadge
              label={PAYMENT_STATUS[payment?.status || ""]?.label || payment?.status || "로딩 중"}
              tone={PAYMENT_STATUS[payment?.status || ""]?.tone || "warning"}
            />
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]"
          onClick={handleStatusChange}
          disabled={isSaving}
        >
          {isSaving ? "처리 중..." : "상태 변경 저장"}
        </button>
        <Link
          href="/admin/payments"
          className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
        >
          목록으로
        </Link>
      </div>

      {isLoading && <p className="text-xs text-white/60">로딩 중...</p>}
    </div>
  );
}
