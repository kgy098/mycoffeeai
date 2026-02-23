# -*- coding: utf-8 -*-
"""실제 DB(158.247.232.223)에 테스트 데이터 삽입
회원 20명 → 배송지 → 주문 30건 → 주문아이템
"""
from sqlalchemy import create_engine, text

DB_URL = "mysql+pymysql://coffee:dnjsxjcl591!@158.247.232.223:3306/coffee"
engine = create_engine(DB_URL)

# ──────────────────────────────────────────────
# 1) 회원 20명
# ──────────────────────────────────────────────
users_sql = text("""
INSERT INTO users (email, password_hash, display_name, provider, phone_number, birth_date, gender, signup_purpose, is_admin, last_login_at, created_at, updated_at) VALUES
('kim.minjun@gmail.com',    NULL, '김민준', 'kakao', '010-2345-0001', '1990-03-15', 'male',   '원두 추천',   0, '2026-02-20 09:00:00', '2025-08-10 10:00:00', '2026-02-20 09:00:00'),
('lee.soyeon@naver.com',    NULL, '이소연', 'naver', '010-2345-0002', '1995-07-22', 'female', '구독 서비스', 0, '2026-02-22 14:30:00', '2025-09-05 11:20:00', '2026-02-22 14:30:00'),
('park.jihoon@hanmail.net',  NULL, '박지훈', 'email', '010-2345-0003', '1988-11-03', 'male',   '선물용 커피', 0, '2026-02-18 08:15:00', '2025-10-12 15:30:00', '2026-02-18 08:15:00'),
('choi.yuna@kakao.com',     NULL, '최유나', 'kakao', '010-2345-0004', '1992-01-28', 'female', '원두 추천',   0, '2026-02-23 07:45:00', '2025-07-20 09:10:00', '2026-02-23 07:45:00'),
('jung.seungwoo@gmail.com', NULL, '정승우', 'email', '010-2345-0005', '1985-06-10', 'male',   '홈카페',      0, '2026-01-30 16:20:00', '2025-11-01 13:45:00', '2026-01-30 16:20:00'),
('han.jieun@naver.com',     NULL, '한지은', 'naver', '010-2345-0006', '1998-09-17', 'female', '구독 서비스', 0, '2026-02-21 11:00:00', '2025-06-15 08:30:00', '2026-02-21 11:00:00'),
('song.dongha@gmail.com',   NULL, '송동하', 'kakao', '010-2345-0007', '1993-04-05', 'male',   '원두 추천',   0, '2026-02-19 10:30:00', '2025-12-01 14:00:00', '2026-02-19 10:30:00'),
('yoon.haeun@kakao.com',    NULL, '윤하은', 'kakao', '010-2345-0008', '1997-12-25', 'female', '홈카페',      0, '2026-02-15 17:45:00', '2025-10-20 10:15:00', '2026-02-15 17:45:00'),
('lim.junghyuk@naver.com',  NULL, '임정혁', 'naver', '010-2345-0009', '1991-08-30', 'male',   '선물용 커피', 0, '2026-02-22 09:20:00', '2025-08-25 16:50:00', '2026-02-22 09:20:00'),
('oh.subin@gmail.com',      NULL, '오수빈', 'email', '010-2345-0010', '1994-02-14', 'female', '원두 추천',   0, '2026-02-17 13:10:00', '2025-11-15 11:00:00', '2026-02-17 13:10:00'),
('kwon.taehyung@kakao.com', NULL, '권태형', 'kakao', '010-2345-0011', '1987-10-08', 'male',   '구독 서비스', 0, '2026-02-23 08:00:00', '2025-05-10 09:30:00', '2026-02-23 08:00:00'),
('shin.mirae@naver.com',    NULL, '신미래', 'naver', '010-2345-0012', '1996-05-20', 'female', '홈카페',      0, '2026-02-10 15:30:00', '2025-09-28 12:40:00', '2026-02-10 15:30:00'),
('baek.sanghyun@gmail.com', NULL, '백상현', 'email', '010-2345-0013', '1989-07-12', 'male',   '원두 추천',   0, '2026-02-20 10:45:00', '2025-07-05 14:20:00', '2026-02-20 10:45:00'),
('ko.yeji@kakao.com',       NULL, '고예지', 'kakao', '010-2345-0014', '1999-03-01', 'female', '선물용 커피', 0, '2026-01-25 12:00:00', '2025-12-10 08:50:00', '2026-01-25 12:00:00'),
('nam.woojin@naver.com',    NULL, '남우진', 'naver', '010-2345-0015', '1986-11-23', 'male',   '구독 서비스', 0, '2026-02-22 16:30:00', '2025-06-30 15:10:00', '2026-02-22 16:30:00'),
('moon.chaeyoung@gmail.com',NULL, '문채영', 'email', '010-2345-0016', '1993-09-09', 'female', '홈카페',      0, '2026-02-14 09:15:00', '2025-10-05 11:30:00', '2026-02-14 09:15:00'),
('hwang.minseo@kakao.com',  NULL, '황민서', 'kakao', '010-2345-0017', '1990-12-30', 'male',   '원두 추천',   0, '2026-02-21 14:00:00', '2025-08-18 10:40:00', '2026-02-21 14:00:00'),
('jang.soojin@naver.com',   NULL, '장수진', 'naver', '010-2345-0018', '1995-04-18', 'female', '구독 서비스', 0, '2026-02-23 06:30:00', '2025-04-22 09:00:00', '2026-02-23 06:30:00'),
('ahn.hyunwoo@gmail.com',   NULL, '안현우', 'apple', '010-2345-0019', '1988-08-07', 'male',   '선물용 커피', 0, '2026-02-08 18:20:00', '2025-11-25 13:15:00', '2026-02-08 18:20:00'),
('seo.daeun@kakao.com',     NULL, '서다은', 'kakao', '010-2345-0020', '1997-06-14', 'female', '홈카페',      0, '2026-02-19 11:50:00', '2025-09-12 07:45:00', '2026-02-19 11:50:00')
""")

