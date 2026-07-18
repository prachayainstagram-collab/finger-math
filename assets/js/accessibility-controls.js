(function(){
  'use strict';

  const $=id=>document.getElementById(id);

  function ensurePanel(){
    if($('stableTrueFalsePanel'))return;
    const panel=document.createElement('section');
    panel.id='stableTrueFalsePanel';
    panel.className='stable-tf-panel hidden';
    panel.setAttribute('aria-label','ตัวเลือกตอบถูกหรือผิด');
    panel.innerHTML=`
      <p class="stable-tf-help">
        วิธีตอบหลัก: กดปุ่ม • ชู 1 นิ้ว = ถูก • ชู 2 นิ้ว = ผิด • ลูกศรขวา/ซ้าย
      </p>
      <div class="stable-tf-grid">
        <button type="button" class="stable-tf-btn stable-tf-true" data-stable-answer="true">
          <span aria-hidden="true">✓</span><strong>ถูก</strong>
        </button>
        <button type="button" class="stable-tf-btn stable-tf-false" data-stable-answer="false">
          <span aria-hidden="true">✕</span><strong>ผิด</strong>
        </button>
      </div>
      <button type="button" class="stable-face-toggle" id="stableFaceToggle">
        เปิดโหมดทดลอง: พยักหน้า / ส่ายหัว
      </button>`;
    document.body.appendChild(panel);

    panel.querySelectorAll('[data-stable-answer]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        window.app?.submitStableTrueFalse(btn.dataset.stableAnswer==='true','button');
      });
    });

    $('stableFaceToggle')?.addEventListener('click',()=>{
      if(!window.app)return;
      app.experimentalGestureEnabled=!app.experimentalGestureEnabled;
      $('stableFaceToggle').textContent=app.experimentalGestureEnabled
        ?'ปิดโหมดทดลอง: พยักหน้า / ส่ายหัว'
        :'เปิดโหมดทดลอง: พยักหน้า / ส่ายหัว';
      if(app.tracker?.setGestureMode){
        app.tracker.setGestureMode(app.experimentalGestureEnabled?'head':'off');
      }
    });
  }

  function panelVisible(){
    return Boolean(window.app && app.state==='playing' && app.physicalMode);
  }

  function updatePanel(){
    const panel=$('stableTrueFalsePanel');
    if(panel)panel.classList.toggle('hidden',!panelVisible());
  }

  function patchGameManager(){
    if(!window.GameManager || GameManager.prototype.__stableTFPatched)return;
    GameManager.prototype.__stableTFPatched=true;

    const oldStartGame=GameManager.prototype.startGame;
    GameManager.prototype.startGame=async function(mode,...rest){
      // The old head/face cards now enter the stable True/False mode.
      if(mode==='physical_head'||mode==='physical_face'||mode==='physical_stable'){
        mode='physical_head';
        this.experimentalGestureEnabled=false;
      }
      const result=await oldStartGame.call(this,mode,...rest);
      if(this.physicalMode && this.tracker?.setGestureMode){
        this.tracker.setGestureMode('off');
      }
      updatePanel();
      return result;
    };

    const oldReturn=GameManager.prototype.returnToMenu;
    GameManager.prototype.returnToMenu=function(...args){
      const result=oldReturn.apply(this,args);
      updatePanel();
      return result;
    };

    const oldEnd=GameManager.prototype.endGame;
    GameManager.prototype.endGame=function(...args){
      const result=oldEnd.apply(this,args);
      updatePanel();
      return result;
    };

    GameManager.prototype.submitStableTrueFalse=function(value,source='button'){
      if(this.state!=='playing'||!this.physicalMode)return;
      const now=performance.now();
      if(now<(this.stableTFCooldownUntil||0))return;
      const q=this.qMgr?.q;
      if(!q||typeof q.answerCheck!=='function')return;

      this.stableTFCooldownUntil=now+900;
      const mappedGesture=value?'nod':'shake';
      const ok=Boolean(q.answerCheck(mappedGesture));
      const responseTime=Math.max(0,CONFIG.timePerQuestion-this.timeLeft);
      this.pendingPhysicalGesture=source+':' +(value?'true':'false');
      this.currentGesture=this.pendingPhysicalGesture;
      this.isHolding=false;
      this.holdElapsed=0;
      DOM.holdRing?.classList.add('hidden');

      if(ok)this.handleOk(responseTime);
      else this.handleBad(
        'ยังไม่ถูก ลองใหม่อีกครั้ง',
        `คำตอบที่ถูกคือ: ${q.answerText ?? '—'}`,
        this.pendingPhysicalGesture
      );
    };

    const oldOnHand=GameManager.prototype.onHand;
    GameManager.prototype.onHand=function(f,conf){
      if(this.physicalMode){
        if(this.state!=='playing'||conf<Number(window.FM_CONFIG?.CAMERA_CONFIDENCE||0.70))return;
        if(f===1)this.submitStableTrueFalse(true,'finger');
        else if(f===2)this.submitStableTrueFalse(false,'finger');
        if(DOM.hudFingers)DOM.hudFingers.innerText=f===1?'☝️ ถูก':f===2?'✌️ ผิด':`${f} นิ้ว`;
        return;
      }
      return oldOnHand.call(this,f,conf);
    };

    const oldFaceGesture=GameManager.prototype.onFaceGesture;
    GameManager.prototype.onFaceGesture=function(gesture,conf,label){
      if(this.physicalMode&&!this.experimentalGestureEnabled)return;
      return oldFaceGesture.call(this,gesture,conf,label);
    };
  }

  function installKeyboard(){
    document.addEventListener('keydown',e=>{
      if(!window.app||app.state!=='playing'||!app.physicalMode)return;
      if(e.key==='ArrowRight'||e.key.toLowerCase()==='y'){
        e.preventDefault();app.submitStableTrueFalse(true,'keyboard');
      }else if(e.key==='ArrowLeft'||e.key.toLowerCase()==='n'){
        e.preventDefault();app.submitStableTrueFalse(false,'keyboard');
      }
    });
  }

  function relabelCards(){
    const buttons=[...document.querySelectorAll('button')];
    const head=buttons.find(b=>(b.getAttribute('onclick')||'').includes("physical_head"));
    if(head){
      head.innerHTML='<i class="fa-solid fa-circle-check"></i><span><b>โหมดถูก–ผิดแบบเสถียร</b><small style="display:block;opacity:.72">ปุ่มใหญ่ · ชู 1/2 นิ้ว · ลูกศรขวา/ซ้าย</small></span>';
    }
    const face=buttons.find(b=>(b.getAttribute('onclick')||'').includes("physical_face"));
    if(face){
      face.style.display='none';
      face.setAttribute('aria-hidden','true');
    }
  }

  function boot(){
    ensurePanel();
    patchGameManager();
    installKeyboard();
    relabelCards();
    setInterval(updatePanel,300);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
