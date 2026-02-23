-- 구독 회차별 내역 테스트 데이터
-- 기존 subscriptions 테이블의 데이터를 기반으로 subscription_cycles 생성
-- deploy / dev 양쪽 실행 가능
-- 실행 전: subscriptions 테이블에 데이터 필요

-- 기존 데이터 중복 방지
-- (이미 cycle이 있는 구독은 건너뜀)

-- ============================================================
-- 프로시저: 각 구독에 대해 회차 데이터 자동 생성
-- - start_date 기준 월단위 회차
-- - current_cycle 수만큼 과거 회차 생성
-- - 상태: delivered → shipped → preparing → scheduled 순서
-- ============================================================

INSERT INTO subscription_cycles
  (subscription_id, cycle_number, status, scheduled_date, billed_at, shipped_at, delivered_at, amount, note, created_at, updated_at)
SELECT
  sub.id AS subscription_id,
  gen.n AS cycle_number,
  CASE
    -- 마지막 회차: 구독 상태에 따라 분기
    WHEN gen.n = sub.current_cycle AND sub.status = 'active' THEN
      CASE
        WHEN DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH) <= CURDATE() - INTERVAL 7 DAY THEN 'delivered'
        WHEN DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH) <= CURDATE() - INTERVAL 2 DAY THEN 'shipped'
        WHEN DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH) <= CURDATE() THEN 'preparing'
        ELSE 'scheduled'
      END
    WHEN gen.n = sub.current_cycle AND sub.status = 'paused' THEN 'skipped'
    WHEN gen.n = sub.current_cycle AND sub.status = 'cancelled' THEN 'cancelled'
    WHEN gen.n = sub.current_cycle AND sub.status = 'expired' THEN 'delivered'
    WHEN gen.n = sub.current_cycle AND sub.status = 'pending_payment' THEN 'payment_pending'
    -- 과거 회차: 대부분 delivered, 일부 failed/skipped
    WHEN gen.n < sub.current_cycle AND MOD(gen.n, 7) = 0 THEN 'failed'
    WHEN gen.n < sub.current_cycle AND MOD(gen.n, 11) = 0 THEN 'skipped'
    WHEN gen.n < sub.current_cycle THEN 'delivered'
    -- 미래 회차 (total_cycles > current_cycle 인 경우)
    ELSE 'scheduled'
  END AS status,
  DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH) AS scheduled_date,
  -- billed_at: delivered/shipped/preparing/paid/failed 상태만
  CASE
    WHEN gen.n <= sub.current_cycle
      AND NOT (gen.n = sub.current_cycle AND sub.status IN ('paused','cancelled','pending_payment'))
      AND NOT (gen.n < sub.current_cycle AND MOD(gen.n, 11) = 0)
    THEN TIMESTAMP(DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH), '09:00:00')
    ELSE NULL
  END AS billed_at,
  -- shipped_at: delivered/shipped 상태만
  CASE
    WHEN gen.n < sub.current_cycle AND NOT (MOD(gen.n, 7) = 0 OR MOD(gen.n, 11) = 0)
    THEN TIMESTAMP(DATE_ADD(DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH), INTERVAL 1 DAY), '14:00:00')
    WHEN gen.n = sub.current_cycle AND sub.status = 'active'
      AND DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH) <= CURDATE() - INTERVAL 2 DAY
    THEN TIMESTAMP(DATE_ADD(DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH), INTERVAL 1 DAY), '14:00:00')
    ELSE NULL
  END AS shipped_at,
  -- delivered_at: delivered 상태만
  CASE
    WHEN gen.n < sub.current_cycle AND NOT (MOD(gen.n, 7) = 0 OR MOD(gen.n, 11) = 0)
    THEN TIMESTAMP(DATE_ADD(DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH), INTERVAL 3 DAY), '11:00:00')
    WHEN gen.n = sub.current_cycle AND sub.status IN ('active','expired')
      AND DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH) <= CURDATE() - INTERVAL 7 DAY
    THEN TIMESTAMP(DATE_ADD(DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH), INTERVAL 3 DAY), '11:00:00')
    ELSE NULL
  END AS delivered_at,
  -- amount
  CASE
    WHEN gen.n < sub.current_cycle AND MOD(gen.n, 11) = 0 THEN NULL
    ELSE COALESCE(sub.total_amount, 19000)
  END AS amount,
  -- note
  CASE
    WHEN gen.n < sub.current_cycle AND MOD(gen.n, 7) = 0 THEN '결제 실패 - 카드 한도 초과'
    WHEN gen.n < sub.current_cycle AND MOD(gen.n, 11) = 0 THEN '고객 요청으로 건너뜀'
    WHEN gen.n = sub.current_cycle AND sub.status = 'paused' THEN '일시정지 중 - 고객 요청'
    WHEN gen.n = sub.current_cycle AND sub.status = 'cancelled' THEN '구독 해지'
    ELSE NULL
  END AS note,
  TIMESTAMP(DATE_ADD(sub.start_date, INTERVAL (gen.n - 1) MONTH), '00:00:00') AS created_at,
  NOW() AS updated_at
FROM subscriptions sub
JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
  UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
  UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
) gen ON gen.n <= GREATEST(sub.current_cycle, 1)
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_cycles sc
  WHERE sc.subscription_id = sub.id AND sc.cycle_number = gen.n
)
ORDER BY sub.id, gen.n;
