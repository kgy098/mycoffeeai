 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const members = [
   {
     name: "홍길동",
     product: "벨벳터치블렌드",
     cycle: "7일",
     nextPayment: "2026-02-20",
     status: "정상",
   },
   {
     name: "변사또",
     product: "콜롬비아 블렌드",
     cycle: "14일",
     nextPayment: "2026-02-28",
     status: "일시정지",
   },
 ];
 
 export default function SubscriptionMembersPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="구독 회원 관리"
         description="구독 중인 회원의 상태와 일정 관리."
       />
 
       <AdminTable
         columns={["회원", "구독 상품", "주기", "다음 결제일", "상태"]}
         rows={members.map((member, index) => [
           member.name,
           member.product,
           member.cycle,
           member.nextPayment,
           <AdminBadge
             key={`sub-member-${index}`}
             label={member.status}
             tone={member.status === "정상" ? "success" : "warning"}
           />,
         ])}
       />
     </div>
   );
 }
