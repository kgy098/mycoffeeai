"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import TermsViewer from "@/components/TermsViewer";
import { useHeaderStore } from "@/stores/header-store";
import { useGet } from "@/hooks/useApi";

type TermsData = {
  title: string;
};

export default function DynamicTermsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { setHeader } = useHeaderStore();

  const { data } = useGet<TermsData>(
    ["terms", slug],
    `/api/terms/${slug}`,
    undefined,
    { enabled: !!slug }
  );

  useEffect(() => {
    setHeader({
      title: data?.title || "약관",
      showBackButton: true,
    });
  }, [data?.title]);

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl border border-border-default p-3">
        <TermsViewer slug={slug} />
      </div>
    </div>
  );
}
