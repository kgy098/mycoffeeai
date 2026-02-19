-- admins 테이블이 코드와 맞도록 수정 (선택)
-- 현재 코드: users(이메일, password_hash) + admins(user_id bigint FK → users.id), admins에는 password_hash 없음.
--
-- [상황 1] 이미 admins에 user_id varchar, password_hash 있는 경우:
--   1) users 테이블에 관리자 계정이 있어야 함 (email, password_hash 등).
--   2) admins 테이블은 user_id를 users.id(bigint)로 참조해야 함.
--
-- [상황 2] 처음부터 코드 스키마로 맞추는 경우 (권장):
--   아래 스키마로 admins 생성/수정 후, 관리자 회원가입(/admin/register)으로 계정 생성.

-- 기존 admins 구조가 다를 때만 실행 (데이터 백업 후 진행 권장)
-- 1) 기존 admins 백업
-- CREATE TABLE admins_backup AS SELECT * FROM admins;

-- 2) 기존 테이블 삭제 후 재생성 (필요 시)
-- DROP TABLE IF EXISTS admins;

-- 3) 코드와 동일한 admins 스키마 (user_id = users.id, password는 users 테이블에만)
/*
CREATE TABLE admins (
  id bigint NOT NULL AUTO_INCREMENT,
  user_id bigint NOT NULL,
  role varchar(64) DEFAULT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY user_id (user_id),
  CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
*/

-- 4) 이미 users에 관리자 계정이 있고, 그 id를 admins에 넣을 때
-- INSERT INTO admins (user_id, role) VALUES (1, 'admin');  -- 1을 해당 users.id로 변경
