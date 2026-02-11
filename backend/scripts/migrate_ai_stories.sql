-- AI 스토리 전용 테이블 (취향분석 상세 진입 시 1회 생성, 컬렉션은 analysis_result_id로 조회)
-- 실행 전 백업 권장

CREATE TABLE ai_stories (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'PK',
    analysis_result_id INT NOT NULL COMMENT '분석 결과 ID (analysis_results.id, 분석결과당 1건)',
    blend_id INT NULL COMMENT '블렌드 ID (blends.id)',
    sections JSON NOT NULL COMMENT '4개 섹션: title, icon, content[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    UNIQUE KEY uq_ai_stories_analysis_result_id (analysis_result_id),
    KEY idx_ai_stories_blend_id (blend_id)
) COMMENT='AI 커피 추천 스토리 (분석결과당 1건)';
