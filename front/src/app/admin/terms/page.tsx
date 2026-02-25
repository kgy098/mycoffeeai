"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type TermsRow = {
  id: number;
  slug: string;
  title: string;
  is_active: boolean;
  sort_order: number;
  effective_date?: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminTermsPage() {
  const { data: rawData } = useGet<TermsRow[] | { data?: TermsRow[] }>(
    ["admin-terms"],
    "/api/admin/terms",
    { params: { limit: 200 } }
  );

  const data = Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];

  const rows = useMemo(() => {
    const items = data || [];
    return items.map((item) => {
      const updatedAt = item.updated_at
        ? new Date(item.updated_at).toLocaleDateString("ko-KR")
        : "-";
      return [
        item.id,
        item.title,
        item.slug,
        item.sort_order,
        item.is_active ? (
          <span className="text-green-400">활성</span>
        ) : (
          <span className="text-red-400">비활성</span>
        ),
        item.effective_date ?? "-",
        updatedAt,
        <Link
          key={`edit-${item.id}`}
          href={`/admin/terms/${item.id}`}
          className="text-xs text-sky-200 hover:text-sky-100"
        >
          수정
        </Link>,
      ];
    });
  }, [data]);

  return (
    <div>
      <AdminPageHeader
        title="약관 관리"
        description="서비스 약관을 등록하고 관리합니다."
        resultCount={data.length}
        actions={
          <Link
            href="/admin/terms/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
          >
            약관 등록
          </Link>
        }
      />
      <AdminTable
        columns={[
          "ID",
          "제목",
          "슬러그",
          "순서",
          "상태",
          "시행일",
          "수정일",
          "관리",
        ]}
        rows={rows}
        emptyMessage="등록된 약관이 없습니다."
      />
    </div>
  );
}
