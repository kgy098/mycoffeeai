 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const managementItems = [
   {
     id: "SUB-2301",
     member: "홍길동",
     product: "벨벳터치블렌드",
     status: "배송대기",
     lastPayment: "2026-02-12",
     nextShip: "2026-02-15",
   },
   {
     id: "SUB-2302",
     member: "이영희",
     product: "홈블렌드",
     status: "해지요청",
     lastPayment: "2026-02-10",
     nextShip: "2026-02-17",
   },
 ];
 
 export default function SubscriptionManagementPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="결제/배송/해지 관리"
         description="구독 결제, 배송, 해지 요청을 처리합니다."
       />
 
       <AdminTable
         columns={["구독번호", "회원", "상품", "상태", "최근 결제일", "다음 배송일"]}
         rows={managementItems.map((item) => [
           item.id,
           item.member,
           item.product,
           <AdminBadge
             key={`${item.id}-status`}
             label={item.status}
             tone={item.status === "배송대기" ? "info" : "warning"}
           />,
           item.lastPayment,
           item.nextShip,
         ])}
       />
     </div>
   );
 }
