"use client";
import ActionSheet from "@/components/ActionSheet";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useHeaderStore } from "@/stores/header-store";
import { useGet, usePut } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";
import TermsViewer from "@/components/TermsViewer";

type NotificationSettings = {
  push_enabled: boolean;
  marketing_agreed: boolean;
  marketing_agreed_at: string | null;
};

const MarketingPermission = () => {
  const [showResult, setShowResult] = useState(false);
  const [resultAction, setResultAction] = useState<"agree" | "revoke">("agree");
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

  const { data: settings } = useGet<NotificationSettings>(
    ["notification-settings", userId],
    "/api/notification-settings",
    { params: { user_id: userId } },
    { enabled: !!userId }
  );

  const isCurrentlyAgreed = !!settings?.marketing_agreed;

  const { mutate: updateSettings } = usePut("/api/notification-settings", {
    onSuccess: (data) => {
      setAgreedAt(data?.marketing_agreed_at || new Date().toISOString());
      setShowResult(true);
    },
  });

  const handleAgree = () => {
    if (!userId) return;
    setResultAction("agree");
    updateSettings({ user_id: userId, marketing_agreed: true });
  };

  const handleRevoke = () => {
    if (!userId) return;
    if (!window.confirm("마케팅 활용 동의를 철회하시겠습니까?")) return;
    setResultAction("revoke");
    updateSettings({ user_id: userId, marketing_agreed: false });
  };

  return (
    <div className="bg-background p-4 pb-0 flex flex-col justify-between h-[calc(100vh-145px)]">
      <div className="bg-white rounded-2xl border border-border-default p-3">
        <TermsViewer slug="marketing_consent" />
      </div>

      {/* Buttons */}
      {isCurrentlyAgreed ? (
        <button
          onClick={handleRevoke}
          className="w-full mt-auto py-3 bg-gray-200 text-gray-700 rounded-lg font-bold leading-[24px]"
        >
          동의 철회
        </button>
      ) : (
        <button
          onClick={handleAgree}
          className="w-full mt-auto py-3 bg-linear-gradient text-white rounded-lg font-bold leading-[24px]"
        >
          동의하기
        </button>
      )}

      {/* Result Action Sheet */}
      <ActionSheet isOpen={showResult} onClose={() => setShowResult(false)}>
        <div>
          <p className="text-base leading-[20px] font-bold text-center">
            개인정보 마케팅 활용 동의 안내
          </p>

          {resultAction === "agree" ? (
            <div className="w-42 text-center text-xs leading-[18px] mx-auto my-6">
              전송자 : MyCoffee.Ai
              <br />
              전송매체 : 이메일,SMS,푸시 알림
              <br />
              수신 동의 일시 :{" "}
              {agreedAt
                ? new Date(agreedAt).toLocaleDateString("ko-KR")
                : "-"}
              <br />
              처리내용 : 수신 동의 처리 완료
            </div>
          ) : (
            <div className="w-42 text-center text-xs leading-[18px] mx-auto my-6">
              전송자 : MyCoffee.Ai
              <br />
              전송매체 : 이메일,SMS,푸시 알림
              <br />
              철회 일시 :{" "}
              {new Date().toLocaleDateString("ko-KR")}
              <br />
              처리내용 : 수신 동의 철회 완료
            </div>
          )}

          <Link
            href="/profile/settings/notification-settings"
            className="inline-block text-center w-full mt-auto py-3 bg-linear-gradient text-white rounded-lg font-bold leading-[24px]"
          >
            확인
          </Link>
        </div>
      </ActionSheet>
    </div>
  );
};

export default MarketingPermission;
