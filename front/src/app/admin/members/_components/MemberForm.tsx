 import Link from "next/link";
 import AdminPageHeader from "@/components/admin/AdminPageHeader";
 
 type MemberFormProps = {
   mode: "create" | "edit";
   memberId?: string;
 };
 
 export default function MemberForm({ mode, memberId }: MemberFormProps) {
   return (
     <div className="space-y-6">
       <AdminPageHeader
         title={mode === "create" ? "회원 등록" : "회원 정보 수정"}
         description="회원 기본 정보를 입력하거나 수정합니다."
       />
 
       <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
         <div className="grid gap-4 md:grid-cols-2">
           <div>
             <label className="text-xs text-white/60">이름</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="홍길동"
               defaultValue={mode === "edit" ? "홍길동" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">이메일</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="example@mycoffee.ai"
               defaultValue={mode === "edit" ? "example@mycoffee.ai" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">생년월일</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="1990-01-15"
               defaultValue={mode === "edit" ? "1990-01-15" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">성별</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>선택</option>
               <option>남자</option>
               <option>여자</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">휴대폰 번호</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="010-1111-2222"
               defaultValue={mode === "edit" ? "010-1111-2222" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">가입 채널</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>이메일</option>
               <option>카카오</option>
               <option>네이버</option>
               <option>애플</option>
             </select>
           </div>
           <div>
             <label className="text-xs text-white/60">포인트</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="1000"
               defaultValue={mode === "edit" ? "1000" : ""}
             />
           </div>
           <div>
             <label className="text-xs text-white/60">회원 상태</label>
             <select className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80">
               <option>정상</option>
               <option>탈퇴</option>
               <option>정지</option>
             </select>
           </div>
         </div>
 
         <div className="mt-6 flex flex-wrap gap-2">
           <button className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]">
             {mode === "create" ? "등록" : "수정"}
           </button>
           <Link
             href="/admin/members"
             className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
           >
             목록으로
           </Link>
         </div>
 
         {memberId && (
           <p className="mt-4 text-xs text-white/40">회원 ID: {memberId}</p>
         )}
       </div>
     </div>
   );
 }
