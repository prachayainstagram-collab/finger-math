(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const pageScroll={};
  let activePage='overview';
  let built=false;

  const NAV=[
    ['overview','fa-solid fa-border-all','ภาพรวม (Dashboard)'],
    ['students','fa-solid fa-user-group','นักเรียน'],
    ['assessment','fa-solid fa-clipboard-check','แบบทดสอบ'],
    ['questions','fa-solid fa-book-open','คลังโจทย์'],
    ['reports','fa-solid fa-chart-line','ผลการเรียน'],
    ['settings','fa-solid fa-gear','ตั้งค่า']
  ];

  function button(page,icon,label){
    const b=document.createElement('button');
    b.type='button';
    b.dataset.teacherPage=page;
    b.innerHTML=`<i class="${icon}"></i><span>${label}</span>`;
    b.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      switchPage(page);
    });
    return b;
  }

  function switchPage(name,initial=false){
    const shell=$('#teacherCleanShell');
    const main=$('.teacher-clean-main',shell);
    if(!shell||!main)return;
    if(!initial)pageScroll[activePage]=main.scrollTop;
    activePage=name||'overview';
    $$('.teacher-clean-page',main).forEach(page=>{
      const on=page.dataset.teacherPage===activePage;
      page.classList.toggle('active',on);
      page.hidden=!on;
      page.style.display=on?'block':'none';
      page.setAttribute('aria-hidden',on?'false':'true');
    });
    $$('[data-teacher-page]',$('.teacher-clean-sidebar',shell)).forEach(b=>{
      b.classList.toggle('active',b.dataset.teacherPage===activePage);
    });
    localStorage.setItem('fingerMath_teacherPage',activePage);
    requestAnimationFrame(()=>{main.scrollTop=pageScroll[activePage]||0;});
  }

  function createSidebar(){
    const side=document.createElement('aside');
    side.className='teacher-clean-sidebar teacher-hard-sidebar';
    const brand=document.createElement('div');
    brand.className='teacher-clean-brand';
    brand.innerHTML='<strong>FINGER MATH</strong><small>Teacher Dashboard</small>';
    const nav=document.createElement('nav');
    nav.className='teacher-clean-nav';
    NAV.forEach(([p,i,l])=>nav.appendChild(button(p,i,l)));
    const extra=document.createElement('div');
    extra.className='teacher-pro-extra-nav';
    const graph=document.createElement('button'); graph.type='button'; graph.innerHTML='<i class="fa-solid fa-chart-column"></i><span>กราฟ & วิเคราะห์</span>';
    graph.onclick=e=>{e.preventDefault();e.stopPropagation();switchPage('reports');setTimeout(()=>window.app?.showDashboard?.(),80)};
    const csv=document.createElement('button'); csv.type='button'; csv.innerHTML='<i class="fa-solid fa-file-arrow-down"></i><span>ส่งออกข้อมูล (CSV)</span>';
    csv.onclick=e=>{e.preventDefault();e.stopPropagation();window.app?.exportCSV?.()};
    const logout=document.createElement('button'); logout.type='button'; logout.innerHTML='<i class="fa-solid fa-arrow-right-from-bracket"></i><span>ออกจากโหมดครู</span>';
    logout.onclick=e=>{e.preventDefault();e.stopPropagation();window.FMDirectMode?.chooseRole?.()};
    extra.append(graph,csv,logout);
    const profile=document.createElement('div');
    profile.className='teacher-pro-profile';
    profile.innerHTML='<div class="teacher-pro-avatar"><i class="fa-solid fa-graduation-cap"></i></div><div><strong>ครูผู้สอน</strong><small>Finger Math Teacher</small></div>';
    side.append(brand,nav,extra,profile);
    return side;
  }

  function hardBuild(){
    if(built)return true;
    const oldShell=$('#teacherCleanShell');
    const host=$('#teacherProHost');
    if(!oldShell||!host)return false;
    const pages=$$('.teacher-clean-page',oldShell);
    if(pages.length<4)return false;
    // Wait for the functional overview dashboard to finish rendering.
    if(!$('#teacherMetricGrid',oldShell))return false;

    const main=document.createElement('main');
    main.className='teacher-clean-main teacher-hard-main';
    pages.forEach(p=>{
      p.removeAttribute('style');
      p.hidden=true;
      p.classList.remove('active');
      main.appendChild(p);
    });

    const fresh=document.createElement('div');
    fresh.id='teacherCleanShell';
    fresh.className='teacher-clean-shell teacher-hard-shell';
    fresh.append(createSidebar(),main);

    // Remove every legacy dashboard/layout node from the host before mounting.
    host.replaceChildren(fresh);
    built=true;
    activePage=localStorage.getItem('fingerMath_teacherPage')||'overview';
    if(!NAV.some(x=>x[0]===activePage))activePage='overview';
    switchPage(activePage,true);

    // Prevent old smooth-scroll behavior from moving the whole screen.
    const screenMenu=$('#screenMenu');
    if(screenMenu){
      screenMenu.style.scrollBehavior='auto';
      screenMenu.scrollTop=0;
    }
    return true;
  }

  function boot(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(hardBuild()||tries>160)clearInterval(timer);
    },75);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
