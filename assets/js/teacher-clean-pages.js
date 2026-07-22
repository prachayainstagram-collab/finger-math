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
      action('fa-solid fa-circle-play','เริ่มประเมิน','เปิดขั้นตอนประเมินแบบแยกส่วน',()=>show('assessment')),
      action('fa-solid fa-user-plus','เพิ่มหรือนำเข้านักเรียน','ไปยังหน้ารายชื่อนักเรียนและนำเข้า CSV',()=>show('students')),
      action('fa-solid fa-chart-bar','เปิด Dashboard','ดูภาพรวมคะแนนและความก้าวหน้า',()=>app.showDashboard()),
      action('fa-solid fa-file-csv','ส่งออก CSV','ดาวน์โหลดข้อมูลผลการทำกิจกรรม',()=>app.exportCSV())
    );quick.appendChild(qg);overview.appendChild(quick);

    const students=page('students');students.appendChild(makeHead('STUDENTS','จัดการนักเรียน','เพิ่มรายชื่อ เลือกนักเรียน นำเข้า CSV และตรวจสอบข้อมูลก่อนเริ่มประเมิน'));
    if(roster){roster.classList.remove('hidden');students.appendChild(roster)}
    if(uploadCard)students.appendChild(uploadCard);

    const assess=page('assessment');assess.appendChild(makeHead('ASSESSMENT','ประเมินผลแบบเป็นขั้นตอน','ทำทีละขั้น: เลือกนักเรียน → ตั้งค่าโจทย์ → เลือกรูปแบบ → ตรวจสอบและเริ่ม'));
    const assessWizard=document.createElement('div');assessWizard.className='teacher-assessment-wizard';
    assessWizard.innerHTML=`
      <div class="teacher-assess-steps" role="tablist" aria-label="ขั้นตอนการประเมิน">
        <button type="button" class="active" data-assess-step="1"><span>1</span><b>นักเรียน</b><small>เลือกผู้รับการประเมิน</small></button>
        <button type="button" data-assess-step="2"><span>2</span><b>ตั้งค่าโจทย์</b><small>หัวข้อ จำนวนข้อ ความยาก</small></button>
        <button type="button" data-assess-step="3"><span>3</span><b>รูปแบบ</b><small>ก่อนเรียน ทักษะ หลังเรียน</small></button>
        <button type="button" data-assess-step="4"><span>4</span><b>ตรวจสอบ</b><small>ยืนยันก่อนเริ่ม</small></button>
      </div>
      <div class="teacher-assess-stage">
        <section class="teacher-assess-panel active" data-assess-panel="1">
          <div class="teacher-assess-title"><span>ขั้นที่ 1</span><h3>เลือกนักเรียน</h3><p>เลือกจากรายชื่อที่บันทึกไว้ หรือกรอกชื่อผู้เรียนในช่องข้อมูลด้านบน</p></div>
          <div id="teacherAssessmentStudentSlot" class="teacher-assess-slot"></div>
          <div class="teacher-assess-note"><i class="fa-solid fa-circle-info"></i><span>ควรตรวจสอบชื่อและห้องเรียนให้ถูกต้องก่อนเริ่ม เพราะข้อมูลจะถูกใช้ในรายงานผล</span></div>
        </section>
        <section class="teacher-assess-panel" data-assess-panel="2">
          <div class="teacher-assess-title"><span>ขั้นที่ 2</span><h3>ตั้งค่าโจทย์</h3><p>เลือกเฉพาะสิ่งที่ต้องการประเมินในรอบนี้</p></div>
          <div id="teacherAssessmentSkillSlot" class="teacher-assess-slot"></div>
          <div class="teacher-assess-setting-grid">
            <label><span>จำนวนข้อ</span><select id="teacherAssessmentQuestionCount" class="inp"><option value="5">5 ข้อ</option><option value="10" selected>10 ข้อ</option><option value="20">20 ข้อ</option></select></label>
            <label><span>ระดับความยาก</span><select id="teacherAssessmentDifficulty" class="inp"><option value="easy">ง่าย</option><option value="medium" selected>ปานกลาง</option><option value="hard">ท้าทาย</option></select></label>
          </div>
          <div class="teacher-assess-pass"><i class="fa-solid fa-award"></i><div><strong>เกณฑ์แนะนำ</strong><span>ความแม่นยำอย่างน้อย 80% และเวลาตอบเฉลี่ยไม่เกิน 5 วินาที</span></div></div>
        </section>
        <section class="teacher-assess-panel" data-assess-panel="3">
          <div class="teacher-assess-title"><span>ขั้นที่ 3</span><h3>เลือกรูปแบบการประเมิน</h3><p>เลือกเพียงหนึ่งรูปแบบสำหรับรอบนี้</p></div>
          <div class="teacher-assess-type-grid">
            <button type="button" data-assess-mode="teacher_pretest"><i class="fa-solid fa-circle-play"></i><strong>ก่อนเรียน</strong><small>ใช้ตรวจพื้นฐานก่อนเริ่มบทเรียน</small></button>
            <button type="button" class="active" data-assess-mode="teacher_assessment"><i class="fa-solid fa-clipboard-check"></i><strong>ประเมินทักษะ</strong><small>ใช้ประเมินรายหัวข้อระหว่างเรียน</small></button>
            <button type="button" data-assess-mode="teacher_posttest"><i class="fa-solid fa-flag-checkered"></i><strong>หลังเรียน</strong><small>ใช้เปรียบเทียบผลหลังจบบทเรียน</small></button>
          </div>
        </section>
        <section class="teacher-assess-panel" data-assess-panel="4">
          <div class="teacher-assess-title"><span>ขั้นที่ 4</span><h3>ตรวจสอบก่อนเริ่ม</h3><p>ตรวจรายละเอียดให้ครบ แล้วเริ่มประเมินเมื่อพร้อม</p></div>
          <div id="teacherAssessmentReview" class="teacher-assess-review"></div>
          <button type="button" id="teacherAssessmentStart" class="teacher-assess-start"><i class="fa-solid fa-play"></i><span><strong>เริ่มประเมิน</strong><small>เปิดกล้องและเริ่มจับเวลา</small></span></button>
          <div id="teacherAssessmentError" class="teacher-assess-error hidden"></div>
        </section>
      </div>
      <div class="teacher-assess-footer">
        <button type="button" id="teacherAssessBack" class="btn btn-ghost" disabled><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
        <span id="teacherAssessStepText">ขั้นที่ 1 จาก 4</span>
        <button type="button" id="teacherAssessNext" class="btn btn-primary">ถัดไป <i class="fa-solid fa-arrow-right"></i></button>
      </div>`;
    assess.appendChild(assessWizard);
    const studentSlot=assessWizard.querySelector('#teacherAssessmentStudentSlot');
    if(studentSelect){studentSelect.style.marginBottom='0';studentSlot.appendChild(studentSelect)}
    const skillSlot=assessWizard.querySelector('#teacherAssessmentSkillSlot');
    if(skillGrid){skillGrid.style.marginBottom='0';skillSlot.appendChild(skillGrid)}
    if(banner)banner.remove();if(info)info.remove();if(modeGrid)modeGrid.remove();

    let assessStep=1,assessMode='teacher_assessment';
    const panels=[...assessWizard.querySelectorAll('[data-assess-panel]')];
    const stepBtns=[...assessWizard.querySelectorAll('[data-assess-step]')];
    const modeBtns=[...assessWizard.querySelectorAll('[data-assess-mode]')];
    const backBtn=assessWizard.querySelector('#teacherAssessBack');
    const nextBtn=assessWizard.querySelector('#teacherAssessNext');
    const stepText=assessWizard.querySelector('#teacherAssessStepText');
    const review=assessWizard.querySelector('#teacherAssessmentReview');
    const err=assessWizard.querySelector('#teacherAssessmentError');
    const qCount=assessWizard.querySelector('#teacherAssessmentQuestionCount');
    const qDiff=assessWizard.querySelector('#teacherAssessmentDifficulty');
    function studentName(){
      const sel=$('teacherStudentSelect');
      if(sel&&sel.value){const o=sel.options[sel.selectedIndex];return (o?.textContent||'').replace(/^.*?—\s*/,'').trim()||o?.textContent||''}
      return $('startPlayerName')?.value?.trim()||'';
    }
    function topicName(){const s=$('testTopicSelect');return s?.options?.[s.selectedIndex]?.textContent||'ประเมินรวมทุกทักษะ'}
    function modeName(){return assessMode==='teacher_pretest'?'ประเมินก่อนเรียน':assessMode==='teacher_posttest'?'ประเมินหลังเรียน':'ประเมินทักษะ'}
    function refreshReview(){
      if(!review)return;
      review.innerHTML=`<div><span>นักเรียน</span><strong>${studentName()||'ยังไม่ได้เลือก'}</strong></div><div><span>หัวข้อ</span><strong>${topicName()}</strong></div><div><span>จำนวนข้อ</span><strong>${qCount.value} ข้อ</strong></div><div><span>ความยาก</span><strong>${qDiff.options[qDiff.selectedIndex].textContent}</strong></div><div><span>รูปแบบ</span><strong>${modeName()}</strong></div>`;
    }
    function setAssessStep(n){
      assessStep=Math.max(1,Math.min(4,n));
      panels.forEach(p=>p.classList.toggle('active',Number(p.dataset.assessPanel)===assessStep));
      stepBtns.forEach(b=>{const k=Number(b.dataset.assessStep);b.classList.toggle('active',k===assessStep);b.classList.toggle('done',k<assessStep)});
      backBtn.disabled=assessStep===1;nextBtn.classList.toggle('hidden',assessStep===4);stepText.textContent=`ขั้นที่ ${assessStep} จาก 4`;err.classList.add('hidden');
      if(assessStep===4)refreshReview();
    }
    stepBtns.forEach(b=>b.onclick=()=>setAssessStep(Number(b.dataset.assessStep)));
    backBtn.onclick=()=>setAssessStep(assessStep-1);nextBtn.onclick=()=>setAssessStep(assessStep+1);
    modeBtns.forEach(b=>b.onclick=()=>{assessMode=b.dataset.assessMode;modeBtns.forEach(x=>x.classList.toggle('active',x===b))});
    qCount.onchange=()=>{if($('startQuestionCount'))$('startQuestionCount').value=qCount.value};
    qDiff.onchange=()=>{if($('startDifficulty'))$('startDifficulty').value=qDiff.value;app.setDifficultyLevel?.(qDiff.value,{silent:true})};
    assessWizard.querySelector('#teacherAssessmentStart').onclick=async()=>{
      const name=studentName();
      if(!name){err.textContent='กรุณาเลือกนักเรียนหรือกรอกชื่อผู้เรียนก่อนเริ่มประเมิน';err.classList.remove('hidden');setAssessStep(1);return;}
      if($('startQuestionCount'))$('startQuestionCount').value=qCount.value;
      if($('startDifficulty'))$('startDifficulty').value=qDiff.value;
      await app.startGame(assessMode);
    };
    setAssessStep(1);

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
