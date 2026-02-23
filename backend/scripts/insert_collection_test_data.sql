-- 컬렉션 테스트 데이터: 회원별 1~2건 (analysis_results + user_collections)
-- 실행 전: users, blends 테이블에 데이터 필요
-- insert_user_test_data.sql 을 먼저 실행하세요.

-- ============================================================
-- 1) analysis_results INSERT (회원별 1~2건, 다양한 취향 조합)
-- ============================================================

-- 김민준 (2건) - 향 강한 취향
SET @uid := (SELECT id FROM users WHERE email = 'kim.minjun@gmail.com' LIMIT 1);
SET @bid := (SELECT id FROM blends ORDER BY id LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 5, 3, 2, 4, 3, @bid, '2026-01-10 10:00:00'),
(@uid, 4, 2, 3, 5, 2, @bid, '2026-02-05 14:20:00');

-- 이소연 (2건) - 산미 좋아하는 취향
SET @uid := (SELECT id FROM users WHERE email = 'lee.soyeon@naver.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 3, 5, 4, 2, 1, @bid, '2026-01-15 11:30:00'),
(@uid, 3, 4, 3, 3, 2, @bid, '2026-02-10 09:15:00');

-- 박지훈 (1건) - 바디감 선호
SET @uid := (SELECT id FROM users WHERE email = 'park.jihoon@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 2, 1, 2, 5, 4, @bid, '2026-01-20 15:00:00');

-- 최유나 (2건) - 달콤한 취향
SET @uid := (SELECT id FROM users WHERE email = 'choi.yuna@kakao.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 3, 2, 5, 3, 4, @bid, '2026-01-08 08:30:00'),
(@uid, 4, 3, 5, 2, 3, @bid, '2026-02-15 16:45:00');

-- 정승우 (1건) - 고소한 취향
SET @uid := (SELECT id FROM users WHERE email = 'jung.seungwoo@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 2, 1, 3, 4, 5, @bid, '2026-01-25 13:10:00');

-- 한지은 (2건) - 밸런스 취향
SET @uid := (SELECT id FROM users WHERE email = 'han.jieun@naver.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 3, 3, 3, 3, 3, @bid, '2026-01-12 10:20:00'),
(@uid, 4, 3, 4, 3, 3, @bid, '2026-02-08 11:00:00');

-- 송동하 (1건) - 향+바디
SET @uid := (SELECT id FROM users WHERE email = 'song.dongha@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 5, 2, 2, 5, 3, @bid, '2026-02-01 09:30:00');

-- 윤하은 (2건) - 과일향 선호
SET @uid := (SELECT id FROM users WHERE email = 'yoon.haeun@kakao.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 5, 4, 3, 2, 1, @bid, '2026-01-18 14:00:00'),
(@uid, 5, 3, 2, 4, 3, @bid, '2026-02-12 10:30:00');

-- 임정혁 (1건) - 묵직한 취향
SET @uid := (SELECT id FROM users WHERE email = 'lim.junghyuk@naver.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 2, 1, 1, 5, 5, @bid, '2026-02-03 16:15:00');

-- 오수빈 (2건) - 달콤+향
SET @uid := (SELECT id FROM users WHERE email = 'oh.subin@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 4, 2, 5, 3, 3, @bid, '2026-01-22 11:45:00'),
(@uid, 3, 2, 5, 3, 4, @bid, '2026-02-18 08:20:00');

-- 권태형 (1건) - 밸런스
SET @uid := (SELECT id FROM users WHERE email = 'kwon.taehyung@kakao.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 3, 3, 3, 3, 3, @bid, '2026-02-06 13:00:00');

-- 신미래 (2건) - 산미+단맛
SET @uid := (SELECT id FROM users WHERE email = 'shin.mirae@naver.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 3, 4, 4, 2, 2, @bid, '2026-01-05 09:50:00'),
(@uid, 4, 5, 4, 1, 1, @bid, '2026-02-14 15:30:00');

-- 백상현 (1건) - 향 선호
SET @uid := (SELECT id FROM users WHERE email = 'baek.sanghyun@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 5, 3, 2, 4, 3, @bid, '2026-02-09 10:10:00');

-- 고예지 (2건) - 고소+달콤
SET @uid := (SELECT id FROM users WHERE email = 'ko.yeji@kakao.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 2, 1, 4, 3, 5, @bid, '2026-01-28 12:30:00'),
(@uid, 3, 2, 5, 3, 4, @bid, '2026-02-20 09:40:00');

-- 남우진 (1건) - 진한 바디
SET @uid := (SELECT id FROM users WHERE email = 'nam.woojin@naver.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 3, 2, 2, 5, 4, @bid, '2026-02-11 14:50:00');

-- 문채영 (2건) - 라이트한 취향
SET @uid := (SELECT id FROM users WHERE email = 'moon.chaeyoung@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 4, 4, 3, 1, 2, @bid, '2026-01-14 16:00:00'),
(@uid, 3, 5, 4, 2, 1, @bid, '2026-02-16 11:20:00');

-- 황민서 (1건) - 밸런스+향
SET @uid := (SELECT id FROM users WHERE email = 'hwang.minseo@kakao.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 4, 3, 3, 3, 3, @bid, '2026-02-07 08:00:00');

-- 장수진 (2건) - 다양한 시도
SET @uid := (SELECT id FROM users WHERE email = 'jang.soojin@naver.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 5, 1, 1, 4, 5, @bid, '2026-01-30 10:30:00'),
(@uid, 3, 3, 4, 3, 3, @bid, '2026-02-19 13:45:00');

-- 안현우 (1건) - 고소+바디
SET @uid := (SELECT id FROM users WHERE email = 'ahn.hyunwoo@gmail.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 2, 1, 2, 4, 5, @bid, '2026-02-04 15:20:00');

-- 서다은 (2건) - 향+단맛
SET @uid := (SELECT id FROM users WHERE email = 'seo.daeun@kakao.com' LIMIT 1);
INSERT INTO analysis_results (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at) VALUES
(@uid, 5, 2, 4, 3, 2, @bid, '2026-01-07 09:00:00'),
(@uid, 4, 3, 5, 2, 3, @bid, '2026-02-21 11:10:00');


-- ============================================================
-- 2) user_collections INSERT (각 analysis_result에 대응하는 컬렉션)
-- blend_id는 여러 블렌드에 분산
-- ============================================================

-- 김민준
SET @uid := (SELECT id FROM users WHERE email = 'kim.minjun@gmail.com' LIMIT 1);
SET @bid1 := (SELECT id FROM blends ORDER BY id LIMIT 1);
SET @bid2 := (SELECT id FROM blends ORDER BY id LIMIT 1 OFFSET 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '향이 좋은 커피', '향이 진하고 깊어서 좋았어요', '2026-01-10 10:05:00', '2026-01-10 10:05:00'),
(@uid, COALESCE(@bid2, @bid1), @arid2, '바디감 좋은 블렌드', '묵직한 느낌이 좋음', '2026-02-05 14:25:00', '2026-02-05 14:25:00');

-- 이소연
SET @uid := (SELECT id FROM users WHERE email = 'lee.soyeon@naver.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '상큼한 산미 커피', '산미가 살아있어요', '2026-01-15 11:35:00', '2026-01-15 11:35:00'),
(@uid, COALESCE(@bid2, @bid1), @arid2, '데일리 커피', '매일 마시기 좋은 밸런스', '2026-02-10 09:20:00', '2026-02-10 09:20:00');

-- 박지훈
SET @uid := (SELECT id FROM users WHERE email = 'park.jihoon@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '진한 에스프레소', '아메리카노에 딱이에요', '2026-01-20 15:05:00', '2026-01-20 15:05:00');

-- 최유나
SET @uid := (SELECT id FROM users WHERE email = 'choi.yuna@kakao.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, COALESCE(@bid2, @bid1), @arid1, '달콤한 디저트 커피', '케이크랑 잘 어울려요', '2026-01-08 08:35:00', '2026-01-08 08:35:00'),
(@uid, @bid1, @arid2, '오후 커피', '오후에 마시기 좋아요', '2026-02-15 16:50:00', '2026-02-15 16:50:00');

-- 정승우
SET @uid := (SELECT id FROM users WHERE email = 'jung.seungwoo@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '고소한 견과류 향', '아몬드 향이 나요', '2026-01-25 13:15:00', '2026-01-25 13:15:00');

-- 한지은
SET @uid := (SELECT id FROM users WHERE email = 'han.jieun@naver.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '밸런스 블렌드', '무난하게 좋아요', '2026-01-12 10:25:00', '2026-01-12 10:25:00'),
(@uid, COALESCE(@bid2, @bid1), @arid2, '조금 더 향이 강한', '향이 약간 강해서 좋아요', '2026-02-08 11:05:00', '2026-02-08 11:05:00');

-- 송동하
SET @uid := (SELECT id FROM users WHERE email = 'song.dongha@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '파워풀 커피', '강한 맛을 원할 때', '2026-02-01 09:35:00', '2026-02-01 09:35:00');

-- 윤하은
SET @uid := (SELECT id FROM users WHERE email = 'yoon.haeun@kakao.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, COALESCE(@bid2, @bid1), @arid1, '과일향 가득', '에티오피아 원두 느낌', '2026-01-18 14:05:00', '2026-01-18 14:05:00'),
(@uid, @bid1, @arid2, '두 번째 시도', '이번엔 바디감도 좋네요', '2026-02-12 10:35:00', '2026-02-12 10:35:00');

-- 임정혁
SET @uid := (SELECT id FROM users WHERE email = 'lim.junghyuk@naver.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '헤비 로스트', '다크 로스팅 좋아해요', '2026-02-03 16:20:00', '2026-02-03 16:20:00');

-- 오수빈
SET @uid := (SELECT id FROM users WHERE email = 'oh.subin@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '달콤향 블렌드', '라떼에 잘 맞아요', '2026-01-22 11:50:00', '2026-01-22 11:50:00'),
(@uid, COALESCE(@bid2, @bid1), @arid2, '고소달달', '고소함이 더해져서 좋아요', '2026-02-18 08:25:00', '2026-02-18 08:25:00');

-- 권태형
SET @uid := (SELECT id FROM users WHERE email = 'kwon.taehyung@kakao.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '올라운더', '뭘 해도 맛있어요', '2026-02-06 13:05:00', '2026-02-06 13:05:00');

-- 신미래
SET @uid := (SELECT id FROM users WHERE email = 'shin.mirae@naver.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, COALESCE(@bid2, @bid1), @arid1, '새콤달콤', '과일 느낌 좋아요', '2026-01-05 09:55:00', '2026-01-05 09:55:00'),
(@uid, @bid1, @arid2, '산미 끝판왕', '케냐 스타일 좋아요', '2026-02-14 15:35:00', '2026-02-14 15:35:00');

-- 백상현
SET @uid := (SELECT id FROM users WHERE email = 'baek.sanghyun@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '아로마 블렌드', '코로 마시는 커피', '2026-02-09 10:15:00', '2026-02-09 10:15:00');

-- 고예지
SET @uid := (SELECT id FROM users WHERE email = 'ko.yeji@kakao.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '겨울 간식 커피', '호두과자랑 같이 먹으면 최고', '2026-01-28 12:35:00', '2026-01-28 12:35:00'),
(@uid, COALESCE(@bid2, @bid1), @arid2, '봄맞이 커피', '달달하니 좋아요', '2026-02-20 09:45:00', '2026-02-20 09:45:00');

-- 남우진
SET @uid := (SELECT id FROM users WHERE email = 'nam.woojin@naver.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '진한 아침 커피', '출근 전 한 잔', '2026-02-11 14:55:00', '2026-02-11 14:55:00');

-- 문채영
SET @uid := (SELECT id FROM users WHERE email = 'moon.chaeyoung@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, COALESCE(@bid2, @bid1), @arid1, '가벼운 오후', '가볍게 마시기 좋은 커피', '2026-01-14 16:05:00', '2026-01-14 16:05:00'),
(@uid, @bid1, @arid2, '상큼한 에티오피아', '밝은 산미가 매력적', '2026-02-16 11:25:00', '2026-02-16 11:25:00');

-- 황민서
SET @uid := (SELECT id FROM users WHERE email = 'hwang.minseo@kakao.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '향기로운 밸런스', '향도 좋고 밸런스도 좋아요', '2026-02-07 08:05:00', '2026-02-07 08:05:00');

-- 장수진
SET @uid := (SELECT id FROM users WHERE email = 'jang.soojin@naver.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '극강 향+고소', '너무 강렬해서 좋아요', '2026-01-30 10:35:00', '2026-01-30 10:35:00'),
(@uid, COALESCE(@bid2, @bid1), @arid2, '편한 블렌드', '부드럽게 마시기 좋아요', '2026-02-19 13:50:00', '2026-02-19 13:50:00');

-- 안현우
SET @uid := (SELECT id FROM users WHERE email = 'ahn.hyunwoo@gmail.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, @bid1, @arid1, '고소한 선물용', '부모님 선물로 딱이에요', '2026-02-04 15:25:00', '2026-02-04 15:25:00');

-- 서다은
SET @uid := (SELECT id FROM users WHERE email = 'seo.daeun@kakao.com' LIMIT 1);
SET @arid1 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1);
SET @arid2 := (SELECT id FROM analysis_results WHERE user_id = @uid ORDER BY id LIMIT 1 OFFSET 1);
INSERT INTO user_collections (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at) VALUES
(@uid, COALESCE(@bid2, @bid1), @arid1, '플로럴 블렌드', '꽃향이 은은해요', '2026-01-07 09:05:00', '2026-01-07 09:05:00'),
(@uid, @bid1, @arid2, '달콤한 봄 커피', '봄에 어울리는 커피', '2026-02-21 11:15:00', '2026-02-21 11:15:00');
