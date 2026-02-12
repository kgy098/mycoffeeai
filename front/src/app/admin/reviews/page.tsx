 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const reviews = [
   {
     id: "REV-1021",
     coffee: "벨벳터치블렌드",
     author: "커피러버",
     rating: 5,
     date: "2026-02-11",
     status: "정상",
   },
   {
     id: "REV-1022",
     coffee: "콜롬비아 블렌드",
     author: "달콤커피",
     rating: 2,
     date: "2026-02-10",
     status: "모니터링",
   },
 ];
 
 export default function ReviewsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="리뷰 모니터링"
         description="최근 작성된 리뷰를 관리합니다."
       />
 
       <AdminTable
         columns={["리뷰ID", "커피", "작성자", "평점", "작성일", "상태"]}
         rows={reviews.map((review) => [
           review.id,
           review.coffee,
           review.author,
           `${review.rating}점`,
           review.date,
           <AdminBadge
             key={`${review.id}-status`}
             label={review.status}
             tone={review.status === "정상" ? "success" : "warning"}
           />,
         ])}
       />
     </div>
   );
 }
