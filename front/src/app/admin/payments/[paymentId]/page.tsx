 import Link from "next/link";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminBadge from "@/components/admin/AdminBadge";
 
 export default function PaymentDetailPage({
   params,
 }: {
   params: { paymentId: string };
 }) {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="결제/환불 상세"
         description="결제 및 환불 처리 정보를 확인합니다."
         actions={
           <Link
             href="/admin/payments"
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
             <p className="text-sm text-white">{params.paymentId}</p>
           </div>
           <div>
             <p className="text-xs text-white/50">결제일시</p>
             <p className="text-sm text-white">2026-01-15 12:40</p>
           </div>
           <div>
             <p className="text-xs text-white/50">판매타입</p>
             <p className="text-sm text-white">구독</p>
           </div>
           <div>
             <p className="text-xs text-white/50">상태</p>
             <AdminBadge label="환불대기" tone="warning" />
           </div>
         </div>
 
         <div className="rounded-xl border border-white/10 bg-[#141414] p-6 space-y-4">
           <div>
             <p className="text-xs text-white/50">상품명</p>
             <p className="text-sm text-white">벨벳터치블렌드</p>
           </div>
           <div>
             <p className="text-xs text-white/50">결제수단</p>
             <p className="text-sm text-white">카드</p>
           </div>
           <div>
             <p className="text-xs text-white/50">환불 사유</p>
             <p className="text-sm text-white">단순 변심</p>
           </div>
           <div>
             <p className="text-xs text-white/50">환불 예정 금액</p>
             <p className="text-sm text-white">30,000원</p>
           </div>
         </div>
       </div>
     </div>
   );
 }
