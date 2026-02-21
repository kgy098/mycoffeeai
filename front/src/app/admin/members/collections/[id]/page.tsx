"use client";

import { use } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SpiderChart from "@/components/SpiderChart";
import { useGet } from "@/hooks/useApi";
import { CoffeePreferences } from "@/types/coffee";

type CollectionDetail = {
  id: number;
  collection_name?: string | null;
  personal_comment?: string | null;
  created_at: string;
  analysis_result_id?: number | null;
  blend?: {
    id: number;
    name: string;
    summary?: string;
    aroma: number;
    acidity: number;
    sweetness: number;
    body: number;
    nuttiness: number;
    thumbnail_url?: string;
  } | null;
  origins: Array<{ origin: string; pct: number }>;
  origin_summary?: string | null;
  taste_profile?: {
    aroma: number;
    acidity: number;
    sweetness: number;
    body: number;
    nuttiness: number;
  } | null;
  summary?: string | null;
};

const emptyRatings: CoffeePreferences = {
  aroma: 1,
  acidity: 1,
  sweetness: 1,
  body: 1,
  nuttiness: 1,
};

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: detail, isLoading, error } = useGet<CollectionDetail>(
    ["admin-collection-detail", id],
    `/api/collections/${id}`,
    undefined,
    { enabled: !!id }
  );

  const userRatings: CoffeePreferences = detail?.taste_profile
    ? {
        aroma: detail.taste_profile.aroma || 1,
        acidity: detail.taste_profile.acidity || 1,
        sweetness: detail.taste_profile.sweetness || 1,
        body: detail.taste_profile.body || 1,
        nuttiness: detail.taste_profile.nuttiness || 1,
      }
    : emptyRatings;

  const blendRatings: CoffeePreferences = detail?.blend
    ? {
        aroma: detail.blend.aroma || 1,
        acidity: detail.blend.acidity || 1,
        sweetness: detail.blend.sweetness || 1,
        body: detail.blend.body || 1,
        nuttiness: detail.blend.nuttiness || 1,
      }
    : emptyRatings;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="컬렉션 상세" description="로딩 중..." />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="컬렉션 상세" description="" />
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          컬렉션 데이터를 불러오지 못했습니다.
        </div>
        <Link href="/admin/members/collections" className="text-xs text-sky-200 hover:text-sky-100">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={detail.collection_name || "컬렉션 상세"}
        description={detail.blend?.name || ""}
        actions={
          <Link
            href="/admin/members/collections"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록
          </Link>
        }
      />

      {/* 기본 정보 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-xs text-white/50">컬렉션명</span>
            <p className="mt-1 text-sm text-white/90">{detail.collection_name || "-"}</p>
          </div>
          <div>
            <span className="text-xs text-white/50">등록일</span>
            <p className="mt-1 text-sm text-white/90">
              {new Date(detail.created_at).toLocaleString("ko-KR")}
            </p>
          </div>
          <div className="md:col-span-2">
            <span className="text-xs text-white/50">코멘트</span>
            <p className="mt-1 text-sm text-white/90">{detail.personal_comment || "-"}</p>
          </div>
        </div>
      </div>

      {/* 커피 정보 */}
      {detail.blend && (
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white/90">추천 커피</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-xs text-white/50">커피명</span>
              <p className="mt-1 text-sm text-white/90">{detail.blend.name}</p>
            </div>
            <div>
              <span className="text-xs text-white/50">원산지</span>
              <p className="mt-1 text-sm text-white/90">{detail.origin_summary || "-"}</p>
            </div>
            {detail.summary && (
              <div className="md:col-span-2">
                <span className="text-xs text-white/50">요약</span>
                <p className="mt-1 text-sm text-white/90">{detail.summary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 레이더 그래프 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 사용자 입력 수치 */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
          <h3 className="mb-2 text-sm font-semibold text-white/90">사용자 입력 취향</h3>
          {detail.taste_profile ? (
            <div className="flex justify-center rounded-xl bg-white p-4">
              <SpiderChart
                ratings={userRatings}
                setRatings={() => {}}
                isChangable={false}
                isClickable={false}
                size="medium"
              />
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-white/40">취향 분석 데이터가 없습니다.</p>
          )}
        </div>

        {/* 추천 커피 수치 */}
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
          <h3 className="mb-2 text-sm font-semibold text-white/90">추천 커피 프로파일</h3>
          {detail.blend ? (
            <div className="flex justify-center rounded-xl bg-white p-4">
              <SpiderChart
                ratings={blendRatings}
                setRatings={() => {}}
                isChangable={false}
                isClickable={false}
                size="medium"
              />
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-white/40">커피 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
