"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!displayName.trim()) {
      setError("이름을 입력하세요.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("전화번호를 입력하세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/api/auth/admin-register", {
        email: email.trim(),
        password,
        display_name: displayName.trim(),
        phone_number: phoneNumber.trim(),
      });
      setSuccess(true);
      setTimeout(() => router.replace("/admin/login"), 2000);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[360px] text-center">
          <p className="text-white mb-4">관리자 계정이 생성되었습니다.</p>
          <p className="text-white/60 text-sm">로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <h1 className="text-xl font-semibold text-white mb-1">MyCoffee.AI</h1>
        <p className="text-sm text-white/60 mb-8">관리자 회원가입</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="admin-reg-email" className="block text-xs text-white/60 mb-1.5">
              이메일
            </label>
            <input
              id="admin-reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="이메일을 입력하세요"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="admin-reg-name" className="block text-xs text-white/60 mb-1.5">
              이름 *
            </label>
            <input
              id="admin-reg-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="이름을 입력하세요"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="admin-reg-phone" className="block text-xs text-white/60 mb-1.5">
              전화번호 *
            </label>
            <input
              id="admin-reg-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="전화번호를 입력하세요"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="admin-reg-pw" className="block text-xs text-white/60 mb-1.5">
              비밀번호 (6자 이상)
            </label>
            <input
              id="admin-reg-pw"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="비밀번호"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="admin-reg-pw2" className="block text-xs text-white/60 mb-1.5">
              비밀번호 확인
            </label>
            <input
              id="admin-reg-pw2"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="비밀번호 확인"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-white text-[#101010] py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "등록 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link href="/admin/login" className="text-sm text-white/60 hover:text-white">
            이미 계정이 있으면 로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
