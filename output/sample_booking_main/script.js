/* ===================================================================
   PLK 실시간예약 메인 - script.js
   CLAUDE.md 전역 함수 시그니처 준수
   =================================================================== */

// ===== 전역 변수 =====
var g_today = '20260221';
var g_selected_day = '20260221';
var DAY_NAMES = ['일','월','화','수','목','금','토'];
var HOLIDAYS = []; // 공휴일 yyyymmdd 배열 (서버에서 받아오는 값)

// ===== 초기화 =====
$(document).ready(function () {
  generateCalendar();
  generateHorizontalCalendar();
  scrollToActiveDate();
});

// =============================================================
//  1. 가로 스크롤 달력 생성 (60일)
// =============================================================
function generateHorizontalCalendar() {
  var $list = $('#cal_list');
  $list.empty();

  var base = parseDate(g_today);
  var currentMonth = -1;

  for (var i = 0; i < 60; i++) {
    var d = new Date(base.getTime());
    d.setDate(d.getDate() + i);

    var yyyy = d.getFullYear();
    var mm = padZero(d.getMonth() + 1);
    var dd = padZero(d.getDate());
    var dateStr = '' + yyyy + mm + dd;
    var dayOfWeek = d.getDay();
    var dayName = DAY_NAMES[dayOfWeek];

    // 월 라벨 갱신
    if (i === 0) {
      $('#cal_month_label').text(mm + '월');
    }

    // 날짜 텍스트: 월 첫날이면 M/D 형식
    var dateDisplay = (d.getDate() === 1 && i > 0)
      ? (d.getMonth() + 1) + '/' + d.getDate()
      : '' + d.getDate();

    // 클래스 결정
    var liClass = 'list_date';
    if (dateStr === g_selected_day) liClass += ' active';

    var aClass = '';
    if (dayOfWeek === 6) aClass = 'txt_sat';
    if (dayOfWeek === 0) aClass = 'txt_sun';
    if (HOLIDAYS.indexOf(dateStr) !== -1) aClass = 'txt_holi';

    var html = '<li class="' + liClass + '" data-value="' + dateStr + '">'
      + '<a onclick="change_day(\'' + dateStr + '\',\'\',\'\',this)" class="' + aClass + '" tabindex="-1">'
      + '<span class="date_txt01">' + dayName + '</span>'
      + '<span class="date_txt02">' + dateDisplay + '</span>'
      + '</a></li>';

    $list.append(html);
  }
}

function scrollToActiveDate() {
  var $active = $('#cal_list .active');
  if ($active.length) {
    var container = $('#cal_list')[0];
    var offset = $active[0].offsetLeft - 60;
    container.scrollLeft = offset > 0 ? offset : 0;
  }
}

// =============================================================
//  2. 팝업 달력 생성 (3개월)
// =============================================================
function generateCalendar() {
  var $container = $('#calendarContainer');
  $container.empty();

  var base = parseDate(g_today);
  var startMonth = base.getMonth();
  var startYear = base.getFullYear();

  for (var m = 0; m < 3; m++) {
    var year = startYear + Math.floor((startMonth + m) / 12);
    var month = (startMonth + m) % 12;

    // 월 헤더
    $container.append('<div class="month-header">' + year + '년 ' + (month + 1) + '월</div>');

    // 요일 헤더
    for (var dh = 0; dh < 7; dh++) {
      $container.append('<div class="day-header">' + DAY_NAMES[dh] + '</div>');
    }

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    // 빈 칸
    for (var e = 0; e < firstDay; e++) {
      $container.append('<div class="day"></div>');
    }

    // 날짜
    for (var d = 1; d <= daysInMonth; d++) {
      var dt = new Date(year, month, d);
      var dateStr = '' + dt.getFullYear() + padZero(dt.getMonth() + 1) + padZero(dt.getDate());
      var dow = dt.getDay();

      var cls = 'day';
      if (dateStr === g_today) cls += ' today';
      if (dateStr === g_selected_day) cls += ' current';
      if (dateStr < g_today) cls += ' past-day';
      if (dow === 0) cls += ' sunday';
      if (dow === 6) cls += ' saturday';
      if (HOLIDAYS.indexOf(dateStr) !== -1) cls += ' holiday';

      var clickable = dateStr >= g_today;
      var onclick = clickable
        ? ' onclick="selectCalendarDay(\'' + dateStr + '\')"'
        : '';

      $container.append('<div class="' + cls + '" data-value="' + dateStr + '"' + onclick + '>' + d + '</div>');
    }
  }
}

