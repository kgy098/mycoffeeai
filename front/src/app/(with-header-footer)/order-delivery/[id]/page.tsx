"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useGet, usePut } from "@/hooks/useApi";
import { useHeaderStore } from "@/stores/header-store";
import Alert from "@/components/Alert";

const OrderDeliveryDetail = () => {
  const params = useParams();
  const orderId = params?.id ? Number(params.id) : null;
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "주문 상세",
      showBackButton: true,
    });
  }, [setHeader]);

  const { data: order, refetch } = useGet<any>(
    ["order-detail", orderId],
    orderId ? `/api/orders/${orderId}` : "/api/orders/0",
    {},
    { enabled: !!orderId }
  );

  const [trackingInput, setTrackingInput] = useState("");
  const [showTrackingAlert, setShowTrackingAlert] = useState(false);

  useEffect(() => {
    if (order?.tracking_number) {
      setTrackingInput(order.tracking_number);
    }
  }, [order?.tracking_number]);

  const { mutate: updateTracking, isPending: isTrackingPending } = usePut(
    orderId ? `/api/orders/${orderId}/tracking` : "",
    {
      onSuccess: () => {
        setShowTrackingAlert(true);
        refetch();
      },
    }
  );

  const statusLabel = useMemo(() => {
    const statusMap: Record<string, string> = {
      "1": "주문 접수",
      "2": "배송 준비",
      "3": "배송중",
      "4": "배송 완료",
      "5": "취소",
      "6": "반품",
    };
    return statusMap[order?.status] || order?.status || "";
  }, [order?.status]);

  if (!orderId) {
    return <div className="p-4 text-sm text-text-secondary">주문 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-lg p-3 border border-border-default">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">주문번호</p>
            <p className="text-sm font-bold">{order?.order_number || "-"}</p>
          </div>
          <span className="text-sm font-bold">{statusLabel}</span>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {order?.created_at ? new Date(order.created_at).toLocaleString("ko-KR") : ""}
        </p>
      </div>

      <div className="bg-white rounded-lg p-3 border border-border-default">
        <h3 className="text-sm font-bold mb-3">상품 정보</h3>
        {(order?.items || []).map((item: any) => (
          <div key={item.id} className="border border-border-default rounded-lg p-3 mb-3 last:mb-0">
            <p className="text-xs font-bold mb-2">
              {item.collection_name || item.blend_name || "나만의 커피"}
            </p>
            <p className="text-[12px] text-text-secondary mb-2 line-clamp-2">
              {[
                item?.options?.caffeine,
                item?.options?.grind,
                item?.options?.package,
                item?.options?.weight,
                item?.quantity ? `${item.quantity}개` : null,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">판매가</span>
              <span className="font-bold">
                {item?.unit_price ? Number(item.unit_price).toLocaleString("ko-KR") : "0"}원
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-3 border border-border-default">
        <h3 className="text-sm font-bold mb-3">배송지 정보</h3>
        {order?.delivery_address ? (
          <>
            <p className="text-xs font-bold">
              {order.delivery_address.recipient_name} {order.delivery_address.phone_number}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {order.delivery_address.address_line1} {order.delivery_address.address_line2 || ""}
            </p>
          </>
        ) : (
          <p className="text-xs text-text-secondary">배송지 정보가 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg p-3 border border-border-default">
        <h3 className="text-sm font-bold mb-3">배송 정보</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="송장번호 입력"
            className="flex-1 border border-border-default rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-action-primary"
          />
          <button
            onClick={() => {
              if (!trackingInput.trim()) return;
              updateTracking({ tracking_number: trackingInput.trim(), carrier: "hanjin" });
            }}
            disabled={isTrackingPending || !trackingInput.trim()}
            className="shrink-0 px-4 py-2 bg-[#4E2A18] text-white rounded-lg text-xs font-bold disabled:opacity-50"
          >
            {order?.tracking_number ? "수정" : "등록"}
          </button>
        </div>
        {order?.tracking_number && (
          <p className="text-[11px] text-text-secondary mt-2">
            택배사: 한진택배 | 송장번호: {order.tracking_number}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg p-3 border border-border-default">
        <h3 className="text-sm font-bold mb-3">결제 정보</h3>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-text-secondary">상품금액</span>
          <span className="font-bold">
            {order?.total_amount ? Number(order.total_amount).toLocaleString("ko-KR") : "0"}원
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">배송비</span>
          <span className="font-bold">
            {order?.delivery_fee ? Number(order.delivery_fee).toLocaleString("ko-KR") : "0"}원
          </span>
        </div>
      </div>
      <Alert
        isOpen={showTrackingAlert}
        onClose={() => setShowTrackingAlert(false)}
        message="송장번호가 등록되었습니다."
      />
    </div>
  );
};

export default OrderDeliveryDetail;
