# -*- coding: utf-8 -*-
"""주문 테스트 데이터 30건 삽입 (2025-12 ~ 2026-02-23)
- 회원별 골고루, 단품/구독 골고루, 옵션/결제수단/상태/블렌드 골고루
- 배송지 → 주문 → 주문아이템 순서
"""
from sqlalchemy import create_engine, text
from app.config import get_settings

s = get_settings()
engine = create_engine(s.database_url)

# ──────────────────────────────────────────────
# 1) 배송지 (21명 전원)
# ──────────────────────────────────────────────
addresses_sql = text("""
INSERT INTO delivery_addresses
  (user_id, recipient_name, phone_number, postal_code, address_line1, address_line2, is_default, created_at, updated_at)
VALUES
  (3,  '테스터',   '010-1111-0003', '06001', '서울 강남구 테헤란로 10',    '101호', 1, NOW(), NOW()),
  (4,  '김민준',   '010-2345-0001', '04523', '서울 중구 을지로 55',       '민준빌딩 3층', 1, NOW(), NOW()),
  (5,  '이소연',   '010-2345-0002', '06035', '서울 강남구 역삼로 78',     '소연타워 12층', 1, NOW(), NOW()),
  (6,  '박지훈',   '010-2345-0003', '02567', '서울 동대문구 왕산로 22',   '지훈아파트 502호', 1, NOW(), NOW()),
  (7,  '최유나',   '010-2345-0004', '07281', '서울 영등포구 여의대로 100', '유나오피스텔 801호', 1, NOW(), NOW()),
  (8,  '정승우',   '010-2345-0005', '13487', '경기 성남시 분당구 판교로 45', '승우타운 203호', 1, NOW(), NOW()),
  (9,  '한지은',   '010-2345-0006', '34014', '대전 유성구 대학로 99',     '지은빌라 B동 301호', 1, NOW(), NOW()),
  (10, '송동하',   '010-2345-0007', '48060', '부산 해운대구 센텀로 30',   '동하리젠시 1504호', 1, NOW(), NOW()),
  (11, '윤하은',   '010-2345-0008', '61452', '광주 동구 금남로 12',       '하은스퀘어 407호', 1, NOW(), NOW()),
  (12, '임정혁',   '010-2345-0009', '21354', '인천 남동구 인주대로 150',  '정혁프라자 2층', 1, NOW(), NOW()),
  (13, '오수빈',   '010-2345-0010', '41068', '대구 달서구 달구벌대로 88', '수빈파크 603호', 1, NOW(), NOW()),
  (14, '권태형',   '010-2345-0011', '16508', '경기 수원시 팔달구 효원로 77', '태형빌딩 5층', 1, NOW(), NOW()),
  (15, '신미래',   '010-2345-0012', '06151', '서울 강남구 선릉로 120',    '미래센터 9층', 1, NOW(), NOW()),
  (16, '백상현',   '010-2345-0013', '04101', '서울 마포구 월드컵로 200',  '상현하우스 1102호', 1, NOW(), NOW()),
  (17, '고예지',   '010-2345-0014', '35204', '대전 서구 둔산로 50',       '예지맨션 308호', 1, NOW(), NOW()),
  (18, '남우진',   '010-2345-0015', '44200', '울산 남구 삼산로 65',       '우진타워 7층', 1, NOW(), NOW()),
  (19, '문채영',   '010-2345-0016', '63098', '제주 제주시 연동로 33',     '채영빌라 201호', 1, NOW(), NOW()),
  (20, '황민서',   '010-2345-0017', '24340', '강원 춘천시 중앙로 80',     '민서아파트 1503호', 1, NOW(), NOW()),
  (21, '장수진',   '010-2345-0018', '31101', '충남 천안시 동남구 만남로 15', '수진프라자 4층', 1, NOW(), NOW()),
  (22, '안현우',   '010-2345-0019', '54843', '전북 전주시 완산구 전주로 110', '현우빌딩 6층', 1, NOW(), NOW()),
  (23, '서다은',   '010-2345-0020', '61186', '광주 북구 용봉로 55',       '다은하우스 902호', 1, NOW(), NOW())
""")