function selectCalendarDay(dateStr) {
  g_selected_day = dateStr;
  $('#t_day').val(dateStr);

  // 달력 UI 갱신
  $('#calendarContainer .day').removeClass('current');
  $('#calendarContainer .day[data-value="' + dateStr + '"]').addClass('current');

  // 가로 달력 갱신
  generateHorizontalCalendar();
  scrollToActiveDate();

  // 월 라벨 갱신
  var mm = dateStr.substring(4, 6);
  $('#cal_month_label').text(parseInt(mm, 10) + '월');

  closeCalendarPopup();

  // 실서비스에서는 getAjaxList() 호출
  showAlert('날짜가 ' + formatDateDisplay(dateStr) + '로 변경되었습니다.');
}

// =============================================================
//  3. 핵심 전역 함수
// =============================================================

/** 날짜 변경 → 리스트 갱신 */
function change_day(t_day, cate, gf_place_seq, th) {
  g_selected_day = t_day;
  $('#t_day').val(t_day);

  // 가로 달력 active 갱신
  $('#cal_list .list_date').removeClass('active');
  $('#cal_list .list_date[data-value="' + t_day + '"]').addClass('active');

  // 월 라벨 갱신
  var mm = t_day.substring(4, 6);
  $('#cal_month_label').text(parseInt(mm, 10) + '월');

  scrollToActiveDate();

  // 실서비스에서는 getAjaxList() 호출
  showAlert('날짜가 ' + formatDateDisplay(t_day) + '로 변경되었습니다.');
}

/** 카드 내 시간대 필터 (show/hide) */
function time_select(th, st, ed) {
  var $card = $(th).closest('.card');
  var $buttons = $card.find('.time-section .tabmenu-buttons button');
  var $items = $card.find('.time_box li');

  // 버튼 active 토글
  $buttons.removeClass('active');
  $(th).addClass('active');

  if (st === '' && ed === '') {
    // 전체: 모두 표시
    $items.removeClass('time_hidden');
    return;
  }

  var startNum = parseInt(st, 10);
  var endNum = parseInt(ed, 10);

  $items.each(function () {
    var t = parseInt($(this).attr('data-time'), 10);
    if (t >= startNum && t <= endNum) {
      $(this).removeClass('time_hidden');
    } else {
      $(this).addClass('time_hidden');
    }
  });
}

/** 예약 - hidden form 값 세팅 후 알림 (실서비스에서는 submit) */
function reservation(noti, gf_block_time_seq, gf_place_seq, t_time, course, green_fee, th, seq, payment_option, member_option, part_time, green_fee_dc, tl, cady_type) {
  $('#noti').val(noti);
  $('#gf_block_time_seq').val(gf_block_time_seq);
  $('#gf_place_seq').val(gf_place_seq);
  $('#t_time').val(t_time);
  $('#course').val(course);
  $('#green_fee').val(green_fee);
  $('#seq').val(seq);
  $('#payment_option').val(payment_option);
  $('#member_option').val(member_option);
  $('#part_time').val(part_time);
  $('#green_fee_dc').val(green_fee_dc);
  $('#cady_type').val(cady_type);

  // 데모: 알림으로 대체 (실서비스에서는 $('#rs_form').submit())
  showConfirm(t_time + ' 티타임을 예약하시겠습니까?', function () {
    showAlert('예약이 접수되었습니다. (데모)');
  });
}