with engine.connect() as conn:
    conn.execute(users_sql)
    conn.commit()
    user_cnt = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
    print(f"[1/4] 회원 INSERT 완료 → 전체 {user_cnt}명")

    # user email -> id 매핑
    user_map = {}
    for r in conn.execute(text("SELECT id, email FROM users")):
        user_map[r[1]] = r[0]

# ──────────────────────────────────────────────
# 2) 배송지 (신규 20명 + 기존 중 배송지 없는 유저)
# ──────────────────────────────────────────────
addr_data = [
    ('kim.minjun@gmail.com',    '김민준', '010-2345-0001', '04523', '서울 중구 을지로 55',              '민준빌딩 3층'),
    ('lee.soyeon@naver.com',    '이소연', '010-2345-0002', '06035', '서울 강남구 역삼로 78',            '소연타워 12층'),
    ('park.jihoon@hanmail.net', '박지훈', '010-2345-0003', '02567', '서울 동대문구 왕산로 22',          '지훈아파트 502호'),
    ('choi.yuna@kakao.com',     '최유나', '010-2345-0004', '07281', '서울 영등포구 여의대로 100',       '유나오피스텔 801호'),
    ('jung.seungwoo@gmail.com', '정승우', '010-2345-0005', '13487', '경기 성남시 분당구 판교로 45',     '승우타운 203호'),
    ('han.jieun@naver.com',     '한지은', '010-2345-0006', '34014', '대전 유성구 대학로 99',            '지은빌라 B동 301호'),
    ('song.dongha@gmail.com',   '송동하', '010-2345-0007', '48060', '부산 해운대구 센텀로 30',          '동하리젠시 1504호'),
    ('yoon.haeun@kakao.com',    '윤하은', '010-2345-0008', '61452', '광주 동구 금남로 12',              '하은스퀘어 407호'),
    ('lim.junghyuk@naver.com',  '임정혁', '010-2345-0009', '21354', '인천 남동구 인주대로 150',         '정혁프라자 2층'),
    ('oh.subin@gmail.com',      '오수빈', '010-2345-0010', '41068', '대구 달서구 달구벌대로 88',        '수빈파크 603호'),
    ('kwon.taehyung@kakao.com', '권태형', '010-2345-0011', '16508', '경기 수원시 팔달구 효원로 77',     '태형빌딩 5층'),
    ('shin.mirae@naver.com',    '신미래', '010-2345-0012', '06151', '서울 강남구 선릉로 120',           '미래센터 9층'),
    ('baek.sanghyun@gmail.com', '백상현', '010-2345-0013', '04101', '서울 마포구 월드컵로 200',         '상현하우스 1102호'),
    ('ko.yeji@kakao.com',       '고예지', '010-2345-0014', '35204', '대전 서구 둔산로 50',              '예지맨션 308호'),
    ('nam.woojin@naver.com',    '남우진', '010-2345-0015', '44200', '울산 남구 삼산로 65',              '우진타워 7층'),
    ('moon.chaeyoung@gmail.com','문채영', '010-2345-0016', '63098', '제주 제주시 연동로 33',            '채영빌라 201호'),
    ('hwang.minseo@kakao.com',  '황민서', '010-2345-0017', '24340', '강원 춘천시 중앙로 80',            '민서아파트 1503호'),
    ('jang.soojin@naver.com',   '장수진', '010-2345-0018', '31101', '충남 천안시 동남구 만남로 15',     '수진프라자 4층'),
    ('ahn.hyunwoo@gmail.com',   '안현우', '010-2345-0019', '54843', '전북 전주시 완산구 전주로 110',    '현우빌딩 6층'),
    ('seo.daeun@kakao.com',     '서다은', '010-2345-0020', '61186', '광주 북구 용봉로 55',              '다은하우스 902호'),
]

