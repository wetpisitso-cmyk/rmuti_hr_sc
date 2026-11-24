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
    dialog.classList.remove('public-info-dialog');
    dialog.removeAttribute('aria-labelledby');
    document.querySelector('#dialog-body').innerHTML =
      '<button type="button" data-action="close" class="dialog-x iconbtn no-print" aria-label="ปิดหน้าต่าง">' +
      V.ic('close') +
      '</button>' +
      body +
      '<div id="dialog-status" role="status" aria-live="polite"></div>';
    if (!dialog.open) dialog.showModal();
  }
  dialog.addEventListener('close', () => {
    if (!dialog.open) {
      document.querySelector('#dialog-body').replaceChildren();
      dialog.classList.remove('public-info-dialog');
      dialog.removeAttribute('aria-labelledby');
    }
  });
  function render() {
    document.body.classList.remove('menu-open');
    if (dialog.open) dialog.close();
    if (!data || authMode==='recover') {
      app.innerHTML = V.login(authMode);
      document.title = 'HR KKC | ระบบบริหารงานบุคคล';
      return;
    }
    const route = location.hash.slice(1);
    page = Object.hasOwn(M.pages, route) ? route : 'profile';
    if (page==='admin'&&data.role!=='admin') page='home';
    if(page==='executive'&&data.role!=='admin'&&!(data.duties||[]).includes('executive'))page='home';
    if (['hr','directory'].includes(page) && !['hr','admin'].includes(data.role)) page = 'home';
    app.innerHTML = V.layout(data, page, V.page(data, page, adminTab));
    document.title = M.pages[page] + ' | HR KKC';
    if (page === 'signature') setupSignature();
    if (page === 'executive') renderExecutive();
  }
  async function renderExecutive(){
    const el=document.getElementById('executive-summary');
    if(!el||!data||(data.role!=='admin'&&!(data.duties||[]).includes('executive')))return;
    try{
      const x=await D.executiveSummary();
      if(!el.isConnected)return;
      const e=M.esc;
      const k=(label,n)=>'<div class="executive-kpi"><span>'+e(label)+'</span><strong>'+e(Number(n||0).toLocaleString('th-TH'))+'</strong></div>';
      const chart=(label,rows)=>{
        const list=Array.isArray(rows)?rows:[];
        const max=Math.max(1,...list.map(r=>Number(r.n)||0));
        return '<section class="executive-chart"><h3>'+e(label)+'</h3>'+(list.length?list.map(r=>'<div class="executive-row"><div><span>'+e(M.stages[r.label]||r.label)+'</span><b>'+e(r.n)+'</b></div><div class="executive-track"><i style="width:'+Math.max(0,Math.min(100,Number(r.n)/max*100))+'%"></i></div></div>').join(''):'<p>ยังไม่มีข้อมูล</p>')+'</section>';
      };
      el.innerHTML='<div class="executive-intro"><b>RMUTI KKC · ภาพรวมงานบริหารบุคคล</b><p>ข้อมูลบัญชีที่ยืนยันแล้ว ไม่ใช่จำนวนอัตรากำลังราชการทั้งหมด · ณ '+e(M.date(x.as_of,true))+'</p></div>'+
      '<div class="executive-kpis">'+k('บัญชีบุคลากร',x.accounts)+k('คำขอค้างดำเนินการ',x.open_requests)+k('เอกสารรอพิจารณา',x.pending_documents)+k('หนังสือพร้อมรับ / รับแล้ว',x.issued_requests)+k('ชั่วโมงพัฒนาที่ตรวจสอบแล้ว',x.training_hours)+k('เอกสารลงนามภายใน',x.signed_documents)+'</div>'+
      '<div class="executive-charts">'+chart('แยกตามคณะ / หน่วยงาน',x.faculties)+chart('ประเภทบุคลากร',x.staff_types)+chart('สายงาน',x.tracks)+chart('วุฒิสูงสุดที่ HR ตรวจสอบแล้ว',x.education)+chart('สถานะคำขอ',x.requests)+'</div>'+
      '<h3>ข้อมูลและงานที่ต้องติดตาม</h3><div class="executive-kpis">'+k('ยังไม่ระบุสังกัด',x.missing_org)+k('ยังไม่ระบุตำแหน่ง',x.missing_position)+k('ประวัติอบรมรอตรวจ',x.training_pending)+k('วุฒิรอตรวจ',x.education_pending)+k('ตำแหน่งรอตรวจ',x.positions_pending)+'</div>'+
      '<p class="intro">รายงานสรุปเท่านั้น ไม่แสดงชื่อบุคลากร เงินเดือน หรือรายละเอียดเอกสาร</p>'+(data.role==='admin'?'<button type="button" class="btn light" data-action="drive-health">ตรวจสอบการเชื่อมต่อพื้นที่เอกสาร</button>':'');
    }catch(err){if(el.isConnected)el.textContent=D.message(err);}
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
    if(kind==='salary-draft'){
      if(!['hr','admin'].includes(data?.role))throw Error('เฉพาะ HR');
      const r=data.requests.find(v=>v.id===form.dataset.id);
      if(!r)throw Error('ไม่พบคำขอ');
      const x=salaryFormValues(form);
      await D.saveSalaryDraft(r.id,x,V.salaryContent(x));
      await refresh();
      if(data)modal(V.salaryEditor(data,data.requests.find(v=>v.id===r.id)));
      toast('บันทึกฉบับร่างแล้ว');return;
    }
    if(kind==='history-submit'){
      if(!data)throw Error('กรุณาเข้าสู่ระบบ');
      if(vals.end_on&&vals.end_on<vals.start_on)throw Error('วันที่สิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
      await D.submitHistory(form.dataset.kind,vals);
      await refresh();toast('ส่งประวัติให้ HR ตรวจสอบแล้ว');return;
    }
    if(kind==='history-review'){
      if(!['hr','admin'].includes(data?.role))throw Error('เฉพาะ HR');
      if(vals.status==='returned'&&(vals.review_note||'').length<5)throw Error('กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร');
      await D.reviewHistory(form.dataset.kind,form.dataset.id,vals.status,vals.review_note);
      await refresh();toast('บันทึกผลตรวจสอบแล้ว');return;
    }
    if (kind === 'training-submit') {
      if(!data) throw Error('กรุณาเข้าสู่ระบบ');
      await D.submitTraining(vals);
      await refresh();
      toast('ส่งประวัติการพัฒนาบุคลากรแล้ว');
      return;
    }
    if (kind === 'training-review') {
      if(!['hr','admin'].includes(data?.role)) throw Error('เฉพาะเจ้าหน้าที่ HR');
      if(vals.status==='returned' && (vals.review_note||'').length<5) throw Error('กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร');
      await D.reviewTraining(form.dataset.id, vals.status, vals.review_note);
      await refresh();
      toast('บันทึกผลการตรวจสอบแล้ว');
      return;
    }
    if(kind==='duties-find'){
      if(data?.role!=='admin')throw Error('เฉพาะ ADMIN');
      const u=(data.adminUsers||[]).find(x=>x.email.toLowerCase()===String(vals.email||'').trim().toLowerCase());
      if(!u)throw Error('ไม่พบบัญชีที่ยืนยันอีเมลแล้ว');
      return action('edit-duties',u.id);
    }
    if(kind==='duties-save'){
      if(data?.role!=='admin')throw Error('เฉพาะ ADMIN');
      const u=(data.adminUsers||[]).find(x=>x.id===form.dataset.id);
      if(!u||u.id===data.id)throw Error('ไม่สามารถเปลี่ยนสิทธิ์บัญชีนี้');
      const selected=new FormData(form).getAll('duty');
      if(!window.confirm('ยืนยันกำหนดหน้าที่ของ '+u.email+' เป็น '+(selected.join(', ')||'ไม่มีสิทธิ์เสริม')+'?'))return;
      await D.setDuties(u.email,selected);dialog.close();await refresh();toast('บันทึกสิทธิ์เฉพาะหน้าที่แล้ว');return;
    }
    if (kind === 'assign-email-role') {
      if (data?.role!=='admin') throw Error('เฉพาะผู้ดูแลระบบ ADMIN');
      const email = String(vals.email||'').trim().toLowerCase();
      const role = vals.role;
      if (!/^[^\s@]+@rmuti\.ac\.th$/.test(email)) throw Error('กรุณากรอกอีเมล @rmuti.ac.th');
      if (!['staff','hr','admin'].includes(role)) throw Error('สิทธิ์ไม่ถูกต้อง');
      const user = (data.adminUsers||[]).find(x=>x.email?.toLowerCase()===email);
      if (user?.id===data.id) throw Error('ไม่สามารถเปลี่ยนสิทธิ์ของตนเอง');
      if (!window.confirm('ยืนยันกำหนดสิทธิ์ '+email+' เป็น '+({staff:'USER',hr:'HR',admin:'ADMIN'}[role])+'?')) return;
      const status = await D.assignEmailRole(email,role);
      await refresh();
      toast(status==='pending'?'บันทึกสิทธิ์รอการสมัครและยืนยันอีเมลแล้ว (30 วัน)':'กำหนดสิทธิ์บัญชีเรียบร้อยแล้ว');
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
    const scope=ev.target.dataset.tableSearch;
    if(scope){
      const q=ev.target.value.trim().toLowerCase();
      document.getElementById(scope)?.querySelectorAll('tbody tr').forEach(tr=>{
        tr.hidden=!tr.textContent.toLowerCase().includes(q);
      });
      return;
    }
    if (ev.target.name === 'search')
      document.querySelector('#results').innerHTML = V.orderTable(
        data,
        page,
        ev.target.value,
      );
  });
  function salaryFormValues(form){
    const x=Object.fromEntries(new FormData(form));
    for(const k of Object.keys(x))x[k]=String(x[k]).trim();
    if(!form.reportValidity())throw Error('กรุณากรอกข้อมูลหนังสือให้ครบ');
    if(!Number.isFinite(Number(x.salary))||Number(x.salary)<=0)throw Error('กรุณากรอกเงินเดือนจริง');
    x.signer_name=(data.officers||[]).find(o=>o.id===x.signer_id)?.display_name||'';
    return x;
  }
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
      case 'drive-health': {
        if(data?.role!=='admin')throw Error('เฉพาะ ADMIN');
        const r=await D.driveCheck();
        toast(r?.writable?'เชื่อมต่อโฟลเดอร์ได้ และมีสิทธิ์เพิ่มไฟล์ (ยังไม่ได้ทดสอบอัปโหลด)':'เชื่อมต่อได้ แต่ไม่มีสิทธิ์เพิ่มไฟล์');
        return;
      }
      case 'reload':
        await refresh();
        return;
      case 'login-home':
        if(authMode!=='recover'){authMode='login';render();}
        return;
      case 'toggle-login-password': {
        const input=document.getElementById('campus-password');
        if(!input)return;
        const reveal=input.type==='password';
        input.type=reveal?'text':'password';
        const control=document.querySelector('[data-action="toggle-login-password"]');
        if(control){
          control.setAttribute('aria-pressed',String(reveal));
          control.setAttribute('aria-label',reveal?'ซ่อนรหัสผ่าน':'แสดงรหัสผ่าน');
        }
        return;
      }
      case 'public-login-info': {
        if(!['home','services','privacy','terms','contact','help'].includes(id))return;
        const body=V.publicLoginInfo(id);
        if(!body)return;
        modal(body);
        dialog.classList.add('public-info-dialog');
        dialog.setAttribute('aria-labelledby','public-info-title');
        return;
      }
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
      case 'salary-editor': {
        if(!['hr','admin'].includes(data?.role))throw Error('เฉพาะ HR');
        const r=data.requests.find(v=>v.id===id);
        if(!r||r.kind!=='salary'||!['submitted','review'].includes(r.status))throw Error('คำขอไม่อยู่ในขั้นจัดทำ');
        modal(V.salaryEditor(data,r));return;
      }
      case 'salary-preview': {
        if(!['hr','admin'].includes(data?.role))throw Error('เฉพาะ HR');
        const r=data.requests.find(v=>v.id===id);
        const form=dialog.querySelector('form[data-form="salary-draft"]');
        if(!r||!form)throw Error('ไม่พบฉบับร่าง');
        const x=salaryFormValues(form);
        await D.saveSalaryDraft(id,x,V.salaryContent(x));
        await refresh();
        if(data)modal(V.salaryPreview(data,r,x));
        return;
      }
      case 'salary-print':
        if(!['hr','admin'].includes(data?.role)||!dialog.querySelector('.salary-paper'))throw Error('ไม่พบฉบับร่าง');
        if(document.fonts)await document.fonts.ready;
        window.print();return;
      case 'salary-submit': {
        if(!['hr','admin'].includes(data?.role))throw Error('เฉพาะ HR');
        const form=dialog.querySelector('form[data-form="salary-draft"]');
        if(!form)throw Error('ไม่พบฉบับร่าง');
        const x=salaryFormValues(form);
        if(!x.number||!x.signer_position||!x.reviewer_id||!x.approver_id||!x.signer_id)throw Error('กรุณาระบุเลขหนังสือ ตำแหน่งผู้ลงนาม และผู้รับผิดชอบครบ 3 คน');
        if(new Set([data.id,x.reviewer_id,x.approver_id,x.signer_id]).size!==4)throw Error('ผู้เสนอ ผู้ตรวจสอบ ผู้อนุมัติ และผู้ลงนามต้องต่างบัญชี');
        if(!window.confirm('ยืนยันเสนอฉบับร่างเพื่อพิจารณา?'))return;
        await D.saveSalaryDraft(id,x,V.salaryContent(x));
        await refresh();
        const saved=data?.salaryDrafts?.find(v=>v.id===id);
        if(!saved)throw Error('ไม่พบฉบับร่างที่บันทึก');
        if(saved.content!==V.salaryContent(x))throw Error('ฉบับร่างเปลี่ยนแปลง กรุณาตรวจสอบใหม่');
        const doc=await D.submitSalaryDraft(id,saved.updated_at,x.reviewer_id,x.approver_id,x.signer_id);
        await refresh();
        const row=data?.workflows?.find(v=>v.id===doc);
        if(row)modal(HRWorkflow.detail(data,row));
        toast('เสนอเอกสารแล้ว');return;
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
        if (!['hr','admin'].includes(data?.role)) throw Error('เฉพาะเจ้าหน้าที่ HR');
        adminTab = id;
        render();
        return;
      case 'cancel-email-role': {
        if (data?.role!=='admin') throw Error('เฉพาะผู้ดูแลระบบ ADMIN');
        const email = String(id||'').toLowerCase();
        if (!(data.pendingEmailRoles||[]).some(p=>p.email===email))
          throw Error('ไม่พบรายการรออนุญาต');
        if (!window.confirm('ยืนยันยกเลิกรายการรอสิทธิ์ '+email+'?')) return;
        await D.cancelPendingEmailRole(email);
        await refresh();
        toast('ยกเลิกรายการรอสิทธิ์แล้ว');
        return;
      }
      case 'history-review':
      case 'history-withdraw': {
        const [kind,key]=String(id).split(':');
        if(!['education','positions'].includes(kind))throw Error('ประเภทไม่ถูกต้อง');
        const r=((kind==='education'?data.educationRecords:data.positionRecords)||[]).find(x=>x.id===key);
        if(!r||r.status!=='submitted')throw Error('ไม่พบรายการรอตรวจสอบ');
        if(name==='history-withdraw'){
          if(r.owner_id!==data.id)throw Error('ไม่มีสิทธิ์');
          if(!window.confirm('ยืนยันถอนรายการ?'))return;
          await D.withdrawHistory(kind,key);await refresh();toast('ถอนรายการแล้ว');return;
        }
        if(!['hr','admin'].includes(data.role)||r.owner_id===data.id)throw Error('ไม่มีสิทธิ์ตรวจสอบ');
        const info=kind==='education'?[r.level,r.qualification,r.major,r.institution,r.graduation_year]:[r.position_title,r.organization,r.appointment_kind,M.date(r.start_on),r.end_on?M.date(r.end_on):'ยังดำรงอยู่',r.order_ref];
        modal('<h2>ตรวจสอบประวัติบุคลากร</h2><p>'+M.esc(M.person(data.profiles.find(x=>x.id===r.owner_id)))+'</p><p>'+info.map(x=>M.esc(x)).join(' · ')+'</p><p>'+M.esc(r.note||'ไม่มีหมายเหตุ')+'</p>'+
        '<form data-form="history-review" data-kind="'+kind+'" data-id="'+M.esc(key)+'"><label class="field"><span>ผลตรวจสอบ</span><select name="status"><option value="reviewed">ตรวจสอบแล้ว</option><option value="returned">ส่งคืนแก้ไข</option></select></label><label class="field"><span>หมายเหตุ</span><textarea name="review_note" maxlength="1000" rows="3"></textarea></label><div class="actions"><button class="btn primary" type="submit">บันทึกผล</button></div></form>');
        return;
      }
      case 'training-review': {
        if(!['hr','admin'].includes(data?.role)) throw Error('เฉพาะเจ้าหน้าที่ HR');
        const r=(data.trainingRecords||[]).find(x=>x.id===id);
        if(!r||r.status!=='submitted'||r.owner_id===data.id) throw Error('ไม่มีสิทธิ์ตรวจสอบรายการนี้');
        const profile=data.profiles.find(x=>x.id===r.owner_id);
        modal('<h2>ตรวจประวัติการพัฒนาบุคลากร</h2>'+
          '<p><b>'+M.esc(r.title)+'</b></p><p>'+M.esc(M.person(profile))+' · '+M.esc(r.organizer)+' · '+M.esc(M.date(r.completed_on))+' · '+M.esc(r.hours)+' ชั่วโมง</p>'+
          '<p class="multiline">'+M.esc(r.note||'ไม่มีหมายเหตุ')+'</p>'+
          '<form data-form="training-review" data-id="'+M.esc(id)+'">'+
          '<label class="field"><span>ผลการตรวจสอบ</span><select name="status"><option value="reviewed">ตรวจสอบแล้ว</option><option value="returned">ส่งคืนแก้ไข</option></select></label>'+
          '<label class="field"><span>หมายเหตุ / เหตุผล</span><textarea name="review_note" maxlength="1000" rows="3"></textarea></label>'+
          '<div class="actions"><button class="btn primary" type="submit">บันทึกผล</button></div></form>');
        return;
      }
      case 'training-withdraw': {
        const r=(data?.trainingRecords||[]).find(x=>x.id===id);
        if(!r||r.owner_id!==data.id||r.status!=='submitted') throw Error('ถอนรายการไม่ได้');
        if(!window.confirm('ยืนยันถอนประวัติอบรมที่รอตรวจสอบ?')) return;
        await D.withdrawTraining(id);
        await refresh();
        toast('ถอนรายการแล้ว');
        return;
      }
      case 'export-directory': {
        if(!['hr','admin'].includes(data?.role)) throw Error('เฉพาะ HR และ ADMIN');
        const t=document.querySelector('#personnel-directory table');
        if(!t) throw Error('ไม่มีข้อมูลสำหรับส่งออก');
        const rows=[...t.querySelectorAll('tr')].filter(tr=>!tr.hidden);
        if(rows.length<2) throw Error('ไม่มีรายการที่ตรงกับการค้นหา');
        const cell=v=>{
          let s=String(v??'').trim();
          if(/^[=+@\-]/.test(s)) s="'"+s;
          return '"'+s.replace(/"/g,'""')+'"';
        };
        const csv='\uFEFF'+rows.map(tr=>[...tr.cells].map(td=>cell(td.textContent)).join(',')).join('\r\n');
        const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
        const a=document.createElement('a');
        a.href=url;a.download='RMUTI-KKC-personnel.csv';a.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
        return;
      }
      case 'edit-duties': {
        if(data?.role!=='admin')throw Error('เฉพาะ ADMIN');
        const u=(data.adminUsers||[]).find(x=>x.id===id);
        if(!u||id===data.id)throw Error('ไม่สามารถเปลี่ยนสิทธิ์บัญชีนี้');
        const ds=(data.allDuties||[]).filter(x=>x.member_id===id).map(x=>x.duty);
        const labels={reviewer:'REVIEWER — ผู้ตรวจสอบ',approver:'APPROVER — ผู้อนุมัติ',signer:'SIGNER — ผู้มีอำนาจลงนาม',executive:'EXECUTIVE — ผู้บริหาร'};
        modal('<h2>กำหนดสิทธิ์เฉพาะหน้าที่</h2><p>'+M.esc(u.display_name||u.email)+' · '+M.esc(u.email)+'</p><form data-form="duties-save" data-id="'+M.esc(id)+'"><div class="duty-choices">'+Object.entries(labels).map(([k,v])=>'<label><input type="checkbox" name="duty" value="'+k+'" '+(ds.includes(k)?'checked':'')+'><span>'+M.esc(v)+'</span></label>').join('')+'</div><p class="intro">โปรดตรวจสอบคำสั่งมอบอำนาจก่อนให้สิทธิ์ ระบบจะไม่เพิ่มสิทธิ์ HR ให้อัตโนมัติ</p><button type="submit" class="btn primary">บันทึกหน้าที่</button></form>');return;
      }
      case 'save-role': {
        if (data?.role !== 'admin') throw Error('เฉพาะผู้ดูแลระบบ ADMIN');
        if (id === data.id) throw Error('ไม่สามารถเปลี่ยนบทบาทบัญชีของตนเอง');
        const field = [...document.querySelectorAll('[data-role-target]')]
          .find(el=>el.dataset.roleTarget===id);
        if (!field) throw Error('ไม่พบบัญชีผู้ใช้');
        const user = (data.adminUsers||[]).find(x=>x.id===id);
        if (!user || !['staff','hr','admin'].includes(field.value))
          throw Error('บทบาทไม่ถูกต้อง');
        if (user.role===field.value) { toast('ยังไม่มีการเปลี่ยนสิทธิ์');return; }
        const labels={staff:'USER',hr:'HR',admin:'ADMIN'};
        if (!window.confirm('ยืนยันเปลี่ยนสิทธิ์ '+user.email+' จาก '+labels[user.role]+' เป็น '+labels[field.value]+'?'))
          return;
        await D.setUserRole(id,field.value);
        await refresh();
        toast('เปลี่ยนสิทธิ์เรียบร้อย พร้อมบันทึกประวัติแล้ว');
        return;
      }
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
