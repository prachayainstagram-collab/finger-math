(function(){
  const $=id=>document.getElementById(id);
  function button(icon,title,desc,onClick,accent='blue'){
    const b=document.createElement('button');
    b.type='button';b.className=`v8-category-card v8-accent-${accent}`;
    b.innerHTML=`<span class="v8-category-icon"><i class="${icon}"></i></span><span><strong>${title}</strong><small>${desc}</small></span><i class="fa-solid fa-chevron-right v8-card-arrow"></i>`;
    b.onclick=onClick;return b;
  }
  function openWow(id){
    const fab=$('wowLabBtn'),target=$(id);
    if(fab)fab.click();
    setTimeout(()=>{const t=$(id);if(t)t.click();},40);
  }
  function buildMentalPanel(){
    const panel=document.createElement('section');panel.id='v8TabMental';panel.className='v8-main-panel hidden';
    panel.innerHTML=`<div class="v8-panel-heading"><div><span>MENTAL MATH</span><h2>จินตคณิต</h2><p>เรียนรู้ค่าประจำหลัก ฝึกภาพในใจ และตอบเลขสองหลักด้วยมือซ้าย–ขวา</p></div><div class="v8-panel-badge">00–99</div></div><div class="v8-mental-guide"><div><b>มือซ้าย</b><strong>หลักสิบ</strong></div><div class="v8-plus">+</div><div><b>มือขวา</b><strong>หลักหน่วย</strong></div><div class="v8-equals">=</div><div><b>คำตอบ</b><strong>เลข 2 หลัก</strong></div></div><div class="v8-category-grid" id="v8MentalCards"></div>`;
    const grid=panel.querySelector('#v8MentalCards');
    grid.append(
      button('fa-solid fa-hands','จินตคณิตสองมือ','เรียนค่านิ้ว 0–9 และฝึกมือซ้ายหลักสิบ มือขวาหลักหน่วย',()=>openWow('openTwoHandMental'),'purple'),
      button('fa-solid fa-camera','ฝึกด้วยกล้อง','เริ่มตอบเลขสองหลัก 00–99 ด้วยสองมือ',()=>window.app&&app.startGame('mental_two_hand'),'cyan'),
      button('fa-solid fa-calculator','ลูกคิดและ Flash Number','ฝึกสร้างภาพลูกคิดในใจและคิดเร็ว',()=>openWow('openAbacus'),'orange'),
      button('fa-solid fa-arrow-up-9-1','เลขเกิน 10 แบบสองจังหวะ','ตอบหลักสิบก่อน แล้วตอบหลักหน่วย',()=>openWow('startLargeNumber'),'green')
    );
    return panel;
  }
  function buildBasicPanel(){
    const panel=document.createElement('section');panel.id='v8TabBasic';panel.className='v8-main-panel hidden';
    panel.innerHTML=`<div class="v8-panel-heading"><div><span>BASIC PRACTICE</span><h2>ฝึกคณิตพื้นฐาน</h2><p>เลือกกิจกรรมสั้น ๆ และเริ่มฝึกได้ทันที</p></div></div><div class="v8-category-grid" id="v8BasicCards"></div>`;
    const grid=panel.querySelector('#v8BasicCards');
    grid.append(
      button('fa-solid fa-hand','นับนิ้ว 0–10','ฝึกจับคู่จำนวนกับนิ้วมือ',()=>app.startGame('home_practice',1),'green'),
      button('fa-solid fa-plus','บวกเลข','ฝึกบวกตามระดับที่เลือก',()=>app.startGame('home_practice',2),'cyan'),
      button('fa-solid fa-minus','ลบเลข','ฝึกลบและคิดในใจ',()=>app.startGame('home_practice',3),'purple'),
      button('fa-solid fa-xmark','คูณเลข','ฝึกตารางคูณและความเร็ว',()=>app.startGame('home_practice',4),'orange'),
      button('fa-solid fa-code-compare','เปรียบเทียบจำนวน','มากกว่า น้อยกว่า และคู่คี่',()=>app.startGame('home_practice',5),'blue'),
      button('fa-solid fa-wand-magic-sparkles','สุ่มแบบฝึก','คละโจทย์ตามช่วงชั้นและความยาก',()=>app.startGame('home_practice'),'pink'),
      button('fa-solid fa-person-chalkboard','ฝึกชูนิ้วก่อนเล่น','ดูภาพตัวอย่างและฟังคำสอนทีละจำนวน',()=>openWow('openFingerCoach'),'blue')
    );
    return panel;
  }
  function makePanel(id,title,subtitle){
    const p=document.createElement('section');p.id=id;p.className='v8-main-panel hidden';
    p.innerHTML=`<div class="v8-panel-heading"><div><span>FINGER MATH</span><h2>${title}</h2><p>${subtitle}</p></div></div>`;return p;
  }
  function showTab(name){
    document.querySelectorAll('.v8-main-panel').forEach(p=>p.classList.toggle('hidden',p.dataset.v8tab!==name));
    document.querySelectorAll('.v8-primary-tab').forEach(b=>b.classList.toggle('active',b.dataset.v8tab===name));
    localStorage.setItem('fingerMath_mainTab',name);
    const root=$('screenMenu');if(root)root.scrollTo({top:0,behavior:'smooth'});
  }
  function init(){
    const shell=document.querySelector('#screenMenu .menu-shell');
    if(!shell||$('v8PrimaryTabs'))return;
    // Hide the old role tab strip. Role-specific content is moved to clearer pages.
    const oldTabBtn=document.querySelector('.tab-btn[data-tab]');
    if(oldTabBtn&&oldTabBtn.parentElement)oldTabBtn.parentElement.classList.add('v8-old-tabs-hidden');

    const tabs=document.createElement('nav');tabs.id='v8PrimaryTabs';tabs.className='v8-primary-tabs';
    const specs=[
      ['home','fa-solid fa-sliders','ตั้งค่า'],
      ['basic','fa-solid fa-hand','ฝึกพื้นฐาน'],
      ['mental','fa-solid fa-brain','จินตคณิต'],
      ['path','fa-solid fa-route','เส้นทางเรียน'],
      ['assessment','fa-solid fa-chart-column','ประเมินผล'],
      ['more','fa-solid fa-ellipsis','เพิ่มเติม']
    ];
    specs.forEach(([key,icon,label])=>{const b=document.createElement('button');b.type='button';b.className='v8-primary-tab';b.dataset.v8tab=key;b.innerHTML=`<i class="${icon}"></i><span>${label}</span>`;b.onclick=()=>showTab(key);tabs.appendChild(b)});
    const hero=document.querySelector('.organized-hero');
    (hero||shell.firstElementChild).after(tabs);

    const mount=document.createElement('main');mount.id='v8TabMount';mount.className='v8-tab-mount';tabs.after(mount);
    const home=makePanel('v8TabHome','ตั้งค่าก่อนเริ่ม','กรอกข้อมูลผู้เรียน เลือกช่วงชั้น จำนวนข้อ และระดับความยาก');home.dataset.v8tab='home';
    const setup=document.querySelector('.organized-setup-card');if(setup)home.appendChild(setup);
    mount.appendChild(home);

    const basic=buildBasicPanel();basic.dataset.v8tab='basic';mount.appendChild(basic);
    const mental=buildMentalPanel();mental.dataset.v8tab='mental';mount.appendChild(mental);

    const path=makePanel('v8TabPath','เส้นทางการเรียนรู้','เลือก Level และ Mission ตามช่วงชั้น');path.dataset.v8tab='path';
    const mission=$('v8MissionHub');if(mission)path.appendChild(mission);mount.appendChild(path);

    const assessment=makePanel('v8TabAssessment','ประเมินและรายงาน','เครื่องมือสำหรับครู รายชื่อนักเรียน และผลการเรียน');assessment.dataset.v8tab='assessment';
    const teacher=$('tabTeacher'),roster=$('tabRoster');
    if(teacher){teacher.classList.remove('hidden');assessment.appendChild(teacher)}
    if(roster){roster.classList.remove('hidden');assessment.appendChild(roster)}
    mount.appendChild(assessment);

    const more=makePanel('v8TabMore','เครื่องมือเพิ่มเติม','โหมดเสียง การเข้าถึง Engagement Lens และแบบประเมินหน้าเว็บ');more.dataset.v8tab='more';
    const acc=$('tabAccessibility'),physical=$('tabPhysical');
    if(acc){acc.classList.remove('hidden');more.appendChild(acc)}
    if(physical){physical.classList.remove('hidden');more.appendChild(physical)}
    const extra=document.createElement('div');extra.className='v8-category-grid';
    extra.append(
      button('fa-solid fa-eye','Engagement Lens','ดูการมองหน้าจอและการละสายตาโดยไม่วินิจฉัยอารมณ์',()=>openWow('openAttention'),'cyan'),
      button('fa-solid fa-list-check','แบบประเมิน UX/UI','เก็บความคิดเห็นด้านความง่าย ความชัดเจน และความสนุก',()=>openWow('openSurvey'),'purple'),
      button('fa-solid fa-volume-high','เปิดโหมดเสียง','อ่านโจทย์และคำสั่งสำหรับผู้เรียน',()=>{showTab('more');window.app&&app.enableVoiceMode()},'green')
    );more.appendChild(extra);mount.appendChild(more);

    // Remove visual leftovers that duplicated the new structure.
    document.querySelectorAll('.organized-section-heading').forEach(el=>el.classList.add('v8-legacy-heading-hidden'));
    const parent=$('tabParent');if(parent)parent.classList.add('v8-legacy-parent-hidden');
    const saved=localStorage.getItem('fingerMath_mainTab')||'home';showTab(specs.some(s=>s[0]===saved)?saved:'home');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80));else setTimeout(init,80);
  window.addEventListener('load',()=>setTimeout(init,160));
})();
