(function(){
  'use strict';

  const VALID=new Set(['teacher','parent','student']);

  function $(id){ return document.getElementById(id); }

  function fakeAccount(role){
    return {
      id:'direct-'+role,
      name:role==='teacher'?'ครู':role==='parent'?'ผู้ปกครอง':'นักเรียน',
      email:'',
      role,
      cloud:false,
      direct:true
    };
  }

  function setRoleLabels(role){
    const roleNames={teacher:'ครู',parent:'ผู้ปกครอง',student:'นักเรียน'};
    const label=roleNames[role]||'ผู้ใช้งาน';

    document.querySelectorAll('[data-direct-role-label]').forEach(el=>{
      el.textContent=label;
    });

    // Ensure the gesture feature stays visibly disabled everywhere.
    document.querySelectorAll('[data-tab="physical"]').forEach(btn=>{
      btn.disabled=true;
      btn.setAttribute('aria-disabled','true');
      btn.classList.add('gesture-development-tab');
      btn.onclick=null;
      if(!btn.querySelector('.dev-badge')){
        const badge=document.createElement('span');
        badge.className='dev-badge';
        badge.textContent='กำลังพัฒนา';
        btn.appendChild(badge);
      }
    });
  }

  function enter(role){
    if(!VALID.has(role))role='student';
    if(!window.app){
      setTimeout(()=>enter(role),80);
      return;
    }

    sessionStorage.setItem('fm_direct_role',role);
    window.app.currentCloudAccount=fakeAccount(role);

    // Remove old sessions so they cannot override the selected direct role.
    try{
      window.StudentSession?.clear?.();
      localStorage.removeItem('fingerMath_session_v1');
      localStorage.removeItem('fingerMath_session_v2');
      sessionStorage.removeItem('fm_parent_verified_student');
    }catch(e){}

    $('screenAuth')?.classList.add('hidden');
    $('screenMenu')?.classList.remove('hidden');

    try{
      window.app.renderNavUser?.();
      window.app.renderTopnavLinks?.();

      if(role==='teacher'){
        window.app.switchMenuTab?.('teacher');
        window.app.renderRoster?.();
        window.app.populateTeacherStudentSelect?.();
      }else{
        window.app.switchMenuTab?.('parent');
      }
    }catch(e){
      console.warn('Direct role navigation:',e);
    }

    // Apply UI access after the page has been rendered.
    try{ window.FMRoleAccess?.apply?.(role); }catch(e){}
    document.body.dataset.userRole=role;
    setRoleLabels(role);

    // Student mode should focus on practice and hide adult-management areas.
    if(role==='student'){
      document.querySelectorAll(
        '#tabRoster,#teacherDataWorkspace,[data-tab="teacher"],[data-tab="roster"],' +
        '[onclick*="showDashboard"],[onclick*="showLeaderboard"],[onclick*="exportCSV"],' +
        '[onclick*="showSheetSyncModal"]'
      ).forEach(el=>el.classList.add('hidden'));
    }
  }

  function chooseRole(){
    sessionStorage.removeItem('fm_direct_role');
    if(window.app)window.app.currentCloudAccount=null;
    $('screenMenu')?.classList.add('hidden');
    $('screenAuth')?.classList.remove('hidden');
  }

  function install(){
    window.FMDirectMode={enter,chooseRole};

    if(window.GameManager){
      GameManager.prototype.logout=function(){
        chooseRole();
      };

      const oldSwitch=GameManager.prototype.switchMenuTab;
      if(!GameManager.prototype.__gestureDisabledV6){
        GameManager.prototype.__gestureDisabledV6=true;
        GameManager.prototype.switchMenuTab=function(tab){
          if(tab==='physical'){
            const notice=document.createElement('div');
            notice.className='gesture-dev-toast';
            notice.textContent='โหมดท่าทางกำลังพัฒนา และปิดใช้งานชั่วคราว';
            document.body.appendChild(notice);
            setTimeout(()=>notice.remove(),2600);
            return;
          }
          return oldSwitch.call(this,tab);
        };
      }
    }

    // Do not auto-enter: always show the three role choices on a fresh load.
    sessionStorage.removeItem('fm_direct_role');
    $('screenMenu')?.classList.add('hidden');
    $('screenAuth')?.classList.remove('hidden');
    setRoleLabels('student');
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install,{once:true});
  }else{
    install();
  }
})();
