"use client";

import { useUserStore } from "@/stores/user-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export const publicRoutes = ["/", "/analysis", "/result", "/home", "/on-event", "/on-event/history", "/on-event/analysis", "/on-event/result", "/on-event/terms/privacy", "/on-event/terms/marketing", "/admin-event", "/admin-event/order-history", "/admin-event/requests"];

interface VerifyResponse {
  authenticated: boolean;
  userId: number;
  expAt: string;
  reason: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`\\b${name}=([^;]*)`));
  return match ? match[1].trim() || null : null;
}

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/auth")) return true;
  return publicRoutes.includes(pathname);
}

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUserStore();
  const [ready, setReady] = useState(false);
  const initRef = useRef(false);

  // 1) 초기 인증 상태 확인 — 쿠키 기반으로 검증 완료 후 ready 설정
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = getCookie("token");
    const rememberToken = getCookie("remember_token");

    // Case A: token 쿠키 존재 → /auth/me로 검증
    if (token) {
      api
        .get<VerifyResponse>("/auth/me", { withCredentials: true })
        .then((response) => {
          if (response.data?.authenticated) {
            if (!useUserStore.getState().user.isAuthenticated) {
              const expAtTimestamp = response.data.expAt
                ? new Date(response.data.expAt).getTime() / 1000
                : 0;
              setUser({
                data: {
                  user_id: response.data.userId,
                  session_id: useUserStore.getState().user.data?.session_id || "",
                  token,
                  token_type: "Bearer",
                  expires_in: expAtTimestamp,
                  result_code: "0",
                  result_message: "Success",
                },
                meta: { timestamp: new Date().toISOString() },
                isAuthenticated: true,
              });
            }
          } else {
            // 토큰 무효 → 쿠키 삭제
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            useUserStore.getState().resetUser();
          }
        })
        .catch(() => {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          useUserStore.getState().resetUser();
        })
        .finally(() => {
          setReady(true);
        });
      return;
    }

    // Case B: remember_token만 존재 → AutoLoginRestore가 처리할 때까지 대기
    if (rememberToken) {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        unsub();
        clearTimeout(timer);
        setReady(true);
      };

      // store 구독: isAuthenticated가 true로 변하면 완료
      const unsub = useUserStore.subscribe((state) => {
        if (state.user.isAuthenticated) {
          settle();
        }
      });

      // 3초 타임아웃 — 자동 로그인 실패해도 진행
      const timer = setTimeout(() => {
        settle();
      }, 3000);

      return;
    }

    // Case C: 쿠키 없음 → 즉시 ready
    setReady(true);
  }, [setUser]);

  // 2) ready 이후 리다이렉트 판단
  useEffect(() => {
    if (!ready) return;

    if (!user.isAuthenticated && !isPublicPath(pathname)) {
      router.push("/auth/login");
    }
  }, [ready, pathname, user.isAuthenticated, router]);

  // ready 전이고 보호 라우트면 빈 화면 (깜빡임 방지)
  if (!ready && !isPublicPath(pathname)) {
    return null;
  }

  // ready 후 비인증 + 보호 라우트 → null (리다이렉트 중)
  if (ready && !user.isAuthenticated && !isPublicPath(pathname)) {
    return null;
  }

  return <>{children}</>;
}
