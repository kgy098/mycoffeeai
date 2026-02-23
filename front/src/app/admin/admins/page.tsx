"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type AdminUser = {
  id: number;
  email: string;
  display_name?: string | null;
  created_at: string;
};

export default function AdminAccountsPage() {
  const router = useRouter();
  const { data: admins = [], isLoading, error } = useGet<AdminUser[]>(
    ["admin-admins"],
    "/api/admin/admins",
    undefined,
    { refetchOnWindowFocus: false }
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 계정"
        description="운영자 계정을 관리합니다."
        resultCount={admins.length}
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/admins/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#101010]"
            >
              관리자 신규등록
            </Link>
            <Link
              href="/admin/admins/promote"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/30"
            >
              기존회원 변경
            </Link>
          </div>
        }
      />

      <AdminTable
        columns={["계정ID", "이름", "이메일", "권한", "상태", "등록일", "관리"]}
        rows={
          isLoading
            ? []
            : admins.map((admin) => [
                admin.id,
                admin.display_name || "-",
                admin.email,
                "관리자",
                <AdminBadge key={`${admin.id}-status`} label="활성" tone="success" />,
                new Date(admin.created_at).toLocaleDateString(),
                <Link
                  key={`${admin.id}-link`}
                  href={`/admin/admins/${admin.id}`}
                  className="text-xs text-sky-200 hover:text-sky-100"
                >
                  상세보기
                </Link>,
              ])
        }
        onRowClick={(rowIndex) => {
          const admin = admins[rowIndex];
          if (admin) {
            router.push(`/admin/admins/${admin.id}`);
          }
        }}
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "관리자 계정을 불러오지 못했습니다."
            : "등록된 관리자 계정이 없습니다."
        }
      />
    </div>
  );
}
