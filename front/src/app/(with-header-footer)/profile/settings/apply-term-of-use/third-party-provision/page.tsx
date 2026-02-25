"use client";

import React, { useEffect } from "react";
import TermsViewer from "@/components/TermsViewer";
import { useHeaderStore } from "@/stores/header-store";

const ThirdPartyProvision = () => {
  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "구매 조건 및 개인정보 제3자 제공",
      showBackButton: true,
    });
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl border border-border-default p-3">
        <TermsViewer slug="third_party_provision" />
      </div>
    </div>
  );
};

export default ThirdPartyProvision;