with engine.connect() as conn:
    for email, name, phone, postal, addr1, addr2 in addr_data:
        uid = user_map.get(email)
        if uid:
            conn.execute(text("""
                INSERT INTO delivery_addresses
                  (user_id, recipient_name, phone_number, postal_code, address_line1, address_line2, is_default, created_at, updated_at)
                VALUES (:uid, :name, :phone, :postal, :addr1, :addr2, 1, NOW(), NOW())
            """), {"uid": uid, "name": name, "phone": phone, "postal": postal, "addr1": addr1, "addr2": addr2})
    conn.commit()
    addr_cnt = conn.execute(text("SELECT COUNT(*) FROM delivery_addresses")).scalar()
    print(f"[2/4] 배송지 INSERT 완료 → 전체 {addr_cnt}건")

    # user_id -> address_id
    addr_map = {}
    for r in conn.execute(text("SELECT user_id, id FROM delivery_addresses ORDER BY id DESC")):
        if r[0] not in addr_map:
            addr_map[r[0]] = r[1]

# ──────────────────────────────────────────────
# 3) 주문 30건
# ──────────────────────────────────────────────
# (email, order_number, order_type, status, payment, total, discount, points, delivery_fee, created_at)
orders_data = [
    # ── 12월 10건 ──
    ('kim.minjun@gmail.com',    'ORD-20251201-1001', 'single',       '4', 'card',  15000, 0,    0,    3000, '2025-12-01 09:23:00'),
    ('choi.yuna@kakao.com',     'ORD-20251203-1002', 'subscription', '4', 'kakao', 34000, 0,    0,    0,    '2025-12-03 14:10:00'),
    ('song.dongha@gmail.com',   'ORD-20251206-1003', 'single',       '4', 'naver', 36000, 2000, 0,    0,    '2025-12-06 11:45:00'),
    ('kwon.taehyung@kakao.com', 'ORD-20251209-1004', 'single',       '5', 'card',  17000, 0,    0,    3000, '2025-12-09 16:30:00'),
    ('nam.woojin@naver.com',    'ORD-20251212-1005', 'subscription', '4', 'toss',  33000, 0,    500,  0,    '2025-12-12 10:05:00'),
    ('lee.soyeon@naver.com',    'ORD-20251215-1006', 'single',       '4', 'card',  16500, 0,    0,    3000, '2025-12-15 08:55:00'),
    ('jang.soojin@naver.com',   'ORD-20251218-1007', 'single',       '6', 'kakao', 39000, 3000, 0,    0,    '2025-12-18 13:20:00'),
    ('lim.junghyuk@naver.com',  'ORD-20251221-1008', 'subscription', '4', 'card',  19000, 0,    0,    0,    '2025-12-21 17:40:00'),
    ('han.jieun@naver.com',     'ORD-20251225-1009', 'single',       '4', 'naver', 31000, 1000, 1000, 0,    '2025-12-25 09:10:00'),
    ('baek.sanghyun@gmail.com', 'ORD-20251229-1010', 'single',       '4', 'toss',  14500, 0,    0,    3000, '2025-12-29 15:50:00'),
    # ── 1월 12건 ──
    ('jung.seungwoo@gmail.com', 'ORD-20260102-2001', 'single',       '4', 'card',  35500, 0,    0,    0,    '2026-01-02 10:00:00'),
    ('yoon.haeun@kakao.com',    'ORD-20260104-2002', 'subscription', '4', 'kakao', 17000, 0,    0,    0,    '2026-01-04 11:30:00'),
    ('shin.mirae@naver.com',    'ORD-20260107-2003', 'single',       '4', 'naver', 40000, 3000, 0,    0,    '2026-01-07 14:15:00'),
    ('moon.chaeyoung@gmail.com','ORD-20260109-2004', 'single',       '5', 'card',  15500, 0,    0,    3000, '2026-01-09 09:45:00'),
    ('park.jihoon@hanmail.net', 'ORD-20260112-2005', 'subscription', '4', 'toss',  18500, 0,    500,  0,    '2026-01-12 16:20:00'),
    ('seo.daeun@kakao.com',     'ORD-20260115-2006', 'single',       '4', 'card',  32000, 2000, 0,    0,    '2026-01-15 08:30:00'),
    ('oh.subin@gmail.com',      'ORD-20260118-2007', 'subscription', '4', 'kakao', 16000, 0,    0,    0,    '2026-01-18 12:00:00'),
    ('abc@gmail.com',           'ORD-20260120-2008', 'single',       '4', 'naver', 37000, 0,    0,    0,    '2026-01-20 13:45:00'),
    ('hwang.minseo@kakao.com',  'ORD-20260122-2009', 'single',       '4', 'card',  19500, 0,    0,    3000, '2026-01-22 17:10:00'),
    ('ko.yeji@kakao.com',       'ORD-20260125-2010', 'subscription', '4', 'toss',  20000, 0,    1000, 0,    '2026-01-25 10:55:00'),
    ('ahn.hyunwoo@gmail.com',   'ORD-20260128-2011', 'single',       '4', 'kakao', 28500, 1000, 0,    0,    '2026-01-28 14:30:00'),
    ('kim.minjun@gmail.com',    'ORD-20260131-2012', 'subscription', '4', 'card',  16000, 0,    0,    0,    '2026-01-31 09:20:00'),
    # ── 2월 8건 ──
    ('han.jieun@naver.com',     'ORD-20260203-3001', 'single',       '4', 'naver', 34500, 0,    0,    0,    '2026-02-03 11:00:00'),
    ('kwon.taehyung@kakao.com', 'ORD-20260206-3002', 'subscription', '4', 'card',  18000, 0,    0,    0,    '2026-02-06 15:20:00'),
    ('choi.yuna@kakao.com',     'ORD-20260209-3003', 'single',       '6', 'toss',  31500, 1500, 0,    0,    '2026-02-09 10:40:00'),
    ('nam.woojin@naver.com',    'ORD-20260212-3004', 'single',       '3', 'kakao', 17500, 0,    500,  3000, '2026-02-12 13:15:00'),
    ('yoon.haeun@kakao.com',    'ORD-20260215-3005', 'subscription', '3', 'card',  19000, 0,    0,    0,    '2026-02-15 09:30:00'),
    ('lee.soyeon@naver.com',    'ORD-20260218-3006', 'single',       '2', 'naver', 36500, 2000, 0,    0,    '2026-02-18 14:50:00'),
    ('seo.daeun@kakao.com',     'ORD-20260221-3007', 'single',       '2', 'card',  15000, 0,    0,    3000, '2026-02-21 16:10:00'),
    ('baek.sanghyun@gmail.com', 'ORD-20260223-3008', 'single',       '1', 'toss',  38000, 0,    0,    0,    '2026-02-23 08:45:00'),
]

