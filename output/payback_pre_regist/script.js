/* ===================================================================
   PLK 페이백 사전 접수 - script.js
   =================================================================== */

// ===== 골프장 데이터 (샘플 — 실서비스에서는 Ajax로 로드) =====
var GOLF_PLACES = [
  { seq: '1', name: '가평베네스트GC', alias: ['가평베네스트','베네스트'] },
  { seq: '2', name: '가평잣향CC', alias: ['잣향'] },
  { seq: '3', name: '강릉파인비치GC', alias: ['파인비치'] },
  { seq: '4', name: '골든비치GC', alias: ['골든비치'] },
  { seq: '5', name: '골프존카운티드래곤CC', alias: ['골프존드래곤','드래곤CC'] },
  { seq: '6', name: '곤지암CC', alias: ['곤지암'] },
  { seq: '7', name: '금강CC', alias: ['금강'] },
  { seq: '8', name: '남서울CC', alias: ['남서울'] },
  { seq: '9', name: '남촌CC', alias: ['남촌'] },
  { seq: '10', name: '뉴스프링빌CC', alias: ['뉴스프링빌','스프링빌'] },
  { seq: '11', name: '뉴코리아CC', alias: ['뉴코리아'] },
  { seq: '12', name: '대광CC', alias: ['대광'] },
  { seq: '13', name: '라데나GC', alias: ['라데나'] },
  { seq: '14', name: '레이크사이드CC', alias: ['레이크사이드'] },
  { seq: '15', name: '리더스CC', alias: ['리더스'] },
  { seq: '16', name: '마이다스밸리CC', alias: ['마이다스밸리','마이다스'] },
  { seq: '17', name: '무안CC', alias: ['무안'] },
  { seq: '18', name: '베어즈베스트CC', alias: ['베어즈베스트'] },
  { seq: '181', name: '오로라골프앤리조트', alias: ['오로라','오로라골프'] },
  { seq: '19', name: '블루원상주CC', alias: ['블루원상주','블루원'] },
  { seq: '20', name: '사이프러스CC', alias: ['사이프러스'] },
  { seq: '21', name: '삼정레저CC', alias: ['삼정','삼정레저'] },
  { seq: '22', name: '서원밸리CC', alias: ['서원밸리'] },
  { seq: '23', name: '선운산CC', alias: ['선운산'] },
  { seq: '24', name: '설해원GC', alias: ['설해원'] },
  { seq: '25', name: '송추CC', alias: ['송추'] },
  { seq: '26', name: '스카이밸리CC', alias: ['스카이밸리'] },
  { seq: '27', name: '스타힐리조트CC', alias: ['스타힐'] },
  { seq: '28', name: '아난티CC서울', alias: ['아난티','아난티서울'] },
  { seq: '29', name: '안성베네스트GC', alias: ['안성베네스트'] },
  { seq: '30', name: '에덴밸리CC', alias: ['에덴밸리'] },
  { seq: '31', name: '여수경도GC', alias: ['여수경도','경도GC'] },
  { seq: '32', name: '오크밸리CC', alias: ['오크밸리'] },
  { seq: '33', name: '용인CC', alias: ['용인'] },
  { seq: '34', name: '웅포CC', alias: ['웅포'] },
  { seq: '35', name: '이천마이다스CC', alias: ['이천마이다스'] },
  { seq: '36', name: '자유CC', alias: ['자유'] },
  { seq: '37', name: '제이드팰리스GC', alias: ['제이드팰리스'] },
  { seq: '38', name: '중문CC', alias: ['중문'] },
  { seq: '39', name: '천안상록CC', alias: ['천안상록'] },
  { seq: '40', name: '클럽모우CC', alias: ['클럽모우','모우'] },
  { seq: '41', name: '파주CC', alias: ['파주'] },
  { seq: '42', name: '포웰CC', alias: ['포웰'] },
  { seq: '43', name: '한양CC', alias: ['한양'] },
  { seq: '44', name: '현대힐스CC', alias: ['현대힐스'] },
  { seq: '45', name: 'JNJ CC', alias: ['JNJ'] },
  { seq: '46', name: 'SBS골프리조트', alias: ['SBS골프'] }
];

