"use client";
import { ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useHeaderStore } from "@/stores/header-store";
import { useGet, usePut } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";

const ApplyTermOfUse = () => {
  const router = useRouter();
  const { setHeader } = useHeaderStore();
  const { user } = useUserStore();
  const userId = user?.data?.user_id;
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const { data: consents } = useGet<any[]>(
    ["user-consents", userId],
    "/api/user-consents",
    { params: { user_id: userId } },
    { enabled: !!userId }
  );

  useEffect(() => {
    const marketing = consents?.find(
      (item) => item.consent_type === "marketing"
    );
    setMarketingAgreed(!!marketing?.is_agreed);
  }, [consents]);

  const { mutate: updateConsent } = usePut("/api/user-consents", {
    onSuccess: () => {
      setMarketingAgreed(false);
    },
  });

  useEffect(() => {
    setHeader({
      title: "약관 및 개인정보 처리 동의",
      showBackButton: true,
    });
  }, []);

  const handleMarketingRevoke = () => {
    if (!userId) return;
    updateConsent({
      user_id: userId,
      consent_type: "marketing",
      is_agreed: false,
    });
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl border border-border-default p-3">
        <Link
          href="/profile/settings/apply-term-of-use/collect-and-use-personal-info"
          className="flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs leading-[18px] font-normal">
              개인정보 수집 및 이용 동의
            </span>
          </div>
          <ChevronRight size={20} className="text-icon-default" />
        </Link>
        <Link
          href="/profile/settings/apply-term-of-use/service_terms"
          className="flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs leading-[18px] font-normal">
              이용약관 동의
            </span>
          </div>
          <ChevronRight size={20} className="text-icon-default" />
        </Link>
        <Link
          href="/profile/settings/apply-term-of-use/third-party-provision"
          className="flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs leading-[18px] font-normal">
              구매 조건 및 개인정보 제3자 제공
            </span>
          </div>
          <ChevronRight size={20} className="text-icon-default" />
        </Link>
        <Link
          href="/profile/settings/apply-term-of-use/subscription_terms"
          className="flex items-center justify-between py-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs leading-[18px] font-normal">
              정기구독 이용약관 동의
            </span>
          </div>
          <ChevronRight size={20} className="text-icon-default" />
        </Link>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs leading-[18px] font-normal">
              개인정보 마케팅 활용 동의
            </span>
          </div>
          {marketingAgreed ? (
            <button
              onClick={handleMarketingRevoke}
              className="px-3 py-1 text-xs leading-[18px] rounded-lg bg-gray-200 text-gray-700 font-bold"
            >
              미동의
            </button>
          ) : (
            <button
              onClick={() =>
                router.push("/profile/settings/marketing-permission")
              }
              className="px-3 py-1 text-xs leading-[18px] rounded-lg bg-action-secondary text-action-primary font-bold"
            >
              동의
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyTermOfUse;
