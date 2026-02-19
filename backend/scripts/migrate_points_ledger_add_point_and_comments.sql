-- points_ledger: 포인트 잔액 컬럼(point) 추가 + 전체 컬럼 코멘트
-- change_amount 는 그대로 두고, point(해당 거래 후 누적 잔액) 추가

ALTER TABLE points_ledger
  ADD COLUMN `point` INT NOT NULL DEFAULT 0 COMMENT '해당 거래 후 누적 포인트 잔액' AFTER change_amount,
  MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'PK',
  MODIFY COLUMN user_id BIGINT NOT NULL COMMENT '포인트 변동 대상 사용자 ID',
  MODIFY COLUMN transaction_type VARCHAR(20) NOT NULL DEFAULT 'earned' COMMENT '변동 구분: earned(적립), spent(사용), expired(만료)',
  MODIFY COLUMN change_amount INT NOT NULL COMMENT '이번 건 변동량 (적립=양수, 사용/만료=음수)',
  MODIFY COLUMN reason ENUM('review','purchase','manual','refund','event') NOT NULL COMMENT '변동 사유: review(리뷰보상), purchase(구매 등), manual(관리자), refund(환불), event(이벤트)',
  MODIFY COLUMN related_id BIGINT DEFAULT NULL COMMENT '연관 ID (리뷰 ID, 이벤트 ID 등)',
  MODIFY COLUMN note TEXT COMMENT '메모 (예: 포토 리뷰 작성 보상)',
  MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '내역 생성 시각';