# ──────────────────────────────────────────────
# 2) 주문 30건
# ──────────────────────────────────────────────
# user_id 범위: 3~23 (21명)
# blend_id 범위: 1~15
# status: 1=주문접수, 2=배송준비, 3=배송중, 4=배송완료, 5=취소, 6=반품
# payment_method: card, kakao, naver, toss
# order_type: single, subscription
# grind: whole_bean, coarse, medium, fine
# roast: light, medium, dark
#
# 날짜 분포: 12월 10건, 1월 12건, 2월 8건
# 회원: 21명 중 각자 1~2건씩 골고루
# 단품 20건 / 구독 10건
# 상태: 12월-대부분4, 1월-4위주+일부3/5, 2월-1~4 혼합+취소/반품

orders_data = [
    # (user_id, order_number, order_type, status, payment_method, total_amount, discount_amount, points_used, delivery_fee, created_at)
    # ── 12월 10건 ──
    ( 4, 'ORD-20251201-1001', 'single',       '4', 'card',  15000, 0,    0,    3000, '2025-12-01 09:23:00'),
    ( 7, 'ORD-20251203-1002', 'subscription', '4', 'kakao', 34000, 0,    0,    0,    '2025-12-03 14:10:00'),
    (10, 'ORD-20251206-1003', 'single',       '4', 'naver', 36000, 2000, 0,    0,    '2025-12-06 11:45:00'),
    (14, 'ORD-20251209-1004', 'single',       '5', 'card',  17000, 0,    0,    3000, '2025-12-09 16:30:00'),
    (18, 'ORD-20251212-1005', 'subscription', '4', 'toss',  33000, 0,    500,  0,    '2025-12-12 10:05:00'),
    ( 5, 'ORD-20251215-1006', 'single',       '4', 'card',  16500, 0,    0,    3000, '2025-12-15 08:55:00'),
    (21, 'ORD-20251218-1007', 'single',       '6', 'kakao', 39000, 3000, 0,    0,    '2025-12-18 13:20:00'),
    (12, 'ORD-20251221-1008', 'subscription', '4', 'card',  19000, 0,    0,    0,    '2025-12-21 17:40:00'),
    ( 9, 'ORD-20251225-1009', 'single',       '4', 'naver', 31000, 1000, 1000, 0,    '2025-12-25 09:10:00'),
    (16, 'ORD-20251229-1010', 'single',       '4', 'toss',  14500, 0,    0,    3000, '2025-12-29 15:50:00'),
    # ── 1월 12건 ──
    ( 8, 'ORD-20260102-2001', 'single',       '4', 'card',  35500, 0,    0,    0,    '2026-01-02 10:00:00'),
    (11, 'ORD-20260104-2002', 'subscription', '4', 'kakao', 17000, 0,    0,    0,    '2026-01-04 11:30:00'),
    (15, 'ORD-20260107-2003', 'single',       '4', 'naver', 40000, 3000, 0,    0,    '2026-01-07 14:15:00'),
    (19, 'ORD-20260109-2004', 'single',       '5', 'card',  15500, 0,    0,    3000, '2026-01-09 09:45:00'),
    ( 6, 'ORD-20260112-2005', 'subscription', '4', 'toss',  18500, 0,    500,  0,    '2026-01-12 16:20:00'),
    (23, 'ORD-20260115-2006', 'single',       '4', 'card',  32000, 2000, 0,    0,    '2026-01-15 08:30:00'),
    (13, 'ORD-20260118-2007', 'subscription', '4', 'kakao', 16000, 0,    0,    0,    '2026-01-18 12:00:00'),
    ( 3, 'ORD-20260120-2008', 'single',       '4', 'naver', 37000, 0,    0,    0,    '2026-01-20 13:45:00'),
    (20, 'ORD-20260122-2009', 'single',       '4', 'card',  19500, 0,    0,    3000, '2026-01-22 17:10:00'),
    (17, 'ORD-20260125-2010', 'subscription', '4', 'toss',  20000, 0,    1000, 0,    '2026-01-25 10:55:00'),
    (22, 'ORD-20260128-2011', 'single',       '4', 'kakao', 28500, 1000, 0,    0,    '2026-01-28 14:30:00'),
    ( 4, 'ORD-20260131-2012', 'subscription', '4', 'card',  16000, 0,    0,    0,    '2026-01-31 09:20:00'),
    # ── 2월 8건 ──
    ( 9, 'ORD-20260203-3001', 'single',       '4', 'naver', 34500, 0,    0,    0,    '2026-02-03 11:00:00'),
    (14, 'ORD-20260206-3002', 'subscription', '4', 'card',  18000, 0,    0,    0,    '2026-02-06 15:20:00'),
    ( 7, 'ORD-20260209-3003', 'single',       '6', 'toss',  31500, 1500, 0,    0,    '2026-02-09 10:40:00'),
    (18, 'ORD-20260212-3004', 'single',       '3', 'kakao', 17500, 0,    500,  3000, '2026-02-12 13:15:00'),
    (11, 'ORD-20260215-3005', 'subscription', '3', 'card',  19000, 0,    0,    0,    '2026-02-15 09:30:00'),
    ( 5, 'ORD-20260218-3006', 'single',       '2', 'naver', 36500, 2000, 0,    0,    '2026-02-18 14:50:00'),
    (23, 'ORD-20260221-3007', 'single',       '2', 'card',  15000, 0,    0,    3000, '2026-02-21 16:10:00'),
    (16, 'ORD-20260223-3008', 'single',       '1', 'toss',  38000, 0,    0,    0,    '2026-02-23 08:45:00'),
]

