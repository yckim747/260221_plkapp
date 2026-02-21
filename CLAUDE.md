# Pacific Links Korea (PLK) 모바일 웹 — 마크업 & 디자인 기준

## 프로젝트 개요
- 서비스명: Pacific Links Korea 골프 실시간 예약
- 환경: 모바일 전용 웹앱 (user-scalable=no)
- 렌더링: jQuery 기반 SSR + Ajax 부분 갱신

---

## 기술 스택
```
언어:      HTML5 + Vanilla CSS + jQuery 1.12.3
폰트:      Pretendard (CDN: jsdelivr/orioncactus)
CSS 파일:
  /mobile/zones/new/css/reset.css
  /mobile/zones/new/css/style.css
  /mobile/zones/new/css/add.css
이미지 경로: /mobile/zones/new/img/
```

---

## 기본 타이포그래피 & 색상

```css
/* 기본 */
font-size: 14px;
color: #292929;
font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
  system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo",
  "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji",
  "Segoe UI Symbol", sans-serif;

/* 주요 색상 */
--color-primary:  #04599e;  /* 브랜드 블루, 액티브 버튼, 배지, 로딩 배경 */
--color-text:     #292929;  /* 기본 텍스트 */
/* 토요일: 파란색, 일요일/공휴일: 빨간색 (CSS에서 별도 정의) */
```

---

## 전체 레이아웃 구조

```html
<body>
  <!-- 고정 헤더 -->
  <section class="header booking_header"> ... </section>

  <!-- 메인 래퍼 -->
  <div class="booking_live">

    <!-- 검색/필터 영역 (sticky) -->
    <div class="container search-container">
      <!-- 1. 가로 스크롤 달력 -->
      <!-- 2. 텍스트 검색바 -->
      <!-- 3. 지역 탭메뉴 + 상세검색 -->
    </div>

    <!-- 카드 리스트 (Ajax innerHTML 교체) -->
    <div class="container list-container">
      <section class="card-section" id="ajax_list"> ... </section>
    </div>

  </div>

  <!-- 오버레이 팝업들 (팝업 달력, 상세검색, Alert, Confirm 등) -->
  <!-- 로딩 화면 -->
  <!-- 퀵메뉴 (우하단 고정) -->
  <!-- 예약 hidden form -->
</body>
```

---

## 컴포넌트별 마크업 기준

### 1. 헤더
```html
<section class="header booking_header">
  <a href="/new" class="header-logo" tabindex="-1">
    <img src="/mobile/zones/new/img/departure/arrow.svg" alt="로고">
  </a>
  <h1 class="header-title">실시간예약</h1>
</section>
```

---

### 2. 가로 스크롤 날짜 달력
```html
<div class="booking_calendar_box">
  <div class="booking_calendar">

    <!-- 월 표시 (클릭 시 팝업 달력 오픈) -->
    <div class="cal_month">
      <span>03월</span>
    </div>

    <ul class="cal_list">
      <!-- 일반 날짜 -->
      <li class="list_date" data-value="20260324">
        <a onclick="change_day('20260324','','',this)" class="" tabindex="-1">
          <span class="date_txt01">화</span>
          <span class="date_txt02">24</span>
        </a>
      </li>

      <!-- 선택된 날짜: li에 active -->
      <li class="list_date active" data-value="20260325">
        <a onclick="change_day('20260325','','',this)" class="" tabindex="-1">
          <span class="date_txt01">수</span>
          <span class="date_txt02">25</span>
        </a>
      </li>

      <!-- 토요일: a에 txt_sat -->
      <li class="list_date" data-value="20260328">
        <a onclick="change_day('20260328','','',this)" class="txt_sat" tabindex="-1">
          <span class="date_txt01">토</span>
          <span class="date_txt02">28</span>
        </a>
      </li>

      <!-- 일요일/공휴일: a에 txt_sun -->
      <li class="list_date" data-value="20260329">
        <a onclick="change_day('20260329','','',this)" class="txt_sun" tabindex="-1">
          <span class="date_txt01">일</span>
          <span class="date_txt02">29</span>
        </a>
      </li>

      <!-- 월 첫날: date_txt02에 M/D 형식 -->
      <li class="list_date" data-value="20260401">
        <a onclick="change_day('20260401','','',this)" class="" tabindex="-1">
          <span class="date_txt01">수</span>
          <span class="date_txt02">4/1</span>
        </a>
      </li>
    </ul>

  </div>
</div>
```

