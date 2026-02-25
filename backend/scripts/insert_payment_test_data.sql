-- 결제 테스트 데이터 (주문 30건 1:1 대응)
-- 실행 전: orders 테이블에 데이터 필요 (insert_order_test_data.sql 먼저 실행)
-- 기존 결제 데이터가 있으면 먼저 삭제하세요: DELETE FROM payments;

-- ============================================================
-- 주문 ID 조회
-- ============================================================

-- 12월 주문 (10건)
SET @oid1001 := (SELECT id FROM orders WHERE order_number = 'ORD-20251201-1001' LIMIT 1);
SET @oid1002 := (SELECT id FROM orders WHERE order_number = 'ORD-20251203-1002' LIMIT 1);
SET @oid1003 := (SELECT id FROM orders WHERE order_number = 'ORD-20251205-1003' LIMIT 1);
SET @oid1004 := (SELECT id FROM orders WHERE order_number = 'ORD-20251208-1004' LIMIT 1);
SET @oid1005 := (SELECT id FROM orders WHERE order_number = 'ORD-20251210-1005' LIMIT 1);
SET @oid1006 := (SELECT id FROM orders WHERE order_number = 'ORD-20251214-1006' LIMIT 1);
SET @oid1007 := (SELECT id FROM orders WHERE order_number = 'ORD-20251218-1007' LIMIT 1);
SET @oid1008 := (SELECT id FROM orders WHERE order_number = 'ORD-20251222-1008' LIMIT 1);
SET @oid1009 := (SELECT id FROM orders WHERE order_number = 'ORD-20251226-1009' LIMIT 1);
SET @oid1010 := (SELECT id FROM orders WHERE order_number = 'ORD-20251230-1010' LIMIT 1);

-- 1월 주문 (12건)
SET @oid2001 := (SELECT id FROM orders WHERE order_number = 'ORD-20260102-2001' LIMIT 1);
SET @oid2002 := (SELECT id FROM orders WHERE order_number = 'ORD-20260104-2002' LIMIT 1);
SET @oid2003 := (SELECT id FROM orders WHERE order_number = 'ORD-20260107-2003' LIMIT 1);
SET @oid2004 := (SELECT id FROM orders WHERE order_number = 'ORD-20260109-2004' LIMIT 1);
SET @oid2005 := (SELECT id FROM orders WHERE order_number = 'ORD-20260112-2005' LIMIT 1);
SET @oid2006 := (SELECT id FROM orders WHERE order_number = 'ORD-20260115-2006' LIMIT 1);
SET @oid2007 := (SELECT id FROM orders WHERE order_number = 'ORD-20260118-2007' LIMIT 1);
SET @oid2008 := (SELECT id FROM orders WHERE order_number = 'ORD-20260120-2008' LIMIT 1);
SET @oid2009 := (SELECT id FROM orders WHERE order_number = 'ORD-20260122-2009' LIMIT 1);
SET @oid2010 := (SELECT id FROM orders WHERE order_number = 'ORD-20260125-2010' LIMIT 1);
SET @oid2011 := (SELECT id FROM orders WHERE order_number = 'ORD-20260128-2011' LIMIT 1);
SET @oid2012 := (SELECT id FROM orders WHERE order_number = 'ORD-20260131-2012' LIMIT 1);

-- 2월 주문 (8건)
SET @oid3001 := (SELECT id FROM orders WHERE order_number = 'ORD-20260202-3001' LIMIT 1);
SET @oid3002 := (SELECT id FROM orders WHERE order_number = 'ORD-20260205-3002' LIMIT 1);
SET @oid3003 := (SELECT id FROM orders WHERE order_number = 'ORD-20260208-3003' LIMIT 1);
SET @oid3004 := (SELECT id FROM orders WHERE order_number = 'ORD-20260212-3004' LIMIT 1);
SET @oid3005 := (SELECT id FROM orders WHERE order_number = 'ORD-20260215-3005' LIMIT 1);
SET @oid3006 := (SELECT id FROM orders WHERE order_number = 'ORD-20260218-3006' LIMIT 1);
SET @oid3007 := (SELECT id FROM orders WHERE order_number = 'ORD-20260221-3007' LIMIT 1);
SET @oid3008 := (SELECT id FROM orders WHERE order_number = 'ORD-20260223-3008' LIMIT 1);

-- ============================================================
-- 결제 데이터 INSERT (30건)
-- amount = orders.total_amount, payment_method = orders.payment_method
-- 취소(status=5) → refunded, 반품(status=6) → refunded
-- 주문접수(status=1) → pending, 나머지 → completed
-- created_at = orders.created_at (결제 시점 = 주문 시점)
-- ============================================================

