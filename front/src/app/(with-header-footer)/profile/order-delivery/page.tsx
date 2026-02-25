"use client";

import React, { useMemo, useState } from "react";
import OrderDeliveryCard from "./components/Card";
import Tags from "./components/Tags";
import { useGet } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";

const STATUS_MAP: Record<string, string> = {
    "1": "주문 접수",
    "2": "배송 준비",
    "3": "배송중",
    "4": "배송 완료",
    "5": "취소",
    "6": "반품",
};

const TAG_TO_STATUS: Record<string, string> = {
    "주문접수": "1",
    "배송준비": "2",
    "배송중": "3",
    "배송완료": "4",
    "취소": "5",
};

const OrderDelivery = () => {
    const [activeTag, setActiveTag] = useState("전체");

    const { data: user } = useUserStore((state) => state.user);
    const { data: orders } = useGet<any[]>(
        ["orders", user?.user_id],
        "/api/orders",
        { params: { user_id: user?.user_id } },
        { enabled: !!user?.user_id }
    );

    const orderData = useMemo(() => {
        const items = orders || [];
        return items.map((order) => {
            const firstItem = order.items?.[0];
            const details = [
                firstItem?.options?.caffeine,
                firstItem?.options?.grind,
                firstItem?.options?.package,
                firstItem?.options?.weight,
                firstItem?.quantity ? `${firstItem.quantity}개` : null,
            ].filter(Boolean);

            return {
                id: order.id,
                orderItemId: firstItem?.id,
                date: order.created_at ? new Date(order.created_at).toLocaleDateString("ko-KR") : "",
                orderNumber: order.order_number,
                type: order.order_type === "subscription" ? "구독" : "단품",
                status: STATUS_MAP[order.status] || order.status,
                statusCode: order.status,
                productName: firstItem?.collection_name || firstItem?.blend_name || "나만의 커피",
                productDetails: details,
                price: order.total_amount ? Number(order.total_amount).toLocaleString("ko-KR") : "0",
                subscriptionId: order.subscription_id,
                blendId: firstItem?.blend_id,
                blendName: firstItem?.blend_name,
                collectionId: firstItem?.collection_id,
                collectionName: firstItem?.collection_name,
                trackingNumber: order.tracking_number,
                carrier: order.carrier,
            };
        });
    }, [orders]);

    const filteredData = activeTag === "전체"
        ? orderData
        : orderData.filter(item => item.statusCode === TAG_TO_STATUS[activeTag]);

    return (
        <div>
            <Tags
                activeTag={activeTag}
                onTagChange={setActiveTag}
            />
            <div className="space-y-4 px-4 pb-6">
                {filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                        <p className="text-sm">주문 내역이 없습니다.</p>
                    </div>
                ) : (
                    filteredData.map((order) => (
                        <div key={order.id}>
                            <OrderDeliveryCard data={order} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
export default OrderDelivery;
