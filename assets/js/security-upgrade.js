(function(){
'use strict';

const cfg=window.FM_CONFIG||{};
const cloud=window.FMSupabase;
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const toast=(msg,ok=true)=>{
  const d=document.createElement('div');
  d.textContent=msg;
  d.style.cssText=`position:fixed;left:50%;bottom:20px;transform:translateX(-50%);
    z-index:99999;padding:12px 16px;border-radius:12px;color:#fff;font-weight:800;
    background:${ok?'#047857':'#b91c1c'};box-shadow:0 12px 32px #0008;
    max-width:min(92vw,680px);text-align:center`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),3600);
};

if(window.CONFIG)CONFIG.confThreshold=Number(cfg.CAMERA_CONFIDENCE||0.70);

function clearLegacyAdultAuth(){
  [
    'fingerMath_accounts_v1',
    'fingerMath_session_v1',
    'fingerMath_accounts_v2',
    'fingerMath_session_v2'
  ].forEach(k=>localStorage.removeItem(k));
}

async function cloudAccount(){
  const session=await cloud?.getSession?.();
  if(!session)return null;
  const p=await cloud.getProfile();
  if(!p)throw new Error('ไม่พบโปรไฟล์ผู้ใช้ใน Supabase');
  return {
    id:p.id,
    name:p.display_name||p.email||'ผู้ใช้',
    email:p.email,
    role:p.role==='teacher'?'teacher':'parent',
    cloud:true
  };
}

function ensureParentPinGate(){
  if($('parentPinGate'))return;
  const tab=$('tabParent');
  if(!tab)return;

  const gate=document.createElement('section');
  gate.id='parentPinGate';
  gate.className='card parent-pin-gate hidden';
  gate.innerHTML=`
    <div class="parent-pin-heading">
      <i class="fa-solid fa-user-lock"></i>
      <div>
        <strong>ยืนยัน PIN นักเรียนก่อนใช้งานพื้นที่ผู้ปกครอง</strong>
        <span>กรอกรหัสผู้เรียนและ PIN ตัวเลข 4 หลักของนักเรียน</span>
      </div>
    </div>
    <div class="parent-pin-fields">
      <input id="parentStudentId" class="inp" autocomplete="off" placeholder="รหัสผู้เรียน (UUID)">
      <input id="parentStudentPin" class="inp" type="password" inputmode="numeric"
        maxlength="4" pattern="[0-9]{4}" autocomplete="one-time-code" placeholder="PIN 4 หลัก">
      <button id="parentPinVerifyBtn" class="btn btn-green">
        <i class="fa-solid fa-key"></i> ยืนยันและเปิดโปรไฟล์ลูก
      </button>
    </div>
    <p id="parentPinError" class="parent-pin-error"></p>`;
  tab.prepend(gate);

  $('parentPinVerifyBtn').onclick=verifyParentStudentPin;
}

function setParentWorkspaceLocked(locked){
  const tab=$('tabParent'),gate=$('parentPinGate');
  if(!tab||!gate)return;
  gate.classList.toggle('hidden',!locked);
  [...tab.children].forEach(child=>{
    if(child===gate)return;
    child.classList.toggle('parent-content-locked',locked);
    child.setAttribute('aria-hidden',locked?'true':'false');
  });
}

async function verifyParentStudentPin(){
  const id=$('parentStudentId')?.value.trim()||'';
  const pin=$('parentStudentPin')?.value.trim()||'';
  const err=$('parentPinError');
  err.textContent='';

  if(!/^[0-9a-f-]{36}$/i.test(id)){
    err.textContent='กรุณากรอกรหัสผู้เรียนให้ถูกต้อง';
    return;
  }
  if(!/^[0-9]{4}$/.test(pin)){
    err.textContent='PIN ต้องเป็นตัวเลข 4 หลัก';
    return;
  }

  try{
    const learner=await cloud.verifyStudentPin(id,pin);
    if(!learner)throw new Error('รหัสผู้เรียนหรือ PIN ไม่ถูกต้อง');

    const acc=window.app?.currentCloudAccount;
    if(!acc||acc.role!=='parent')throw new Error('ต้องเข้าสู่ระบบผู้ปกครองก่อน');

    // A parent may only unlock a child owned by the same account.
    if(learner.owner_id!==acc.id){
      throw new Error('โปรไฟล์นักเรียนนี้ไม่ได้อยู่ในบัญชีผู้ปกครองนี้');
    }

    app.selectedLearnerId=learner.student_id;
    DOM.startPlayerName.value=learner.full_name;
    DOM.startClassroom.value=learner.classroom||'';
    DOM.startPlayerName.readOnly=true;
    DOM.startClassroom.readOnly=true;

    sessionStorage.setItem('fm_parent_verified_student',JSON.stringify({
      studentId:learner.student_id,
      ownerId:learner.owner_id,
      fullName:learner.full_name,
      classroom:learner.classroom||''
    }));

    setParentWorkspaceLocked(false);
    toast(`เปิดโปรไฟล์ ${learner.full_name} แล้ว`);
  }catch(e){
    err.textContent=e.message||'ยืนยัน PIN ไม่สำเร็จ';
  }
}

