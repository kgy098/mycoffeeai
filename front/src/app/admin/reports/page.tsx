 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const reports = [
   {
     id: "REP-3001",
     type: "리뷰",
     target: "REV-1022",
     reporter: "익명",
     reason: "욕설",
     status: "처리중",
   },
   {
     id: "REP-3002",
     type: "게시글",
     target: "POST-88",
     reporter: "커피팬",
     reason: "광고",
     status: "처리완료",
   },
 ];
 
 export default function ReportsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="신고 처리"
         description="신고된 콘텐츠를 검토하고 조치합니다."
       />
 
       <AdminTable
         columns={["신고ID", "유형", "대상", "신고자", "사유", "상태"]}
         rows={reports.map((report) => [
           report.id,
           report.type,
           report.target,
           report.reporter,
           report.reason,
           <AdminBadge
             key={`${report.id}-status`}
             label={report.status}
             tone={report.status === "처리완료" ? "success" : "warning"}
           />,
         ])}
       />
     </div>
   );
 }
