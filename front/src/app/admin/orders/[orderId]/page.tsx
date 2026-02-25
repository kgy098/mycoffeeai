"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

const ORDER_STATUS_MAP: Record<string, string> = {
  "1": "주문접수",
  "2": "배송준비",
  "3": "배송중",
  "4": "배송완료",
  "5": "취소",
  "6": "반품",
};

type OrderItem = {
  id: number;
  blend_name?: string | null;
  collection_name?: string | null;
  quantity: number;
  unit_price?: number | null;
  options?: Record<string, any> | null;
};

type OrderDetail = {
  id: number;
  order_number: string;
  order_type: string;
  status: string;
  total_amount?: number | null;
  delivery_fee?: number | null;
  created_at: string;
  items: OrderItem[];
  delivery_address?: {
    id?: number;
    recipient_name?: string;
    phone_number?: string;
    postal_code?: string;
    address_line1?: string;
    address_line2?: string;
  } | null;
  return_reason?: string | null;
  return_content?: string | null;
  return_photos?: string[] | null;
  returned_at?: string | null;
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const queryClient = useQueryClient();
  const { data: order, isLoading, error } = useGet<OrderDetail>(
    ["admin-order", orderId],
    `/api/admin/orders/${orderId}`,
    undefined,
    { refetchOnWindowFocus: false }
  );

  const { mutate: updateOrder, isPending: isSaving } = usePut(
    `/api/admin/orders/${orderId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
        alert("저장되었습니다.");
      },
      onError: (err: any) =>
        alert(err?.response?.data?.detail || "저장에 실패했습니다."),
    }
  );

  const [editStatus, setEditStatus] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editOptions, setEditOptions] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  useEffect(() => {
    if (!order) return;
    setEditStatus(order.status);
    setEditQuantity(String(order.items?.[0]?.quantity ?? ""));
    setEditOptions(
      order.items?.[0]?.options
        ? JSON.stringify(order.items[0].options, null, 2)
        : ""
    );
    setRecipientName(order.delivery_address?.recipient_name || "");
    setRecipientPhone(order.delivery_address?.phone_number || "");
    setPostalCode(order.delivery_address?.postal_code || "");
    setAddressLine1(order.delivery_address?.address_line1 || "");
    setAddressLine2(order.delivery_address?.address_line2 || "");
  }, [order]);

  const handleSave = () => {
    if (!window.confirm("주문 정보를 변경하시겠습니까?\n변경 후 되돌릴 수 없으니 주의하세요.")) return;

    let parsedOptions: Record<string, any> | null = null;
    if (editOptions.trim()) {
      try {
        parsedOptions = JSON.parse(editOptions);
      } catch {
        alert("옵션 형식이 올바르지 않습니다. (JSON 형식)");
        return;
      }
    }

    const payload: any = {};

    if (editStatus !== order?.status) {
      payload.status = editStatus;
    }

    const firstItem = order?.items?.[0];
    if (firstItem) {
      const itemUpdate: any = { id: firstItem.id };
      if (Number(editQuantity) !== firstItem.quantity) {
        itemUpdate.quantity = Number(editQuantity);
      }
      const origOptions = JSON.stringify(firstItem.options || null);
      const newOptions = JSON.stringify(parsedOptions);
      if (origOptions !== newOptions) {
        itemUpdate.options = parsedOptions;
      }
      if (Object.keys(itemUpdate).length > 1) {
        payload.items = [itemUpdate];
      }
    }

    if (order?.delivery_address) {
      const addr = order.delivery_address;
      if (
        recipientName !== (addr.recipient_name || "") ||
        recipientPhone !== (addr.phone_number || "") ||
        postalCode !== (addr.postal_code || "") ||
        addressLine1 !== (addr.address_line1 || "") ||
        addressLine2 !== (addr.address_line2 || "")
      ) {
        payload.delivery_address = {
          recipient_name: recipientName,
          phone_number: recipientPhone,
          postal_code: postalCode,
          address_line1: addressLine1,
          address_line2: addressLine2,
        };
      }
    }

    if (Object.keys(payload).length === 0) {
      alert("변경된 항목이 없습니다.");
      return;
    }

    updateOrder(payload);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="주문 상세"
        description="주문 정보와 처리 상태를 확인하고 수정합니다."
        actions={
          <Link
            href="/admin/orders"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      {error && (
        <p className="text-sm text-rose-200">
          주문 정보를 불러오지 못했습니다.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* 주문 기본 정보 */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <div>
            <p className="text-xs text-white/50">주문번호</p>
            <p className="text-sm text-white">{order?.order_number || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">주문일시</p>
            <p className="text-sm text-white">
              {order?.created_at ? new Date(order.created_at).toLocaleString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50">판매타입</p>
            <p className="text-sm text-white">
              {order?.order_type === "subscription" ? "구독" : "단품"}
            </p>
          </div>
          <div>
            <label className="text-xs text-white/50">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {Object.entries(ORDER_STATUS_MAP).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <div>
            <p className="text-xs text-white/50">상품명</p>
            <p className="text-sm text-white">
              {order?.items?.[0]?.blend_name || order?.items?.[0]?.collection_name || "-"}
            </p>
          </div>
          <div>
            <label className="text-xs text-white/50">옵션</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80 font-mono"
              rows={3}
              placeholder='예: {"grind": "분쇄", "size": "200g"}'
              value={editOptions}
              onChange={(e) => setEditOptions(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/50">주문수량</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-white/50">결제금액</p>
            <p className="text-sm text-white">
              {order?.total_amount
                ? `${Number(order.total_amount).toLocaleString()}원`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* 배송 정보 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">배송 정보</h2>
        {isLoading ? (
          <p className="text-sm text-white/60">로딩 중...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/50">수령인</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-white/50">연락처</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-white/50">우편번호</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-white/50">주소</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50">상세주소</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 반품 정보 (반품 상태일 때만 표시) */}
      {order?.status === "6" && (
        <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">반품 정보</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-white/50">반품 사유</p>
              <p className="text-sm text-white">{order.return_reason || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">반품 신청일시</p>
              <p className="text-sm text-white">
                {order.returned_at ? new Date(order.returned_at).toLocaleString() : "-"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-white/50">상세 사유</p>
              <p className="text-sm text-white whitespace-pre-line">{order.return_content || "-"}</p>
            </div>
            {order.return_photos && order.return_photos.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs text-white/50 mb-2">첨부 사진</p>
                <div className="flex gap-2 flex-wrap">
                  {order.return_photos.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`반품 사진 ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-white/10"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "변경 저장"}
        </button>
        <Link
          href="/admin/orders"
          className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}
