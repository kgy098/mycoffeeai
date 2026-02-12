 import Link from "next/link";
 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const products = [
   {
     id: "2001",
     name: "벨벳터치블렌드",
     aroma: 2,
     acidity: 3,
     sweetness: 5,
     body: 1,
     nutty: 2,
     price: "30,000",
     type: "단품",
     stock: "99,999",
     status: "판매중",
     createdAt: "2026-01-15",
   },
   {
     id: "2002",
     name: "벨벳터치블렌드",
     aroma: 3,
     acidity: 4,
     sweetness: 5,
     body: 5,
     nutty: 5,
     price: "30,000",
     type: "구독가능",
     stock: "80,001",
     status: "판매중",
     createdAt: "2026-01-15",
   },
   {
     id: "2003",
     name: "벨벳터치블렌드",
     aroma: 3,
     acidity: 4,
     sweetness: 5,
     body: 5,
     nutty: 5,
     price: "30,000",
     type: "복합",
     stock: "99,999",
     status: "일시정지",
     createdAt: "2026-01-15",
   },
 ];
 
 export default function ProductsListPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="커피 상품"
         description="상품 정보를 등록하고 판매 상태를 관리합니다."
         actions={
           <Link
             href="/admin/products/new"
             className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
           >
             상품 등록
           </Link>
         }
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
         <div className="grid gap-3 md:grid-cols-4">
           <div>
             <label className="text-xs text-white/60">카테고리</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>단품</option>
               <option>구독</option>
               <option>복합</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">판매 상태</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>판매중</option>
               <option>품절</option>
               <option>일시정지</option>
             </select>
           </div>
           <div className="md:col-span-2">
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="상품명을 입력하세요"
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
         columns={[
           "상품명",
           "맛 프로파일",
           "가격",
           "판매타입",
           "재고상태",
           "상태",
           "등록일",
           "관리",
         ]}
         rows={products.map((product) => [
           product.name,
           `향 ${product.aroma} · 산미 ${product.acidity} · 단맛 ${product.sweetness} · 바디 ${product.body} · 고소함 ${product.nutty}`,
           `${product.price}원`,
           product.type,
           product.stock,
           <AdminBadge
             key={`${product.id}-status`}
             label={product.status}
             tone={product.status === "판매중" ? "success" : "warning"}
           />,
           product.createdAt,
           <Link
             key={`${product.id}-link`}
             href={`/admin/products/${product.id}`}
             className="text-xs text-sky-200 hover:text-sky-100"
           >
             상세보기
           </Link>,
         ])}
       />
     </div>
   );
 }
