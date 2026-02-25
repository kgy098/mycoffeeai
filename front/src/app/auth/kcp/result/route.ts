import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const enc_cert_data = (formData.get("enc_cert_Data") as string) || "";
    const cert_no = (formData.get("cert_no") as string) || "";
    const res_cd = (formData.get("res_cd") as string) || "";
    const res_msg = (formData.get("res_msg") as string) || "";

    // KCP 인증 실패인 경우
    if (res_cd !== "0000" || !enc_cert_data) {
      return new NextResponse(
        buildHtml(false, null, res_msg || "본인인증에 실패했습니다."),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // 백엔드에 복호화 요청
    let userData = null;
    try {
      const backendRes = await fetch(
        `${BACKEND_URL.replace(/\/$/, "")}/api/auth/kcp-decrypt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enc_cert_data, cert_no }),
        }
      );
      const data = await backendRes.json();
      if (data.success) {
        userData = data;
      } else {
        return new NextResponse(
          buildHtml(false, null, data.message || "복호화에 실패했습니다."),
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    } catch (e) {
      return new NextResponse(
        buildHtml(false, null, "서버 통신 오류가 발생했습니다."),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return new NextResponse(buildHtml(true, userData, ""), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    return new NextResponse(
      buildHtml(false, null, "처리 중 오류가 발생했습니다."),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

// GET 요청도 처리 (일부 KCP 버전에서 GET으로 콜백하는 경우)
export async function GET(request: NextRequest) {
  return new NextResponse(
    buildHtml(false, null, "잘못된 접근입니다."),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function buildHtml(
  success: boolean,
  userData: any | null,
  errorMessage: string
): string {
  const messageData = success
    ? JSON.stringify({
        type: "KCP_DONE",
        verified: true,
        user_name: userData?.user_name || "",
        phone_number: userData?.phone_number || "",
        birth_day: userData?.birth_day || "",
        sex_code: userData?.sex_code || "",
      })
    : JSON.stringify({
        type: "KCP_FAIL",
        message: errorMessage,
      });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>본인인증 처리중</title>
  <style>
    body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif; background: #f9fafb; }
    .msg { text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="msg">인증 결과를 전달하고 있습니다...</div>
  <script>
    (function() {
      try {
        if (window.opener) {
          window.opener.postMessage(${messageData}, '*');
        }
      } catch(e) {}
      setTimeout(function() { window.close(); }, 500);
    })();
  </script>
</body>
</html>`;
}
