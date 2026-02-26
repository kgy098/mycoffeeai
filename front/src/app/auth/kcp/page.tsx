"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export default function KCPAuthPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [siteCd, setSiteCd] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 백엔드에서 사이트코드 조회 후 자동 제출
    api
      .get("/api/auth/kcp-info")
      .then((res) => {
        setSiteCd(res.data.site_cd);
        setLoading(false);
      })
      .catch(() => {
        // fallback
        setSiteCd("ALE8G");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && siteCd && formRef.current) {
      formRef.current.submit();
    }
  }, [loading, siteCd]);

  // Ret_URL: KCP 인증 완료 후 돌아올 URL
  const retUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/kcp/result`
      : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-text-secondary">본인인증 준비 중...</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      method="post"
      action="https://cert.kcp.co.kr/kcp_cert/cert_view.jsp"
    >
      <input type="hidden" name="req_tx" value="cert" />
      <input type="hidden" name="site_cd" value={siteCd} />
      <input type="hidden" name="ordr_idxx" value={`OID${Date.now()}`} />
      <input type="hidden" name="cert_method" value="01" />
      <input type="hidden" name="Ret_URL" value={retUrl} />
      <input type="hidden" name="cert_opr" value="00" />
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-text-secondary">KCP 본인인증으로 이동 중...</p>
      </div>
    </form>
  );
}
