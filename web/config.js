// โครงการใหม่ rmuti_hr_sc เท่านั้น (ไม่ใช่ rmuti.hr.kkc)
window.HR_CONFIG = {
  mode: 'supabase',
  // อีเมลบุคลากรของมหาวิทยาลัย (คงการตรวจสิทธิ์ใน Supabase hr_members)
  universityEmailDomain: 'rmuti.ac.th',
  // เปิดใช้งานหลังมหาวิทยาลัยอนุมัติ RMUTI OAuth service และตั้งค่า
  // Edge Function รักษา OAuth state, callback, token exchange และ session จริงแล้วเท่านั้น
  rmutiSso: {
    enabled: false,
    startUrl: '',
  },
  supabaseUrl: 'https://kaqnnyexlojscvrlpoex.supabase.co',
  publishableKey: 'sb_publishable_eyfR4UHI6feTmnzNHfaTwQ_0rmLxneR',
  performancePortalUrl: '',
  staffPortalUrl: '',
  privacyUrl: 'https://rmuti.ac.th/one/privacy-policy-2/',
  termsUrl: '',
  contactText: 'แผนกงานบริหารงานบุคคล มทร.อีสาน วิทยาเขตขอนแก่น',
};
