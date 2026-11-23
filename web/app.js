'use strict';
(() => {
  const M = MIS,
    D = HRData,
    V = HRViews,
    app = document.querySelector('#app'),
    dialog = document.querySelector('#detail');
  let data = null,
    page = 'profile',
    authMode = 'login',
    adminTab = 'queue',
    busy = false,
    stamp = 0,
    toastTimer,
    strokes = [],
    signed = false;
  const labelError = (ex) => D.message(ex);
  function toast(message, error = false) {
    const el = dialog.open
      ? document.querySelector('#dialog-status')
      : document.querySelector('#notice');
    if (!el) return;
    el.textContent = message;
    el.className = error ? 'error active' : 'active';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.className = '';
      el.textContent = '';
    }, 5000);
  }
  function modal(body) {
    document.querySelector('#dialog-body').innerHTML =
      '<button type="button" data-action="close" class="dialog-x iconbtn no-print" aria-label="ปิดหน้าต่าง">' +
      V.ic('close') +
      '</button>' +
      body +
      '<div id="dialog-status" role="status" aria-live="polite"></div>';
    if (!dialog.open) dialog.showModal();
  }
  dialog.addEventListener('close', () => {
    if (!dialog.open) document.querySelector('#dialog-body').replaceChildren();
  });
  function render() {
    document.body.classList.remove('menu-open');
    if (dialog.open) dialog.close();
    if (!data || authMode==='recover') {
      app.innerHTML = V.login(authMode);
      return;
    }
    const route = location.hash.slice(1);
    page = Object.hasOwn(M.pages, route) ? route : 'profile';
    if (page === 'admin' && data.role !== 'hr') page = 'home';
    app.innerHTML = V.layout(data, page, V.page(data, page, adminTab));
    document.title = M.pages[page] + ' | บุคลากร มทร.อีสาน ขอนแก่น';
    if (page === 'signature') setupSignature();
  }
  async function refresh() {
    const ticket = ++stamp;
    try {
      const next = await D.load();
      if (ticket !== stamp) return;
      data = next;
      render();
    } catch (ex) {
      if (ticket !== stamp) return;
      data = null;
      if (dialog.open) dialog.close();
      app.innerHTML =
        '<main class="login"><div class="login-box"><h1>เปิดระบบไม่สำเร็จ</h1><p>' +
        M.esc(labelError(ex)) +
        '</p><div class="toolbar">' +
        V.btn('ลองใหม่', 'reload') +
        V.btn('กลับหน้าเข้าสู่ระบบ', 'logout') +
        '</div></div></main>';
    }
  }
  function draw() {
    const canvas = document.querySelector('#signature');
    if (!canvas) return;
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.lineWidth = 2.6;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = '#193454';
    for (const path of strokes) {
      if (!Array.isArray(path) || !path.length) continue;
      c.beginPath();
      c.moveTo(...path[0]);
      for (const p of path) c.lineTo(...p);
      if (path.length === 1) c.lineTo(path[0][0] + 0.5, path[0][1] + 0.5);
      c.stroke();
    }
  }
  function setupSignature() {
    strokes = structuredClone(data.signature);
    signed = false;
    const c = document.querySelector('#signature');
    draw();
    const coord = (ev) => {
      const r = c.getBoundingClientRect();
      return [
        Math.max(
          0,
          Math.min(720, Math.round(((ev.clientX - r.left) * 720) / r.width)),
        ),
        Math.max(
          0,
          Math.min(200, Math.round(((ev.clientY - r.top) * 200) / r.height)),
        ),
      ];
    };
    let pointer = null;
    c.onpointerdown = (ev) => {
      if (pointer !== null) return;
      if (strokes.length >= 150) {
        toast('เต็มพื้นที่จัดเก็บ กรุณากดวาดใหม่', true);
        return;
      }
      pointer = ev.pointerId;
      c.setPointerCapture(pointer);
      strokes.push([coord(ev)]);
      signed = true;
      draw();
    };
    c.onpointermove = (ev) => {
      if (pointer !== ev.pointerId) return;
      const line = strokes.at(-1),
        p = coord(ev),
        last = line.at(-1);
      if (
        line.length < 800 &&
        Math.hypot(p[0] - last[0], p[1] - last[1]) >= 2
      ) {
        line.push(p);
        draw();
      }
    };
    c.onlostpointercapture =
      c.onpointercancel =
      c.onpointerup =
        () => {
          pointer = null;
        };
  }
  function syncProcess() {
    const f = dialog.querySelector('[data-form="process"]');
    if (!f) return;
    f.note.required = ['ready', 'rejected'].includes(f.status.value);
    f.querySelector('#pdf-field').hidden = f.status.value !== 'ready';
  }
  const fileLimitCheck = () => JSON.stringify(strokes).length > 100000;
  async function submitForm(form) {
    const vals = Object.fromEntries(new FormData(form));
    for (const k in vals)
      if (typeof vals[k] === 'string') vals[k] = vals[k].trim();
    const kind = form.dataset.form;
    if (kind === 'login') {
      await D.login(vals.email, form.elements.password.value);
      authMode = 'login';
      await refresh();
      return;
    }
    if (kind === 'signup') {
      if (vals.password !== vals.confirm_password)
        throw Error('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      await D.signup({
        prefix:vals.prefix,first_name:vals.first_name,last_name:vals.last_name,
        email:vals.email,password:vals.password
      });
      authMode='sent';
      render();
      return;
    }
    if (kind === 'forgot-password') {
      await D.resetPassword(vals.email);
      authMode='reset-sent';
      render();
      return;
    }
    if (kind === 'set-password') {
      if (vals.password!==vals.confirm_password) throw Error('รหัสผ่านไม่ตรงกัน');
      await D.updatePassword(vals.password);
      authMode='login';
      await D.logout();
      await refresh();
      toast('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง');
      return;
    }
    let payload = vals,
      file = null,
      target = '';
    switch (kind) {
      case 'workflow-propose': {
        if (new Set([data.id,vals.reviewer_id,vals.approver_id,vals.signer_id]).size!==4)
          throw Error('ผู้เสนอ ผู้ตรวจสอบ ผู้อนุมัติ และผู้ลงนามต้องเป็นคนละคน');
        await D.proposeDocument(vals);
        history.replaceState(null,'','#workflow');
        await refresh();
        toast('เสนอเอกสารเรียบร้อยแล้ว');
        return;
      }
      case 'workflow-advance': {
        const r=data.workflows.find(x=>x.id===form.dataset.id);
        if (!r) throw Error('ไม่พบเอกสาร');
        if (['return','reject'].includes(vals.decision) && vals.note.length<5) throw Error('กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร');
        if (vals.decision==='sign' && !window.confirm('ยืนยันลงนามเอกสารนี้ด้วยบัญชีของท่าน?')) return;
        await D.advanceDocument({id:r.id,revision:r.revision,action:vals.decision,note:vals.note});
        await refresh(); toast('บันทึกการดำเนินการแล้ว');return;
      }
      case 'workflow-revise': {
        const r=data.workflows.find(x=>x.id===form.dataset.id);
        if (!r) throw Error('ไม่พบเอกสาร');
        await D.reviseDocument({id:r.id,revision:r.revision,content:vals.content,note:vals.note});
        await refresh();toast('ส่งตรวจสอบใหม่แล้ว');return;
      }
      case 'profile': {
        const org = data.orgs.find((r) =>
          M.orgKeys.every((k) => r[k] === vals[k]),
        );
        if (!org) throw Error('กรุณาเลือกสังกัดให้ครบทั้ง 4 ระดับ');
        payload = {
          staff_type: vals.staff_type,
          position: vals.position,
          track: vals.track,
          org_id: org.id,
          verified_at: new Date().toISOString(),
        };
        break;
      }
      case 'signature':
        if (!strokes.length || !signed)
          throw Error('กรุณาวาดลายเซ็นก่อนบันทึก');
        if (fileLimitCheck())
          throw Error('ลายเซ็นมีรายละเอียดมากเกินไป กรุณาวาดใหม่');
        payload = { strokes };
        break;
      case 'request':
        if (!vals.purpose) throw Error('กรุณาระบุวัตถุประสงค์');
        payload = {
          id: (form.dataset.requestId ||= M.uuid()),
          kind: form.dataset.kind,
          purpose: vals.purpose,
          copies: Number(vals.copies),
        };
        target = 'requests';
        break;
      case 'feedback':
        payload = { score: Number(vals.score), comment: vals.comment };
        break;
      case 'assessment':
        if (!vals.summary) throw Error('กรุณาสรุปผลงาน');
        payload = {
          period: vals.year + '/' + vals.round,
          summary: vals.summary,
        };
        break;
      case 'process': {
        const r = data.requests.find((x) => x.id === form.dataset.id);
        if (['rejected', 'ready'].includes(vals.status) && !vals.note)
          throw Error('กรุณาระบุเหตุผลที่ส่งคืน หรือวิธีรับเอกสาร');
        payload = {
          id: r.id,
          previous: r.status,
          status: vals.status,
          note: vals.note,
        };
        file = vals.status === 'ready' ? form.elements.file.files[0] : null;
        break;
      }
      case 'order':
        payload = { ...vals, recipient_id: vals.recipient_id || null };
        if (!vals.number || !vals.title || !vals.body)
          throw Error('กรุณากรอกข้อมูลคำสั่งให้ครบ');
        break;
      case 'activity': {
        const start = new Date(vals.starts_at + ':00+07:00');
        if (
          !vals.title ||
          !vals.venue ||
          !Number.isFinite(+start) ||
          start <= new Date()
        )
          throw Error('กรุณาระบุชื่อ สถานที่ และเวลาเริ่มในอนาคต');
        payload = {
          ...vals,
          starts_at: start.toISOString(),
          capacity: Number(vals.capacity),
        };
        break;
      }
      case 'asset':
        if (!vals.code || !vals.title || !vals.location)
          throw Error('กรุณาระบุรายละเอียดครุภัณฑ์ให้ครบ');
        break;
    }
    await D.save(kind, payload, data.id, file);
    if (target) history.replaceState(null, '', '#' + target);
    await refresh();
    if (data)
      toast(
        kind === 'request'
          ? 'ยื่นคำขอแล้ว ตรวจสอบสถานะได้จากตาราง'
          : 'บันทึกเรียบร้อยแล้ว',
      );
  }
  async function guarded(fn) {
    if (busy) return;
    busy = true;
    document.body.classList.add('busy');
    try {
      await fn();
    } catch (ex) {
      toast(labelError(ex), true);
    } finally {
      busy = false;
      document.body.classList.remove('busy');
    }
  }
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form[data-form]');
    if (!f) return;
    ev.preventDefault();
    guarded(() => submitForm(f));
  });
  document.addEventListener('change', (ev) => {
    const t = ev.target,
      idx = M.orgKeys.indexOf(t.name),
      f = t.form;
    if (f?.dataset.form === 'profile' && idx >= 0) {
      const parts = M.orgKeys.map((k) => f.elements[k].value);
      for (let i = idx + 1; i < 4; i++) {
        parts[i] = '';
        const s = f.elements[M.orgKeys[i]];
        s.innerHTML = V.orgOptions(data.orgs, parts, i);
        s.disabled = !parts[i - 1];
      }
    }
    if (f?.dataset.form === 'process' && t.name === 'status') syncProcess();
  });
  document.addEventListener('input', (ev) => {
    if (ev.target.name === 'search')
      document.querySelector('#results').innerHTML = V.orderTable(
        data,
        page,
        ev.target.value,
      );
  });
  async function action(name, id) {
    switch (name) {
      case 'menu': {
        const active = document.body.classList.toggle('menu-open');
        document
          .querySelector('[aria-controls="sidebar"]')
          .setAttribute('aria-expanded', active);
        return;
      }
      case 'close':
        dialog.close();
        return;
      case 'reload':
        await refresh();
        return;
      case 'show-signup':
        authMode='register';
        render();
        return;
      case 'show-login':
        authMode='login';
        render();
        return;
      case 'show-forgot':
        authMode='forgot';
        render();
        return;
      case 'rmuti-sso': {
        // การยืนยันตัวตนจริงต้องผ่านระบบ OAuth server-to-server ที่อนุมัติจาก RMUTI
        // ห้ามส่งรหัสลับของ RMUTI ไปยังหน้าบราวเซอร์หรือเปิดลิงก์ OAuth โดยไม่มี callback ตรวจสอบ
        const config = HR_CONFIG.rmutiSso || {};
        if (config.enabled && typeof config.startUrl === 'string') {
          try {
            const dest = new URL(config.startUrl);
            if (dest.protocol === 'https:' &&
                dest.origin === new URL(HR_CONFIG.supabaseUrl).origin &&
                dest.pathname === '/functions/v1/rmuti-sso-start') {
              window.location.assign(dest.href);
              return;
            }
          } catch {}
        }
        modal(
          '<h2>เข้าสู่ระบบด้วย RMUTI SSO</h2>' +
          '<p>เพิ่มปุ่มตามรูปแบบมหาวิทยาลัยแล้ว แต่ยังไม่เปิดการยืนยันตัวตนจริง เพราะต้องลงทะเบียนบริการกับผู้ดูแล RMUTI API และตั้งค่า OAuth ที่ฝั่งเซิร์ฟเวอร์ก่อน</p>' +
          '<p>ระหว่างนี้สามารถเข้าสู่ระบบด้วยอีเมล <strong>@rmuti.ac.th</strong> และรหัสผ่านที่ Admin จัดเตรียมไว้ได้ตามปกติ</p>' +
          '<p class="intro">แม้ยืนยันตัวตนผ่าน SSO แล้ว ก็ต้องมีสิทธิ์ในทะเบียนบุคลากรของระบบก่อน</p>'
        );
        return;
      }
      case 'logout':
        await D.logout();
        adminTab = 'queue';
        await refresh();
        return;
      case 'switch':
        modal(
          '<h2>ทดลองใช้งานตามบทบาท</h2><p class="intro">ข้อมูลตัวอย่างของทั้งสองบทบาทอยู่ในเบราว์เซอร์นี้</p><div class="login-roles">' +
            V.btn(
              'บุคลากร · นภา ตัวอย่าง',
              'role',
              M.demoUser,
              'light',
              'user',
            ) +
            V.btn(
              'เจ้าหน้าที่ HR · ภูมิ สมมติ',
              'role',
              M.demoHR,
              'light',
              'brief',
            ) +
            '</div>',
        );
        return;
      case 'role':
        if (D.demo) {
          await D.login(id);
          history.replaceState(
            null,
            '',
            id === M.demoHR ? '#admin' : '#profile',
          );
          adminTab = 'queue';
          await refresh();
        }
        return;
      case 'workflow-detail': {
        const r=data.workflows.find(x=>x.id===id);
        if (r) modal(HRWorkflow.detail(data,r));
        return;
      }
      case 'request-detail': {
        const r = data.requests.find((x) => x.id === id);
        if (r) {
          modal(V.requestDetail(data, r));
          syncProcess();
        }
        return;
      }
      case 'print':
        window.print();
        return;
      case 'download': {
        const r = data.requests.find((x) => x.id === id);
        if (!r?.document_path) return;
        const blob = await D.download(r),
          url = URL.createObjectURL(blob),
          a = document.createElement('a');
        a.href = url;
        a.download = V.num(r) + '.pdf';
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        return;
      }
      case 'order-detail': {
        const r = data.orders.find((x) => x.id === id);
        if (r)
          modal(
            '<small class="kicker">คำสั่ง ' +
              M.esc(r.number) +
              '</small><h2>' +
              M.esc(r.title) +
              '</h2><p class="intro">ลงวันที่ ' +
              M.esc(M.date(r.issued_on)) +
              '</p><p class="multiline">' +
              M.esc(r.body) +
              '</p>',
          );
        return;
      }
      case 'admin-tab':
        adminTab = id;
        render();
        return;
      case 'clear-sign':
        strokes = [];
        signed = false;
        draw();
        return;
      case 'delete-sign':
        modal(
          '<h2>ลบลายเซ็นที่บันทึกไว้?</h2><div class="toolbar">' +
            V.btn('ยืนยันการลบ', 'confirm-delete-sign') +
            V.btn('ย้อนกลับ', 'close') +
            '</div>',
        );
        return;
      case 'confirm-delete-sign':
        await D.save('signature', { strokes: [] }, data.id);
        await refresh();
        toast('ลบลายเซ็นแล้ว');
        return;
      case 'cancel':
        modal(
          '<h2>ยกเลิกการลงทะเบียน?</h2><p>' +
            M.esc(data.activities.find((a) => a.id === id)?.title) +
            '</p><div class="toolbar">' +
            V.btn('ยืนยันยกเลิก', 'confirm-cancel', id, 'primary') +
            V.btn('ย้อนกลับ', 'close') +
            '</div>',
        );
        return;
      case 'join':
      case 'confirm-cancel':
        await D.save(
          name === 'join' ? 'join' : 'cancel',
          { activity_id: id },
          data.id,
        );
        await refresh();
        toast(
          name === 'join' ? 'ลงทะเบียนกิจกรรมแล้ว' : 'ยกเลิกการลงทะเบียนแล้ว',
        );
        return;
    }
  }
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-action]');
    if (b) {
      ev.preventDefault();
      guarded(() => action(b.dataset.action, b.dataset.id));
    }
    if (ev.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        ev.clientX < r.left ||
        ev.clientX > r.right ||
        ev.clientY < r.top ||
        ev.clientY > r.bottom
      )
        dialog.close();
    }
  });
  window.addEventListener('hashchange', () => {
    render();
    window.scrollTo(0, 0);
    document.querySelector('#content')?.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') document.body.classList.remove('menu-open');
  });
  window.addEventListener('hr-session-ended', () => {
    if(authMode!=='recover') refresh();
  });
  window.addEventListener('hr-password-recovery',()=>{
    authMode='recover';
    render();
  });
  if (!D.demo)
    window.addEventListener('pageshow', (ev) => {
      if (ev.persisted) refresh();
    });
  app.innerHTML = '<p class="loading">กำลังเปิดระบบสารสนเทศบุคลากร…</p>';
  refresh();
})();
