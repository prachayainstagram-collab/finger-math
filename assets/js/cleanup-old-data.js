(function(){
  'use strict';
  const VERSION='finger-math-single-auth-v5';
  const marker='fm_data_version';
  if(localStorage.getItem(marker)===VERSION)return;

  [
    'fingerMath_accounts_v1','fingerMath_session_v1',
    'fingerMath_accounts_v2','fingerMath_session_v2',
    'fm_current_role'
  ].forEach(k=>localStorage.removeItem(k));

  sessionStorage.removeItem('fm_parent_verified_student');
  localStorage.setItem(marker,VERSION);
})();
