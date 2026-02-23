"use client";

import { useState } from "react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type UserWithPoints = {
  id: number;
  email: string;
  display_name?: string | null;
  phone_number?: string | null;
  provider?: string | null;
  point_balance: number;
  created_at: string;
};

export default function PointsPage() {
  const [nameInput, setNameInput] = useState("");
  const [appliedName, setAppliedName] = useState("");

  const { data: users = [], isLoading, error } = useGet<UserWithPoints[]>(
    ["admin-points-users", appliedName],
    "/api/admin/users",
    {
      params: {
        q: appliedName || undefined,
        limit: 1000,
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const applyFilter = () => {
    setAppliedName(nameInput.trim());
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="포인트 관리"
        description="회원별 포인트를 관리합니다."
        resultCount={users.length}
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">회원 검색</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="이름 또는 이메일"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && applyFilter()}
            />
          </div>
          <button
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#101010]"
            onClick={applyFilter}
          >
            검색
          </button>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setNameInput("");
              setAppliedName("");
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={["회원ID", "이름", "이메일", "포인트 잔액", "가입일", "관리"]}
        rows={
          isLoading
            ? []
            : users.map((user) => [
                user.id,
                user.display_name || "-",
                user.email,
                <span
                  key={`${user.id}-bal`}
                  className={`font-semibold ${user.point_balance > 0 ? "text-emerald-300" : "text-white/60"}`}
                >
                  {user.point_balance.toLocaleString()}P
                </span>,
                new Date(user.created_at).toLocaleDateString(),
                <Link
                  key={`${user.id}-link`}
                  href={`/admin/points/${user.id}`}
                  className="text-xs text-sky-200 hover:text-sky-100"
                >
                  상세보기
                </Link>,
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
