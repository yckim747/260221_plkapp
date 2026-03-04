/* ===================================================================
   PLK 실시간 예약 페이지 - script.js
   =================================================================== */

// ===== 전역 상태 =====
var g_visit_type = 'direct';        // direct | delegate
var g_payment = '';                  // opencard | onsite
var g_payer_direct = '';             // self | split
var g_green_fee = 105000;
var g_max_companion = 3;
var g_companion_count = 1;
var g_split_type = 'equal';
var g_equal_count = 0;

// ===== 초기화 =====
$(document).ready(function () {
  initFromParams();
  bindInputEvents();
});

function initFromParams() {
  g_green_fee = parseInt($('#green_fee').val(), 10) || 105000;
}

function bindInputEvents() {
  // 이름 한글만
  $(document).on('compositionstart', '.companion-name, .equal-companion-name, #delegate_name', function () {
    this.isComposing = true;
  });
  $(document).on('compositionend', '.companion-name, .equal-companion-name, #delegate_name', function () {
    this.isComposing = false;
    var val = $(this).val();
    var cleaned = val.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
    if (val !== cleaned) { $(this).val(cleaned); showInputGuide(this, '한글만 입력 가능합니다'); }
  });
  $(document).on('input', '.companion-name, .equal-companion-name, #delegate_name', function () {
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

  // 금액 콤마 포맷 + 초과 방지
  $(document).on('input', '.companion-amount', function () {
    var before = $(this).val();
    var hasInvalid = /[^0-9,]/.test(before);
    var raw = before.replace(/[^0-9]/g, '');
    if (raw) {
      var currentVal = parseInt(raw, 10);
      var otherSum = 0;
      var self = this;
      $('.companion-amount').each(function () {
        if (this !== self) {
          var v = $(this).val().replace(/[^0-9]/g, '');
          if (v) otherSum += parseInt(v, 10);
        }
      });
      if (otherSum + currentVal > g_green_fee) {
        raw = raw.substring(0, raw.length - 1);
        currentVal = raw ? parseInt(raw, 10) : 0;
        showInputGuide(this, '총 그린피를 초과하였습니다');
      }
      $(this).val(currentVal ? numberWithCommas(currentVal) : '');
    } else {
      $(this).val('');
    }
    if (hasInvalid) showInputGuide(this, '숫자만 입력 가능합니다');
    calculateCompanionTotal();
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
  $('#payment_buttons button').removeClass('active');
  $('#payer_block .tabmenu-buttons button').removeClass('active');
  g_payment = '';
  g_payer_direct = '';

  if (type === 'direct') {
    $('#direct_info_block').slideDown(200);
    $('#delegate_info_block').slideUp(200);
    $('#payer_block').hide();
    $('#companion_section').hide();
  } else {
    $('#direct_info_block').slideUp(200);
    $('#delegate_info_block').slideDown(200);
    $('#payer_block').hide();
    $('#companion_section').hide();
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

  if (g_visit_type === 'direct') {
    if (method === 'opencard') {
      $('#payer_block').slideDown(200);
    } else {
      $('#payer_block').slideUp(200);
      $('#companion_section').slideUp(200);
      $('#payer_block .tabmenu-buttons button').removeClass('active');
      g_payer_direct = '';
    }
  } else {
    // 위임: 결제자 선택 없음
    $('#payer_block').hide();
    $('#companion_section').hide();
  }
}

// =============================================================
//  3. 결제자 선택 (본인 방문)
// =============================================================

function selectPayer(th) {
  var payer = $(th).attr('data-payer');
  g_payer_direct = payer;
  $('#payer_type').val(payer);

  $('#payer_block .tabmenu-buttons button').removeClass('active');
  $(th).addClass('active');

  if (payer === 'split') {
    $('#companion_section').slideDown(200);
  } else {
    $('#companion_section').slideUp(200);
  }
}

// =============================================================
//  4. 분배 방식 전환
// =============================================================

function switchSplitType(th) {
  var type = $(th).attr('data-split');
  g_split_type = type;

  $('.rsv-split-buttons button').removeClass('active');
  $(th).addClass('active');

  if (type === 'equal') {
    $('#panel_equal').show();
    $('#panel_manual').hide();
  } else {
    $('#panel_equal').hide();
    $('#panel_manual').show();
  }
}

// =============================================================
//  5. 균등 분배
// =============================================================

function selectEqualCount(th) {
  var count = parseInt($(th).attr('data-count'), 10);
  g_equal_count = count;

  $('.equal-count-buttons button').removeClass('active');
  $(th).addClass('active');

  calculateEqual();
  generateEqualCompanions(count - 1);

  $('#equal_info').show();
  $('#equal_total').show();
}

function calculateEqual() {
  if (g_equal_count < 2) return;
  var perAmount = Math.floor(g_green_fee / g_equal_count);
  var companionCount = g_equal_count - 1;
  var myAmount = g_green_fee - (perAmount * companionCount);

  $('#equal_per_amount').text(numberWithCommas(perAmount));
  if (myAmount !== perAmount) {
    $('#equal_detail').text(' (예약자 ' + numberWithCommas(myAmount) + '원 / 나머지 균등)');
  } else {
    $('#equal_detail').text('');
  }
  $('#equal_my_amount').text(numberWithCommas(myAmount) + '원');
  $('#equal_companion_sum').text(numberWithCommas(perAmount * companionCount) + '원');
  $('#equal_total_fee').text(numberWithCommas(g_green_fee) + '원');
  $('#equal_companion_list .equal-amount-value').text(numberWithCommas(perAmount) + '원');
}

function generateEqualCompanions(n) {
  var $list = $('#equal_companion_list');
  $list.empty();
  for (var i = 1; i <= n; i++) {
    var html = '<div class="companion-item equal-companion-item" data-index="' + i + '">'
      + '<div class="companion-header"><span class="companion-label">동반자 ' + i + '</span></div>'
      + '<div class="companion-fields">'
      + '  <div class="input-row"><label class="input-label">이름</label>'
      + '    <input type="text" class="rsv-input equal-companion-name" placeholder="이름 입력" tabindex="-1"></div>'
      + '  <div class="input-row"><label class="input-label">연락처</label>'
      + '    <input type="tel" class="rsv-input equal-companion-phone" placeholder="010-0000-0000" maxlength="13" tabindex="-1"></div>'
      + '  <div class="input-row equal-amount-row"><label class="input-label">결제금액</label>'
      + '    <span class="equal-amount-value">' + numberWithCommas(Math.floor(g_green_fee / g_equal_count)) + '원</span></div>'
      + '</div></div>';
    $list.append(html);
  }
}

// =============================================================
//  6. 직접 입력 동반자 관리
// =============================================================

function addCompanion() {
  if (g_companion_count >= g_max_companion) {
    showAlert('동반자는 최대 ' + g_max_companion + '명까지 추가할 수 있습니다.');
    return;
  }
  g_companion_count++;
  var idx = g_companion_count;
  var html = '<div class="companion-item" data-index="' + idx + '">'
    + '<div class="companion-header">'
    + '  <span class="companion-label">동반자 ' + idx + '</span>'
    + '  <button type="button" class="companion-remove" onclick="removeCompanion(this)" tabindex="-1">삭제</button>'
    + '</div>'
    + '<div class="companion-fields">'
    + '  <div class="input-row"><label class="input-label">이름</label>'
    + '    <input type="text" class="rsv-input companion-name" placeholder="이름 입력" tabindex="-1"></div>'
    + '  <div class="input-row"><label class="input-label">연락처</label>'
    + '    <input type="tel" class="rsv-input companion-phone" placeholder="010-0000-0000" maxlength="13" tabindex="-1"></div>'
    + '  <div class="input-row"><label class="input-label">결제금액</label>'
    + '    <div class="input-with-unit">'
    + '      <input type="text" class="rsv-input companion-amount" placeholder="금액 입력" tabindex="-1">'
    + '      <span class="input-unit">원</span></div></div>'
    + '</div></div>';
  $('#companion_list').append(html);
  updateCompanionButton();
  calculateCompanionTotal();
}

function removeCompanion(th) {
  if ($('#companion_list .companion-item').length <= 1) {
    showAlert('최소 1명의 동반자 정보가 필요합니다.');
    return;
  }
  $(th).closest('.companion-item').slideUp(200, function () {
    $(this).remove();
    g_companion_count = $('#companion_list .companion-item').length;
    reindexCompanions();
    updateCompanionButton();
    calculateCompanionTotal();
  });
}

function reindexCompanions() {
  $('#companion_list .companion-item').each(function (i) {
    $(this).attr('data-index', i + 1);
    $(this).find('.companion-label').text('동반자 ' + (i + 1));
  });
}

function updateCompanionButton() {
  var count = $('#companion_list .companion-item').length;
  $('#companion_add_btn').prop('disabled', count >= g_max_companion);
}

function calculateCompanionTotal() {
  var companionSum = 0;
  $('.companion-amount').each(function () {
    var val = $(this).val().replace(/[^0-9]/g, '');
    if (val) companionSum += parseInt(val, 10);
  });
  var myAmount = Math.max(g_green_fee - companionSum, 0);
  $('#my_amount').text(numberWithCommas(myAmount) + '원');
  $('#companion_sum').text(numberWithCommas(companionSum) + '원');
  $('#total_green_fee').text(numberWithCommas(g_green_fee) + '원');
  if (companionSum > g_green_fee) {
    $('#companion_sum').addClass('over-limit');
  } else {
    $('#companion_sum').removeClass('over-limit');
  }
}

// =============================================================
//  7. 유효성 검증
// =============================================================

function validate() {
  // 약관 동의 확인
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
  if (g_payment === 'onsite') return true;

  if (!g_payer_direct) {
    showAlert('결제자를 선택해주세요.');
    return false;
  }

  if (g_payer_direct === 'split') {
    if (g_split_type === 'equal') {
      if (g_equal_count < 2) {
        showAlert('인원을 선택해주세요.');
        return false;
      }
      var eqValid = true;
      $('#equal_companion_list .equal-companion-item').each(function () {
        var name = $(this).find('.equal-companion-name').val().trim();
        var phone = $(this).find('.equal-companion-phone').val().replace(/[^0-9]/g, '');
        var idx = $(this).find('.companion-label').text();
        if (!name) {
          showAlert(idx + '의 이름을 입력해주세요.');
          $(this).find('.equal-companion-name').addClass('input-error').focus();
          eqValid = false; return false;
        }
        if (!phone || phone.length < 10 || phone.length > 11) {
          showAlert(idx + '의 연락처를 정확히 입력해주세요.');
          $(this).find('.equal-companion-phone').addClass('input-error').focus();
          eqValid = false; return false;
        }
      });
      if (!eqValid) return false;
    } else {
      var valid = true;
      var companionSum = 0;
      $('#companion_list .companion-item').each(function () {
        var name = $(this).find('.companion-name').val().trim();
        var phone = $(this).find('.companion-phone').val().replace(/[^0-9]/g, '');
        var amount = $(this).find('.companion-amount').val().replace(/[^0-9]/g, '');
        var idx = $(this).find('.companion-label').text();
        if (!name) {
          showAlert(idx + '의 이름을 입력해주세요.');
          $(this).find('.companion-name').addClass('input-error').focus();
          valid = false; return false;
        }
        if (!phone || phone.length < 10 || phone.length > 11) {
          showAlert(idx + '의 연락처를 정확히 입력해주세요.');
          $(this).find('.companion-phone').addClass('input-error').focus();
          valid = false; return false;
        }
        if (!amount || parseInt(amount, 10) <= 0) {
          showAlert(idx + '의 결제금액을 입력해주세요.');
          $(this).find('.companion-amount').addClass('input-error').focus();
          valid = false; return false;
        }
        companionSum += parseInt(amount, 10);
      });
      if (!valid) return false;
      if (companionSum > g_green_fee) {
        showAlert('동반자 결제금액 합계가 그린피를 초과합니다.\n합계: ' + numberWithCommas(companionSum) + '원');
        return false;
      }
    }
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
  return true;
}

$(document).on('focus', '.rsv-input', function () {
  $(this).removeClass('input-error');
});

// =============================================================
//  8. 예약 요청 submit
// =============================================================

function submitReservation() {
  if (!validate()) return;

  $('#visit_type').val(g_visit_type);
  $('#payment_method').val(g_payment);

  if (g_visit_type === 'direct') {
    $('#payer_type').val(g_payment === 'onsite' ? 'onsite_self' : g_payer_direct);
    $('#h_delegate_name').val('');
    $('#h_delegate_phone').val('');
    if (g_payer_direct === 'split') {
      $('#split_type').val(g_split_type);
      $('#split_count').val(g_split_type === 'equal' ? g_equal_count : '');
    } else {
      $('#split_type').val('');
      $('#split_count').val('');
    }
  } else {
    $('#payer_type').val(g_payment === 'onsite' ? 'onsite_delegate' : 'delegate');
    $('#h_delegate_name').val($('#delegate_name').val().trim());
    $('#h_delegate_phone').val($('#delegate_phone').val().replace(/[^0-9]/g, ''));
    $('#split_type').val('');
    $('#split_count').val('');
  }

  var visitLabel = g_visit_type === 'direct' ? '본인 방문' : '위임';
  showConfirm(visitLabel + '으로 예약을 요청하시겠습니까?', function () {
    showLoading(function () {
      showAlert('예약이 정상적으로 요청되었습니다. (데모)');
    });
  });
}

// =============================================================
//  9. Alert / Confirm 팝업
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
  $('#confirm_pop_title').html(msg.replace(/\n/g, '<br>'));
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
//  10. 로딩 화면
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
