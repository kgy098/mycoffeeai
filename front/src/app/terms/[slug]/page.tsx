"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import TermsViewer from "@/components/TermsViewer";
import { useHeaderStore } from "@/stores/header-store";

const slugTitleMap: Record<string, string> = {
  service_terms: "이용약관",
  privacy_policy: "개인정보취급방침",
  third_party_provision: "구매 조건 및 개인정보 제3자 제공",
  subscription_terms: "정기구독 이용약관",
  marketing_consent: "개인정보 마케팅 활용 동의",
};

export default function TermsSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: slugTitleMap[slug] ?? "약관",
      showBackButton: true,
    });
  }, [slug, setHeader]);

  return (
    <div>
      <Header />
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
        <TermsViewer slug={slug} />
      </div>
    </div>
  );
}
