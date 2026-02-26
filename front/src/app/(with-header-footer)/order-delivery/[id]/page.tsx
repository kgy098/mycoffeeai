"use client";

import React, { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGet } from "@/hooks/useApi";
import { useHeaderStore } from "@/stores/header-store";

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

  const { data: order } = useGet<any>(
    ["order-detail", orderId],
    orderId ? `/api/orders/${orderId}` : "/api/orders/0",
    {},
    { enabled: !!orderId }
  );




  const statusLabel = useMemo(() => {
    const statusMap: Record<string, string> = {
      "1": "주문 접수",
      "2": "배송 준비",
      "3": "배송중",
      "4": "배송 완료",
      "5": "취소",
      "6": "반품요청",
      "7": "반품처리중",
      "8": "반품완료",
    };
    return statusMap[order?.status] || order?.status || "";
  }, [order?.status]);

  const isReturnStatus = ["6", "7", "8"].includes(order?.status);

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

      {isReturnStatus && (
        <div className="bg-white rounded-lg p-3 border border-border-default">
          <h3 className="text-sm font-bold mb-3">반품 정보</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">반품 상태</span>
              <span className="font-bold text-red-500">{statusLabel}</span>
            </div>
            {order?.return_reason && (
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">반품 사유</span>
                <span className="font-bold">{
                  { change_mind: "단순 변심", wrong_order: "주문 실수", defective: "파손/불량", wrong_delivery: "오배송 및 지연" }[order.return_reason as string] || order.return_reason
                }</span>
              </div>
            )}
            {order?.return_content && (
              <div className="text-xs">
                <p className="text-text-secondary mb-1">상세 사유</p>
                <p className="text-xs whitespace-pre-line">{order.return_content}</p>
              </div>
            )}
            {order?.returned_at && (
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">신청일시</span>
                <span className="font-bold">{new Date(order.returned_at).toLocaleString("ko-KR")}</span>
              </div>
            )}
            {order?.return_photos && order.return_photos.length > 0 && (
              <div className="text-xs">
                <p className="text-text-secondary mb-1">첨부 사진</p>
                <div className="flex gap-2 flex-wrap">
                  {order.return_photos.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`반품 사진 ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-border-default"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
        {order?.tracking_number ? (
          <>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">택배사</span>
              <span className="font-bold">한진택배</span>
            </div>
            <div className="flex justify-between text-xs mb-3">
              <span className="text-text-secondary">송장번호</span>
              <span className="font-bold">{order.tracking_number}</span>
            </div>
            <button
              onClick={() => window.open(`https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mession=&schLang=KR&wblnumText2=${order.tracking_number}`, '_blank')}
              className="w-full py-2 bg-[#4E2A18] text-white rounded-lg text-xs font-bold"
            >
              배송조회
            </button>
          </>
        ) : (
          <p className="text-xs text-text-secondary">송장번호가 아직 등록되지 않았습니다.</p>
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
    </div>
  );
};

export default OrderDeliveryDetail;