// ===== 전역 상태 =====
var g_parsed = {};
var g_selected_place = null;

// ===== 초기화 =====
$(document).ready(function () {
  bindEvents();
  updateSubmitState();
});

function bindEvents() {
  // textarea paste 이벤트 → 자동 파싱
  $('#pb_message').on('paste', function () {
    var self = this;
    setTimeout(function () {
      autoParse($(self).val());
    }, 100);
  });

  // textarea input 시 파싱 결과 숨기기
  $('#pb_message').on('input', function () {
    $('#pb_parse_result').attr('class', 'pb-parse-result').hide();
  });

  // 골프장 검색 입력
  $('#pb_search_input').on('input', function () {
    filterGolfPlaces($(this).val());
  });

  // 폼 입력 변경 시 상태 갱신
  $(document).on('input change', '#pb_rs_nm, #pb_t_time, #pb_course, #pb_rs_no', function () {
    updateFieldStatus(this);
    updateSubmitState();
  });

  // 약관 동의
  $('#pb_agree').on('change', function () {
    updateSubmitState();
  });

  // input focus 시 에러 제거
  $(document).on('focus', '.pb-input, .pb-time-input', function () {
    $(this).removeClass('input-error');
  });
}

// ===================================================================
//  1. 붙여넣기 버튼 (카드 영역)
// ===================================================================

function doPaste() {
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(function (text) {
      // textarea 영역 펼치고 값 세팅
      expandManualArea();
      $('#pb_message').val(text);
      autoParse(text);
    }).catch(function () {
      // 클립보드 접근 차단 시 → textarea 펼치고 안내
      expandManualArea();
      $('#pb_message').focus();
      showToast('텍스트 영역을 길게 눌러 붙여넣기 해주세요.');
    });
  } else {
    expandManualArea();
    $('#pb_message').focus();
    showToast('텍스트 영역을 길게 눌러 붙여넣기 해주세요.');
  }
}

// ===================================================================
//  2. 직접 입력 토글 (textarea 영역 펼치기/접기)
// ===================================================================

function toggleManualArea() {
  var $expand = $('#pb_message_expand');
  var $toggle = $('#pb_manual_toggle');

  if ($expand.hasClass('active')) {
    $expand.removeClass('active');
    $toggle.removeClass('expanded');
  } else {
    expandManualArea();
  }
}

function expandManualArea() {
  $('#pb_message_expand').addClass('active');
  $('#pb_manual_toggle').addClass('expanded');
}

// ===================================================================
//  3. 자동 변환 / 초기화
// ===================================================================

function doConvert() {
  var text = $('#pb_message').val();
  if (!text || !text.trim()) {
    showAlert('문자 내용을 먼저 입력해 주세요.');
    return;
  }
  autoParse(text);
}

function doReset() {
  $('#pb_message').val('');
  g_parsed = {};
  g_selected_place = null;

  // 필드 초기화
  $('#pb_place_name').val('').removeClass('input-filled');
  $('#pb_rs_nm').val('').removeClass('input-filled');
  $('#pb_t_day').val('').removeData('raw').removeClass('input-filled');
  $('#pb_t_time').val('').removeClass('input-filled');
  $('#pb_course').val('').removeClass('input-filled');
  $('#pb_rs_no').val('').removeClass('input-filled');

  // 상태 아이콘 리셋
  $('.pb-status-icon').attr('class', 'pb-status-icon status-empty').text('-');

  // 파싱 결과 숨기기
  $('#pb_parse_result').attr('class', 'pb-parse-result').hide();

  // 약관 해제
  $('#pb_agree').prop('checked', false);
  updateSubmitState();
}

// ===================================================================
//  4. 자동 파싱
// ===================================================================

