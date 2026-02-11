-- 자동로그인 컬럼 추가 (users 테이블)
-- 실행 전 백업 권장

-- 자동로그인 사용 여부 (체크 시 1)
ALTER TABLE users ADD COLUMN auto_login_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT '자동로그인 사용 여부';

-- 자동로그인 검증용 토큰 (remember_me 체크 시 저장, 쿠키와 비교)
ALTER TABLE users ADD COLUMN auto_login_token VARCHAR(255) DEFAULT NULL COMMENT '자동로그인 토큰';

-- 인덱스: 토큰으로 사용자 조회 시 사용 (선택)
-- CREATE INDEX idx_users_auto_login_token ON users(auto_login_token);
