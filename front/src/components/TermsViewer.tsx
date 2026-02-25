"use client";

import { useGet } from "@/hooks/useApi";

type TermsData = {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  effective_date?: string;
};

interface TermsViewerProps {
  slug: string;
}

export default function TermsViewer({ slug }: TermsViewerProps) {
  const { data, isLoading, error } = useGet<TermsData>(
    ["terms", slug],
    `/api/terms/${slug}`
  );

  if (isLoading) {
    return <p className="text-center text-gray-400 py-8">로딩 중...</p>;
  }

  if (error || !data) {
    return <p className="text-center text-gray-400 py-8">약관을 불러올 수 없습니다.</p>;
  }

  return (
    <div
      className="terms-content"
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
}
