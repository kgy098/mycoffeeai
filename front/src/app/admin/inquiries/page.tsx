"use client";

import Link from "next/link";
import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type InquiryListItem = {
  id: number;
  user_id: number;
  user_name?: string | null;
  inquiry_type: string;
  status: string;
  title?: string | null;
  message: string;
  created_at: string;
  answered_at?: string | null;
};

const INQUIRY_STATUS: Record<
  string,
  { label: string; tone: "default" | "warning" | "success" }
> = {
  pending: { label: "답변대기", tone: "warning" },
  answered: { label: "답변완료", tone: "success" },
};

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  product: "상품문의",
  order: "주문문의",
  delivery: "배송문의",
  etc: "기타",
};

export default function AdminInquiriesPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const {
    data: inquiries = [],
    isLoading,
    error,
  } = useGet<InquiryListItem[]>(
    ["admin-inquiries", statusFilter],
    "/api/admin/inquiries",
    {
      params: {
        status: statusFilter || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="1:1 문의 관리"
        description="고객 문의를 확인하고 답변합니다."
        resultCount={inquiries.length}
      />

      {/* 상태 필터 탭 */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "", label: "전체" },
          { value: "pending", label: "답변대기" },
          { value: "answered", label: "답변완료" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition ${
              statusFilter === tab.value
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 bg-[#141414] text-white/80 hover:bg-white/5"
            }`}
          >
            {tab.value ? (
              <AdminBadge
                label={tab.label}
                tone={INQUIRY_STATUS[tab.value]?.tone || "default"}
              />
            ) : (
              tab.label
            )}
          </button>
        ))}
      </div>

      <AdminTable
        columns={[
          "번호",
          "문의일시",
          "문의유형",
          "회원명",
          "제목/내용",
          "상태",
          "관리",
        ]}
        rows={
          isLoading
            ? []
            : inquiries.map((inq) => [
                inq.id,
                new Date(inq.created_at).toLocaleString(),
                INQUIRY_TYPE_LABEL[inq.inquiry_type] || inq.inquiry_type,
                inq.user_name || `회원 #${inq.user_id}`,
                inq.title || inq.message,
                <AdminBadge
                  key={`${inq.id}-status`}
                  label={
                    INQUIRY_STATUS[inq.status]?.label || inq.status
                  }
                  tone={INQUIRY_STATUS[inq.status]?.tone || "default"}
                />,
                <Link
                  key={`${inq.id}-link`}
                  href={`/admin/inquiries/${inq.id}`}
                  className="text-xs text-sky-200 hover:text-sky-100"
                >
                  상세보기
                </Link>,
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "문의 데이터를 불러오지 못했습니다."
            : "문의 내역이 없습니다."
        }
      />
    </div>
  );
}