**날짜 클래스 규칙**

| 상태 | 적용 위치 | 클래스 |
|------|----------|--------|
| 선택됨 | `<li>` | `active` |
| 토요일 | `<a>` | `txt_sat` |
| 일요일/공휴일 | `<a>` | `txt_sun` |
| 공휴일 | `<a>` | `txt_holi` |
| 월 첫날 | `date_txt02` 텍스트 | `M/D` 형식 |

---

### 3. 검색바
```html
<section>
  <div class="search-bar">
    <input type="text" placeholder="골프장명, 지역명을 검색해주세요."
           id="search_text" value="" class="search-input">
    <img src="/mobile/zones/new/img/departure/search.svg"
         alt="검색" id="search_icon" class="search-icon">
  </div>
</section>
```

---

### 4. 지역 탭메뉴 (상단 필터)
```html
<section class="tabmenu-section region-section">
  <div class="tabmenu-row">
    <div class="tabmenu-buttons">
      <button data-cate="" data-area="all" class="all-btn" tabindex="-1">전체</button>
      <button data-cate="1,2" data-area="capital-area" class="active" tabindex="-1">서울/경기/인천</button>
      <button data-cate="3" data-area="gangwon" class="active" tabindex="-1">강원</button>
      <button data-cate="4" data-area="chungcheong" class="" tabindex="-1">충청</button>
      <button data-cate="5" data-area="jeolla" class="" tabindex="-1">전라</button>
      <button data-cate="6" data-area="gyeongsang" class="" tabindex="-1">경상</button>
      <button data-cate="7" data-area="jeju" class="" tabindex="-1">제주</button>
      <!-- 모두해제는 button이 아닌 span -->
      <span onclick="button_clear();">모두해제
        <img src="/mobile/zones/new/img/main/recent_delete_icon.png" style="width:13px;" alt="삭제 아이콘">
      </span>
    </div>
  </div>
  <div class="detail-search">
    <button type="button" class="detail-search-btn" tabindex="-1">상세검색</button>
    <img class="detail-search-arrow" src="/mobile/zones/new/img/place/arrow_icon.png"
         onclick="$(this).prev().click()" alt="화살표 아이콘">
  </div>
</section>
```

**버튼 상태 규칙**
- 선택됨: `class="active"` → 파란색 채워진 pill
- 미선택: `class=""` → 회색 테두리 pill

---

### 5. 카드 리스트 헤더 (Ajax 영역 상단)
```html
<div class="card-section-head">
  <span class="total">총 <em>3</em>건</span>
  <label for="plk_recommend_chk" class="plk_recommend_chk">
    <input type="checkbox" name="plk_recommend_chk" id="plk_recommend_chk">
    <span class="txt">PLK 추천만 보기</span>
  </label>
</div>
```

---