with engine.connect() as conn:
    for o in orders_data:
        email, onum, otype, st, pay, total, disc, pts, dfee, cat = o
        uid = user_map.get(email)
        aid = addr_map.get(uid) if uid else None
        conn.execute(text("""
            INSERT INTO orders
              (user_id, order_number, order_type, status, delivery_address_id,
               payment_method, total_amount, discount_amount, points_used, delivery_fee, created_at)
            VALUES (:uid, :onum, :otype, :st, :aid, :pay, :total, :disc, :pts, :dfee, :cat)
        """), {"uid": uid, "onum": onum, "otype": otype, "st": st, "aid": aid,
               "pay": pay, "total": total, "disc": disc, "pts": pts, "dfee": dfee, "cat": cat})
    conn.commit()
    order_cnt = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
    print(f"[3/4] 주문 INSERT 완료 → 전체 {order_cnt}건")

# ──────────────────────────────────────────────
# 4) 주문아이템 (주문당 1~2개, 블렌드/grind/roast 골고루)
# ──────────────────────────────────────────────
# order_number -> [ (blend_id, qty, unit_price, grind, roast), ... ]
items_data = {
    # 12월
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
    # 1월
    'ORD-20260102-2001': [(11, 1, 18500, 'fine',       'dark'),   (4, 1, 17000, 'medium', 'medium')],
    'ORD-20260104-2002': [(4,  1, 17000, 'coarse',     'light')],
    'ORD-20260107-2003': [(13, 2, 19500, 'whole_bean', 'dark')],
    'ORD-20260109-2004': [(9,  1, 15500, 'medium',     'medium')],
    'ORD-20260112-2005': [(11, 1, 18500, 'fine',       'light')],
    'ORD-20260115-2006': [(10, 2, 16000, 'coarse',     'dark')],
    'ORD-20260118-2007': [(3,  1, 16000, 'whole_bean', 'medium')],
    'ORD-20260120-2008': [(2,  1, 18000, 'medium',     'dark'),   (7, 1, 19000, 'fine', 'light')],
    'ORD-20260122-2009': [(13, 1, 19500, 'coarse',     'medium')],
    'ORD-20260125-2010': [(15, 1, 20000, 'fine',       'dark')],
    'ORD-20260128-2011': [(14, 1, 15500, 'whole_bean', 'light'),  (12, 1, 17000, 'medium', 'dark')],
    'ORD-20260131-2012': [(10, 1, 16000, 'coarse',     'medium')],
    # 2월
    'ORD-20260203-3001': [(8,  1, 17500, 'fine',       'light'),  (4, 1, 17000, 'whole_bean', 'dark')],
    'ORD-20260206-3002': [(2,  1, 18000, 'medium',     'medium')],
    'ORD-20260209-3003': [(12, 1, 17000, 'coarse',     'dark'),   (6, 1, 14500, 'fine', 'light')],
    'ORD-20260212-3004': [(8,  1, 17500, 'whole_bean', 'medium')],
    'ORD-20260215-3005': [(7,  1, 19000, 'medium',     'dark')],
    'ORD-20260218-3006': [(15, 1, 20000, 'fine',       'light'),  (5, 1, 16500, 'coarse', 'medium')],
    'ORD-20260221-3007': [(1,  1, 15000, 'whole_bean', 'dark')],
    'ORD-20260223-3008': [(13, 1, 19500, 'medium',     'light'),  (11, 1, 18500, 'fine', 'dark')],
}

