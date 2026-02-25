"use client";
import ActionSheet from "@/components/ActionSheet";
import { useHeaderStore } from "@/stores/header-store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { usePut } from "@/hooks/useApi";

const ChangePhone = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");

  const { setHeader } = useHeaderStore();

  const { mutate: updateProfile } = usePut<any, any>("/api/auth/profile", {
    onSuccess: () => {
      setShowModal(true);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail || "변경에 실패했습니다.");
    },
  });

  useEffect(() => {
    setHeader({
      title: "휴대폰변경",
      showBackButton: true,
    });
  }, []);

  // KCP postMessage listener
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data;
      if (!data?.type) return;

      if (data.type === "KCP_DONE") {
        setIsVerified(true);
        setVerifiedPhone(data?.phone_number || "");
      } else if (data.type === "KCP_FAIL") {
        setIsVerified(false);
        setVerifiedPhone("");
        alert(data.message || "본인인증에 실패했습니다.");
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const openKcpAuth = () => {
    const width = 480;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const url = `${window.location.origin}/auth/kcp`;

    window.open(
      url,
      "kcpAuth",
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no`
    );
  };

  const handleChangePhone = () => {
    if (!verifiedPhone) return;
    updateProfile({ phone_number: verifiedPhone });
  };

  const handleConfirm = () => {
    setShowModal(false);
    router.back();
  };

  return (
    <div className="bg-background p-4 pt-6 pb-2 flex flex-col justify-between min-h-[calc(100dvh-56px)]">
      <div>
        <div className="mb-4">
          <label className="block text-sm leading-[20px] font-bold text-gray-0 mb-2">
            휴대폰 본인인증
          </label>
          <p className="text-xs leading-[18px] text-text-secondary mb-4">
            KCP 본인인증을 통해 휴대폰 번호를 변경할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={openKcpAuth}
            disabled={isVerified}
            className={`w-full btn-primary-empty ${
              isVerified
                ? "!cursor-not-allowed !text-icon-disabled !bg-action-disabled"
                : "bg-action-secondary text-action-primary"
            }`}
          >
            {isVerified ? (
              <div className="flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M13.3334 4L6.00002 11.3333L2.66669 8"
                    stroke="#9CA3AF"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                인증 완료 ({verifiedPhone})
              </div>
            ) : (
              "본인인증 요청"
            )}
          </button>
        </div>
      </div>

      <button
        onClick={handleChangePhone}
        disabled={!isVerified}
        className={`inline-block text-center w-full mt-auto py-3 rounded-lg font-bold leading-[24px] ${
          !isVerified
            ? "bg-action-disabled text-icon-disabled"
            : "bg-linear-gradient text-white"
        }`}
      >
        휴대폰 변경하기
      </button>

      {/* Show modal action sheet */}
      <ActionSheet isOpen={showModal} onClose={() => setShowModal(false)}>
        <div>
          <p className="mb-6 text-center text-base leading-[20px] font-bold">
            변경이 완료 되었습니다.
          </p>
          <button
            onClick={handleConfirm}
            className={`inline-block text-center w-full mt-auto py-3 rounded-lg font-bold leading-[24px] bg-linear-gradient text-white`}
          >
            확인
          </button>
        </div>
      </ActionSheet>
    </div>
  );
};

export default ChangePhone;
