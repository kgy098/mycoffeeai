 import Link from "next/link";
 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminStatCard from "@/components/admin/AdminStatCard";
 import AdminTable from "@/components/admin/AdminTable";
 
 const stats = [
   { label: "오늘 매출", value: "1,000,000원", description: "전일 대비 +6.4%" },
   { label: "신규 가입 회원", value: "5명", description: "최근 24시간 기준" },
   { label: "활성 사용자", value: "1,240명", description: "최근 7일 기준" },
   { label: "배송 진행", value: "84건", description: "배송 준비/배송중" },
 ];
 
 const newMembers = [
   { name: "윤광수", date: "2026-02-12", channel: "이메일" },
   { name: "이순신", date: "2026-02-12", channel: "카카오" },
   { name: "김영희", date: "2026-02-11", channel: "네이버" },
 ];
 
 const popularCoffee = [
   { rank: 1, name: "딥 바디 블렌드", status: "판매중" },
   { rank: 2, name: "벨벳 터치 블렌드", status: "판매중" },
   { rank: 3, name: "콜롬비아 블렌드", status: "재고부족" },
 ];
 
 export default function AdminDashboardPage() {
   return (
     <div className="space-y-8">
       <AdminPageHeader
         title="대시보드"
         description="운영 현황을 빠르게 확인하세요."
         actions={
           <Link
             href="/admin/orders"
             className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-white/30"
           >
             주문 내역 보기
           </Link>
         }
       />
 
       <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
         {stats.map((stat) => (
           <AdminStatCard key={stat.label} {...stat} />
         ))}
       </section>
 
       <section className="grid gap-6 xl:grid-cols-2">
         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h2 className="text-lg font-semibold text-white">신규 가입 회원</h2>
             <Link href="/admin/members" className="text-xs text-white/60 hover:text-white">
               회원 전체보기
             </Link>
           </div>
           <AdminTable
             columns={["이름", "가입일시", "가입채널", "상태"]}
             rows={newMembers.map((member) => [
               member.name,
               member.date,
               member.channel,
               <AdminBadge key={`${member.name}-status`} label="정상" tone="success" />,
             ])}
           />
         </div>
 
         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <h2 className="text-lg font-semibold text-white">인기 커피 현황</h2>
             <Link href="/admin/products" className="text-xs text-white/60 hover:text-white">
               상품 관리로 이동
             </Link>
           </div>
           <AdminTable
             columns={["순위", "커피", "상태"]}
             rows={popularCoffee.map((item) => [
               `${item.rank}위`,
               item.name,
               <AdminBadge
                 key={`${item.rank}-status`}
                 label={item.status}
                 tone={item.status === "판매중" ? "success" : "warning"}
               />,
             ])}
           />
         </div>
       </section>
     </div>
   );
 }
