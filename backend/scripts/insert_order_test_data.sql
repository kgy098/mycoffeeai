-- 주문 테스트 데이터 (2025-12 ~ 2026-02-23, 약 30건)
-- 실행 전: users, blends, delivery_addresses 테이블에 데이터 필요
-- insert_app_feature_test_data.sql 을 먼저 실행하세요.

SET @test_email := 'testuser@mycoffee.ai';
SET @test_blend_name := '테스트 블렌드';

SELECT id INTO @user_id FROM users WHERE email = @test_email LIMIT 1;
SELECT id INTO @blend_id FROM blends WHERE name = @test_blend_name LIMIT 1;
SELECT id INTO @address_id FROM delivery_addresses WHERE user_id = @user_id ORDER BY id DESC LIMIT 1;

-- ============================================================
-- 주문 30건 INSERT (2025-12-01 ~ 2026-02-23)
-- 상태: 1=주문접수, 2=배송준비, 3=배송중, 4=배송완료, 5=취소, 6=반품
-- ============================================================

-- [12월] 10건 — 대부분 배송완료(4), 일부 취소(5)/반품(6)
INSERT INTO orders (user_id, order_number, order_type, status, delivery_address_id, payment_method, total_amount, discount_amount, points_used, delivery_fee, created_at) VALUES
(@user_id, 'ORD-20251201-1001', 'single',       '4', @address_id, 'card',   15000, 0,    0, 3000, '2025-12-01 09:23:00'),
(@user_id, 'ORD-20251203-1002', 'single',       '4', @address_id, 'card',   28000, 2000, 0, 0,    '2025-12-03 14:10:00'),
(@user_id, 'ORD-20251205-1003', 'subscription', '4', @address_id, 'card',   22000, 0,    500, 0,   '2025-12-05 11:45:00'),
(@user_id, 'ORD-20251208-1004', 'single',       '5', @address_id, 'card',   15000, 0,    0, 3000, '2025-12-08 16:30:00'),
(@user_id, 'ORD-20251210-1005', 'single',       '4', @address_id, 'kakao',  36000, 3000, 0, 0,    '2025-12-10 10:05:00'),
(@user_id, 'ORD-20251214-1006', 'single',       '4', @address_id, 'card',   12000, 0,    0, 3000, '2025-12-14 08:55:00'),
(@user_id, 'ORD-20251218-1007', 'subscription', '4', @address_id, 'card',   22000, 0,    0, 0,    '2025-12-18 13:20:00'),
(@user_id, 'ORD-20251222-1008', 'single',       '6', @address_id, 'card',   24000, 1000, 0, 0,    '2025-12-22 17:40:00'),
(@user_id, 'ORD-20251226-1009', 'single',       '4', @address_id, 'naver',  18000, 0,    1000, 0, '2025-12-26 09:10:00'),
(@user_id, 'ORD-20251230-1010', 'single',       '4', @address_id, 'card',   30000, 2000, 0, 0,    '2025-12-30 15:50:00');

-- [1월] 12건 — 배송완료 위주, 일부 배송중(3)/취소(5)
INSERT INTO orders (user_id, order_number, order_type, status, delivery_address_id, payment_method, total_amount, discount_amount, points_used, delivery_fee, created_at) VALUES
(@user_id, 'ORD-20260102-2001', 'single',       '4', @address_id, 'card',   15000, 0,    0, 3000, '2026-01-02 10:00:00'),
(@user_id, 'ORD-20260104-2002', 'subscription', '4', @address_id, 'card',   22000, 0,    0, 0,    '2026-01-04 11:30:00'),
(@user_id, 'ORD-20260107-2003', 'single',       '4', @address_id, 'kakao',  27000, 2000, 0, 0,    '2026-01-07 14:15:00'),
(@user_id, 'ORD-20260109-2004', 'single',       '5', @address_id, 'card',   12000, 0,    0, 3000, '2026-01-09 09:45:00'),
(@user_id, 'ORD-20260112-2005', 'single',       '4', @address_id, 'card',   36000, 3000, 500, 0,  '2026-01-12 16:20:00'),
(@user_id, 'ORD-20260115-2006', 'single',       '4', @address_id, 'naver',  18000, 0,    0, 3000, '2026-01-15 08:30:00'),
(@user_id, 'ORD-20260118-2007', 'subscription', '4', @address_id, 'card',   22000, 0,    0, 0,    '2026-01-18 12:00:00'),
(@user_id, 'ORD-20260120-2008', 'single',       '4', @address_id, 'card',   24000, 1000, 0, 0,    '2026-01-20 13:45:00'),
(@user_id, 'ORD-20260122-2009', 'single',       '4', @address_id, 'card',   15000, 0,    0, 3000, '2026-01-22 17:10:00'),
(@user_id, 'ORD-20260125-2010', 'single',       '4', @address_id, 'kakao',  30000, 2000, 0, 0,    '2026-01-25 10:55:00'),
(@user_id, 'ORD-20260128-2011', 'single',       '4', @address_id, 'card',   12000, 0,    0, 3000, '2026-01-28 14:30:00'),
(@user_id, 'ORD-20260131-2012', 'single',       '4', @address_id, 'card',   27000, 0,    1000, 0, '2026-01-31 09:20:00');

