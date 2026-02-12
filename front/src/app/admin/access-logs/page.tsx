 import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
 
 const accessLogs = [
   {
     id: "LOG-01",
     admin: "관리자",
     ip: "192.168.0.12",
     action: "로그인",
     time: "2026-02-12 09:10",
   },
   {
     id: "LOG-02",
     admin: "운영자",
     ip: "192.168.0.18",
     action: "상품 수정",
     time: "2026-02-11 18:42",
   },
 ];
 
 export default function AccessLogsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="접근 로그"
         description="관리자 활동 로그를 확인합니다."
       />
 
       <AdminTable
         columns={["로그ID", "관리자", "IP", "행동", "시간"]}
         rows={accessLogs.map((log) => [
           log.id,
           log.admin,
           log.ip,
           log.action,
           log.time,
         ])}
       />
     </div>
   );
 }
