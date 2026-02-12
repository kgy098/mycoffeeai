 import Link from "next/link";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminBadge from "@/components/admin/AdminBadge";
 
 export default function OrderDetailPage({
   params,
 }: {
   params: { orderId: string };
 }) {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="주문 상세"
         description="주문 정보와 처리 상태를 확인합니다."
         actions={
           <Link
             href="/admin/orders"
             className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
           >
             목록으로
           </Link>
         }
       />
 
       <div className="grid gap-6 xl:grid-cols-2">
         <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
           <div>
             <p className="text-xs text-white/50">주문번호</p>
             <p className="text-sm text-white">{params.orderId}</p>
           </div>
           <div>
             <p className="text-xs text-white/50">주문일시</p>
             <p className="text-sm text-white">2026-01-15 12:40</p>
           </div>
           <div>
             <p className="text-xs text-white/50">판매타입</p>
             <p className="text-sm text-white">단품</p>
           </div>
           <div>
             <p className="text-xs text-white/50">상태</p>
             <AdminBadge label="결제완료" tone="info" />
           </div>
         </div>
 
         <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
           <div>
             <p className="text-xs text-white/50">상품명</p>
             <p className="text-sm text-white">벨벳터치블렌드</p>
           </div>
           <div>
             <p className="text-xs text-white/50">옵션</p>
             <p className="text-sm text-white">커스텀 라벨 - 지친 오후의 활력</p>
           </div>
           <div>
             <p className="text-xs text-white/50">주문수량</p>
             <p className="text-sm text-white">1개</p>
           </div>
           <div>
             <p className="text-xs text-white/50">결제수단</p>
             <p className="text-sm text-white">카드</p>
           </div>
         </div>
       </div>
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
         <h2 className="text-sm font-semibold text-white">배송 정보</h2>
         <div className="grid gap-4 md:grid-cols-2">
           <div>
             <p className="text-xs text-white/50">수령인</p>
             <p className="text-sm text-white">홍길동</p>
           </div>
           <div>
             <p className="text-xs text-white/50">연락처</p>
             <p className="text-sm text-white">010-1111-2222</p>
           </div>
           <div className="md:col-span-2">
             <p className="text-xs text-white/50">배송지</p>
             <p className="text-sm text-white">서울특별시 강남구 테헤란로 123</p>
           </div>
         </div>
       </div>
     </div>
   );
 }
