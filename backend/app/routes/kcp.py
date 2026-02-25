"""KCP 본인인증 라우트"""
import json
import uuid
import logging
import httpx
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


class KCPDecryptRequest(BaseModel):
    enc_cert_data: str
    cert_no: str


class KCPDecryptResponse(BaseModel):
    success: bool
    user_name: str = ""
    phone_number: str = ""
    birth_day: str = ""
    sex_code: str = ""
    ci: str = ""
    di: str = ""
    message: str = ""


@router.post("/kcp-decrypt", response_model=KCPDecryptResponse)
async def kcp_decrypt(body: KCPDecryptRequest):
    """KCP 암호화 인증 데이터를 복호화하여 사용자 정보 반환"""
    try:
        req_data = {
            "kcp_cert_info": settings.kcp_cert_info,
            "site_cd": settings.kcp_site_cd,
            "ordr_idxx": f"OID{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8]}",
            "cert_no": body.cert_no,
            "ct_type": "DEC",
            "enc_cert_Data": body.enc_cert_data,
            "kcp_sign_data": "",
        }

        headers = {"Content-Type": "application/json", "charset": "UTF-8"}
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                settings.kcp_cert_url,
                headers=headers,
                content=json.dumps(req_data, ensure_ascii=False, indent="\t").encode("utf8"),
            )

        res_data = json.loads(res.text)
        logger.info("KCP decrypt response code: %s", res_data.get("res_cd"))

        if res_data.get("res_cd") == "0000":
            return KCPDecryptResponse(
                success=True,
                user_name=res_data.get("user_name", ""),
                phone_number=res_data.get("phone_no", ""),
                birth_day=res_data.get("birth_day", ""),
                sex_code=res_data.get("sex_code", ""),
                ci=res_data.get("ci", ""),
                di=res_data.get("di", ""),
            )
        else:
            return KCPDecryptResponse(
                success=False,
                message=res_data.get("res_msg", "인증 데이터 복호화에 실패했습니다."),
            )

    except Exception as e:
        logger.error("KCP decrypt error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"KCP 복호화 오류: {str(e)}",
        )


@router.get("/kcp-info")
async def kcp_info():
    """KCP 인증 요청에 필요한 사이트코드 반환"""
    return {
        "site_cd": settings.kcp_site_cd,
    }
