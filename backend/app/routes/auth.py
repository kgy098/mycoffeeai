from fastapi import APIRouter, Depends, HTTPException, status, Header, Request, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.admin_model import Admin
from app.models.access_log import AccessLog
from app.schemas.user import UserCreate, UserResponse, UserLogin, LoginResponse, VerifyResponse, FindIdRequest, FindIdResponse, AutoLoginRequest, ProfileResponse, ProfileUpdate
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    generate_auto_login_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        if db_user.status == "0":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="탈퇴한 회원입니다."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    now = datetime.utcnow()
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        display_name=user.display_name,
        phone_number=user.phone_number,
        birth_date=user.birth_date,
        gender=user.gender,
        signup_purpose=user.signup_purpose,
        provider=user.provider or "email",
        profile_image_url=user.profile_image_url,
        agreed_terms=user.agreed_terms or False,
        agreed_terms_at=now if user.agreed_terms else None,
        agreed_privacy=user.agreed_privacy or False,
        agreed_privacy_at=now if user.agreed_privacy else None,
        agreed_marketing=user.agreed_marketing or False,
        agreed_marketing_at=now if user.agreed_marketing else None,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=LoginResponse)
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )
    
    # Verify password
    if not user.password_hash or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )

    if user.status == "0":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="탈퇴한 계정입니다. 로그인할 수 없습니다."
        )

    # Create access token with different expiry based on remember_me
    from app.utils.security import ACCESS_TOKEN_EXPIRE_DAYS
    if credentials.remember_me:
        access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    else:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )

    # 자동로그인: 체크 시 DB에 플래그+토큰 저장, 응답에 remember_token 포함. 미체크 시 초기화
    remember_token: Optional[str] = None
    if credentials.remember_me:
        remember_token = generate_auto_login_token()
        user.auto_login_enabled = True
        user.auto_login_token = remember_token
    else:
        user.auto_login_enabled = False
        user.auto_login_token = None

    # Update last login
    from sqlalchemy.sql import func
    user.last_login_at = func.now()

    # Access log
    ip = request.client.host if request.client else "unknown"
    db.add(AccessLog(user_id=user.id, action="LOGIN", ip_address=ip))
    db.commit()

    return LoginResponse(
        success=True,
        token=access_token,
        token_type="bearer",
        userId=user.id,
        email=user.email,
        display_name=user.display_name,
        remember_token=remember_token,
    )

@router.post("/auto-login", response_model=LoginResponse)
async def auto_login(
    request: Request,
    body: Optional[AutoLoginRequest] = Body(None),
    db: Session = Depends(get_db),
):
    """쿠키(또는 body)의 remember_token과 DB 비교, 자동로그인 체크 여부 확인 후 동일 사용자면 로그인 응답 반환"""
    remember_token = request.cookies.get("remember_token") or (body.remember_token if body else None)
    if not remember_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="자동로그인 토큰이 없습니다.",
        )

    user = db.query(User).filter(
        User.auto_login_token == remember_token,
        User.auto_login_enabled == True,
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="자동로그인 정보가 유효하지 않습니다.",
        )

    if user.status == "0":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="탈퇴한 계정입니다. 로그인할 수 없습니다.",
        )

    from app.utils.security import ACCESS_TOKEN_EXPIRE_DAYS
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )

    # Access log
    ip = request.client.host if request.client else "unknown"
    db.add(AccessLog(user_id=user.id, action="AUTO_LOGIN", ip_address=ip))
    db.commit()

    return LoginResponse(
        success=True,
        token=access_token,
        token_type="bearer",
        userId=user.id,
        email=user.email,
        display_name=user.display_name,
        remember_token=None,  # 재발급하지 않음, 기존 쿠키 유지
    )


