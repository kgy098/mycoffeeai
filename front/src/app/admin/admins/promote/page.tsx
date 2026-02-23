"use client";

import Link from "next/link";
import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";
import { api } from "@/lib/api";

type UserItem = {
  id: number;
  email: string;
  display_name?: string | null;
  phone_number?: string | null;
  is_admin: boolean;
  created_at: string;
};

export default function PromoteAdminPage() {
  const [q, setQ] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<number | null>(null);

  const { data: users = [], isLoading, error, refetch } = useGet<UserItem[]>(
    ["admin-users-all", q],
    "/api/admin/users",
    { params: { q: q || undefined, limit: 200 } },
    { refetchOnWindowFocus: false }
  );

  const handlePromote = async (user: UserItem) => {
    if (
      !window.confirm(
        `"${user.display_name || user.email}" 님을 관리자로 등록하시겠습니까?`
      )
    )
      return;

    setPromoting(user.id);
    setMessage(null);
    try {
      await api.post(`/api/admin/admins/promote/${user.id}`);
      setMessage(
        `"${user.display_name || user.email}" 님이 관리자로 등록되었습니다.`
      );
      refetch();
    } catch (err: any) {
      setMessage(
        err?.response?.data?.detail || "관리자 등록에 실패했습니다."
      );
    } finally {
      setPromoting(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="기존회원 관리자 등록"
        description="기존 회원을 선택하여 관리자로 등록합니다."
        resultCount={users.length}
        actions={
          <Link
            href="/admin/admins"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-xs text-white/60">회원 검색</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white/80"
              placeholder="이름 또는 이메일"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {message && (
        <p className="text-xs text-white/60">{message}</p>
      )}

      <AdminTable
        columns={["ID", "이름", "이메일", "연락처", "가입일", "관리"]}
        rows={
          isLoading
            ? []
            : users.map((user) => [
                user.id,
                user.display_name || "-",
                user.email,
                user.phone_number || "-",
                new Date(user.created_at).toLocaleDateString(),
                user.is_admin ? (
                  <span
                    key={`${user.id}-already`}
                    className="text-xs text-white/40"
                  >
                    이미 관리자
                  </span>
                ) : (
                  <button
                    key={`${user.id}-promote`}
                    className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#101010] disabled:opacity-50"
                    onClick={() => handlePromote(user)}
                    disabled={promoting === user.id}
                  >
                    {promoting === user.id ? "등록 중..." : "관리자 등록"}
                  </button>
                ),
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "회원 데이터를 불러오지 못했습니다."
            : "회원이 없습니다."
        }
      />
    </div>
  );
}