function autoParse(text) {
  if (!text || !text.trim()) return;

  var result = {};
  var matched = 0;
  var total = 6;

  // 날짜 파싱
  var datePatterns = [
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    /(\d{1,2})월\s*(\d{1,2})일/,
    /(\d{1,2})[\/](\d{1,2})/
  ];
  for (var i = 0; i < datePatterns.length; i++) {
    var dm = text.match(datePatterns[i]);
    if (dm) {
      if (dm.length === 4) {
        result.date = dm[1] + pad2(dm[2]) + pad2(dm[3]);
      } else if (dm.length === 3) {
        var year = new Date().getFullYear();
        result.date = year + pad2(dm[1]) + pad2(dm[2]);
      }
      matched++;
      break;
    }
  }

  // 시간 파싱
  var timePatterns = [
    /(\d{1,2})\s*[:시]\s*(\d{2})\s*분?/,
    /\b(\d{2})(\d{2})\b/
  ];
  for (var j = 0; j < timePatterns.length; j++) {
    var tm = text.match(timePatterns[j]);
    if (tm) {
      var hh = parseInt(tm[1], 10);
      var mm = parseInt(tm[2], 10);
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        result.time = pad2(hh) + ':' + pad2(mm);
        matched++;
        break;
      }
    }
  }

  // 예약자명
  var nameMatch = text.match(/(?:예약자(?:명)?|이름|성명)\s*[:：]\s*([가-힣]{2,4})/);
  if (nameMatch) {
    result.name = nameMatch[1];
    matched++;
  }

  // 예약번호
  var rsNoMatch = text.match(/(?:예약|확인)\s*번호\s*[:：]\s*([A-Za-z0-9\-]+)/);
  if (rsNoMatch) {
    result.rs_no = rsNoMatch[1];
    matched++;
  }

  // 코스
  var courseMatch = text.match(/코스(?:명)?\s*[:：]\s*([A-Za-z가-힣]+)/);
  if (courseMatch) {
    result.course = courseMatch[1].toUpperCase();
    matched++;
  }

  // 골프장명
  var foundPlace = null;
  for (var k = 0; k < GOLF_PLACES.length; k++) {
    var place = GOLF_PLACES[k];
    if (text.indexOf(place.name) !== -1) {
      foundPlace = place;
      matched++;
      break;
    }
    for (var a = 0; a < place.alias.length; a++) {
      if (text.indexOf(place.alias[a]) !== -1) {
        foundPlace = place;
        matched++;
        break;
      }
    }
    if (foundPlace) break;
  }
  if (foundPlace) {
    result.place = foundPlace;
  }

  g_parsed = result;
  applyParsedResult(result, matched, total);
}

