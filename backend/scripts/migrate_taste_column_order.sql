-- 취향 컬럼 순서: 향 → 산미 → 고소함 → 단맛 → 바디 (aroma, acidity, nuttiness, sweetness, body)
-- migrate_aroma_attributes.sql 적용 후 실행

-- blends: nuttiness를 acidity 다음으로, sweetness를 nuttiness 다음으로, body를 sweetness 다음으로
ALTER TABLE blends MODIFY COLUMN nuttiness INT NOT NULL COMMENT '고소함 1-5' AFTER acidity;
ALTER TABLE blends MODIFY COLUMN sweetness INT NOT NULL COMMENT '단맛 1-5' AFTER nuttiness;
ALTER TABLE blends MODIFY COLUMN body INT NOT NULL COMMENT '바디 1-5' AFTER sweetness;

-- analysis_results: 동일 순서
ALTER TABLE analysis_results MODIFY COLUMN nuttiness INT NOT NULL COMMENT '고소함 1-5' AFTER acidity;
ALTER TABLE analysis_results MODIFY COLUMN sweetness INT NOT NULL COMMENT '단맛 1-5' AFTER nuttiness;
ALTER TABLE analysis_results MODIFY COLUMN body INT NOT NULL COMMENT '바디 1-5' AFTER sweetness;
