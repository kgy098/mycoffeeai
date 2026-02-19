-- admins 테이블: 비밀번호 제거, user_id bigint. 외래키는 DB에서 별도 삭제.
-- 관리자 회원가입 시 users + admins 둘 다 insert (코드에서 처리).

-- 1) 기존 테이블 백업 (필요 시)
-- CREATE TABLE admins_backup AS SELECT * FROM admins;

-- 2) 기존 테이블 삭제 후 재생성
-- DROP TABLE IF EXISTS admins;

-- 3) admins 스키마 (password_hash 없음, user_id bigint, FK 없음)
CREATE TABLE admins (
  id bigint NOT NULL AUTO_INCREMENT,
  user_id bigint NOT NULL,
  role varchar(64) DEFAULT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