function applyParsedResult(result, matched, total) {
  // 골프장
  if (result.place) {
    g_selected_place = result.place;
    $('#pb_place_name').val(result.place.name).addClass('input-filled');
    setFieldStatus('place', 'ok');
  } else {
    setFieldStatus('place', 'warn');
  }

  // 예약자명
  if (result.name) {
    $('#pb_rs_nm').val(result.name).addClass('input-filled');
    setFieldStatus('name', 'ok');
  } else {
    setFieldStatus('name', 'warn');
  }

  // 날짜
  if (result.date) {
    var dateStr = result.date;
    var y = dateStr.substring(0, 4);
    var m = dateStr.substring(4, 6);
    var d = dateStr.substring(6, 8);
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    var dayName = dayNames[dateObj.getDay()];
    $('#pb_t_day').val(y + '.' + m + '.' + d + '(' + dayName + ')');
    $('#pb_t_day').data('raw', dateStr).addClass('input-filled');
    setFieldStatus('date', 'ok');
  } else {
    setFieldStatus('date', 'warn');
  }

  // 시간
  if (result.time) {
    $('#pb_t_time').val(result.time).addClass('input-filled');
    setFieldStatus('time', 'ok');
  } else {
    setFieldStatus('time', 'warn');
  }

  // 코스 (선택)
  if (result.course) {
    $('#pb_course').val(result.course).addClass('input-filled');
    setFieldStatus('course', 'ok');
  }

  // 예약번호 (선택)
  if (result.rs_no) {
    $('#pb_rs_no').val(result.rs_no).addClass('input-filled');
    setFieldStatus('rsno', 'ok');
  }

  // 파싱 결과 메시지
  var $result = $('#pb_parse_result');
  if (matched >= 4) {
    $result.attr('class', 'pb-parse-result result-success')
      .html(matched + '/' + total + '개 항목이 자동 인식되었습니다. 내용을 확인해 주세요.')
      .show();
  } else if (matched >= 2) {
    $result.attr('class', 'pb-parse-result result-partial')
      .html(matched + '/' + total + '개 항목만 인식되었습니다. 나머지는 직접 입력해 주세요.')
      .show();
  } else {
    $result.attr('class', 'pb-parse-result result-fail')
      .html('자동 인식에 실패했습니다. 아래 양식에 직접 입력해 주세요.')
      .show();
  }

  updateSubmitState();

  // 인식 후 예약 정보 영역으로 부드럽게 스크롤
  setTimeout(function () {
    var $formBlock = $('#pb_form_block');
    if ($formBlock.length) {
      $('html, body').animate({ scrollTop: $formBlock.offset().top - 60 }, 300);
    }
  }, 200);
}

// ===================================================================
//  5. 필드 상태 아이콘
// ===================================================================

function setFieldStatus(field, status) {
  var $icon = $('#status_' + field);
  $icon.attr('class', 'pb-status-icon');
  if (status === 'ok') {
    $icon.addClass('status-ok').html('&#10003;');
  } else if (status === 'warn') {
    $icon.addClass('status-warn').text('!');
  } else {
    $icon.addClass('status-empty').text('-');
  }
}

function updateFieldStatus(el) {
  var $el = $(el);
  var id = $el.attr('id');
  var val = $el.val().trim();
  var fieldMap = {
    'pb_rs_nm': 'name',
    'pb_t_time': 'time',
    'pb_course': 'course',
    'pb_rs_no': 'rsno'
  };
  var field = fieldMap[id];
  if (field) {
    if (val) {
      $el.addClass('input-filled');
      setFieldStatus(field, 'ok');
    } else {
      $el.removeClass('input-filled');
      setFieldStatus(field, 'empty');
    }
  }
}

// ===================================================================
//  6. 골프장 검색 바텀시트
// ===================================================================

function openGolfSearch() {
  $('#pb_search_sheet').addClass('active');
  $('#pb_search_input').val('').focus();
  renderGolfList(GOLF_PLACES);
}

function closeGolfSearch() {
  $('#pb_search_sheet').removeClass('active');
}

function filterGolfPlaces(keyword) {
  if (!keyword.trim()) {
    renderGolfList(GOLF_PLACES);
    return;
  }
  var kw = keyword.trim().toLowerCase();
  var filtered = [];
  for (var i = 0; i < GOLF_PLACES.length; i++) {
    var p = GOLF_PLACES[i];
    if (p.name.toLowerCase().indexOf(kw) !== -1) {
      filtered.push(p);
      continue;
    }
    for (var j = 0; j < p.alias.length; j++) {
      if (p.alias[j].toLowerCase().indexOf(kw) !== -1) {
        filtered.push(p);
        break;
      }
    }
  }
  renderGolfList(filtered, kw);
}

