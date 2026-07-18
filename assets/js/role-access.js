(function(){
  'use strict';
  const VALID=new Set(['teacher','parent','student']);

  function account(){
    return window.app?.currentCloudAccount || window.AccountManager?.current?.() || null;
  }
  function currentRole(){
    const student=window.StudentSession?.current?.();
    if(student)return 'student';
    const role=account()?.role;
    return VALID.has(role)?role:'parent';
  }
  function canOpen(tab,role){
    if(role==='teacher')return ['teacher','roster','physical','accessibility'].includes(tab);
    if(role==='parent')return ['parent','roster','physical','accessibility'].includes(tab);
    return ['parent','physical','accessibility'].includes(tab);
  }
  function setHidden(el,hidden){
    if(!el)return;
    el.classList.toggle('hidden',hidden);
    if(hidden)el.setAttribute('aria-hidden','true');
    else el.removeAttribute('aria-hidden');
  }
  function apply(role=currentRole()){
    role=VALID.has(role)?role:'parent';
    document.body.dataset.userRole=role;

    setHidden(document.querySelector('#tabTeacher'),role!=='teacher');
    setHidden(document.querySelector('#teacherDataWorkspace'),role!=='teacher');

    // Roster is available to teachers and parents, never students.
    setHidden(document.querySelector('#tabRoster'),role==='student');

    document.querySelectorAll('[data-tab="teacher"]').forEach(el=>setHidden(el,role!=='teacher'));
    document.querySelectorAll('[data-tab="parent"]').forEach(el=>setHidden(el,role==='teacher'));

    // Teacher-only controls.
    document.querySelectorAll(
      '[onclick*="showDashboard"],[onclick*="exportCSV"],[onclick*="showSheetSyncModal"],' +
      '#fmSyncAll,#qSave,#questionCloudList'
    ).forEach(el=>setHidden(el,role!=='teacher'));

    const openTab=['teacher','roster','parent','physical','accessibility'].find(t=>{
      const el=document.querySelector('#tab'+t.charAt(0).toUpperCase()+t.slice(1));
      return el && !el.classList.contains('hidden');
    });

    const visibleTeacher=!document.querySelector('#tabTeacher')?.classList.contains('hidden');
    if(role!=='teacher'&&visibleTeacher)window.app?.switchMenuTab?.('parent');
    return role;
  }

  function installTabGuard(){
    if(!window.GameManager||GameManager.prototype.__roleGuardInstalled)return;
    GameManager.prototype.__roleGuardInstalled=true;
    const original=GameManager.prototype.switchMenuTab;
    GameManager.prototype.switchMenuTab=function(tab){
      const role=currentRole();
      if(!canOpen(tab,role)){
        tab=role==='teacher'?'teacher':'parent';
      }
      const result=original.call(this,tab);
      apply(role);
      return result;
    };
  }

  async function refresh(){
    let role=currentRole();
    try{
      const session=await window.FMSupabase?.getSession?.();
      if(session){
        const profile=await window.FMSupabase.getProfile();
        if(profile?.role){
          role=profile.role;
          if(window.app){
            window.app.currentCloudAccount={
              id:profile.id,
              name:profile.display_name || profile.email || '',
              email:profile.email,
              role:profile.role,
              cloud:true
            };

            // Rebuild the whole workspace after the database role is known.
            // Previously only the badge changed, while the old parent menu/content remained.
            window.app.renderNavUser?.();
            window.app.renderTopnavLinks?.();
            window.app.renderRoster?.();
            window.app.populateTeacherStudentSelect?.();

            if(role==='teacher'){
              window.app.switchMenuTab?.('teacher');
            }else if(role==='parent'){
              window.app.switchMenuTab?.('parent');
            }else{
              window.app.switchMenuTab?.('parent');
            }
          }
        }
      }
    }catch(e){console.warn('Role refresh failed:',e);}
    apply(role);
  }

  function boot(){
    installTabGuard();
    refresh();
    const observer=new MutationObserver(()=>setTimeout(()=>apply(currentRole()),40));
    observer.observe(document.body,{childList:true,subtree:true});
    window.FMSupabase?.onAuthStateChange?.(()=>setTimeout(refresh,80));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.FMRoleAccess={apply,refresh,currentRole};
})();
