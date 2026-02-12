 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminStatCard from "@/components/admin/AdminStatCard";
 
 export default function SalesPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="판매 통계"
         description="기간별 매출과 인기 상품 지표를 확인합니다."
       />
 
       <div className="grid gap-4 md:grid-cols-3">
         <AdminStatCard label="오늘 매출" value="20,000,000원" description="실시간 집계" />
         <AdminStatCard label="구독 비중" value="35%" description="최근 30일" />
         <AdminStatCard label="단품 비중" value="65%" description="최근 30일" />
       </div>
 
       <div className="grid gap-6 xl:grid-cols-2">
         <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
           <h3 className="text-sm font-semibold text-white">기간별 매출 현황</h3>
           <div className="mt-4 h-48 rounded-lg border border-dashed border-white/20 bg-[#101010] text-center text-xs text-white/50 flex items-center justify-center">
             그래프 영역 (일간/주간/월간)
           </div>
         </div>
         <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
           <h3 className="text-sm font-semibold text-white">상품별 매출 현황</h3>
           <div className="mt-4 h-48 rounded-lg border border-dashed border-white/20 bg-[#101010] text-center text-xs text-white/50 flex items-center justify-center">
             그래프 영역 (상품별 매출)
           </div>
         </div>
       </div>
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
         <h3 className="text-sm font-semibold text-white">취향 분포도</h3>
         <div className="mt-4 h-48 rounded-lg border border-dashed border-white/20 bg-[#101010] text-center text-xs text-white/50 flex items-center justify-center">
           차트 영역 (맛 요소 분포)
         </div>
       </div>
     </div>
   );
 }