function renderGolfList(list, keyword) {
  var $container = $('#pb_search_list');
  $container.empty();
  if (list.length === 0) {
    $container.html('<div class="pb-search-empty">검색 결과가 없습니다.</div>');
    return;
  }
  for (var i = 0; i < list.length; i++) {
    var name = list[i].name;
    var displayName = name;
    if (keyword) {
      var idx = name.toLowerCase().indexOf(keyword.toLowerCase());
      if (idx !== -1) {
        displayName = name.substring(0, idx) + '<em>' + name.substring(idx, idx + keyword.length) + '</em>' + name.substring(idx + keyword.length);
      }
    }
    var $item = $('<div class="pb-search-item" data-seq="' + list[i].seq + '">' + displayName + '</div>');
    $item.data('place', list[i]);
    $container.append($item);
  }
}

$(document).on('click', '.pb-search-item', function () {
  var place = $(this).data('place');
  g_selected_place = place;
  $('#pb_place_name').val(place.name).addClass('input-filled');
  setFieldStatus('place', 'ok');
  closeGolfSearch();
  updateSubmitState();
});

// ===================================================================
//  7. 달력 팝업
// ===================================================================

function openCalendar() {
  generateCalendar();
  $('#pb_calendar_popup').addClass('active');
}

function closeCalendar() {
  $('#pb_calendar_popup').removeClass('active');
}

function generateCalendar() {
  var $container = $('#pb_calendar_container');
  $container.empty();

  var today = new Date();
  var currentRaw = $('#pb_t_day').data('raw') || '';

  for (var m = 0; m < 3; m++) {
    var calDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
    var year = calDate.getFullYear();
    var month = calDate.getMonth();

    $container.append('<div class="month-header">' + year + '년 ' + (month + 1) + '월</div>');

    var dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
    for (var dh = 0; dh < 7; dh++) {
      $container.append('<div class="day-header">' + dayHeaders[dh] + '</div>');
    }

    var firstDay = calDate.getDay();
    for (var blank = 0; blank < firstDay; blank++) {
      $container.append('<div></div>');
    }

    var daysInMonth = new Date(year, month + 1, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var thisDate = new Date(year, month, d);
      var dateVal = '' + year + pad2(month + 1) + pad2(d);
      var classes = ['day'];
      var dayOfWeek = thisDate.getDay();

      if (dayOfWeek === 0) classes.push('sunday');
      if (dayOfWeek === 6) classes.push('saturday');
      if (dateVal === formatDateRaw(today)) classes.push('today');
      if (dateVal === currentRaw) classes.push('current');
      if (thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        classes.push('past-day');
      }

      $container.append('<div class="' + classes.join(' ') + '" data-value="' + dateVal + '">' + d + '</div>');
    }
  }

  $container.on('click', '.day:not(.past-day)', function () {
    var val = $(this).data('value').toString();
    var y = val.substring(0, 4);
    var mm = val.substring(4, 6);
    var dd = val.substring(6, 8);
    var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    var dateObj = new Date(parseInt(y), parseInt(mm) - 1, parseInt(dd));
    var dayName = dayNames[dateObj.getDay()];
    $('#pb_t_day').val(y + '.' + mm + '.' + dd + '(' + dayName + ')');
    $('#pb_t_day').data('raw', val).addClass('input-filled');
    setFieldStatus('date', 'ok');
    closeCalendar();
    updateSubmitState();
  });
}

// ===================================================================
//  8. 유효성 검증
// ===================================================================

function validate() {
  if (!$('#pb_place_name').val().trim()) {
    showAlert('골프장을 선택해 주세요.');
    return false;
  }
  if (!$('#pb_rs_nm').val().trim()) {
    showAlert('예약자명을 입력해 주세요.');
    $('#pb_rs_nm').addClass('input-error').focus();
    return false;
  }
  if (!$('#pb_t_day').data('raw')) {
    showAlert('예약 날짜를 선택해 주세요.');
    return false;
  }
  var tTime = $('#pb_t_time').val().trim();
  if (!tTime) {
    showAlert('예약 시간을 입력해 주세요.');
    $('#pb_t_time').addClass('input-error').focus();
    return false;
  }
  if (!/^\d{2}:\d{2}$/.test(tTime)) {
    showAlert('시간 형식이 올바르지 않습니다. (예: 07:30)');
    $('#pb_t_time').addClass('input-error').focus();
    return false;
  }
  if (!$('#pb_agree').is(':checked')) {
    showAlert('약관에 동의해 주세요.');
    return false;
  }
  return true;
}

