"use client";

export const setAccessTokenCookie = (token: string) => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  const cookieParts = [`token=${token}`, "path=/"];

  if (!isLocalhost) {
    // Set domain to .mycoffeeai.com so cookie is accessible to api.mycoffeeai.com
    cookieParts.push("domain=.mycoffeeai.com");
    cookieParts.push("SameSite=None", "Secure");
  } else {
    cookieParts.push("SameSite=Lax");
  }

  document.cookie = cookieParts.join("; ");
};

export const removeAccessTokenCookie = () => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  const cookieParts = [
    "token=",
    "path=/",
    "expires=Thu, 01 Jan 1970 00:00:00 UTC",
  ];

  if (!isLocalhost) {
    cookieParts.push("domain=.mycoffeeai.com");
  }

  document.cookie = cookieParts.join("; ");
};

/** 자동로그인용 토큰 쿠키 (DB와 비교용, API 토큰과 별도) */
export const setRememberTokenCookie = (token: string) => {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";
  const parts = [`remember_token=${token}`, "path=/", "max-age=2592000"]; // 30일
  if (!isLocalhost) {
    parts.push("domain=.mycoffeeai.com", "SameSite=None", "Secure");
  } else {
    parts.push("SameSite=Lax");
  }
  document.cookie = parts.join("; ");
};

export const removeRememberTokenCookie = () => {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";
  const parts = [
    "remember_token=",
    "path=/",
    "expires=Thu, 01 Jan 1970 00:00:00 UTC",
  ];
  if (!isLocalhost) parts.push("domain=.mycoffeeai.com");
  document.cookie = parts.join("; ");
};
