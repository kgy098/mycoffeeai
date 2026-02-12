 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const admins = [
   {
     id: "ADM-01",
     name: "관리자",
     email: "admin@mycoffee.ai",
     role: "총괄 관리자",
     status: "활성",
     lastLogin: "2026-02-12 09:10",
   },
   {
     id: "ADM-02",
     name: "운영자",
     email: "ops@mycoffee.ai",
     role: "운영",
     status: "활성",
     lastLogin: "2026-02-11 18:40",
   },
 ];
 
 export default function AdminAccountsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="관리자 계정 / 권한"
         description="운영자 계정과 권한을 관리합니다."
       />
 
       <AdminTable
         columns={["계정ID", "이름", "이메일", "권한", "상태", "최근 접속"]}
         rows={admins.map((admin) => [
           admin.id,
           admin.name,
           admin.email,
           admin.role,
           <AdminBadge
             key={`${admin.id}-status`}
             label={admin.status}
             tone="success"
           />,
           admin.lastLogin,
         ])}
       />
     </div>
   );
 }
