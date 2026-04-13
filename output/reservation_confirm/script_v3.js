/* ===================================================================
   PLK 실시간 예약 페이지 - script_v3.js
   v3: 본인 방문 시 예약자 정보 단순 텍스트 표시,
       결제자 선택(본인방문) 및 동반자 나눠 결제 기능 삭제
   =================================================================== */

// ===== 전역 상태 =====
var g_visit_type = 'direct';        // direct | delegate
var g_payment = '';                  // opencard | onsite
var g_payer_delegate = '';           // self | delegate (위임 시에만 사용)
var g_green_fee = 105000;
var g_payment_avail = 'all';        // all | opencard | onsite (백오피스 설정)

// ===== 초기화 =====
$(document).ready(function () {
  initFromParams();
  bindInputEvents();
});

function initFromParams() {
  g_green_fee = parseInt($('#green_fee').val(), 10) || 105000;

  var partyCount = parseInt($('#party_count').val(), 10) || 4;
  var totalFee = g_green_fee * partyCount;
  $('#rsv_total_fee_disp').text(totalFee.toLocaleString() + '원');

  // 백오피스 결제방법 설정 적용
  g_payment_avail = $('#payment_avail').val() || 'all';
  applyPaymentAvail();

  if ($('body').data('imminent') === true) {
    g_payment = 'onsite';
    $('#payment_method').val('onsite');
    $('#payment_buttons button[data-payment="onsite"]').addClass('active');
  }
}

// 백오피스 결제방법 설정에 따라 버튼 비활성화
function applyPaymentAvail() {
  // 초기화: 모두 활성
  $('#payment_buttons button').removeClass('btn-rsv-disabled').prop('disabled', false);
  $('#payment_unavailable_guide').hide();

  if (g_payment_avail === 'onsite') {
    // 오픈카드 비활성 — 화살표를 왼쪽(오픈카드) 방향으로
    $('#payment_buttons button[data-payment="opencard"]').addClass('btn-rsv-disabled').prop('disabled', true);
    $('#payment_unavailable_guide').removeClass('rsv-callout-onsite').addClass('rsv-callout-opencard').show();
  } else if (g_payment_avail === 'opencard') {
    // 현장결제 비활성 — 화살표를 오른쪽(현장결제) 방향으로
    $('#payment_buttons button[data-payment="onsite"]').addClass('btn-rsv-disabled').prop('disabled', true);
    $('#payment_unavailable_guide').removeClass('rsv-callout-opencard').addClass('rsv-callout-onsite').show();
  }
}

function bindInputEvents() {
  // 이름 한글만
  $(document).on('compositionstart', '#delegate_name', function () {
    this.isComposing = true;
  });
  $(document).on('compositionend', '#delegate_name', function () {
    this.isComposing = false;
    var val = $(this).val();
    var cleaned = val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
    if (val !== cleaned) { $(this).val(cleaned); showInputGuide(this, '한글만 입력 가능합니다'); }
  });
  $(document).on('input', '#delegate_name', function () {
    if (!this.isComposing) {
      var val = $(this).val();
      var cleaned = val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
      if (val !== cleaned) { $(this).val(cleaned); showInputGuide(this, '한글만 입력 가능합니다'); }
    }
  });

  // 연락처 숫자 + 하이픈
  $(document).on('input', 'input[type="tel"]', function () {
    var before = $(this).val();
    var hasInvalid = /[^0-9\-]/.test(before);
    var raw = before.replace(/[^0-9]/g, '');
    if (raw.length > 11) raw = raw.substring(0, 11);
    var formatted = '';
    if (raw.length <= 3) {
      formatted = raw;
    } else if (raw.length <= 7) {
      formatted = raw.substring(0, 3) + '-' + raw.substring(3);
    } else {
      formatted = raw.substring(0, 3) + '-' + raw.substring(3, 7) + '-' + raw.substring(7);
    }
    $(this).val(formatted);
    if (hasInvalid) showInputGuide(this, '숫자만 입력 가능합니다');
  });
}

