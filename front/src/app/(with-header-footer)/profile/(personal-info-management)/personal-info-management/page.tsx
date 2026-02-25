"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionSheet from "@/components/ActionSheet";
import { useHeaderStore } from "@/stores/header-store";
import Link from "next/link";
import DatePicker from "@/app/auth/components/DatePicker";
import { useUserStore } from "@/stores/user-store";
import { removeAccessTokenCookie } from "@/utils/cookies";
import { useGet, usePut } from "@/hooks/useApi";

const PersonalInfoManagement = () => {
  const router = useRouter();
  const { setHeader } = useHeaderStore();
  const { user, resetUser } = useUserStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showLogOutModal, setShowLogOutModal] = useState(false);

  const { data: profile, refetch } = useGet<any>(
    ["profile"],
    "/api/auth/profile",
    undefined,
    { enabled: !!user?.isAuthenticated }
  );

  const { mutate: updateProfile } = usePut<any, any>("/api/auth/profile", {
    onSuccess: () => {
      alert("개인정보가 변경되었습니다.");
      refetch();
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail || "변경에 실패했습니다.");
    },
  });

  useEffect(() => {
    setHeader({
      title: "개인정보관리",
      showBackButton: true,
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.display_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone_number || "");
      if (profile.birth_date) {
        setBirth(profile.birth_date);
      }
      if (profile.gender) {
        setGender(profile.gender as "male" | "female");
      }
    }
  }, [profile]);

  const handleChangePhone = () => {
    router.push("/profile/change-phone");
  };

  const handleSaveProfile = () => {
    updateProfile({
      display_name: name,
      birth_date: birth || null,
      gender,
    });
  };

  const handleLogout = () => {
    removeAccessTokenCookie();
    resetUser();
    setShowLogOutModal(false);
    router.push('/auth/login');
  };

  return (
    <>
      <div className="bg-background p-4">
        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm leading-[20px] font-bold text-gray-0 mb-2">
            이름
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이기홍"
            className="input-default"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm leading-[20px] font-bold text-gray-0 mb-2">
            아이디 또는 이메일
          </label>
          <input
            value={email}
            readOnly
            placeholder="example@gmail.com"
            className="input-default bg-gray-100"
          />
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="block text-sm leading-[20px] font-bold text-gray-0 mb-2">
            휴대폰 번호
          </label>
          <div className="flex items-center gap-2">
            <input
              value={phone}
              readOnly
              placeholder="휴대폰 번호를 입력해주세요."
              className="input-default"
            />
            <button
              onClick={handleChangePhone}
              className="px-4 shrink-0 h-10 text-sm leading-[20px] rounded-lg bg-action-secondary text-action-primary font-bold"
            >
              변경
            </button>
          </div>
        </div>

        {/* Birth */}
        <div className="mb-3">
          <DatePicker
            id="birth"
            label="생년월일"
            value={birth}
            onChange={(value) => setBirth(value)}
            error={""}
            placeholder="년도 / 월 / 일"
            required
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm leading-[20px] font-bold text-gray-0 mb-2">
            성별
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />
              <span className="text-xs leading-[16px]">남자</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />
              <span className="text-xs leading-[16px]">여자</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          className="w-full h-12 rounded-lg font-bold text-base bg-linear-gradient text-white mb-4"
        >
          개인정보 변경
        </button>

        <hr className="border-t border-border-default mt-3 mb-4" />

        {/* Actions */}
        <div className=" flex flex-col gap-2.5 ">
          <button
            onClick={() => setShowLogOutModal(true)}
            className="w-full flex items-center justify-between py-1.5 px-2"
          >
            <span className="text-xs leading-[18px] text-gray-0">로그아웃</span>
            <ChevronRight size={20} className="text-icon-default" />
          </button>
          <Link
            href="/profile/membership-withdraw"
            className="w-full flex items-center justify-between py-1.5 px-2"
          >
            <span className="text-xs leading-[18px] text-gray-0">회원탈퇴</span>
            <ChevronRight size={20} className="text-icon-default" />
          </Link>
        </div>
      </div>

      {/* Show modal action sheet */}
      <ActionSheet
        isOpen={showLogOutModal}
        onClose={() => setShowLogOutModal(false)}
      >
        <div className="">
          <p className="mb-6 text-center text-base leading-[20px] font-bold">
            로그아웃 하시겠습니까?
          </p>
          <button
            onClick={handleLogout}
            className={`inline-block mb-2 text-center w-full mt-auto py-3 rounded-lg font-bold leading-[24px] bg-[#DC3545] text-white`}
          >
            예
          </button>
          <button
            onClick={() => setShowLogOutModal(false)}
            className={`inline-block text-center w-full mt-auto py-3 rounded-lg font-bold leading-[24px]`}
          >
            아니오
          </button>
        </div>
      </ActionSheet>
    </>
  );
};

export default PersonalInfoManagement;
