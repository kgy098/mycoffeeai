 import Link from "next/link";
 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const payments = [
   {
     id: "20260125202020",
     date: "2026-01-15 12:40",
     type: "단품",
     customer: "홍길동",
     method: "카드",
     amount: "30,000원",
     status: "결제완료",
   },
   {
     id: "20260125202021",
     date: "2026-01-15 13:20",
     type: "구독",
     customer: "변사또",
     method: "카드",
     amount: "30,000원",
     status: "결제취소",
   },
   {
     id: "20260125202022",
     date: "2026-01-15 15:10",
     type: "구독",
     customer: "홍길동",
     method: "카드",
     amount: "30,000원",
     status: "환불대기",
   },
 ];
 
 export default function PaymentsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="결제/환불 내역"
         description="결제 상태와 환불 처리를 관리합니다."
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
               <option>결제취소</option>
               <option>환불대기</option>
               <option>환불승인</option>
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
         columns={["주문번호", "결제일시", "구분", "주문자", "결제수단", "결제금액", "상태", "관리"]}
         rows={payments.map((payment) => [
           payment.id,
           payment.date,
           payment.type,
           payment.customer,
           payment.method,
           payment.amount,
           <AdminBadge
             key={`${payment.id}-status`}
             label={payment.status}
             tone={
               payment.status === "결제완료"
                 ? "success"
                 : payment.status === "결제취소"
                 ? "danger"
                 : "warning"
             }
           />,
           <Link
             key={`${payment.id}-link`}
             href={`/admin/payments/${payment.id}`}
             className="text-xs text-sky-200 hover:text-sky-100"
           >
             상세보기
           </Link>,
         ])}
       />
     </div>
   );
 }
