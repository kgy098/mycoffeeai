"use client";
import Header from "@/components/Header";
import TermsViewer from "@/components/TermsViewer";
import { useHeaderStore } from "@/stores/header-store";
import { useEffect } from "react";

export default function MarketingTermsPage() {

    const { setHeader } = useHeaderStore();

    useEffect(() => {
      setHeader({
        title: "앱 출시 알림 동의",
        showBackButton: true,
      });
      sessionStorage.setItem("internal-navigation", "true");
    }, []);

    return (
        <div>
            <Header />
            <div className="p-4">
                <div className="bg-white rounded-2xl border border-border-default p-3">
                    <TermsViewer slug="marketing_consent" />
                </div>
            </div>
        </div>
    )
}
