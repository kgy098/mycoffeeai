# -*- coding: utf-8 -*-
"""양쪽 DB에 컬렉션 테스트 데이터 삽입
analysis_results (회원별 1~2건) + user_collections
"""
from sqlalchemy import create_engine, text

SERVERS = {
    "dev":  "mysql+pymysql://coffee:dnjsxjcl591!@49.247.7.124:3306/coffee",
    "prod": "mysql+pymysql://coffee:dnjsxjcl591!@158.247.232.223:3306/coffee",
}

# (email, aroma, acidity, sweetness, body, nuttiness, created_at, collection_name, comment)
DATA = [
    # 김민준 (2건)
    ("kim.minjun@gmail.com", 5, 3, 2, 4, 3, "2026-01-10 10:00:00", "향이 좋은 커피", "향이 진하고 깊어서 좋았어요"),
    ("kim.minjun@gmail.com", 4, 2, 3, 5, 2, "2026-02-05 14:20:00", "바디감 좋은 블렌드", "묵직한 느낌이 좋음"),
    # 이소연 (2건)
    ("lee.soyeon@naver.com", 3, 5, 4, 2, 1, "2026-01-15 11:30:00", "상큼한 산미 커피", "산미가 살아있어요"),
    ("lee.soyeon@naver.com", 3, 4, 3, 3, 2, "2026-02-10 09:15:00", "데일리 커피", "매일 마시기 좋은 밸런스"),
    # 박지훈 (1건)
    ("park.jihoon@gmail.com", 2, 1, 2, 5, 4, "2026-01-20 15:00:00", "진한 에스프레소", "아메리카노에 딱이에요"),
    # 최유나 (2건)
    ("choi.yuna@kakao.com", 3, 2, 5, 3, 4, "2026-01-08 08:30:00", "달콤한 디저트 커피", "케이크랑 잘 어울려요"),
    ("choi.yuna@kakao.com", 4, 3, 5, 2, 3, "2026-02-15 16:45:00", "오후 커피", "오후에 마시기 좋아요"),
    # 정승우 (1건)
    ("jung.seungwoo@gmail.com", 2, 1, 3, 4, 5, "2026-01-25 13:10:00", "고소한 견과류 향", "아몬드 향이 나요"),
    # 한지은 (2건)
    ("han.jieun@naver.com", 3, 3, 3, 3, 3, "2026-01-12 10:20:00", "밸런스 블렌드", "무난하게 좋아요"),
    ("han.jieun@naver.com", 4, 3, 4, 3, 3, "2026-02-08 11:00:00", "조금 더 향이 강한", "향이 약간 강해서 좋아요"),
    # 송동하 (1건)
    ("song.dongha@gmail.com", 5, 2, 2, 5, 3, "2026-02-01 09:30:00", "파워풀 커피", "강한 맛을 원할 때"),
    # 윤하은 (2건)
    ("yoon.haeun@kakao.com", 5, 4, 3, 2, 1, "2026-01-18 14:00:00", "과일향 가득", "에티오피아 원두 느낌"),
    ("yoon.haeun@kakao.com", 5, 3, 2, 4, 3, "2026-02-12 10:30:00", "두 번째 시도", "이번엔 바디감도 좋네요"),
    # 임정혁 (1건)
    ("lim.junghyuk@naver.com", 2, 1, 1, 5, 5, "2026-02-03 16:15:00", "헤비 로스트", "다크 로스팅 좋아해요"),
    # 오수빈 (2건)
    ("oh.subin@gmail.com", 4, 2, 5, 3, 3, "2026-01-22 11:45:00", "달콤향 블렌드", "라떼에 잘 맞아요"),
    ("oh.subin@gmail.com", 3, 2, 5, 3, 4, "2026-02-18 08:20:00", "고소달달", "고소함이 더해져서 좋아요"),
    # 권태형 (1건)
    ("kwon.taehyung@kakao.com", 3, 3, 3, 3, 3, "2026-02-06 13:00:00", "올라운더", "뭘 해도 맛있어요"),
    # 신미래 (2건)
    ("shin.mirae@naver.com", 3, 4, 4, 2, 2, "2026-01-05 09:50:00", "새콤달콤", "과일 느낌 좋아요"),
    ("shin.mirae@naver.com", 4, 5, 4, 1, 1, "2026-02-14 15:30:00", "산미 끝판왕", "케냐 스타일 좋아요"),
    # 백상현 (1건)
    ("baek.sanghyun@gmail.com", 5, 3, 2, 4, 3, "2026-02-09 10:10:00", "아로마 블렌드", "코로 마시는 커피"),
    # 고예지 (2건)
    ("ko.yeji@kakao.com", 2, 1, 4, 3, 5, "2026-01-28 12:30:00", "겨울 간식 커피", "호두과자랑 같이 먹으면 최고"),
    ("ko.yeji@kakao.com", 3, 2, 5, 3, 4, "2026-02-20 09:40:00", "봄맞이 커피", "달달하니 좋아요"),
    # 남우진 (1건)
    ("nam.woojin@naver.com", 3, 2, 2, 5, 4, "2026-02-11 14:50:00", "진한 아침 커피", "출근 전 한 잔"),
    # 문채영 (2건)
    ("moon.chaeyoung@gmail.com", 4, 4, 3, 1, 2, "2026-01-14 16:00:00", "가벼운 오후", "가볍게 마시기 좋은 커피"),
    ("moon.chaeyoung@gmail.com", 3, 5, 4, 2, 1, "2026-02-16 11:20:00", "상큼한 에티오피아", "밝은 산미가 매력적"),
    # 황민서 (1건)
    ("hwang.minseo@kakao.com", 4, 3, 3, 3, 3, "2026-02-07 08:00:00", "향기로운 밸런스", "향도 좋고 밸런스도 좋아요"),
    # 장수진 (2건)
    ("jang.soojin@naver.com", 5, 1, 1, 4, 5, "2026-01-30 10:30:00", "극강 향+고소", "너무 강렬해서 좋아요"),
    ("jang.soojin@naver.com", 3, 3, 4, 3, 3, "2026-02-19 13:45:00", "편한 블렌드", "부드럽게 마시기 좋아요"),
    # 안현우 (1건)
    ("ahn.hyunwoo@gmail.com", 2, 1, 2, 4, 5, "2026-02-04 15:20:00", "고소한 선물용", "부모님 선물로 딱이에요"),
    # 서다은 (2건)
    ("seo.daeun@kakao.com", 5, 2, 4, 3, 2, "2026-01-07 09:00:00", "플로럴 블렌드", "꽃향이 은은해요"),
    ("seo.daeun@kakao.com", 4, 3, 5, 2, 3, "2026-02-21 11:10:00", "달콤한 봄 커피", "봄에 어울리는 커피"),
]


