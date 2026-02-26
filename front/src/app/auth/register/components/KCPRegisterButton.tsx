'use client';

import { useEffect, useState, Dispatch, SetStateAction } from 'react';

interface KCPRegisterButtonProps {
  onRegisterError?: (error: string) => void;
  kcpUrl?: string;
  setFormData: Dispatch<SetStateAction<any>>;
  setVerifiedData: Dispatch<SetStateAction<any>>;
}


export default function KCPRegisterButton({
  onRegisterError,
  kcpUrl,
  setFormData,
  setVerifiedData,
}: KCPRegisterButtonProps) {

  const [hasVerificationError, setHasVerificationError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // KCP postMessage listener
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data;
      if (!data?.type) return;

      if (data.type === 'KCP_DONE') {
        setIsVerified(true);
        setVerifiedData(data);

        // birth_day: "19900101" or "1990-01-01" 형식 파싱
        const raw = data?.birth_day || '';
        const digits = raw.replace(/\D/g, '');
        const birthYear = digits.length >= 4 ? digits.slice(0, 4) : '';
        const birthMonth = digits.length >= 6 ? digits.slice(4, 6) : '';
        const birthDay = digits.length >= 8 ? digits.slice(6, 8) : '';

        const gender = data?.sex_code === '01' ? 'male' : 'female';

        setFormData((prev: any) => ({
          ...prev,
          phone: data?.phone_number || prev.phone,
          name: data?.user_name || prev.name,
          gender,
          // birthDate 또는 birthYear/Month/Day 둘 다 지원
          ...(prev.birthYear !== undefined
            ? { birthYear, birthMonth, birthDay }
            : { birthDate: data?.birth_day }),
        }));
      } else if (data.type === 'KCP_FAIL') {
        const errorMsg = data.message || '본인인증에 실패했습니다.';
        setIsVerified(false);
        setHasVerificationError(true);
        setVerifiedData(null);
        if (onRegisterError) {
          onRegisterError(errorMsg);
        }
      }
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onRegisterError, setFormData, setVerifiedData]);

  const openKcpAuth = () => {
    const width = 480;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const url = kcpUrl || `${window.location.origin}/auth/kcp`;

    window.open(
      url,
      'kcpAuth',
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no`
    );
  };

  return (
    <button
      type="button"
      onClick={openKcpAuth}
      className={`btn-primary-empty shrink-0 whitespace-nowrap px-4 bg-action-secondary text-action-primary
        ${isVerified ?
          '!cursor-not-allowed !text-icon-disabled !bg-action-disabled' :
          'cursor-pointer bg-action-secondary text-action-primary'}
        `}
        disabled={isVerified}
    >
      {isVerified ? '인증완료' : '본인인증'}
    </button>
  );
}
