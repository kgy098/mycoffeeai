-- 향(aroma) 컬럼 추가 및 5개 속성 통일: aroma, acidity, sweetness, body, nuttiness
-- 기존 analysis_results: acidity 컬럼에 사용자 향(aroma) 저장됨, bitterness에 산미(acidity) 저장됨 → 보정

-- 1) blends: aroma 컬럼 추가 (기존 데이터는 기본값 3)
ALTER TABLE blends ADD COLUMN aroma INT NOT NULL DEFAULT 3 COMMENT '향 1-5' AFTER summary;

-- 2) analysis_results: aroma 컬럼 추가 후 기존 데이터 보정
ALTER TABLE analysis_results ADD COLUMN aroma INT NOT NULL DEFAULT 3 COMMENT '향 1-5' AFTER user_agent;
-- 기존 매핑 오류 보정: (acidity 컬럼 = 사용자 aroma, bitterness = 사용자 acidity)
UPDATE analysis_results SET aroma = acidity WHERE acidity IS NOT NULL;
UPDATE analysis_results SET acidity = bitterness WHERE bitterness IS NOT NULL;

-- 3) 5개 속성만 사용: bitterness 컬럼 제거
ALTER TABLE blends DROP COLUMN bitterness;
ALTER TABLE analysis_results DROP COLUMN bitterness;