def run_for_server(label: str, db_url: str):
    print(f"\n{'='*50}")
    print(f"[{label}] {db_url.split('@')[1].split('/')[0]}")
    print(f"{'='*50}")

    engine = create_engine(db_url)

    with engine.connect() as conn:
        # user email -> id
        user_map = {}
        for r in conn.execute(text("SELECT id, email FROM users")):
            user_map[r[1]] = r[0]
        print(f"  기존 회원 수: {len(user_map)}명")

        # blend ids (순서대로)
        blend_ids = [r[0] for r in conn.execute(text("SELECT id FROM blends ORDER BY id"))]
        if not blend_ids:
            print(f"  [ERROR] blends 테이블이 비어있습니다. 종료.")
            return
        print(f"  블렌드 수: {len(blend_ids)}개")

        inserted_ar = 0
        inserted_uc = 0
        blend_idx = 0

        for email, aroma, acidity, sweetness, body, nuttiness, created_at, coll_name, comment in DATA:
            uid = user_map.get(email)
            if not uid:
                print(f"  [SKIP] 회원 없음: {email}")
                continue

            # blend 순환 할당
            bid = blend_ids[blend_idx % len(blend_ids)]
            blend_idx += 1

            # analysis_result INSERT
            conn.execute(text("""
                INSERT INTO analysis_results
                  (user_id, aroma, acidity, sweetness, body, nuttiness, blend_id, created_at)
                VALUES (:uid, :aroma, :acidity, :sweetness, :body, :nuttiness, :bid, :cat)
            """), {
                "uid": uid, "aroma": aroma, "acidity": acidity,
                "sweetness": sweetness, "body": body, "nuttiness": nuttiness,
                "bid": bid, "cat": created_at,
            })
            inserted_ar += 1

            # 방금 삽입한 analysis_result id
            arid = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()

            # user_collection INSERT
            conn.execute(text("""
                INSERT INTO user_collections
                  (user_id, blend_id, analysis_result_id, collection_name, personal_comment, created_at, updated_at)
                VALUES (:uid, :bid, :arid, :cname, :comment, :cat, :cat)
            """), {
                "uid": uid, "bid": bid, "arid": arid,
                "cname": coll_name, "comment": comment, "cat": created_at,
            })
            inserted_uc += 1

        conn.commit()

        # 검증
        ar_total = conn.execute(text("SELECT COUNT(*) FROM analysis_results")).scalar()
        uc_total = conn.execute(text("SELECT COUNT(*) FROM user_collections")).scalar()
        print(f"  analysis_results: +{inserted_ar}건 (전체 {ar_total}건)")
        print(f"  user_collections: +{inserted_uc}건 (전체 {uc_total}건)")
        print(f"  완료!")


if __name__ == "__main__":
    for label, url in SERVERS.items():
        try:
            run_for_server(label, url)
        except Exception as e:
            print(f"  [ERROR] {label}: {e}")