# ──────────────────────────────────────────────
# 3) 주문아이템 (주문당 1~2개, 블렌드/옵션 골고루)
# ──────────────────────────────────────────────
# order_number -> [ (blend_id, quantity, unit_price, grind, roast), ... ]
items_data = {
    'ORD-20251201-1001': [(1,  1, 15000, 'fine',       'dark')],
    'ORD-20251203-1002': [(4,  1, 17000, 'medium',     'medium'), (4, 1, 17000, 'coarse', 'light')],
    'ORD-20251206-1003': [(2,  2, 18000, 'whole_bean', 'dark')],
    'ORD-20251209-1004': [(4,  1, 17000, 'fine',       'medium')],
    'ORD-20251212-1005': [(7,  1, 19000, 'medium',     'light'), (6, 1, 14500, 'coarse', 'dark')],
    'ORD-20251215-1006': [(5,  1, 16500, 'whole_bean', 'medium')],
    'ORD-20251218-1007': [(15, 2, 20000, 'fine',       'dark')],
    'ORD-20251221-1008': [(7,  1, 19000, 'medium',     'light')],
    'ORD-20251225-1009': [(8,  1, 17500, 'coarse',     'medium'), (3, 1, 16000, 'fine', 'dark')],
    'ORD-20251229-1010': [(6,  1, 14500, 'whole_bean', 'light')],

    'ORD-20260102-2001': [(11, 1, 18500, 'fine',       'dark'), (4, 1, 17000, 'medium', 'medium')],
    'ORD-20260104-2002': [(4,  1, 17000, 'coarse',     'light')],
    'ORD-20260107-2003': [(13, 2, 19500, 'whole_bean', 'dark')],
    'ORD-20260109-2004': [(9,  1, 15500, 'medium',     'medium')],
    'ORD-20260112-2005': [(11, 1, 18500, 'fine',       'light')],
    'ORD-20260115-2006': [(10, 2, 16000, 'coarse',     'dark')],
    'ORD-20260118-2007': [(3,  1, 16000, 'whole_bean', 'medium')],
    'ORD-20260120-2008': [(2,  1, 18000, 'medium',     'dark'), (7, 1, 19000, 'fine', 'light')],
    'ORD-20260122-2009': [(13, 1, 19500, 'coarse',     'medium')],
    'ORD-20260125-2010': [(15, 1, 20000, 'fine',       'dark')],
    'ORD-20260128-2011': [(14, 1, 15500, 'whole_bean', 'light'), (12, 1, 17000, 'medium', 'dark')],
    'ORD-20260131-2012': [(10, 1, 16000, 'coarse',     'medium')],

    'ORD-20260203-3001': [(8,  1, 17500, 'fine',       'light'), (4, 1, 17000, 'whole_bean', 'dark')],
    'ORD-20260206-3002': [(2,  1, 18000, 'medium',     'medium')],
    'ORD-20260209-3003': [(12, 1, 17000, 'coarse',     'dark'), (6, 1, 14500, 'fine', 'light')],
    'ORD-20260212-3004': [(8,  1, 17500, 'whole_bean', 'medium')],
    'ORD-20260215-3005': [(7,  1, 19000, 'medium',     'dark')],
    'ORD-20260218-3006': [(15, 1, 20000, 'fine',       'light'), (5, 1, 16500, 'coarse', 'medium')],
    'ORD-20260221-3007': [(1,  1, 15000, 'whole_bean', 'dark')],
    'ORD-20260223-3008': [(13, 1, 19500, 'medium',     'light'), (11, 1, 18500, 'fine', 'dark')],
}

