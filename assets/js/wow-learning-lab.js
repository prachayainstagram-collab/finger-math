(function(){
  const KEY='fmu_usability_assessments_v1';
  const css=document.createElement('link');css.rel='stylesheet';css.href='./assets/css/wow-learning-lab.css';document.head.appendChild(css);
  const html=`<button id="wowLabBtn" class="wow-lab-fab" aria-label="เปิดศูนย์การเรียนรู้ใหม่">✨ WOW Lab</button>
  <div id="wowLabModal" class="wow-modal hidden"><div class="wow-dialog"><button class="wow-close" data-wow-close>×</button>
  <div class="wow-head"><span>Finger Math Universe 7</span><h2>ศูนย์การเรียนรู้แบบว้าว</h2><p>เลขเกิน 10 · จินตคณิต · สัญญาณการมองหน้าจอ · แบบประเมิน UX</p></div>
  <div class="wow-grid">
   <button class="wow-card" id="startLargeNumber"><b>🔢 เลขเกิน 10</b><span>ตอบสองจังหวะ หลักสิบ → หลักหน่วย ได้ถึง 99</span></button>
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
  document.getElementById('startLargeNumber').onclick=()=>{modal.classList.add('hidden'); if(window.app) app.startGame('large_number');};
  function abacusHTML(){return `<h3>🧮 จินตคณิต 3 ขั้น</h3><div class="abacus-steps"><div><b>1. เห็น</b><p>ดูจำนวนบนลูกคิด</p></div><div><b>2. จำลอง</b><p>หลับตานึกภาพเม็ดลูกคิด</p></div><div><b>3. คิดเร็ว</b><p>บวก–ลบจากภาพในใจ</p></div></div><div class="soroban" id="soroban"></div><div class="wow-actions"><button id="abacusRandom">สุ่มจำนวน</button><button id="flashTrain">เริ่ม Flash 5 จำนวน</button></div><div id="abacusAnswer" class="big-answer">0</div>`}
  function drawSoroban(n=0){const el=document.getElementById('soroban');if(!el)return;const digits=String(n).padStart(2,'0').split('').map(Number);el.innerHTML=digits.map((d,i)=>`<div class="rod"><span>${i?'หน่วย':'สิบ'}</span><i class="beam"></i>${[0,1,2,3,4].map(k=>`<b class="bead ${k<d%5?'on':''}"></b>`).join('')}<em>${d}</em></div>`).join('');document.getElementById('abacusAnswer').textContent=n;}
  document.getElementById('openAbacus').onclick=()=>{panel.innerHTML=abacusHTML();drawSoroban(0);document.getElementById('abacusRandom').onclick=()=>drawSoroban(Math.floor(Math.random()*100));document.getElementById('flashTrain').onclick=async()=>{let sum=0;for(let i=0;i<5;i++){const n=1+Math.floor(Math.random()*9);sum+=n;document.getElementById('abacusAnswer').textContent=n;await new Promise(r=>setTimeout(r,800));document.getElementById('abacusAnswer').textContent='•';await new Promise(r=>setTimeout(r,250));}document.getElementById('abacusAnswer').textContent='คำตอบ = ?';setTimeout(()=>document.getElementById('abacusAnswer').textContent='เฉลย '+sum,2500);};};
  document.getElementById('openAttention').onclick=()=>{panel.innerHTML=`<h3>👀 Engagement Lens</h3><div class="notice">ระบบนี้ประเมิน “สัญญาณพฤติกรรมที่สังเกตได้” ไม่สรุปว่าเด็กเครียดหรือเบื่อแน่นอน</div><div class="metric-list"><div><b>Eye contact proxy</b><span>ใบหน้าและทิศทางศีรษะหันเข้าหาหน้าจอ</span></div><div><b>Look-away events</b><span>จำนวนครั้งที่หันออกจากหน้าจอต่อเนื่อง</span></div><div><b>Face missing</b><span>เวลาที่ใบหน้าอยู่นอกเฟรม</span></div><div><b>Possible disengagement</b><span>พิจารณาร่วมกับเวลาตอบช้าและการละสายตาเท่านั้น</span></div></div>`;};
  document.getElementById('openSurvey').onclick=()=>{panel.innerHTML=`<h3>📝 แบบประเมินการใช้หน้าเว็บ</h3><form id="uxSurvey">${['หน้าเว็บใช้งานง่าย','ปุ่มและข้อความมองเห็นชัด','เข้าใจวิธีเล่นได้รวดเร็ว','กิจกรรมสนุกและอยากเล่นต่อ','มั่นใจว่าระบบนับคำตอบถูกต้อง'].map((q,i)=>`<label>${i+1}. ${q}<select name="q${i+1}" required><option value="">เลือกคะแนน</option><option value="5">5 มากที่สุด</option><option value="4">4 มาก</option><option value="3">3 ปานกลาง</option><option value="2">2 น้อย</option><option value="1">1 น้อยที่สุด</option></select></label>`).join('')}<label>ข้อเสนอแนะ<textarea name="comment" placeholder="สิ่งที่ชอบ หรือจุดที่ควรปรับ"></textarea></label><button type="submit">บันทึกแบบประเมิน</button></form><div id="surveyMsg"></div>`;document.getElementById('uxSurvey').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.createdAt=new Date().toISOString();const all=JSON.parse(localStorage.getItem(KEY)||'[]');all.push(data);localStorage.setItem(KEY,JSON.stringify(all));document.getElementById('surveyMsg').textContent='✅ บันทึกเรียบร้อย ขอบคุณสำหรับความคิดเห็น';e.target.reset();};};
  // เปลี่ยนถ้อยคำ UI ให้เป็นการประเมินสีหน้า/การมีส่วนร่วมแทนการวินิจฉัยความเครียด
  const rewrite=()=>{document.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent){el.textContent=el.textContent.replace('😟 กังวล','👀 ละสายตา').replace('สรุปอารมณ์ระหว่างเรียน','สรุปพฤติกรรมระหว่างเรียน').replace('อารมณ์ระหว่างทำกิจกรรม','พฤติกรรมการมีส่วนร่วมระหว่างทำกิจกรรม');}});};
  setTimeout(rewrite,300);
})();
