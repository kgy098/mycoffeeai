 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const subscriptionProducts = [
   {
     name: "벨벳",
     basePrice: "30,000",
     discount: "10%",
     finalPrice: "27,000",
     cycle: "7일",
     status: "판매중",
   },
   {
     name: "벨벳",
     basePrice: "30,000",
     discount: "10%",
     finalPrice: "27,000",
     cycle: "7일",
     status: "판매중지",
   },
 ];
 
 export default function SubscriptionsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="구독 상품"
         description="구독 상품의 가격과 할인율을 관리합니다."
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
         <div className="grid gap-3 md:grid-cols-3">
           <div className="md:col-span-2">
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="상품명을 입력하세요"
             />
           </div>
           <div>
             <label className="text-xs text-white/60">상태</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>판매중</option>
               <option>판매중지</option>
               <option>일시정지</option>
             </select>
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
         columns={["상품명", "기본가", "구독할인율", "최종구독가", "배송주기", "상태"]}
         rows={subscriptionProducts.map((product, index) => [
           product.name,
           `${product.basePrice}원`,
           product.discount,
           `${product.finalPrice}원`,
           product.cycle,
           <AdminBadge
             key={`subscription-${index}`}
             label={product.status}
             tone={product.status === "판매중" ? "success" : "warning"}
           />,
         ])}
       />
     </div>
   );
 }
