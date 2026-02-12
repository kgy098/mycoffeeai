 import Link from "next/link";
 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const orders = [
   {
     id: "20260125202020",
     date: "2026-01-15 12:40",
     type: "단품",
     customer: "홍길동",
     product: "벨벳터치블렌드",
     amount: "30,000원",
     status: "결제완료",
   },
   {
     id: "20260125202021",
     date: "2026-01-15 13:20",
     type: "구독",
     customer: "변사또",
     product: "벨벳터치블렌드",
     amount: "30,000원",
     status: "배송중",
   },
   {
     id: "20260125202022",
     date: "2026-01-15 15:10",
     type: "구독",
     customer: "홍길동",
     product: "벨벳터치블렌드",
     amount: "30,000원",
     status: "배송완료",
   },
 ];
 
 export default function OrdersPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="주문 내역"
         description="주문 상태별로 관리하고 처리합니다."
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
               <option>결제완료</option>
               <option>배송중</option>
               <option>배송완료</option>
               <option>취소</option>
               <option>반품</option>
             </select>
           </div>
           <div className="md:col-span-2">
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="주문번호 또는 고객명"
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
         </div>
       </div>
 
       <AdminTable
         columns={["주문번호", "주문일시", "구분", "주문자", "상품명", "결제금액", "상태", "관리"]}
         rows={orders.map((order) => [
           order.id,
           order.date,
           order.type,
           order.customer,
           order.product,
           order.amount,
           <AdminBadge
             key={`${order.id}-status`}
             label={order.status}
             tone={order.status === "결제완료" ? "info" : order.status === "배송완료" ? "success" : "warning"}
           />,
           <Link
             key={`${order.id}-link`}
             href={`/admin/orders/${order.id}`}
             className="text-xs text-sky-200 hover:text-sky-100"
           >
             상세보기
           </Link>,
         ])}
       />
     </div>
   );
 }
