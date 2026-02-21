import OrderingComponent from "@/app/(with-header-footer)/my-coffee/components/ordering/Ordering";
import ActionSheet from "@/components/ActionSheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type OrderCardData = {
    id: number;
    orderItemId?: number;
    date: string;
    orderNumber: string;
    type: string;
    status: string;
    statusCode: string;
    productName: string;
    productDetails: string[];
    price: string;
    subscriptionId?: number;
    blendId?: number;
    blendName?: string;
    collectionId?: number;
    collectionName?: string;
};

const MenuButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="cursor-pointer size-8 border border-border-default rounded-sm flex items-center justify-center shrink-0"
    >
        <Menu className="size-5 text-action-primary" />
    </button>
);

const OrderDeliveryCard = ({ data }: { data: OrderCardData }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const isDelivered = data.statusCode === "4";
    const isCancelled = data.statusCode === "5";
    const isReturned = data.statusCode === "6";
    const isShipping = data.statusCode === "3";
    const isSingle = data.type === "단품";

    const getMenuItems = () => {
        if (isCancelled || isReturned) return [];

        const items: { label: string; href?: string }[] = [
            { label: "상품 문의", href: "/profile/contact-us-registration" },
        ];

        if (isDelivered || isShipping) {
            items.push({ label: "반품 요청" });
        } else {
            items.push({ label: "주문 취소" });
        }

        if (isDelivered && !isSingle && data.subscriptionId) {
            items.push({ label: "구독 상세", href: `/profile/manage-subscriptions/${data.subscriptionId}` });
        }

        return items;
    };

    const menuItems = getMenuItems();

    const renderButtons = () => {
        // 취소/반품 상태
        if (isCancelled || isReturned) {
            return (
                <Link
                    href={`/order-delivery/${data.id}`}
                    className="btn-action text-center block"
                >
                    반품/취소 상세
                </Link>
            );
        }

        // 배송완료 + 단품
        if (isDelivered && isSingle) {
            return (
                <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <OrderingComponent
                            title="주문하기"
                            isTooltipOpenHave={false}
                            blendId={data.blendId}
                            blendName={data.blendName}
                            collectionId={data.collectionId}
                            collectionName={data.collectionName}
                        >
                            <button className="w-full cursor-pointer py-[5px] border border-action-primary text-center text-action-primary rounded-sm font-bold text-sm leading-[20px]">
                                다시 구매하기
                            </button>
                        </OrderingComponent>
                        <Link
                            href={`/order-delivery/${data.id}`}
                            className="flex-1 py-[5px] border border-action-primary text-center text-action-primary rounded-sm font-bold text-sm leading-[20px]"
                        >
                            배송 조회
                        </Link>
                        <MenuButton onClick={() => setMenuOpen(true)} />
                    </div>
                    <Link
                        href={`/profile/write-review/${data.orderItemId || data.id}`}
                        className="btn-action text-center block"
                    >
                        리뷰 작성
                    </Link>
                </>
            );
        }

        // 배송완료 + 구독
        if (isDelivered) {
            return (
                <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <Link
                            href={`/order-delivery/${data.id}`}
                            className="flex-1 py-[5px] border border-action-primary text-center text-action-primary rounded-sm font-bold text-sm leading-[20px]"
                        >
                            배송 조회
                        </Link>
                        <MenuButton onClick={() => setMenuOpen(true)} />
                    </div>
                    <Link
                        href="/profile/reviews/history"
                        className="btn-action text-center block"
                    >
                        리뷰 보기
                    </Link>
                </>
            );
        }

        // 주문접수, 배송준비, 배송중
        return (
            <div className="flex items-center justify-between gap-2">
                <Link
                    href={`/order-delivery/${data.id}`}
                    className="btn-action text-center"
                >
                    배송 조회
                </Link>
                <MenuButton onClick={() => setMenuOpen(true)} />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl p-3 border border-border-default text-gray-0">
            {/* Header with date and order number */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold leading-[160%] text-text-secondary">
                    {data.date} | {data.orderNumber}
                </span>
                <Link
                    href={`/order-delivery/${data.id}`}
                    className="text-[10px] font-bold flex items-center gap-2"
                >
                    주문 상세보기
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
                        <path d="M1.5 10.5L6.5 6L1.5 1.5" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>

            {/* Main content card */}
            <div className="border border-border-default rounded-2xl py-3 px-4">
                {/* Status and tag row */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`${data.type === "구독" ? "bg-[#8B5E3C]" : "bg-[#C97A50]"} px-2 py-1 rounded-sm h-[24px] flex items-center justify-center`}>
                        <span className="text-xs text-white font-bold leading-[133%]">{data.type}</span>
                    </div>
                    <span className="text-sm font-bold leading-[142%]">{data.status}</span>
                </div>

                {/* Product name */}
                <h3 className="text-sm font-bold mb-[12px]">
                    {data.productName}
                </h3>

                <div className="flex items-center justify-between mb-5">
                    {/* Product details */}
                    <div className="flex items-center gap-1">
                        {data.productDetails.map((detail: string, index: number) => (
                            <span key={index} className="text-[12px] text-text-secondary flex items-center gap-1">
                                {detail}
                                {index < data.productDetails.length - 1 && (
                                    <span className="text-brand-secondary-accent-sub w-1 h-1 rounded-full flex items-center">•</span>
                                )}
                            </span>
                        ))}
                    </div>
                    {/* Price */}
                    <span className="text-sm font-bold leading-[142%]">{data.price}원</span>
                </div>

                {/* Action buttons */}
                {renderButtons()}
            </div>

            {/* Action Sheet Menu */}
            {menuItems.length > 0 && (
                <ActionSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
                    <div className="flex flex-col gap-2">
                        {menuItems.map((item, idx) =>
                            item.href ? (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="w-full btn-primary text-center"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <button
                                    key={idx}
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full btn-primary-empty"
                                >
                                    {item.label}
                                </button>
                            )
                        )}
                    </div>
                </ActionSheet>
            )}
        </div>
    );
};
export default OrderDeliveryCard;
