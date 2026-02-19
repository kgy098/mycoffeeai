-- users 테이블에 현재 포인트 잔액 컬럼 추가

ALTER TABLE users
  ADD COLUMN point_balance INT NOT NULL DEFAULT 0 COMMENT '현재 포인트 잔액'
  AFTER last_login_at;
