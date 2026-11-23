'use strict';
window.HRData = (() => {
  const M = MIS,
    cfg = HR_CONFIG,
    demo = cfg.mode === 'demo',
    key = 'rmuti.mis.demo.v1',
    sessionKey = key + '.user';
  let client = null,
    volatile = null,
    memoryOnly = false,
    sessionFallback;
  if (!['demo', 'supabase'].includes(cfg.mode))
    throw Error('กรุณาตรวจ mode ใน config.js');
  function exampleSession() {
    let saved;
    try {
      saved = sessionStorage.getItem(sessionKey);
    } catch {
      saved = sessionFallback;
    }
    return saved === 'out' ? null : saved === M.demoHR ? M.demoHR : M.demoUser;
  }
  function remember(id) {
    sessionFallback = id || 'out';
    try {
      sessionStorage.setItem(sessionKey, sessionFallback);
    } catch {}
  }
  function exampleState() {
    if (memoryOnly) return structuredClone(volatile);
    let saved;
    try {
      saved = localStorage.getItem(key);
    } catch {
      memoryOnly = true;
      volatile = M.seed();
      return structuredClone(volatile);
    }
    if (saved) return JSON.parse(saved);
    const s = M.seed();
    try {
      localStorage.setItem(key, JSON.stringify(s));
    } catch {
      memoryOnly = true;
      volatile = s;
    }
    return structuredClone(s);
  }
  function db() {
    if (client) return client;
    const host = new URL(cfg.supabaseUrl);
    if (
      !cfg.publishableKey.startsWith('sb_publishable_') ||
      !(
        host.protocol === 'https:' ||
        (['localhost', '127.0.0.1'].includes(host.hostname) &&
          host.protocol === 'http:')
      )
    )
      throw Error('ตรวจ Project URL และ Publishable key ใน config.js');
    client = supabase.createClient(host.origin, cfg.publishableKey, {
      auth: { storage: sessionStorage, detectSessionInUrl: true },
    });
    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT')
        setTimeout(() => window.dispatchEvent(new Event('hr-session-ended')),0);
      if (event === 'PASSWORD_RECOVERY')
        setTimeout(() => window.dispatchEvent(new Event('hr-password-recovery')),0);
    });
    return client;
  }
  function ok(response) {
    if (response.error) throw response.error;
    return response.data;
  }
  async function rows(table) {
    const result = [];
    for (;;) {
      const offset = result.length;
      const page = ok(
        await db()
          .from('hr_' + table)
          .select('*')
          .order('id')
          .range(offset, offset + 199),
      );
      if (!page.length) return result;
      result.push(...page);
    }
  }
  function isUniversityEmail(email) {
    const domain = String(cfg.universityEmailDomain || 'rmuti.ac.th').toLowerCase();
    return typeof email === 'string' &&
      email.trim().toLowerCase().split('@').length === 2 &&
      email.trim().toLowerCase().endsWith('@' + domain);
  }
  async function load() {
    if (demo) {
      const id = exampleSession();
      if (!id) return null;
      const s = exampleState(),
        role = s.roles[id],
        any = role === 'hr' || role === 'admin';
      return {
        id,
        role,
        memoryOnly,
        profile: s.profiles.find((p) => p.id === id),
        orgs: s.orgs,
        profiles: s.profiles.filter((p) => any || p.id === id),
        signature: s.signatures.find((p) => p.owner_id === id)?.strokes || [],
        assets: s.assets.filter((r) => r.owner_id === id || any),
        requests: s.requests.filter((r) => r.owner_id === id || any),
        feedback: s.feedback.filter((r) => r.owner_id === id || any),
        orders: s.orders.filter(
          (r) => !r.recipient_id || r.recipient_id === id || any,
        ),
        activities: s.activities,
        registrations: s.registrations.filter((r) => r.owner_id === id || any),
        assessments: s.assessments.filter((r) => r.owner_id === id || any),
        workflows: [], workflowEvents: [], officers: [],
        adminUsers: [], roleAudit: [],
      };
    }
    const session = ok(await db().auth.getSession()).session;
    if (!session) return null;
    if (!isUniversityEmail(session.user.email) || !session.user.email_confirmed_at) {
      await db().auth.signOut({ scope: 'local' });
      throw Error('กรุณายืนยันอีเมลมหาวิทยาลัย @rmuti.ac.th ก่อนเข้าสู่ระบบ');
    }
    const id = session.user.id;
    const membership = ok(
      await db().from('hr_members').select('role').eq('id', id).maybeSingle(),
    );
    if (!membership)
      throw Error(
        'ไม่พบสิทธิ์ใช้งาน กรุณาตรวจสอบว่าได้ยืนยันอีเมลจากลิงก์ที่ส่งไปแล้ว หากยืนยันแล้วให้เข้าสู่ระบบใหม่',
      );
    const adminInfo = membership.role === 'admin'
      ? await Promise.all([
          db().rpc('hr_admin_list_users').then(ok),
          db().from('hr_role_audit').select('id,actor_id,target_id,old_role,new_role,changed_at').order('changed_at',{ascending:false}).limit(50).then(ok),
        ])
      : [[],[]];
    const [
      profiles,
      orgs,
      signature,
      assets,
      requests,
      feedback,
      orders,
      activities,
      registrations,
      assessments,
      workflows,
      workflowEvents,
      officers,
    ] = await Promise.all([
      rows('profiles'),
      rows('orgs'),
      db()
        .from('hr_signatures')
        .select('strokes')
        .eq('owner_id', id)
        .maybeSingle()
        .then(ok),
      rows('assets'),
      rows('requests'),
      rows('feedback'),
      rows('orders'),
      rows('activities'),
      rows('registrations'),
      rows('assessments'),
      rows('document_flows'),
      rows('document_events'),
      db().rpc('hr_workflow_officers').then(ok),
    ]);
    const profile = profiles.find((p) => p.id === id);
    if (!profile)
      throw Error(
        'ยังไม่มีระเบียนข้อมูลส่วนตัว กรุณาให้ HR จัดทำข้อมูลตั้งต้น',
      );
    return {
      id,
      role: membership.role,
      adminUsers: adminInfo[0],
      roleAudit: adminInfo[1],
      profile,
      profiles,
      orgs,
      signature: signature?.strokes || [],
      assets,
      requests,
      feedback,
      orders,
      activities,
      registrations,
      assessments,
      workflows, workflowEvents, officers,
    };
  }
  async function login(email, password) {
    if (demo) {
      remember(email === M.demoHR ? M.demoHR : M.demoUser);
      return;
    }
    if (!isUniversityEmail(email))
      throw Error('กรุณาใช้อีเมลมหาวิทยาลัย @rmuti.ac.th เท่านั้น');
    ok(await db().auth.signInWithPassword({ email: email.trim().toLowerCase(), password }));
  }
  async function signup(payload) {
    if (demo) throw Error('กรุณาใช้โหมดเชื่อม Supabase');
    const email=String(payload.email||'').trim().toLowerCase();
    if (!isUniversityEmail(email))
      throw Error('สมัครได้เฉพาะอีเมลมหาวิทยาลัย @rmuti.ac.th');
    if (typeof payload.password!=='string' || payload.password.length<10)
      throw Error('รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร');
    const prefix=String(payload.prefix||'').trim();
    const first_name=String(payload.first_name||'').trim();
    const last_name=String(payload.last_name||'').trim();
    if (!['นาย','นาง','นางสาว','ดร.','ผศ.','รศ.','ศ.'].includes(prefix) ||
        !first_name || !last_name || first_name.length>80 || last_name.length>80)
      throw Error('กรุณากรอกชื่อ-นามสกุลให้ครบและถูกต้อง');
    const redirect=window.location.origin+window.location.pathname;
    const result=ok(await db().auth.signUp({
      email,
      password:payload.password,
      options:{
        emailRedirectTo:redirect,
        data:{prefix,first_name,last_name}
      }
    }));
    // If Confirm email has accidentally been disabled, fail closed in UI and DB.
    if (result?.session) {
      await db().auth.signOut({scope:'local'});
      throw Error('โปรดให้ผู้ดูแลเปิด Confirm email ใน Supabase ก่อนใช้งานระบบสมัครเอง');
    }
    return {sent:true};
  }
  async function resetPassword(email) {
    if (demo) throw Error('กรุณาใช้ระบบจริง');
    if (!isUniversityEmail(email))
      throw Error('กรุณาใช้อีเมลมหาวิทยาลัย @rmuti.ac.th เท่านั้น');
    ok(await db().auth.resetPasswordForEmail(email.trim().toLowerCase(),{
      redirectTo:window.location.origin+window.location.pathname
    }));
  }
  async function updatePassword(password) {
    if (demo) throw Error('กรุณาใช้ระบบจริง');
    if (typeof password!=='string' || password.length<10)
      throw Error('รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร');
    ok(await db().auth.updateUser({password}));
  }
  async function logout() {
    if (demo) remember(null);
    else ok(await db().auth.signOut({ scope: 'local' }));
  }
  function exampleUpdate(action, p) {
    const run = () => {
      const s = exampleState(),
        user = exampleSession(),
        now = new Date().toISOString();
      if (!user) throw Error('กรุณาเข้าสู่ระบบ');
      if (
        ['process', 'order', 'activity', 'asset'].includes(action) &&
        !['hr','admin'].includes(s.roles[user])
      )
        throw Error('เฉพาะเจ้าหน้าที่ HR');
      const record = { id: M.uuid(), owner_id: user, created_at: now };
      switch (action) {
        case 'profile':
          Object.assign(
            s.profiles.find((row) => row.id === user),
            p,
          );
          break;
        case 'signature':
          s.signatures = s.signatures.filter((row) => row.owner_id !== user);
          if (p.strokes.length)
            s.signatures.push({ owner_id: user, strokes: p.strokes });
          break;
        case 'feedback':
          s.feedback.push({ ...record, ...p });
          break;
        case 'assessment':
          if (
            s.assessments.some(
              (r) => r.owner_id === user && r.period === p.period,
            )
          )
            throw Error('ส่งผลงานของรอบนี้แล้ว');
          s.assessments.push({ ...record, ...p });
          break;
        case 'request':
          if (
            s.requests.some((row) => row.id === p.id && row.owner_id === user)
          )
            return;
          s.requests.push({
            ...record,
            ...p,
            number: Math.max(0, ...s.requests.map((r) => r.number)) + 1,
            status: 'submitted',
            note: '',
            updated_at: now,
          });
          break;
        case 'process': {
          const r = s.requests.find((row) => row.id === p.id);
          if (
            !r ||
            r.status !== p.previous ||
            !M.transitions[r.status].includes(p.status)
          )
            throw Error('สถานะคำขอเปลี่ยนแล้ว กรุณาโหลดใหม่');
          Object.assign(r, { status: p.status, note: p.note, updated_at: now });
          if (p.fileData) r.document_path = p.fileData;
          break;
        }
        case 'order':
          if (s.orders.some((r) => r.number === p.number))
            throw Error('เลขที่คำสั่งนี้มีแล้ว');
          s.orders.push({ id: record.id, ...p });
          break;
        case 'activity':
          s.activities.push({ id: record.id, ...p, taken: 0 });
          break;
        case 'asset':
          if (s.assets.some((r) => r.code === p.code))
            throw Error('เลขทะเบียนครุภัณฑ์ซ้ำ');
          s.assets.push({ id: record.id, ...p });
          break;
        case 'join':
        case 'cancel': {
          const a = s.activities.find((row) => row.id === p.activity_id);
          if (!a || new Date(a.starts_at) <= new Date())
            throw Error('กิจกรรมเริ่มแล้ว');
          const reg = s.registrations.find(
            (r) => r.owner_id === user && r.activity_id === a.id,
          );
          if (action === 'join') {
            if (reg || a.taken >= a.capacity)
              throw Error('ลงทะเบียนแล้วหรือที่นั่งเต็ม');
            s.registrations.push({ ...record, activity_id: a.id });
            a.taken++;
          } else {
            if (!reg) throw Error('ไม่พบการลงทะเบียน');
            s.registrations = s.registrations.filter((r) => r.id !== reg.id);
            a.taken--;
          }
          break;
        }
        default:
          throw Error('ไม่พบรายการ');
      }
      if (memoryOnly) {
        volatile = s;
        return;
      }
      try {
        localStorage.setItem(key, JSON.stringify(s));
      } catch {
        throw Error(
          'พื้นที่ตัวอย่างในเบราว์เซอร์เต็ม กรุณาใช้ไฟล์ PDF ที่เล็กลง',
        );
      }
    };
    return navigator.locks ? navigator.locks.request(key, run) : run();
  }
  async function save(action, p, user, file) {
    if (file) {
      const limit = demo ? 512 * 1024 : 5 * 1024 * 1024;
      if (
        file.size > limit ||
        !file.size ||
        (await file.slice(0, 5).text()) !== '%PDF-'
      )
        throw Error('กรุณาเลือก PDF ขนาดไม่เกิน ' + (demo ? '512 KB' : '5 MB'));
      if (demo)
        p.fileData = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
    }
    if (demo) return exampleUpdate(action, p);
    const c = db(),
      table = (name) => c.from('hr_' + name);
    const ownUpdate = async (q) => {
      if (!ok(await q.select().maybeSingle()))
        throw Error('รายการเปลี่ยนไปหรือไม่มีสิทธิ์ กรุณาโหลดใหม่');
    };
    switch (action) {
      case 'profile':
        return ownUpdate(table('profiles').update(p).eq('id', user));
      case 'signature':
        return p.strokes.length
          ? ok(
              await table('signatures').upsert(
                { owner_id: user, strokes: p.strokes },
                { onConflict: 'owner_id' },
              ),
            )
          : ok(await table('signatures').delete().eq('owner_id', user));
      case 'request': {
        const response = await table('requests').insert(p);
        if (response.error?.code !== '23505') return ok(response);
        const existing = ok(
          await table('requests')
            .select('id')
            .eq('id', p.id)
            .eq('owner_id', user)
            .eq('kind', p.kind)
            .eq('purpose', p.purpose)
            .eq('copies', p.copies)
            .maybeSingle(),
        );
        if (!existing) throw Error('กรุณาตรวจสอบคำขอล่าสุดก่อนยื่นอีกครั้ง');
        return;
      }
      case 'process': {
        const update = { status: p.status, note: p.note };
        if (file) {
          // เอกสาร PDF จัดเก็บใน Google Drive โดย Edge Function ที่ตรวจสอบบทบาท HR
          // Edge Function จะบันทึกสถานะและรหัสไฟล์ลง Supabase เมื่ออัปโหลดสำเร็จ
          const body = new FormData();
          body.append('action', 'upload');
          body.append('request_id', p.id);
          body.append('previous', p.previous);
          body.append('note', p.note);
          body.append('file', file, 'certificate.pdf');
          const result = await c.functions.invoke('hr-drive-document', { body });
          if (result.error) {
            let errorText = 'ไม่สามารถอัปโหลดเอกสารไป Google Drive ได้';
            try {
              const problem = await result.error.context?.json();
              if (problem?.error) errorText = problem.error;
            } catch {}
            throw Error(errorText);
          }
          return result.data;
        }
        return ownUpdate(
          table('requests')
            .update(update)
            .eq('id', p.id)
            .eq('status', p.previous),
        );
      }
      case 'cancel':
        return ownUpdate(
          table('registrations')
            .delete()
            .eq('activity_id', p.activity_id)
            .eq('owner_id', user),
        );
      default: {
        const dest = {
          feedback: 'feedback',
          assessment: 'assessments',
          order: 'orders',
          activity: 'activities',
          asset: 'assets',
          join: 'registrations',
        }[action];
        if (!dest) throw Error('ไม่พบรายการ');
        return ok(await table(dest).insert(p));
      }
    }
  }
  async function setUserRole(userId, role) {
    if (demo) throw Error('การกำหนดสิทธิ์ทำได้ในระบบจริงเท่านั้น');
    if (!['admin','hr','staff'].includes(role)) throw Error('บทบาทไม่ถูกต้อง');
    return ok(await db().rpc('hr_admin_set_role', {
      p_user_id:userId, p_role:role,
    }));
  }
  async function proposeDocument(p) {
    if (demo) throw Error('ระบบเสนอเอกสารต้องใช้บัญชี Supabase จริง');
    return ok(await db().rpc('hr_propose_document', {
      p_title:p.title,p_content:p.content,p_reviewer:p.reviewer_id,
      p_approver:p.approver_id,p_signer:p.signer_id
    }));
  }
  async function advanceDocument(p) {
    if (demo) throw Error('ระบบเสนอเอกสารต้องใช้บัญชี Supabase จริง');
    return ok(await db().rpc('hr_advance_document', {
      p_id:p.id,p_action:p.action,p_note:p.note||'',p_expected_revision:p.revision
    }));
  }
  async function reviseDocument(p) {
    if (demo) throw Error('ระบบเสนอเอกสารต้องใช้บัญชี Supabase จริง');
    return ok(await db().rpc('hr_resubmit_document', {
      p_id:p.id,p_content:p.content,p_note:p.note||'',p_expected_revision:p.revision
    }));
  }
  async function download(r) {
    if (demo) return (await fetch(r.document_path)).blob();
    if (!r.document_path?.startsWith('drive:'))
      throw Error('ไฟล์นี้ยังไม่เชื่อมกับ Google Drive');
    const result = await db().functions.invoke('hr-drive-document', {
      body: { action: 'download', request_id: r.id },
    });
    if (result.error) {
      let errorText = 'ไม่สามารถดาวน์โหลดเอกสารได้';
      try {
        const problem = await result.error.context?.json();
        if (problem?.error) errorText = problem.error;
      } catch {}
      throw Error(errorText);
    }
    return result.data;
  }
  function message(e) {
    if (e?.code === '23505') return 'รายการนี้มีอยู่แล้ว กรุณาตรวจสอบข้อมูล';
    if (e?.code === '42501') return 'สิทธิ์ของบัญชีไม่อนุญาตให้ทำรายการนี้';
    if (e?.message === 'Invalid login credentials')
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    return e?.message || 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง';
  }
  return { demo, load, save, login, signup, resetPassword, updatePassword, logout, download, message, proposeDocument, advanceDocument, reviseDocument, setUserRole };
})();
