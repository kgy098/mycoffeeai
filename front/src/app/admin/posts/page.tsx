 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const posts = [
   {
     id: "POST-88",
     category: "커피스토리",
     title: "오늘의 원두 추천",
     author: "관리자",
     date: "2026-02-10",
     status: "공개",
   },
   {
     id: "POST-89",
     category: "이벤트",
     title: "첫 구독 할인 안내",
     author: "관리자",
     date: "2026-02-09",
     status: "예약",
   },
 ];
 
 export default function PostsPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="게시글 관리"
         description="커뮤니티 게시글을 등록하고 관리합니다."
       />
 
       <AdminTable
         columns={["게시글ID", "카테고리", "제목", "작성자", "등록일", "상태"]}
         rows={posts.map((post) => [
           post.id,
           post.category,
           post.title,
           post.author,
           post.date,
           <AdminBadge
             key={`${post.id}-status`}
             label={post.status}
             tone={post.status === "공개" ? "success" : "info"}
           />,
         ])}
       />
     </div>
   );
 }
