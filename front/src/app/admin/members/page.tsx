"use client";

import Link from "next/link";
import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

 type AdminUser = {
   id: number;
   email: string;
   display_name?: string | null;
   phone_number?: string | null;
   provider?: string | null;
   is_admin: boolean;
   status?: string | null;
   created_at: string;
   last_login_at?: string | null;
   subscription_count: number;
   order_count: number;
 };

 const PROVIDER_LABELS: Record<string, string> = {
   email: "메일",
   kakao: "카카오",
   naver: "네이버",
   google: "구글",
   apple: "애플",
 };

 export default function MembersListPage() {
   const [search, setSearch] = useState("");
   const [provider, setProvider] = useState("");
   const [hasSubscription, setHasSubscription] = useState("");
   const [createdFrom, setCreatedFrom] = useState("");
   const [createdTo, setCreatedTo] = useState("");

  const { data: rawMembers, isLoading, error, refetch } = useGet<AdminUser[] | { data?: AdminUser[] }>(
    ["admin-users", search, provider, hasSubscription, createdFrom, createdTo],
    "/api/admin/users",
    {
      params: {
        q: search || undefined,
        provider: provider || undefined,
        has_subscription: hasSubscription ? hasSubscription === "true" : undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
      },
    },
    { refetchOnWindowFocus: false, retry: 0 }
  );

  const members = Array.isArray(rawMembers) ? rawMembers : (rawMembers as any)?.data ?? [];
  const errorStatus = (error as any)?.response?.status;
  const errorDetail = (error as any)?.response?.data?.detail ?? (error as any)?.message;
  const isAuthError = errorStatus === 401 || errorStatus === 403;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })} ${d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`;
  };

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
        <div className="grid gap-3 md:grid-cols-3">
          <div>
             <label className="text-xs text-white/60">가입 채널</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="">전체</option>
              <option value="email">메일(일반가입)</option>
              <option value="kakao">카카오</option>
              <option value="naver">네이버</option>
              <option value="google">구글</option>
              <option value="apple">애플</option>
            </select>
           </div>
          <div>
            <label className="text-xs text-white/60">구독 여부</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={hasSubscription}
              onChange={(e) => setHasSubscription(e.target.value)}
            >
              <option value="">전체</option>
              <option value="true">구독 있음</option>
              <option value="false">구독 없음</option>
            </select>
          </div>
           <div>
             <label className="text-xs text-white/60">검색</label>
             <input
               className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
               placeholder="이름 또는 이메일"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
             />
           </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/60">가입일시 (시작)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">가입일시 (종료)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
            />
          </div>
        </div>
         <div className="mt-4 flex flex-wrap gap-2">
           <button className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#101010]">
             검색
           </button>
          <button
            className="rounded-lg border border-white/20 px-4 py-2 text-xs text-white/70"
            onClick={() => {
              setSearch("");
              setProvider("");
              setHasSubscription("");
              setCreatedFrom("");
              setCreatedTo("");
            }}
          >
             검색 초기화
           </button>
         </div>
       </div>

       {error && (
         <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
           <p className="font-semibold">회원 데이터를 불러오지 못했습니다.</p>
           {errorStatus && <p>HTTP {errorStatus}</p>}
           {errorDetail && <p>{typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail)}</p>}
           {isAuthError && (
             <p className="mt-2 text-xs text-white/80">
               관리자 계정으로 로그인했는지 확인하세요. 로그아웃 후 관리자 계정으로 다시 로그인해 보세요.
             </p>
           )}
           <button
             type="button"
             onClick={() => refetch()}
             className="mt-3 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30"
           >
             다시 시도
           </button>
         </div>
       )}

       <AdminTable
         columns={[
           "이름",
           "이메일",
           "전화번호",
           "가입채널",
           "구독수",
           "주문건수",
           "상태",
           "마지막 로그인",
           "가입일시",
           "관리",
         ]}
        rows={
          isLoading
            ? []
            : members.map((member) => [
                member.display_name || "-",
                member.email,
                member.phone_number || "-",
                PROVIDER_LABELS[member.provider || ""] || member.provider || "-",
                `${member.subscription_count}건`,
                `${member.order_count}건`,
                <AdminBadge
                  key={`${member.id}-status`}
                  label={member.status === "0" ? "탈퇴" : "가입"}
                  tone={member.status === "0" ? "danger" : "success"}
                />,
                formatDateTime(member.last_login_at),
                formatDate(member.created_at),
                <Link
                  key={`${member.id}-link`}
                  href={`/admin/members/${member.id}`}
                  className="text-xs text-sky-200 hover:text-sky-100"
                >
                  상세보기
                </Link>,
              ])
        }
        emptyMessage={
          isLoading ? "로딩 중..." : error ? "" : "회원이 없습니다."
        }
       />
     </div>
   );
 }
