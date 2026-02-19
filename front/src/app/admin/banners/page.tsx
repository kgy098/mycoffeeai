"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";
 
 type MonthlyCoffeeRow = {
   id: number;
   blend_id: number;
   month: string;
   banner_url?: string | null;
   comment?: string | null;
   desc?: string | null;
   is_visible: boolean;
   created_at: string;
   updated_at: string;
 };
 
 export default function AdminBannerPage() {
  const { data: rawData } = useGet<MonthlyCoffeeRow[] | { data?: MonthlyCoffeeRow[] }>(
    ["admin-banners"],
    "/api/monthly-coffees",
    { params: { limit: 200 } }
  );

  const data = Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];

  const rows = useMemo(() => {
    const items = data || [];
     return items.map((item) => {
       const monthText = item.month
         ? new Date(item.month).toLocaleDateString("ko-KR")
         : "-";
       const createdAt = item.created_at
         ? new Date(item.created_at).toLocaleDateString("ko-KR")
         : "-";
       return [
         item.id,
         monthText,
         item.blend_id,
         item.banner_url ? (
           <a
             key={`banner-${item.id}`}
             href={item.banner_url}
             target="_blank"
             rel="noreferrer"
             className="text-blue-400 underline"
           >
             배너 보기
           </a>
         ) : (
           <span className="text-white/40">-</span>
         ),
         item.is_visible ? "노출" : "비노출",
         createdAt,
         <Link
           key={`edit-${item.id}`}
           href={`/admin/banners/${item.id}`}
           className="text-xs text-sky-200 hover:text-sky-100"
         >
           수정
         </Link>,
       ];
     });
   }, [data]);

  return (
    <div>
      <AdminPageHeader
        title="배너 관리"
        description="메인 배너에 노출되는 이달의 커피 정보를 확인합니다."
        actions={
          <Link
            href="/admin/banners/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
          >
            배너 등록
          </Link>
        }
      />
       <AdminTable
         columns={[
           "ID",
           "월",
           "블렌드 ID",
           "배너",
           "노출 여부",
           "생성일",
           "관리",
         ]}
         rows={rows}
         emptyMessage="등록된 배너가 없습니다."
       />
     </div>
   );
 }