with engine.connect() as conn:
    item_count = 0
    for onum, items in items_data.items():
        row = conn.execute(text("SELECT id, created_at FROM orders WHERE order_number = :onum"), {"onum": onum}).fetchone()
        if not row:
            print(f"  [WARN] 주문 없음: {onum}")
            continue
        oid, cat = row[0], str(row[1])
        for blend_id, qty, price, grind, roast in items:
            conn.execute(text("""
                INSERT INTO order_items (order_id, blend_id, quantity, unit_price, options, created_at)
                VALUES (:oid, :bid, :qty, :price, JSON_OBJECT('grind', :grind, 'roast', :roast), :cat)
            """), {"oid": oid, "bid": blend_id, "qty": qty, "price": price,
                   "grind": grind, "roast": roast, "cat": cat})
            item_count += 1
    conn.commit()
    total_items = conn.execute(text("SELECT COUNT(*) FROM order_items")).scalar()
    print(f"[4/4] 주문아이템 {item_count}건 INSERT 완료 → 전체 {total_items}건")

# ──────────────────────────────────────────────
# 최종 검증
# ──────────────────────────────────────────────
with engine.connect() as conn:
    u = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
    a = conn.execute(text("SELECT COUNT(*) FROM delivery_addresses")).scalar()
    o = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
    i = conn.execute(text("SELECT COUNT(*) FROM order_items")).scalar()
    print(f"\n{'='*50}")
    print(f"최종 검증 결과:")
    print(f"  users:              {u}명")
    print(f"  delivery_addresses: {a}건")
    print(f"  orders:             {o}건")
    print(f"  order_items:        {i}건")
    print(f"{'='*50}")
