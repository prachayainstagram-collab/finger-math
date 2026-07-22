(function(){
  function addMentalPanel(){
    const question=document.getElementById('questionText');
    if(!question||document.getElementById('mentalLivePanel'))return;
    const questionCard=question.closest('.card');
    if(!questionCard||!questionCard.parentElement)return;
    const panel=document.createElement('section');
    panel.id='mentalLivePanel';
    panel.className='mental-live-panel';
    panel.setAttribute('aria-live','polite');
    panel.innerHTML=`
      <div class="mental-live-head">
        <div>
          <span class="mental-live-kicker">จินตคณิตสองมือ</span>
          <strong>มือซ้ายหลักสิบ · มือขวาหลักหน่วย</strong>
        </div>
        <span id="mentalHandStatus" class="mental-hand-status">กรุณาชูสองมือ</span>
      </div>
      <div class="mental-live-grid">
        <div class="mental-hand-card">
          <span class="mental-card-label">มือซ้าย</span>
          <strong id="mentalLeftValue">—</strong>
          <small>หลักสิบ</small>
        </div>
        <span class="mental-symbol">×10</span>
        <div class="mental-hand-card">
          <span class="mental-card-label">มือขวา</span>
          <strong id="mentalRightValue">—</strong>
          <small>หลักหน่วย</small>
        </div>
        <span class="mental-symbol">=</span>
        <div class="mental-hand-card mental-combined">
          <span class="mental-card-label">คำตอบ</span>
          <strong id="mentalCombinedValue">—</strong>
          <small>00–99</small>
        </div>
      </div>`;
    questionCard.insertAdjacentElement('afterend',panel);
  }

  function setGameChrome(isMental){
    document.body.classList.toggle('mental-live-active',isMental);
    document.body.classList.toggle('game-in-progress',true);
    const mascot=document.getElementById('wowLabBtn');
    if(mascot)mascot.setAttribute('aria-hidden','true');
  }

  function clearGameChrome(){
    document.body.classList.remove('mental-live-active','game-in-progress');
    const mascot=document.getElementById('wowLabBtn');
    if(mascot)mascot.removeAttribute('aria-hidden');
  }

  function hookGameMode(){
    if(!window.app||app.__cleanV8Hooked)return;
    app.__cleanV8Hooked=true;
    const originalStart=app.startGame.bind(app);
    app.startGame=async function(mode,...args){
      setGameChrome(mode==='mental_two_hand');
      try{return await originalStart(mode,...args)}catch(error){clearGameChrome();throw error}
    };
    const originalReturn=app.returnToMenu.bind(app);
    app.returnToMenu=function(...args){clearGameChrome();return originalReturn(...args)};
    if(typeof app.endGame==='function'){
      const originalEnd=app.endGame.bind(app);
      app.endGame=function(...args){const result=originalEnd(...args);document.body.classList.remove('game-in-progress');return result};
    }
  }

  function init(){addMentalPanel();hookGameMode();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
  else setTimeout(init,0);
  window.addEventListener('load',()=>setTimeout(init,100));
})();
