"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet, usePut } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

type InquiryDetail = {
  id: number;
  user_id: number;
  user_name?: string | null;
  order_id?: number | null;
  order_item_id?: number | null;
  blend_name?: string | null;
  inquiry_type: string;
  status: string;
  title?: string | null;
  message: string;
  image_url?: string | null;
  answer?: string | null;
  created_at: string;
  answered_at?: string | null;
};

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  product: "상품문의",
  order: "주문문의",
  delivery: "배송문의",
  etc: "기타",
};

const INQUIRY_STATUS: Record<
  string,
  { label: string; tone: "default" | "warning" | "success" }
> = {
  pending: { label: "답변대기", tone: "warning" },
  answered: { label: "답변완료", tone: "success" },
};

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ inquiryId: string }>;
}) {
  const { inquiryId } = use(params);
  const queryClient = useQueryClient();

  const {
    data: inquiry,
    isLoading,
    error,
  } = useGet<InquiryDetail>(
    ["admin-inquiry", inquiryId],
    `/api/admin/inquiries/${inquiryId}`,
    undefined,
    { refetchOnWindowFocus: false }
  );

  const { mutate: submitAnswer, isPending: isSaving } = usePut(
    `/api/admin/inquiries/${inquiryId}/answer`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["admin-inquiry", inquiryId],
        });
        alert("답변이 저장되었습니다.");
      },
      onError: (err: any) =>
        alert(err?.response?.data?.detail || "답변 저장에 실패했습니다."),
    }
  );

  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    if (inquiry?.answer) {
      setAnswerText(inquiry.answer);
    }
  }, [inquiry]);

  const handleSubmitAnswer = () => {
    if (!answerText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }
    if (!window.confirm("답변을 저장하시겠습니까?")) return;
    submitAnswer({ answer: answerText });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="문의 상세"
        description="고객 문의 내용을 확인하고 답변합니다."
        actions={
          <Link
            href="/admin/inquiries"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      {error && (
        <p className="text-sm text-rose-200">
          문의 정보를 불러오지 못했습니다.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-white/60">로딩 중...</p>
      ) : (
        inquiry && (
          <>
            {/* 문의 정보 */}
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
                <div>
                  <p className="text-xs text-white/50">회원명</p>
                  <p className="text-sm text-white">
                    {inquiry.user_name || `회원 #${inquiry.user_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">문의유형</p>
                  <p className="text-sm text-white">
                    {INQUIRY_TYPE_LABEL[inquiry.inquiry_type] ||
                      inquiry.inquiry_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">문의일시</p>
                  <p className="text-sm text-white">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">상태</p>
                  <AdminBadge
                    label={
                      INQUIRY_STATUS[inquiry.status]?.label || inquiry.status
                    }
                    tone={INQUIRY_STATUS[inquiry.status]?.tone || "default"}
                  />
                </div>
                {inquiry.answered_at && (
                  <div>
                    <p className="text-xs text-white/50">답변일시</p>
                    <p className="text-sm text-white">
                      {new Date(inquiry.answered_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
                {inquiry.order_id && (
                  <div>
                    <p className="text-xs text-white/50">관련 주문</p>
                    <Link
                      href={`/admin/orders/${inquiry.order_id}`}
                      className="text-sm text-sky-200 hover:text-sky-100"
                    >
                      주문 #{inquiry.order_id} 보기
                    </Link>
                  </div>
                )}
                {inquiry.blend_name && (
                  <div>
                    <p className="text-xs text-white/50">관련 상품</p>
                    <p className="text-sm text-white">{inquiry.blend_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/50">제목</p>
                  <p className="text-sm text-white">
                    {inquiry.title || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* 문의 내용 */}
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">문의 내용</h2>
              <p className="whitespace-pre-wrap text-sm text-white/80">
                {inquiry.message}
              </p>
              {inquiry.image_url && (
                <div>
                  <p className="mb-2 text-xs text-white/50">첨부 이미지</p>
                  <img
                    src={inquiry.image_url}
                    alt="문의 첨부 이미지"
                    className="max-w-md rounded-lg border border-white/10"
                  />
                </div>
              )}
            </div>

            {/* 답변 작성 */}
            <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">
                {inquiry.answer ? "답변 내용 (수정 가능)" : "답변 작성"}
              </h2>
              <textarea
                className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white/80 placeholder-white/30"
                rows={6}
                placeholder="답변 내용을 입력하세요."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]"
                  onClick={handleSubmitAnswer}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "저장 중..."
                    : inquiry.answer
                    ? "답변 수정"
                    : "답변 저장"}
                </button>
                <Link
                  href="/admin/inquiries"
                  className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
                >
                  목록으로
                </Link>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