// =============================================================
//  1. 예약 유형 전환
// =============================================================

function switchVisitType(th) {
  var type = $(th).attr('data-visit');
  g_visit_type = type;
  $('#visit_type').val(type);

  $('.rsv-type-buttons button').removeClass('active');
  $(th).addClass('active');

  // 결제방법 초기화
  $('#payment_buttons button').removeClass('active btn-rsv-disabled').prop('disabled', false);
  $('#delegate_payer_buttons button').removeClass('active');
  g_payment = '';
  g_payer_delegate = '';

  if (type === 'direct') {
    $('#direct_info_block').slideDown(200);
    $('#delegate_info_block').slideUp(200);
    $('#delegate_payer_block').hide();
    $('#delegate_payer_guide').hide();
    $('#onsite_disabled_guide').hide();
    // 본인방문: 백오피스 설정 기준으로 결제방법 버튼 복원
    applyPaymentAvail();
    $('#payment_block').show();
  } else {
    $('#direct_info_block').slideUp(200);
    $('#delegate_info_block').slideDown(200);
    // 위임: 결제자 선택을 먼저 노출, 결제 방법은 결제자 선택 후 노출
    $('#delegate_payer_block').slideDown(200);
    $('#payment_unavailable_guide').hide();
    $('#payment_block').hide();
  }
}

// =============================================================
//  2. 결제 방법 선택
// =============================================================

function selectPayment(th) {
  var method = $(th).attr('data-payment');
  g_payment = method;
  $('#payment_method').val(method);

  $('#payment_buttons button').removeClass('active');
  $(th).addClass('active');
}

// =============================================================
//  3. 결제자 선택 (위임 시에만)
// =============================================================

function selectDelegatePayer(th) {
  var payer = $(th).attr('data-dpayer');
  g_payer_delegate = payer;
  $('#delegate_payer_type').val(payer);

  $('#delegate_payer_buttons button').removeClass('active');
  $(th).addClass('active');

  // 결제 방법 초기화 (위임 시 백오피스 안내는 숨김, 위임 전용 안내만 사용)
  $('#payment_buttons button').removeClass('active btn-rsv-disabled').prop('disabled', false);
  $('#payment_unavailable_guide').hide();
  g_payment = '';
  $('#payment_method').val('');

  if (payer === 'self') {
    // 내가 결제: 오픈카드 디폴트, 현장결제 선택불가
    $('#payment_buttons button[data-payment="onsite"]').addClass('btn-rsv-disabled').prop('disabled', true);
    $('#payment_buttons button[data-payment="opencard"]').addClass('active');
    g_payment = 'opencard';
    $('#payment_method').val('opencard');
    $('#delegate_payer_guide').removeClass('rsv-callout-right').addClass('rsv-callout-left').html('라운드 후 <strong>회원님</strong>에게 결제 링크가 발송됩니다').show();
    $('#onsite_disabled_guide').show();
  } else {
    // 위임자가 결제: 오픈카드/현장결제 둘 다 선택 가능
    $('#delegate_payer_guide').removeClass('rsv-callout-left').addClass('rsv-callout-right').html('라운드 후 <strong>위임자</strong>에게 결제 링크가 발송됩니다').show();
    $('#onsite_disabled_guide').hide();
  }

  $('#payment_block').slideDown(200);
}

// =============================================================
//  4. 유효성 검증
// =============================================================

function validate() {
  if (!$('#terms_chk').is(':checked')) {
    showAlert('약관에 동의해 주세요.');
    return false;
  }

  if (g_visit_type === 'direct') {
    return validateDirect();
  } else {
    return validateDelegate();
  }
}

function validateDirect() {
  if (!g_payment) {
    showAlert('결제 방법을 선택해주세요.');
    return false;
  }
  return true;
}

