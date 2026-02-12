 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const shipments = [
   {
     orderId: "20260125202020",
     type: "단품",
     customer: "홍길동",
     invoice: "20260125202020",
     product: "벨벳",
     status: "배송완료",
     startAt: "2026-01-15",
     endAt: "2026-01-15",
   },
   {
     orderId: "20260125202021",
     type: "구독",
     customer: "변사또",
     invoice: "20260125202020",
     product: "벨벳",
     status: "배송중",
     startAt: "2026-01-15",
     endAt: "2026-01-15",
   },
   {
     orderId: "20260125202022",
     type: "구독",
     customer: "홍길동",
     invoice: "20260125202020",
     product: "벨벳",
     status: "배송준비중",
     startAt: "2026-01-15",
     endAt: "-",
   },
 ];
 
 export default function ShipmentsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="배송 관리"
         description="배송 상태를 확인하고 송장 업로드를 관리합니다."
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
         <div className="grid gap-3 md:grid-cols-4">
           <div>
             <label className="text-xs text-white/60">구분</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>단품</option>
               <option>구독</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">상태</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>배송준비중</option>
               <option>배송중</option>
               <option>배송완료</option>
             </select>
           </div>
           <div className="md:col-span-2">
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="주문번호 또는 송장번호"
             />
           </div>
         </div>
         <div className="mt-4 flex flex-wrap gap-2">
           <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#101010]">
             검색
           </button>
           <button className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70">
             검색 초기화
           </button>
           <button className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70">
             운송장 일괄 업로드
           </button>
         </div>
       </div>
 
       <AdminTable
         columns={["주문번호", "구분", "주문자", "송장번호", "상품명", "상태", "배송시작", "배송완료"]}
         rows={shipments.map((shipment) => [
           shipment.orderId,
           shipment.type,
           shipment.customer,
           shipment.invoice,
           shipment.product,
           <AdminBadge
             key={`${shipment.orderId}-status`}
             label={shipment.status}
             tone={
               shipment.status === "배송완료"
                 ? "success"
                 : shipment.status === "배송중"
                 ? "info"
                 : "warning"
             }
           />,
           shipment.startAt,
           shipment.endAt,
         ])}
       />
     </div>
   );
 }
