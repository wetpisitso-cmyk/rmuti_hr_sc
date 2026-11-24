'use strict';
window.MIS = (() => {
  const kinds = {
    salary: 'หนังสือรับรองเงินเดือน',
    contract: 'หนังสือสัญญาจ้าง ก.พ. 7',
  };
  const stages = {
    submitted: 'ส่งคำขอแล้ว',
    review: 'กำลังตรวจสอบ',
    ready: 'พร้อมรับเอกสาร',
    done: 'รับเอกสารแล้ว',
    rejected: 'ส่งคืนคำขอ',
  };
  const transitions = {
    submitted: ['review', 'rejected'],
    review: ['ready', 'rejected'],
    ready: ['done'],
    done: [],
    rejected: [],
  };
  const orgLabels = [
    'วิทยาเขต',
    'คณะ / หน่วยงาน',
    'กลุ่มสาขา / งาน',
    'สาขา / แผนก',
  ];
  const orgKeys = ['campus', 'faculty', 'division', 'unit'];
  const types = [
    'ข้าราชการ',
    'พนักงานในสถาบันอุดมศึกษา',
    'พนักงานราชการ',
    'ลูกจ้างประจำ',
    'ลูกจ้างเงินรายได้',
  ];
  const positions = [
    'นักวิชาการศึกษา',
    'เจ้าหน้าที่บริหารงานทั่วไป',
    'นักวิชาการคอมพิวเตอร์',
    'นักทรัพยากรบุคคล',
    'อาจารย์',
    'ช่างเทคนิค',
  ];
  const tracks = ['สายสนับสนุน', 'สายวิชาการ'];
  const pages = {
    home: 'หน้าหลัก',
    profile: 'ข้อมูลส่วนตัวทั่วไป',
    signature: 'ลายเซ็นอิเล็กทรอนิกส์',
    assets: 'ครุภัณฑ์ส่วนตัว',
    rights: 'สิทธิ์การใช้งาน',
    feedback: 'ประเมินระบบ',
    requests: 'สรุปข้อมูลการขอหนังสือรับรอง',
    salary: kinds.salary,
    contract: kinds.contract,
    orders: 'คำสั่งทั้งหมด',
    myorders: 'คำสั่งของท่าน',
    search: 'ค้นหาคำสั่ง',
    activities: 'รายการกิจกรรม',
    history: 'ประวัติการลงทะเบียน',
    performance: 'ระบบประเมินผลการปฏิบัติราชการ',
    services: 'ระบบอื่นๆ สำหรับบุคลากร RMUTI',
    help: 'คู่มือการใช้งานระบบ',
    privacy: 'นโยบายคุ้มครองข้อมูลส่วนบุคคล',
    terms: 'ข้อกำหนดการใช้งาน',
    contact: 'ติดต่อเรา',
    hr: 'งานเจ้าหน้าที่ HR',
    admin: 'จัดการระบบและสิทธิ์',
    workflow: 'ระบบเสนอเอกสารและลงนาม',
    tasks: 'ศูนย์รวมงานและแจ้งเตือน',
    training: 'ประวัติการพัฒนาบุคลากร',
    education: 'ประวัติการศึกษา',
    positions: 'ประวัติการดำรงตำแหน่ง',
    directory: 'ทะเบียนบุคลากร',
    executive: 'Dashboard ผู้บริหาร',
  };
  const groups = [
    {
      label: 'ข้อมูลส่วนตัว',
      icon: 'user',
      ids: ['profile', 'signature', 'assets', 'rights', 'feedback'],
    },
    {
      label: 'ระบบขอหนังสือรับรอง',
      icon: 'cert',
      ids: ['requests', 'salary', 'contract'],
    },
    {
      label: 'ระบบสืบค้นคำสั่ง',
      icon: 'file',
      ids: ['orders', 'myorders', 'search'],
    },
    {
      label: 'ระบบลงทะเบียนกิจกรรม',
      icon: 'calendar',
      ids: ['activities', 'history'],
    },
  ];
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const date = (value, withTime = false) =>
    value
      ? new Intl.DateTimeFormat('th-TH', {
          timeZone: 'Asia/Bangkok',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
        }).format(new Date(value))
      : '—';
  const uuid = () => crypto.randomUUID();
  const person = (p) =>
    p ? [p.prefix + p.first_name, p.last_name].join(' ') : '';
  const initial = (p) =>
    p ? p.first_name.charAt(0) + p.last_name.charAt(0) : 'HR';
  const demoUser = '00000000-0000-4000-8000-000000000001',
    demoHR = '00000000-0000-4000-8000-000000000002';
  function seed() {
    const timestamp = (days) =>
      new Date(Date.now() + days * 86400000).toISOString();
    const orgs = [
      [
        1,
        'ขอนแก่น',
        'สำนักงานวิทยาเขตขอนแก่น',
        'งานบริหารทรัพยากร',
        'แผนกงานบริหารงานบุคคล',
      ],
      [
        2,
        'ขอนแก่น',
        'สำนักงานวิทยาเขตขอนแก่น',
        'งานบริหารทรัพยากร',
        'แผนกงานการเงิน',
      ],
      [3, 'ขอนแก่น', 'คณะวิศวกรรมศาสตร์', 'สำนักงานคณบดี', 'งานบริหารทั่วไป'],
      [
        4,
        'ขอนแก่น',
        'คณะครุศาสตร์อุตสาหกรรม',
        'สำนักงานคณบดี',
        'งานบริหารทั่วไป',
      ],
      [
        5,
        'ขอนแก่น',
        'คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ',
        'สำนักงานคณบดี',
        'งานบริหารทั่วไป',
      ],
    ].map(([id, campus, faculty, division, unit]) => ({
      id,
      campus,
      faculty,
      division,
      unit,
    }));
    const profiles = [
      {
        id: demoUser,
        prefix: 'นางสาว',
        first_name: 'นภา',
        last_name: 'ตัวอย่าง',
        staff_type: types[1],
        position: positions[0],
        track: tracks[0],
        org_id: 1,
        verified_at: null,
      },
      {
        id: demoHR,
        prefix: 'นาย',
        first_name: 'ภูมิ',
        last_name: 'สมมติ',
        staff_type: types[1],
        position: positions[3],
        track: tracks[0],
        org_id: 1,
        verified_at: timestamp(-3),
      },
    ];
    return {
      orgs,
      profiles,
      roles: { [demoUser]: 'staff', [demoHR]: 'hr' },
      signatures: [],
      feedback: [],
      requests: [],
      assets: [
        {
          id: uuid(),
          owner_id: demoUser,
          code: 'DEMO-001',
          title: 'คอมพิวเตอร์สำนักงาน',
          location: 'ห้องปฏิบัติงาน',
          issued_on: timestamp(-30).slice(0, 10),
        },
      ],
      orders: [
        {
          id: uuid(),
          number: 'ทดสอบ 01/2569',
          title: 'แต่งตั้งคณะทำงานจัดกิจกรรมบุคลากร',
          issued_on: timestamp(-5).slice(0, 10),
          recipient_id: null,
          body: 'คำสั่งตัวอย่างสำหรับฝึกใช้งานระบบสืบค้นคำสั่ง',
        },
        {
          id: uuid(),
          number: 'ทดสอบ 02/2569',
          title: 'มอบหมายหน้าที่ประจำหน่วยงาน',
          issued_on: timestamp(-2).slice(0, 10),
          recipient_id: demoUser,
          body: 'ตัวอย่างคำสั่งเฉพาะบุคคลสำหรับทดสอบการแยกสิทธิ์',
        },
      ],
      activities: [
        {
          id: uuid(),
          title: 'อบรมการใช้ระบบสารสนเทศบุคลากร',
          venue: 'ห้องประชุมสำนักงานวิทยาเขต',
          starts_at: timestamp(8),
          capacity: 30,
          taken: 0,
        },
        {
          id: uuid(),
          title: 'แลกเปลี่ยนเรียนรู้งานบริการบุคลากร',
          venue: 'ห้องอบรมคอมพิวเตอร์',
          starts_at: timestamp(15),
          capacity: 12,
          taken: 0,
        },
      ],
      registrations: [],
      assessments: [],
    };
  }
  function validLink(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }
  return {
    kinds,
    stages,
    transitions,
    orgLabels,
    orgKeys,
    types,
    positions,
    tracks,
    pages,
    groups,
    esc,
    date,
    uuid,
    person,
    initial,
    seed,
    demoUser,
    demoHR,
    validLink,
  };
})();
