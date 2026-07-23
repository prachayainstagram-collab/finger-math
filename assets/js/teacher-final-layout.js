(function(){
  'use strict';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const positions={};
  let current='overview';

  function normalize(){
    const host=document.getElementById('teacherProHost');
    const shell=document.getElementById('teacherCleanShell');
    if(!host||!shell)return false;
    const side=q('.teacher-clean-sidebar',shell);
    const main=q('.teacher-clean-main',shell);
    if(!side||!main)return false;

    // Ensure a clean two-column DOM structure.
    if(shell.parentElement!==host)host.appendChild(shell);
    if(side.parentElement!==shell)shell.prepend(side);
    if(main.parentElement!==shell)shell.appendChild(main);
    qa('.teacher-clean-page',shell).forEach(page=>{if(page.parentElement!==main)main.appendChild(page)});

    // Remove accidental dashboard/content blocks from sidebar.
    qa(':scope > *',side).forEach(el=>{
      const ok=el.matches('.teacher-clean-brand,.teacher-clean-nav,.teacher-pro-extra-nav,.teacher-pro-profile');
      if(!ok)el.remove();
    });

    const navButtons=qa('.teacher-clean-nav button[data-teacher-page]',side);
    navButtons.forEach(btn=>{
      const fresh=btn.cloneNode(true);
      btn.replaceWith(fresh);
      fresh.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        openPage(fresh.dataset.teacherPage,main,side);
      });
    });
    current=localStorage.getItem('fingerMath_teacherPage')||'overview';
    openPage(current,main,side,true);
    return true;
  }

  function openPage(name,main,side,initial=false){
    main=main||q('#teacherCleanShell .teacher-clean-main');
    side=side||q('#teacherCleanShell .teacher-clean-sidebar');
    if(!main||!side)return;
    positions[current]=main.scrollTop;
    current=name||'overview';
    qa('.teacher-clean-page',main).forEach(page=>{
      const active=page.dataset.teacherPage===current;
      page.classList.toggle('active',active);
      page.hidden=!active;
      page.setAttribute('aria-hidden',active?'false':'true');
    });
    qa('.teacher-clean-nav button[data-teacher-page]',side).forEach(btn=>btn.classList.toggle('active',btn.dataset.teacherPage===current));
    localStorage.setItem('fingerMath_teacherPage',current);
    requestAnimationFrame(()=>{main.scrollTop=positions[current]||0});
  }

  function boot(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(normalize()||tries>100)clearInterval(timer);
    },100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