/** Ajax 리스트 갱신 (데모용 스텁) */
function getAjaxList() {
  // 실서비스: $.ajax → #ajax_list innerHTML 교체
  console.log('getAjaxList called - 서버 연동 필요');
}

/** URL 쿼리 갱신 */
function set_querystring() {
  // 실서비스: history.replaceState로 쿼리 파라미터 갱신
  console.log('set_querystring called');
}

// =============================================================
//  4. 지역 필터
// =============================================================

/** 상단 지역 탭 선택 */
function regionSelect(th) {
  var $btn = $(th);
  var isAllBtn = $btn.hasClass('all-btn');

  if (isAllBtn) {
    // 전체 선택 → 나머지 해제
    $('#region_buttons button').removeClass('active');
    $btn.addClass('active');
  } else {
    // 전체 해제 후 토글
    $('#region_buttons .all-btn').removeClass('active');
    $btn.toggleClass('active');

    // 아무것도 선택 안 되면 전체로 복귀
    if ($('#region_buttons button.active').length === 0) {
      $('#region_buttons .all-btn').addClass('active');
    }
  }
}

/** 상단 지역 전체 해제 */
function button_clear() {
  $('#region_buttons button').removeClass('active');
  $('#region_buttons .all-btn').addClass('active');
}

// =============================================================
//  5. 상세검색 팝업
// =============================================================

function openDetailSearch() {
  $('#detailSearchPop').show();
  $('body').css('overflow', 'hidden');
}

function closeDetailSearch() {
  $('#detailSearchPop').hide();
  $('body').css('overflow', '');
}

/** 상세검색 탭 전환 */
function switchTab(th) {
  var tab = $(th).attr('data-tab');
  $('.division-tab li').removeClass('active');
  $(th).addClass('active');

  $('.detail-search-pop .tabmenu-section').removeClass('active');
  $('.detail-search-pop [data-content="' + tab + '"]').addClass('active');
}

/** 상세검색 필터 버튼 토글 */
function toggleFilter(th) {
  $(th).toggleClass('active');
}

/** 상세검색 지역 '전체' 클릭 */
function detailRegionAll(th) {
  var $row = $(th).closest('.tabmenu-row');
  var $buttons = $row.find('.tabmenu-buttons button:not(.all-btn)');

  if ($(th).hasClass('active')) {
    // 이미 전체 선택됨 → 해제
    $(th).removeClass('active');
    $buttons.removeClass('active');
  } else {
    // 전체 선택
    $(th).addClass('active');
    $buttons.addClass('active');
  }
}

/** 상세검색 지역 개별 선택 */
function detailRegionSelect(th) {
  $(th).toggleClass('active');

  var $row = $(th).closest('.tabmenu-row');
  var $buttons = $row.find('.tabmenu-buttons button:not(.all-btn)');
  var $allBtn = $row.find('.all-btn');
  var allActive = $buttons.filter('.active').length === $buttons.length;

  if (allActive) {
    $allBtn.addClass('active');
  } else {
    $allBtn.removeClass('active');
  }
}

/** 상세검색 지역 행 모두해제 */
function button_clear_detail(th) {
  var $row = $(th).closest('.tabmenu-row');
  $row.find('.tabmenu-buttons button').removeClass('active');
}

/** 상세검색 초기화 */
function resetDetailSearch() {
  // 라운드 조건 초기화
  $('.round-section .tabmenu-buttons button').removeClass('active');
  $('#plk_recommend_pop').prop('checked', false);

  // 지역 초기화: 전체 + 개별 모두 active
  $('.region-detail-section .tabmenu-row').each(function () {
    $(this).find('.tabmenu-buttons button').addClass('active');
  });
}

