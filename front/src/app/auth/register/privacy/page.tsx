'use client';

import Header from "@/components/Header";
import TermsViewer from "@/components/TermsViewer";
import { useEffect } from "react";
import { useHeaderStore } from "@/stores/header-store";

export default function PrivacyPolicy() {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "개인정보 수집 및 이용 동의",
      showBackButton: true,
    });
  }, [setHeader]);

  return (
    <div className="">
      <Header />
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
        <TermsViewer slug="privacy_policy" />
      </div>
    </div>
  );
}