function restoreParentVerification(acc){
  if(acc.role!=='parent')return;
  try{
    const saved=JSON.parse(sessionStorage.getItem('fm_parent_verified_student')||'null');
    if(saved&&saved.ownerId===acc.id){
      app.selectedLearnerId=saved.studentId;
      DOM.startPlayerName.value=saved.fullName||'';
      DOM.startClassroom.value=saved.classroom||'';
      DOM.startPlayerName.readOnly=true;
      DOM.startClassroom.readOnly=true;
      setParentWorkspaceLocked(false);
      return;
    }
  }catch(e){}
  setParentWorkspaceLocked(true);
}

function showAuthenticated(acc){
  if(!window.app||!acc)return;
  app.currentCloudAccount=acc;
  StudentSession.clear();
  DOM.screenAuth.classList.add('hidden');
  DOM.menu.classList.remove('hidden');
  app.renderNavUser?.();
  app.renderTopnavLinks?.();
  app.renderRoster?.();
  app.populateTeacherStudentSelect?.();
  app.switchMenuTab(acc.role==='teacher'?'teacher':'parent');
  window.FMRoleAccess?.apply?.(acc.role);

  ensureParentPinGate();
  if(acc.role==='parent')restoreParentVerification(acc);
  else setParentWorkspaceLocked(false);
}

async function submitAdultAuth(instance){
  DOM.authError.innerText='';
  const email=DOM.authEmail.value.trim().toLowerCase();
  const password=DOM.authPassword.value;
  const name=DOM.authName.value.trim();

  if(!cloud?.configured){
    DOM.authError.innerText='ยังไม่ได้ตั้งค่า Supabase';
    return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    DOM.authError.innerText='กรุณากรอกอีเมลให้ถูกต้อง';
    return;
  }
  if(password.length<6){
    DOM.authError.innerText='รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    return;
  }

  try{
    DOM.authSubmitBtn.disabled=true;
    DOM.authSubmitBtn.textContent='กำลังตรวจสอบ Supabase...';

    if(instance.authMode==='signup'){
      if(name.length<2)throw new Error('กรุณากรอกชื่อ-นามสกุล');
      const data=await cloud.signUp({name,email,password});
      if(!data.session){
        DOM.authError.innerText='สมัครสำเร็จ กรุณายืนยันอีเมล แล้วกลับมาเข้าสู่ระบบ';
        return;
      }
    }else{
      await cloud.signIn(email,password);
    }

    const acc=await cloudAccount();
    showAuthenticated(acc);
  }catch(e){
    DOM.authError.innerText=e.message||'เข้าสู่ระบบไม่สำเร็จ';
  }finally{
    DOM.authSubmitBtn.disabled=false;
    instance.setAuthMode(instance.authMode);
  }
}

window.FMSingleAuth={submit:submitAdultAuth};