@router.get("/me", response_model=VerifyResponse)
async def verify_token(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if user.status == "0":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="탈퇴한 계정입니다."
        )

    exp_timestamp = payload.get("exp")
    exp_at = datetime.utcfromtimestamp(exp_timestamp).isoformat() if exp_timestamp else ""
    
    return VerifyResponse(
        authenticated=True,
        userId=user.id,
        email=user.email,
        display_name=user.display_name,
        expAt=exp_at,
        reason=""
    )

def _get_current_user(authorization: Optional[str], db: Session) -> User:
    """Bearer 토큰에서 사용자 조회 (공통 헬퍼)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status == "0":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="탈퇴한 계정입니다.")
    return user


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = _get_current_user(authorization, db)
    return user


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = _get_current_user(authorization, db)
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.post("/withdraw")
async def withdraw(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    user = _get_current_user(authorization, db)
    user.status = "0"
    user.auto_login_enabled = False
    user.auto_login_token = None
    db.commit()
    return {"success": True, "message": "회원탈퇴가 완료되었습니다."}


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminRegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str
    phone_number: str


@router.post("/admin-register", status_code=status.HTTP_201_CREATED)
async def admin_register(payload: AdminRegisterRequest, db: Session = Depends(get_db)):
    """관리자 회원가입. users에 계정 생성 후 admins에 등록(처음 설정용). 이름/전화번호 필수."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다.",
        )
    name = (payload.display_name or "").strip()
    phone = (payload.phone_number or "").strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이름을 입력하세요.")
    if not phone:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="전화번호를 입력하세요.")
    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        display_name=name,
        phone_number=phone,
        provider="email",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    admin_row = Admin(user_id=user.id, role="admin")
    db.add(admin_row)
    db.commit()
    return {"success": True, "message": "관리자 계정이 생성되었습니다.", "email": user.email}


@router.post("/admin-login", response_model=LoginResponse)
async def admin_login(request: Request, credentials: AdminLoginRequest, db: Session = Depends(get_db)):
    """관리자 전용 로그인. users 테이블로 이메일/비밀번호 검증 후, admins 테이블에 등록된 사용자만 허용."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )
    if not user.password_hash or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )
    if user.status == "0":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="탈퇴한 계정입니다. 로그인할 수 없습니다.",
        )
    admin_row = db.query(Admin).filter(Admin.user_id == user.id).first()
    if not admin_row:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 없습니다.",
        )
    from app.utils.security import ACCESS_TOKEN_EXPIRE_DAYS
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )
    from sqlalchemy.sql import func
    user.last_login_at = func.now()

    # Access log
    ip = request.client.host if request.client else "unknown"
    db.add(AccessLog(user_id=user.id, action="ADMIN_LOGIN", ip_address=ip))
    db.commit()

    return LoginResponse(
        success=True,
        token=access_token,
        token_type="bearer",
        userId=user.id,
        email=user.email,
        display_name=user.display_name,
        remember_token=None,
    )


@router.post("/find-id", response_model=FindIdResponse)
async def find_id(request: FindIdRequest, db: Session = Depends(get_db)):
    # Find users by phone number
    users = db.query(User).filter(User.phone_number == request.phone_number).all()
    
    if not users:
        return FindIdResponse(
            success=True,
            accounts=[]
        )
    
    accounts = []
    for user in users:
        # Mask email for privacy
        email_parts = user.email.split('@')
        if len(email_parts) == 2:
            masked_email = email_parts[0][:4] + '****@' + email_parts[1]
        else:
            masked_email = user.email[:4] + '****'
        
        accounts.append({
            'id': masked_email,
            'type': user.provider or 'email',
            'typeName': {
                'email': '이메일',
                'kakao': '카카오',
                'naver': '네이버',
                'apple': 'Apple'
            }.get(user.provider or 'email', '이메일'),
            'lastLogin': user.last_login_at.strftime('%Y년 %m월 %d일') if user.last_login_at else '로그인 내역 없음'
        })
    
    return FindIdResponse(
        success=True,
        accounts=accounts
    )
