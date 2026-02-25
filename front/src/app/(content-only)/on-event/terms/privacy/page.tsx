"use client";
import Header from "@/components/Header";
import TermsViewer from "@/components/TermsViewer";
import { useHeaderStore } from "@/stores/header-store";
import { useEffect } from "react";

export default function PrivacyTermsPage() {

    const { setHeader } = useHeaderStore();

    useEffect(() => {
        setHeader({
            title: "개인정보 수집 및 약관 동의",
            showBackButton: true,
        });
        sessionStorage.setItem("internal-navigation", "true");
    }, []);

    return (
        <div>
            <Header />
            <div className="p-4">
                <div className="bg-white rounded-2xl border border-border-default p-3">
                    <TermsViewer slug="privacy_policy" />
                </div>
            </div>
        </div>
    )
}