### 6. 카드 (골프장 아이템) — 핵심 컴포넌트
```html
<div class="card">

  <!-- 헤더: 골프장명 + 거리 배지 -->
  <div class="card-header">
    <h3 class="card-title">골프장명</h3>
    <a href="https://map.naver.com/p/search/주소" target="_blank" class="card-distance">
      <img src="/mobile/zones/new/img/place/distance_icon.png" alt="거리 아이콘">
      <span>51.4km</span>
    </a>
  </div>

  <!-- 기본 정보 -->
  <div class="card-info">
    <div class="card-info-txt card-info-txt-type02">
      <div><span>경기도 안산시</span></div>
      <div><span>대중제 (27H)</span></div>
    </div>
    <span class="detail-view" onclick="get_rs_cnt(골프장ID, this);" data-rs_cnt="N">
      상세보기 <img src="/mobile/zones/new/img/place/detail_icon.png" alt="플러스 아이콘">
    </span>
  </div>

  <!-- 상세 정보 패널 (기본 숨김, slideToggle) -->
  <div class="card-info-detail">
    <h4>골프장 정보</h4>
    <img class="card-close" src="/mobile/zones/new/img/place/close_icon.png" alt="닫기 버튼">
    <div class="card-info-item">
      <span class="info-title">나의 라운드</span>
      <span class="info-text rs_cnt">0회</span>
    </div>
    <div class="card-info-item address-item">
      <span class="info-title">주소</span>
      <div class="info-text-group">
        <span class="info-text">주소 텍스트</span>
        <a href="네이버지도URL" target="_blank" class="hyperlink">지도보기</a>
      </div>
    </div>
    <div class="card-info-item">
      <span class="info-title">홈페이지</span>
      <div class="info-text">
        <a class="hyperlink" href="홈페이지URL" target="_blank">바로가기</a>
      </div>
    </div>
  </div>

  <!-- 최저가 + 팀 수 -->
  <div class="card-price-group">
    <span class="card-price-txt">125,000원 ~</span>
    <span class="card-price-team">21팀</span>
  </div>

  <!-- 시간대 필터 탭 -->
  <section class="tabmenu-section time-section">
    <div class="tabmenu-row">
      <div class="tabmenu-buttons">
        <button onclick="time_select(this,'','')" class="all-btn active">전체</button>
        <button onclick="time_select(this,'0001','0830')">~08:30</button>
        <button onclick="time_select(this,'0831','1030')">08:31~10:30</button>
        <button onclick="time_select(this,'1031','1300')">10:31~13:00</button>
        <button onclick="time_select(this,'1301','1430')">13:01~14:30</button>
        <button onclick="time_select(this,'1431','2359')">14:30~</button>
      </div>
    </div>
  </section>

  <!-- 티타임 그리드 -->
  <ul class="time_box">
    <!-- reservation() 파라미터 순서:
         noti, gf_block_time_seq('R'=실시간), gf_place_seq, t_time, course, green_fee,
         this, seq, payment_option, member_option, part_time, green_fee_dc, tl(타임리밋), cady_type -->
    <li class=""
        onclick="reservation('','R','181','07:07','1','210000',this,'','','','','0','20260316110000','');"
        data-time="0707">
      <span class="course">East</span>
      <div class="time_group">
        <span class="time">07:07</span>
        <span class="time_type">PLK 추천</span>
      </div>
      <span class="price">210,000원</span>
    </li>
    <!-- PLK 추천 항목: li에 plk_recommend 클래스 추가 -->
  </ul>

</div>
```

---

