"use client";

import { useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useGet } from "@/hooks/useApi";

type AccessLog = {
  id: number;
  admin_id: number;
  user_name?: string | null;
  is_admin: boolean;
  action: string;
  ip_address: string;
  created_at: string;
};

type AccessLogPaginated = {
  items: AccessLog[];
  total: number;
};

const PAGE_SIZE = 10;

export default function AccessLogsPage() {
  const [nameInput, setNameInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useGet<AccessLogPaginated>(
    ["admin-access-logs", appliedName, role, startDate, endDate, page],
    "/api/admin/access-logs",
    {
      params: {
        q: appliedName || undefined,
        role: role || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const logs = data?.items ?? [];
  const total = data?.total ?? 0;

  const applyFilter = () => {
    setAppliedName(nameInput.trim());
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="접근 로그"
        description="회원 활동 로그를 확인합니다."
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">회원명</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="회원명"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-white/60">회원구분</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">전체</option>
              <option value="admin">관리자</option>
              <option value="user">일반회원</option>
            </select>
          </div>
          <div className="w-32">
            <label className="text-xs text-white/60">시작일</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-white/60">종료일</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              setRole("");
              setStartDate("");
              setEndDate("");
              setPage(0);
            }}
          >
            초기화
          </button>
        </div>
      </div>

      <AdminTable
        columns={["로그ID", "회원명", "구분", "IP", "행동", "일시"]}
        rows={
          isLoading
            ? []
            : logs.map((log) => [
                log.id,
                log.user_name || `회원 #${log.admin_id}`,
                <AdminBadge
                  key={`${log.id}-role`}
                  label={log.is_admin ? "관리자" : "회원"}
                  tone={log.is_admin ? "info" : "default"}
                />,
                log.ip_address,
                log.action,
                new Date(log.created_at).toLocaleString(),
              ])
        }
        emptyMessage={
          isLoading
            ? "로딩 중..."
            : error
            ? "접근 로그를 불러오지 못했습니다."
            : "접근 로그가 없습니다."
        }
        totalItems={total}
        currentPage={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