with engine.connect() as conn:
    # 1) 배송지
    conn.execute(addresses_sql)
    conn.commit()
    print("배송지 21건 INSERT 완료")

    # user_id -> address_id 매핑
    addr_map = {}
    rows = conn.execute(text("SELECT id, user_id FROM delivery_addresses"))
    for r in rows:
        addr_map[r[1]] = r[0]

    # 2) 주문 30건
    for o in orders_data:
        uid, onum, otype, st, pay, total, disc, pts, dfee, cat = o
        aid = addr_map.get(uid)
        conn.execute(text("""
            INSERT INTO orders
              (user_id, order_number, order_type, status, delivery_address_id,
               payment_method, total_amount, discount_amount, points_used, delivery_fee, created_at)
            VALUES (:uid, :onum, :otype, :st, :aid, :pay, :total, :disc, :pts, :dfee, :cat)
        """), {
            "uid": uid, "onum": onum, "otype": otype, "st": st, "aid": aid,
            "pay": pay, "total": total, "disc": disc, "pts": pts, "dfee": dfee, "cat": cat
        })
    conn.commit()
    print("주문 30건 INSERT 완료")

    # 3) 주문아이템
    item_count = 0
    for onum, items in items_data.items():
        oid_row = conn.execute(text("SELECT id FROM orders WHERE order_number = :onum"), {"onum": onum}).fetchone()
        if not oid_row:
            print(f"  [WARN] order not found: {onum}")
            continue
        oid = oid_row[0]
        cat_row = conn.execute(text("SELECT created_at FROM orders WHERE id = :oid"), {"oid": oid}).fetchone()
        cat = str(cat_row[0]) if cat_row else None
        for blend_id, qty, price, grind, roast in items:
            conn.execute(text("""
                INSERT INTO order_items
                  (order_id, blend_id, quantity, unit_price, options, created_at)
                VALUES (:oid, :bid, :qty, :price, JSON_OBJECT('grind', :grind, 'roast', :roast), :cat)
            """), {"oid": oid, "bid": blend_id, "qty": qty, "price": price, "grind": grind, "roast": roast, "cat": cat})
            item_count += 1
    conn.commit()
    print(f"주문아이템 {item_count}건 INSERT 완료")

    # 최종 확인
    oc = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
    ic = conn.execute(text("SELECT COUNT(*) FROM order_items")).scalar()
    print(f"\n=== 최종: 주문 {oc}건, 주문아이템 {ic}건 ===")