### 7. 상세검색 팝업
```html
<div class="detail-search-pop">
  <div class="container">
    <h5>상세검색</h5>
    <img class="close" src="/mobile/zones/new/img/place/close_icon.png" alt="닫기 버튼">

    <ul class="division-tab">
      <li class="active" data-tab="tab01">라운드조건</li>
      <li data-tab="tab02">지역구분</li>
    </ul>

    <!-- 라운드 조건 탭 -->
    <div class="round-section tabmenu-section active" data-content="tab01">
      <div class="inner">
        <div class="tabmenu-row">
          <span class="tabmenu-name">예약 방법</span>
          <div class="tabmenu-buttons" id="rs_type">
            <button data-rs_type="1" data-id="1" tabindex="-1">대기 예약</button>
            <button data-rs_type="2" data-id="2" tabindex="-1">실시간 예약</button>
            <button data-rs_type="3" data-id="3" tabindex="-1">페이백 접수</button>
          </div>
        </div>
        <div class="tabmenu-row">
          <span class="tabmenu-name">골프장 종류</span>
          <div class="tabmenu-buttons" id="place_type">
            <button data-place_type="GDGFMA001" data-id="4" tabindex="-1">대중제</button>
            <button data-place_type="GDGFMA002" data-id="5" tabindex="-1">회원제</button>
          </div>
        </div>
        <div class="tabmenu-row">
          <span class="tabmenu-name">홀 수</span>
          <div class="tabmenu-buttons" id="hole">
            <button data-hole="18" data-id="6" tabindex="-1">18H</button>
            <button data-hole="27" data-id="7" tabindex="-1">27H</button>
            <button data-hole="36" data-id="8" tabindex="-1">36H</button>
          </div>
        </div>
        <div class="tabmenu-row">
          <span class="tabmenu-name">거리</span>
          <div class="tabmenu-buttons" id="distance">
            <button data-distance="0-30" data-id="9" tabindex="-1">~30km</button>
            <button data-distance="30-50" data-id="10" tabindex="-1">30km~50km</button>
            <button data-distance="50-70" data-id="11" tabindex="-1">50km~70km</button>
            <button data-distance="70-9999" data-id="12" tabindex="-1">70km~</button>
          </div>
        </div>
      </div>
      <label class="inp_chk search_checkbox" for="plk_recommend_pop">
        <input type="checkbox" name="plk_recommend_pop" id="plk_recommend_pop" style="margin: 0;">
        <span class="txt">PLK 추천만 보기</span>
      </label>
    </div>

    <!-- 지역구분 탭 -->
    <div class="region-detail-section tabmenu-section" data-content="tab02">
      <div class="tabmenu-row" data-area="capital-area">
        <span class="tabmenu-name">서울/경기/인천</span>
        <div class="tabmenu-buttons">
          <button data-cate="" class="all-btn active" tabindex="-1">전체</button>
          <button data-cate="8" class="active" tabindex="-1">인천</button>
          <button data-cate="9" class="active" tabindex="-1">용인</button>
          <button data-cate="10" class="active" tabindex="-1">여주</button>
          <button data-cate="182" class="active" tabindex="-1">수원</button>
          <button data-cate="11" class="active" tabindex="-1">가평</button>
          <button data-cate="12" class="active" tabindex="-1">포천</button>
          <button data-cate="13" class="active" tabindex="-1">파주</button>
          <span onclick="button_clear_detail(this);">모두해제
            <img src="/mobile/zones/new/img/main/recent_delete_icon.png" style="width:13px;" alt="삭제 아이콘">
          </span>
        </div>
      </div>
      <!-- 강원, 충청, 전라, 경상, 제주 동일 패턴 반복 -->
    </div>

    <div class="footer-btn">
      <button type="button" class="reset-btn btn-stroke" tabindex="-1">선택 초기화</button>
      <button type="button" class="search-btn btn-fill" tabindex="-1">검색</button>
    </div>
    <p class="sel-alert">지역을 한 개 이상 선택해 주세요</p>
  </div>
</div>
```

---

### 8. 팝업 달력 (월 클릭 시 오픈, JS 동적 생성)
```html
<div class="calendar-popup" id="calendarPopup" style="display: none;">
  <div class="calendar-inner">
    <div class="calendar-container" id="calendarContainer">
      <!-- JS generateCalendar02() 로 동적 생성 -->
      <div class="month-header">2026년 3월</div>
      <div class="day-header">일</div> <!-- × 7 -->
      <div class="day" data-value="20260303">3</div>
      <div class="day sunday" data-value="20260301">1</div>
      <div class="day saturday" data-value="20260307">7</div>
      <div class="day today" data-value="20260221">21</div>
      <div class="day current" data-value="20260325">25</div>
      <div class="day past-day" data-value="20260220">20</div>
    </div>
    <button type="button" class="close-btn btn-fill" tabindex="-1">닫기</button>
  </div>
</div>
```

**달력 날짜 클래스 규칙**

| 상태 | 클래스 |
|------|--------|
| 오늘 | `today` |
| 선택됨 | `current` |
| 선택 불가 (과거/범위 외) | `past-day` |
| 일요일 | `sunday` |
| 토요일 | `saturday` |
| 공휴일 | `holiday` |

---

### 9. 팝업 종류별 구조

