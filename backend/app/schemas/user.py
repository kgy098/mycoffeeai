from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date

class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    phone_number: str
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    signup_purpose: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    provider: Optional[str] = "email"
    
    @field_validator('birth_date', mode='before')
    @classmethod
    def parse_birth_date(cls, v):
        if v is None or v == '':
            return None
        return v

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    phone_number: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    signup_purpose: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(UserBase):
    id: int
    is_admin: bool
    provider: Optional[str]

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    success: bool
    token: str
    token_type: str = "bearer"
    userId: int
    email: str
    display_name: Optional[str] = None
    remember_token: Optional[str] = None  # 자동로그인 체크 시에만 반환, 쿠키 저장용

class VerifyResponse(BaseModel):
    authenticated: bool
    userId: int
    email: str
    display_name: Optional[str] = None
    expAt: str
    reason: str = ""

class AutoLoginRequest(BaseModel):
    """자동로그인: 쿠키가 안 넘어갈 때(예: cross-origin 개발) body로 토큰 전달"""
    remember_token: Optional[str] = None


class FindIdRequest(BaseModel):
    phone_number: str

class FindIdResponse(BaseModel):
    success: bool
    accounts: list[dict]
