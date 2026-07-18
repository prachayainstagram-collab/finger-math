(function(){
  function buildUXV4(){
    document.body.classList.add('ux-v4');
    const shell=document.querySelector('#screenMenu > .menu-shell');
    if(!shell || shell.dataset.uxv4) return;
    shell.dataset.uxv4='1';
    const kidsToggle=document.getElementById('themeTogglePill');
    if(kidsToggle) kidsToggle.style.display='none';
    const children=[...shell.children];
    const nav=children.find(x=>x.classList.contains('topnav'));
    const hero=nav?.nextElementSibling;
    if(hero) hero.classList.add('ux-hero-old');
    const emotion=hero?.nextElementSibling;
    if(emotion) emotion.classList.add('ux-emotion-info');
    const learner=emotion?.nextElementSibling;
    if(learner?.classList.contains('card')) learner.classList.add('ux-learner-card');
    const banner=document.createElement('section');
    banner.className='ux-dashboard-banner';
    banner.innerHTML=`<div><div style="font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#bfc5ff;margin-bottom:7px">Finger Math Learning Studio</div><h2>เรียนคณิตศาสตร์ด้วยการเคลื่อนไหวอย่างมั่นใจ</h2><p>เลือกพื้นที่ใช้งานจากเมนูด้านขวา ตั้งค่าผู้เรียน แล้วเริ่มกิจกรรมที่เหมาะสมได้ทันที</p></div><div class="ux-banner-actions"><button class="btn" onclick="app.switchMenuTab('parent')"><i class="fa-solid fa-play"></i> เริ่มฝึก</button><button class="btn" onclick="app.switchMenuTab('teacher')"><i class="fa-solid fa-chart-simple"></i> ประเมินผล</button></div>`;
    if(nav) nav.insertAdjacentElement('afterend',banner); else shell.prepend(banner);
    document.title='Finger Math Learning Studio';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildUXV4); else buildUXV4();
  window.addEventListener('load',()=>setTimeout(buildUXV4,60));
})();