// ===================================================================
//  9. 제출 버튼 상태 관리
// ===================================================================

function updateSubmitState() {
  var hasPlace = !!$('#pb_place_name').val().trim();
  var hasName = !!$('#pb_rs_nm').val().trim();
  var hasDate = !!$('#pb_t_day').data('raw');
  var hasTime = !!$('#pb_t_time').val().trim();
  var hasAgree = $('#pb_agree').is(':checked');

  if (hasPlace && hasName && hasDate && hasTime && hasAgree) {
    $('#pb_submit_btn').removeClass('btn-disabled').prop('disabled', false);
  } else {
    $('#pb_submit_btn').addClass('btn-disabled').prop('disabled', true);
  }
}

// ===================================================================
//  10. 접수 요청
// ===================================================================

function submitPreRegist() {
  if (!validate()) return;

  showConfirm('페이백 사전 접수를 신청하시겠습니까?', function () {
    // hidden form 값 세팅
    $('#h_gf_place_seq').val(g_selected_place ? g_selected_place.seq : '');
    $('#h_rs_nm').val($('#pb_rs_nm').val().trim());
    $('#h_t_day').val($('#pb_t_day').data('raw'));
    $('#h_t_time').val($('#pb_t_time').val().trim());
    $('#h_course').val($('#pb_course').val().trim());
    $('#h_rs_no').val($('#pb_rs_no').val().trim());
    $('#h_message').val($('#pb_message').val().trim());

    showLoading(function () {
      // 실서비스: $('#pre_regist_form').submit();
      showAlert('페이백 사전 접수가 정상적으로 완료되었습니다.');
    });
  });
}

// ===================================================================
//  11. Alert / Confirm 팝업
// ===================================================================

function showAlert(msg) {
  $('#alert_pop_title').html(msg.replace(/\n/g, '<br>'));
  $('#alert_pop').show();
}
function closeAlert() {
  $('#alert_pop').hide();
}

var confirmCallback = null;
function showConfirm(msg, callback) {
  $('#confirm_pop_title').html(msg.replace(/\n/g, '<br>'));
  confirmCallback = callback;
  $('#confirm_pop').show();
}
function closeConfirm() {
  $('#confirm_pop').hide();
  confirmCallback = null;
}

$(document).on('click', '#confirm_ok', function () {
  $('#confirm_pop').hide();
  if (typeof confirmCallback === 'function') {
    confirmCallback();
    confirmCallback = null;
  }
});

$(document).on('click', '.pop_close_bg', function () {
  $(this).closest('.primary_popup, .bottom_popup').hide();
});

// ===================================================================
//  12. 로딩 화면
// ===================================================================

function showLoading(callback) {
  var $screen = $('#loadingScreen');
  $screen.show();
  var progress = 0;
  var interval = setInterval(function () {
    progress += 10;
    $('#loadingProgress').css('width', progress + '%');
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(function () {
        $screen.hide();
        if (typeof callback === 'function') callback();
      }, 300);
    }
  }, 100);
}

// ===================================================================
//  유틸리티
// ===================================================================

function pad2(n) {
  n = parseInt(n, 10);
  return n < 10 ? '0' + n : '' + n;
}

function formatDateRaw(date) {
  return '' + date.getFullYear() + pad2(date.getMonth() + 1) + pad2(date.getDate());
}

var g_toast_showing = false;
function showToast(msg) {
  if (g_toast_showing) return;
  g_toast_showing = true;
  var $toast = $('<div class="pb-toast">' + msg + '</div>');
  $('body').append($toast);
  setTimeout(function () {
    $toast.addClass('fade-out');
    setTimeout(function () { $toast.remove(); g_toast_showing = false; }, 300);
  }, 2000);
}