**Alert (확인만)**
```html
<div id="alert_pop" class="primary_popup agree_popup" style="display:none">
  <div class="pop_close_bg"></div>
  <div class="popup_content">
    <div class="txt" id="alert_pop_title">메시지</div>
    <button class="close btn-fill popup_s1_btn1" type="button" tabindex="-1">확인</button>
  </div>
</div>
```

**Confirm (취소/확인)**
```html
<div class="mpop popup_s1n" id="confirm_pop" style="display:none">
  <div class="popup_s1_inner">
    <div class="info1 popup_s4_contents" id="confirm_pop_title">메시지</div>
    <div class="popup_s2_btn2">
      <a class="cancel_50" id="confirm_no" tabindex="-1">취소</a>
      <a class="half_50" id="confirm_ok" data-func="" tabindex="-1">확인</a>
    </div>
  </div>
</div>
```

**Bottom Sheet 팝업**
```html
<div class="bottom_popup inactive_popup" style="display:none">
  <div class="pop_close_bg"></div>
  <div class="popup_content" style="bottom: 0;">
    <div class="txt"><em>메시지</em></div>
    <button class="close" type="button" tabindex="-1">확인</button>
  </div>
</div>
```

---

### 10. 로딩 화면
```html
<div class="loading-container" style="display: none;">
  <div style="width:100%;height:200px;"></div>
  <img class="logo-img" src="/mobile/zones/img/mo_logo.png"
       style="width:60%;margin:auto auto" alt="Pacific Links Korea">
  <div class="loading-bar">
    <div class="loading-progress" id="loadingProgress" style="width: 0%;"></div>
  </div>
  <div class="loading-text" id="loadingText" style="color: rgb(51, 51, 51);">로딩 중...</div>
</div>
```

---

### 11. 퀵메뉴 (우하단 고정)
```html
<div class="quick_menu" style="bottom: 7px;">
  <span class="back_btn"><img src="/mobile/zones/new/img/main/back_on_ico.png"></span>
  <span class="top_btn"><img src="/mobile/zones/new/img/main/top_off_ico.png"></span>
</div>
```

---

### 12. 예약 Hidden Form (JS로 값 세팅 후 submit)
```html
<form id="rs_form" method="get" action="/new/booking_live/reservationR">
  <input type="hidden" name="gf_place_seq" id="gf_place_seq" value="">
  <input type="hidden" name="t_day" id="t_day" value="20260325">
  <input type="hidden" name="url" value="/booking_live">
  <input type="hidden" name="time_seq" id="time_seq" value="">
  <input type="hidden" name="gf_block_time_seq" id="gf_block_time_seq" value="">
  <input type="hidden" name="course" id="course" value="">
  <input type="hidden" name="t_time" id="t_time" value="">
  <input type="hidden" name="green_fee" id="green_fee" value="">
  <input type="hidden" name="green_fee_dc" id="green_fee_dc" value="">
  <input type="hidden" name="seq" id="seq" value="">
  <input type="hidden" name="payment_option" id="payment_option" value="">
  <input type="hidden" name="member_option" id="member_option" value="">
  <input type="hidden" name="part_time" id="part_time" value="">
  <input type="hidden" name="cady_type" id="cady_type" value="">
  <input type="hidden" name="remark" id="remark" value="">
  <input type="hidden" name="noti" id="noti" value="">
</form>
```

---

## 버튼 클래스 시스템

| 클래스 | 용도 | 시각 |
|--------|------|------|
| `btn-fill` | 주요 액션 (검색, 닫기) | 브랜드 컬러 채움 |
| `btn-stroke` | 보조 액션 (초기화) | 테두리만 |
| `all-btn` | 전체 선택 버튼 | 별도 스타일 |
| `active` | 선택 상태 (탭, 날짜, 필터) | 파란색 강조 |

---

## 핵심 전역 JS 함수

