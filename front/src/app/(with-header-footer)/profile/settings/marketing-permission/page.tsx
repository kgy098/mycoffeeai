"use client";
import ActionSheet from "@/components/ActionSheet";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useHeaderStore } from "@/stores/header-store";
import { usePut } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";
import TermsViewer from "@/components/TermsViewer";

const MarketingPermission = () => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [agreedAt, setAgreedAt] = useState<string | null>(null);
  const { user } = useUserStore();
  const userId = user?.data?.user_id;

  const { setHeader } = useHeaderStore();

  useEffect(() => {
    setHeader({
      title: "개인정보 마케팅 활용 동의",
      showBackButton: true,
    });
  }, []);

  const { mutate: updateConsent } = usePut("/api/user-consents", {
    onSuccess: (data) => {
      setAgreedAt(data?.agreed_at || new Date().toISOString());
      setIsAgreed(true);
    }
  });

  const handleAgree = () => {
    if (!userId) return;
    updateConsent({ user_id: userId, consent_type: "marketing", is_agreed: true });
  };

  return (
    <div className="bg-background p-4 pb-0 flex flex-col justify-between h-[calc(100vh-145px)]">
      <div className="bg-white rounded-2xl border border-border-default p-3">
        <TermsViewer slug="marketing_consent" />
      </div>

      {/* Agree Button */}
      <button
        onClick={handleAgree}
        className="w-full mt-auto  py-3 bg-linear-gradient text-white rounded-lg font-bold leading-[24px] mt-auto"
      >
        동의하기
      </button>

      {/* Agree Modal Action sheet*/}
      <ActionSheet isOpen={isAgreed} onClose={() => setIsAgreed(false)}>
        <div className="">
          <p className="text-base leading-[20px] font-bold text-center">
            개인정보 마케팅 활용 동의 안내
          </p>

          <div className="w-42 text-center text-xs leading-[18px] mx-auto my-6">
            전송자 : MyCoffee.Ai
            <br />
            전송매체 : 이메일,SMS,푸시 알림
            <br />
            수신 동의 일시 : {agreedAt ? new Date(agreedAt).toLocaleDateString("ko-KR") : "-"}
            <br />
            처리내용 : 수신 동의 처리 완료
          </div>

          <Link
            href="/profile/settings/my-settings"
            className="inline-block text-center w-full mt-auto  py-3 bg-linear-gradient text-white rounded-lg font-bold leading-[24px]"
          >
            확인
          </Link>
        </div>
      </ActionSheet>
    </div>
  );
};

export default MarketingPermission;
