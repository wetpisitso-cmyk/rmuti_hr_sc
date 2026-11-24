'use strict';
window.HRViews = (() => {
  const M = MIS,
    e = M.esc;
  const paths = {
    refresh: 'M20 10a8 8 0 1 0 0 6 M20 4v6h-6',
    home: 'M3 10l9-7 9 7 M5 9v11h5v-7h4v7h5V9',
    user: 'M16 7a4 4 0 1 1-8 0 4 4 0 1 1 8 0 M4 21v-2a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v2',
    cert: 'M3 5h18v13H3z M8 21h8 M12 18v3 M7 9h4 M7 13h8',
    file: 'M5 3h9l5 5v13H5z M14 3v6h5 M8 13h8 M8 17h6',
    calendar: 'M3 6h18v15H3z M3 11h18 M8 3v6 M16 3v6',
    performance: 'M3 20V4 M3 20h18 M7 16v-4 M12 16V7 M17 16v-6',
    globe:
      'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0 M2 12h20 M12 2q-8 10 0 20 M12 2q8 10 0 20',
    help: 'M3 4q5-1 9 2 5-3 9-2v15q-5-1-9 2-5-3-9-2z M12 6v15',
    shield: 'M12 2l8 3v6q0 7-8 11-8-4-8-11V5z M8 12l3 3 5-6',
    contact: 'M3 5h18v14H3z M3 6l9 7 9-7',
    logout: 'M10 4H4v16h6 M9 12h12 M16 7l5 5-5 5',
    chev: 'M8 10l4 4 4-4',
    arrow: 'M8 5l7 7-7 7',
    brief: 'M3 7h18v13H3z M8 7V4h8v3 M3 12q9 6 18 0',
    pen: 'M4 20l4-1L21 6l-4-4L4 15z M14 5l5 5',
    box: 'M3 7l9-5 9 5-9 5z M3 7v10l9 5 9-5V7 M12 12v10',
    check: 'M4 12l5 5L20 6',
    info: 'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0 M12 11v6 M12 7v1',
    menu: 'M3 6h18 M3 12h18 M3 18h18',
    close: 'M5 5l14 14 M19 5L5 19',
    list: 'M4 6h2 M9 6h11 M4 12h2 M9 12h11 M4 18h2 M9 18h11',
    clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0 M12 5v8l5 3',
    search: 'M17 10a7 7 0 1 1-14 0 7 7 0 1 1 14 0 M15 16l6 6',
    print: 'M7 8V3h10v5 M7 17H3V9h18v8h-4 M7 14h10v7H7z',
    swap: 'M3 7h17l-4-4 M21 17H4l4 4',
    save: 'M3 3h15l3 3v15H3z M7 3v6h9V3 M7 21v-8h10v8',
    tag: 'M3 3h9l10 10-9 9L3 12z M7 7h1',
    plus: 'M12 4v16 M4 12h16',
    download: 'M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4',
  };
  const ic = (name, size = 18) =>
    '<svg aria-hidden="true" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="' +
    (paths[name] || paths.file) +
    '"/></svg>';
  const profileIcons = ['user', 'pen', 'box', 'shield', 'list'];
  const link = (id, label, cls = '', icon = '') =>
    '<a href="#' +
    id +
    '" class="' +
    cls +
    '">' +
    (icon ? ic(icon) : '') +
    e(label || M.pages[id]) +
    '</a>';
  const badge = (v) =>
    '<span class="badge ' +
    e(v) +
    '"><i></i>' +
    e(M.stages[v] || v) +
    '</span>';
  const btn = (label, action, id = '', cls = 'light', icon = '') =>
    '<button type="button" class="btn ' +
    cls +
    '" data-action="' +
    action +
    '" data-id="' +
    e(id) +
    '">' +
    (icon ? ic(icon, 16) : '') +
    e(label) +
    '</button>';
  const field = (label, body) =>
    '<label class="field"><span>' + e(label) + '</span>' + body + '</label>';
  const input = (name, attrs = '') =>
    '<input name="' + name + '" ' + attrs + '>';
  const area = (name, max = 600) =>
    '<textarea name="' +
    name +
    '" maxlength="' +
    max +
    '" required rows="3"></textarea>';
  const select = (name, options, attr = '') =>
    '<select name="' + name + '" ' + attr + '>' + options + '</select>';
  const opt = (v, t, selected = false) =>
    '<option value="' +
    e(v) +
    '"' +
    (selected ? ' selected' : '') +
    '>' +
    e(t) +
    '</option>';
  const values = (name, items, v) =>
    select(
      name,
      opt('', 'กรุณาเลือก') + items.map((x) => opt(x, x, x === v)).join(''),
      'required',
    );
  const saveButton = (label = 'บันทึกข้อมูล', icon = 'save') =>
    '<div class="actions"><button class="btn primary" type="submit">' +
    ic(icon, 16) +
    e(label) +
    '</button></div>';
  const panel = (title, body, aside = '') =>
    '<section class="panel"><div class="panel-title"><h2>' +
    e(title) +
    '</h2>' +
    aside +
    '</div>' +
    body +
    '</section>';
  const empty = (t) =>
    '<div class="empty">' + ic('list', 24) + '<span>' + e(t) + '</span></div>';
  const note = (t, cls = '') =>
    '<div class="note ' +
    cls +
    '">' +
    ic('info', 18) +
    '<span>' +
    e(t) +
    '</span></div>';
  const table = (head, rows, none) =>
    rows.length
      ? '<div class="table-wrap"><table><thead><tr>' +
        head.map((h) => '<th scope="col">' + e(h) + '</th>').join('') +
        '</tr></thead><tbody>' +
        rows
          .map(
            (r) =>
              '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>',
          )
          .join('') +
        '</tbody></table></div>'
      : empty(none);
  const recent = (rows) =>
    [...rows].sort((a, b) =>
      String(b.created_at || b.issued_on || '').localeCompare(
        String(a.created_at || a.issued_on || ''),
      ),
    );
  const num = (r) => 'HR-' + String(r.number).padStart(5, '0');
  const orgOf = (d, p) => d.orgs.find((x) => x.id === p.org_id);
  const personOf = (d, id) =>
    M.person(d.profiles.find((p) => p.id === id)) || 'บุคลากร';
  const sub = (id, current) =>
    '<a ' +
    (id === current ? 'aria-current="page" ' : '') +
    'href="#' +
    id +
    '">' +
    e(M.pages[id]) +
    '</a>';
  function sidebar(d, current) {
    const group = (g, i) =>
      '<details class="nav-group' +
      (g.ids.includes(current) ? ' current' : '') +
      '" ' +
      (g.ids.includes(current) ? 'open' : '') +
      '><summary>' +
      ic(g.icon) +
      '<span>' +
      e(g.label) +
      '</span>' +
      ic('chev', 14) +
      '</summary><div>' +
      g.ids.map((id) => sub(id, current)).join('') +
      '</div></details>';
    const single = (id, icon) =>
      '<a class="nav-link" ' +
      (id === current ? 'aria-current="page" ' : '') +
      'href="#' +
      id +
      '">' +
      ic(icon) +
      '<span>' +
      e(M.pages[id]) +
      '</span></a>';
    return (
      '<aside class="sidebar" id="sidebar"><a class="brand" href="#home" aria-label="หน้าหลัก ระบบบุคลากร ขอนแก่น"><span class="brandmark" aria-hidden="true">hr</span><div><strong>RMUTI <em>KKC</em></strong><small>แผนกงานบริหารงานบุคคล</small></div></a><nav aria-label="เมนูหลัก">' +
      single('home', 'home') +
      single('tasks', 'clock') +
      group(M.groups[0], 0) +
      '<div class="nav-caption">บริการระบบสารสนเทศ</div>' +
      M.groups.slice(1).map(group).join('') +
      single('workflow', 'file') +
      single('training', 'calendar') +
      single('education', 'help') +
      single('positions', 'brief') +
      (['hr','admin'].includes(d.role) ? single('directory', 'user') : '') +
      single('performance', 'performance') +
      single('services', 'globe') +
      (['hr','admin'].includes(d.role) ? single('hr', 'brief') : '') +
      (d.role === 'admin' ? single('admin', 'shield') : '') +
      '<div class="nav-caption">ช่วยเหลือและข้อมูล</div>' +
      single('help', 'help') +
      single('privacy', 'shield') +
      single('terms', 'file') +
      single('contact', 'contact') +
      '<button type="button" class="nav-link" data-action="logout">' +
      ic('logout') +
      'ออกจากระบบ</button></nav></aside>'
    );
  }
  function layout(d, id, body) {
    const g = M.groups.find((g) => g.ids.includes(id)),
      title = g === M.groups[0] ? 'ข้อมูลส่วนตัว' : M.pages[id];
    return (
      sidebar(d, id) +
      '<button id="shade" data-action="menu" aria-label="ปิดเมนู"></button><div class="workspace"><header class="bar"><button class="iconbtn mobile" data-action="menu" aria-label="เปิดเมนูหลัก" aria-controls="sidebar" aria-expanded="false">' +
      ic('menu') +
      '</button><div class="bar-title"><b>ระบบบริหารจัดการสารสนเทศ</b><small>มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น</small></div><div class="bar-right"><button type="button" class="iconbtn refresh" data-action="reload" title="โหลดข้อมูลล่าสุด" aria-label="โหลดข้อมูลล่าสุด">' +
      ic('refresh', 16) +
      '</button>' +
      (HRData.demo ? btn('สลับบทบาท', 'switch', '', 'demo-btn', 'swap') : '') +
      '<span class="user-chip">' +
      e(M.initial(d.profile)) +
      '</span><div class="who"><b>' +
      e(M.person(d.profile)) +
      '</b><small>' +
      e(orgOf(d, d.profile)?.unit || 'บุคลากรมหาวิทยาลัย') +
      '</small></div></div></header><main id="content" tabindex="-1"><div class="crumb">' +
      link('home', 'หน้าหลัก') +
      ' ' +
      ic('arrow', 12) +
      ' ' +
      e(g?.label || M.pages[id]) +
      '</div><div class="heading"><h1>' +
      e(title) +
      '</h1>' +
      (HRData.demo ? '<span class="demo-label"><i></i>โหมดทดลอง</span>' : '') +
      '</div>' +
      (d.memoryOnly
        ? note(
            'เบราว์เซอร์ปิดการเก็บข้อมูล การทดลองครั้งนี้จะอยู่จนกว่าจะปิดหน้านี้',
          )
        : '') +
      body +
      '</main></div>'
    );
  }
  function profileBanner(d) {
    const p = d.profile,
      org = orgOf(d, p);
    const meta = [p.position, p.track].filter(Boolean);
    return `<section class="profile-banner" aria-label="บัตรข้อมูลบุคลากร">
      <div class="banner-art" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="banner-copy"><span class="banner-label">${ic('user', 15)} บัญชีบุคลากร</span>
      <h2>${e(M.person(p))}</h2>
      <p>${e(org?.unit || 'รอระบุสังกัด')}${org?.campus ? ' · วิทยาเขต' + e(org.campus) : ''}</p>
      ${meta.length ? '<div class="banner-meta">' + meta.map((item) => '<span>' + e(item) + '</span>').join('') + '</div>' : ''}</div>
    </section>`;
  }
  function profileArea(d, id, body) {
    return (
      profileBanner(d) +
      '<div class="profile-layout"><nav class="profile-tabs" aria-label="เมนูข้อมูลส่วนตัว">' +
      M.groups[0].ids
        .map(
          (k, i) =>
            '<a href="#' +
            k +
            '" ' +
            (id === k ? 'aria-current="page"' : '') +
            '>' +
            ic(profileIcons[i], 17) +
            e(k === 'profile' ? 'ข้อมูลส่วนตัว' : M.pages[k]) +
            '</a>',
        )
        .join('') +
      '</nav><section class="profile-main">' +
      body +
      '</section></div>'
    );
  }
  function orgOptions(orgs, parts, index) {
    const k = M.orgKeys[index],
      prior = M.orgKeys.slice(0, index);
    const eligible = orgs.filter((r) =>
      prior.every((p, i) => r[p] === parts[i]),
    );
    return (
      opt('', 'เลือก' + M.orgLabels[index]) +
      [...new Set(eligible.map((r) => r[k]))]
        .sort((a, b) => a.localeCompare(b, 'th'))
        .map((v) => opt(v, v, v === parts[index]))
        .join('')
    );
  }
  function profile(d) {
    const p = d.profile,
      org = orgOf(d, p),
      parts = M.orgKeys.map(
        (k) =>
          org?.[k] ||
          (k === 'campus' && d.orgs.some((r) => r.campus === 'ขอนแก่น')
            ? 'ขอนแก่น'
            : ''),
      );
    return (
      (p.verified_at
        ? '<div class="verified">' +
          ic('check', 15) +
          ' ยืนยันข้อมูลเมื่อ ' +
          e(M.date(p.verified_at)) +
          '</div>'
        : note(
            'โปรดตรวจสอบตำแหน่งและสังกัด แล้วกดบันทึกเพื่อยืนยันข้อมูล',
            'warm',
          )) +
      '<form data-form="profile"><h2 class="field-heading">' +
      ic('user', 18) +
      'ข้อมูลตามทะเบียนบุคลากร</h2><div class="grid three">' +
      [
        ['คำนำหน้าชื่อ', p.prefix],
        ['ชื่อจริง', p.first_name],
        ['นามสกุล', p.last_name],
      ]
        .map(([l, v]) => field(l, '<input value="' + e(v) + '" readonly>'))
        .join('') +
      '</div><hr><h3>' +
      ic('brief') +
      'ข้อมูลการปฏิบัติงาน</h3><div class="grid three">' +
      field('ประเภทบุคลากร', values('staff_type', M.types, p.staff_type)) +
      field(
        'ตำแหน่ง',
        values(
          'position',
          [...new Set([...M.positions, ...(p.position ? [p.position] : [])])],
          p.position,
        ),
      ) +
      field('สายงาน', values('track', M.tracks, p.track)) +
      '</div><h3>' +
      ic('globe') +
      'สังกัด</h3><div class="grid org">' +
      M.orgKeys
        .map((k, i) =>
          field(
            M.orgLabels[i],
            select(
              k,
              orgOptions(d.orgs, parts, i),
              'required ' + (i && !parts[i - 1] ? 'disabled' : ''),
            ),
          ),
        )
        .join('') +
      '</div>' +
      saveButton() +
      '</form>'
    );
  }
  function requestTable(d, list, admin = false) {
    return table(
      [
        'เลขคำขอ',
        'ประเภทหนังสือ',
        ...(admin ? ['ผู้ขอ'] : []),
        'วันที่ยื่น',
        'สถานะ',
        '',
      ],
      recent(list).map((r) => [
        '<b class="ref">' + num(r) + '</b>',
        e(M.kinds[r.kind]),
        ...(admin ? [e(personOf(d, r.owner_id))] : []),
        e(M.date(r.created_at)),
        badge(r.status),
        btn('รายละเอียด', 'request-detail', r.id),
      ]),
      'ยังไม่มีคำขอหนังสือรับรอง',
    );
  }
  function requestForm(d, id) {
    return panel(
      M.kinds[id],
      '<p class="intro">ผู้ยื่นคำขอ · <b>' +
        e(M.person(d.profile)) +
        '</b></p><form data-form="request" data-kind="' +
        id +
        '"><div class="grid form-wide">' +
        field('วัตถุประสงค์ในการขอ', area('purpose')) +
        field(
          'จำนวนฉบับ',
          select(
            'copies',
            [1, 2, 3, 4, 5].map((x) => opt(x, x + ' ฉบับ')).join(''),
          ),
        ) +
        '</div>' +
        saveButton('ยื่นคำขอ', 'file') +
        '</form>',
    );
  }
  function orderTable(d, id, query = '') {
    const term = query.trim().toLocaleLowerCase('th');
    const rs = recent(
      d.orders.filter(
        (r) =>
          (id !== 'myorders' || r.recipient_id === d.id) &&
          (!term ||
            [r.number, r.title, r.body]
              .join(' ')
              .toLocaleLowerCase('th')
              .includes(term)),
      ),
    );
    return table(
      ['เลขที่คำสั่ง', 'เรื่อง', 'ลงวันที่', 'ขอบเขต', ''],
      rs.map((r) => [
        e(r.number),
        e(r.title),
        e(M.date(r.issued_on)),
        r.recipient_id ? 'เฉพาะบุคคล' : 'บุคลากรทุกคน',
        btn('อ่านคำสั่ง', 'order-detail', r.id),
      ]),
      'ไม่พบคำสั่งที่ตรงกับรายการนี้',
    );
  }
  function activityList(d) {
    const cards = [...d.activities]
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .map((a) => {
        const registered = d.registrations.some(
            (r) => r.owner_id === d.id && r.activity_id === a.id,
          ),
          closed = new Date(a.starts_at) <= new Date();
        return (
          '<article class="event"><div class="event-symbol">' +
          ic('calendar', 24) +
          '</div><div><h3>' +
          e(a.title) +
          '</h3><p>' +
          e(M.date(a.starts_at, true)) +
          ' น. · ' +
          e(a.venue) +
          '</p><small>ลงทะเบียน ' +
          a.taken +
          ' / ' +
          a.capacity +
          ' คน</small></div><div class="event-action">' +
          (closed
            ? 'ปิดรับแล้ว'
            : registered
              ? btn('ยกเลิกการลงทะเบียน', 'cancel', a.id)
              : a.taken >= a.capacity
                ? 'ที่นั่งเต็ม'
                : btn('ลงทะเบียน', 'join', a.id, 'primary')) +
          '</div></article>'
        );
      });
    return panel(
      'กิจกรรมสำหรับบุคลากร',
      cards.join('') || empty('ยังไม่มีกิจกรรม'),
    );
  }
  const selectPerson = (d, name, all = false) =>
    select(
      name,
      (all ? opt('', 'บุคลากรทุกคน') : opt('', 'กรุณาเลือก')) +
        d.profiles.map((p) => opt(p.id, M.person(p))).join(''),
      all ? '' : 'required',
    );
  function staff(d, tab) {
    const tabs = {
      queue: 'คำขอหนังสือรับรอง',
      order: 'เผยแพร่คำสั่ง',
      activity: 'จัดกิจกรรม',
      asset: 'มอบครุภัณฑ์',
      reports: 'รายงาน',
    };
    let body = '';
    if (tab === 'order')
      body =
        '<form data-form="order"><div class="grid two">' +
        field('เลขที่คำสั่ง', input('number', 'required maxlength="80"')) +
        field('วันที่ออกคำสั่ง', input('issued_on', 'type="date" required')) +
        field('เรื่อง', input('title', 'required maxlength="200"')) +
        field('ผู้รับคำสั่ง', selectPerson(d, 'recipient_id', true)) +
        '</div>' +
        field('เนื้อหาคำสั่ง', area('body', 6000)) +
        saveButton('เผยแพร่คำสั่ง', 'file') +
        '</form>';
    else if (tab === 'activity')
      body =
        '<form data-form="activity"><div class="grid two">' +
        field('ชื่อกิจกรรม', input('title', 'required maxlength="200"')) +
        field('สถานที่', input('venue', 'required maxlength="250"')) +
        field(
          'วันและเวลาเริ่ม (เวลาไทย)',
          input('starts_at', 'type="datetime-local" required'),
        ) +
        field(
          'จำนวนที่นั่ง',
          input('capacity', 'type="number" min="1" max="10000" required'),
        ) +
        '</div>' +
        saveButton('เปิดลงทะเบียน', 'calendar') +
        '</form>';
    else if (tab === 'asset')
      body =
        '<form data-form="asset"><div class="grid two">' +
        field('ผู้รับครุภัณฑ์', selectPerson(d, 'owner_id')) +
        field('เลขทะเบียนครุภัณฑ์', input('code', 'required maxlength="80"')) +
        field('ชื่อครุภัณฑ์', input('title', 'required maxlength="200"')) +
        field('สถานที่ใช้งาน', input('location', 'required maxlength="250"')) +
        field('วันที่รับ', input('issued_on', 'type="date" required')) +
        '</div>' +
        saveButton('บันทึกการมอบครุภัณฑ์') +
        '</form>';
    else if (tab === 'reports')
      body =
        '<h3>ผู้ลงทะเบียนกิจกรรม</h3>' +
        table(
          ['กิจกรรม', 'ผู้เข้าร่วม'],
          recent(d.registrations).map((r) => [
            e(d.activities.find((a) => a.id === r.activity_id)?.title),
            e(personOf(d, r.owner_id)),
          ]),
          'ยังไม่มีผู้ลงทะเบียน',
        ) +
        '<h3>ผลประเมินระบบ</h3>' +
        table(
          ['ผู้ประเมิน', 'คะแนน', 'ข้อเสนอแนะ'],
          recent(d.feedback).map((r) => [
            e(personOf(d, r.owner_id)),
            r.score + '/5',
            e(r.comment),
          ]),
          'ยังไม่มีผลประเมิน',
        ) +
        '<h3>บันทึกผลงานตามรอบ</h3>' +
        table(
          ['บุคลากร', 'รอบ', 'สรุปผลงาน'],
          recent(d.assessments).map((r) => [
            e(personOf(d, r.owner_id)),
            e(r.period),
            e(r.summary),
          ]),
          'ยังไม่มีบันทึกผลงาน',
        );
    else body = salaryDashboard(d);
    return (
      '<div class="staff-tabs">' +
      Object.entries(tabs)
        .map(([v, t]) =>
          btn(t, 'admin-tab', v, v === tab ? 'selected' : 'light'),
        )
        .join('') +
      '</div>' +
      panel(tab==='queue'?'จัดการหนังสือรับรอง':tabs[tab] || tabs.queue, body)
    );
  }
  const isHR = d => ['hr','admin'].includes(d.role);
  const trainingStates = {submitted:'รอตรวจสอบ',reviewed:'ตรวจสอบแล้ว',returned:'ส่งคืนแก้ไข'};
  const trainingKinds = ['อบรม','สัมมนา','ประชุมวิชาการ','ศึกษาดูงาน','หลักสูตรออนไลน์','อื่น ๆ'];
  const thaiToday = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function tableSearch(target,placeholder) {
    return '<div class="module-search">'+ic('search',18)+
      '<input type="search" data-table-search="'+e(target)+'" aria-label="'+e(placeholder)+'" placeholder="'+e(placeholder)+'"></div>';
  }
  function historyPage(d,kind) {
    const edu=kind==='education', records=(edu?d.educationRecords:d.positionRecords)||[];
    const mine=records.filter(r=>r.owner_id===d.id);
    const name=edu?'ประวัติการศึกษา':'ประวัติการดำรงตำแหน่ง';
    const today=thaiToday();
    const levels=['มัธยมศึกษา','ปวช.','ปวส.','อนุปริญญา','ปริญญาตรี','ปริญญาโท','ปริญญาเอก','อื่น ๆ'];
    const types=['บรรจุ/แต่งตั้ง','เลื่อนตำแหน่ง','ย้าย/โอน','เปลี่ยนสายงาน','รักษาการ','อื่น ๆ'];
    const fields=edu?
      field('ระดับการศึกษา',select('level',levels.map(x=>opt(x,x)).join(''),'required'))+
      field('วุฒิ / ชื่อปริญญา',input('qualification','required minlength="2" maxlength="200"'))+
      field('สาขาวิชา',input('major','maxlength="200"'))+
      field('สถานศึกษา',input('institution','required minlength="2" maxlength="200"'))+
      field('ปีที่สำเร็จการศึกษา (พ.ศ.)',input('graduation_year','type="number" min="2400" max="'+(Number(today.slice(0,4))+543)+'" required'))
      :field('ชื่อตำแหน่ง',input('position_title','required minlength="2" maxlength="200"'))+
      field('สังกัด / หน่วยงาน',input('organization','required minlength="2" maxlength="250"'))+
      field('ประเภทการแต่งตั้ง',select('appointment_kind',types.map(x=>opt(x,x)).join(''),'required'))+
      field('วันที่เริ่มดำรงตำแหน่ง',input('start_on','type="date" min="1900-01-01" max="'+today+'" required'))+
      field('วันที่สิ้นสุด (เว้นว่างหากยังดำรงอยู่)',input('end_on','type="date" min="1900-01-01" max="'+today+'"'))+
      field('เลขที่คำสั่งแต่งตั้ง',input('order_ref','maxlength="200"'));
    const head=edu?['ระดับ / วุฒิ','สาขา','สถานศึกษา','ปี พ.ศ.']:['ตำแหน่ง / ประเภท','หน่วยงาน','ช่วงเวลาดำรงตำแหน่ง','เลขคำสั่ง'];
    const rows=(list,staff)=>list.slice().sort((a,b)=>edu?b.graduation_year-a.graduation_year:String(b.start_on).localeCompare(String(a.start_on))).map(r=>[
      ...(staff?[e(personOf(d,r.owner_id))]:[]),
      ...(edu?['<b>'+e(r.level)+'</b><div class="intro">'+e(r.qualification)+'</div>',e(r.major||'—'),e(r.institution),e(r.graduation_year)]
        :['<b>'+e(r.position_title)+'</b><div class="intro">'+e(r.appointment_kind)+'</div>',e(r.organization),e(M.date(r.start_on))+' – '+e(r.end_on?M.date(r.end_on):'ยังดำรงอยู่'),e(r.order_ref||'—')]),
      '<span class="training-state '+e(r.status)+'">'+e(trainingStates[r.status])+'</span>',
      e(r.note||'—')+(r.review_note?'<div class="intro">HR: '+e(r.review_note)+'</div>':'')+(r.reviewed_at?'<div class="intro">ตรวจเมื่อ '+e(M.date(r.reviewed_at,true))+'</div>':''),
      staff&&r.status==='submitted'&&r.owner_id!==d.id?btn('ตรวจสอบ','history-review',kind+':'+r.id,'primary','check'):
      !staff&&r.status==='submitted'?btn('ถอนรายการ','history-withdraw',kind+':'+r.id,'light','close'):'—'
    ]);
    return panel('สรุป'+name,'<div class="module-metrics">'+metric('รายการทั้งหมด',mine.length)+metric('รอตรวจสอบ',mine.filter(r=>r.status==='submitted').length)+metric('ตรวจสอบแล้ว',mine.filter(r=>r.status==='reviewed').length)+'</div>'+note('ข้อมูลแจ้งด้วยตนเอง ไม่เปลี่ยนทะเบียนตำแหน่งหรือวุฒิทางราชการโดยอัตโนมัติ'))+
    panel('เพิ่ม'+name,'<form data-form="history-submit" data-kind="'+kind+'"><div class="module-grid">'+fields+'</div>'+field('หมายเหตุ / เลขอ้างอิงหลักฐาน','<textarea name="note" rows="3" maxlength="1000"></textarea>')+saveButton('ส่งให้ HR ตรวจสอบ')+'</form>')+
    panel(name+'ของท่าน',table([...head,'สถานะ','หมายเหตุ','ดำเนินการ'],rows(mine,false),'ยังไม่มีประวัติ'))+
    (isHR(d)?panel('คิวตรวจสอบ'+name,tableSearch(kind+'-queue','ค้นหาชื่อ / รายละเอียด / สถานะ')+'<div id="'+kind+'-queue">'+table(['บุคลากร',...head,'สถานะ','หมายเหตุ','ดำเนินการ'],rows(records,true),'ยังไม่มีรายการ')+'</div>'):'');
  }
  function trainingPage(d) {
    const records=(d.trainingRecords||[]);
    const mine=records.filter(r=>r.owner_id===d.id);
    const approved=mine.filter(r=>r.status==='reviewed');
    const rows=(items,staff=false)=>recent(items).map(r=>[
      ...(staff?[e(personOf(d,r.owner_id))]:[]),
      '<b>'+e(r.title)+'</b><div class="intro">'+e(r.kind)+' · '+e(r.organizer)+'</div>',
      e(M.date(r.completed_on)),e(Number(r.hours).toLocaleString('th-TH')),
      '<span class="training-state '+e(r.status)+'">'+e(trainingStates[r.status])+'</span>',
      e(r.review_note||r.note||'—'),
      staff && r.status==='submitted' && r.owner_id!==d.id
        ?btn('ตรวจสอบ','training-review',r.id,'primary','check')
        :(!staff&&r.status==='submitted'?btn('ถอนรายการ','training-withdraw',r.id,'light','close'):'—')
    ]);
    return panel('สรุปประวัติของท่าน',
      '<div class="module-metrics">'+metric('จำนวนรายการ',mine.length)+
      metric('รอตรวจสอบ',mine.filter(r=>r.status==='submitted').length)+
      metric('ชั่วโมงที่ HR ตรวจสอบแล้ว',approved.reduce((n,r)=>n+Number(r.hours),0).toLocaleString('th-TH'))+'</div>'+
      note('การตรวจสอบประวัติเป็นการบันทึกข้อมูลภายในระบบ ไม่ใช่การรับรองหลักสูตรหรือสิทธิ์เบิกค่าใช้จ่าย')
    )+panel('เพิ่มประวัติการอบรม / พัฒนา',
      '<form data-form="training-submit">'+
      '<div class="module-grid">'+
      field('ชื่อหลักสูตร / กิจกรรม',input('title','required minlength="3" maxlength="200"'))+
      field('หน่วยงานผู้จัด',input('organizer','required minlength="2" maxlength="200"'))+
      field('ประเภท',select('kind',trainingKinds.map(k=>opt(k,k)).join(''),'required'))+
      field('วันที่เสร็จสิ้น',input('completed_on','type="date" min="1900-01-01" max="'+thaiToday()+'" required'))+
      field('จำนวนชั่วโมง',input('hours','type="number" min="0.5" max="1000" step="0.01" required'))+
      '</div>'+field('หมายเหตุ / เลขที่หลักฐาน (ถ้ามี)','<textarea name="note" rows="3" maxlength="1000"></textarea>')+
      saveButton('ส่งประวัติให้ HR ตรวจสอบ')+'</form>'
    )+panel('ประวัติของท่าน',
      '<div id="training-mine">'+table(['กิจกรรม','วันที่','ชั่วโมง','สถานะ','หมายเหตุ','ดำเนินการ'],rows(mine),'ยังไม่มีประวัติ')+'</div>'
    )+(isHR(d)?panel('คิวตรวจสอบประวัติบุคลากร',
      tableSearch('training-queue','ค้นหาบุคลากร / หลักสูตร / สถานะ')+
      '<div id="training-queue">'+table(['บุคลากร','กิจกรรม','วันที่','ชั่วโมง','สถานะ','หมายเหตุ','ดำเนินการ'],rows(records,true),'ยังไม่มีรายการ')+'</div>'
    ):'');
  }
  function metric(label,value,href='') {
    return '<div class="module-metric"><small>'+e(label)+'</small><strong>'+e(value)+'</strong>'+
      (href?link(href,'เปิดรายการ'):'')+'</div>';
  }
  function directoryPage(d) {
    if(!isHR(d)) return note('เฉพาะ HR และ ADMIN');
    const rows=(d.profiles||[]).slice().sort((a,b)=>M.person(a).localeCompare(M.person(b),'th')).map(p=>{
      const o=orgOf(d,p);
      return [e(M.person(p)),e(p.position||'—'),e(p.staff_type||'—'),e(p.track||'—'),e(o?.faculty||'—'),e(o?.unit||'—')];
    });
    return panel('ทะเบียนบัญชีบุคลากรในระบบ',
      '<div class="module-metrics">'+metric('จำนวนบัญชีที่มีระเบียน',rows.length)+
      metric('ยังไม่ระบุสังกัด',(d.profiles||[]).filter(p=>!p.org_id).length)+
      metric('ยังไม่ระบุตำแหน่ง',(d.profiles||[]).filter(p=>!p.position).length)+'</div>'+
      note('ข้อมูลตามระเบียนที่บุคลากรกรอก ไม่ใช่ทะเบียนอัตรากำลังหรือข้อมูลการจ้างที่ HR รับรอง')+
      '<div class="module-toolbar">'+tableSearch('personnel-directory','ค้นหาชื่อ ตำแหน่ง ประเภท หรือสังกัด')+
      btn('ส่งออก CSV (Excel)','export-directory','','primary','download')+'</div>'+
      '<div id="personnel-directory">'+table(['ชื่อ–นามสกุล','ตำแหน่ง','ประเภทบุคลากร','สายงาน','คณะ / หน่วยงาน','แผนก'],rows,'ยังไม่มีระเบียน')+'</div>'
    );
  }
  function taskPage(d) {
    const requests=(d.requests||[]), workflows=(d.workflows||[]), training=(d.trainingRecords||[]);
    const assigned=workflows.filter(r=>
      (r.status==='pending_review'&&r.reviewer_id===d.id)||
      (r.status==='pending_approval'&&r.approver_id===d.id)||
      (r.status==='pending_signature'&&r.signer_id===d.id));
    const ready=requests.filter(r=>r.owner_id===d.id&&r.status==='ready');
    const returned=workflows.filter(r=>r.requester_id===d.id&&r.status==='returned');
    const ownTraining=training.filter(r=>r.owner_id===d.id&&r.status==='returned');
    const pending=requests.filter(r=>['submitted','review'].includes(r.status));
    const pendingTraining=training.filter(r=>r.status==='submitted'&&r.owner_id!==d.id);
    const items=[
      ...assigned.map(r=>['เอกสารมอบหมาย',e(r.title),btn('รายละเอียด','workflow-detail',r.id,'primary')]),
      ...returned.map(r=>['เอกสารส่งคืน',e(r.title),btn('แก้ไข','workflow-detail',r.id,'primary')]),
      ...ready.map(r=>['หนังสือพร้อมรับ',e(num(r)+' · '+(M.kinds[r.kind]||r.kind)),btn('รายละเอียด','request-detail',r.id,'primary')]),
      ...ownTraining.map(r=>['ประวัติอบรมส่งคืน',e(r.title),link('training','ดูประวัติ')])
    ];
    return panel('งานที่ต้องดำเนินการ',
      '<div class="module-metrics">'+metric('เอกสารที่รอท่าน',assigned.length,'workflow')+
      metric('เอกสารส่งคืน',returned.length,'workflow')+
      metric('หนังสือพร้อมรับ',ready.length,'requests')+
      metric('ประวัติอบรมส่งคืน',ownTraining.length,'training')+'</div>'+
      table(['ประเภท','รายการ','ดำเนินการ'],items,'ไม่มีงานที่ต้องดำเนินการ')+
      '<p class="intro">สรุปจากข้อมูลล่าสุดเมื่อเข้าสู่ระบบหรือกดรีเฟรช ไม่ใช่การแจ้งเตือนแบบ Push</p>'
    )+(isHR(d)?panel('ภาพรวมงานเจ้าหน้าที่ HR',
      '<div class="module-metrics">'+metric('ระเบียนบุคลากร',(d.profiles||[]).length,'directory')+
      metric('คำขอที่ยังดำเนินการ',pending.length,'hr')+
      metric('ประวัติอบรมรอตรวจ',pendingTraining.length,'training')+'</div>'+
      requestTable(d,pending.slice(0,20),true)
    ):'');
  }
  function adminUsers(d) {
    const roles = {admin:'ADMIN — ผู้ดูแลระบบ',hr:'HR — เจ้าหน้าที่บุคคล',staff:'USER — บุคลากร'};
    const people = (d.adminUsers||[]).map(u => {
      const isSelf = u.id === d.id;
      const picker = '<select class="role-select" data-role-target="'+e(u.id)+'" aria-label="บทบาทของ '+e(u.display_name||u.email)+'" '+(isSelf?'disabled':'')+'>'+
        Object.entries(roles).map(([value,label])=>'<option value="'+value+'"'+(u.role===value?' selected':'')+'>'+e(label)+'</option>').join('')+'</select>';
      return [
        '<div><b>'+e(u.display_name||'บุคลากร')+'</b><div class="intro">'+e(u.email)+'</div></div>',
        '<span class="role-pill role-'+e(u.role)+'">'+e(roles[u.role]||u.role)+'</span>',
        picker,
        isSelf ? 'บัญชีของท่าน' : btn('บันทึกสิทธิ์','save-role',u.id,'primary','shield')
      ];
    });
    const audit = (d.roleAudit||[]).map(x=>[
      e(M.date(x.changed_at,true)),
      e((d.adminUsers||[]).find(u=>u.id===x.actor_id)?.email||'ผู้ดูแลระบบ'),
      e((d.adminUsers||[]).find(u=>u.id===x.target_id)?.email||'ผู้ใช้งาน'),
      e(roles[x.old_role]||x.old_role)+' → '+e(roles[x.new_role]||x.new_role)
    ]);
    const pending = (d.pendingEmailRoles||[]).map(p=>[
      '<b>'+e(p.email)+'</b>',
      '<span class="role-pill role-'+e(p.role)+'">'+e(roles[p.role]||p.role)+'</span>',
      e(M.date(p.expires_at,true)),
      btn('ยกเลิกรายการ','cancel-email-role',p.email,'light','close')
    ]);
    return panel('เพิ่มหรือกำหนดสิทธิ์ด้วยอีเมล',
      '<p class="intro">กรอกอีเมลมหาวิทยาลัย เลือกบทบาท แล้วกดบันทึกสิทธิ์</p>'+
      '<form data-form="assign-email-role" class="assign-email-role-form">'+
      field('อีเมลมหาวิทยาลัย',input('email','type="email" maxlength="254" autocomplete="off" inputmode="email" placeholder="name@rmuti.ac.th" required'))+
      field('กำหนดสิทธิ์',
        select('role',
          opt('staff','USER — บุคลากร')+
          opt('hr','HR — เจ้าหน้าที่บุคคล')+
          opt('admin','ADMIN — ผู้ดูแลระบบ'),'required'))+
      '<button class="btn primary" type="submit">'+ic('plus',16)+' เพิ่ม / กำหนดสิทธิ์</button>'+
      '</form>'+
      note('บัญชีที่สมัครและยืนยันอีเมลแล้วจะเปลี่ยนสิทธิ์ทันที หากยังไม่ได้สมัคร ระบบจะรอกดยืนยันอีเมลและเปิดสิทธิ์ USER/HR ภายใน 30 วัน โดยไม่สร้างบัญชีหรือส่งอีเมลเชิญเอง')+
      '<p class="intro">สิทธิ์ ADMIN จะกำหนดได้เฉพาะบัญชีที่ยืนยันอีเมลแล้วเท่านั้น</p>'
    )+
    panel('รายการรอสมัครและยืนยันอีเมล',
      table(['อีเมล','สิทธิ์ที่รอ','หมดอายุ','ดำเนินการ'],pending,'ไม่มีรายการรอเปิดสิทธิ์')
    )+
    panel('จัดการบัญชีและกำหนดสิทธิ์',
      '<p class="intro">ADMIN เข้าถึงงาน HR ได้ด้วย ไม่สามารถเปลี่ยนสิทธิ์บัญชีของตนเอง และระบบป้องกันการลบ ADMIN คนสุดท้าย</p>'+
      tableSearch('admin-account-table','ค้นหาชื่อ อีเมล หรือสิทธิ์')+
      '<div id="admin-account-table">'+table(['บุคลากร','สิทธิ์ปัจจุบัน','กำหนดสิทธิ์ใหม่','ดำเนินการ'],people,'ยังไม่มีบัญชีบุคลากร')+'</div>'
    )+
    panel('ประวัติการเปลี่ยนสิทธิ์',
      table(['วันเวลา','ผู้เปลี่ยน','บัญชีที่เปลี่ยน','การเปลี่ยนแปลง'],audit,'ยังไม่มีประวัติการเปลี่ยนสิทธิ์')
    );
  }
  function signature(d) {
    return (
      '<h2>ลายเซ็นอิเล็กทรอนิกส์</h2><p class="intro">วาดลายเซ็นด้วยเมาส์หรือนิ้ว แล้วกดบันทึก</p><form data-form="signature"><canvas id="signature" width="720" height="200" aria-label="พื้นที่วาดลายเซ็น"></canvas><div class="signature-tools">' +
      btn('วาดใหม่', 'clear-sign') +
      (d.signature.length ? btn('ลบลายเซ็นที่บันทึก', 'delete-sign') : '') +
      '</div>' +
      saveButton('บันทึกลายเซ็น') +
      '</form>'
    );
  }
  function stats(d) {
    const my = d.requests.filter((r) => r.owner_id === d.id);
    const items = [
      [
        'คำขอที่กำลังดำเนินการ',
        my.filter((r) => ['submitted', 'review'].includes(r.status)).length,
        'requests',
        'file',
      ],
      [
        'เอกสารพร้อมรับ',
        my.filter((r) => r.status === 'ready').length,
        'requests',
        'cert',
      ],
      [
        'กิจกรรมที่ลงทะเบียน',
        d.registrations.filter((r) => r.owner_id === d.id).length,
        'history',
        'calendar',
      ],
    ];
    return (
      '<div class="stats">' +
      items
        .map(
          ([t, n, id, i]) =>
            '<a href="#' +
            id +
            '"><span class="stat-icon">' +
            ic(i) +
            '</span><strong>' +
            n +
            '</strong><small>' +
            t +
            '</small></a>',
        )
        .join('') +
      '</div>'
    );
  }
  function external(url, label) {
    const href = M.validLink(url);
    return href
      ? '<a class="btn light" target="_blank" rel="noopener noreferrer" href="' +
          e(href) +
          '">' +
          e(label) +
          ic('arrow', 14) +
          '</a>'
      : '';
  }
  function page(d, id, adminTab) {
    const mine = (list) => list.filter((r) => r.owner_id === d.id);
    let body = '';
    switch (id) {
      case 'tasks': return taskPage(d);
      case 'training': return trainingPage(d);
      case 'education': return historyPage(d,'education');
      case 'positions': return historyPage(d,'positions');
      case 'directory': return directoryPage(d);
      case 'home':
        return (
          profileBanner(d) +
          stats(d) +
          panel(
            'บริการบุคลากร',
            '<div class="shortcuts">' +
              [
                ['profile', 'user'],
                ['salary', 'cert'],
                ['search', 'search'],
                ['activities', 'calendar'],
                ['tasks', 'clock'],
                ['training', 'calendar'],
                ...(isHR(d)?[['directory','user']]:[]),
              ]
                .map(([k, i]) => link(k, M.pages[k], 'shortcut', i))
                .join('') +
              '</div>',
          ) +
          panel(
            'คำขอล่าสุดของท่าน',
            requestTable(d, recent(mine(d.requests)).slice(0, 5)),
            link('requests', 'ดูทั้งหมด'),
          )
        );
      case 'workflow':
        return HRWorkflow.page(d);
      case 'profile':
        body = profile(d);
        break;
      case 'signature':
        body = signature(d);
        break;
      case 'assets':
        body =
          '<h2>ครุภัณฑ์ที่ได้รับมอบหมาย</h2>' +
          table(
            ['เลขทะเบียน', 'รายการ', 'สถานที่', 'วันที่รับ'],
            mine(d.assets).map((r) => [
              e(r.code),
              e(r.title),
              e(r.location),
              e(M.date(r.issued_on)),
            ]),
            'ยังไม่มีครุภัณฑ์ที่ได้รับมอบหมาย',
          );
        break;
      case 'rights':
        body =
          '<h2>สิทธิ์การใช้งานของท่าน</h2><dl><dt>บทบาท</dt><dd>' +
          (d.role === 'admin' ? 'ผู้ดูแลระบบ ADMIN' : d.role === 'hr' ? 'เจ้าหน้าที่ HR' : 'บุคลากร USER') +
          '</dd><dt>งานที่เข้าถึงได้</dt><dd>ข้อมูลของตนเอง คำขอหนังสือรับรอง คำสั่ง และกิจกรรม' +
          (['admin','hr'].includes(d.role) ? ' รวมถึงคิวคำขอและรายงานฝ่ายบุคคล' : '') +
          (d.role === 'admin' ? ' และการกำหนดบทบาทผู้ใช้' : '') +
          '</dd></dl>';
        break;
      case 'feedback':
        body =
          '<h2>ประเมินระบบ</h2><form data-form="feedback">' +
          field(
            'คะแนนความพึงพอใจ',
            select(
              'score',
              opt('', 'เลือกคะแนน') +
                [1, 2, 3, 4, 5].map((x) => opt(x, x + ' / 5')).join(''),
              'required',
            ),
          ) +
          field(
            'ข้อเสนอแนะ (ถ้ามี)',
            '<textarea name="comment" rows="3" maxlength="1000"></textarea>',
          ) +
          saveButton('ส่งผลประเมิน', 'check') +
          '</form><h3>ผลประเมินที่ท่านส่ง</h3>' +
          table(
            ['วันที่', 'คะแนน', 'ข้อเสนอแนะ'],
            recent(mine(d.feedback)).map((r) => [
              e(M.date(r.created_at)),
              r.score + '/5',
              e(r.comment),
            ]),
            'ยังไม่มีผลประเมิน',
          );
        break;
      case 'requests':
        return (
          '<div class="toolbar">' +
          link('salary', M.kinds.salary, 'btn primary', 'plus') +
          link('contract', M.kinds.contract, 'btn light', 'plus') +
          '</div>' +
          panel('คำขอของท่าน', requestTable(d, mine(d.requests)))
        );
      case 'salary':
      case 'contract':
        return requestForm(d, id);
      case 'orders':
      case 'myorders':
      case 'search':
        return panel(
          id === 'myorders' ? 'คำสั่งที่ระบุชื่อท่าน' : 'ทะเบียนคำสั่ง',
          field(
            'ค้นหาด้วยเลขที่คำสั่ง ชื่อเรื่อง หรือเนื้อหา',
            input(
              'search',
              'type="search" placeholder="ค้นหาคำสั่ง…" autocomplete="off"',
            ),
          ) +
            '<div id="results">' +
            orderTable(d, id) +
            '</div>',
        );
      case 'activities':
        return activityList(d);
      case 'history':
        return panel(
          'กิจกรรมที่ท่านลงทะเบียน',
          table(
            ['กิจกรรม', 'กำหนดจัด', 'ลงทะเบียนเมื่อ', ''],
            recent(mine(d.registrations)).map((r) => {
              const a = d.activities.find((a) => a.id === r.activity_id);
              return [
                e(a?.title),
                e(M.date(a?.starts_at, true)),
                e(M.date(r.created_at, true)),
                a && new Date(a.starts_at) > new Date()
                  ? btn('ยกเลิก', 'cancel', a.id)
                  : 'สิ้นสุดการลงทะเบียน',
              ];
            }),
            'ยังไม่มีประวัติการลงทะเบียน',
          ),
          link('activities', 'ดูกิจกรรม'),
        );
      case 'performance':
        return (
          panel(
            'บันทึกผลงานตามรอบ',
            note(
              'แบบทดลองสำหรับส่งสรุปผลงานส่วนบุคคล รอบการประเมินอ้างอิงปีงบประมาณ พ.ศ.',
            ) +
              external(
                HR_CONFIG.performancePortalUrl,
                'เปิดระบบประเมินของหน่วยงาน',
              ) +
              '<form data-form="assessment"><div class="grid two">' +
              field(
                'ปีงบประมาณ (พ.ศ.)',
                input('year', 'type="number" min="2500" max="2799" required'),
              ) +
              field(
                'รอบการประเมิน',
                select('round', opt(1, 'รอบที่ 1') + opt(2, 'รอบที่ 2')),
              ) +
              '</div>' +
              field('สรุปผลการปฏิบัติงาน', area('summary', 3000)) +
              saveButton('ส่งบันทึกผลงาน', 'check') +
              '</form>',
          ) +
          panel(
            'ประวัติการส่ง',
            table(
              ['ปี / รอบ', 'สรุปผลงาน', 'วันที่ส่ง'],
              recent(mine(d.assessments)).map((r) => [
                e(r.period),
                e(r.summary),
                e(M.date(r.created_at)),
              ]),
              'ยังไม่มีบันทึกผลงาน',
            ),
          )
        );
      case 'services':
        return panel(
          'บริการสำหรับบุคลากร',
          external(HR_CONFIG.staffPortalUrl, 'เปิดศูนย์บริการบุคลากร') ||
            note(
              'ยังไม่ได้กำหนดลิงก์ศูนย์บริการบุคลากร กรุณาติดต่อแผนกงานบริหารงานบุคคล',
            ),
        );
      case 'privacy':
      case 'terms': {
        const href =
          id === 'privacy' ? HR_CONFIG.privacyUrl : HR_CONFIG.termsUrl;
        return panel(
          M.pages[id],
          external(href, 'อ่านเอกสารของหน่วยงาน') ||
            note('รอหน่วยงานกำหนดลิงก์เอกสารฉบับอนุมัติก่อนเปิดใช้งานจริง'),
        );
      }
      case 'contact':
        return panel(
          'หน่วยงานผู้รับผิดชอบ',
          '<p>' + e(HR_CONFIG.contactText) + '</p>',
        );
      case 'help':
        return panel(
          'การใช้งานระบบ',
          [
            'ตรวจข้อมูลส่วนตัว เลือกตำแหน่งและสังกัดให้ครบ แล้วกดบันทึกข้อมูล',
            'ขอหนังสือรับรองโดยระบุวัตถุประสงค์และจำนวนฉบับ ตรวจสถานะหรือพิมพ์ใบรับคำขอจากหน้าสรุป',
            'ค้นหาคำสั่งด้วยเลขที่หรือชื่อเรื่อง และเปิดรายละเอียดจากปุ่มอ่านคำสั่ง',
            'เลือกกิจกรรมที่ยังมีที่ว่างแล้วกดลงทะเบียน ยกเลิกได้ก่อนกิจกรรมเริ่ม',
            'เจ้าหน้าที่ HR ใช้เมนูงานเจ้าหน้าที่ HR เพื่อตรวจคำขอ แจ้งจุดรับ หรือแนบ PDF',
          ]
            .map(
              (t, i) =>
                '<div class="help-row"><b>' +
                String(i + 1).padStart(2, '0') +
                '</b><p>' +
                e(t) +
                '</p></div>',
            )
            .join(''),
        );
      case 'hr':
        return ['hr','admin'].includes(d.role) ? staff(d, adminTab) : note('ไม่มีสิทธิ์ใช้งาน HR');
      case 'admin':
        return d.role === 'admin' ? adminUsers(d) : note('เฉพาะผู้ดูแลระบบ ADMIN');
    }
    return profileArea(d, id, body);
  }
  function salaryFlow(d,r) {return (d.salaryFlows||[]).find(x=>x.request_id===r.id);}
  function salaryDraft(d,r) {return (d.salaryDrafts||[]).find(x=>x.id===r.id);}
  function salaryStage(d,r) {
    if(['ready','done'].includes(r.status))return 'issued';
    if(r.status==='rejected')return 'rejected';
    const flow=salaryFlow(d,r);
    if(flow?.status==='pending_signature')return 'sign';
    if(flow?.status==='signed')return 'signed';
    if(flow?.status==='pending_review'||flow?.status==='pending_approval')return 'approval';
    if(flow?.status==='returned'||flow?.status==='rejected')return 'returned';
    return r.status==='submitted'?'inbox':'draft';
  }
  const salaryLabels={inbox:'รอรับเรื่อง',draft:'กำลังจัดทำเอกสาร',approval:'รอตรวจสอบ / อนุมัติ',sign:'รอลงนาม',signed:'ลงนามภายในแล้ว — รอออกหนังสือ',issued:'พร้อมรับ / รับแล้ว',returned:'ส่งคืน / ไม่อนุมัติเอกสาร',rejected:'ส่งคืนคำขอ'};
  function salaryDashboard(d){
    const list=d.requests||[], tally=k=>list.filter(r=>salaryStage(d,r)===k).length;
    const cards=[['inbox','รอรับเรื่อง','file',tally('inbox')],['draft','กำลังจัดทำเอกสาร','pen',tally('draft')+tally('approval')+tally('returned')],['sign','รอลงนาม','pen',tally('sign')],['issued','ออกหนังสือแล้ว / พร้อมรับ','check',tally('issued')]];
    const rows=recent(list).map(r=>[
      '<b class="ref">'+e(num(r))+'</b>',e(M.kinds[r.kind]),e(personOf(d,r.owner_id)),e(M.date(r.created_at)),
      '<span class="salary-stage salary-'+salaryStage(d,r)+'">'+e(salaryLabels[salaryStage(d,r)])+'</span>',
      r.kind==='salary'&&['submitted','review'].includes(r.status)?btn('จัดทำหนังสือ','salary-editor',r.id,'primary','file')+' '+btn('รายละเอียด','request-detail',r.id):btn('รายละเอียด','request-detail',r.id)
    ]);
    return '<div class="salary-metrics">'+cards.map(([key,label,icon,count])=>'<div class="salary-metric salary-'+key+'">'+ic(icon,24)+'<strong>'+count+'</strong><span>'+e(label)+'</span></div>').join('')+'</div>'+
    '<p class="intro">ลงนามภายในแล้ว รอเจ้าหน้าที่ออกหนังสือ: '+tally('signed')+' รายการ · คำขอส่งคืน: '+tally('rejected')+' รายการ</p>'+
    note('เลือก “จัดทำหนังสือ” สำหรับคำขอรับรองเงินเดือน จากนั้นบันทึกร่าง ดูตัวอย่าง A4 และเสนออนุมัติ เอกสารประเภทอื่นยังดำเนินการแบบเดิม')+
    tableSearch('salary-queue','ค้นหาเลขคำขอ / ชื่อ / ประเภทหนังสือ')+'<div id="salary-queue">'+table(['เลขคำขอ','ประเภทหนังสือ','ผู้ขอ','วันที่ยื่น','สถานะ','ดำเนินการ'],rows,'ยังไม่มีคำขอ')+'</div>';
  }
  function salaryEditor(d,r) {
    const old=salaryDraft(d,r),flow=salaryFlow(d,r),x=old?.fields||{};
    if(flow&&flow.status!=='rejected'){
      const visible=(d.workflows||[]).find(v=>v.id===flow.document_id);
      return '<h2>'+e(num(r))+' — หนังสือรับรองเงินเดือน</h2>'+note('เอกสารถูกเสนอแล้ว: '+(salaryLabels[salaryStage(d,r)]||flow.status))+
        '<p class="intro">ดำเนินการตรวจสอบ / อนุมัติ / ลงนามที่ระบบเสนอเอกสาร การออกหนังสือฉบับจริงยังต้องตรวจและแนบ PDF ที่ได้รับอนุญาต</p>'+
        (visible?btn('เปิดเอกสารที่เสนอ','workflow-detail',flow.document_id,'primary','file'):'')+' '+btn('กลับรายละเอียดคำขอ','request-detail',r.id);
    }
    const p=d.profiles.find(v=>v.id===r.owner_id),org=d.orgs.find(v=>v.id===p?.org_id);
    const val=(k,fallback='')=>e(x[k]??fallback);
    const officers=(d.officers||[]).filter(o=>o.id!==d.id);
    const choices=(name,title,required=false)=>field(title,'<select name="'+name+'" '+(required?'required':'')+'><option value="">ยังไม่กำหนด</option>'+officers.map(o=>'<option value="'+e(o.id)+'" '+(x[name]===o.id?'selected':'')+'>'+e(o.display_name)+'</option>').join('')+'</select>');
    return '<header class="salary-editor-head"><div><small>จัดทำหนังสือรับรองเงินเดือน</small><h2>'+e(num(r))+' — '+e(personOf(d,r.owner_id))+'</h2></div>'+badge(r.status)+'</header>'+
      note('ตรวจสอบข้อมูลกับทะเบียนและเงินเดือนจริงก่อนบันทึก ข้อมูลจากโปรไฟล์เป็นข้อมูลที่บุคลากรกรอกเอง')+
      '<form data-form="salary-draft" data-id="'+e(r.id)+'"><div class="module-grid">'+
      field('ชื่อ–นามสกุล',input('person_name','required maxlength="200" value="'+val('person_name',M.person(p))+'"'))+
      field('ตำแหน่ง',input('position','required maxlength="200" value="'+val('position',p?.position||'')+'"'))+
      field('ประเภทบุคลากร',input('staff_type','required maxlength="120" value="'+val('staff_type',p?.staff_type||'')+'"'))+
      field('สังกัด',input('organization','required maxlength="300" value="'+val('organization',[org?.faculty,org?.division,org?.unit].filter(Boolean).join(' / '))+'"'))+
      field('อัตราเงินเดือน (บาท)',input('salary','type="number" min="0.01" max="9999999" step="0.01" required value="'+val('salary')+'" placeholder="กรอกเงินเดือนจริง"'))+
      field('เลขที่หนังสือ (เว้นว่างได้ในร่าง)',input('number','maxlength="100" value="'+val('number')+'" placeholder="เลขหนังสือที่ได้รับจัดสรร"'))+
      field('วันที่ออกหนังสือ (วันที่เสนอในร่าง)',input('issued_on','type="date" required value="'+val('issued_on',thaiToday())+'"'))+
      field('วัตถุประสงค์',input('purpose','required maxlength="600" value="'+val('purpose',r.purpose)+'"'))+
      choices('signer_id','ผู้มีอำนาจลงนาม')+
      field('ตำแหน่งผู้ลงนาม',input('signer_position','maxlength="200" value="'+val('signer_position')+'"'))+
      choices('reviewer_id','ผู้ตรวจสอบ')+choices('approver_id','ผู้อนุมัติ')+
      '</div><div class="salary-actions"><button type="submit" class="btn primary">'+ic('save',18)+' สร้าง / บันทึกหนังสือรับรอง</button>'+
      btn('ดูตัวอย่าง A4','salary-preview',r.id,'light','file')+
      btn('เสนออนุมัติและลงนาม','salary-submit',r.id,'salary-orange','pen')+'</div></form>'+
      '<div class="intro">'+(old?'บันทึกร่างล่าสุด '+e(M.date(old.updated_at,true)):'ยังไม่ได้บันทึกฉบับร่าง')+'</div>'+
      '<p class="intro">สร้างร่างได้แม้ยังไม่มีผู้รับผิดชอบครบ การเสนอจริงต้องมีผู้ตรวจสอบ ผู้อนุมัติ ผู้ลงนาม 3 บัญชีแยกจากผู้เสนอ และระบุเลขหนังสือ</p>'+
      btn('กลับรายละเอียดคำขอ','request-detail',r.id);
  }
  function salaryContent(x){
    return ['ที่ '+(x.number||'................................'),'วันที่ '+M.date(x.issued_on),'หนังสือรับรองเงินเดือน',
    'หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า '+x.person_name+' เป็น'+x.staff_type+' ของมหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น ดำรงตำแหน่ง '+x.position+' สังกัด '+x.organization+' ได้รับอัตราเงินเดือน '+Number(x.salary).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2})+' บาทต่อเดือน',
    'ออกให้เพื่อ '+x.purpose,'ลงชื่อ ................................................','('+ (x.signer_name||'ยังไม่กำหนดผู้ลงนาม') +')',x.signer_position||'ตำแหน่งผู้มีอำนาจลงนาม'].join('\n\n');
  }
  function salaryPreview(d,r,x){
    return '<section class="salary-paper"><div class="salary-draft-mark">ฉบับร่าง — ยังไม่ใช่หนังสือรับรองที่ออกแล้ว</div><div class="salary-letterhead">มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน<br>วิทยาเขตขอนแก่น</div><h2>หนังสือรับรองเงินเดือน</h2><div class="salary-lettertext">'+e(salaryContent(x))+'</div><p class="salary-paper-foot">เอกสารร่าง '+e(num(r))+' • ไม่มีลายเซ็น • แบบรอตรวจสอบ</p></section><div class="toolbar no-print">'+btn('พิมพ์ร่าง / บันทึก PDF','salary-print',r.id,'primary','print')+' '+btn('กลับไปแก้ไข','salary-editor',r.id,'light')+'</div>';
  }
  function requestDetail(d, r) {
    const can = ['hr','admin'].includes(d.role) && M.transitions[r.status].length;
    return (
      '<header class="dialog-title"><div><small>มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น</small><p>ใบรับคำขอหนังสือรับรอง · แผนกงานบริหารงานบุคคล</p>' +
      (HRData.demo ? '<small>ตัวอย่างสำหรับทดลองระบบ</small>' : '') +
      '<h2>' +
      num(r) +
      '</h2></div>' +
      badge(r.status) +
      '</header><dl>' +
      [
        ['ประเภทเอกสาร', M.kinds[r.kind]],
        ['ผู้ยื่นคำขอ', personOf(d, r.owner_id)],
        ['วันที่ยื่นคำขอ', M.date(r.created_at, true)],
        ['วัตถุประสงค์', r.purpose],
        ['จำนวน', r.copies + ' ฉบับ'],
        ['ปรับปรุงล่าสุด', M.date(r.updated_at, true)],
        ...(r.note ? [['ข้อความจากเจ้าหน้าที่', r.note]] : []),
      ]
        .map(([k, v]) => '<dt>' + e(k) + '</dt><dd>' + e(v) + '</dd>')
        .join('') +
      '</dl><div class="toolbar no-print">' +
      btn('พิมพ์ใบรับคำขอ', 'print', '', 'light', 'print') +
      (['hr','admin'].includes(d.role)&&r.kind==='salary'&&['submitted','review'].includes(r.status)?btn('จัดทำหนังสือรับรอง','salary-editor',r.id,'primary','file'):'') +
      (r.document_path && ['ready', 'done'].includes(r.status)
        ? btn('ดาวน์โหลด PDF', 'download', r.id, 'light', 'download')
        : '') +
      '</div>' +
      (can
        ? '<form class="process no-print" data-form="process" data-id="' +
          e(r.id) +
          '"><h3>ดำเนินการคำขอ</h3>' +
          field(
            'สถานะถัดไป',
            select(
              'status',
              M.transitions[r.status].map((s) => opt(s, M.stages[s])).join(''),
            ),
          ) +
          field(
            'ข้อความถึงผู้ขอ',
            '<textarea name="note" rows="2" maxlength="600">' +
              e(r.note) +
              '</textarea>',
          ) +
          '<div id="pdf-field" hidden>' +
          field(
            'แนบ PDF เมื่อต้องการส่งเอกสารออนไลน์' +
              (HRData.demo ? ' (ไม่เกิน 512 KB)' : ' (ไม่เกิน 5 MB)'),
            input('file', 'type="file" accept=".pdf,application/pdf"'),
          ) +
          '</div>' +
          saveButton('บันทึกสถานะ') +
          '</form>'
        : '')
    );
  }
  function loginCard(mode = 'login') {
    const brand='';
    if (HRData.demo) return '<section class="login-box campus-auth">' +brand+
      '<p class="intro">เลือกบทบาทเพื่อทดลองใช้งานด้วยข้อมูลสมมติ</p><div class="login-roles">'+
      btn('ทดลองเป็นบุคลากร','role',M.demoUser,'primary','user')+
      btn('ทดลองเป็นเจ้าหน้าที่ HR','role',M.demoHR,'light','brief')+'</div></section>';
    const emailInfo='<p class="sso-domain">สำหรับอีเมลมหาวิทยาลัย <strong>@rmuti.ac.th</strong> เท่านั้น</p>';
    if (mode === 'sent') return '<section class="login-box campus-auth">'+brand+
      '<div class="auth-success" role="status"><h2>กรุณาตรวจสอบอีเมลของคุณ</h2>'+
      '<p>ระบบรับคำขอสมัครแล้ว โปรดเปิดกล่องจดหมายมหาวิทยาลัยและกดลิงก์ยืนยันอีเมล</p>'+
      '<p>หลังยืนยันเสร็จ ให้กลับมาที่ระบบเพื่อเข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ตั้งไว้</p>'+
      '<p>หากไม่พบอีเมล ลองตรวจโฟลเดอร์จดหมายขยะ และติดต่อผู้ดูแลระบบหากยังไม่ได้รับ</p></div>'+
      '<button type="button" class="auth-switch" data-action="show-login">กลับหน้าเข้าสู่ระบบ</button>'+
      '</section>';
    if (mode === 'forgot') return '<section class="login-box campus-auth">'+brand+
      '<h2 class="auth-subtitle">ตั้งรหัสผ่านใหม่</h2><p class="intro">กรอกอีเมลมหาวิทยาลัยที่ใช้สมัคร เพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>'+
      '<form data-form="forgot-password">'+
      field('อีเมลมหาวิทยาลัย',input('email','type="email" autocomplete="email" placeholder="name@rmuti.ac.th" required'))+
      saveButton('ส่งอีเมลตั้งรหัสผ่านใหม่','arrow')+'</form>'+
      '<button type="button" class="auth-switch" data-action="show-login">กลับหน้าเข้าสู่ระบบ</button></section>';
    if (mode === 'reset-sent') return '<section class="login-box campus-auth">'+brand+
      '<div class="auth-success"><h2>ตรวจสอบกล่องจดหมายของคุณ</h2>'+
      '<p>หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้</p></div>'+
      '<button type="button" class="auth-switch" data-action="show-login">กลับหน้าเข้าสู่ระบบ</button></section>';
    if (mode === 'recover') return '<section class="login-box campus-auth">'+brand+
      '<h2 class="auth-subtitle">กำหนดรหัสผ่านใหม่</h2>'+
      '<form data-form="set-password">'+
      field('รหัสผ่านใหม่ (อย่างน้อย 10 ตัวอักษร)',input('password','type="password" minlength="10" autocomplete="new-password" required'))+
      field('ยืนยันรหัสผ่านใหม่',input('confirm_password','type="password" minlength="10" autocomplete="new-password" required'))+
      saveButton('บันทึกรหัสผ่านใหม่','save')+'</form></section>';
    if (mode === 'register') return '<section class="login-box campus-auth">'+brand+
      '<h2 class="auth-subtitle">ลงทะเบียนบุคลากรใหม่</h2>'+emailInfo+
      '<p class="intro">สมัครด้วยอีเมลมหาวิทยาลัยและยืนยันอีเมลด้วยตัวเอง ไม่ต้องรอ Admin อนุมัติ</p>'+
      '<form data-form="signup" autocomplete="on">'+
      '<div class="auth-two-col">'+
      field('คำนำหน้าชื่อ',select('prefix',[
        opt('','กรุณาเลือก'),opt('นาย','นาย'),opt('นาง','นาง'),opt('นางสาว','นางสาว'),
        opt('ดร.','ดร.'),opt('ผศ.','ผศ.'),opt('รศ.','รศ.'),opt('ศ.','ศ.')
      ].join(''),'required'))+
      field('ชื่อจริง',input('first_name','required autocomplete="given-name" minlength="1" maxlength="80"'))+
      '</div>'+
      field('นามสกุล',input('last_name','required autocomplete="family-name" minlength="1" maxlength="80"'))+
      field('อีเมลมหาวิทยาลัย',input('email','type="email" autocomplete="email" placeholder="name@rmuti.ac.th" required'))+
      field('ตั้งรหัสผ่าน (อย่างน้อย 10 ตัวอักษร)',input('password','type="password" minlength="10" maxlength="128" autocomplete="new-password" required'))+
      field('ยืนยันรหัสผ่าน',input('confirm_password','type="password" minlength="10" maxlength="128" autocomplete="new-password" required'))+
      '<p class="sso-approval-note">สิทธิ์เริ่มต้นคือ “บุคลากร” (Staff) โดยไม่สามารถอนุมัติหรือลงนามแทน HR ได้</p>'+
      saveButton('สมัครสมาชิกและส่งอีเมลยืนยัน','arrow')+'</form>'+
      '<button type="button" class="auth-switch" data-action="show-login">มีบัญชีแล้ว? เข้าสู่ระบบ</button>'+
      '</section>';
    return '<section class="login-box campus-auth">'+brand+
      '<h2 class="auth-subtitle">เข้าสู่ระบบ</h2>'+emailInfo+
      '<form data-form="login">'+
      field('อีเมลมหาวิทยาลัย',input('email','type="email" autocomplete="username" placeholder="name@rmuti.ac.th" required'))+
      '<div class="campus-password"><label class="field" for="campus-password"><span>รหัสผ่าน</span><span class="campus-password-input">'+ic('shield',19)+'<input id="campus-password" name="password" type="password" autocomplete="current-password" placeholder="กรอกรหัสผ่าน" required></span></label><button class="campus-eye" type="button" data-action="toggle-login-password" aria-label="แสดงรหัสผ่าน" aria-pressed="false"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></button></div>'+
      '<div class="campus-login-meta"><span>'+ic('shield',15)+' บัญชีมหาวิทยาลัย</span><button type="button" class="auth-switch" data-action="show-forgot">ลืมรหัสผ่าน?</button></div>'+saveButton('เข้าสู่ระบบ','logout')+'</form>'+
      '<div class="campus-auth-secondary">'+
      '<button type="button" class="campus-register" data-action="show-signup">'+ic('user',20)+' สมัครสมาชิกด้วยอีเมลมหาวิทยาลัย</button>'+
      '<div class="campus-or"><span>หรือ</span></div>'+
      '<button type="button" class="campus-help" data-action="public-login-info" data-id="help">'+ic('help',20)+' คู่มือการใช้งาน</button>'+
      '</div><p class="sso-approval-note">ผู้สมัครใหม่ต้องยืนยันอีเมลก่อนใช้งาน · RMUTI SSO ยังไม่เปิดใช้งาน</p>'+
      '</section>';
  }

  function login(mode='login') {
    const nav = [['home','หน้าหลัก'],['services','การให้บริการ'],['privacy','นโยบายคุ้มครองข้อมูลส่วนบุคคล'],['terms','ข้อกำหนดการใช้งาน'],['contact','ช่องทางการติดต่อ']];
    const links=nav.map(([key,label])=>'<button type="button" '+(key==='home'?'class="current" aria-current="page" data-action="login-home"':'data-action="public-login-info" data-id="'+key+'"')+'>'+e(label)+'</button>').join('');
    return '<main class="login campus-login" id="content" tabindex="-1">'+
      '<aside class="campus-photo" aria-label="อาคารมหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น"><img class="campus-building" src="./assets/kkc-building.webp" alt="อาคารมหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น" fetchpriority="high"><nav class="campus-nav" aria-label="เมนูหน้าเข้าสู่ระบบ">'+links+'</nav><div class="campus-photo-caption"><span></span><div><strong>RMUTI KHON KAEN</strong><small>Human Resources Information System</small></div></div></aside>'+
      '<section class="campus-left"><div class="campus-inner">'+
      '<div class="campus-brand"><img class="campus-crest" src="./assets/rmuti-crest.png" alt="ตรามหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน"><div class="campus-brand-divider"></div><div class="campus-hr"><img src="./assets/hr-wordmark.svg" alt="Human Resources"><div class="campus-hr-th">แผนกงานบริหารงานบุคคล</div><div class="campus-hr-kkc">มทร.อีสาน วิทยาเขตขอนแก่น</div></div></div>'+
      '<div class="campus-intro"><span class="campus-accent"></span><h1>ระบบบริหารจัดการสารสนเทศ<br><span>แผนกงานบริหารงานบุคคล</span></h1><p>มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน<br class="campus-mobile-break"> วิทยาเขตขอนแก่น</p></div>'+
      loginCard(mode)+
      '<footer class="campus-footer">RMUTI HR SMART MIS <span>·</span> ONE STOP HR SERVICE</footer>'+
      '</div></section></main>';
  }

  return {
    layout,
    page,
    ic,
    btn,
    orgOptions,
    orderTable,
    requestDetail,
    salaryEditor,salaryContent,salaryPreview,
    login,
    num,
  };
})();
