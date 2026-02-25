"use client";
import React, { useEffect, useState } from "react";
import ActionSheet from "@/components/ActionSheet";
import { useHeaderStore } from "@/stores/header-store";
import { useRouter } from "next/navigation";
import { usePost } from "@/hooks/useApi";
import { useUserStore } from "@/stores/user-store";
import { removeAccessTokenCookie, removeRememberTokenCookie } from "@/utils/cookies";

const MembershipWithdraw = () => {
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { resetUser } = useUserStore();

  const { setHeader } = useHeaderStore();

  const { mutate: withdraw } = usePost<any, any>("/api/auth/withdraw", {
    onSuccess: () => {
      setShowConfirmModal(true);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail || "회원탈퇴에 실패했습니다.");
    },
  });

  useEffect(() => {
    setHeader({
      title: "회원탈퇴",
      showBackButton: true,
    });
  }, []);

  const handleWithdraw = () => {
    if (isAgreed) {
      withdraw({});
    }
  };

  const handleConfirm = () => {
    removeAccessTokenCookie();
    removeRememberTokenCookie();
    resetUser();
    setShowConfirmModal(false);
    router.push("/auth/login-select");
  };

  return (
    <>
      <div className="bg-background p-4 pb-2 flex flex-col justify-between">
        {/* Warning Section */}
        <div className="border border-border-default rounded-2xl p-3 bg-white">
          <h2 className="text-base leading-[20px] font-bold mb-3">
            회원 탈퇴 전에 <br /> 아래 내용을 확인해주세요.
          </h2>

          <p className="text-sm leading-[20px] text-gray-0 mb-4">
            회원 탈퇴 시, 즉시 탈퇴 처리가 되며 탈퇴 후에는 포인트 및 내 커피
            이력 등 정보 기록 복구가 불가능합니다.
          </p>

          {/* Agreement Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="auth-checkbox w-5 h-5"
            />
            <span className="text-xs leading-[18px] text-gray-0">
              유의사항을 확인하였으며 회원 탈퇴에 동의합니다.
            </span>
          </label>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!isAgreed}
          className={`w-full h-12 rounded-lg font-bold text-base ${
            isAgreed
              ? "bg-action-primary text-white"
              : "bg-action-disabled text-icon-disabled cursor-not-allowed"
          }`}
        >
          탈퇴하기
        </button>
      </div>

      {/* Confirmation Modal */}
      <ActionSheet
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <div className="">
          <p className="mb-2 text-center text-base leading-[20px] font-bold">
            회원탈퇴가 완료되었습니다.
          </p>
          <p className="text-xs leading-[16px] text-text-secondary mb-6 text-center">
            그동안 이용해주셔서 감사합니다.
          </p>
          <button
            onClick={handleConfirm}
            className={`inline-block text-center w-full mt-auto py-3 rounded-lg font-bold leading-[24px] bg-linear-gradient text-white`}
          >
            확인
          </button>
        </div>
      </ActionSheet>
    </>
  );
};

export default MembershipWithdraw;
