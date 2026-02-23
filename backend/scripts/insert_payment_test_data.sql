-- 결제/환불 테스트 데이터 5건
-- 실행 전: orders 테이블에 데이터 필요 (insert_order_test_data.sql 먼저 실행)

-- 기존 주문 ID 조회
SET @oid1 := (SELECT id FROM orders WHERE order_number = 'ORD-20260223-3008' LIMIT 1);
SET @oid2 := (SELECT id FROM orders WHERE order_number = 'ORD-20260221-3007' LIMIT 1);
SET @oid3 := (SELECT id FROM orders WHERE order_number = 'ORD-20260218-3006' LIMIT 1);
SET @oid4 := (SELECT id FROM orders WHERE order_number = 'ORD-20260215-3005' LIMIT 1);
SET @oid5 := (SELECT id FROM orders WHERE order_number = 'ORD-20260208-3003' LIMIT 1);

-- 구독 ID (있으면 사용)
SET @sid1 := (SELECT id FROM subscriptions ORDER BY id LIMIT 1);

INSERT INTO payments (subscription_id, order_id, amount, currency, payment_method, transaction_id, status, error_message, created_at) VALUES
(NULL,  @oid1, 27000, 'KRW', 'card',  'TXN-20260223-0001', 'completed', NULL,                     '2026-02-23 08:46:00'),
(NULL,  @oid2, 15000, 'KRW', 'card',  'TXN-20260221-0001', 'completed', NULL,                     '2026-02-21 16:11:00'),
(NULL,  @oid3, 30000, 'KRW', 'kakao', 'TXN-20260218-0001', 'refunded',  '고객 요청에 의한 환불',    '2026-02-18 14:51:00'),
(NULL,  @oid4, 24000, 'KRW', 'card',  'TXN-20260215-0001', 'pending',   NULL,                     '2026-02-15 09:31:00'),
(@sid1, NULL,  22000, 'KRW', 'card',  'TXN-20260202-0001', 'completed', NULL,                     '2026-02-02 11:01:00');
