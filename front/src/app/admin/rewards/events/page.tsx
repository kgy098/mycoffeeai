"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type EventItem = {
  id: number;
  event_title: string;
  reward_points: number;
  status: string;
  created_at: string;
};

type UserItem = {
  id: number;
  email: string;
  display_name?: string | null;
  phone_number?: string | null;
  status?: string | null;
  created_at: string;
  point_balance: number;
};

export default function EventRewardsPage() {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState("");
  const statusFilter = "1"; // 가입회원만 표시
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [isDistributing, setIsDistributing] = useState(false);
  const [customPoints, setCustomPoints] = useState("");
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // 이벤트 목록 (최신순)
  const { data: events = [] } = useGet<EventItem[]>(
    ["admin-rewards-events"],
    "/api/admin/rewards/events",
    undefined,
    { refetchOnWindowFocus: false }
  );

  // 회원 목록
  const { data: rawUsers, isLoading } = useGet<UserItem[] | { data?: UserItem[] }>(
    ["admin-reward-users", statusFilter, createdFrom, createdTo],
    "/api/admin/users",
    {
      params: {
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        limit: 500,
      },
    },
    { refetchOnWindowFocus: false }
  );

  const allUsers: UserItem[] = Array.isArray(rawUsers) ? rawUsers : (rawUsers as any)?.data ?? [];
  const users = allUsers.filter((u) => {
    if (statusFilter && u.status !== statusFilter) return false;
    if (searchName && !(u.display_name || "").includes(searchName)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pagedUsers = users.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const selectedEvent = events.find((e) => String(e.id) === selectedEventId);

  // 전체 선택/해제
  const allSelected = users.length > 0 && selectedUserIds.size === users.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleDistribute = async () => {
    if (!selectedEventId) {
      alert("이벤트를 선택해주세요.");
      return;
    }
    if (selectedUserIds.size === 0) {
      alert("지급할 회원을 선택해주세요.");
      return;
    }
    const points = customPoints ? Number(customPoints) : selectedEvent?.reward_points;
    if (!points || points <= 0) {
      alert("지급할 포인트를 입력해주세요.");
      return;
    }
    const eventLabel = selectedEvent
      ? `${selectedEvent.event_title} (${points}P)`
      : "";
    if (
      !window.confirm(
        `선택한 ${selectedUserIds.size}명에게\n${eventLabel}\n리워드를 지급하시겠습니까?`
      )
    )
      return;

    setIsDistributing(true);
    try {
      const res = await api.post("/api/admin/rewards/events/distribute", {
        event_id: Number(selectedEventId),
        user_ids: Array.from(selectedUserIds),
        custom_points: points,
      });
      alert(res.data.message);
      setSelectedUserIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-reward-users"] });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "리워드 지급에 실패했습니다.");
    } finally {
      setIsDistributing(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="이벤트 리워드 지급"
        description="이벤트를 선택하고 회원에게 리워드를 일괄 지급합니다."
        resultCount={users.length}
      />

      {/* 이벤트 선택 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <label className="text-xs font-semibold text-white/60">이벤트 선택</label>
        <select
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- 이벤트를 선택하세요 --</option>
          {events.map((event) => (
            <option key={event.id} value={String(event.id)}>
              [{event.status}] {event.event_title} ({event.reward_points}P) -{" "}
              {formatDate(event.created_at)}
            </option>
          ))}
        </select>
        {selectedEvent && (
          <p className="mt-2 text-xs text-white/50">
            지급 포인트:{" "}
            <span className="font-bold text-white/90">
              {selectedEvent.reward_points}P
            </span>
            {" / "}상태: {selectedEvent.status}
          </p>
        )}
      </div>

      {/* 검색 필터 */}
      <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label className="text-xs text-white/60">회원 이름</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              placeholder="이름 검색"
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setPage(0); }}
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-white/60">가입일시 (시작)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="text-xs text-white/60">가입일시 (종료)</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5 text-xs text-white/80"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
            />
          </div>
          <button
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70"
            onClick={() => {
              setSearchName("");
              setCreatedFrom("");
              setCreatedTo("");
              setSelectedUserIds(new Set());
              setPage(0);
            }}
          >
            초기화
          </button>
        </div>
      </div>

      {/* 일괄지급 액션바 */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#181818] px-4 py-3">
        <p className="text-sm text-white/70">
          총 <span className="font-bold text-white">{users.length}</span>명 중{" "}
          <span className="font-bold text-sky-300">{selectedUserIds.size}</span>명
          선택
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            placeholder={selectedEvent ? `${selectedEvent.reward_points}` : "포인트"}
            value={customPoints}
            onChange={(e) => setCustomPoints(e.target.value)}
            className="w-24 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80 text-right placeholder:text-white/30"
          />
          <span className="text-sm text-white/50">P</span>
          <button
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            disabled={
              isDistributing || selectedUserIds.size === 0 || !selectedEventId
            }
            onClick={handleDistribute}
          >
            {isDistributing ? "지급 중..." : "리워드 지급"}
          </button>
        </div>
      </div>

      {/* 회원 테이블 (체크박스 포함) */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#141414]">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="accent-emerald-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                이름
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                이메일
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                전화번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                현재 포인트
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                가입일
              </th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-white/60"
                >
                  로딩 중...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-white/60"
                >
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-t border-white/5 cursor-pointer hover:bg-white/5 ${
                    selectedUserIds.has(user.id) ? "bg-emerald-500/10" : ""
                  }`}
                  onClick={() => toggleUser(user.id)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user.id)}
                      onChange={() => toggleUser(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-emerald-500"
                    />
                  </td>
                  <td className="px-4 py-3">{user.display_name || "-"}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone_number || "-"}</td>
                  <td className="px-4 py-3">
                    {(user.point_balance ?? 0).toLocaleString()}P
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        user.status === "1"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {user.status === "1" ? "가입" : "탈퇴"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <div className="mt-3 flex items-center justify-start gap-3 text-xs text-white/60">
          <span>
            총 {users.length}건 중 {safePage * pageSize + 1}-{Math.min((safePage + 1) * pageSize, users.length)}건
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={safePage === 0}
                className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
              >
                «
              </button>
              <button
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 2)
                .reduce<number[]>((acc, i) => {
                  if (acc.length > 0 && i - acc[acc.length - 1] > 1) acc.push(-1);
                  acc.push(i);
                  return acc;
                }, [])
                .map((i, idx) =>
                  i === -1 ? (
                    <span key={`dot-${idx}`} className="px-1">…</span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`rounded px-2 py-1 ${
                        i === safePage
                          ? "bg-white/20 text-white font-semibold"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
                disabled={safePage >= totalPages - 1}
                className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={safePage >= totalPages - 1}
                className="rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30"
              >
                »
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
