(function(){
  const I18N={en:(window.FM_LOCALES&&window.FM_LOCALES.en)||{}};
  const TH_BY_EN={};Object.entries(I18N.en).forEach(([th,en])=>TH_BY_EN[en]=th);
  const settings={
    lang:localStorage.getItem('fm_language')||'th',
    voiceName:localStorage.getItem('fm_voice_name')||'',
    rate:parseFloat(localStorage.getItem('fm_voice_rate')||'0.82')
  };
  window.FMLanguage=settings;

  function translateExact(text,lang){const s=String(text||'').trim();if(!s)return text;if(lang==='en')return I18N.en[s]||text;return TH_BY_EN[s]||text;}
  function translateMathText(text,lang){
    let s=String(text||'');if(lang!=='en')return s;
    return s.replace(/ชู\s*(\d+)\s*นิ้ว/g,'Show $1 fingers')
      .replace(/มากกว่า/g,'is greater than').replace(/น้อยกว่า/g,'is less than').replace(/ไม่มากกว่า/g,'is not greater than')
      .replace(/เป็นเลขคู่/g,'is an even number').replace(/เป็นเลขคี่/g,'is an odd number')
      .replace(/เลขคู่/g,'Even number').replace(/เลขคี่/g,'Odd number')
      .replace(/จำนวนที่มากกว่า\s*(\d+)/g,'a number greater than $1').replace(/จำนวนที่น้อยกว่า\s*(\d+)/g,'a number less than $1');
  }
  function translateInstruction(s,lang){if(lang!=='en')return s;const M={
    'ชูนิ้วให้ครบตามตัวเลข':'Show the requested number of fingers','คิดในใจแล้วชูนิ้วตอบ':'Think, then show the answer with your fingers','ชูนิ้วให้ครบ':'Show the correct number of fingers',
    'ชูนิ้วจำนวนคู่ (2, 4, 6…)':'Show an even number of fingers (2, 4, 6…)','ชูนิ้วจำนวนคี่ (1, 3, 5…)':'Show an odd number of fingers (1, 3, 5…)',
    'ยิ้มถ้าข้อความถูก / ทำหน้านิ่งถ้าข้อความผิด':'Smile if the statement is true / Keep a neutral face if it is false',
    'พยักหน้าถ้าข้อความถูก / ส่ายหัวถ้าข้อความผิด':'Nod if the statement is true / Shake your head if it is false'
  };return M[s]||s.replace(/ชูนิ้วให้มากกว่า\s*(\d+)/,'Show more than $1 fingers').replace(/ชูนิ้วให้น้อยกว่า\s*(\d+)/,'Show fewer than $1 fingers');}

  function translateTree(lang){
    document.documentElement.lang=lang==='en'?'en':'th';
    document.title=lang==='en'?'Finger Math Learning Studio':'Finger Math Learning Studio';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement&& !['SCRIPT','STYLE','PRE','CODE'].includes(n.parentElement.tagName)&&n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{const leading=n.nodeValue.match(/^\s*/)?.[0]||'',trailing=n.nodeValue.match(/\s*$/)?.[0]||'';const core=n.nodeValue.trim();const out=translateExact(core,lang);if(out!==core)n.nodeValue=leading+out+trailing;});
    document.querySelectorAll('input[placeholder]').forEach(el=>{if(!el.dataset.thPlaceholder)el.dataset.thPlaceholder=el.placeholder;el.placeholder=lang==='en'?(I18N.en[el.dataset.thPlaceholder]||el.dataset.thPlaceholder):el.dataset.thPlaceholder;});
    document.querySelectorAll('option').forEach(el=>{if(!el.dataset.thText)el.dataset.thText=el.textContent;el.textContent=lang==='en'?(I18N.en[el.dataset.thText]||el.dataset.thText):el.dataset.thText;});
    const badge=document.getElementById('fmLanguageBadge');if(badge)badge.textContent=lang==='en'?'EN':'TH';
    const sumTitle=document.getElementById('fmToolTitle');if(sumTitle)sumTitle.textContent=lang==='en'?'Language & Voice':'ภาษาและเสียง';
    const labels={fmLangLabel:lang==='en'?'Interface language':'ภาษาหน้าจอ',fmVoiceLabel:lang==='en'?'Device voice':'เสียงจากอุปกรณ์',fmRateLabel:lang==='en'?'Speaking speed':'ความเร็วเสียง',fmTestBtn:lang==='en'?'Test voice':'ทดลองเสียง',fmCloseBtn:lang==='en'?'Close':'ปิด'};
    Object.entries(labels).forEach(([id,t])=>{const el=document.getElementById(id);if(el)el.textContent=t;});
    if(window.app?.speech){window.app.speech.setLanguage?.(lang);populateVoiceSelect();window.app.updateVoiceModeUI?.();}
  }

  function populateVoiceSelect(){
    const sel=document.getElementById('fmVoiceSelect');if(!sel||!window.speechSynthesis)return;
    const voices=window.speechSynthesis.getVoices()||[];const lang=settings.lang==='en'?'en':'th';
    const matched=voices.filter(v=>(v.lang||'').toLowerCase().startsWith(lang));const list=matched.length?matched:voices;
    sel.innerHTML='';
    const auto=document.createElement('option');auto.value='';auto.textContent=settings.lang==='en'?'Automatic device voice':'เลือกเสียงอัตโนมัติ';sel.appendChild(auto);
    list.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=`${v.name} — ${v.lang}${v.localService?' (device)':''}`;o.selected=v.name===settings.voiceName;sel.appendChild(o);});
  }
  function setLanguage(lang){settings.lang=lang==='en'?'en':'th';localStorage.setItem('fm_language',settings.lang);translateTree(settings.lang);}

  function buildTools(){
    if(document.getElementById('fmLanguageTools'))return;
    const d=document.createElement('details');d.id='fmLanguageTools';d.className='fm-language-tools';
    d.innerHTML=`<summary><i class="fa-solid fa-language"></i><span class="fm-title" id="fmToolTitle">ภาษาและเสียง</span><span id="fmLanguageBadge" class="fm-language-badge">TH</span></summary><div class="fm-language-panel">
      <div class="fm-setting-row"><label id="fmLangLabel">ภาษาหน้าจอ</label><select id="fmLanguageSelect"><option value="th">ไทย</option><option value="en">English</option></select></div>
      <div class="fm-setting-row"><label id="fmVoiceLabel">เสียงจากอุปกรณ์</label><select id="fmVoiceSelect"><option>กำลังโหลดเสียง...</option></select></div>
      <div class="fm-setting-row"><label id="fmRateLabel">ความเร็วเสียง</label><input id="fmVoiceRate" type="range" min="0.6" max="1.25" step="0.05" value="${settings.rate}"></div>
      <div class="fm-setting-actions"><button id="fmTestBtn" class="fm-test-voice">ทดลองเสียง</button><button id="fmCloseBtn" class="fm-close-tools">ปิด</button></div></div>`;
    document.body.appendChild(d);
    const langSel=document.getElementById('fmLanguageSelect');langSel.value=settings.lang;langSel.onchange=e=>setLanguage(e.target.value);
    document.getElementById('fmVoiceSelect').onchange=e=>{settings.voiceName=e.target.value;localStorage.setItem('fm_voice_name',settings.voiceName);window.app?.speech?.setVoice?.(settings.voiceName);};
    document.getElementById('fmVoiceRate').oninput=e=>{settings.rate=parseFloat(e.target.value);localStorage.setItem('fm_voice_rate',String(settings.rate));if(window.app?.speech)window.app.speech.rate=settings.rate;};
    document.getElementById('fmTestBtn').onclick=()=>{if(window.app?.speech){window.app.speech.enabled=true;window.app.speech.speak(settings.lang==='en'?'Hello! The Finger Math voice is ready.':'สวัสดีค่ะ ระบบเสียง Finger Math พร้อมใช้งานแล้ว');}else{const u=new SpeechSynthesisUtterance(settings.lang==='en'?'Hello! The Finger Math voice is ready.':'สวัสดีค่ะ ระบบเสียง Finger Math พร้อมใช้งานแล้ว');u.lang=settings.lang==='en'?'en-US':'th-TH';speechSynthesis.speak(u);}};
    document.getElementById('fmCloseBtn').onclick=()=>d.removeAttribute('open');
    populateVoiceSelect();translateTree(settings.lang);
  }

  // Replace SpeechManager behavior with free local-device bilingual voices.
  if(window.SpeechManager||typeof SpeechManager!=='undefined'){
    const P=SpeechManager.prototype;
    P.setLanguage=function(lang){this.language=lang==='en'?'en':'th';settings.lang=this.language;this.loadVoices();};
    P.setVoice=function(name){settings.voiceName=name||'';this.loadVoices();};
    P.loadVoices=function(){
      if(!this.supported())return[];const voices=window.speechSynthesis.getVoices()||[];this.voicesReady=voices.length>0;
      this.language=settings.lang||this.language||'th';this.rate=settings.rate||this.rate||.82;
      this.voice=(settings.voiceName&&voices.find(v=>v.name===settings.voiceName))||voices.find(v=>(v.lang||'').toLowerCase().startsWith(this.language==='en'?'en':'th'))||voices[0]||null;return voices;
    };
    P.enable=async function(){this.enabled=true;document.body.classList.add('voice-mode');if(!this.supported())return false;this.setLanguage(settings.lang);await this.waitForVoices();await new Promise(r=>setTimeout(r,100));return this.speak(settings.lang==='en'?'Voice mode enabled. The system is ready.':'เปิดโหมดเสียงแล้ว ระบบพร้อมใช้งาน',false,true);};
    P.numberToWords=function(n){n=Number(n);if(settings.lang==='en'){const a=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];return a[n]??String(n);}const w={0:'ศูนย์',1:'หนึ่ง',2:'สอง',3:'สาม',4:'สี่',5:'ห้า',6:'หก',7:'เจ็ด',8:'แปด',9:'เก้า',10:'สิบ'};return w[n]??String(n).split('').map(d=>w[Number(d)]??d).join(' ');};
    P.numberToThai=P.numberToWords;
    P.normalizeMath=function(t){let s=String(t||'').replace(/(\d+)/g,m=>this.numberToWords(m));if(settings.lang==='en')return s.replace(/×/g,' times ').replace(/\+/g,' plus ').replace(/-/g,' minus ').replace(/>/g,' greater than ').replace(/</g,' less than ').replace(/=/g,' equals ').replace(/\?/g,' what is the answer ').replace(/\s+/g,' ').trim();return s.replace(/×/g,' คูณ ').replace(/\+/g,' บวก ').replace(/-/g,' ลบ ').replace(/>/g,' มากกว่า ').replace(/</g,' น้อยกว่า ').replace(/=/g,' เท่ากับ ').replace(/\?/g,' เท่าไหร่ ').replace(/\s+/g,' ').trim();};
    const originalSpeak=P.speak;P.speak=function(text,interrupt=true,retry=true){this.language=settings.lang;this.rate=settings.rate;this.loadVoices();return originalSpeak.call(this,text,interrupt,retry);};
    P.question=function(q){return q?this.speak(settings.lang==='en'?`${this.normalizeMath(translateMathText(q.text,'en'))}. Show your answer with your fingers.`:`${this.normalizeMath(q.text)} ... ยกนิ้วตอบได้เลย`):Promise.resolve(false);};
    P.result=function(ok,msg){if(settings.lang==='en'){if(ok)return this.speak('Great job! Correct answer.');if(/หมดเวลา|time/i.test(String(msg||'')))return this.speak('Time is up.');return this.speak('Please try the next question.');}if(ok)return this.speak('เก่งมาก');if(/หมดเวลา/.test(String(msg||'')))return this.speak('หมดเวลา');return this.speak('ลองอีกครั้ง');};
    P.finger=function(f,force=false){const now=Date.now();if(!force&&(f===this.lastFinger||now-this.lastFingerTime<2600||this.isSpeaking))return Promise.resolve(false);this.lastFinger=f;this.lastFingerTime=now;return this.speak(settings.lang==='en'?`I can see ${this.numberToWords(f)} fingers`:`เห็น ${this.numberToWords(f)} นิ้ว`,false);};
    P.help=function(){return this.speak(settings.lang==='en'?'Listen until the question finishes, then show your answer with your fingers. Press Space to hear the question again.':'ฟังโจทย์ให้จบ แล้วค่อยยกนิ้วตอบ กดสเปซเพื่อฟังซ้ำ');};
    P.summary=function(score,acc,correct){return this.speak(settings.lang==='en'?`Activity complete. Your score is ${this.numberToWords(score)}. You answered ${this.numberToWords(correct)} questions correctly.`:`จบกิจกรรม ได้ ${this.numberToWords(score)} คะแนน ถูก ${this.numberToWords(correct)} ข้อ`);};
  }

  // Translate newly generated questions while preserving answer checking.
  if(typeof QuestionManager!=='undefined'){
    const originalGenerate=QuestionManager.prototype.generate;
    QuestionManager.prototype.generate=function(...args){const q=originalGenerate.apply(this,args);if(settings.lang==='en'&&q){q._thai={text:q.text,instruction:q.instruction,modeName:q.modeName,answerText:q.answerText};q.text=translateMathText(q.text,'en');q.instruction=translateInstruction(q.instruction,'en');q.modeName=I18N.en[q.modeName]||q.modeName;q.answerText=translateMathText(q.answerText,'en');}return q;};
  }

  // Keep dynamic status text bilingual.
  if(typeof GameManager!=='undefined'){
    const oldUpdate=GameManager.prototype.updateVoiceModeUI;
    GameManager.prototype.updateVoiceModeUI=function(){oldUpdate.call(this);if(settings.lang==='en'){
      const b=document.getElementById('btnVoiceAccessibility'),s=document.getElementById('voiceModeStatus');if(b)b.innerHTML=this.accessibilityMode?'<i class="fa-solid fa-volume-xmark"></i> Disable voice mode':'<i class="fa-solid fa-volume-high"></i> Enable voice mode';if(s)s.innerHTML=this.accessibilityMode?'<i class="fa-solid fa-ear-listen"></i> Status: Voice mode enabled':'<i class="fa-solid fa-ear-listen"></i> Status: Voice mode disabled';}
    };
    const oldShow=GameManager.prototype.showFB;GameManager.prototype.showFB=function(ok,pts,msg,sub){if(settings.lang==='en'){msg=msg==='หมดเวลา!'?'Time is up!':msg;sub=String(sub||'').replace('คำตอบที่ถูกคือ:','Correct answer:');}oldShow.call(this,ok,pts,msg,sub);if(settings.lang==='en')DOM.feedbackText.innerText=ok?'Correct!':'Not quite!';};
  }

  if('speechSynthesis' in window){speechSynthesis.addEventListener?.('voiceschanged',populateVoiceSelect);}
  document.addEventListener('DOMContentLoaded',()=>{buildTools();setTimeout(()=>translateTree(settings.lang),100);});
  window.addEventListener('load',()=>setTimeout(()=>{buildTools();if(window.app?.speech){window.app.speech.setLanguage(settings.lang);window.app.speech.setVoice(settings.voiceName);window.app.speech.rate=settings.rate;}translateTree(settings.lang);populateVoiceSelect();},250));
  window.fmSetLanguage=setLanguage;
})();