if(window.GameManager){
  GameManager.prototype.logout=async function(){
    try{await cloud.signOut();}catch(e){}
    clearLegacyAdultAuth();
    StudentSession.clear();
    sessionStorage.removeItem('fm_parent_verified_student');
    this.currentCloudAccount=null;
    location.reload();
  };

  // Student login: exact 4-digit PIN.
  GameManager.prototype.renderStudentProfiles=function(){
    DOM.studentProfileEmpty.classList.add('hidden');
    DOM.studentProfileList.innerHTML=`<div class="card" style="padding:14px;display:grid;gap:9px;width:100%">
      <p style="font-size:.78rem;color:#94a3b8;line-height:1.5">
        กรอกรหัสผู้เรียนและ PIN ตัวเลข 4 หลัก ระบบไม่แสดงรายชื่อนักเรียนทั้งหมด
      </p>
      <input id="secureStudentId" class="inp" autocomplete="off" placeholder="รหัสผู้เรียน (UUID)">
      <input id="secureStudentPin" class="inp" type="password" inputmode="numeric"
        maxlength="4" pattern="[0-9]{4}" autocomplete="one-time-code" placeholder="PIN 4 หลัก">
      <button id="secureStudentLogin" class="btn btn-gold">
        <i class="fa-solid fa-key"></i> เข้าใช้งาน
      </button>
    </div>`;
    $('secureStudentLogin').onclick=()=>this.secureStudentLogin();
  };

  GameManager.prototype.secureStudentLogin=async function(){
    const id=$('secureStudentId').value.trim();
    const pin=$('secureStudentPin').value.trim();
    if(!/^[0-9a-f-]{36}$/i.test(id)||!/^[0-9]{4}$/.test(pin)){
      DOM.authError.innerText='รหัสผู้เรียนหรือ PIN 4 หลักไม่ถูกต้อง';
      return;
    }
    try{
      const learner=await cloud.verifyStudentPin(id,pin);
      if(!learner)throw new Error('ไม่พบผู้เรียนหรือ PIN ไม่ถูกต้อง');
      this.selectedLearnerId=learner.student_id;
      DOM.startPlayerName.value=learner.full_name;
      DOM.startClassroom.value=learner.classroom||'';
      this.onStudentAuthed(
        learner.owner_id,
        {id:learner.student_id,name:learner.full_name,classroom:learner.classroom||'—'}
      );
    }catch(e){
      DOM.authError.innerText=e.message||'เข้าใช้งานไม่สำเร็จ';
    }
  };

  // Every new student gets an exact 4-digit PIN.
  GameManager.prototype.addLearner=async function(){
    const name=DOM.rosterNewName.value.trim();
    const classroom=DOM.rosterNewClassroom.value.trim();
    if(!name){toast('กรุณากรอกชื่อนักเรียน',false);return;}

    const pin=prompt(`ตั้ง PIN ตัวเลข 4 หลักสำหรับ ${name}`,'');
    if(pin===null)return;
    if(!/^[0-9]{4}$/.test(pin)){
      toast('PIN ต้องเป็นตัวเลข 4 หลักเท่านั้น',false);
      return;
    }

    try{
      const row=await cloud.createStudent({name,classroom,pin});
      DOM.rosterNewName.value='';
      DOM.rosterNewClassroom.value='';
      toast(`เพิ่มนักเรียนแล้ว — รหัสผู้เรียน: ${row.id}`);
      await this.renderRoster();
    }catch(e){
      toast(e.message||'เพิ่มนักเรียนไม่สำเร็จ',false);
    }
  };

  GameManager.prototype.renderRoster=async function(){
    if(!DOM.rosterList)return;
    try{
      const rows=await cloud.listStudents();
      DOM.rosterList.innerHTML=rows.length?rows.map(s=>`
        <div class="card" style="padding:10px 12px;display:flex;justify-content:space-between;
          gap:10px;align-items:center">
          <div>
            <b>${escapeHtml(s.full_name)}</b>
            <small style="display:block;color:#64748b">
              ${escapeHtml(s.classroom||'—')} · รหัสผู้เรียน: ${s.id}
            </small>
            <small style="display:block;color:#7c3aed;font-weight:700">
              PIN ถูกซ่อนเพื่อความปลอดภัย หากลืมให้สร้าง PIN ใหม่
            </small>
          </div>
          <button class="btn btn-red" data-delete-student="${s.id}">ปิดใช้งาน</button>
        </div>`).join('')
        :'<p style="color:#64748b">ยังไม่มีรายชื่อนักเรียน</p>';

      DOM.rosterList.querySelectorAll('[data-delete-student]').forEach(btn=>{
        btn.onclick=async()=>{
          if(confirm('ปิดใช้งานนักเรียนคนนี้หรือไม่?')){
            await cloud.deleteStudent(btn.dataset.deleteStudent);
            this.renderRoster();
          }
        };
      });
    }catch(e){
      DOM.rosterList.innerHTML=`<p style="color:#b91c1c">${escapeHtml(e.message)}</p>`;
    }
  };
}

async function boot(){
  clearLegacyAdultAuth();
  ensureParentPinGate();

  if(!cloud?.configured){
    DOM.authError.innerText='ยังไม่ได้ตั้งค่า Supabase';
    return;
  }

  try{
    const acc=await cloudAccount();
    if(acc)showAuthenticated(acc);
  }catch(e){
    console.warn('Cloud session boot:',e);
  }

  cloud.onAuthStateChange(async(event,session)=>{
    if(session&&['SIGNED_IN','TOKEN_REFRESHED','INITIAL_SESSION'].includes(event)){
      try{showAuthenticated(await cloudAccount());}catch(e){console.warn(e);}
    }
    if(event==='SIGNED_OUT'){
      sessionStorage.removeItem('fm_parent_verified_student');
    }
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}
})();
