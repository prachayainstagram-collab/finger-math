(function(){
  const $=id=>document.getElementById(id);
  function makeHead(kicker,title,desc){
    const d=document.createElement('div');d.className='teacher-page-head';
    d.innerHTML=`<div><span>${kicker}</span><h2>${title}</h2><p>${desc}</p></div>`;return d;
  }
  function show(name){
    document.querySelectorAll('.teacher-clean-page').forEach(p=>p.classList.toggle('active',p.dataset.teacherPage===name));
    document.querySelectorAll('.teacher-clean-nav button').forEach(b=>b.classList.toggle('active',b.dataset.teacherPage===name));
    localStorage.setItem('fingerMath_teacherPage',name);
    document.getElementById('screenMenu')?.scrollTo({top:0,behavior:'smooth'});
  }
  function action(icon,title,desc,fn){
    const b=document.createElement('button');b.type='button';b.className='teacher-action-card';
    b.innerHTML=`<i class="${icon}"></i><span><strong>${title}</strong><small>${desc}</small></span>`;b.onclick=fn;return b;
  }
  function init(){
    const tab=$('tabTeacher'), roster=$('tabRoster'), workspace=$('teacherDataWorkspace');
    if(!tab||!workspace||$('teacherCleanShell'))return false;
    const original=[...tab.children];
    const banner=original[0], info=original[1], modeGrid=original[2], studentSelect=original[3], skillGrid=original[4], actionGrid=original[5];
    const workspaceCards=[...workspace.children];
    const questionCard=workspaceCards[0], uploadCard=workspaceCards[1];
    const shell=document.createElement('div');shell.id='teacherCleanShell';shell.className='teacher-clean-shell';
    const side=document.createElement('aside');side.className='teacher-clean-sidebar';
    side.innerHTML=`<div class="teacher-clean-brand"><span>TEACHER WORKSPACE</span><strong>ศูนย์จัดการครู</strong><small>แยกงานเป็นหน้า ลดความสับสน และเข้าถึงเครื่องมือได้เร็วขึ้น</small></div><nav class="teacher-clean-nav">
      <button data-teacher-page="overview"><i class="fa-solid fa-house"></i>ภาพรวม</button>
      <button data-teacher-page="students"><i class="fa-solid fa-users"></i>นักเรียน</button>
      <button data-teacher-page="assessment"><i class="fa-solid fa-clipboard-check"></i>ประเมิน</button>
      <button data-teacher-page="questions"><i class="fa-solid fa-book-open"></i>คลังโจทย์</button>
      <button data-teacher-page="reports"><i class="fa-solid fa-chart-column"></i>รายงานผล</button>
      <button data-teacher-page="settings"><i class="fa-solid fa-gear"></i>ตั้งค่า</button>
    </nav>`;
    side.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.teacherPage));
    const main=document.createElement('div');main.className='teacher-clean-main';
    const page=(name)=>{const p=document.createElement('section');p.className='teacher-clean-page';p.dataset.teacherPage=name;main.appendChild(p);return p};

    const overview=page('overview');overview.appendChild(makeHead('OVERVIEW','ภาพรวมสำหรับครู','เริ่มงานที่ใช้บ่อย ดูสถานะข้อมูล และเข้าถึงเมนูสำคัญจากจุดเดียว'));
    const stats=document.createElement('div');stats.className='teacher-grid-3';stats.innerHTML=`<div class="teacher-stat-card"><i class="fa-solid fa-users"></i><strong id="teacherStatStudents">—</strong><span>นักเรียนในรายชื่อ</span></div><div class="teacher-stat-card"><i class="fa-solid fa-list-check"></i><strong id="teacherStatSessions">—</strong><span>กิจกรรมที่บันทึก</span></div><div class="teacher-stat-card"><i class="fa-solid fa-bullseye"></i><strong id="teacherStatAccuracy">—</strong><span>ความแม่นยำเฉลี่ย</span></div>`;overview.appendChild(stats);
    const quick=document.createElement('div');quick.className='teacher-section-card';quick.style.marginTop='12px';quick.innerHTML='<h3 style="margin:0 0 12px;color:#172033">งานที่ใช้บ่อย</h3>';
    const qg=document.createElement('div');qg.className='teacher-action-grid';qg.append(
      action('fa-solid fa-circle-play','เริ่มประเมินก่อนเรียน','เลือกนักเรียนและเริ่ม Pre-Assessment',()=>{show('assessment');setTimeout(()=>app.startGame('teacher_pretest'),50)}),
      action('fa-solid fa-user-plus','เพิ่มหรือนำเข้านักเรียน','ไปยังหน้ารายชื่อนักเรียนและนำเข้า CSV',()=>show('students')),
      action('fa-solid fa-chart-bar','เปิด Dashboard','ดูภาพรวมคะแนนและความก้าวหน้า',()=>app.showDashboard()),
      action('fa-solid fa-file-csv','ส่งออก CSV','ดาวน์โหลดข้อมูลผลการทำกิจกรรม',()=>app.exportCSV())
    );quick.appendChild(qg);overview.appendChild(quick);

    const students=page('students');students.appendChild(makeHead('STUDENTS','จัดการนักเรียน','เพิ่มรายชื่อ เลือกนักเรียน นำเข้า CSV และตรวจสอบข้อมูลก่อนเริ่มประเมิน'));
    if(roster){roster.classList.remove('hidden');students.appendChild(roster)}
    if(uploadCard)students.appendChild(uploadCard);

    const assess=page('assessment');assess.appendChild(makeHead('ASSESSMENT','ประเมินทักษะ','เลือกนักเรียน หัวข้อ และรูปแบบการประเมินโดยไม่ปะปนกับเครื่องมืออื่น'));
    [banner,info,studentSelect,skillGrid,modeGrid].forEach(el=>el&&assess.appendChild(el));

    const questions=page('questions');questions.appendChild(makeHead('QUESTION BANK','คลังโจทย์','เพิ่มโจทย์ภาษาไทย–อังกฤษ กำหนดระดับความยาก และจัดการโจทย์บน Supabase'));
    if(questionCard)questions.appendChild(questionCard);else questions.innerHTML+='<div class="teacher-empty-note">ยังไม่พบส่วนคลังโจทย์</div>';

    const reports=page('reports');reports.appendChild(makeHead('REPORTS','รายงานและข้อมูล','ดู Dashboard ผลสูงสุด ส่งออกข้อมูล และจัดการประวัติผลการทำกิจกรรม'));
    if(actionGrid)reports.appendChild(actionGrid);
    const reportHelp=document.createElement('div');reportHelp.className='teacher-section-card';reportHelp.style.marginTop='12px';reportHelp.innerHTML='<h3 style="margin:0 0 8px;color:#172033">คำแนะนำ</h3><p style="color:#64748b;font-size:.82rem;line-height:1.55">ใช้ Dashboard สำหรับดูภาพรวม และใช้ Export CSV เมื่อต้องการนำข้อมูลไปวิเคราะห์ต่อใน Excel หรือแนบรายงานงานวิจัย</p>';reports.appendChild(reportHelp);

    const settings=page('settings');settings.appendChild(makeHead('SETTINGS','ตั้งค่าระบบครู','จัดการการเชื่อมต่อ การส่งข้อมูล และการล้างข้อมูลอย่างเป็นสัดส่วน'));
    const settingsList=document.createElement('div');settingsList.className='teacher-settings-list';settingsList.innerHTML=`<div class="teacher-settings-row"><div><strong>Google Sheets Sync</strong><small>ตั้งค่าลิงก์และส่งข้อมูลทั้งหมดไปยังชีท</small></div><button class="btn btn-cyan" id="teacherOpenSheet"><i class="fa-solid fa-table"></i> ตั้งค่า</button></div><div class="teacher-settings-row"><div><strong>ล้างข้อมูลคะแนน</strong><small>ล้างประวัติในเครื่อง ควรส่งออกข้อมูลก่อน</small></div><button class="btn btn-red" id="teacherClearData"><i class="fa-solid fa-trash"></i> ล้างข้อมูล</button></div><div class="teacher-settings-row"><div><strong>สถานะ Cloud</strong><small>${window.FMSupabase?.configured?'เชื่อมต่อ Supabase แล้ว':'ยังไม่ได้ตั้งค่า Supabase'}</small></div><span class="badge ${window.FMSupabase?.configured?'badge-practice':'badge-post'}">${window.FMSupabase?.configured?'พร้อม':'ออฟไลน์'}</span></div>`;settings.appendChild(settingsList);
    settingsList.querySelector('#teacherOpenSheet').onclick=()=>app.showSheetSync?.();
    settingsList.querySelector('#teacherClearData').onclick=()=>app.requestClearLeaderboard();

    shell.append(side,main);tab.innerHTML='';tab.appendChild(shell);
    workspace.remove();
    const saved=localStorage.getItem('fingerMath_teacherPage')||'overview';show(saved);
    setTimeout(()=>{
      try{
        const owner=app?.getOwnerId?.()||'guest';
        const rosterCount=(typeof LearnerStore!=='undefined'?(LearnerStore.load(owner)||[]).length:0);
        const stat=typeof ResearchStore!=='undefined'?ResearchStore.stats(owner):null;
        $('teacherStatStudents').innerText=String(rosterCount||0);
        $('teacherStatSessions').innerText=String(stat?.sessions?.length||0);
        $('teacherStatAccuracy').innerText=stat?`${stat.avgAcc||0}%`:'0%';
      }catch(e){}
    },120);
    return true;
  }
  function boot(){let n=0;const t=setInterval(()=>{n++;if(init()||n>30)clearInterval(t)},120)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