INSERT INTO payments (subscription_id, order_id, amount, currency, payment_method, provider_transaction_id, status, error_message, created_at) VALUES
-- [12월] 10건
(NULL, @oid1001, 15000, 'KRW', 'card',  'TXN-20251201-1001', 'completed', NULL,                           '2025-12-01 09:23:00'),
(NULL, @oid1002, 28000, 'KRW', 'card',  'TXN-20251203-1002', 'completed', NULL,                           '2025-12-03 14:10:00'),
(NULL, @oid1003, 22000, 'KRW', 'card',  'TXN-20251205-1003', 'completed', NULL,                           '2025-12-05 11:45:00'),
(NULL, @oid1004, 15000, 'KRW', 'card',  'TXN-20251208-1004', 'refunded',  '고객 요청에 의한 취소 환불',       '2025-12-08 16:30:00'),
(NULL, @oid1005, 36000, 'KRW', 'kakao', 'TXN-20251210-1005', 'completed', NULL,                           '2025-12-10 10:05:00'),
(NULL, @oid1006, 12000, 'KRW', 'card',  'TXN-20251214-1006', 'completed', NULL,                           '2025-12-14 08:55:00'),
(NULL, @oid1007, 22000, 'KRW', 'card',  'TXN-20251218-1007', 'completed', NULL,                           '2025-12-18 13:20:00'),
(NULL, @oid1008, 24000, 'KRW', 'card',  'TXN-20251222-1008', 'refunded',  '상품 불량에 의한 반품 환불',       '2025-12-22 17:40:00'),
(NULL, @oid1009, 18000, 'KRW', 'naver', 'TXN-20251226-1009', 'completed', NULL,                           '2025-12-26 09:10:00'),
(NULL, @oid1010, 30000, 'KRW', 'card',  'TXN-20251230-1010', 'completed', NULL,                           '2025-12-30 15:50:00'),

-- [1월] 12건
(NULL, @oid2001, 15000, 'KRW', 'card',  'TXN-20260102-2001', 'completed', NULL,                           '2026-01-02 10:00:00'),
(NULL, @oid2002, 22000, 'KRW', 'card',  'TXN-20260104-2002', 'completed', NULL,                           '2026-01-04 11:30:00'),
(NULL, @oid2003, 27000, 'KRW', 'kakao', 'TXN-20260107-2003', 'completed', NULL,                           '2026-01-07 14:15:00'),
(NULL, @oid2004, 12000, 'KRW', 'card',  'TXN-20260109-2004', 'refunded',  '고객 요청에 의한 취소 환불',       '2026-01-09 09:45:00'),
(NULL, @oid2005, 36000, 'KRW', 'card',  'TXN-20260112-2005', 'completed', NULL,                           '2026-01-12 16:20:00'),
(NULL, @oid2006, 18000, 'KRW', 'naver', 'TXN-20260115-2006', 'completed', NULL,                           '2026-01-15 08:30:00'),
(NULL, @oid2007, 22000, 'KRW', 'card',  'TXN-20260118-2007', 'completed', NULL,                           '2026-01-18 12:00:00'),
(NULL, @oid2008, 24000, 'KRW', 'card',  'TXN-20260120-2008', 'completed', NULL,                           '2026-01-20 13:45:00'),
(NULL, @oid2009, 15000, 'KRW', 'card',  'TXN-20260122-2009', 'completed', NULL,                           '2026-01-22 17:10:00'),
(NULL, @oid2010, 30000, 'KRW', 'kakao', 'TXN-20260125-2010', 'completed', NULL,                           '2026-01-25 10:55:00'),
(NULL, @oid2011, 12000, 'KRW', 'card',  'TXN-20260128-2011', 'completed', NULL,                           '2026-01-28 14:30:00'),
(NULL, @oid2012, 27000, 'KRW', 'card',  'TXN-20260131-2012', 'completed', NULL,                           '2026-01-31 09:20:00'),

-- [2월] 8건
(NULL, @oid3001, 22000, 'KRW', 'card',  'TXN-20260202-3001', 'completed', NULL,                           '2026-02-02 11:00:00'),
(NULL, @oid3002, 18000, 'KRW', 'card',  'TXN-20260205-3002', 'completed', NULL,                           '2026-02-05 15:20:00'),
(NULL, @oid3003, 36000, 'KRW', 'naver', 'TXN-20260208-3003', 'completed', NULL,                           '2026-02-08 10:40:00'),
(NULL, @oid3004, 15000, 'KRW', 'card',  'TXN-20260212-3004', 'completed', NULL,                           '2026-02-12 13:15:00'),
(NULL, @oid3005, 24000, 'KRW', 'card',  'TXN-20260215-3005', 'completed', NULL,                           '2026-02-15 09:30:00'),
(NULL, @oid3006, 30000, 'KRW', 'kakao', 'TXN-20260218-3006', 'completed', NULL,                           '2026-02-18 14:50:00'),
(NULL, @oid3007, 12000, 'KRW', 'card',  'TXN-20260221-3007', 'completed', NULL,                           '2026-02-21 16:10:00'),
(NULL, @oid3008, 27000, 'KRW', 'card',  'TXN-20260223-3008', 'pending',   NULL,                           '2026-02-23 08:45:00');
