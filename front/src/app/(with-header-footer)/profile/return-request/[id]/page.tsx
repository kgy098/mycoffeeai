"use client";

import ActionSheet from "@/components/ActionSheet";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGet } from "@/hooks/useApi";
import { api } from "@/lib/api";

const RETURN_REASONS = [
    { value: "change_mind", label: "단순 변심" },
    { value: "wrong_order", label: "주문 실수" },
    { value: "defective", label: "파손/불량" },
    { value: "wrong_delivery", label: "오배송 및 지연" },
];

const ReturnRequest = () => {
    const [returnReason, setReturnReason] = useState("");
    const [returnContent, setReturnContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [imageCount, setImageCount] = useState(0);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const maxImages = 3;
    const router = useRouter();
    const params = useParams();
    const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

    const { data: order } = useGet<any>(
        ["order-detail", orderId],
        `/api/orders/${orderId}`,
        {},
        { enabled: !!orderId }
    );

    const canSubmit = returnReason && returnContent.trim().length > 0;

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const toUpload = Array.from(files).slice(0, maxImages - imageCount);
        setIsUploadingImage(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of toUpload) {
                const formData = new FormData();
                formData.append("file", file);
                const response = await api.post<{ url: string }>("/api/uploads/image", formData);
                uploadedUrls.push(response.data.url);
            }
            setImages(prev => [...prev, ...uploadedUrls]);
            setImageCount(prev => prev + uploadedUrls.length);
        } catch {
            alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsUploadingImage(false);
            event.target.value = "";
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageCount(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setConfirmModalOpen(false);
        setIsSubmitting(true);
        try {
            await api.put(`/api/orders/${orderId}/return`, {
                return_reason: returnReason,
                return_content: returnContent.trim(),
                return_photos: images.length > 0 ? images : null,
            });
            setCompleteModalOpen(true);
        } catch (err: any) {
            alert(err?.response?.data?.detail || "반품 신청에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!order) {
        return (
            <div className="p-4 text-gray-0">
                <div className="bg-white rounded-2xl px-4 py-6 border border-border-default text-center text-text-secondary">
                    주문 정보를 불러오는 중...
                </div>
            </div>
        );
    }

    const firstItem = order.items?.[0];

    return (
        <div className="p-4 text-gray-0 flex flex-col h-full">
            {/* 상품 정보 */}
            <div className="bg-white rounded-2xl p-4 border border-border-default mb-4">
                <h3 className="text-sm font-bold leading-[20px] mb-1">
                    {firstItem?.blend_name || "상품명 없음"}
                </h3>
                <p className="text-xs text-text-secondary">
                    주문번호: {order.order_number}
                </p>
                {order.total_amount && (
                    <p className="text-sm font-bold mt-2">
                        {Number(order.total_amount).toLocaleString()}원
                    </p>
                )}
            </div>

            {/* 반품 사유 선택 */}
            <h3 className="text-sm font-bold leading-[20px] mb-2">반품 사유를 선택해주세요.</h3>
            <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="mb-4 bg-white border border-[#E6E6E6] text-gray-0 text-sm rounded-lg focus:outline-none focus:ring-[#A45F37] focus:border-[#A45F37] block w-full py-2.5 px-4"
            >
                <option value="">선택해주세요</option>
                {RETURN_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                        {reason.label}
                    </option>
                ))}
            </select>

            {/* 상세 사유 */}
            <h3 className="text-sm font-bold leading-[20px] mb-2">상세 사유를 입력해주세요.</h3>
            <textarea
                rows={6}
                maxLength={300}
                value={returnContent}
                onChange={(e) => setReturnContent(e.target.value)}
                className="mb-1 bg-white placeholder:text-[#6E6E6E] placeholder:font-normal font-bold border border-[#E6E6E6] text-gray-0 text-[12px] rounded-lg focus:outline-none focus:ring-[#A45F37] focus:border-[#A45F37] block w-full py-2.5 px-4"
                placeholder="반품 사유를 상세히 입력해주세요."
            />
            <p className="text-xs text-text-secondary text-right mb-4">{returnContent.length}/300</p>

            {/* 사진 추가 */}
            <div className="mb-6">
                <label
                    htmlFor="return-image-upload"
                    className={`flex items-center justify-center gap-2 h-15 border border-dashed border-action-primary rounded-lg p-3 text-center mb-4 bg-action-secondary ${(imageCount >= maxImages || isUploadingImage) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                        <path d="M14.497 4C14.8578 3.99999 15.2119 4.09759 15.5217 4.28244C15.8316 4.46729 16.0856 4.73251 16.257 5.05L16.743 5.95C16.9144 6.26749 17.1684 6.53271 17.4783 6.71756C17.7881 6.90241 18.1422 7.00001 18.503 7H20.5C21.0304 7 21.5391 7.21071 21.9142 7.58579C22.2893 7.96086 22.5 8.46957 22.5 9V18C22.5 18.5304 22.2893 19.0391 21.9142 19.4142C21.5391 19.7893 21.0304 20 20.5 20H4.5C3.96957 20 3.46086 19.7893 3.08579 19.4142C2.71071 19.0391 2.5 18.5304 2.5 18V9C2.5 8.46957 2.71071 7.96086 3.08579 7.58579C3.46086 7.21071 3.96957 7 4.5 7H6.497C6.85742 7.00002 7.21115 6.90264 7.52078 6.71817C7.83041 6.53369 8.08444 6.26897 8.256 5.952L8.745 5.048C8.91656 4.73103 9.17059 4.46631 9.48022 4.28183C9.78985 4.09736 10.1436 3.99998 10.504 4H14.497Z" stroke="#62402D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.5 16C14.1569 16 15.5 14.6569 15.5 13C15.5 11.3431 14.1569 10 12.5 10C10.8431 10 9.5 11.3431 9.5 13C9.5 14.6569 10.8431 16 12.5 16Z" stroke="#62402D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-action-primary">{isUploadingImage ? "업로드 중..." : `사진 추가 (${imageCount} / ${maxImages})`}</p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="return-image-upload"
                        disabled={imageCount >= maxImages || isUploadingImage}
                    />
                </label>

                {/* Image preview grid */}
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: maxImages }).map((_, index) => (
                        <div key={index} className="relative">
                            {images[index] ? (
                                <div className="relative">
                                    <img
                                        src={images[index]}
                                        alt={`반품 사진 ${index + 1}`}
                                        className="w-full h-25 object-cover rounded-2xl"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 w-6 h-6 p-1 cursor-pointer rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                        style={{
                                            borderRadius: '100px',
                                            background: 'rgba(255, 255, 255, 0.10)',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <g clipPath="url(#clip0_return)">
                                                <path d="M8.00016 14.6673C11.6821 14.6673 14.6668 11.6825 14.6668 8.00065C14.6668 4.31875 11.6821 1.33398 8.00016 1.33398C4.31826 1.33398 1.3335 4.31875 1.3335 8.00065C1.3335 11.6825 4.31826 14.6673 8.00016 14.6673Z" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M10 6L6 10" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M6 6L10 10" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_return">
                                                    <rect width="16" height="16" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-25 border border-dashed border-border-default rounded-2xl flex items-center justify-center bg-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M13.997 4C14.3578 3.99999 14.7119 4.09759 15.0217 4.28244C15.3316 4.46729 15.5856 4.73251 15.757 5.05L16.243 5.95C16.4144 6.26749 16.6684 6.53271 16.9783 6.71756C17.2881 6.90241 17.6422 7.00001 18.003 7H20C20.5304 7 21.0391 7.21071 21.4142 7.58579C21.7893 7.96086 22 8.46957 22 9V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V9C2 8.46957 2.21071 7.96086 2.58579 7.58579C2.96086 7.21071 3.46957 7 4 7H5.997C6.35742 7.00002 6.71115 6.90264 7.02078 6.71817C7.33041 6.53369 7.58444 6.26897 7.756 5.952L8.245 5.048C8.41656 4.73103 8.67059 4.46631 8.98022 4.28183C9.28985 4.09736 9.64358 3.99998 10.004 4H13.997Z" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" stroke="#B3B3B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 반품 신청 버튼 */}
            <button
                className="w-full mt-auto btn-primary"
                disabled={!canSubmit || isSubmitting || isUploadingImage}
                onClick={() => setConfirmModalOpen(true)}
            >
                {isSubmitting ? "신청 중..." : "반품 신청하기"}
            </button>

            {/* 확인 모달 */}
            <ActionSheet
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
            >
                <div className="text-center">
                    <p className="text-base font-bold text-gray-0 mb-6 leading-[20px]">
                        반품을 신청하시겠습니까?
                    </p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleSubmit}
                            className="w-full btn-primary"
                        >
                            반품 신청
                        </button>
                        <button
                            onClick={() => setConfirmModalOpen(false)}
                            className="w-full btn-primary-empty border border-action-primary text-action-primary"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </ActionSheet>

            {/* 완료 모달 */}
            <ActionSheet
                isOpen={completeModalOpen}
                onClose={() => setCompleteModalOpen(false)}
            >
                <div className="text-center">
                    <p className="text-base font-bold text-gray-0 mb-6 leading-[20px]">
                        반품 신청이 완료되었습니다.
                    </p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => {
                                setCompleteModalOpen(false);
                                router.push("/profile/order-delivery");
                            }}
                            className="w-full btn-primary"
                        >
                            주문/배송 조회로 이동
                        </button>
                        <button
                            onClick={() => {
                                setCompleteModalOpen(false);
                                router.back();
                            }}
                            className="w-full btn-primary-empty border border-action-primary text-action-primary"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </ActionSheet>
        </div>
    );
};

export default ReturnRequest;