/** 상세검색 적용 */
function applyDetailSearch() {
  // 지역이 하나도 선택 안 됐는지 체크
  var hasRegion = false;
  $('.region-detail-section .tabmenu-row').each(function () {
    if ($(this).find('button.active:not(.all-btn)').length > 0) {
      hasRegion = true;
    }
  });

  if (!hasRegion) {
    $('.sel-alert').show();
    setTimeout(function () { $('.sel-alert').hide(); }, 2000);
    return;
  }

  closeDetailSearch();
  showAlert('상세검색이 적용되었습니다. (데모)');
}

// =============================================================
//  6. 팝업 달력
// =============================================================

function openCalendarPopup() {
  generateCalendar();
  $('#calendarPopup').show();
  $('body').css('overflow', 'hidden');
}

function closeCalendarPopup() {
  $('#calendarPopup').hide();
  $('body').css('overflow', '');
}

// 배경 클릭 시 닫기
$(document).on('click', '#calendarPopup', function (e) {
  if ($(e.target).is('#calendarPopup')) {
    closeCalendarPopup();
  }
});

// =============================================================
//  7. 나의 라운드 횟수 Ajax + 상세보기 토글
// =============================================================

/** 나의 라운드 횟수 조회 후 상세 패널 토글 */
function get_rs_cnt(gf_place_seq, th) {
  var $detail = $(th).closest('.card').find('.card-info-detail');

  // 이미 조회했으면 바로 토글
  if ($(th).attr('data-rs_cnt') === 'Y') {
    $detail.slideToggle(200);
    return;
  }

  // 실서비스: $.ajax로 나의 라운드 횟수 조회
  // $.ajax({ url: '/api/rs_cnt', data: { gf_place_seq: gf_place_seq }, ... })
  // 데모: 즉시 토글
  $(th).attr('data-rs_cnt', 'Y');
  $detail.slideToggle(200);
}

function closeDetail(th) {
  $(th).closest('.card-info-detail').slideUp(200);
}

// =============================================================
//  8. PLK 추천만 보기
// =============================================================

$('#plk_recommend_chk').on('change', function () {
  var checked = $(this).is(':checked');
  if (checked) {
    $('.time_box li:not(.plk_recommend)').addClass('time_hidden');
  } else {
    $('.time_box li').removeClass('time_hidden');
  }
});

// =============================================================
//  9. Alert / Confirm 팝업
// =============================================================

function showAlert(msg) {
  $('#alert_pop_title').text(msg);
  $('#alert_pop').show();
}

function closeAlert() {
  $('#alert_pop').hide();
}

var confirmCallback = null;

function showConfirm(msg, callback) {
  $('#confirm_pop_title').text(msg);
  confirmCallback = callback;
  $('#confirm_pop').show();
}

function closeConfirm() {
  $('#confirm_pop').hide();
  confirmCallback = null;
}

$('#confirm_ok').on('click', function () {
  $('#confirm_pop').hide();
  if (typeof confirmCallback === 'function') {
    confirmCallback();
    confirmCallback = null;
  }
});

// Alert 배경 클릭 닫기
$('.pop_close_bg').on('click', function () {
  $(this).closest('.primary_popup, .bottom_popup').hide();
});

// =============================================================
//  10. 로딩 화면 (데모)
// =============================================================

function showLoading() {
  var $screen = $('#loadingScreen');
  $screen.show();
  var progress = 0;
  var interval = setInterval(function () {
    progress += 10;
    $('#loadingProgress').css('width', progress + '%');
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(function () { $screen.hide(); }, 300);
    }
  }, 100);
}

// =============================================================
//  유틸리티 함수
// =============================================================

function padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

function parseDate(str) {
  var y = parseInt(str.substring(0, 4), 10);
  var m = parseInt(str.substring(4, 6), 10) - 1;
  var d = parseInt(str.substring(6, 8), 10);
  return new Date(y, m, d);
}

function formatDateDisplay(dateStr) {
  var m = parseInt(dateStr.substring(4, 6), 10);
  var d = parseInt(dateStr.substring(6, 8), 10);
  return m + '월 ' + d + '일';
}
