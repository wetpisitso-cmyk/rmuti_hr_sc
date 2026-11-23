'use strict';
window.HRWorkflow=(()=>{
 const esc=MIS.esc,dt=(v)=>MIS.date(v,true);
 const stages={pending_review:'รอตรวจสอบ',pending_approval:'รออนุมัติ',pending_signature:'รอลงนาม',returned:'ส่งคืนแก้ไข',rejected:'ไม่อนุมัติ',signed:'ลงนามแล้ว'};
 const labels={submit:'เสนอเอกสาร',review:'ตรวจสอบผ่าน',approve:'อนุมัติ',sign:'ลงนาม',return:'ส่งกลับแก้ไข',reject:'ไม่อนุมัติ',resubmit:'เสนอใหม่'};
 const officer=(d,id)=>d.officers.find(x=>x.id===id)?.display_name||MIS.person(d.profiles.find(x=>x.id===id))||'บุคลากร';
 const status=(s)=>'<span class="workflow-status st-'+esc(s)+'">'+esc(stages[s]||s)+'</span>';
 function page(d){
   const options=(d.officers||[]).filter(x=>x.id!==d.id);
   const pick=(name,title)=>'<label class="field"><span>'+title+'</span><select name="'+name+'" required><option value="">เลือกผู้รับผิดชอบ</option>'+options.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.display_name)+'</option>').join('')+'</select></label>';
   const form=HRData.demo?'<div class="note">เข้าสู่ระบบ Supabase เพื่อเสนอเอกสารจริง</div>':
   options.length<3?'<div class="note">ต้องมีเจ้าหน้าที่ HR ต่างจากผู้เสนอ 3 บัญชี เพื่อแยกผู้ตรวจสอบ ผู้อนุมัติ และผู้ลงนาม</div>':
   '<form data-form="workflow-propose"><div class="field"><span>เรื่อง</span><input name="title" minlength="5" maxlength="220" required placeholder="ระบุเรื่องเอกสาร"></div>'+
   '<label class="field"><span>เนื้อหาบันทึกข้อความ</span><textarea name="content" rows="8" minlength="10" maxlength="16000" required></textarea></label>'+
   '<div class="grid three">'+pick('reviewer_id','ผู้ตรวจสอบ')+pick('approver_id','ผู้อนุมัติ')+pick('signer_id','ผู้ลงนาม')+'</div>'+
   '<p class="intro">ผู้เสนอ ผู้ตรวจสอบ ผู้อนุมัติ และผู้ลงนาม ต้องเป็นคนละบัญชี</p><div class="actions"><button type="submit" class="btn primary">เสนอเอกสาร</button></div></form>';
   const rows=(d.workflows||[]).slice().sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(r=>
    '<tr><td><strong>'+esc(r.title)+'</strong></td><td>'+esc(officer(d,r.requester_id))+'</td><td>'+status(r.status)+'</td><td>'+esc(dt(r.updated_at))+'</td><td><button type="button" class="btn light" data-action="workflow-detail" data-id="'+esc(r.id)+'">รายละเอียด</button></td></tr>').join('');
   return '<section class="panel"><div class="panel-title"><h2>เสนอเอกสารเข้าสู่ระบบ</h2></div>'+form+'</section>'+
    '<section class="panel"><div class="panel-title"><h2>เอกสารที่เกี่ยวข้องและงานที่ได้รับมอบหมาย</h2></div>'+
     (rows?'<div class="table-wrap"><table><thead><tr><th>เรื่อง</th><th>ผู้เสนอ</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<p class="intro">ยังไม่มีเอกสารที่เกี่ยวข้อง</p>')+'</section>'+
     '<section class="panel"><div class="panel-title"><h2>เส้นทางเอกสาร</h2></div><div class="workflow-steps"><span>เสนอเอกสาร</span><span>ตรวจสอบ</span><span>อนุมัติ</span><span>ลงนาม</span><span>เสร็จสิ้น</span></div><p class="intro">มีประวัติผู้ดำเนินการและค่า SHA-256 สำหรับตรวจสอบเนื้อหา แต่ยังไม่ใช่ลายเซ็นดิจิทัลแบบมีใบรับรอง</p></section>';
 }
 function signatureSVG(strokes){
   if(!Array.isArray(strokes))return '';
   const paths=[];
   for(const line of strokes.slice(0,150)){
     if(!Array.isArray(line))continue;
     const points=line.slice(0,800).filter(p=>Array.isArray(p)&&Number.isFinite(Number(p[0]))&&Number.isFinite(Number(p[1]))).map(p=>[Math.min(720,Math.max(0,Number(p[0]))),Math.min(200,Math.max(0,Number(p[1])))]);
     if(points.length) paths.push('<path d="'+points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ')+'"/>');
   }
   return paths.length?'<svg class="workflow-signature" viewBox="0 0 720 200" role="img" aria-label="ภาพลายเซ็น" fill="none" stroke="#193454" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+paths.join('')+'</svg>':'';
 }
 function detail(d,r){
  const events=(d.workflowEvents||[]).filter(x=>x.document_id===r.id).sort((a,b)=>a.id-b.id);
  const signature=events.find(x=>x.action==='sign');
  const steps={
   pending_review:r.reviewer_id===d.id?['review','return','reject']:[],
   pending_approval:r.approver_id===d.id?['approve','return','reject']:[],
   pending_signature:r.signer_id===d.id?['sign','return']:[],
  }[r.status]||[];
  const actionForm=steps.length?'<form class="no-print" data-form="workflow-advance" data-id="'+esc(r.id)+'"><h3>ดำเนินการ</h3>'+
   '<label class="field"><span>ผลการพิจารณา</span><select name="decision">'+steps.map(x=>'<option value="'+x+'">'+esc(labels[x])+'</option>').join('')+'</select></label>'+
   '<label class="field"><span>หมายเหตุ / เหตุผล</span><textarea name="note" rows="3" maxlength="1500"></textarea></label>'+
   '<div class="actions"><button class="btn primary" type="submit">ยืนยันการดำเนินการ</button></div></form>':'';
  const revise=r.status==='returned'&&r.requester_id===d.id?'<form class="no-print" data-form="workflow-revise" data-id="'+esc(r.id)+'"><h3>แก้ไขและเสนอใหม่</h3>'+
   '<label class="field"><span>รายละเอียดฉบับแก้ไข</span><textarea name="content" rows="7" maxlength="16000" required>'+esc(r.content)+'</textarea></label>'+
   '<label class="field"><span>คำชี้แจง</span><textarea name="note" maxlength="1500"></textarea></label><div class="actions"><button type="submit" class="btn primary">ส่งตรวจสอบใหม่</button></div></form>':'';
  const items=[['ผู้เสนอ',officer(d,r.requester_id)],['ผู้ตรวจสอบ',officer(d,r.reviewer_id)],['ผู้อนุมัติ',officer(d,r.approver_id)],['ผู้ลงนาม',officer(d,r.signer_id)],['วันที่เสนอ',dt(r.created_at)]];
  return '<section class="workflow-document"><p class="intro">ระบบเอกสาร มทร.อีสาน วิทยาเขตขอนแก่น</p><h2>'+esc(r.title)+'</h2>'+status(r.status)+
   '<dl>'+items.map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('')+'</dl>'+
   '<h3>เนื้อหาเอกสาร</h3><div class="workflow-body">'+esc(r.content)+'</div>'+
   (signature&&r.status==='signed'?'<div class="workflow-signed">ลงชื่อ'+signatureSVG(signature.signature_strokes)+'<p>('+esc(officer(d,signature.actor_id))+')</p><p>ลงนาม '+esc(dt(signature.created_at))+'</p></div>':'')+
   (r.signed_content_hash?'<p class="workflow-hash">SHA-256: <code>'+esc(r.signed_content_hash)+'</code></p>':'')+
   '<p class="workflow-disclaimer">การยืนยันบัญชีและภาพลายเซ็นนี้ยังไม่ใช่ลายเซ็นดิจิทัลแบบรับรอง และเอกสารที่พิมพ์เป็นเพียงสำเนาจากเว็บ</p></section>'+
   (r.status==='signed'?'<div class="toolbar no-print"><button type="button" class="btn primary" data-action="print">พิมพ์ / บันทึกเป็น PDF</button></div>':'')+
   '<div class="no-print"><h3>ประวัติการดำเนินการ</h3><ol class="workflow-history">'+events.map(x=>'<li><b>'+esc(labels[x.action]||x.action)+'</b> · '+esc(officer(d,x.actor_id))+' · '+esc(dt(x.created_at))+'<p>'+esc(x.note||'ไม่มีหมายเหตุ')+'</p></li>').join('')+'</ol>'+actionForm+revise+'</div>';
 }
 return {page,detail};
})();