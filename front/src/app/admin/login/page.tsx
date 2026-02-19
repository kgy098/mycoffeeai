"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { setAccessTokenCookie } from "@/utils/cookies";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/admin";
  const { setUser } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post<{
        success?: boolean;
        token?: string;
        token_type?: string;
        userId?: number;
        email?: string;
        display_name?: string;
      }>("/api/auth/admin-login", { email: email.trim(), password });
      if (data?.success && data?.token) {
        setAccessTokenCookie(data.token);
        setUser({
          data: {
            user_id: data.userId ?? 0,
            session_id: "",
            token: data.token,
            token_type: data.token_type ?? "bearer",
            expires_in: 0,
            result_code: "",
            result_message: "",
            display_name: data.display_name,
            email: data.email,
          },
          meta: { timestamp: new Date().toISOString() },
          isAuthenticated: true,
        });
        const target = returnUrl.startsWith("/admin") ? returnUrl : "/admin";
        router.replace(target);
        return;
      }
      setError("로그인에 실패했습니다.");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "이메일 또는 비밀번호를 확인하세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <h1 className="text-xl font-semibold text-white mb-1">MyCoffee.AI</h1>
        <p className="text-sm text-white/60 mb-8">관리자 로그인</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="admin-email" className="block text-xs text-white/60 mb-1.5">
              이메일
            </label>
            <input
              id="admin-email"
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
            <label htmlFor="admin-password" className="block text-xs text-white/60 mb-1.5">
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-white text-[#101010] py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link href="/admin/register" className="text-sm text-white/60 hover:text-white">
            관리자 회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
