'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useUserStore } from '@/stores/user-store';
import { setAccessTokenCookie, removeRememberTokenCookie } from '@/utils/cookies';

interface AutoLoginResponse {
  success: boolean;
  token: string;
  token_type: string;
  userId: number;
  email: string;
  display_name?: string;
}

function getRememberTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/\bremember_token=([^;]*)/);
  return match ? match[1].trim() || null : null;
}

/** 앱 로드 시 쿠키 remember_token으로 자동로그인 시도 (DB·체크 여부 비교는 백엔드에서 수행) */
export default function AutoLoginRestore() {
  const { user, setUser } = useUserStore();
  const attempted = useRef(false);

  useEffect(() => {
    if (user.isAuthenticated || attempted.current) return;
    const fromCookie = getRememberTokenFromCookie();
    if (!fromCookie) return; // 쿠키 없으면 시도하지 않음

    attempted.current = true;

    api
      .post<AutoLoginResponse>(
        '/api/auth/auto-login',
        { remember_token: fromCookie },
        { withCredentials: true }
      )
      .then((res) => {
        const data = res.data;
        if (data?.success && data?.token) {
          setAccessTokenCookie(data.token);
          setUser({
            data: {
              user_id: data.userId,
              session_id: '',
              token: data.token,
              token_type: data.token_type || 'bearer',
              expires_in: 0,
              result_code: '',
              result_message: '',
              display_name: data.display_name ?? undefined,
              email: data.email,
            },
            meta: { timestamp: new Date().toISOString() },
            isAuthenticated: true,
          });
        }
      })
      .catch(() => {
        removeRememberTokenCookie();
      });
  }, [user.isAuthenticated, setUser]);

  return null;
}
