"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { usePost } from "@/hooks/useApi";

export default function NewAdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("email");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { mutate: createAdmin, isPending } = usePost("/api/admin/admins", {
    onSuccess: () => {
      setMessage("관리자가 등록되었습니다.");
      setTimeout(() => router.push("/admin/admins"), 1000);
    },
    onError: (err: any) =>
      setMessage(err?.response?.data?.detail || "등록에 실패했습니다."),
  });

  const submit = () => {
    setMessage(null);
    if (!email || !phone) {
      setMessage("이메일과 휴대폰 번호는 필수입니다.");
      return;
    }
    createAdmin({
      email,
      phone_number: phone,
      display_name: name || null,
      provider,
      status: "1",
      password: password || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 신규등록"
        description="새 관리자 계정을 등록합니다."
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
          <div className="md:col-span-2">
            <label className="text-xs text-white/60">비밀번호</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white/80"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#101010]"
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? "저장 중..." : "등록"}
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
