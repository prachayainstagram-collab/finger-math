(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function ownerId(){try{return window.app?.getOwnerId?.()||window.app?.ownerId||'direct-teacher'}catch(e){return'direct-teacher'}}
  function sessions(){try{return window.ResearchStore?.load?.(ownerId())||ResearchStore.load(ownerId())||[]}catch(e){return[]}}
  function learners(){try{return window.LearnerStore?.listFor?.(ownerId())||LearnerStore.listFor(ownerId())||[]}catch(e){return[]}}
  function isPre(s){return s.testType==='pretest'||s.testType==='teacher_pretest'}
  function isPost(s){return s.testType==='posttest'||s.testType==='teacher_posttest'}
  function mean(arr,key='accuracy'){return arr.length?Math.round(arr.reduce((a,b)=>a+(Number(b[key])||0),0)/arr.length):0}
  function filterByDate(rows){
    const a=$('teacherDashFrom')?.value,b=$('teacherDashTo')?.value;
    if(!a&&!b)return rows;
    const min=a?new Date(a+'T00:00:00').getTime():-Infinity,max=b?new Date(b+'T23:59:59').getTime():Infinity;
    return rows.filter(r=>{const t=new Date(r.dateTime||0).getTime();return t>=min&&t<=max});
  }
  function groupRows(rows){
    const map={};
    rows.forEach(s=>{const room=(s.classroom&&s.classroom!=='—')?s.classroom:'ไม่ระบุชั้น';if(!map[room])map[room]={room,students:new Set(),pre:[],post:[]};map[room].students.add(s.playerName||'ไม่ระบุ');if(isPre(s))map[room].pre.push(s);if(isPost(s))map[room].post.push(s)});
    return Object.values(map).sort((a,b)=>a.room.localeCompare(b.room,'th'));
  }
  function metric(cls,icon,title,value,unit){return `<article class="teacher-metric-card ${cls}"><h3>${title}</h3><div class="teacher-metric-main"><div class="teacher-metric-icon"><i class="${icon}"></i></div><div><div class="teacher-metric-value">${value}</div><div class="teacher-metric-unit">${unit||''}</div></div></div></article>`}
  function buildOverview(page){
    page.innerHTML=`<div class="teacher-pro-dashboard">
      <div class="teacher-pro-topbar"><div class="teacher-pro-title"><h2>ภาพรวม (Dashboard)</h2><p>ติดตามผลก่อนเรียน หลังเรียน และพัฒนาการของผู้เรียนในหน้าเดียว</p></div><div class="teacher-date-filter"><label>ช่วงเวลา</label><input id="teacherDashFrom" type="date"><input id="teacherDashTo" type="date"><button id="teacherDashApply"><i class="fa-solid fa-filter"></i> แสดงผล</button></div></div>
      <div id="teacherMetricGrid" class="teacher-metric-grid"></div>
      <div class="teacher-pro-lower"><section class="teacher-pro-panel"><h3>ผลการทดสอบเฉลี่ย</h3><div class="teacher-pro-table-wrap"><table class="teacher-pro-table"><thead><tr><th>ระดับชั้น</th><th>นักเรียน</th><th>Pre-test (Avg)</th><th>Post-test (Avg)</th><th>พัฒนาการ</th></tr></thead><tbody id="teacherDashTable"></tbody></table></div></section><section class="teacher-pro-panel"><h3>การทำแบบทดสอบ</h3><div class="teacher-donut-layout"><div id="teacherDonut" class="teacher-donut"><span id="teacherDonutPre" class="teacher-donut-label pre">0%</span><span id="teacherDonutPost" class="teacher-donut-label post">0%</span></div><div class="teacher-legend"><div class="teacher-legend-row"><span class="teacher-legend-dot pre"></span><span>Pre-test</span><strong id="teacherPreCount">0</strong></div><div class="teacher-legend-row"><span class="teacher-legend-dot post"></span><span>Post-test</span><strong id="teacherPostCount">0</strong></div></div></div><button id="teacherExportMain" class="teacher-export-main"><i class="fa-solid fa-download"></i>ส่งออกเป็น CSV</button></section></div>
    </div>`;
    $('teacherDashApply').onclick=refresh;
    $('teacherExportMain').onclick=()=>window.app?.exportCSV?.();
    const now=new Date(),first=new Date(now.getFullYear(),now.getMonth(),1);
    $('teacherDashFrom').value=first.toISOString().slice(0,10);$('teacherDashTo').value=now.toISOString().slice(0,10);
    refresh();
  }
  function refresh(){
    const rows=filterByDate(sessions()),pre=rows.filter(isPre),post=rows.filter(isPost);const studentCount=learners().length||new Set(rows.map(s=>s.playerName)).size;const preAvg=mean(pre),postAvg=mean(post),growth=postAvg-preAvg;
    const grid=$('teacherMetricGrid');if(grid)grid.innerHTML=[metric('metric-blue','fa-solid fa-users','นักเรียนทั้งหมด',studentCount,'คน'),metric('metric-purple','fa-solid fa-clipboard-list','ทำแบบทดสอบทั้งหมด',rows.length,'ครั้ง'),metric('metric-orange','fa-solid fa-bullseye','ค่าเฉลี่ยความถูกต้อง (Pre-test)',preAvg+'%',''),metric('metric-green','fa-solid fa-circle-check','ค่าเฉลี่ยความถูกต้อง (Post-test)',postAvg+'%',''),metric('metric-cyan','fa-solid fa-arrow-trend-up','พัฒนาการโดยเฉลี่ย',(growth>=0?'+':'')+growth+'%','')].join('');
    const groups=groupRows(rows),tb=$('teacherDashTable');if(tb){if(!groups.length)tb.innerHTML='<tr><td colspan="5" class="teacher-empty-row">ยังไม่มีข้อมูลการประเมินในช่วงเวลานี้</td></tr>';else{let totalStu=0;tb.innerHTML=groups.map(g=>{const pa=mean(g.pre),po=mean(g.post),d=po-pa;totalStu+=g.students.size;return `<tr><td>${esc(g.room)}</td><td>${g.students.size}</td><td>${pa}%</td><td>${po}%</td><td class="teacher-positive">${d>=0?'+':''}${d}%</td></tr>`}).join('')+`<tr><td>รวมทั้งหมด</td><td>${new Set(rows.map(s=>s.playerName)).size}</td><td>${preAvg}%</td><td>${postAvg}%</td><td class="teacher-positive">${growth>=0?'+':''}${growth}%</td></tr>`}}
    const total=pre.length+post.length,prePct=total?Math.round(pre.length*100/total):50,postPct=total?100-prePct:50;const donut=$('teacherDonut');if(donut)donut.style.setProperty('--pre',prePct);if($('teacherDonutPre'))$('teacherDonutPre').textContent=prePct+'%';if($('teacherDonutPost'))$('teacherDonutPost').textContent=postPct+'%';if($('teacherPreCount'))$('teacherPreCount').textContent=`${pre.length} (${prePct}%)`;if($('teacherPostCount'))$('teacherPostCount').textContent=`${post.length} (${postPct}%)`;
  }
  function navButton(icon,label,handler){const b=document.createElement('button');b.type='button';b.innerHTML=`<i class="${icon}"></i>${label}`;b.onclick=e=>{e.preventDefault();e.stopPropagation();handler(e)};return b}
  function enhance(){
    const shell=$('teacherCleanShell'),side=shell?.querySelector('.teacher-clean-sidebar'),nav=side?.querySelector('.teacher-clean-nav'),overview=shell?.querySelector('[data-teacher-page="overview"]');if(!shell||!side||!nav||!overview||shell.dataset.proDone)return false;shell.dataset.proDone='1';
    const screenMenu=$('screenMenu');
    let host=$('teacherProHost');
    if(screenMenu&&!host){host=document.createElement('div');host.id='teacherProHost';screenMenu.appendChild(host);}
    if(host&&shell.parentElement!==host)host.appendChild(shell);
    side.querySelector('.teacher-clean-brand strong').textContent='FINGER MATH';
    const buttons=[...nav.querySelectorAll('button')];const byPage=p=>buttons.find(b=>b.dataset.teacherPage===p);
    const labels={overview:['fa-solid fa-border-all','ภาพรวม (Dashboard)'],students:['fa-regular fa-user-group','นักเรียน'],assessment:['fa-regular fa-clipboard','แบบทดสอบ'],questions:['fa-regular fa-file-lines','คลังโจทย์'],reports:['fa-solid fa-chart-line','ผลการเรียน'],settings:['fa-solid fa-gear','ตั้งค่า']};
    Object.entries(labels).forEach(([p,[i,l]])=>{const b=byPage(p);if(b)b.innerHTML=`<i class="${i}"></i>${l}`});
    const extra=document.createElement('div');extra.className='teacher-pro-extra-nav';
    extra.append(navButton('fa-solid fa-chart-column','กราฟ & วิเคราะห์',()=>{byPage('reports')?.click();setTimeout(()=>window.app?.showDashboard?.(),120)}),navButton('fa-regular fa-file-arrow-down','ส่งออกข้อมูล (CSV)',()=>window.app?.exportCSV?.()),navButton('fa-solid fa-arrow-right-from-bracket','ออกจากระบบ',()=>window.FMDirectMode?.chooseRole?.()));
    nav.after(extra);
    const profile=document.createElement('div');profile.className='teacher-pro-profile';profile.innerHTML='<div class="teacher-pro-avatar"><i class="fa-solid fa-graduation-cap"></i></div><div><strong>ครูผู้สอน</strong><small>Finger Math Teacher</small></div>';side.appendChild(profile);
    buildOverview(overview);
    window.addEventListener('storage',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
    return true;
  }
  function boot(){let n=0;const t=setInterval(()=>{n++;if(enhance()||n>80)clearInterval(t)},100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
