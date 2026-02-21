"use client";

import { Suspense, useState } from "react";
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

  const [userId, setUserId] = useState(initialUserId);
  const [userName, setUserName] = useState(initialUserName);
  const [blendName, setBlendName] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const { data: collections = [], isLoading, error } = useGet<CollectionItem[]>(
    ["admin-collections", userId, userName, blendName, createdFrom, createdTo],
    "/api/admin/collections",
    {
      params: {
        user_id: userId ? Number(userId) : undefined,
        user_name: userName || undefined,
        blend_name: blendName || undefined,
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
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="text-xs text-white/60">회원 ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="회원 ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">회원 이름</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="회원 이름"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">커피 상품명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="블렌드 이름"
              value={blendName}
              onChange={(e) => setBlendName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">등록일 (시작)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">등록일 (종료)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#101010]">
            조회
          </button>
          <button
            className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
            onClick={() => {
              setUserId("");
              setUserName("");
              setBlendName("");
              setCreatedFrom("");
              setCreatedTo("");
            }}
          >
            검색 초기화
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