function validateDelegate() {
  var dName = $('#delegate_name').val().trim();
  if (!dName) {
    showAlert('위임자 이름을 입력해주세요.');
    $('#delegate_name').addClass('input-error').focus();
    return false;
  }
  var dPhone = $('#delegate_phone').val().replace(/[^0-9]/g, '');
  if (!dPhone || dPhone.length < 10 || dPhone.length > 11) {
    showAlert('위임자 연락처를 정확히 입력해주세요.');
    $('#delegate_phone').addClass('input-error').focus();
    return false;
  }
  if (!g_payment) {
    showAlert('결제 방법을 선택해주세요.');
    return false;
  }
  if (g_payment === 'opencard' && !g_payer_delegate) {
    showAlert('결제자를 선택해주세요.');
    return false;
  }
  return true;
}

$(document).on('focus', '.rsv-input', function () {
  $(this).removeClass('input-error');
});

// =============================================================
//  5. 예약 요청 submit
// =============================================================

function submitReservation() {
  if (!validate()) return;

  $('#visit_type').val(g_visit_type);
  $('#payment_method').val(g_payment);

  if (g_visit_type === 'direct') {
    $('#h_delegate_name').val('');
    $('#h_delegate_phone').val('');
    $('#delegate_payer_type').val('');
  } else {
    $('#h_delegate_name').val($('#delegate_name').val().trim());
    $('#h_delegate_phone').val($('#delegate_phone').val().replace(/[^0-9]/g, ''));
    $('#delegate_payer_type').val(g_payment === 'opencard' ? g_payer_delegate : '');
  }

  // 확인 팝업에 예약 정보 채우기
  $('#confirm_place_name').text($('#rsv_place_name').text());
  $('#confirm_datetime').text($('#rsv_date').text() + ' ' + $('#rsv_ttime').text());
  $('#confirm_greenfee').text($('#rsv_green_fee_disp').text());

  // 예약자 정보
  $('#confirm_booker').text($('#direct_name').text());
  $('#confirm_phone').text($('#direct_phone').text());

  // 위임자 정보
  if (g_visit_type === 'delegate') {
    var dName = $('#delegate_name').val().trim();
    var dPhone = $('#delegate_phone').val().trim();
    $('#confirm_delegate').text(dName + ' (' + dPhone + ')');
    $('#confirm_delegate_row').show();
  } else {
    $('#confirm_delegate_row').hide();
  }

  // 결제 방법
  var paymentLabel = g_payment === 'opencard' ? '오픈카드' : '현장결제(페이백)';
  $('#confirm_payment').text(paymentLabel);

  // 결제자 (위임 + 오픈카드일 때만 표시)
  if (g_visit_type === 'delegate' && g_payment === 'opencard' && g_payer_delegate) {
    var payerLabel = g_payer_delegate === 'self' ? '내가 결제' : '위임자가 결제';
    $('#confirm_payer').text(payerLabel);
    $('#confirm_payer_row').show();
  } else {
    $('#confirm_payer_row').hide();
  }

  showConfirm('', function () {
    showLoading(function () {
      showAlert('예약이 정상적으로 요청되었습니다. (데모)');
    });
  });
}

// =============================================================
//  6. Alert / Confirm 팝업
// =============================================================

function showAlert(msg) {
  $('#alert_pop_title').html(msg.replace(/\n/g, '<br>'));
  $('#alert_pop').show();
}
function closeAlert() {
  $('#alert_pop').hide();
}

var confirmCallback = null;
function showConfirm(msg, callback) {
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

$('.pop_close_bg').on('click', function () {
  $(this).closest('.primary_popup, .bottom_popup').hide();
});

// =============================================================
//  7. 로딩 화면
// =============================================================

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

// =============================================================
//  유틸리티
// =============================================================

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

var g_guide_showing = false;
function showInputGuide(el, msg) {
  if (g_guide_showing) return;
  g_guide_showing = true;
  var $guide = $('<div class="input-guide-toast">' + msg + '</div>');
  $('body').append($guide);
  setTimeout(function () {
    $guide.addClass('fade-out');
    setTimeout(function () { $guide.remove(); g_guide_showing = false; }, 300);
  }, 2000);
}
