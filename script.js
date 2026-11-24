(function () {
  'use strict';

  /* =====================================================================
     [설정] 방문예약 알림 연동
     ---------------------------------------------------------------------
     신청 버튼을 누르면 별도 절차 없이 realnest@naver.com 으로 예약 내용이
     자동 전송되고, 방문자에게는 완료 안내 창이 표시됩니다.
     (처음 한 번은 realnest@naver.com 으로 활성화 메일이 오고,
      메일의 'Activate Form' 링크를 눌러야 이후 알림이 전달됩니다.)
     ===================================================================== */
  var NOTIFICATION_ENDPOINT = 'https://formsubmit.co/ajax/realnest@naver.com';
  var NOTIFICATION_EMAIL    = 'realnest@naver.com';
  var SALES_PHONE           = '1800-6589';
  var AGENCY_SUBJECT        = '[첨단3지구 제일풍경채] 방문예약 신청';

  /* ---------------- 헤더 ---------------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- 모바일 메뉴 ---------------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');

  function closeNav() {
    document.body.classList.remove('nav-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', '메뉴 열기');
  }
  menuBtn.addEventListener('click', function () {
    var open = !document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
    a.addEventListener('click', closeNav);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) closeNav();
  });

  /* ---------------- 라이트박스 ---------------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbOpen = document.getElementById('lbOpen');
  var lbCloseBtn = document.getElementById('lbClose');
  var lbTrigger = null;

  function openLightbox(btn) {
    var src = btn.getAttribute('data-lightbox');
    if (!src) return;
    var inner = btn.querySelector('img');
    lbImg.src = src;
    lbImg.alt = inner ? inner.alt : '';
    lbCap.textContent = btn.getAttribute('data-caption') || (inner ? inner.alt : '');
    lbOpen.href = src;
    lbTrigger = btn;
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    lbCloseBtn.focus();
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('lb-open');
    if (lbTrigger && lbTrigger.focus) lbTrigger.focus();
    lbTrigger = null;
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-lightbox]'), function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  lbCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------------- 주택형 탭 ---------------- */
  var typeTabs = Array.prototype.slice.call(document.querySelectorAll('.type-tab'));

  function selectTypeTab(tab, moveFocus) {
    typeTabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (!panel) return;
      if (on) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
    if (moveFocus) tab.focus();
  }
  typeTabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTypeTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = typeTabs[(i + 1) % typeTabs.length];
      else if (e.key === 'ArrowLeft') next = typeTabs[(i - 1 + typeTabs.length) % typeTabs.length];
      else if (e.key === 'Home') next = typeTabs[0];
      else if (e.key === 'End') next = typeTabs[typeTabs.length - 1];
      if (!next) return;
      e.preventDefault();
      selectTypeTab(next, true);
    });
  });

  /* ---------------- 달력 / 시간 ---------------- */
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  var TIMES = (function () {
    var out = [];
    for (var m = 10 * 60; m <= 18 * 60; m += 30) {
      var h = Math.floor(m / 60);
      var mi = m % 60;
      out.push((h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi);
    }
    return out;
  })();

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function sameDay(a, b) {
    return !!a && !!b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
  function formatVisit(date, time) {
    return date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() +
      '일 (' + DOW[date.getDay()] + ') ' + time;
  }
  function formatPhone(raw) {
    var d = String(raw).replace(/[^0-9]/g, '').slice(0, 11);
    if (!d) return '';
    if (d.indexOf('02') === 0) {
      if (d.length <= 2) return d;
      if (d.length <= 5) return d.slice(0, 2) + '-' + d.slice(2);
      if (d.length <= 9) return d.slice(0, 2) + '-' + d.slice(2, 5) + '-' + d.slice(5);
      return d.slice(0, 2) + '-' + d.slice(2, 6) + '-' + d.slice(6, 10);
    }
    if (d.indexOf('15') === 0 || d.indexOf('16') === 0 || d.indexOf('18') === 0) {
      if (d.length <= 4) return d;
      return d.slice(0, 4) + '-' + d.slice(4, 8);
    }
    if (d.length <= 3) return d;
    if (d.length <= 7) return d.slice(0, 3) + '-' + d.slice(3);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7, 11);
  }

  var today = startOfDay(new Date());
  var state = {
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    selectedDate: null,
    selectedTime: null
  };

  var calTitle = document.getElementById('calTitle');
  var calGrid = document.getElementById('calGrid');
  var prevMonthBtn = document.getElementById('prevMonth');
  var nextMonthBtn = document.getElementById('nextMonth');
  var timeGrid = document.getElementById('timeGrid');
  var timeHint = document.getElementById('timeHint');
  var visitSummary = document.getElementById('visitSummary');
  var visitSummaryText = document.getElementById('visitSummaryText');

  function renderCalendar() {
    var y = state.viewYear;
    var m = state.viewMonth;
    calTitle.textContent = y + '년 ' + (m + 1) + '월';
    prevMonthBtn.disabled = (y === today.getFullYear() && m === today.getMonth());

    var firstDow = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var frag = document.createDocumentFragment();
    var i;

    for (i = 0; i < firstDow; i++) {
      var blank = document.createElement('span');
      blank.className = 'cal-blank';
      blank.setAttribute('aria-hidden', 'true');
      frag.appendChild(blank);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(y, m, d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = String(d);

      var dow = date.getDay();
      if (dow === 0) btn.classList.add('sun');
      if (dow === 6) btn.classList.add('sat');

      var label = (m + 1) + '월 ' + d + '일 ' + DOW[dow] + '요일';
      if (date.getTime() === today.getTime()) {
        btn.classList.add('today');
        label = (m + 1) + '월 ' + d + '일 오늘';
      }
      btn.setAttribute('aria-label', label);

      if (date.getTime() < today.getTime()) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      }
      if (sameDay(date, state.selectedDate)) {
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      frag.appendChild(btn);
    }

    calGrid.textContent = '';
    calGrid.appendChild(frag);
  }

  function isTimePast(t) {
    if (!state.selectedDate) return false;
    if (!sameDay(state.selectedDate, today)) return false;
    var parts = t.split(':');
    var now = new Date();
    return (Number(parts[0]) * 60 + Number(parts[1])) <= (now.getHours() * 60 + now.getMinutes());
  }

  function renderTimes() {
    var hasDate = !!state.selectedDate;
    timeGrid.textContent = '';
    var frag = document.createDocumentFragment();

    for (var i = 0; i < TIMES.length; i++) {
      var t = TIMES[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time';
      btn.textContent = t;
      btn.setAttribute('data-time', t);

      if (!hasDate) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      } else if (isTimePast(t)) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.title = '지난 시간입니다';
      }
      if (state.selectedTime === t) {
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      frag.appendChild(btn);
    }
    timeGrid.appendChild(frag);

    timeHint.textContent = hasDate ? '10:00 ~ 18:00 · 30분 단위' : '날짜를 먼저 선택해 주세요';
  }

  function updateSummary() {
    if (state.selectedDate && state.selectedTime) {
      visitSummaryText.textContent = formatVisit(state.selectedDate, state.selectedTime);
      visitSummary.classList.remove('is-empty');
    } else {
      visitSummaryText.textContent = '날짜와 시간을 선택해 주세요';
      visitSummary.classList.add('is-empty');
    }
  }

  calGrid.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.cal-day') : null;
    if (!btn || btn.disabled) return;
    state.selectedDate = new Date(state.viewYear, state.viewMonth, Number(btn.textContent));
    renderCalendar();
    renderTimes();
    updateSummary();
    hideError('errDate');
  });

  timeGrid.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.time') : null;
    if (!btn || btn.disabled) return;
    state.selectedTime = btn.getAttribute('data-time');
    renderTimes();
    updateSummary();
    hideError('errDate');
  });

  prevMonthBtn.addEventListener('click', function () {
    state.viewMonth -= 1;
    if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear -= 1; }
    renderCalendar();
  });
  nextMonthBtn.addEventListener('click', function () {
    state.viewMonth += 1;
    if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear += 1; }
    renderCalendar();
  });

  /* ---------------- 입력 필드 ---------------- */
  var form = document.getElementById('reserveForm');
  var nameInput = document.getElementById('nameInput');
  var phoneInput = document.getElementById('phoneInput');
  var consentYes = document.getElementById('consentYes');
  var consentNo = document.getElementById('consentNo');
  var consentBlock = document.getElementById('consentBlock');
  var submitBtn = document.getElementById('submitBtn');
  var policyToggle = document.getElementById('policyToggle');
  var policyPanel = document.getElementById('policyPanel');

  phoneInput.addEventListener('input', function () {
    var el = phoneInput;
    var caret = el.selectionStart || 0;
    var digitsBefore = el.value.slice(0, caret).replace(/[^0-9]/g, '').length;
    var formatted = formatPhone(el.value);
    el.value = formatted;

    var pos = 0;
    var seen = 0;
    while (pos < formatted.length && seen < digitsBefore) {
      if (/[0-9]/.test(formatted.charAt(pos))) seen += 1;
      pos += 1;
    }
    try { el.setSelectionRange(pos, pos); } catch (err) { /* noop */ }
  });

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim().length >= 2) hideError('errName');
  });
  phoneInput.addEventListener('blur', function () {
    if (phoneInput.value.replace(/[^0-9]/g, '').length >= 9) hideError('errPhone');
  });

  function setConsentState() {
    var no = consentNo.checked;
    var yes = consentYes.checked;
    consentBlock.hidden = !no;
    submitBtn.disabled = no;
    if (yes) hideError('errConsent');
  }
  consentYes.addEventListener('change', setConsentState);
  consentNo.addEventListener('change', setConsentState);

  policyToggle.addEventListener('click', function () {
    var open = policyPanel.hidden;
    policyPanel.hidden = !open;
    policyToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    policyToggle.textContent = open ? '개인정보 수집·이용 안내 접기' : '개인정보 수집·이용 안내 보기';
  });

  /* ---------------- 오류 표시 ---------------- */
  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }
  function hideError(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    el.textContent = '';
  }
  function clearErrors() {
    hideError('errName');
    hideError('errPhone');
    hideError('errConsent');
    hideError('errDate');
    nameInput.removeAttribute('aria-invalid');
    phoneInput.removeAttribute('aria-invalid');
  }

  /* ---------------- 알림 전송 ---------------- */
  var SEND_TIMEOUT = 15000;

  function postNotification(payload) {
    return fetch(NOTIFICATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.text().then(function (raw) {
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch (err) { data = null; }

        if (res.ok && data && (data.success === true || data.success === 'true')) {
          return { status: 'sent' };
        }
        var message = data && data.message ? String(data.message) : '';
        return {
          status: 'failed',
          reason: /activat/i.test(message) ? 'activation' : 'http',
          detail: 'HTTP ' + res.status
        };
      });
    }).catch(function (err) {
      return {
        status: 'failed',
        reason: (window.location && window.location.protocol === 'file:') ? 'file' : 'network',
        detail: String(err && err.message ? err.message : err)
      };
    });
  }

  function sendNotification(payload) {
    if (!NOTIFICATION_ENDPOINT) return Promise.resolve({ status: 'disabled' });
    var timer = null;
    var timedOut = new Promise(function (resolve) {
      timer = setTimeout(function () {
        resolve({ status: 'failed', reason: 'timeout', detail: 'timeout' });
      }, SEND_TIMEOUT);
    });
    var request = postNotification(payload).then(function (result) {
      clearTimeout(timer);
      return result;
    });
    return Promise.race([request, timedOut]);
  }

  function mailtoLink(p) {
    var subject = AGENCY_SUBJECT + ' - ' + p['이름'] + ' / ' + p['방문일시'];
    var lines = [
      '이름: ' + p['이름'],
      '연락처: ' + p['연락처'],
      '방문일시: ' + p['방문일시'],
      '',
      '위와 같이 방문예약을 신청합니다.'
    ];
    return 'mailto:' + NOTIFICATION_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  /* ---------------- 확인 모달 ---------------- */
  var modal = document.getElementById('confirmModal');
  var modalTitle = document.getElementById('modalTitle');
  var modalSub = document.getElementById('modalSub');
  var modalIcon = document.getElementById('modalIcon');
  var modalInfo = document.getElementById('modalInfo');
  var modalConfirm = document.getElementById('modalConfirm');
  var modalCall = document.getElementById('modalCall');
  var modalDetails = document.getElementById('modalDetails');
  var modalNote = document.getElementById('modalNote');
  var modalMail = document.getElementById('modalMail');
  var modalCloseBtn = document.getElementById('modalClose');
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalCloseBtn.focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-close]'), function (el) {
    el.addEventListener('click', closeModal);
  });
  modalCloseBtn.addEventListener('click', closeModal);
  modalConfirm.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      if (!lightbox.hidden) closeLightbox();
      closeNav();
      return;
    }
    if (modal.hidden) return;
    if (e.key === 'Tab') {
      var focusables = Array.prototype.filter.call(
        modal.querySelectorAll('a[href],button:not([disabled])'),
        function (el) { return !el.hidden; }
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function renderModalDetails(payload) {
    var rows = [
      ['이름', payload['이름']],
      ['연락처', payload['연락처']],
      ['방문일시', payload['방문일시']]
    ];
    modalDetails.textContent = '';
    for (var i = 0; i < rows.length; i++) {
      var row = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rows[i][0];
      dd.textContent = rows[i][1];
      row.appendChild(dt);
      row.appendChild(dd);
      modalDetails.appendChild(row);
    }
  }

  function fallbackNote(result) {
    if (result.status === 'disabled') {
      return '자동 알림이 설정되어 있지 않아 예약 내용이 전달되지 않았습니다. ' + SALES_PHONE +
        '로 전화하시거나 아래 [메일로 예약 내용 보내기]를 눌러 주세요.';
    }
    if (result.reason === 'file') {
      return '이 페이지를 파일로 바로 열어 미리보기 중이라(file://) 브라우저 보안 정책이 자동 전송을 차단했습니다. 웹 주소로 열면 자동으로 전송됩니다. 지금 예약하시려면 ' +
        SALES_PHONE + '로 전화하시거나 아래 [메일로 예약 내용 보내기]를 눌러 주세요.';
    }
    if (result.reason === 'activation') {
      return '메일 알림 연동이 아직 활성화되지 않아 예약 내용이 자동으로 전달되지 않았습니다. ' +
        SALES_PHONE + '로 전화하시거나 아래 [메일로 예약 내용 보내기]를 눌러 주세요.';
    }
    return '네트워크 연결이 끊겼거나 전송이 차단되어 예약 내용이 자동으로 전달되지 않았습니다. ' +
      SALES_PHONE + '로 전화하시거나 아래 [메일로 예약 내용 보내기]를 눌러 주세요.';
  }

  function setModalState(result, payload) {
    renderModalDetails(payload);
    modalMail.href = mailtoLink(payload);

    if (result.status === 'sent') {
      modalIcon.classList.remove('is-warn');
      modalTitle.textContent = '방문예약 신청이 완료되었습니다';
      modalSub.textContent = '담당자가 확인 후 연락드리겠습니다.';
      modalNote.hidden = true;
      modalNote.textContent = '';
      modalInfo.textContent = '문의 ' + SALES_PHONE;
      modalInfo.hidden = false;
      modalCall.hidden = true;
      modalMail.hidden = true;
      modalConfirm.textContent = '확인';
      modalConfirm.className = 'btn btn-ghost';
    } else {
      modalIcon.classList.add('is-warn');
      modalTitle.textContent = '방문예약 신청을 자동으로 접수하지 못했습니다';
      modalSub.textContent = '아래 번호로 연락 주시면 바로 예약해 드립니다.';
      modalNote.hidden = false;
      modalNote.textContent = fallbackNote(result);
      modalInfo.hidden = true;
      modalCall.hidden = false;
      modalMail.hidden = false;
      modalConfirm.textContent = '닫기';
      modalConfirm.className = 'btn btn-ghost';
    }
  }

  /* ---------------- 제출 ---------------- */
  var submitting = false;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    clearErrors();

    var name = nameInput.value.trim();
    var digits = phoneInput.value.replace(/[^0-9]/g, '');
    var consent = document.querySelector('input[name="consent"]:checked');
    var ok = true;
    var firstBad = null;

    if (!state.selectedDate) {
      showError('errDate', '방문 날짜를 먼저 선택해 주세요.');
      ok = false;
      firstBad = firstBad || calGrid;
    } else if (!state.selectedTime) {
      showError('errDate', '방문 시간을 선택해 주세요.');
      ok = false;
      firstBad = firstBad || timeGrid;
    }

    if (name.length < 2) {
      showError('errName', '이름을 2자 이상 입력해 주세요.');
      nameInput.setAttribute('aria-invalid', 'true');
      ok = false;
      firstBad = firstBad || nameInput;
    }

    if (digits.length < 9 || digits.length > 11) {
      showError('errPhone', '연락처를 정확히 입력해 주세요. (숫자 10~11자리)');
      phoneInput.setAttribute('aria-invalid', 'true');
      ok = false;
      firstBad = firstBad || phoneInput;
    }

    if (!consent) {
      showError('errConsent', '개인정보 수집·이용 동의 여부를 선택해 주세요.');
      ok = false;
      firstBad = firstBad || consentYes;
    } else if (consent.value !== '동의') {
      showError('errConsent', '동의하지 않으시면 방문예약 신청이 어렵습니다.');
      ok = false;
      firstBad = firstBad || consentNo;
    }

    if (!ok) {
      if (firstBad && firstBad.focus) firstBad.focus();
      setConsentState();
      return;
    }

    var visitAt = formatVisit(state.selectedDate, state.selectedTime);
    var payload = {
      '이름': name,
      '연락처': formatPhone(digits),
      '방문일시': visitAt,
      '개인정보동의': '동의',
      '_subject': AGENCY_SUBJECT,
      '_template': 'table',
      '_captcha': 'false'
    };

    submitting = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '신청 중…';

    sendNotification(payload).then(function (result) {
      submitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      setModalState(result, payload);
      openModal();
    });
  });

  /* ---------------- 등장 애니메이션 ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- 초기화 ---------------- */
  renderCalendar();
  renderTimes();
  updateSummary();
})();
