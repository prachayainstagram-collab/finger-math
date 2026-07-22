(function(){
  const KEY='fmu_usability_assessments_v1';
  const css=document.createElement('link');css.rel='stylesheet';css.href='./assets/css/wow-learning-lab.css';document.head.appendChild(css);
  const html=`<button id="wowLabBtn" class="wow-lab-fab wow-mascot-fab" aria-label="เปิดศูนย์การเรียนรู้ Finger Math" title="เปิดศูนย์การเรียนรู้">
    <img src="./assets/images/wow-mascot-transparent.webp" alt="มาสคอต Finger Math" class="wow-mascot-image">
    <span class="wow-mascot-label">ศูนย์การเรียนรู้</span>
  </button>
  <div id="wowLabModal" class="wow-modal hidden"><div class="wow-dialog"><button class="wow-close" data-wow-close>×</button>
  <div class="wow-head"><span>Finger Math Universe 7</span><h2>ศูนย์การเรียนรู้แบบว้าว</h2><p>เลขเกิน 10 · จินตคณิต · สัญญาณการมองหน้าจอ · แบบประเมิน UX</p></div>
  <div class="wow-grid">
   <button class="wow-card wow-card-featured" id="openFingerCoach"><b>🖐️ ฝึกชูนิ้วก่อนเล่น</b><span>ดูภาพมือ ฟังเสียง และลองทำตามทีละจำนวน 0–10</span></button>
   <button class="wow-card" id="startLargeNumber"><b>🔢 เลขเกิน 10</b><span>เรียนตัวอย่างหลักสิบ → หลักหน่วย ก่อนเริ่มตอบได้ถึง 99</span></button>
   <button class="wow-card" id="openAbacus"><b>🧮 ห้องเรียนจินตคณิต</b><span>ลูกคิดเสมือน ภาพกระพริบ และฝึกสร้างภาพในใจ</span></button>
   <button class="wow-card" id="openAttention"><b>👀 Engagement Lens</b><span>ดูการมองหน้าจอ การละสายตา และใบหน้าหลุดเฟรม ไม่วินิจฉัยอารมณ์</span></button>
   <button class="wow-card" id="openSurvey"><b>📝 แบบประเมินหน้าเว็บ</b><span>ประเมินความง่าย ความชัดเจน ความสนุก และความมั่นใจ</span></button>
  </div>
  <section id="wowPanel" class="wow-panel"><h3>เลือกกิจกรรมด้านบน</h3><p>ระบบออกแบบให้เด็กเห็นตัวเลือกน้อยลง ปุ่มใหญ่ขึ้น และมีคำอธิบายสั้น ๆ</p></section>
  </div></div>`;
  document.body.insertAdjacentHTML('beforeend',html);
  const modal=document.getElementById('wowLabModal'),panel=document.getElementById('wowPanel');
  document.getElementById('wowLabBtn').onclick=()=>modal.classList.remove('hidden');
  document.querySelector('[data-wow-close]').onclick=()=>modal.classList.add('hidden');
  
  const speakThai=(text)=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='th-TH';u.rate=.82;u.pitch=1.08;speechSynthesis.speak(u);}catch(e){}};
  function fingerSvg(count,side='right'){
    const active=Math.max(0,Math.min(5,count));
    const xs=[30,52,74,96,118];
    const heights=[54,72,82,72,58];
    const fingers=xs.map((x,i)=>{const on=i<active;const h=on?heights[i]:26;const y=94-h;return `<rect x="${x}" y="${y}" width="17" height="${h}" rx="8.5" class="${on?'finger-on':'finger-off'}"/>`;}).join('');
    return `<svg class="hand-svg ${side==='left'?'flip-hand':''}" viewBox="0 0 170 180" role="img" aria-label="มือชู ${count} นิ้ว"><rect x="38" y="86" width="100" height="70" rx="34" class="palm"/>${fingers}<rect x="20" y="102" width="50" height="22" rx="11" transform="rotate(-28 20 102)" class="${active===5?'finger-on':'finger-off'}"/><rect x="66" y="146" width="44" height="30" rx="14" class="wrist"/></svg>`;
  }
  function handPicture(n){
    n=Math.max(0,Math.min(10,Number(n)||0));
    const left=Math.min(5,n),right=Math.max(0,n-5);
    if(n<=5)return `<div class="hands-picture single">${fingerSvg(n,'right')}</div>`;
    return `<div class="hands-picture">${fingerSvg(5,'left')}${fingerSvg(right,'right')}</div>`;
  }
  function coachHTML(){
    return `<div class="coach-wrap"><div class="coach-title"><div><span class="lesson-chip">บทฝึกก่อนเล่น</span><h3>🖐️ มาฝึกชูนิ้วกันก่อน</h3><p>เลือกจำนวน ดูภาพ ฟังคำสอน แล้วลองชูนิ้วตาม</p></div><button id="coachSpeak" class="sound-btn">🔊 ฟังอีกครั้ง</button></div>
      <div class="number-picker">${Array.from({length:11},(_,i)=>`<button data-finger-number="${i}">${i}</button>`).join('')}</div>
      <div class="coach-stage"><div id="coachPicture">${handPicture(1)}</div><div class="coach-instruction"><div class="giant-number" id="coachNumber">1</div><h4 id="coachText">ชู 1 นิ้ว</h4><p id="coachHint">ยกนิ้วชี้ขึ้น 1 นิ้ว แล้วพับนิ้วที่เหลือ</p><button id="coachNext" class="primary-wow-btn">ฉันทำได้แล้ว → ข้อต่อไป</button></div></div>
      <div class="coach-tips"><b>เคล็ดลับสำหรับเด็ก</b><span>วางมือให้อยู่กลางกรอบกล้อง · กางนิ้วให้เห็นชัด · อย่าให้มือซ้อนกัน</span></div>
      <button id="coachLargeDemo" class="wide-demo-btn">ดูตัวอย่างตอบเลขเกิน 10 เช่น 27</button></div>`;
  }
  const fingerNames={0:'กำมือหรือพับนิ้วทั้งหมด',1:'ยกนิ้วชี้ขึ้น 1 นิ้ว',2:'ยกนิ้วชี้และนิ้วกลาง',3:'ยกนิ้วชี้ นิ้วกลาง และนิ้วนาง',4:'ยก 4 นิ้ว โดยพับนิ้วโป้ง',5:'กางนิ้วมือหนึ่งข้างให้ครบ 5 นิ้ว',6:'กางมือข้างแรก 5 นิ้ว และอีกข้าง 1 นิ้ว',7:'กางมือข้างแรก 5 นิ้ว และอีกข้าง 2 นิ้ว',8:'กางมือข้างแรก 5 นิ้ว และอีกข้าง 3 นิ้ว',9:'กางมือข้างแรก 5 นิ้ว และอีกข้าง 4 นิ้ว',10:'กางมือทั้งสองข้างให้ครบ 10 นิ้ว'};
  let coachNumber=1;
  function showCoach(n,announce=true){coachNumber=Number(n);const pic=document.getElementById('coachPicture');if(!pic)return;pic.innerHTML=handPicture(coachNumber);document.getElementById('coachNumber').textContent=coachNumber;document.getElementById('coachText').textContent=`ชู ${coachNumber} นิ้ว`;document.getElementById('coachHint').textContent=fingerNames[coachNumber];document.querySelectorAll('[data-finger-number]').forEach(b=>b.classList.toggle('active',Number(b.dataset.fingerNumber)===coachNumber));if(announce)speakThai(`ลองชู ${coachNumber} นิ้ว ${fingerNames[coachNumber]}`);}
  function bindCoach(){document.querySelectorAll('[data-finger-number]').forEach(b=>b.onclick=()=>showCoach(b.dataset.fingerNumber));document.getElementById('coachSpeak').onclick=()=>showCoach(coachNumber,true);document.getElementById('coachNext').onclick=()=>showCoach((coachNumber+1)%11,true);document.getElementById('coachLargeDemo').onclick=showLargeDemo;setTimeout(()=>showCoach(1,true),180);}
  function showLargeDemo(){panel.innerHTML=`<div class="large-demo"><span class="lesson-chip">ตัวอย่างเลขเกิน 10</span><h3>ตอบ 27 ด้วยนิ้วอย่างไร?</h3><p>ระบบใช้ 2 จังหวะ เพื่อให้เด็กเข้าใจค่าประจำหลัก</p><div class="place-value-demo"><div><b>จังหวะที่ 1 · หลักสิบ</b>${handPicture(2)}<strong>ชู 2 นิ้ว</strong><span>หมายถึง 2 สิบ = 20</span></div><div class="demo-arrow">→</div><div><b>จังหวะที่ 2 · หลักหน่วย</b>${handPicture(7)}<strong>ชู 7 นิ้ว</strong><span>หมายถึง 7 หน่วย</span></div></div><div class="demo-equation">20 + 7 = <b>27</b></div><div class="wow-actions"><button id="replayLargeDemo">🔊 ฟังคำสอน</button><button id="beginLargeGame">เริ่มเล่นจริง</button></div></div>`;document.getElementById('replayLargeDemo').onclick=()=>speakThai('เลขยี่สิบเจ็ด ให้ชูสองนิ้วเป็นหลักสิบก่อน จากนั้นชูเจ็ดนิ้วเป็นหลักหน่วย');document.getElementById('beginLargeGame').onclick=()=>{modal.classList.add('hidden');if(window.app)app.startGame('large_number');};speakThai('เลขยี่สิบเจ็ด ให้ชูสองนิ้วเป็นหลักสิบก่อน จากนั้นชูเจ็ดนิ้วเป็นหลักหน่วย');}
  document.getElementById('openFingerCoach').onclick=()=>{panel.innerHTML=coachHTML();bindCoach();};
  document.getElementById('startLargeNumber').onclick=()=>{showLargeDemo();};
  function abacusHTML(){return `<h3>🧮 จินตคณิต 3 ขั้น</h3><div class="abacus-steps"><div><b>1. เห็น</b><p>ดูจำนวนบนลูกคิด</p></div><div><b>2. จำลอง</b><p>หลับตานึกภาพเม็ดลูกคิด</p></div><div><b>3. คิดเร็ว</b><p>บวก–ลบจากภาพในใจ</p></div></div><div class="soroban" id="soroban"></div><div class="wow-actions"><button id="abacusRandom">สุ่มจำนวน</button><button id="flashTrain">เริ่ม Flash 5 จำนวน</button></div><div id="abacusAnswer" class="big-answer">0</div>`}
  function drawSoroban(n=0){const el=document.getElementById('soroban');if(!el)return;const digits=String(n).padStart(2,'0').split('').map(Number);el.innerHTML=digits.map((d,i)=>`<div class="rod"><span>${i?'หน่วย':'สิบ'}</span><i class="beam"></i>${[0,1,2,3,4].map(k=>`<b class="bead ${k<d%5?'on':''}"></b>`).join('')}<em>${d}</em></div>`).join('');document.getElementById('abacusAnswer').textContent=n;}
  document.getElementById('openAbacus').onclick=()=>{panel.innerHTML=abacusHTML();drawSoroban(0);document.getElementById('abacusRandom').onclick=()=>drawSoroban(Math.floor(Math.random()*100));document.getElementById('flashTrain').onclick=async()=>{let sum=0;for(let i=0;i<5;i++){const n=1+Math.floor(Math.random()*9);sum+=n;document.getElementById('abacusAnswer').textContent=n;await new Promise(r=>setTimeout(r,800));document.getElementById('abacusAnswer').textContent='•';await new Promise(r=>setTimeout(r,250));}document.getElementById('abacusAnswer').textContent='คำตอบ = ?';setTimeout(()=>document.getElementById('abacusAnswer').textContent='เฉลย '+sum,2500);};};
  document.getElementById('openAttention').onclick=()=>{panel.innerHTML=`<h3>👀 Engagement Lens</h3><div class="notice">ระบบนี้ประเมิน “สัญญาณพฤติกรรมที่สังเกตได้” ไม่สรุปว่าเด็กเครียดหรือเบื่อแน่นอน</div><div class="metric-list"><div><b>Eye contact proxy</b><span>ใบหน้าและทิศทางศีรษะหันเข้าหาหน้าจอ</span></div><div><b>Look-away events</b><span>จำนวนครั้งที่หันออกจากหน้าจอต่อเนื่อง</span></div><div><b>Face missing</b><span>เวลาที่ใบหน้าอยู่นอกเฟรม</span></div><div><b>Possible disengagement</b><span>พิจารณาร่วมกับเวลาตอบช้าและการละสายตาเท่านั้น</span></div></div>`;};
  document.getElementById('openSurvey').onclick=()=>{panel.innerHTML=`<h3>📝 แบบประเมินการใช้หน้าเว็บ</h3><form id="uxSurvey">${['หน้าเว็บใช้งานง่าย','ปุ่มและข้อความมองเห็นชัด','เข้าใจวิธีเล่นได้รวดเร็ว','กิจกรรมสนุกและอยากเล่นต่อ','มั่นใจว่าระบบนับคำตอบถูกต้อง'].map((q,i)=>`<label>${i+1}. ${q}<select name="q${i+1}" required><option value="">เลือกคะแนน</option><option value="5">5 มากที่สุด</option><option value="4">4 มาก</option><option value="3">3 ปานกลาง</option><option value="2">2 น้อย</option><option value="1">1 น้อยที่สุด</option></select></label>`).join('')}<label>ข้อเสนอแนะ<textarea name="comment" placeholder="สิ่งที่ชอบ หรือจุดที่ควรปรับ"></textarea></label><button type="submit">บันทึกแบบประเมิน</button></form><div id="surveyMsg"></div>`;document.getElementById('uxSurvey').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.createdAt=new Date().toISOString();const all=JSON.parse(localStorage.getItem(KEY)||'[]');all.push(data);localStorage.setItem(KEY,JSON.stringify(all));document.getElementById('surveyMsg').textContent='✅ บันทึกเรียบร้อย ขอบคุณสำหรับความคิดเห็น';e.target.reset();};};
  // เปลี่ยนถ้อยคำ UI ให้เป็นการประเมินสีหน้า/การมีส่วนร่วมแทนการวินิจฉัยความเครียด
  const rewrite=()=>{document.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent){el.textContent=el.textContent.replace('😟 กังวล','👀 ละสายตา').replace('สรุปอารมณ์ระหว่างเรียน','สรุปพฤติกรรมระหว่างเรียน').replace('อารมณ์ระหว่างทำกิจกรรม','พฤติกรรมการมีส่วนร่วมระหว่างทำกิจกรรม');}});};
  setTimeout(rewrite,300);
})();
