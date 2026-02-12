 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const points = [
   {
     id: "POINT-101",
     member: "홍길동",
     type: "적립",
     amount: "1,000",
     reason: "구매 적립",
     date: "2026-02-11",
   },
   {
     id: "POINT-102",
     member: "이영희",
     type: "사용",
     amount: "500",
     reason: "주문 사용",
     date: "2026-02-10",
   },
 ];
 
 export default function PointsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="포인트 적립/사용 내역"
         description="회원 포인트 내역을 관리합니다."
       />
 
       <AdminTable
         columns={["내역ID", "회원", "구분", "포인트", "사유", "일자"]}
         rows={points.map((point) => [
           point.id,
           point.member,
           <AdminBadge
             key={`${point.id}-type`}
             label={point.type}
             tone={point.type === "적립" ? "success" : "warning"}
           />,
           `${point.amount}P`,
           point.reason,
           point.date,
         ])}
       />
     </div>
   );
 }
