
(function(){
  function addMentalPanel(){
    const game=document.getElementById('screenGame');
    if(!game||document.getElementById('mentalLivePanel'))return;
    const panel=document.createElement('div');
    panel.id='mentalLivePanel';panel.className='mental-live-panel';
    panel.innerHTML='<div class="mental-live-grid"><div class="mental-hand-card"><b>มือซ้ายของผู้เล่น</b><strong id="mentalLeftValue">—</strong><span>หลักสิบ</span></div><div class="mental-symbol">×10</div><div class="mental-hand-card"><b>มือขวาของผู้เล่น</b><strong id="mentalRightValue">—</strong><span>หลักหน่วย</span></div><div class="mental-symbol">=</div><div class="mental-hand-card mental-combined"><b>คำตอบ</b><strong id="mentalCombinedValue">—</strong><span>00–99</span></div></div><div id="mentalHandStatus" class="mental-hand-status">ชูสองมือให้เห็นพร้อมกันและเว้นระยะระหว่างมือ</div>';
    game.appendChild(panel);
  }
  function hookGameMode(){
    if(!window.app||app.__cleanV8Hooked)return;
    app.__cleanV8Hooked=true;
    const originalStart=app.startGame.bind(app);
    app.startGame=async function(mode,...args){document.body.classList.toggle('mental-live-active',mode==='mental_two_hand');return originalStart(mode,...args)};
    const originalReturn=app.returnToMenu.bind(app);
    app.returnToMenu=function(...args){document.body.classList.remove('mental-live-active');return originalReturn(...args)};
  }
  function init(){addMentalPanel();hookGameMode();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
  window.addEventListener('load',()=>setTimeout(init,100));
})();
