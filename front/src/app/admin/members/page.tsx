 import Link from "next/link";
 import AdminBadge from "@/components/admin/AdminBadge";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 import AdminTable from "@/components/admin/AdminTable";
 
 const members = [
   {
     id: "1001",
     name: "박회원",
     email: "abc@gmail.com",
     phone: "010-1111-2222",
     channel: "이메일",
     points: "1,000",
     subscriptions: 1,
     status: "정상",
     joinedAt: "2026-01-30 05:30",
   },
   {
     id: "1002",
     name: "김회원",
     email: "abc@gmail.com",
     phone: "010-1111-2222",
     channel: "카카오",
     points: "1,000",
     subscriptions: 0,
     status: "정상",
     joinedAt: "2026-01-30 05:30",
   },
   {
     id: "1003",
     name: "이회원",
     email: "abc@gmail.com",
     phone: "010-1111-2222",
     channel: "카카오",
     points: "1,000",
     subscriptions: 0,
     status: "탈퇴",
     joinedAt: "2026-01-30 05:30",
   },
   {
     id: "1004",
     name: "최회원",
     email: "abc@gmail.com",
     phone: "010-1111-2222",
     channel: "네이버",
     points: "1,000",
     subscriptions: 1,
     status: "정상",
     joinedAt: "2026-01-30 05:30",
   },
 ];
 
 export default function MembersListPage() {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title="회원관리"
         description="회원 상태와 정보를 관리합니다."
         actions={
           <Link
             href="/admin/members/new"
             className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
           >
             회원 등록
           </Link>
         }
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
         <div className="grid gap-3 md:grid-cols-4">
           <div>
             <label className="text-xs text-white/60">검색 구분</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>이름</option>
               <option>전화번호</option>
               <option>이메일</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">가입 채널</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>이메일</option>
               <option>카카오</option>
               <option>네이버</option>
               <option>애플</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">회원 상태</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>전체</option>
               <option>정상</option>
               <option>탈퇴</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="이름 또는 이메일"
             />
           </div>
         </div>
         <div className="mt-4 flex flex-wrap gap-2">
           <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#101010]">
             검색
           </button>
           <button className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70">
             검색 초기화
           </button>
         </div>
       </div>
 
       <AdminTable
         columns={[
           "이름",
           "이메일",
           "전화번호",
           "가입채널",
           "포인트",
           "구독수",
           "상태",
           "가입일시",
           "관리",
         ]}
         rows={members.map((member) => [
           member.name,
           member.email,
           member.phone,
           member.channel,
           member.points,
           `${member.subscriptions}건`,
           <AdminBadge
             key={`${member.id}-status`}
             label={member.status}
             tone={member.status === "정상" ? "success" : "danger"}
           />,
           member.joinedAt,
           <Link
             key={`${member.id}-link`}
             href={`/admin/members/${member.id}`}
             className="text-xs text-sky-200 hover:text-sky-100"
           >
             상세보기
           </Link>,
         ])}
       />
     </div>
   );
 }
