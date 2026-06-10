/* ============================================================
   동반자 10% 할인 프로모션 — 동반자 정보 입력 로직
   - 동반자 3명(이름 + 연락처) 모두 필수 입력
   - 발송 확인 → 정상 등록 안내 화면 노출
   ============================================================ */

$(function () {
  // 연락처 자동 하이픈 포맷 (010-0000-0000)
  $('.companion-phone').on('input', function () {
    this.value = formatPhone(this.value);
    $(this).removeClass('input-error');
  });
  // 이름 입력 시 오류 표시 해제
  $('.companion-name').on('input', function () {
    $(this).removeClass('input-error');
  });

  // ===== 개발자 프리뷰 (URL 파라미터) =====
  // index.html?preview=confirm  → 발송 확인 팝업 바로 보기
  // index.html?preview=complete → 등록 완료 화면 바로 보기
  var preview = (location.search.match(/[?&]preview=([^&]+)/) || [])[1];
  if (preview === 'confirm') {
    fillSampleCompanions();
    submitCompanions();
  } else if (preview === 'complete') {
    fillSampleCompanions();
    doSubmit();
  }
});

/* 프리뷰용 샘플 동반자 3명 주입 */
function fillSampleCompanions() {
  var sample = [
    { name: '김영철', phone: '010-9999-9888' },
    { name: '홍길동', phone: '010-3838-4843' },
    { name: '박차우', phone: '010-9378-3939' }
  ];
  $('.companion-item').each(function (i) {
    if (!sample[i]) return;
    $(this).find('.companion-name').val(sample[i].name);
    $(this).find('.companion-phone').val(sample[i].phone);
  });
}

/* 숫자만 추출 후 010-0000-0000 형태로 변환 */
function formatPhone(value) {
  var n = (value || '').replace(/[^0-9]/g, '').slice(0, 11);
  if (n.length < 4) return n;
  if (n.length < 8) return n.slice(0, 3) + '-' + n.slice(3);
  return n.slice(0, 3) + '-' + n.slice(3, 7) + '-' + n.slice(7);
}

/* 휴대폰 번호 유효성 (010으로 시작하는 10~11자리) */
function isValidPhone(value) {
  var n = (value || '').replace(/[^0-9]/g, '');
  return /^01[016789][0-9]{7,8}$/.test(n);
}

/* 입력된 동반자 정보 수집 */
function collectCompanions() {
  var list = [];
  $('.companion-item').each(function () {
    list.push({
      idx: $(this).data('index'),
      name: $.trim($(this).find('.companion-name').val()),
      phone: $.trim($(this).find('.companion-phone').val()),
      $name: $(this).find('.companion-name'),
      $phone: $(this).find('.companion-phone')
    });
  });
  return list;
}

/* 저장 및 안내문자 발송 버튼 — 검증 후 확인 팝업 노출 */
function submitCompanions() {
  var list = collectCompanions();
  $('.rsv-input').removeClass('input-error');

  // 1) 빈 값 검사 (3명 모두 필수)
  for (var i = 0; i < list.length; i++) {
    if (!list[i].name) {
      list[i].$name.addClass('input-error');
      return openAlert('동반자 ' + list[i].idx + '의 이름을 입력해주세요.');
    }
    if (!list[i].phone) {
      list[i].$phone.addClass('input-error');
      return openAlert('동반자 ' + list[i].idx + '의 연락처를 입력해주세요.');
    }
    if (!isValidPhone(list[i].phone)) {
      list[i].$phone.addClass('input-error');
      return openAlert('동반자 ' + list[i].idx + '의 연락처를 정확히 입력해주세요.');
    }
  }

  // 2) 연락처 중복 검사
  for (var a = 0; a < list.length; a++) {
    for (var b = a + 1; b < list.length; b++) {
      if (digits(list[a].phone) === digits(list[b].phone)) {
        list[b].$phone.addClass('input-error');
        return openAlert('동반자 연락처가 중복되었습니다. 다시 확인해주세요.');
      }
    }
  }

  // 3) 확인 팝업에 요약 표시
  var html = '';
  list.forEach(function (c) {
    html +=
      '<div class="confirm-rsv-row">' +
        '<span class="confirm-rsv-label">동반자 ' + c.idx + '</span>' +
        '<span class="confirm-rsv-value">' + escapeHtml(c.name) + ' / ' + c.phone + '</span>' +
      '</div>';
  });
  $('#confirm_companion_summary').html(html);
  $('#confirm_pop').show();
}

function digits(v) { return (v || '').replace(/[^0-9]/g, ''); }

/* 발송 확정 → 등록 완료 안내 화면으로 전환 */
function doSubmit() {
  closeConfirm();

  var list = collectCompanions();
  var html = '';
  list.forEach(function (c) {
    html +=
      '<div class="complete-list-item">' +
        '<span class="complete-list-name"><span class="complete-list-tag">동반자 ' + c.idx + '</span>' + escapeHtml(c.name) + '</span>' +
        '<span class="complete-list-phone">' + c.phone + '</span>' +
      '</div>';
  });
  $('#complete_list').html(html);

  // 입력 화면을 가리고 완료 화면 노출
  window.scrollTo(0, 0);
  $('#complete_screen').show();
}

/* 완료 화면 확인 — 이전 화면(프로모션)으로 복귀 */
function confirmComplete() {
  // 실제 연동 시: location.href = '/promotion' 등으로 이동
  history.back();
}

/* ===== 팝업 유틸 ===== */
function openAlert(msg) {
  $('#alert_pop_title').html(msg);
  $('#alert_pop').show();
}
function closeAlert() {
  $('#alert_pop').hide();
}
function closeConfirm() {
  $('#confirm_pop').hide();
}

/* XSS 방지용 간단 이스케이프 */
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}
