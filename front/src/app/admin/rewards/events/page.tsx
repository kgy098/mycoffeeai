 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const rewards = [
   {
     id: "EVT-01",
     event: "첫 구독 혜택",
     member: "홍길동",
     reward: "5,000P",
     status: "지급완료",
     date: "2026-02-10",
   },
   {
     id: "EVT-02",
     event: "리뷰 이벤트",
     member: "이영희",
     reward: "쿠폰",
     status: "대기",
     date: "2026-02-12",
   },
 ];
 
 export default function EventRewardsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="이벤트 리워드 지급"
         description="이벤트 리워드 지급 현황을 확인합니다."
       />
 
       <AdminTable
         columns={["지급ID", "이벤트", "회원", "리워드", "상태", "지급일"]}
         rows={rewards.map((reward) => [
           reward.id,
           reward.event,
           reward.member,
           reward.reward,
           <AdminBadge
             key={`${reward.id}-status`}
             label={reward.status}
             tone={reward.status === "지급완료" ? "success" : "warning"}
           />,
           reward.date,
         ])}
       />
     </div>
   );
 }
