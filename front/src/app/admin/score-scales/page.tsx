import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";

const scales = [
  { label: "산미", description: "산뜻하고 가벼운 신맛", status: "노출" },
  { label: "단맛", description: "자연스러운 단맛과 여운", status: "노출" },
  { label: "고소함", description: "견과류의 고소한 향", status: "노출" },
  { label: "바디감", description: "묵직한 바디와 질감", status: "노출" },
  { label: "향", description: "아로마의 풍미", status: "노출" },
];

export default function ScoreScalesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="취향 분석 항목 관리"
        description="추천 알고리즘 기준이 되는 항목을 관리합니다."
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <h2 className="text-sm font-semibold text-white">항목 추가</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/60">라벨</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="예: 산미"
            />
          </div>
          <div>
            <label className="text-xs text-white/60">설명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="항목 설명을 입력하세요"
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]">
            저장
          </button>
        </div>
      </div>

      <AdminTable
        columns={["항목", "설명", "상태"]}
        rows={scales.map((scale) => [scale.label, scale.description, scale.status])}
      />
    </div>
  );
}
