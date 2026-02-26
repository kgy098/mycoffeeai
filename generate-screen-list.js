const XLSX = require("xlsx");

// [카테고리, 화면명, 화면구분, 라우트 경로, 파일 위치, 구현 상태, 하드코딩 상세]
const data = [
  // 인증
  ["인증", "로그인 선택", "", "/auth/login-select", "front/src/app/auth/login-select/page.tsx", "✅ 구현 완료", ""],
  ["인증", "로그인", "", "/auth/login", "front/src/app/auth/login/page.tsx", "✅ 구현 완료", ""],
  ["인증", "회원가입", "", "/auth/register", "front/src/app/auth/register/page.tsx", "⚠️ 하드코딩", "SMS 인증코드 '123456' 고정값 사용. 실제 SMS API 연동 필요"],
  ["인증", "회원가입 성공", "", "/auth/register/success", "front/src/app/auth/register/success/page.tsx", "✅ 구현 완료", ""],
  ["인증", "회원가입 약관", "약관", "/auth/register/terms", "front/src/app/auth/register/terms/page.tsx", "✅ 구현 완료", ""],
  ["인증", "회원가입 개인정보 동의", "약관", "/auth/register/privacy", "front/src/app/auth/register/privacy/page.tsx", "✅ 구현 완료", ""],
  ["인증", "회원가입 마케팅 동의", "약관", "/auth/register/marketing", "front/src/app/auth/register/marketing/page.tsx", "✅ 구현 완료", ""],
  ["인증", "회원가입 (구버전)", "", "/auth/register2", "front/src/app/auth/register2/page.tsx", "✅ 구현 완료", "구버전/테스트용 회원가입 페이지"],
  ["인증", "아이디 찾기", "", "/auth/find-id", "front/src/app/auth/find-id/page.tsx", "✅ 구현 완료", ""],
  ["인증", "아이디 찾기 결과", "", "/auth/find-id/select", "front/src/app/auth/find-id/select/page.tsx", "✅ 구현 완료", ""],
  ["인증", "비밀번호 찾기", "", "/auth/forgot-password", "front/src/app/auth/forgot-password/page.tsx", "✅ 구현 완료", ""],
  ["인증", "비밀번호 재설정", "", "/auth/forgot-password/reset-password", "front/src/app/auth/forgot-password/reset-password/page.tsx", "✅ 구현 완료", ""],
  ["인증", "비밀번호 재설정 성공", "", "/auth/forgot-password/success", "front/src/app/auth/forgot-password/success/page.tsx", "✅ 구현 완료", ""],

  // 홈
  ["홈", "랜딩/리다이렉트", "", "/", "front/src/app/page.tsx", "✅ 구현 완료", ""],
  ["홈", "홈 대시보드", "", "/home", "front/src/app/home/page.tsx", "✅ 구현 완료", ""],

  // 커뮤니티
  ["커뮤니티", "커뮤니티 허브", "", "/community", "front/src/app/(with-header-footer)/community/page.tsx", "✅ 구현 완료", ""],
  ["커뮤니티", "커피 스토리 메인", "", "/community/coffee-story-main", "front/src/app/(with-header-footer)/community/coffee-story-main/page.tsx", "✅ 구현 완료", ""],
  ["커뮤니티", "커피 스토리 상세", "", "/community/coffee-story-main/[id]", "front/src/app/(with-header-footer)/community/coffee-story-main/[coffe-story]/page.tsx", "✅ 구현 완료", ""],
  ["커뮤니티", "커피 팁 메인", "", "/community/coffee-tip-main", "front/src/app/(with-header-footer)/community/coffee-tip-main/page.tsx", "✅ 구현 완료", ""],
  ["커뮤니티", "커피 팁 상세", "", "/community/coffee-tip-main/[id]", "front/src/app/(with-header-footer)/community/coffee-tip-main/[coffee-tip-detail]/page.tsx", "✅ 구현 완료", ""],
  ["커뮤니티", "이벤트 메인", "", "/community/event-main", "front/src/app/(with-header-footer)/community/event-main/page.tsx", "✅ 구현 완료", ""],
  ["커뮤니티", "이벤트 상세", "", "/community/event-main/[id]", "front/src/app/(with-header-footer)/community/event-main/[event-main-detail]/page.tsx", "✅ 구현 완료", ""],

  // 마이커피
  ["마이커피", "마이커피 허브", "", "/my-coffee", "front/src/app/(with-header-footer)/my-coffee/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "취향 분석", "", "/my-coffee/taste-analysis", "front/src/app/(with-header-footer)/my-coffee/taste-analysis/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "분석 결과 목록", "", "/my-coffee/taste-analysis/ready", "front/src/app/(with-header-footer)/my-coffee/taste-analysis/ready/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "분석 결과 상세", "", "/my-coffee/taste-analysis/ready/[id]", "front/src/app/(with-header-footer)/my-coffee/taste-analysis/ready/[id]/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "컬렉션", "", "/my-coffee/collection", "front/src/app/(with-header-footer)/my-coffee/collection/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "컬렉션 상세", "", "/my-coffee/collection/[id]", "front/src/app/(with-header-footer)/my-coffee/collection/[id]/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "월간 커피", "", "/my-coffee/monthly-coffee", "front/src/app/(with-header-footer)/my-coffee/monthly-coffee/page.tsx", "⚠️ 하드코딩", "맛 평가 값이 모두 1로 고정 (aroma, acidity, sweetness, nuttiness, body). API에서 동적 로딩 필요"],
  ["마이커피", "월간 커피 상세", "", "/my-coffee/monthly-coffee/detail", "front/src/app/(with-header-footer)/my-coffee/monthly-coffee/detail/page.tsx", "✅ 구현 완료", ""],
  ["마이커피", "주문하기", "", "/my-coffee/components/ordering", "front/src/app/(with-header-footer)/my-coffee/components/ordering/page.tsx", "✅ 구현 완료", ""],

  // 리뷰
  ["리뷰", "리뷰 메인", "", "/review-main", "front/src/app/(with-header-footer)/(review)/review-main/page.tsx", "✅ 구현 완료", ""],
  ["리뷰", "리뷰 분석", "", "/review-analysys", "front/src/app/(with-header-footer)/(review)/review-analysys/page.tsx", "✅ 구현 완료", "디렉토리명 오타: analysys (analysis)"],
  ["리뷰", "리뷰 작성", "", "/profile/reviews/write-review", "front/src/app/(with-header-footer)/profile/reviews/write-review/page.tsx", "✅ 구현 완료", ""],
  ["리뷰", "리뷰 작성 (주문건별)", "", "/profile/write-review/[id]", "front/src/app/(width-header)/profile/write-review/[id]/page.tsx", "✅ 구현 완료", ""],
  ["리뷰", "리뷰 히스토리", "", "/profile/reviews/history", "front/src/app/(with-header-footer)/profile/reviews/history/page.tsx", "✅ 구현 완료", ""],
  ["리뷰", "리뷰 상세", "", "/profile/reviews/history/[id]", "front/src/app/(with-header-footer)/profile/reviews/history/[id]/page.tsx", "✅ 구현 완료", ""],
  ["리뷰", "리뷰 수정", "", "/profile/write-review/edit/[id]", "front/src/app/(width-header)/profile/write-review/edit/[reviewId]/page.tsx", "✅ 구현 완료", ""],

  // 프로필/계정
  ["프로필", "마이페이지", "", "/profile", "front/src/app/(with-header-footer)/profile/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "개인정보 관리", "", "/profile/personal-info-management", "front/src/app/(with-header-footer)/profile/(personal-info-management)/personal-info-management/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "전화번호 변경", "", "/profile/change-phone", "front/src/app/(with-header-footer)/profile/(personal-info-management)/change-phone/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "회원탈퇴", "", "/profile/membership-withdraw", "front/src/app/(with-header-footer)/profile/(personal-info-management)/membership-withdraw/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "주문/배송 현황", "", "/profile/order-delivery", "front/src/app/(with-header-footer)/profile/order-delivery/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "주문/배송 상세", "", "/order-delivery/[id]", "front/src/app/(with-header-footer)/order-delivery/[id]/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "구독 관리", "", "/profile/manage-subscriptions", "front/src/app/(with-header-footer)/profile/manage-subscriptions/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "구독 상세", "", "/profile/manage-subscriptions/[id]", "front/src/app/(with-header-footer)/profile/manage-subscriptions/[id]/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "포인트 사용 내역", "", "/point-usage-history", "front/src/app/(with-header-footer)/point-usage-history/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "문의 내역", "", "/profile/inquiries", "front/src/app/(with-header-footer)/profile/inquiries/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "설정", "", "/profile/settings/my-settings", "front/src/app/(with-header-footer)/profile/settings/my-settings/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "이용약관", "약관", "/profile/settings/apply-term-of-use", "front/src/app/(with-header-footer)/profile/settings/apply-term-of-use/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "이용약관 - 개인정보 수집이용", "약관", "/profile/settings/apply-term-of-use/collect-and-use-personal-info", "front/src/app/(with-header-footer)/profile/settings/apply-term-of-use/collect-and-use-personal-info/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "이용약관 - 제3자 제공", "약관", "/profile/settings/apply-term-of-use/third-party-provision", "front/src/app/(with-header-footer)/profile/settings/apply-term-of-use/third-party-provision/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "마케팅 동의", "약관", "/profile/settings/marketing-permission", "front/src/app/(with-header-footer)/profile/settings/marketing-permission/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "알림 설정", "", "/profile/settings/notification-settings", "front/src/app/(with-header-footer)/profile/settings/notification-settings/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "배송지 관리", "", "/delivery-address-management", "front/src/app/(with-header-footer)/(delivery-address-management)/delivery-address-management/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "배송지 등록", "", "/create-delivery", "front/src/app/(width-header)/(delivery)/create-delivery/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "배송지 수정", "", "/edit-delivery", "front/src/app/(width-header)/(delivery)/edit-delivery/page.tsx", "✅ 구현 완료", ""],
  ["프로필", "문의 등록", "", "/profile/contact-us-registration", "front/src/app/(width-header)/profile/contact-us-registration/page.tsx", "✅ 구현 완료", ""],

  // 결제/구매
  ["결제", "개별 구매", "", "/purchase-individual-item", "front/src/app/(with-header-footer)/(purchase)/purchase-individual-item/page.tsx", "✅ 구현 완료", ""],
  ["결제", "구독 구매", "", "/purchase-subscription", "front/src/app/(with-header-footer)/(purchase)/purchase-subscription/page.tsx", "✅ 구현 완료", ""],
  ["결제", "결제 성공", "", "/payment/success", "front/src/app/payment/success/page.tsx", "✅ 구현 완료", ""],
  ["결제", "결제 실패", "", "/payment/fail", "front/src/app/payment/fail/page.tsx", "✅ 구현 완료", ""],

  // 이벤트
  ["이벤트", "이벤트 메인", "", "/on-event", "front/src/app/(content-only)/on-event/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "이벤트 분석", "", "/on-event/analysis", "front/src/app/(content-only)/on-event/analysis/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "이벤트 상세", "", "/on-event/detail", "front/src/app/(content-only)/on-event/detail/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "이벤트 히스토리", "", "/on-event/history", "front/src/app/(content-only)/on-event/history/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "이벤트 결과", "", "/on-event/result", "front/src/app/(content-only)/on-event/result/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "이벤트 결제", "", "/on-event/result/payment", "front/src/app/(content-only)/on-event/result/payment/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "약관(개인정보)", "약관", "/on-event/terms/privacy", "front/src/app/(content-only)/on-event/terms/privacy/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "약관(마케팅)", "약관", "/on-event/terms/marketing", "front/src/app/(content-only)/on-event/terms/marketing/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "관리자 이벤트", "", "/admin-event", "front/src/app/(content-only)/admin-event/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "이벤트 요청", "", "/admin-event/requests", "front/src/app/(content-only)/admin-event/requests/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "주문 내역", "", "/admin-event/order-history", "front/src/app/(content-only)/admin-event/order-history/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "주문 성공", "", "/success-order", "front/src/app/(content-only)/success-order/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "분석", "", "/analysis", "front/src/app/(content-only)/analysis/page.tsx", "✅ 구현 완료", ""],
  ["이벤트", "결과", "", "/result", "front/src/app/(content-only)/result/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 대시보드
  ["관리자", "대시보드", "", "/admin", "front/src/app/admin/page.tsx", "✅ 구현 완료", ""],
  ["관리자", "관리자 로그인", "", "/admin/login", "front/src/app/admin/login/page.tsx", "✅ 구현 완료", ""],
  ["관리자", "관리자 회원가입", "", "/admin/register", "front/src/app/admin/register/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 회원관리
  ["관리자-회원", "회원 목록", "", "/admin/members", "front/src/app/admin/members/page.tsx", "✅ 구현 완료", ""],
  ["관리자-회원", "회원 상세", "", "/admin/members/[memberId]", "front/src/app/admin/members/[memberId]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-회원", "회원 생성", "", "/admin/members/new", "front/src/app/admin/members/new/page.tsx", "✅ 구현 완료", ""],
  ["관리자-회원", "회원 컬렉션", "", "/admin/members/collections", "front/src/app/admin/members/collections/page.tsx", "✅ 구현 완료", ""],
  ["관리자-회원", "컬렉션 상세", "", "/admin/members/collections/[id]", "front/src/app/admin/members/collections/[id]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-회원", "컬렉션 분석", "", "/admin/members/collections/analysis", "front/src/app/admin/members/collections/analysis/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 상품
  ["관리자-상품", "상품 목록", "", "/admin/products", "front/src/app/admin/products/page.tsx", "✅ 구현 완료", ""],
  ["관리자-상품", "상품 상세", "", "/admin/products/[productId]", "front/src/app/admin/products/[productId]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-상품", "상품 생성", "", "/admin/products/new", "front/src/app/admin/products/new/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 주문/결제
  ["관리자-주문", "주문 목록", "", "/admin/orders", "front/src/app/admin/orders/page.tsx", "✅ 구현 완료", ""],
  ["관리자-주문", "주문 상세", "", "/admin/orders/[orderId]", "front/src/app/admin/orders/[orderId]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-결제", "결제 목록", "", "/admin/payments", "front/src/app/admin/payments/page.tsx", "✅ 구현 완료", ""],
  ["관리자-결제", "결제 상세", "", "/admin/payments/[paymentId]", "front/src/app/admin/payments/[paymentId]/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 콘텐츠
  ["관리자-콘텐츠", "게시물 목록", "", "/admin/posts", "front/src/app/admin/posts/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "게시물 생성", "", "/admin/posts/new", "front/src/app/admin/posts/new/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "게시물 상세", "", "/admin/posts/[category]/[postId]", "front/src/app/admin/posts/[category]/[postId]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "배너 목록", "", "/admin/banners", "front/src/app/admin/banners/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "배너 상세", "", "/admin/banners/[id]", "front/src/app/admin/banners/[id]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "배너 생성", "", "/admin/banners/new", "front/src/app/admin/banners/new/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "리뷰 목록", "", "/admin/reviews", "front/src/app/admin/reviews/page.tsx", "✅ 구현 완료", ""],
  ["관리자-콘텐츠", "리뷰 상세", "", "/admin/reviews/[reviewId]", "front/src/app/admin/reviews/[reviewId]/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 시스템
  ["관리자-시스템", "관리자 목록", "", "/admin/admins", "front/src/app/admin/admins/page.tsx", "✅ 구현 완료", ""],
  ["관리자-시스템", "관리자 상세", "", "/admin/admins/[id]", "front/src/app/admin/admins/[id]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-시스템", "관리자 생성", "", "/admin/admins/new", "front/src/app/admin/admins/new/page.tsx", "✅ 구현 완료", ""],
  ["관리자-시스템", "관리자 승격", "", "/admin/admins/promote", "front/src/app/admin/admins/promote/page.tsx", "✅ 구현 완료", ""],
  ["관리자-시스템", "접속 로그", "", "/admin/access-logs", "front/src/app/admin/access-logs/page.tsx", "✅ 구현 완료", ""],

  // 관리자 - 설정
  ["관리자-설정", "구독 관리", "", "/admin/subscriptions", "front/src/app/admin/subscriptions/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "구독 상세", "", "/admin/subscriptions/[id]", "front/src/app/admin/subscriptions/[id]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "구독 히스토리", "", "/admin/subscriptions/history", "front/src/app/admin/subscriptions/history/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "구독 회원", "", "/admin/subscriptions/members", "front/src/app/admin/subscriptions/members/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "포인트 관리", "", "/admin/points", "front/src/app/admin/points/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "포인트 상세", "", "/admin/points/[id]", "front/src/app/admin/points/[id]/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "점수 척도", "", "/admin/score-scales", "front/src/app/admin/score-scales/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "점수 척도 생성", "", "/admin/score-scales/new", "front/src/app/admin/score-scales/new/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "배송 관리", "", "/admin/shipments", "front/src/app/admin/shipments/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "매출 리포트", "", "/admin/sales", "front/src/app/admin/sales/page.tsx", "✅ 구현 완료", ""],
  ["관리자-설정", "보상 이벤트", "", "/admin/rewards/events", "front/src/app/admin/rewards/events/page.tsx", "✅ 구현 완료", ""],
];

// Create workbook
const wb = XLSX.utils.book_new();

// === Sheet 1: 전체 화면 리스트 ===
const header = ["카테고리", "화면명", "화면구분", "라우트 경로", "파일 위치", "구현 상태", "하드코딩 상세"];
const wsData = [header, ...data];
const ws = XLSX.utils.aoa_to_sheet(wsData);
ws["!cols"] = [
  { wch: 16 },  // 카테고리
  { wch: 28 },  // 화면명
  { wch: 10 },  // 화면구분
  { wch: 55 },  // 라우트 경로
  { wch: 85 },  // 파일 위치
  { wch: 16 },  // 구현 상태
  { wch: 60 },  // 하드코딩 상세
];
XLSX.utils.book_append_sheet(wb, ws, "전체 화면 리스트");

// === Sheet 2: 요약 ===
const summaryData = [
  ["MyCoffee.AI 화면 현황 요약"],
  [],
  ["구분", "화면 수", "비고"],
  ["인증", 13, "아이디 찾기, 회원가입 하위 페이지 포함"],
  ["홈", 2, ""],
  ["커뮤니티", 7, ""],
  ["마이커피", 10, "주문하기 페이지 포함"],
  ["리뷰", 8, "주문건별 리뷰 작성 포함"],
  ["프로필/계정", 20, "이용약관 하위, 주문배송 상세 포함"],
  ["결제/구매", 4, ""],
  ["이벤트", 14, ""],
  ["관리자", 35, ""],
  [],
  ["합계", 113, "사용자 화면 78 + 관리자 화면 35"],
  [],
  ["구현 상태", "수량", ""],
  ["✅ 구현 완료", 111, ""],
  ["⚠️ 하드코딩", 2, "회원가입 SMS 인증, 월간 커피 맛 평가"],
  ["❌ 깨진 링크", 4, "페이지 미구현으로 404 발생"],
];
const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
ws2["!cols"] = [
  { wch: 20 },
  { wch: 12 },
  { wch: 50 },
];
XLSX.utils.book_append_sheet(wb, ws2, "요약");

// === Sheet 3: 하드코딩 상세 ===
const hardcodedData = [
  ["하드코딩 상세 내역"],
  [],
  ["#", "화면명", "파일 위치", "라인", "하드코딩 내용", "수정 필요사항"],
  [1, "회원가입", "front/src/app/auth/register/page.tsx", "168-171",
    "const code = '123456'; setSentVerificationCode(code); alert(`인증번호가 발송되었습니다: ${code}`);",
    "실제 SMS 발송 API 연동 필요 (예: NHN Cloud, CoolSMS 등)"],
  [2, "월간 커피", "front/src/app/(with-header-footer)/my-coffee/monthly-coffee/page.tsx", "17-19",
    "tasteRatings = { aroma: 1, acidity: 1, sweetness: 1, nuttiness: 1, body: 1 }",
    "월간 커피 배너 데이터에서 맛 프로필을 API로 동적 로딩 필요"],
];
const ws3 = XLSX.utils.aoa_to_sheet(hardcodedData);
ws3["!cols"] = [
  { wch: 5 },
  { wch: 15 },
  { wch: 70 },
  { wch: 10 },
  { wch: 60 },
  { wch: 50 },
];
XLSX.utils.book_append_sheet(wb, ws3, "하드코딩 상세");

// === Sheet 4: 깨진 링크 (404) ===
const brokenLinksData = [
  ["깨진 링크 상세 내역 (링크 클릭 시 404 발생)"],
  [],
  ["#", "링크 대상 경로", "링크 유형", "링크가 위치한 파일", "라인", "링크 라벨/컨텍스트", "문제 원인", "수정 제안"],
  [1,
    "/auth/set-new-password",
    "router.push",
    "front/src/app/auth/forgot-password/reset-password/page.tsx",
    "66",
    "비밀번호 재설정 완료 후 이동",
    "해당 경로에 page.tsx 없음 (라우트 미존재)",
    "/auth/forgot-password/success 로 변경 (기존 성공 페이지 활용)"],
  [2,
    "/profile/settings/apply-term-of-use/2",
    "<Link>",
    "front/src/app/(with-header-footer)/profile/settings/apply-term-of-use/page.tsx",
    "33",
    "이용약관 동의",
    "숫자 placeholder, 해당 경로에 page.tsx 없음",
    "약관 페이지 신규 생성 또는 기존 약관 경로로 변경 필요"],
  [3,
    "/profile/settings/apply-term-of-use/4",
    "<Link>",
    "front/src/app/(with-header-footer)/profile/settings/apply-term-of-use/page.tsx",
    "55",
    "정기구독 이용약관 동의",
    "숫자 placeholder, 해당 경로에 page.tsx 없음",
    "구독 약관 페이지 신규 생성 필요"],
  [4,
    "/profile/settings/apply-term-of-use/5",
    "<Link>",
    "front/src/app/(with-header-footer)/profile/settings/apply-term-of-use/page.tsx",
    "66",
    "개인정보 마케팅 활용 동의",
    "숫자 placeholder, 해당 경로에 page.tsx 없음",
    "마케팅 약관 페이지 신규 생성 필요"],
];
const ws4 = XLSX.utils.aoa_to_sheet(brokenLinksData);
ws4["!cols"] = [
  { wch: 5 },   // #
  { wch: 45 },  // 링크 대상 경로
  { wch: 12 },  // 링크 유형
  { wch: 80 },  // 파일 위치
  { wch: 8 },   // 라인
  { wch: 30 },  // 링크 라벨
  { wch: 45 },  // 문제 원인
  { wch: 50 },  // 수정 제안
];
XLSX.utils.book_append_sheet(wb, ws4, "깨진 링크 (404)");

const outputPath = "MyCoffeeAI_화면리스트.xlsx";
XLSX.writeFile(wb, outputPath);
console.log(`Excel file created: ${outputPath}`);