| 함수 | 역할 |
|------|------|
| `getAjaxList()` | 카드 리스트 Ajax 갱신 (`#ajax_list` innerHTML 교체) |
| `change_day(t_day, cate, gf_place_seq, th)` | 날짜 변경 → 리스트 갱신 |
| `time_select(th, st, ed)` | 카드 내 시간대 필터 (show/hide) |
| `reservation(noti, gf_block_time_seq, ...)` | hidden form 값 세팅 후 submit |
| `get_rs_cnt(gf_place_seq, th)` | 나의 라운드 횟수 Ajax |
| `set_querystring()` | URL 쿼리 갱신 (history.replaceState) |
| `button_clear()` | 상단 지역 필터 전체 해제 |
| `button_clear_detail(th)` | 상세검색 팝업 내 지역 행 해제 |

---

## 마크업 작성 원칙

1. **모든 링크/버튼에 `tabindex="-1"`** — 모바일 앱이므로 키보드 탭 포커스 제거
2. **이미지 `alt` 속성 필수** 명시
3. **외부 링크 `target="_blank"`** 처리
4. **숨김 요소 초기화는 `style="display:none"`** (인라인) — CSS 클래스 아님
5. **Ajax 영역 `#ajax_list`는 innerHTML 전체 교체** 방식
6. **네이버 지도 링크**: `https://map.naver.com/p/search/주소텍스트`
7. **날짜 포맷**: `yyyymmdd` (예: `20260325`)
8. **시간 포맷 (`data-time`)**: `HHmm` 4자리 (예: `0707`, `1430`)
9. **가격 표기**: 쉼표 포함 한국 숫자 `125,000원`
10. **inline style 금지** — `display:none/block` 토글과 로고 width 예외

---

## 이미지 에셋 경로

```
/mobile/zones/new/img/departure/arrow.svg          ← 헤더 뒤로가기
/mobile/zones/new/img/departure/search.svg         ← 검색 아이콘
/mobile/zones/new/img/place/distance_icon.png      ← 거리 배지 핀
/mobile/zones/new/img/place/detail_icon.png        ← 상세보기 +
/mobile/zones/new/img/place/close_icon.png         ← 닫기 X
/mobile/zones/new/img/place/arrow_icon.png         ← 상세검색 화살표
/mobile/zones/new/img/main/recent_delete_icon.png  ← 모두해제 (width:13px)
/mobile/zones/new/img/main/back_on_ico.png         ← 퀵메뉴 뒤로가기
/mobile/zones/new/img/main/top_off_ico.png         ← 퀵메뉴 위로가기
/mobile/zones/new/img/main/recomm_plktime.png      ← PLK 추천 배너
/mobile/zones/img/mo_logo.png                      ← 로딩 화면 로고
```

---

## URL 파라미터 구조

```
/new/booking_live
  ?cate1[]=1,2          ← 광역 지역 (서울/경기/인천)
  &cate1[]=3            ← 광역 지역 (강원)
  &cate2[]=8            ← 세부 지역 (인천)
  &cate2[]=9            ← 세부 지역 (용인)
  &day=20260325         ← 선택 날짜 (yyyymmdd)
  &plk_recommend_pop=N  ← PLK 추천만 보기 (Y/N)
  &search_text=         ← 검색어
```

## 지역 코드 테이블

| 광역 | data-cate | 세부 지역 | data-cate |
|------|----------|----------|----------|
| 서울/경기/인천 | 1,2 | 인천 | 8 |
| | | 용인 | 9 |
| | | 여주 | 10 |
| | | 수원 | 182 |
| | | 가평 | 11 |
| | | 포천 | 12 |
| | | 파주 | 13 |
| 강원 | 3 | 춘천 | 14 |
| | | 원주 | 15 |
| | | 강릉 | 16 |
| 충청 | 4 | 태안 | 17 |
| | | 대전 | 18 |
| | | 충주 | 19 |
| 전라 | 5 | 전주 | 20 |
| | | 광주 | 21 |
| | | 순천 | 22 |
| 경상 | 6 | 대구 | 23 |
| | | 경주 | 24 |
| | | 부산 | 25 |
| 제주 | 7 | 전체 | 26 |
