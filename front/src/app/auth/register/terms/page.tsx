'use client';

import Header from "@/components/Header";
import TermsViewer from "@/components/TermsViewer";
import { useEffect } from "react";
import { useHeaderStore } from "@/stores/header-store";

export default function TermsOfService() {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "이용약관",
      showBackButton: true,
    });
  }, [setHeader]);

  return (
    <div className="">
      <Header />
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
        <TermsViewer slug="service_terms" />
      </div>
    </div>
  );
}
