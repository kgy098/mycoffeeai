-- events 테이블에 상세 화면 이미지 컬럼 추가
-- 썸네일(thumbnail_url)과 별도로 상세 페이지에서 사용할 이미지 URL 저장
-- 실행 전 백업 권장

ALTER TABLE `events`
  ADD COLUMN `detail_image_url` VARCHAR(1024) DEFAULT NULL COMMENT '이벤트 상세 화면 이미지 URL' AFTER `thumbnail_url`;