-- [2월] 8건 — 최근: 배송완료/배송중/배송준비/주문접수 혼합
INSERT INTO orders (user_id, order_number, order_type, status, delivery_address_id, payment_method, total_amount, discount_amount, points_used, delivery_fee, created_at) VALUES
(@user_id, 'ORD-20260202-3001', 'subscription', '4', @address_id, 'card',   22000, 0,    0, 0,    '2026-02-02 11:00:00'),
(@user_id, 'ORD-20260205-3002', 'single',       '4', @address_id, 'card',   18000, 0,    0, 3000, '2026-02-05 15:20:00'),
(@user_id, 'ORD-20260208-3003', 'single',       '4', @address_id, 'naver',  36000, 3000, 0, 0,    '2026-02-08 10:40:00'),
(@user_id, 'ORD-20260212-3004', 'single',       '4', @address_id, 'card',   15000, 0,    500, 3000,'2026-02-12 13:15:00'),
(@user_id, 'ORD-20260215-3005', 'single',       '3', @address_id, 'card',   24000, 1000, 0, 0,    '2026-02-15 09:30:00'),
(@user_id, 'ORD-20260218-3006', 'single',       '3', @address_id, 'kakao',  30000, 2000, 0, 0,    '2026-02-18 14:50:00'),
(@user_id, 'ORD-20260221-3007', 'single',       '2', @address_id, 'card',   12000, 0,    0, 3000, '2026-02-21 16:10:00'),
(@user_id, 'ORD-20260223-3008', 'single',       '1', @address_id, 'card',   27000, 0,    0, 0,    '2026-02-23 08:45:00');

-- ============================================================
-- 주문 아이템 INSERT (각 주문당 1~2개 아이템)
-- ============================================================

-- 12월 주문 아이템
SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251201-1001');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'fine', 'roast', 'dark'), '2025-12-01 09:23:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251203-1002');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 14000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2025-12-03 14:10:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251205-1003');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 22000, JSON_OBJECT('grind', 'coarse', 'roast', 'light'), '2025-12-05 11:45:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251208-1004');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'dark'), '2025-12-08 16:30:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251210-1005');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 15000, JSON_OBJECT('grind', 'fine', 'roast', 'medium'), '2025-12-10 10:05:00'),
(@oid, @blend_id, 1, 6000,  JSON_OBJECT('grind', 'coarse', 'roast', 'light'), '2025-12-10 10:05:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251214-1006');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2025-12-14 08:55:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251218-1007');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 22000, JSON_OBJECT('grind', 'fine', 'roast', 'dark'), '2025-12-18 13:20:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251222-1008');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 12000, JSON_OBJECT('grind', 'medium', 'roast', 'light'), '2025-12-22 17:40:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251226-1009');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 18000, JSON_OBJECT('grind', 'coarse', 'roast', 'medium'), '2025-12-26 09:10:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20251230-1010');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 15000, JSON_OBJECT('grind', 'fine', 'roast', 'dark'), '2025-12-30 15:50:00');

-- 1월 주문 아이템
SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260102-2001');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2026-01-02 10:00:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260104-2002');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 22000, JSON_OBJECT('grind', 'fine', 'roast', 'light'), '2026-01-04 11:30:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260107-2003');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'coarse', 'roast', 'dark'), '2026-01-07 14:15:00'),
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2026-01-07 14:15:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260109-2004');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'fine', 'roast', 'medium'), '2026-01-09 09:45:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260112-2005');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'dark'), '2026-01-12 16:20:00'),
(@oid, @blend_id, 1, 6000,  JSON_OBJECT('grind', 'fine', 'roast', 'light'), '2026-01-12 16:20:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260115-2006');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 18000, JSON_OBJECT('grind', 'coarse', 'roast', 'medium'), '2026-01-15 08:30:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260118-2007');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 22000, JSON_OBJECT('grind', 'medium', 'roast', 'dark'), '2026-01-18 12:00:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260120-2008');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 12000, JSON_OBJECT('grind', 'fine', 'roast', 'medium'), '2026-01-20 13:45:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260122-2009');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'light'), '2026-01-22 17:10:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260125-2010');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 15000, JSON_OBJECT('grind', 'coarse', 'roast', 'dark'), '2026-01-25 10:55:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260128-2011');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'fine', 'roast', 'medium'), '2026-01-28 14:30:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260131-2012');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'dark'), '2026-01-31 09:20:00'),
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'coarse', 'roast', 'light'), '2026-01-31 09:20:00');

-- 2월 주문 아이템
SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260202-3001');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 22000, JSON_OBJECT('grind', 'fine', 'roast', 'medium'), '2026-02-02 11:00:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260205-3002');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 18000, JSON_OBJECT('grind', 'medium', 'roast', 'dark'), '2026-02-05 15:20:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260208-3003');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 15000, JSON_OBJECT('grind', 'coarse', 'roast', 'medium'), '2026-02-08 10:40:00'),
(@oid, @blend_id, 1, 6000,  JSON_OBJECT('grind', 'fine', 'roast', 'light'), '2026-02-08 10:40:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260212-3004');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2026-02-12 13:15:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260215-3005');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 12000, JSON_OBJECT('grind', 'fine', 'roast', 'dark'), '2026-02-15 09:30:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260218-3006');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 2, 15000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2026-02-18 14:50:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260221-3007');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'coarse', 'roast', 'light'), '2026-02-21 16:10:00');

SET @oid := (SELECT id FROM orders WHERE order_number = 'ORD-20260223-3008');
INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at) VALUES
(@oid, @blend_id, 1, 15000, JSON_OBJECT('grind', 'fine', 'roast', 'dark'), '2026-02-23 08:45:00'),
(@oid, @blend_id, 1, 12000, JSON_OBJECT('grind', 'medium', 'roast', 'medium'), '2026-02-23 08:45:00');
