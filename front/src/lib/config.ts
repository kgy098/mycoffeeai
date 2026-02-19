

// Get API base URL from environment or use default
// - 빈 문자열(""): 같은 출처 사용 → Next.js rewrites로 백엔드 프록시 (권장: 배포 시)
// - URL 설정 시: 해당 백엔드로 직접 요청 (개발 시 예: http://localhost:8000/)
const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (url !== undefined && url !== "") return url.replace(/\/?$/, "/");
  if (url === "") return ""; // same-origin, rewrites 사용
  return "http://localhost:8000/";
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    RECOMMENDATION: '/recommendation',
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Specific endpoint helpers
export const API_URLS = {
  RECOMMENDATION: getApiUrl(API_CONFIG.ENDPOINTS.RECOMMENDATION),
} as const;
