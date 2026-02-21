"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import SpiderChart from "@/components/SpiderChart";
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

type TasteProfileRank = {
  rank: number;
  aroma: number;
  acidity: number;
  sweetness: number;
  body: number;
  nuttiness: number;
  count: number;
};

type BlendRank = {
  rank: number;
  blend_id: number;
  blend_name: string;
  aroma: number;
  acidity: number;
  sweetness: number;
  body: number;
  nuttiness: number;
  count: number;
};

type CollectionAnalysis = {
  popular_profiles: TasteProfileRank[];
  popular_blends: BlendRank[];
  total_collections: number;
};

function MemberCollectionsPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("user_id") || "";
  const initialUserName = searchParams.get("user_name") || "";

  const [search, setSearch] = useState(initialUserName);
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const { data: analysis } = useGet<CollectionAnalysis>(
    ["admin-collections-analysis"],
    "/api/admin/collections/analysis",
    {},
    { refetchOnWindowFocus: false }
  );

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

      {/* 커피 컬렉션 분석 */}
      {analysis && (
        <div className="space-y-6">
          <AdminPageHeader
            title="커피 컬렉션 분석"
            description={`총 ${analysis.total_collections}건의 컬렉션 데이터를 기반으로 분석한 결과입니다.`}
          />

          {/* 가장 대중적인 취향 프로필 Top5 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
            <h3 className="text-sm font-bold text-white mb-4">가장 대중적인 취향 프로필 Top 5</h3>

            {analysis.popular_profiles.length === 0 ? (
              <p className="text-xs text-white/50">분석 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {/* 1위 레이더 차트 */}
                {analysis.popular_profiles[0] && (
                  <div className="flex items-center gap-6 rounded-lg border border-white/10 bg-[#1a1a1a] p-4">
                    <div className="w-[200px] shrink-0">
                      <SpiderChart
                        ratings={{
                          aroma: analysis.popular_profiles[0].aroma,
                          acidity: analysis.popular_profiles[0].acidity,
                          sweetness: analysis.popular_profiles[0].sweetness,
                          body: analysis.popular_profiles[0].body,
                          nuttiness: analysis.popular_profiles[0].nuttiness,
                        }}
                        setRatings={() => {}}
                        isChangable={false}
                        isClickable={false}
                        size="small"
                      />
                    </div>
                    <div>
                      <span className="inline-block rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 mb-2">
                        1위 · {analysis.popular_profiles[0].count}회
                      </span>
                      <div className="grid grid-cols-5 gap-3 text-xs text-white/70">
                        <div>향 <span className="text-white font-semibold">{analysis.popular_profiles[0].aroma}</span></div>
                        <div>산미 <span className="text-white font-semibold">{analysis.popular_profiles[0].acidity}</span></div>
                        <div>단맛 <span className="text-white font-semibold">{analysis.popular_profiles[0].sweetness}</span></div>
                        <div>바디 <span className="text-white font-semibold">{analysis.popular_profiles[0].body}</span></div>
                        <div>고소함 <span className="text-white font-semibold">{analysis.popular_profiles[0].nuttiness}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2~5위 테이블 */}
                {analysis.popular_profiles.length > 1 && (
                  <table className="w-full text-xs text-white/80">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="py-2 text-left font-medium">순위</th>
                        <th className="py-2 text-center font-medium">향</th>
                        <th className="py-2 text-center font-medium">산미</th>
                        <th className="py-2 text-center font-medium">단맛</th>
                        <th className="py-2 text-center font-medium">바디</th>
                        <th className="py-2 text-center font-medium">고소함</th>
                        <th className="py-2 text-right font-medium">횟수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.popular_profiles.slice(1).map((p) => (
                        <tr key={p.rank} className="border-b border-white/5">
                          <td className="py-2">{p.rank}위</td>
                          <td className="py-2 text-center">{p.aroma}</td>
                          <td className="py-2 text-center">{p.acidity}</td>
                          <td className="py-2 text-center">{p.sweetness}</td>
                          <td className="py-2 text-center">{p.body}</td>
                          <td className="py-2 text-center">{p.nuttiness}</td>
                          <td className="py-2 text-right">{p.count}회</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* 가장 많이 추천된 블렌드 Top5 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
            <h3 className="text-sm font-bold text-white mb-4">가장 많이 추천된 블렌드 Top 5</h3>

            {analysis.popular_blends.length === 0 ? (
              <p className="text-xs text-white/50">분석 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {/* 1위 레이더 차트 */}
                {analysis.popular_blends[0] && (
                  <div className="flex items-center gap-6 rounded-lg border border-white/10 bg-[#1a1a1a] p-4">
                    <div className="w-[200px] shrink-0">
                      <SpiderChart
                        ratings={{
                          aroma: analysis.popular_blends[0].aroma,
                          acidity: analysis.popular_blends[0].acidity,
                          sweetness: analysis.popular_blends[0].sweetness,
                          body: analysis.popular_blends[0].body,
                          nuttiness: analysis.popular_blends[0].nuttiness,
                        }}
                        setRatings={() => {}}
                        isChangable={false}
                        isClickable={false}
                        size="small"
                      />
                    </div>
                    <div>
                      <span className="inline-block rounded bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-300 mb-2">
                        1위 · {analysis.popular_blends[0].count}회 추천
                      </span>
                      <p className="text-sm font-semibold text-white mb-1">{analysis.popular_blends[0].blend_name}</p>
                      <div className="grid grid-cols-5 gap-3 text-xs text-white/70">
                        <div>향 <span className="text-white font-semibold">{analysis.popular_blends[0].aroma}</span></div>
                        <div>산미 <span className="text-white font-semibold">{analysis.popular_blends[0].acidity}</span></div>
                        <div>단맛 <span className="text-white font-semibold">{analysis.popular_blends[0].sweetness}</span></div>
                        <div>바디 <span className="text-white font-semibold">{analysis.popular_blends[0].body}</span></div>
                        <div>고소함 <span className="text-white font-semibold">{analysis.popular_blends[0].nuttiness}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2~5위 테이블 */}
                {analysis.popular_blends.length > 1 && (
                  <table className="w-full text-xs text-white/80">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="py-2 text-left font-medium">순위</th>
                        <th className="py-2 text-left font-medium">블렌드명</th>
                        <th className="py-2 text-center font-medium">향</th>
                        <th className="py-2 text-center font-medium">산미</th>
                        <th className="py-2 text-center font-medium">단맛</th>
                        <th className="py-2 text-center font-medium">바디</th>
                        <th className="py-2 text-center font-medium">고소함</th>
                        <th className="py-2 text-right font-medium">추천수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.popular_blends.slice(1).map((b) => (
                        <tr key={b.rank} className="border-b border-white/5">
                          <td className="py-2">{b.rank}위</td>
                          <td className="py-2">{b.blend_name}</td>
                          <td className="py-2 text-center">{b.aroma}</td>
                          <td className="py-2 text-center">{b.acidity}</td>
                          <td className="py-2 text-center">{b.sweetness}</td>
                          <td className="py-2 text-center">{b.body}</td>
                          <td className="py-2 text-center">{b.nuttiness}</td>
                          <td className="py-2 text-right">{b.count}회</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* 가이드 문구 */}
          <div className="rounded-xl border border-white/10 bg-[#141414] p-4 text-xs text-white/50 leading-relaxed">
            <p className="font-semibold text-white/70 mb-1">분석 가이드</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>대중적인 취향 프로필</strong>: 회원들이 입력한 맛 분석(향, 산미, 단맛, 바디, 고소함) 수치가 동일한 조합을 기준으로 가장 많이 선택된 프로필 순위입니다.</li>
              <li><strong>많이 추천된 블렌드</strong>: AI가 회원 취향 분석 결과를 바탕으로 가장 많이 추천한 블렌드 커피 순위입니다.</li>
              <li>레이더 차트의 각 축은 1~5 사이의 수치를 나타냅니다.</li>
            </ul>
          </div>
        </div>
      )}
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
