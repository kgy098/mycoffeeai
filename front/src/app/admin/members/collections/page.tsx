"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type CollectionItem = {
  id: number;
  user_id: number;
  user_name?: string | null;
  blend_id: number;
  blend_name?: string | null;
  collection_name?: string | null;
  personal_comment?: string | null;
  created_at: string;
};


function MemberCollectionsPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user_id") || "";
  const initialUserName = searchParams.get("user_name") || "";

  const [search, setSearch] = useState(initialUserName);
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const { data: collections = [], isLoading, error } = useGet<CollectionItem[]>(
    ["admin-collections", search, createdFrom, createdTo],
    "/api/admin/collections",
    {
      params: {
        q: search || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="회원 커피 컬렉션 내역"
        description="회원들의 커피 컬렉션 저장 내역을 확인합니다."
      />

      {/* 검색 필터 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-32">
            <label className="text-xs text-white/60">등록일(시작)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-white/60">등록일(종료)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
            />
          </div>
          <div className="min-w-[120px] flex-1">
            <label className="text-xs text-white/60">검색</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원이름 또는 상품명"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101010]">
            검색
          </button>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setSearch("");
              setCreatedFrom("");
              setCreatedTo("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={[
          "ID",
          "회원",
          "커피 상품",
          "컬렉션명",
          "코멘트",
          "등록일",
          "관리",
        ]}
        rows={
          isLoading
            ? []
            : collections.map((item) => [
                item.id,
                item.user_name || `회원 #${item.user_id}`,
                item.blend_name || "-",
                item.collection_name || "-",
                item.personal_comment
                  ? item.personal_comment.length > 40
                    ? `${item.personal_comment.slice(0, 40)}...`
                    : item.personal_comment
                  : "-",
                formatDate(item.created_at),
                <Link
                  key={`${item.id}-link`}
                  href={`/admin/members/collections/${item.id}`}
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
            ? "컬렉션 데이터를 불러오지 못했습니다."
            : "커피 컬렉션 내역이 없습니다."
        }
      />
    </div>
  );
}

export default function MemberCollectionsPageWrapper() {
  return (
    <Suspense>
      <MemberCollectionsPage />
    </Suspense>
  );
}
