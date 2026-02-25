'use client';

import Header from "@/components/Header";
import TermsViewer from "@/components/TermsViewer";
import { useEffect } from "react";
import { useHeaderStore } from "@/stores/header-store";

export default function MarketingConsent() {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "개인정보 마케팅 활용 동의",
      showBackButton: true,
    });
  }, [setHeader]);

  return (
    <div className="">
      <Header />
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
        <TermsViewer slug="marketing_consent" />
      </div>
    </div>
  );
}
