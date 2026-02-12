 import Link from "next/link";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 
 type ProductFormProps = {
   mode: "create" | "edit";
   productId?: string;
 };
 
 export default function ProductForm({ mode, productId }: ProductFormProps) {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title={mode === "create" ? "상품 등록" : "상품 정보 수정"}
         description="커피 상품의 기본 정보를 입력합니다."
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
         <div className="grid gap-4 md:grid-cols-2">
           <div className="md:col-span-2">
             <label className="text-xs text-white/60">상품명</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="벨벳 터치 블렌드"
               defaultValue={mode === "edit" ? "벨벳 터치 블렌드" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">판매 상태</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>판매중</option>
               <option>품절</option>
               <option>노출안함</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">판매 타입</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>단품</option>
               <option>구독</option>
               <option>복합(단품+구독)</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">재고 상태</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="99,999"
               defaultValue={mode === "edit" ? "99,999" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">가격</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="35,000"
               defaultValue={mode === "edit" ? "35,000" : ""}
             />
           </div>
         </div>
 
         <div className="mt-6">
           <p className="text-sm font-semibold text-white">맛 프로파일</p>
           <div className="mt-3 grid gap-3 md:grid-cols-5">
             {[
               { label: "향", value: "3" },
               { label: "산미", value: "4" },
               { label: "단맛", value: "3" },
               { label: "고소함", value: "5" },
               { label: "바디감", value: "5" },
             ].map((item) => (
               <div key={item.label}>
                 <label className="text-xs text-white/60">{item.label}</label>
                 <input
                   className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
                   placeholder="0~5"
                   defaultValue={mode === "edit" ? item.value : ""}
                 />
               </div>
             ))}
           </div>
         </div>
 
         <div className="mt-6 flex flex-wrap gap-2">
           <button className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]">
             {mode === "create" ? "등록" : "수정"}
           </button>
           <Link
             href="/admin/products"
             className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
           >
             목록으로
           </Link>
         </div>
 
         {productId && (
           <p className="mt-4 text-xs text-white/40">상품 ID: {productId}</p>
         )}
       </div>
     </div>
   );
 }
