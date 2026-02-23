"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SpiderChart from "@/components/SpiderChart";
import { useGet } from "@/hooks/useApi";

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

export default function CollectionAnalysisPage() {
  const { data: analysis, isLoading } = useGet<CollectionAnalysis>(
    ["admin-collections-analysis"],
    "/api/admin/collections/analysis",
    {},
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="커피 컬렉션 분석"
        description={
          analysis
            ? `총 ${analysis.total_collections}건의 컬렉션 데이터를 기반으로 분석한 결과입니다.`
            : "컬렉션 데이터를 분석합니다."
        }
      />

      {isLoading && <p className="text-sm text-white/60">로딩 중...</p>}

      {analysis && (
        <>
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
                    <div className="w-[260px] shrink-0">
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
                    <div className="w-[260px] shrink-0">
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
        </>
      )}
    </div>
  );
}
