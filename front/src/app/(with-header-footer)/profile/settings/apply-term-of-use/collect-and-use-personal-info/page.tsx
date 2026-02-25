"use client";

import React, { useEffect } from "react";
import TermsViewer from "@/components/TermsViewer";
import { useHeaderStore } from "@/stores/header-store";

const ApplyTermDetail = () => {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "개인정보 수집 및 이용 동의",
      showBackButton: true,
    });
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl border border-border-default p-3">
        <TermsViewer slug="privacy_policy" />
      </div>
    </div>
  );
};

export default ApplyTermDetail;
