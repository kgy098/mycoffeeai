"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useGet, usePut } from "@/hooks/useApi";

type AdminDetail = {
  id: number;
  email: string;
  display_name?: string | null;
  phone_number?: string | null;
  provider?: string | null;
  status?: string | null;
  created_at: string;
  last_login_at?: string | null;
};

export default function AdminEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: admin, isLoading, error } = useGet<AdminDetail>(
    ["admin-detail", id],
    `/api/admin/admins/${id}`,
    undefined,
    { refetchOnWindowFocus: false, enabled: !!id }
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("email");
  const [adminStatus, setAdminStatus] = useState("1");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setName(admin.display_name || "");
      setEmail(admin.email || "");
      setPhone(admin.phone_number || "");
      setProvider(admin.provider || "email");
      setAdminStatus(admin.status || "1");
    }
  }, [admin]);

  const { mutate: updateAdmin, isPending } = usePut(`/api/admin/admins/${id}`, {
    onSuccess: () => {
      setMessage("수정되었습니다.");
      setTimeout(() => router.push("/admin/admins"), 1000);
    },
    onError: (err: any) =>
      setMessage(err?.response?.data?.detail || "수정에 실패했습니다."),
  });

  const submit = () => {
    setMessage(null);
    if (!email || !phone) {
      setMessage("이메일과 휴대폰 번호는 필수입니다.");
      return;
    }
    updateAdmin({
      email,
      phone_number: phone,
      display_name: name || null,
      provider,
      status: adminStatus,
      password: password || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="관리자 수정" />
        <p className="text-sm text-white/40">로딩 중...</p>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="관리자 수정" />
        <p className="text-sm text-red-400">관리자 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 수정"
        description={`${admin.display_name || admin.email} 관리자 정보를 수정합니다.`}
        actions={
          <Link
            href="/admin/admins"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        }
      />

      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/60">이름</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">이메일</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              placeholder="example@mycoffee.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">휴대폰 번호</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              placeholder="010-1111-2222"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/60">가입 채널</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="email">이메일</option>
              <option value="kakao">카카오</option>
              <option value="naver">네이버</option>
              <option value="apple">애플</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">상태</label>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              value={adminStatus}
              onChange={(e) => setAdminStatus(e.target.value)}
            >
              <option value="1">활성</option>
              <option value="0">비활성</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">비밀번호 변경</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              placeholder="변경 시에만 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* 부가 정보 */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/40">
          <span>계정 ID: {admin.id}</span>
          <span>가입일: {new Date(admin.created_at).toLocaleString()}</span>
          {admin.last_login_at && (
            <span>최근 로그인: {new Date(admin.last_login_at).toLocaleString()}</span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]"
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? "저장 중..." : "수정"}
          </button>
          <Link
            href="/admin/admins"
            className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white/70"
          >
            목록으로
          </Link>
        </div>

        {message && <p className="mt-4 text-xs text-white/60">{message}</p>}
      </div>
    </div>
  );
}
