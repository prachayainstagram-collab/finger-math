(function(){
  const l=document.getElementById('particleLayer');
  const s=['+','-','×','÷','=','π','√','∞','²','%'];
  for(let i=0;i<14;i++){
    const p=document.createElement('div');p.className='particle';
    p.innerText=s[i%s.length];
    p.style.left=Math.random()*100+'vw';
    p.style.animationDuration=(Math.random()*12+12)+'s';
    p.style.animationDelay=(Math.random()*8)+'s';
    l.appendChild(p);
  }
})();

const CONFIG={
  timePerQuestion:10,holdTimeRequired:1.2,
  pointsBase:10,pointsFast:5,levelUpScore:100,
  confThreshold:0.6,
  cameraTimeoutMs:9000,
  messages:["ยอดเยี่ยม!","อัจฉริยะ!","สุดยอด!","ไวปานสายฟ้า!","แม่นยำมาก!","ทำได้ดี!","เก่งมาก!","ดีเยี่ยม!"]
};

function classifyLearnerLevel(avgRT,accuracy){
  if(avgRT<=3&&accuracy>=85)return{label:'ระดับเชี่ยวชาญ',icon:'🌟',color:'#fcd34d',bg:'rgba(234,197,71,0.15)',border:'rgba(234,197,71,0.4)',desc:'ตอบเร็วและแม่นยำมาก พร้อมเพิ่มความยากของโจทย์ได้แล้ว'};
  if(avgRT<=6&&accuracy>=60)return{label:'ระดับปานกลาง',icon:'🚀',color:'#67e8f9',bg:'rgba(8,145,178,0.15)',border:'rgba(8,145,178,0.4)',desc:'ทำได้ดี ควรฝึกเพิ่มเพื่อเพิ่มความเร็วและความแม่นยำ'};
  return{label:'ระดับเริ่มต้น',icon:'🌱',color:'#6ee7b7',bg:'rgba(16,185,129,0.15)',border:'rgba(16,185,129,0.4)',desc:'ยังต้องฝึกฝนเพิ่ม แนะนำใช้โหมดฝึกหัดบ่อย ๆ'};
}

const $=id=>document.getElementById(id);
const DOM={
  menu:$('screenMenu'),ui:$('screenGame'),
  camStatus:$('cameraStatus'),video:$('inputVideo'),
  canvas:$('outputCanvas'),faceCanvas:$('faceCanvas'),camWrapper:$('camWrapper'),
  hudScore:$('hudScore'),hudLevel:$('hudLevel'),
  hudPlayerName:$('hudPlayerName'),hudFingers:$('hudFingers'),
  hudConf:$('hudConf'),hudElapsed:$('hudElapsed'),
  hudTestBadge:$('hudTestBadge'),confidenceFill:$('confidenceFill'),
  timerText:$('timerText'),timerBar:$('timerBar'),
  questionMode:$('questionModeText'),questionText:$('questionText'),
  instructionText:$('instructionText'),
  holdRing:$('holdRing'),holdFill:$('holdFill'),
  feedbackContainer:$('feedbackContainer'),
  feedbackIconWrap:$('feedbackIconWrap'),feedbackIcon:$('feedbackIcon'),
  feedbackText:$('feedbackText'),feedbackPoints:$('feedbackPoints'),
  feedbackMessage:$('feedbackMessage'),feedbackAnswer:$('feedbackAnswer'),
  comboDisplay:$('comboDisplay'),comboDisplay2:$('comboDisplay2'),
  achv:{beginner:$('achvBeginner'),star:$('achvStar'),master:$('achvMaster'),champion:$('achvChampion')},
  gameOverModal:$('gameOverModal'),gameOverTitle:$('gameOverTitle'),
  finalScoreText:$('finalScoreText'),finalPlayerName:$('finalPlayerName'),
  finalClassroom:$('finalClassroom'),finalSessionId:$('finalSessionId'),
  finalElapsed:$('finalElapsed'),finalAccuracy:$('finalAccuracy'),
  finalCorrect:$('finalCorrect'),finalWrong:$('finalWrong'),
  finalQuestionLog:$('finalQuestionLog'),sessionTypeBadge:$('sessionTypeBadge'),
  startPlayerName:$('startPlayerName'),startClassroom:$('startClassroom'),
  startQuestionCount:$('startQuestionCount'),startDifficulty:$('startDifficulty'),
  gradeBandHint:$('gradeBandHint'),difficultyHint:$('difficultyHint'),difficultyMeterFill:$('difficultyMeterFill'),gradeRecommendation:$('gradeRecommendation'),gradeQuickButtons:$('gradeQuickButtons'),v8MissionTitle:$('v8MissionTitle'),v8MissionSubtitle:$('v8MissionSubtitle'),v8TierTabs:$('v8TierTabs'),v8MissionList:$('v8MissionList'),v8ProgressSummary:$('v8ProgressSummary'),
  leaderboardModal:$('leaderboardModal'),leaderboardList:$('leaderboardList'),
  dashboardModal:$('dashboardModal'),customConfirmModal:$('customConfirmModal'),
  levelUpOverlay:$('levelUpOverlay'),btnPause:$('btnPause'),
  btnRestart:$('btnRestart'),btnMenu:$('btnMenu'),
  dashTotalPlayers:$('dashTotalPlayers'),dashTotalSessions:$('dashTotalSessions'),
  dashAvgAcc:$('dashAvgAcc'),dashAvgTime:$('dashAvgTime'),
  dashTopicBars:$('dashTopicBars'),dashPrePost:$('dashPrePost'),
  dashRecentSessions:$('dashRecentSessions'),
  levelAnalysisCard:$('levelAnalysisCard'),levelAnalysisIcon:$('levelAnalysisIcon'),
  levelAnalysisTitle:$('levelAnalysisTitle'),levelAnalysisDesc:$('levelAnalysisDesc'),
  emotionEmoji:$('emotionEmoji'),emotionLabel:$('emotionLabel'),emotionSub:$('emotionSub'),
  faceStatusDot:$('faceStatusDot'),faceStatusTxt:$('faceStatusTxt'),
  barHappy:$('barHappy'),barAnxious:$('barAnxious'),barFocus:$('barFocus'),barExcited:$('barExcited'),
  valHappy:$('valHappy'),valAnxious:$('valAnxious'),valFocus:$('valFocus'),valExcited:$('valExcited'),
  motiveToast:$('motiveToast'),emotionCheer:$('emotionCheer'),emotionCheerText:$('emotionCheerText'),
  emotionAmbient:$('emotionAmbient'),emotionSummaryContent:$('emotionSummaryContent'),
  cameraStatusIconWrap:$('cameraStatusIconWrap'),cameraStatusIcon:$('cameraStatusIcon'),
  cameraStatusTitle:$('cameraStatusTitle'),cameraStatusSub:$('cameraStatusSub'),
  btnCameraRetry:$('btnCameraRetry'),
  themeTogglePill:$('themeTogglePill'),themeToggleLabel:$('themeToggleLabel'),
  menuSubtitle:$('menuSubtitle'),
  screenAuth:$('screenAuth'),
  authRoleParentBtn:$('authRoleParentBtn'),authRoleTeacherBtn:$('authRoleTeacherBtn'),authRoleStudentBtn:$('authRoleStudentBtn'),
  authModeLoginBtn:$('authModeLoginBtn'),authModeSignupBtn:$('authModeSignupBtn'),
  authSignupNameWrap:$('authSignupNameWrap'),authName:$('authName'),
  authEmail:$('authEmail'),authPassword:$('authPassword'),authError:$('authError'),
  authSubmitBtn:$('authSubmitBtn'),authModeSwitch:$('authModeSwitch'),authEmailWrap:$('authEmailWrap'),authPasswordWrap:$('authPasswordWrap'),authStudentPanel:$('authStudentPanel'),studentProfileList:$('studentProfileList'),studentProfileEmpty:$('studentProfileEmpty'),
  topnavLinks:$('topnavLinks'),navUserRoleBadge:$('navUserRoleBadge'),navUserName:$('navUserName'),
  rosterTabLabel:$('rosterTabLabel'),rosterHintTitle:$('rosterHintTitle'),rosterHintDesc:$('rosterHintDesc'),
  rosterNewName:$('rosterNewName'),rosterNewClassroom:$('rosterNewClassroom'),rosterList:$('rosterList'),
  teacherStudentSelect:$('teacherStudentSelect'),
  sheetSyncModal:$('sheetSyncModal'),sheetSyncUrl:$('sheetSyncUrl'),sheetSyncAuto:$('sheetSyncAuto'),
  sheetSyncStatus:$('sheetSyncStatus'),appsScriptCodeBox:$('appsScriptCodeBox'),
};

function genSessionId(){return'SES-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();}

class SeededRNG{
  constructor(s){this.seed=s>>>0;}
  next(){this.seed=(this.seed*1664525+1013904223)>>>0;return this.seed/0x100000000;}
  nextInt(a,b){return Math.floor(this.next()*(b-a+1))+a;}
}

class SoundManager{
  constructor(){
    this.ctx=null;this.ok=false;
    this.enabled=localStorage.getItem('fm_sound_enabled')!=='0';
  }
  init(){
    if(!this.enabled)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      if(!this.ok){this.ctx=new AC();this.ok=true;}
      if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
    }catch(e){console.warn('Audio init:',e);}
  }
  unlock(){this.init();}
  setEnabled(v){
    this.enabled=!!v;localStorage.setItem('fm_sound_enabled',this.enabled?'1':'0');
    if(this.enabled){this.init();this.cheer();}
  }
  toggle(){this.setEnabled(!this.enabled);return this.enabled;}
  _t(f,t,d,v=0.07){if(!this.enabled){return;}this.init();if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=t;o.frequency.setValueAtTime(f,this.ctx.currentTime);g.gain.setValueAtTime(v,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+d);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+d);}
  correct(){this._t(523,'sine',.1);setTimeout(()=>this._t(659,'sine',.2),100);}
  wrong(){this._t(150,'sawtooth',.3,.05);}
  levelUp(){[261,329,392,523].forEach((f,i)=>setTimeout(()=>this._t(f,'square',.15,.05),i*150));}
  cheer(){[440,550,660].forEach((f,i)=>setTimeout(()=>this._t(f,'triangle',.1,.04),i*80));}
}


class SpeechManager{
  constructor(){
    this.enabled=false;
    this.lastFinger=-1;
    this.lastFingerTime=0;
    this.voice=null;
    this.rate=0.82;
    this.pitch=1.0;
    this.volume=1.0;
    this.isSpeaking=false;
    this.currentUtterance=null;
    this.speakTimer=null;
    this.voicesReady=false;
    this.loadVoices();
    if('speechSynthesis' in window){
      window.speechSynthesis.addEventListener?.('voiceschanged',()=>this.loadVoices());
      window.speechSynthesis.onvoiceschanged=()=>this.loadVoices();
    }
  }
  supported(){return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;}
  loadVoices(){
    if(!this.supported())return [];
    const voices=window.speechSynthesis.getVoices()||[];
    this.voicesReady=voices.length>0;
    this.voice=
      voices.find(v=>/^th(-|_)/i.test(v.lang||'') && /Kanya|Narisa|Pattara|Premwadee|Female|หญิง/i.test(v.name||'')) ||
      voices.find(v=>/^th(-|_)/i.test(v.lang||'')) ||
      voices.find(v=>/Thai/i.test((v.lang||'')+' '+(v.name||''))) ||
      voices.find(v=>/^en(-|_)/i.test(v.lang||'')) ||
      voices[0] || null;
    return voices;
  }
  waitForVoices(timeout=1200){
    if(!this.supported())return Promise.resolve([]);
    const now=this.loadVoices();
    if(now.length)return Promise.resolve(now);
    return new Promise(resolve=>{
      const started=Date.now();
      const tick=()=>{
        const v=this.loadVoices();
        if(v.length || Date.now()-started>=timeout)return resolve(v);
        setTimeout(tick,80);
      };
      tick();
    });
  }
  async enable(){
    this.enabled=true;
    document.body.classList.add('voice-mode');
    if(!this.supported())return false;
    try{window.speechSynthesis.cancel();window.speechSynthesis.resume();}catch(e){}
    await this.waitForVoices();
    // เว้นช่วงเล็กน้อยหลัง cancel เพื่อป้องกัน Chrome/Safari กลืนเสียงแรก
    await new Promise(r=>setTimeout(r,120));
    return this.speak('เปิดโหมดเสียงแล้ว ระบบพร้อมใช้งาน',false,true);
  }
  disable(){this.stop();this.enabled=false;document.body.classList.remove('voice-mode');}
  stop(){
    clearTimeout(this.speakTimer);
    this.currentUtterance=null;
    if(this.supported())try{window.speechSynthesis.cancel();}catch(e){}
    this.isSpeaking=false;
  }
  speak(text,interrupt=true,retry=true){
    if(!this.enabled || !this.supported() || !text)return Promise.resolve(false);
    clearTimeout(this.speakTimer);
    if(interrupt){try{window.speechSynthesis.cancel();}catch(e){}}
    return new Promise(resolve=>{
      let settled=false;
      const finish=(ok)=>{if(settled)return;settled=true;this.isSpeaking=false;resolve(ok);};
      const run=()=>{
        this.loadVoices();
        const u=new SpeechSynthesisUtterance(String(text));
        this.currentUtterance=u; // สำคัญ: กัน Safari/Chrome เก็บ object ทิ้งก่อนเสียงจบ
        u.lang=this.voice?.lang && /^th/i.test(this.voice.lang)?this.voice.lang:'th-TH';
        u.rate=this.rate;u.pitch=this.pitch;u.volume=this.volume;
        if(this.voice)u.voice=this.voice;
        u.onstart=()=>{this.isSpeaking=true;};
        u.onend=()=>{this.currentUtterance=null;finish(true);};
        u.onerror=(ev)=>{
          this.currentUtterance=null;
          if(retry && ev?.error!=='canceled' && ev?.error!=='interrupted'){
            setTimeout(()=>this.speak(text,false,false).then(finish),180);
          }else finish(false);
        };
        try{
          window.speechSynthesis.resume();
          window.speechSynthesis.speak(u);
          // บางรุ่นรับคำสั่งแต่ค้าง paused ให้ resume ซ้ำ
          setTimeout(()=>{try{if(window.speechSynthesis.paused)window.speechSynthesis.resume();}catch(e){}},120);
          // watchdog: ถ้า 650ms แล้วยังไม่เริ่ม ให้ลองใหม่หนึ่งครั้ง
          setTimeout(()=>{
            if(!settled && !this.isSpeaking && retry){
              try{window.speechSynthesis.cancel();window.speechSynthesis.resume();}catch(e){}
              this.speak(text,false,false).then(finish);
            }
          },650);
        }catch(e){finish(false);}
      };
      this.speakTimer=setTimeout(run,interrupt?90:20);
    });
  }
  numberToThai(n){
    const words={0:'ศูนย์',1:'หนึ่ง',2:'สอง',3:'สาม',4:'สี่',5:'ห้า',6:'หก',7:'เจ็ด',8:'แปด',9:'เก้า',10:'สิบ'};
    n=Number(n);if(words[n]!==undefined)return words[n];
    return String(n).split('').map(d=>words[Number(d)]??d).join(' ');
  }
  normalizeMath(t){
    return String(t||'').replace(/(\d+)/g,m=>this.numberToThai(m)).replace(/×/g,' คูณ ')
      .replace(/\+/g,' บวก ').replace(/-/g,' ลบ ').replace(/>/g,' มากกว่า ')
      .replace(/</g,' น้อยกว่า ').replace(/=/g,' เท่ากับ ').replace(/\?/g,' เท่าไหร่ ')
      .replace(/\s+/g,' ').trim();
  }
  question(q,idx,total){return q?this.speak(`${this.normalizeMath(q.text)} ... ยกนิ้วตอบได้เลย`):Promise.resolve(false);}
  result(ok,msg,answer){if(ok)return this.speak('เก่งมาก');if(/หมดเวลา/.test(String(msg||'')))return this.speak('หมดเวลา');return this.speak('ลองอีกครั้ง');}
  finger(f,force=false){
    const now=Date.now();
    if(!force&&(f===this.lastFinger||now-this.lastFingerTime<2600||this.isSpeaking))return Promise.resolve(false);
    this.lastFinger=f;this.lastFingerTime=now;return this.speak(`เห็น ${this.numberToThai(f)} นิ้ว`,false);
  }
  help(){return this.speak('ฟังโจทย์ให้จบ แล้วค่อยยกนิ้วตอบ กดสเปซเพื่อฟังซ้ำ');}
  summary(score,acc,correct,wrong){return this.speak(`จบกิจกรรม ได้ ${this.numberToThai(score)} คะแนน ถูก ${this.numberToThai(correct)} ข้อ`);}
}

// ── EMOTION ANALYZER ────────────────────────
class EmotionAnalyzer {
  constructor(){
    this.currentEmotion='neutral';
    this.scores={happy:0,anxious:0,focused:0,excited:0,neutral:100};
    this.faceDetected=false;
    this.lastMotiveTime=0;
    this.motiveTimeout=null;
    this.anxietyStreak=0;
    this.happyStreak=0;
    this.emotionHistory=[];
    this.smoothed={happy:0,anxious:0,focused:0,excited:0};
    this.lastEmoji='😐';
  }

  // MediaPipe FaceMesh landmark analysis
  analyzeFace(landmarks){
    if(!landmarks||landmarks.length===0){
      this.faceDetected=false;
      this._updateUI(null);
      return;
    }
    this.faceDetected=true;
    const lm=landmarks[0];

    // Key landmark indices for expression analysis
    // Mouth corners: 61 (left) and 291 (right)
    // Mouth top: 13, bottom: 14
    // Left eye: 159 (top), 145 (bottom)
    // Right eye: 386 (top), 374 (bottom)
    // Eyebrow inner: 70 (left), 300 (right)
    // Eyebrow outer: 105 (left), 334 (right)
    // Nose tip: 1

    const safe=(i)=>lm[i]||{x:0.5,y:0.5,z:0};

    // ── Smile detection ──
    const mouthLeft=safe(61), mouthRight=safe(291);
    const mouthTop=safe(13), mouthBottom=safe(14);
    const mouthWidth=Math.abs(mouthRight.x-mouthLeft.x);
    const mouthOpen=Math.abs(mouthBottom.y-mouthTop.y);
    // Corners lifted = smile
    const mouthCenterY=(mouthLeft.y+mouthRight.y)/2;
    const mouthMidTop=safe(12).y;
    const smileScore=Math.max(0,Math.min(1,(mouthWidth-0.12)*5));
    const cornerLift=(mouthMidTop-mouthCenterY);
    const smileLift=Math.max(0,Math.min(1,cornerLift*20+0.3));

    // ── Eyebrow raise (surprise/excited) ──
    const eyebrowLeft=safe(105), eyebrowRight=safe(334);
    const eyeLeft=safe(159), eyeRight=safe(386);
    const leftBrowDist=Math.abs(eyebrowLeft.y-eyeLeft.y);
    const rightBrowDist=Math.abs(eyebrowRight.y-eyeRight.y);
    const browRaise=(leftBrowDist+rightBrowDist)/2;
    const exciteScore=Math.max(0,Math.min(1,(browRaise-0.04)*8));

    // ── Eyebrow furrow (anxiety/concentration) ──
    const innerBrowLeft=safe(70), innerBrowRight=safe(300);
    const browFurrow=Math.abs(innerBrowLeft.x-innerBrowRight.x);
    const furrowScore=Math.max(0,Math.min(1,(0.08-browFurrow)*15+0.2));

    // ── Eye openness (focus/attention) ──
    const leftEyeOpen=Math.abs(safe(159).y-safe(145).y);
    const rightEyeOpen=Math.abs(safe(386).y-safe(374).y);
    const eyeOpen=(leftEyeOpen+rightEyeOpen)/2;
    const focusScore=Math.max(0,Math.min(1,(eyeOpen-0.015)*15));

    // ── Composite emotion scores ──
    const happy=Math.min(1,(smileScore*0.6+smileLift*0.4));
    const anxious=Math.min(1,(furrowScore*0.6+Math.max(0,1-focusScore)*0.2+Math.max(0,1-happy)*0.2));
    const focused=Math.min(1,(focusScore*0.5+(1-furrowScore)*0.3+(1-mouthOpen*8)*0.2));
    const excited=Math.min(1,(exciteScore*0.6+happy*0.3+Math.min(1,mouthOpen*12)*0.1));

    // Smooth with EMA
    const a=0.25;
    this.smoothed.happy=this.smoothed.happy*(1-a)+happy*a;
    this.smoothed.anxious=this.smoothed.anxious*(1-a)+anxious*a;
    this.smoothed.focused=this.smoothed.focused*(1-a)+focused*a;
    this.smoothed.excited=this.smoothed.excited*(1-a)+excited*a;

    this._classify();
    this._updateUI(lm);
    this.emotionHistory.push({
      t:Date.now(),
      emotion:this.currentEmotion,
      happy:Math.round(this.smoothed.happy*100),
      anxious:Math.round(this.smoothed.anxious*100),
      focused:Math.round(this.smoothed.focused*100),
      excited:Math.round(this.smoothed.excited*100),
    });
    if(this.emotionHistory.length>500)this.emotionHistory.shift();
  }

  _classify(){
    const s=this.smoothed;
    const max=Math.max(s.happy,s.anxious,s.focused,s.excited);
    if(max<0.15){this.currentEmotion='neutral';return;}
    if(s.happy>=max)this.currentEmotion='happy';
    else if(s.excited>=max&&s.excited>0.3)this.currentEmotion='excited';
    else if(s.focused>=max&&s.focused>0.25)this.currentEmotion='focused';
    else if(s.anxious>=max&&s.anxious>0.2)this.currentEmotion='anxious';
    else this.currentEmotion='neutral';
  }

  _updateUI(lm){
    if(!lm){
      DOM.faceStatusDot.style.background='#64748b';
      DOM.faceStatusTxt.innerText='ค้นหาใบหน้า...';
      return;
    }
    DOM.faceStatusDot.style.background='#10b981';
    DOM.faceStatusTxt.innerText='กำลังวิเคราะห์';

    const STATES={
      happy:{emoji:'😊',label:'มีความสุข 😊',sub:'เยี่ยมมาก! ทำต่อไปนะ',color:'#10b981',ambientColor:'rgba(16,185,129,0.15)'},
      excited:{emoji:'🤩',label:'ตื่นเต้นสนุกสนาน! 🤩',sub:'พลังงานดีมาก! ไปต่อ!',color:'#f59e0b',ambientColor:'rgba(245,158,11,0.15)'},
      focused:{emoji:'🧐',label:'มีสมาธิ กำลังคิด 🧐',sub:'โฟกัสดีมาก! เก่งมาก',color:'#00d4ff',ambientColor:'rgba(0,212,255,0.12)'},
      anxious:{emoji:'😟',label:'ละสายตาจากหน้าจอ',sub:'กลับมามองโจทย์เมื่อพร้อมนะ',color:'#ef4444',ambientColor:'rgba(239,68,68,0.12)'},
      neutral:{emoji:'😐',label:'สงบ พร้อมตอบ 😌',sub:'เตรียมพร้อมดีแล้ว!',color:'#94a3b8',ambientColor:'transparent'},
    };
    const st=STATES[this.currentEmotion]||STATES.neutral;

    if(DOM.emotionEmoji.innerText!==st.emoji){
      DOM.emotionEmoji.style.animation='none';
      void DOM.emotionEmoji.offsetWidth;
      DOM.emotionEmoji.style.animation='bounceIn 0.4s ease forwards';
      DOM.emotionEmoji.innerText=st.emoji;
    }
    DOM.emotionLabel.innerText=st.label;
    DOM.emotionLabel.style.color=st.color;
    DOM.emotionSub.innerText=st.sub;

    // Ambient glow in question card
    DOM.emotionAmbient.style.boxShadow=`inset 0 0 60px ${st.ambientColor}`;

    const fmt=v=>Math.round(v*100)+'%';
    DOM.barHappy.style.width=fmt(this.smoothed.happy);DOM.valHappy.innerText=fmt(this.smoothed.happy);
    DOM.barAnxious.style.width=fmt(this.smoothed.anxious);DOM.valAnxious.innerText=fmt(this.smoothed.anxious);
    DOM.barFocus.style.width=fmt(this.smoothed.focused);DOM.valFocus.innerText=fmt(this.smoothed.focused);
    DOM.barExcited.style.width=fmt(this.smoothed.excited);DOM.valExcited.innerText=fmt(this.smoothed.excited);

    // Motivational messages triggered by anxiety
    if(this.currentEmotion==='anxious'){
      this.anxietyStreak++;
      this.happyStreak=0;
      if(this.anxietyStreak>=15&&Date.now()-this.lastMotiveTime>6000){
        this._showMotive('anxious');
        this.lastMotiveTime=Date.now();
        this.anxietyStreak=0;
      }
    } else if(this.currentEmotion==='happy'){
      this.anxietyStreak=0;
      this.happyStreak++;
      // แสดงข้อความให้กำลังใจเมื่อมีความสุขต่อเนื่อง (เดิม onHappy() ไม่เคยถูกเรียก แก้ให้ทำงานจริงที่นี่)
      if(this.happyStreak>=25&&Date.now()-this.lastMotiveTime>8000){
        this.onHappy();
        this.happyStreak=0;
      }
    } else {
      this.anxietyStreak=0;
      this.happyStreak=0;
    }
  }

  _showMotive(trigger){
    const MSGS={
      anxious:[
        {emoji:'💪',text:'ไม่ต้องกลัว! ค่อย ๆ คิดนะ',color:'#f59e0b'},
        {emoji:'🌟',text:'เธอทำได้แน่นอน! สู้ต่อไป',color:'#10b981'},
        {emoji:'🤗',text:'ใจเย็น ๆ แล้วคำตอบจะมาเอง',color:'#00d4ff'},
        {emoji:'✨',text:'ผิดบ้างก็ไม่เป็นไร เรียนรู้ได้',color:'#a78bfa'},
        {emoji:'🎯',text:'หายใจลึก ๆ แล้วลองอีกครั้ง',color:'#ec4899'},
      ],
      correct:[
        {emoji:'🎉',text:'ยอดเยี่ยมมาก! ฉลาดมากเลย!',color:'#10b981'},
        {emoji:'⭐',text:'เก่งสุดยอด! ทำต่อไปนะ!',color:'#fcd34d'},
        {emoji:'🚀',text:'ไวปานจรวด! ทำได้ดีมากเลย',color:'#00d4ff'},
      ],
      happy:[
        {emoji:'😄',text:'เห็นรอยยิ้มแล้วใจฟู! ทำต่อ!',color:'#10b981'},
        {emoji:'🌈',text:'ความสุขของเธอคือพลังงาน!',color:'#f59e0b'},
      ],
    };
    const arr=MSGS[trigger]||MSGS.anxious;
    const m=arr[Math.floor(Math.random()*arr.length)];

    // Show in toast
    DOM.motiveToast.classList.remove('hidden','fade-out');
    DOM.motiveToast.innerHTML=`<span style="font-size:1.3rem;">${m.emoji}</span><span style="color:${m.color};">${m.text}</span>`;
    DOM.motiveToast.style.borderColor=m.color+'55';

    // Also show inline cheer
    DOM.emotionCheer.style.display='block';
    DOM.emotionCheerText.innerText=m.emoji+' '+m.text;
    DOM.emotionCheerText.style.color=m.color;

    clearTimeout(this.motiveTimeout);
    this.motiveTimeout=setTimeout(()=>{
      DOM.motiveToast.classList.add('fade-out');
      setTimeout(()=>{DOM.motiveToast.classList.add('hidden');DOM.emotionCheer.style.display='none';},500);
    },4000);
  }

  onCorrect(){this._showMotive('correct');}
  onHappy(){if(this.currentEmotion==='happy'&&Date.now()-this.lastMotiveTime>8000){this._showMotive('happy');this.lastMotiveTime=Date.now();}}

  getSummary(){
    if(!this.emotionHistory.length)return null;
    const counts={happy:0,excited:0,focused:0,anxious:0,neutral:0};
    this.emotionHistory.forEach(e=>counts[e.emotion]=(counts[e.emotion]||0)+1);
    const total=this.emotionHistory.length;
    return Object.entries(counts).map(([k,v])=>({emotion:k,pct:Math.round(v/total*100)})).filter(e=>e.pct>0).sort((a,b)=>b.pct-a.pct);
  }

  reset(){this.emotionHistory=[];this.smoothed={happy:0,anxious:0,focused:0,excited:0};this.anxietyStreak=0;this.happyStreak=0;}
}

// ── Hand + Face Tracker ──────────────────
class HandTracker{
  constructor(v,c,fc,cb,gestureCb=null){
    this.v=v;this.c=c;this.fc=fc;
    this.hCtx=c.getContext('2d');
    this.fCtx=fc.getContext('2d');
    this.cb=cb;this.gestureCb=gestureCb;this.hands=null;this.faceMesh=null;
    this.camera=null;this.isReady=false;this.lastConf=0;
    this.emotionAnalyzer=new EmotionAnalyzer();
    this.latestFaceLandmarks=null;
    this.frameCount=0;
    this.gestureSamples=[];
    this.lastGesture='none';
    // ใช้ปรับฐานรอยยิ้มอัตโนมัติ ทำให้ใช้ได้กับหลายใบหน้า/หลายกล้อง
    this.smileBaseline=null;
    this.stableNeutralSince=0;

    // โหมดท่าทางแยกกันจริง: off | head | face
    // head = พยักหน้า/ส่ายหัว, face = ยิ้ม/หน้านิ่ง
    this.gestureMode='off';
    this.activeGesture=null;
    this.gestureCooldownUntil=0;
    this.faceSmileSince=0;
    this.faceNeutralSince=0;
    this.neutralReadyAt=0;
    this.recentMotionUntil=0;
    this.lastGestureDebug='—';

    // สถานะเชื่อมต่อกล้อง/สตรีม สำหรับควบคุมการหยุด/ลองใหม่
    this.mediaStream=null;
    this.startFailed=false;
    // Stable two-hand assignment. In the mirrored learner view, physical left
    // is the left card; internally we assign by palm center in the raw frame.
    this.handAssignmentHistory=[];
    this.lastStableHands={left:null,right:null};
  }

  setGestureMode(mode='off'){
    this.gestureMode=['head','face'].includes(mode)?mode:'off';
    this.resetGestureState(true);
  }

  resetGestureState(hard=false){
    const now=performance.now();
    this.gestureSamples=[];
    this.activeGesture=null;
    this.gestureCooldownUntil=0;
    this.lastGesture='none';
    this.faceSmileSince=0;
    this.faceNeutralSince=0;
    this.recentMotionUntil=0;
    // โหมดหน้านิ่งต้องรอหลังขึ้นข้อใหม่ ไม่ให้ “ไม่ทำอะไร” ถูกนับทันที
    this.neutralReadyAt=now+1350;
    if(hard){
      this.smileBaseline=null;
      this.stableNeutralSince=0;
    }
  }

  _emptyGesture(label='รอท่าทาง'){
    return {gesture:'none',confidence:0,label};
  }

  _returnActive(now){
    if(this.activeGesture && this.activeGesture.expires>now){
      return {gesture:this.activeGesture.gesture,confidence:this.activeGesture.confidence,label:this.activeGesture.label};
    }
    return null;
  }

  _emitGesture(gesture,confidence,label,holdMs=1450){
    const now=performance.now();
    this.activeGesture={gesture,confidence,label,expires:now+holdMs};
    this.gestureCooldownUntil=now+650;
    this.lastGesture=gesture;
    return {gesture,confidence,label};
  }

  async init(){
    this.startFailed=false;
    // Init hands
    this.hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
    this.hands.setOptions({maxNumHands:2,modelComplexity:1,minDetectionConfidence:0.65,minTrackingConfidence:0.55});
    this.hands.onResults(r=>this.processHands(r));

    // Init face mesh
    this.faceMesh=new FaceMesh({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`});
    this.faceMesh.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
    this.faceMesh.onResults(r=>this.processFace(r));

    this.camera=new Camera(this.v,{
      onFrame:async()=>{
        if(!this.isReady){
          DOM.camStatus.classList.add('hidden');
          this.isReady=true;
          this.c.width=this.v.videoWidth;this.c.height=this.v.videoHeight;
          this.fc.width=this.v.videoWidth;this.fc.height=this.v.videoHeight;
          // เก็บ reference ของ media stream ไว้เพื่อให้ปิดกล้องได้จริงตอนออกจากเกม
          if(this.v.srcObject)this.mediaStream=this.v.srcObject;
        }
        this.frameCount++;
        await this.hands.send({image:this.v});
        // Process face every 2 frames to save CPU
        if(this.frameCount%2===0) await this.faceMesh.send({image:this.v});
      },width:640,height:480
    });
    try{
      await this.camera.start();
      if(this.v.srcObject)this.mediaStream=this.v.srcObject;
    }catch(err){
      this.startFailed=true;
      throw err;
    }
  }

  // หยุดกล้องจริง ๆ (ปิดไฟกล้อง) เมื่อออกจากหน้าเกม ไม่ใช่แค่ซ่อน UI
  stop(){
    try{ if(this.camera && this.camera.stop) this.camera.stop(); }catch(e){}
    try{
      const stream=this.mediaStream || this.v.srcObject;
      if(stream && stream.getTracks){
        stream.getTracks().forEach(t=>t.stop());
      }
    }catch(e){}
    try{ if(this.v) this.v.pause(); }catch(e){}
    if(this.v){
      this.v.srcObject=null;
      try{ this.v.removeAttribute('src'); this.v.load(); }catch(e){}
    }
    this.mediaStream=null;
    this.camera=null;
    this.isReady=false;
    this.startFailed=false;
    this.frameCount=0;
  }

  // ปิดโมเดล MediaPipe เดิมให้หมดก่อนสร้างชุดใหม่สำหรับผู้เล่นคนถัดไป
  async dispose(){
    this.stop();
    try{ if(this.hands && this.hands.close) await this.hands.close(); }catch(e){}
    try{ if(this.faceMesh && this.faceMesh.close) await this.faceMesh.close(); }catch(e){}
    this.hands=null;
    this.faceMesh=null;
    this.latestFaceLandmarks=null;
    try{ this.ctx.clearRect(0,0,this.c.width,this.c.height); }catch(e){}
    try{ this.fCtx.clearRect(0,0,this.fc.width,this.fc.height); }catch(e){}
  }

  processFace(r){
    this.fCtx.clearRect(0,0,this.fc.width,this.fc.height);
    if(r.multiFaceLandmarks&&r.multiFaceLandmarks.length>0){
      this.latestFaceLandmarks=r.multiFaceLandmarks;
      this.emotionAnalyzer.analyzeFace(r.multiFaceLandmarks);
      const ga=this.analyzeFaceGesture(r.multiFaceLandmarks[0]);
      if(typeof this.gestureCb==='function'){try{this.gestureCb(ga.gesture,ga.confidence,ga.label);}catch(err){console.error('[FingerMath] face callback failed',err);}}
    } else {
      this.latestFaceLandmarks=null;
      this.emotionAnalyzer.analyzeFace(null);
      if(typeof this.gestureCb==='function'){try{this.gestureCb('none',0,'ไม่พบใบหน้า');}catch(err){console.error('[FingerMath] face callback failed',err);}}
    }
  }

  analyzeFaceGesture(lm){
    if(this.gestureMode==='head')return this.analyzeHeadGesture(lm);
    if(this.gestureMode==='face')return this.analyzeFaceOnly(lm);
    return this._emptyGesture('ปิดโหมดท่าทาง');
  }

  _faceMetrics(lm){
    const safe=i=>lm[i]||{x:0.5,y:0.5,z:0};
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const nose=safe(1), leftEye=safe(33), rightEye=safe(263), chin=safe(152), top=safe(10);
    const mouthLeft=safe(61), mouthRight=safe(291), mouthTop=safe(13), mouthBottom=safe(14);
    const cheekLeft=safe(234), cheekRight=safe(454);
    const eyeCenter={x:(leftEye.x+rightEye.x)/2,y:(leftEye.y+rightEye.y)/2};
    const faceW=Math.max(0.08,dist(leftEye,rightEye),dist(cheekLeft,cheekRight)*0.55);
    const faceH=Math.max(0.12,dist(top,chin));
    const mouthW=dist(mouthLeft,mouthRight);
    const mouthOpen=dist(mouthTop,mouthBottom);
    return {
      nose,leftEye,rightEye,chin,top,mouthLeft,mouthRight,mouthTop,mouthBottom,eyeCenter,
      faceW,faceH,
      x:(nose.x-eyeCenter.x)/faceW,
      y:(nose.y-eyeCenter.y)/faceH,
      mouthRatio:mouthW/faceW,
      openRatio:mouthOpen/faceH,
      mouthCornerY:(mouthLeft.y+mouthRight.y)/2,
      mouthTopY:mouthTop.y
    };
  }

  _pushGestureSample(m,windowMs=1150){
    const now=performance.now();
    const prev=this.gestureSamples[this.gestureSamples.length-1];
    // Smooth ค่ากล้องเล็กน้อย ลดการสั่นจากแสง/กล้องมือถือ
    const x=prev?prev.x*0.58+m.x*0.42:m.x;
    const y=prev?prev.y*0.58+m.y*0.42:m.y;
    this.gestureSamples.push({x,y,t:now});
    this.gestureSamples=this.gestureSamples.filter(s=>now-s.t<windowMs);
    return this.gestureSamples;
  }

  _countTurns(arr,eps=0.0035){
    let last=0,turns=0;
    for(let i=1;i<arr.length;i++){
      const d=arr[i]-arr[i-1];
      const s=Math.abs(d)<eps?0:(d>0?1:-1);
      if(s!==0&&last!==0&&s!==last)turns++;
      if(s!==0)last=s;
    }
    return turns;
  }

  _travel(arr){
    let sum=0;
    for(let i=1;i<arr.length;i++)sum+=Math.abs(arr[i]-arr[i-1]);
    return sum;
  }

  analyzeHeadGesture(lm){
    const now=performance.now();
    const active=this._returnActive(now);
    if(active)return active;

    const m=this._faceMetrics(lm);
    const samples=this._pushGestureSample(m,1250);
    if(samples.length<7)return this._emptyGesture('รอพยักหน้า/ส่ายหัว');

    const xs=samples.map(s=>s.x), ys=samples.map(s=>s.y);
    const xRange=Math.max(...xs)-Math.min(...xs);
    const yRange=Math.max(...ys)-Math.min(...ys);
    const xTurns=this._countTurns(xs,0.0032);
    const yTurns=this._countTurns(ys,0.0032);
    const xTravel=this._travel(xs);
    const yTravel=this._travel(ys);

    if(now<this.gestureCooldownUntil)return this._emptyGesture('กำลังยืนยันท่าศีรษะ');

    // แยกโหมดศีรษะเท่านั้น: ไม่ดูรอยยิ้มเลย
    // ใช้ทั้ง range + travel + direction turn เพื่อกันกล้องสั่นนับเป็นคำตอบ
    const isNod=yRange>0.036 && yTravel>0.064 && yTurns>=1 && yRange>xRange*0.82;
    const isShake=xRange>0.040 && xTravel>0.070 && xTurns>=1 && xRange>yRange*0.82;

    if(isNod && (!isShake || yRange>=xRange)){
      const conf=Math.min(0.96,0.56+(yRange*4.6)+(yTurns*0.08)+(Math.min(yTravel,0.18)*0.9));
      return this._emitGesture('nod',conf,'พยักหน้า',1650);
    }
    if(isShake){
      const conf=Math.min(0.96,0.56+(xRange*4.4)+(xTurns*0.08)+(Math.min(xTravel,0.20)*0.9));
      return this._emitGesture('shake',conf,'ส่ายหัว',1650);
    }
    return this._emptyGesture('ขยับศีรษะให้ชัดขึ้น');
  }

  analyzeFaceOnly(lm){
    const now=performance.now();
    const active=this._returnActive(now);
    if(active)return active;

    const m=this._faceMetrics(lm);
    const samples=this._pushGestureSample(m,1000);
    const xs=samples.map(s=>s.x), ys=samples.map(s=>s.y);
    const xRange=xs.length?Math.max(...xs)-Math.min(...xs):0;
    const yRange=ys.length?Math.max(...ys)-Math.min(...ys):0;
    const moving=(xRange>0.042 || yRange>0.042);
    if(moving)this.recentMotionUntil=now+750;

    // แยกโหมดสีหน้าเท่านั้น: ไม่ให้พยักหน้า/ส่ายหัวถูกนับเป็นคำตอบ
    const mouthRatio=m.mouthRatio;
    const openRatio=m.openRatio;

    if(this.smileBaseline===null)this.smileBaseline=mouthRatio;

    const dynamicGap=Math.max(0.022,this.smileBaseline*0.105);
    const smileDelta=mouthRatio-this.smileBaseline;
    const cornerLift=Math.max(0,(m.mouthTopY-m.mouthCornerY));
    const isSmile=((smileDelta>dynamicGap) || (mouthRatio>this.smileBaseline*1.13) || (mouthRatio>0.405)) && openRatio<0.26;

    // อัปเดต baseline เฉพาะตอนหน้านิ่งและไม่ใช่รอยยิ้ม
    if(!isSmile && !moving && now>this.neutralReadyAt){
      this.smileBaseline=this.smileBaseline*0.985+mouthRatio*0.015;
    }

    if(isSmile){
      if(!this.faceSmileSince)this.faceSmileSince=now;
      this.faceNeutralSince=0;
      const ms=now-this.faceSmileSince;
      if(ms>180){
        const conf=Math.min(0.98,0.58+(smileDelta/Math.max(dynamicGap,0.001))*0.19+Math.min(cornerLift*8,0.12)+Math.min(ms/1800,0.16));
        return this._emitGesture('smile',conf,'ยิ้ม',1350);
      }
      return this._emptyGesture('กำลังยืนยันรอยยิ้ม');
    }
    this.faceSmileSince=0;

    const canNeutral=now>this.neutralReadyAt && now>this.recentMotionUntil && !moving && samples.length>=7;
    if(canNeutral){
      if(!this.faceNeutralSince)this.faceNeutralSince=now;
      const ms=now-this.faceNeutralSince;
      if(ms>650){
        const conf=Math.min(0.94,0.54+Math.min(ms/2300,0.34));
        return this._emitGesture('neutral',conf,'หน้านิ่ง',1250);
      }
      return this._emptyGesture('กำลังยืนยันหน้านิ่ง');
    }
    this.faceNeutralSince=0;
    return this._emptyGesture(now<this.neutralReadyAt?'รอเริ่มตอบด้วยสีหน้า':'ยิ้ม หรือทำหน้านิ่ง');
  }

  processHands(r){
    this.hCtx.save();
    this.hCtx.clearRect(0,0,this.c.width,this.c.height);
    // Mirror only the learner display. The model coordinates stay raw.
    this.hCtx.translate(this.c.width,0);this.hCtx.scale(-1,1);
    this.hCtx.drawImage(r.image,0,0,this.c.width,this.c.height);

    let tf=0,tc=0;
    const handDigits={left:null,right:null,raw:[],mapping:'position-stable-v2',bothVisible:false};
    const landmarks=Array.isArray(r.multiHandLandmarks)?r.multiHandLandmarks:[];
    const handedness=Array.isArray(r.multiHandedness)?r.multiHandedness:[];

    if(landmarks.length>0){
      DOM.camWrapper.classList.add('detected');
      const detected=[];
      landmarks.forEach((lm,i)=>{
        drawConnectors(this.hCtx,lm,HAND_CONNECTIONS,{color:'rgba(0,212,255,0.75)',lineWidth:2.5});
        drawLandmarks(this.hCtx,lm,{color:'#f59e0b',lineWidth:2,radius:3.5});
        const fingers=this.count(lm);
        const digit=this.fingerMathDigit(lm);
        const hd=handedness[i];
        const modelLabel=String(hd?.label||hd?.classification?.[0]?.label||'').toLowerCase();
        const conf=Number(hd?.score||hd?.classification?.[0]?.score||0.78);
        // Palm center is more stable than wrist and less affected by wrist crossing.
        const palmIds=[0,5,9,13,17];
        const centerX=palmIds.reduce((s,id)=>s+Number(lm[id]?.x||0),0)/palmIds.length;
        const centerY=palmIds.reduce((s,id)=>s+Number(lm[id]?.y||0),0)/palmIds.length;
        tf+=fingers;tc+=conf;
        detected.push({modelLabel,digit,fingers,confidence:conf,wristX:Number(lm[0]?.x||0.5),centerX,centerY});
      });

      // The mental-math game requires two hands. Assign them by horizontal
      // position in the raw camera frame, not by MediaPipe's sometimes flipped
      // handedness label. For a front-facing camera, the learner's physical
      // left hand is on the raw frame's right side (larger x).
      if(detected.length>=2){
        const pair=[...detected].sort((a,b)=>a.centerX-b.centerX).slice(0,2);
        const physicalRight=pair[0];
        const physicalLeft=pair[1];
        this.handAssignmentHistory.push({left:physicalLeft,right:physicalRight,time:performance.now()});
        if(this.handAssignmentHistory.length>5)this.handAssignmentHistory.shift();
        // Median-like vote by recent digit/position to reduce swapping on one bad frame.
        const stableSide=(side)=>{
          const recent=this.handAssignmentHistory.map(x=>x[side]).filter(Boolean);
          if(!recent.length)return null;
          const latest=recent[recent.length-1];
          const digits=recent.map(x=>x.digit);
          const digit=digits.sort((a,b)=>digits.filter(v=>v===a).length-digits.filter(v=>v===b).length).pop();
          return {...latest,digit};
        };
        handDigits.left=stableSide('left');
        handDigits.right=stableSide('right');
        handDigits.bothVisible=true;
        this.lastStableHands={left:handDigits.left,right:handDigits.right};
      }else{
        // Do not guess a side from one hand during two-hand mental math.
        // Keep it only as raw diagnostic data to avoid false left/right values.
        this.handAssignmentHistory=[];
        this.lastStableHands={left:null,right:null};
      }
      handDigits.raw=detected;
      this.lastConf=tc/Math.max(1,landmarks.length);
    }else{
      DOM.camWrapper.classList.remove('detected');
      this.lastConf=0;
      this.handAssignmentHistory=[];
      this.lastStableHands={left:null,right:null};
    }
    this.hCtx.restore();
    const cp=Math.round(this.lastConf*100);
    DOM.hudConf.innerText=cp>0?cp+'%':'—';
    DOM.confidenceFill.style.width=cp+'%';
    DOM.confidenceFill.style.background=cp>=80?'#10b981':cp>=60?'#f59e0b':'#ef4444';
    if(typeof this.cb==='function'){
      try{this.cb(tf,this.lastConf,handDigits);}catch(err){
        console.error('[FingerMath] hand callback failed',err);
      }
    }
  }

  fingerMathDigit(lm){
    const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const thumbOpen=d(lm[4],lm[17])>d(lm[3],lm[17]);
    let value=thumbOpen?5:0;
    [8,12,16,20].forEach((tip,i)=>{if(lm[tip].y<lm[[6,10,14,18][i]].y)value+=1;});
    return Math.max(0,Math.min(9,value));
  }

  count(lm){
    let c=0;
    const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    if(d(lm[4],lm[17])>d(lm[3],lm[17]))c++;
    [8,12,16,20].forEach((t,i)=>{if(lm[t].y<lm[[6,10,14,18][i]].y)c++;});
    return c;
  }
}

class QuestionManager{
  constructor(){this.q=null;}
  _fingerMax(difficulty,gradeBand){
    const map={
      primary_low:{easy:5,medium:8,hard:10},
      primary_high:{easy:7,medium:10,hard:10},
      secondary:{easy:8,medium:10,hard:10}
    };
    return (map[gradeBand]||map.primary_low)[difficulty]||8;
  }
  _largeNumberMax(difficulty,gradeBand){
    const map={
      primary_low:{easy:20,medium:30,hard:50},
      primary_high:{easy:30,medium:60,hard:99},
      secondary:{easy:60,medium:99,hard:99}
    };
    return (map[gradeBand]||map.primary_high)[difficulty]||60;
  }
  _largeOperationPool(gradeBand,difficulty){
    if(gradeBand==='primary_low')return ['add','sub'];
    if(gradeBand==='primary_high')return ['add','sub','mul'];
    return ['add','sub','mul','div'];
  }
  _makeLargeNumberQuestion(rng,difficulty,gradeBand='primary_high'){
    const max=this._largeNumberMax(difficulty,gradeBand);
    const pool=this._largeOperationPool(gradeBand,difficulty);
    const op=pool[rng.nextInt(0,pool.length-1)];
    let a,b,answer,text,modeName='เลขเกิน 10 · สองจังหวะ';
    if(op==='add'){
      a=rng.nextInt(gradeBand==='primary_low'?6:10,max-5);
      b=rng.nextInt(1,Math.min(gradeBand==='secondary'?39:29,max-a));
      answer=a+b; text=`${a} + ${b} = ?`;
    }else if(op==='sub'){
      a=rng.nextInt(gradeBand==='primary_low'?12:20,max);
      b=rng.nextInt(1,Math.min(a-1,gradeBand==='secondary'?45:35));
      answer=a-b; text=`${a} - ${b} = ?`;
    }else if(op==='mul'){
      const leftMax=gradeBand==='secondary'?12:9;
      const rightMax=gradeBand==='secondary'?9:5;
      let safe=0;
      do{
        a=rng.nextInt(2,leftMax);
        b=rng.nextInt(2,rightMax);
        answer=a*b;
        safe++;
      }while(answer>99 && safe<40);
      text=`${a} × ${b} = ?`;
      modeName=gradeBand==='secondary'?'คูณท้าทาย · สองจังหวะ':'คูณพื้นฐาน · สองจังหวะ';
    }else{
      b=rng.nextInt(2,9);
      const maxAnswer=Math.max(6,Math.min(Math.floor(99/b),12));
      answer=rng.nextInt(gradeBand==='secondary'?6:3,maxAnswer);
      a=answer*b;
      text=`${a} ÷ ${b} = ?`;
      modeName='หารลงตัว · สองจังหวะ';
    }
    const q={text,instruction:'ตอบ 2 จังหวะ: ชูหลักสิบก่อน แล้วชูหลักหน่วย',answerCheck:f=>f===Math.floor(answer/10),modeName,answerText:String(answer),topic:8,answerValue:answer,answerDigits:[Math.floor(answer/10),answer%10],answerStage:0};
    this.q=q;return q;
  }
  _makeMentalTwoHandQuestion(rng,difficulty,gradeBand='primary_high'){
    const max=gradeBand==='primary_low'?39:(gradeBand==='primary_high'?79:99);
    const ops=gradeBand==='primary_low'?['read','add']:gradeBand==='primary_high'?['read','add','sub']:['add','sub','mul'];
    const op=ops[rng.nextInt(0,ops.length-1)];
    let a,b,answer,text;
    if(op==='read'){
      answer=rng.nextInt(0,max);text=`แสดงเลข ${answer}`;
    }else if(op==='add'){
      a=rng.nextInt(1,max-5);b=rng.nextInt(1,Math.min(25,max-a));answer=a+b;text=`${a} + ${b} = ?`;
    }else if(op==='sub'){
      a=rng.nextInt(10,max);b=rng.nextInt(1,a);answer=a-b;text=`${a} - ${b} = ?`;
    }else{
      a=rng.nextInt(2,9);b=rng.nextInt(2,9);answer=a*b;if(answer>99){answer=81;a=9;b=9;}text=`${a} × ${b} = ?`;
    }
    const tens=Math.floor(answer/10),units=answer%10;
    const q={text,instruction:'มือซ้ายแสดงหลักสิบ • มือขวาแสดงหลักหน่วย พร้อมกัน',answerCheck:v=>v===answer,modeName:'จินตคณิตสองมือ',answerText:String(answer),topic:10,answerValue:answer,answerDigits:[tens,units],twoHand:true};
    this.q=q;return q;
  }
  generate(level,mode,topic,rng,difficulty,gradeBand='primary_low'){
    if(mode==='mental_two_hand')return this._makeMentalTwoHandQuestion(rng,difficulty,gradeBand);
    if(mode==='large_number')return this._makeLargeNumberQuestion(rng,difficulty,gradeBand);
    if(String(mode||'').startsWith('physical_'))return this.generatePhysical(mode,rng,difficulty,gradeBand);
    let t=topic?parseInt(topic):this._pick(level,mode,gradeBand);
    if(t===8)return this._makeLargeNumberQuestion(rng,difficulty,gradeBand);
    const mx=this._fingerMax(difficulty,gradeBand);
    let q={text:'',instruction:'',answerCheck:null,modeName:'',answerText:'',topic:t};
    switch(t){
      case 1:{
        const maxN=gradeBand==='primary_low'?mx:Math.min(10,mx);
        const n=rng.nextInt(0,maxN);q.modeName='แสดงตัวเลข';q.text=`ชู ${n} นิ้ว`;q.instruction='ชูนิ้วให้ครบตามตัวเลข';q.answerCheck=f=>f===n;q.answerText=String(n);break;}
      case 2:{
        let a,b;
        if(gradeBand==='primary_low'){a=rng.nextInt(0,Math.floor(mx/2));b=rng.nextInt(0,Math.min(10-a,mx));}
        else if(gradeBand==='primary_high'){a=rng.nextInt(2,10);b=rng.nextInt(1,10);}
        else{a=rng.nextInt(4,10);b=rng.nextInt(2,10);}
        q.modeName='การบวก';q.text=`${a} + ${b} = ?`;q.instruction='คิดในใจแล้วชูนิ้วตอบ';q.answerCheck=f=>f===a+b;q.answerText=String(a+b);break;}
      case 3:{
        let a,b;
        if(gradeBand==='primary_low'){a=rng.nextInt(1,mx);b=rng.nextInt(0,a);}
        else if(gradeBand==='primary_high'){a=rng.nextInt(4,10);b=rng.nextInt(1,a);}
        else{a=rng.nextInt(6,10);b=rng.nextInt(1,a-1);}
        q.modeName='การลบ';q.text=`${a} - ${b} = ?`;q.instruction='คิดในใจแล้วชูนิ้วตอบ';q.answerCheck=f=>f===a-b;q.answerText=String(a-b);break;}
      case 4:{
        let pairs=[[0,1],[1,1],[1,2],[1,3],[1,4],[1,5],[2,1],[2,2],[2,3],[2,4],[2,5],[3,1],[3,2],[3,3],[4,1],[4,2],[5,1],[5,2]];
        if(gradeBand==='primary_high')pairs=[[2,2],[2,3],[2,4],[2,5],[3,3],[3,4],[3,5],[4,4],[4,5],[5,5],[6,2],[6,3],[7,2],[8,2],[9,1]];
        if(gradeBand==='secondary')pairs=[[3,4],[3,5],[4,4],[4,5],[5,5],[6,4],[6,5],[7,4],[7,5],[8,4],[8,5],[9,4],[9,5],[10,3],[10,4]];
        const p=pairs[rng.nextInt(0,pairs.length-1)];q.modeName='การคูณ';q.text=`${p[0]} × ${p[1]} = ?`;q.instruction='คิดในใจแล้วชูนิ้วตอบ';q.answerCheck=f=>f===p[0]*p[1];q.answerText=String(p[0]*p[1]);break;}
      case 5:{const tv=rng.nextInt(gradeBand==='secondary'?2:1,gradeBand==='primary_low'?9:8),more=rng.next()>0.5;q.modeName='เปรียบเทียบ';q.text=more?`> ${tv}`:`< ${tv}`;q.instruction=more?`ชูนิ้วให้มากกว่า ${tv}`:`ชูนิ้วให้น้อยกว่า ${tv}`;q.answerCheck=f=>more?(f>tv&&f<=10):(f<tv);q.answerText=more?`จำนวนที่มากกว่า ${tv}`:`จำนวนที่น้อยกว่า ${tv}`;break;}
      case 6:{const ev=rng.next()>0.5;q.modeName='คู่ หรือ คี่';q.text=ev?'เลขคู่':'เลขคี่';q.instruction=ev?'ชูนิ้วจำนวนคู่ (2, 4, 6…)':'ชูนิ้วจำนวนคี่ (1, 3, 5…)';q.answerCheck=f=>ev?(f%2===0&&f>0):(f%2!==0);q.answerText=ev?'2, 4, 6, 8 หรือ 10':'1, 3, 5, 7 หรือ 9';break;}
      case 9:{let divisor=rng.nextInt(2,gradeBand==='secondary'?5:4);let answer=rng.nextInt(1,Math.min(10,gradeBand==='primary_high'?10:6));let dividend=divisor*answer;q.modeName='การหาร';q.text=`${dividend} ÷ ${divisor} = ?`;q.instruction='คิดในใจแล้วชูนิ้วตอบ';q.answerCheck=f=>f===answer;q.answerText=String(answer);break;}
      default:{const n=rng.nextInt(0,10);q.modeName='แสดงตัวเลข';q.text=`ชู ${n} นิ้ว`;q.instruction='ชูนิ้วให้ครบ';q.answerCheck=f=>f===n;q.answerText=String(n);}
    }
    this.q=q;return q;
  }
  generatePhysical(mode,rng,difficulty,gradeBand='primary_low'){
    const mx=this._fingerMax(difficulty,gradeBand);
    const trueCase=rng.next()>0.5;
    const kind=rng.nextInt(1,4);
    let text='',answer=true,answerText='';
    if(kind===1){
      const a=rng.nextInt(0,Math.floor(mx/2)),b=rng.nextInt(0,Math.min(10,mx-a));
      const correct=a+b;
      const shown=trueCase?correct:Math.max(0,Math.min(10,correct+(rng.next()>0.5?1:-1)));
      text=`${a} + ${b} = ${shown}`;
      answer=shown===correct;
      answerText=`${a} + ${b} = ${correct}`;
    }else if(kind===2){
      const a=rng.nextInt(1,Math.min(10,mx)),b=rng.nextInt(0,a);
      const correct=a-b;
      const shown=trueCase?correct:Math.max(0,Math.min(10,correct+(rng.next()>0.5?1:-1)));
      text=`${a} - ${b} = ${shown}`;
      answer=shown===correct;
      answerText=`${a} - ${b} = ${correct}`;
    }else if(kind===3){
      const a=rng.nextInt(0,Math.min(10,mx)),b=rng.nextInt(0,Math.min(10,mx));
      text=trueCase?`${a} มากกว่า ${b}`:`${a} น้อยกว่า ${b}`;
      const real=a>b?'มากกว่า':'ไม่มากกว่า';
      answerText=`${a} ${real} ${b}`;
      answer=(trueCase?(a>b):(a<b));
    }else{
      const n=rng.nextInt(1,10);
      const shouldEven=rng.next()>0.5;
      text=`${n} เป็นเลข${shouldEven?'คู่':'คี่'}`;
      answer=shouldEven?(n%2===0):(n%2!==0);
      answerText=`${n} เป็นเลข${n%2===0?'คู่':'คี่'}`;
    }
    const face=mode==='physical_face';
    const trueGesture=face?'smile':'nod';
    const falseGesture=face?'neutral':'shake';
    return{
      text,
      instruction:face?'ยิ้มถ้าข้อความถูก / ทำหน้านิ่งถ้าข้อความผิด':'พยักหน้าถ้าข้อความถูก / ส่ายหัวถ้าข้อความผิด',
      answerCheck:g=>g===(answer?trueGesture:falseGesture),
      modeName:face?'ตอบด้วยสีหน้า':'ตอบด้วยศีรษะ',
      answerText:answer?`ถูก — ใช้ ${face?'ยิ้ม':'พยักหน้า'}`:`ผิด — ใช้ ${face?'หน้านิ่ง':'ส่ายหัว'}`,
      topic:7
    };
  }
  _pick(l,mode,gradeBand='primary_low'){
    if(gradeBand==='primary_low'){
      if(l<=2)return 1; if(l===3)return 2; if(l===4)return 3; if(l===5)return 5;
      const pool=[1,2,3,5,6]; return pool[Math.floor(Math.random()*pool.length)];
    }
    if(gradeBand==='primary_high'){
      if(l<=2)return 2; if(l===3)return 3; if(l===4)return 5; if(l===5)return 4;
      const pool=[2,3,4,5,6,8,9]; return pool[Math.floor(Math.random()*pool.length)];
    }
    if(l<=2)return 2; if(l===3)return 3; if(l===4)return 4; if(l===5)return 8;
    const pool=[2,3,4,5,6,8,9]; return pool[Math.floor(Math.random()*pool.length)];
  }
}

class ScoreManager{
  constructor(){this.reset();}
  reset(){
    this.score=0;this.level=1;this.correct=0;this.wrong=0;this.combo=0;this.perfect=true;
    DOM.hudScore.innerText='0';
    Object.values(DOM.achv).forEach(b=>b.classList.remove('unlocked'));
  }
  add(t){
    this.correct++;this.combo++;
    let pts=CONFIG.pointsBase,bonus='';
    if(t<3){pts+=CONFIG.pointsFast;bonus='⚡ เร็วมาก! +5';}
    if(this.combo>=3){pts+=this.combo===3?20:(this.combo===5?50:10);
      const cd=DOM.comboDisplay,cd2=DOM.comboDisplay2;
      cd.innerText=cd2.innerText=`🔥 Combo x${this.combo}!`;
      cd.style.display='flex';cd2.style.display='block';
    }else{DOM.comboDisplay.style.display='none';DOM.comboDisplay2.style.display='none';}
    this.score+=pts;
    const lv=Math.floor(this.score/CONFIG.levelUpScore)+1>this.level;
    if(lv)this.level++;
    if(this.correct>=10)DOM.achv.beginner.classList.add('unlocked');
    if(this.correct>=50)DOM.achv.star.classList.add('unlocked');
    if(this.correct>=100)DOM.achv.master.classList.add('unlocked');
    if(this.level>=5&&this.perfect&&this.correct>=20)DOM.achv.champion.classList.add('unlocked');
    DOM.hudScore.innerText=this.score;
    return{points:pts,leveledUp:lv,bonus};
  }
  bad(){this.wrong++;this.combo=0;this.perfect=false;DOM.comboDisplay.style.display='none';DOM.comboDisplay2.style.display='none';DOM.hudScore.innerText=this.score;}
  get acc(){const t=this.correct+this.wrong;return t===0?0:Math.round((this.correct/t)*100);}
}


function getSkillDimension(topic){
  const map={
    1:'Number Representation',
    2:'Addition within 10',
    3:'Subtraction within 10',
    4:'Basic Multiplication',
    5:'Number Comparison',
    6:'Odd/Even Classification',
    7:'Accessible True/False Gesture Response',
    8:'Place Value and Two-stage Finger Encoding' 
  };
  return map[topic]||'Mixed Skills';
}

function getAssessmentPass(accuracy,avgRT){
  return (accuracy>=80 && avgRT<=5)?'PASS':'NEEDS_SUPPORT';
}

// ── ACCOUNT MANAGER (แยกบัญชีผู้ปกครอง / ครู, เก็บในเบราว์เซอร์นี้เท่านั้น) ──
class AccountManager{
  static signup(){return{ok:false,error:'ระบบบัญชีเดิมถูกปิดแล้ว กรุณาใช้ Supabase'};}
  static login(){return{ok:false,error:'ระบบบัญชีเดิมถูกปิดแล้ว กรุณาใช้ Supabase'};}
  static logout(){
    try{
      localStorage.removeItem('fingerMath_accounts_v1');
      localStorage.removeItem('fingerMath_session_v1');
    }catch(e){}
  }
  static current(){return null;}
  static load(){return[];}
}

// ── STUDENT SESSION (นักเรียนไม่ต้องสมัครบัญชี) ──
class StudentSession{
  static KEY='fingerMath_student_session_v1';
  static set(ownerId,learnerId){try{localStorage.setItem(this.KEY,JSON.stringify({ownerId,learnerId,startedAt:new Date().toISOString()}));}catch(e){}}
  static current(){try{return JSON.parse(localStorage.getItem(this.KEY))||null;}catch(e){return null;}}
  static clear(){try{localStorage.removeItem(this.KEY);}catch(e){}}
}

// ── LEARNER STORE (รายชื่อนักเรียน/โปรไฟล์ลูก แยกตามบัญชีเจ้าของ) ──
class LearnerStore{
  static KEY='fingerMath_learners_v1';
  static load(){try{return JSON.parse(localStorage.getItem(this.KEY))||{};}catch(e){return{};}}
  static save(d){try{localStorage.setItem(this.KEY,JSON.stringify(d));}catch(e){}}
  static listFor(ownerId){const d=this.load();return d[ownerId]||[];}
  static allProfiles(){
    const d=this.load(),accounts=AccountManager.load();
    const out=[];
    Object.keys(d).forEach(ownerId=>{
      const owner=accounts.find(a=>a.id===ownerId);
      (d[ownerId]||[]).forEach(learner=>out.push({...learner,ownerId,ownerName:owner?owner.name:'ผู้ดูแล',ownerRole:owner?owner.role:'parent'}));
    });
    return out;
  }
  static add(ownerId,name,classroom){
    const d=this.load();if(!d[ownerId])d[ownerId]=[];
    const learner={id:'STU-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase(),
      name:(name||'').trim(),classroom:(classroom||'').trim()||'—',createdAt:new Date().toISOString()};
    d[ownerId].push(learner);this.save(d);return learner;
  }
  static remove(ownerId,learnerId){
    const d=this.load();if(!d[ownerId])return;
    d[ownerId]=d[ownerId].filter(s=>s.id!==learnerId);this.save(d);
  }
  static find(ownerId,learnerId){return this.listFor(ownerId).find(s=>s.id===learnerId)||null;}
}

// ── RESEARCH STORE ──────────────────────────────────────
// เก็บข้อมูลแยกเป็นก้อนต่อบัญชี (ownerId) แทนอาร์เรย์รวมก้อนเดียว
// ทำให้แต่ละครู/ผู้ปกครองอ่าน-เขียนเฉพาะข้อมูลของตัวเอง ไม่ต้องสแกนข้อมูลทั้งระบบ
// และแดชบอร์ดของครูจะเห็นเฉพาะเซสชันของนักเรียนที่อยู่ใต้บัญชีตนเองเท่านั้น
class ResearchStore{
  static INDEX_KEY='fingerMath_owners_index_v2';
  static HEADERS=['session_id','user_role','player_name','classroom','test_type','assessment_result','difficulty','topic_filter','date_time','total_questions','correct','wrong','accuracy_pct','total_score','total_time_sec','avg_response_time_sec','emotion_happy_pct','emotion_anxious_pct','emotion_focused_pct','emotion_excited_pct','learner_level','q_number','q_topic','q_skill_dimension','q_mode','q_text','q_answer_text','student_fingers','q_correct','q_response_time_sec','q_time_remaining'];
  static keyFor(ownerId){return 'fingerMath_sessions_v2_'+ownerId;}
  static _loadIndex(){try{return JSON.parse(localStorage.getItem(this.INDEX_KEY))||[];}catch(e){return[];}}
  static _saveIndex(idx){try{localStorage.setItem(this.INDEX_KEY,JSON.stringify(idx));}catch(e){}}
  static load(ownerId){try{return JSON.parse(localStorage.getItem(this.keyFor(ownerId)))||[];}catch(e){return[];}}
  static save(ownerId,d){try{localStorage.setItem(this.keyFor(ownerId),JSON.stringify(d));}catch(e){}}
  static add(ownerId,s){
    const d=this.load(ownerId);d.push(s);this.save(ownerId,d);
    const idx=this._loadIndex();
    if(!idx.includes(ownerId)){idx.push(ownerId);this._saveIndex(idx);}
  }
  static clear(ownerId){localStorage.removeItem(this.keyFor(ownerId));}
  static stats(ownerId){
    const ss=this.load(ownerId);if(!ss.length)return null;
    const players=[...new Set(ss.map(s=>s.playerName))];
    const all=ss.flatMap(s=>s.responses||[]);
    const avgTime=all.length?(all.reduce((a,b)=>a+(b.responseTime||0),0)/all.length).toFixed(2):0;
    const avgAcc=ss.length?Math.round(ss.reduce((a,b)=>a+(b.accuracy||0),0)/ss.length):0;
    const tn={1:'แสดงตัวเลข',2:'การบวก',3:'การลบ',4:'การคูณ',5:'เปรียบเทียบ',6:'คู่/คี่',7:'ท่าทางถูก/ผิด'};
    const ts={};all.forEach(r=>{const t=r.topic||0;if(!ts[t])ts[t]={correct:0,total:0,name:tn[t]||`หัวข้อ ${t}`};ts[t].total++;if(r.correct)ts[t].correct++;});
    const pre=ss.filter(s=>s.testType==='pretest'),post=ss.filter(s=>s.testType==='posttest');
    const preAvg=pre.length?Math.round(pre.reduce((a,b)=>a+(b.accuracy||0),0)/pre.length):null;
    const postAvg=post.length?Math.round(post.reduce((a,b)=>a+(b.accuracy||0),0)/post.length):null;
    return{players,sessions:ss,avgTime,avgAcc,topicStats:ts,preAvg,postAvg};
  }
  // แถวข้อมูลดิบ (ไม่ครอบ quote) ใช้ร่วมกันทั้ง CSV และการส่งไป Google Sheet
  static rawRowsFor(s){
    const lvl=classifyLearnerLevel(s.avgResponseTime||0,s.accuracy||0);
    const es=s.emotionSummary||{};
    const assess=getAssessmentPass(s.accuracy||0,s.avgResponseTime||0);
    const base=[s.sessionId,s.userRole||'parent',s.playerName,s.classroom||'',s.testType,assess,s.difficulty,s.topicFilter||'',s.dateTime,s.totalQuestions,s.correctCount,s.wrongCount,s.accuracy,s.score,s.totalTimeSec,s.avgResponseTime,
      es.happy||0,es.anxious||0,es.focused||0,es.excited||0,lvl.label];
    const rows=[];
    (s.responses||[]).forEach(r=>{rows.push([...base,r.qNumber,r.topic,r.skillDimension||getSkillDimension(r.topic),r.modeName,r.questionText,r.answerText,r.fingersShown,r.correct?1:0,r.responseTime,r.timeRemaining]);});
    if(!s.responses||!s.responses.length)rows.push([...base,'','','','','','','','','','']);
    return rows;
  }
  static csv(ownerId){
    const ss=this.load(ownerId);if(!ss.length){alert('ยังไม่มีข้อมูล');return;}
    const q=v=>{v=v===undefined||v===null?'':v;return typeof v==='string'?`"${v.replace(/"/g,'""')}"`:v;};
    const rows=[this.HEADERS.join(',')];
    ss.forEach(s=>{this.rawRowsFor(s).forEach(r=>rows.push(r.map(q).join(',')));});
    const b=new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv;charset=utf-8;'});
    const u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=`FingerMath_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(u);
  }
}

// ── SHEET SYNC (ส่งข้อมูลไปยัง Google Sheet ผ่าน Apps Script Web App) ──
class SheetSync{
  static KEY='fingerMath_sheetSync_v1';
  static DEFAULT_URL='https://script.google.com/macros/s/AKfycby3YlU7LFsAHpi3GmdAN0gaCssvoVGyfONAEtAY8r0evm0OtPaactsh3GqPuZMXocVY/exec';
  static SPREADSHEET_ID='1XU_LRBLYwST83NJSEJKWYLeRxzz35N404V21QUxeiWc';
  static SHEET_NAME='FingerMathData';
  static _all(){try{return JSON.parse(localStorage.getItem(this.KEY))||{};}catch(e){return{};}}
  static _saveAll(d){try{localStorage.setItem(this.KEY,JSON.stringify(d));}catch(e){}}
  static getConfig(ownerId){
    const d=this._all(), saved=d[ownerId]||{};
    return {url:this.DEFAULT_URL,autoSync:true,lastSyncAt:null,lastStatus:'',...saved,url:saved.url||this.DEFAULT_URL};
  }
  static saveConfig(ownerId,cfg){const d=this._all();d[ownerId]={...this.getConfig(ownerId),...cfg};this._saveAll(d);return d[ownerId];}
  static async push(ownerId,sessions){
    const cfg=this.getConfig(ownerId);
    if(!cfg.url)return{ok:false,error:'ยังไม่ได้ตั้งค่าลิงก์ Google Sheet'};
    const rows=[];
    sessions.forEach(s=>ResearchStore.rawRowsFor(s).forEach(r=>rows.push(r)));
    if(!rows.length)return{ok:false,error:'ไม่มีข้อมูลให้ส่ง'};
    try{
      // ใช้ text/plain เพื่อเลี่ยง CORS preflight กับ Apps Script Web App
      const res=await fetch(cfg.url,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          action:'appendFingerMathData',
          spreadsheetId:this.SPREADSHEET_ID,
          sheetName:this.SHEET_NAME,
          ownerId,
          headers:ResearchStore.HEADERS,
          rows
        })
      });
      const responseText=await res.text();
      let responseData=null;
      try{responseData=responseText?JSON.parse(responseText):null;}catch(e){}
      const okFlag=res.ok && (!responseData || responseData.ok!==false);
      this.saveConfig(ownerId,{lastSyncAt:new Date().toISOString(),lastStatus:okFlag?'ok':'error'});
      if(okFlag)return{ok:true,count:rows.length,message:responseData?.message||''};
      return{ok:false,error:responseData?.error||responseData?.message||('เซิร์ฟเวอร์ตอบกลับผิดพลาด (HTTP '+res.status+')')};
    }catch(err){
      this.saveConfig(ownerId,{lastSyncAt:new Date().toISOString(),lastStatus:'error'});
      return{ok:false,error:'เชื่อมต่อไม่สำเร็จ ตรวจสอบลิงก์และการเผยแพร่ Web App (ต้องตั้งเป็น "ทุกคนเข้าถึงได้")'};
    }
  }
}
// ── Game Manager ─────────────────────────
class GameManager{
  constructor(){
    this.sound=new SoundManager();
    this.speech=new SpeechManager();
    this.accessibilityMode=false;
    this.physicalMode=false;this.currentGesture='none';this.physicalControl='head';this.pendingPhysicalGesture='none';this.pendingPhysicalOk=true;this.gestureReadyAt=0;
    this.qMgr=new QuestionManager();
    this.score=new ScoreManager();
    // Create stable callbacks once. This prevents callback `this` loss after camera reset.
    this._boundOnHand=(f,c,h)=>GameManager.prototype.onHand.call(this,f,c,h);
    this._boundOnFaceGesture=(g,c,l)=>GameManager.prototype.onFaceGesture.call(this,g,c,l);
    this.tracker=null;
    this.state='menu';this.gameMode='practice';this.testType='practice';
    this.classTopic=null;this.playerName='';this.classroom='';
    this.gradeBand=localStorage.getItem('fingerMath_gradeBand')||'primary_low';
    this.selectedMissionTier=localStorage.getItem('fingerMath_v8_tier')||'starter';
    this.currentMissionMeta=null;
    this.mentalSwapHands=localStorage.getItem('fingerMath_mentalSwapHands')==='1';
    this.difficulty=localStorage.getItem('fingerMath_difficulty')||'medium';this.totalQ=10;this.qIdx=0;
    this.holdTime=1.2;this.seed=0;this.rng=null;
    this.timeLeft=CONFIG.timePerQuestion;this.lastFrame=performance.now();
    this.sessStart=0;this.isHolding=false;this.holdElapsed=0;
    this.sessionId='';this.responses=[];this.loopId=null;
    this.cameraTimeoutId=null;
    this.theme=localStorage.getItem('fingerMath_theme')||'space';
    this.authRole='parent';this.authMode='login';
    this.selectedLearnerId=null;
    this._setup();
    this.applyTheme(this.theme,true);
  }
  get emoAnalyzer(){return this.tracker?.emotionAnalyzer||{reset(){},getSummary(){return[];}};}
  _setup(){
    DOM.btnPause.addEventListener('click',()=>this.togglePause());
    DOM.btnRestart.addEventListener('click',()=>this.startSession());
    DOM.btnMenu.addEventListener('click',()=>this.returnToMenu());
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&(this.state==='playing'||this.state==='paused'))this.endGame('ยุติภารกิจ');
      if(this.accessibilityMode&&(this.state==='playing'||this.state==='speaking')&&e.code==='Space'){e.preventDefault();this.repeatCurrentQuestion();}
      if(this.accessibilityMode&&this.state==='playing'&&e.key==='Enter'){e.preventDefault();this.speech.finger(parseInt(DOM.hudFingers.innerText)||0,true);}
      if(this.accessibilityMode&&e.key.toLowerCase()==='h'){e.preventDefault();this.speech.help();}
    });
    this.updateVoiceModeUI();
    this.initEntrySelectorUI();
  }
  // ── Theme toggle (Space / Kids) ──
  applyTheme(theme,silent=false){
    this.theme=theme==='kids'?'kids':'space';
    document.body.classList.toggle('theme-kids',this.theme==='kids');
    localStorage.setItem('fingerMath_theme',this.theme);
    if(DOM.themeToggleLabel)DOM.themeToggleLabel.innerText='โหมด: '+(this.theme==='kids'?'เด็ก (ป.1-3)':'อวกาศ');
    this.updateMenuSubtitle();
  }
  toggleTheme(){this.applyTheme(this.theme==='kids'?'space':'kids');}
  initEntrySelectorUI(){
    const savedBand=localStorage.getItem('fingerMath_gradeBand')||this.gradeBand||'primary_low';
    const savedDiff=localStorage.getItem('fingerMath_difficulty')||this.difficulty||DOM.startDifficulty?.value||'medium';
    this.setGradeBand(savedBand,{silent:true,preserveDifficulty:true});
    this.setDifficultyLevel(savedDiff,{silent:true});
    this.setMissionTier(this.selectedMissionTier,{silent:true});
  }
  getStructuredBands(){
    return {
      primary_low:{
        label:'ประถมต้น',placeholder:'เช่น ป.2/1',recommended:'easy',
        hint:'เหมาะกับเด็ก ป.1–3 ที่กำลังเริ่มต้นนับนิ้ว เรียนรู้จำนวน 0–10 และค่อย ๆ ฝึกบวก–ลบอย่างมั่นใจ',
        plan:'เริ่มจากฝึกนับนิ้ว 0–10 ก่อน แล้วค่อยไปโหมดบวก–ลบ',
        quick:[
          {label:'นับนิ้ว 0–10',sub:'ฝึกชูนิ้วตามจำนวนแบบพื้นฐาน',mode:'home_practice',topic:1,difficulty:'easy'},
          {label:'บวกเลขง่าย',sub:'บวกคำตอบไม่เกิน 10 เหมาะเริ่มต้น',mode:'home_practice',topic:2,difficulty:'easy'},
          {label:'ฝึกสุ่มพื้นฐาน',sub:'สุ่มโจทย์ง่ายสำหรับประถมต้น',mode:'home_practice',topic:null,difficulty:'easy'}
        ],
        tiers:{
          starter:{label:'Level 1 เริ่มต้น',desc:'สร้างความคุ้นเคยกับนิ้วและจำนวน',missions:[
            {key:'pl_count',title:'รู้จักจำนวนนิ้ว',desc:'ฝึกชูนิ้วให้ตรงกับตัวเลข 0–10',mode:'home_practice',topic:1,difficulty:'easy',questionCount:5,tag1:'ตัวเลข',tag2:'เริ่มต้น'},
            {key:'pl_add',title:'บวกไม่เกิน 10',desc:'บวกจำนวนง่าย ๆ เพื่อให้คิดเร็วขึ้น',mode:'home_practice',topic:2,difficulty:'easy',questionCount:5,tag1:'บวก',tag2:'พื้นฐาน'},
            {key:'pl_even',title:'คู่หรือคี่',desc:'สังเกตจำนวนคู่และคี่จากนิ้วมือ',mode:'home_practice',topic:6,difficulty:'easy',questionCount:5,tag1:'ตรรกะ',tag2:'สังเกต'}]},
          builder:{label:'Level 2 คล่องขึ้น',desc:'ต่อยอดการคิดและการสังเกต',missions:[
            {key:'pl_sub',title:'ลบอย่างมั่นใจ',desc:'ฝึกลบจำนวนที่ไม่เกิน 10 ให้คล่อง',mode:'home_practice',topic:3,difficulty:'medium',questionCount:10,tag1:'ลบ',tag2:'แม่นยำ'},
            {key:'pl_compare',title:'มากกว่า น้อยกว่า',desc:'แยกแยะค่าของจำนวนจากโจทย์เปรียบเทียบ',mode:'home_practice',topic:5,difficulty:'medium',questionCount:10,tag1:'เปรียบเทียบ',tag2:'คิดไว'},
            {key:'pl_mix',title:'คละพื้นฐาน',desc:'สุ่มโจทย์พื้นฐานหลากหลายรูปแบบ',mode:'home_practice',topic:null,difficulty:'medium',questionCount:10,tag1:'คละโจทย์',tag2:'ทบทวน'}]},
          master:{label:'Level 3 พร้อมขยับ',desc:'เตรียมตัวขึ้นประถมปลาย',missions:[
            {key:'pl_combo',title:'คอมโบคณิต',desc:'คละบวก ลบ คู่คี่ และเปรียบเทียบในชุดเดียว',mode:'home_practice',topic:null,difficulty:'hard',questionCount:10,tag1:'คละโจทย์',tag2:'ท้าทาย'},
            {key:'pl_mul_intro',title:'คูณเบื้องต้น',desc:'เริ่มรู้จักการคูณแบบคำตอบไม่เกิน 10',mode:'home_practice',topic:4,difficulty:'easy',questionCount:5,tag1:'คูณ',tag2:'ต่อยอด'},
            {key:'pl_review',title:'บทสรุปประถมต้น',desc:'เก็บคะแนนและทบทวนก่อนขึ้นด่านถัดไป',mode:'home_practice',topic:null,difficulty:'medium',questionCount:10,tag1:'สรุป',tag2:'ประเมิน'}]}
        }
      },
      primary_high:{
        label:'ประถมปลาย',placeholder:'เช่น ป.5/2',recommended:'medium',
        hint:'เหมาะกับเด็ก ป.4–6 ที่พร้อมเพิ่มความเร็ว ฝึกเลขเกิน 10 และต่อยอดเข้าสู่จินตคณิต',
        plan:'แนะนำเริ่มจากบวก–ลบ แล้วต่อด้วยเลขเกิน 10 และห้องเรียนจินตคณิต',
        quick:[
          {label:'บวก–ลบคล่อง',sub:'โจทย์สุ่มระดับประถมปลาย',mode:'home_practice',topic:null,difficulty:'medium'},
          {label:'เลขเกิน 10',sub:'ตอบสองจังหวะ ฝึกหลักสิบและหลักหน่วย',mode:'large_number',topic:null,difficulty:'medium'},
          {label:'คูณและเปรียบเทียบ',sub:'ฝึกคูณพื้นฐานและคิดไว',mode:'home_practice',topic:4,difficulty:'medium'}
        ],
        tiers:{
          starter:{label:'Level 1 ปรับพื้น',desc:'ปูพื้นฐานก่อนโจทย์ยาก',missions:[
            {key:'ph_addsub',title:'บวก–ลบประถมปลาย',desc:'ทบทวนบวก–ลบให้ไวขึ้นและแม่นขึ้น',mode:'home_practice',topic:null,difficulty:'medium',questionCount:10,tag1:'บวกลบ',tag2:'คล่อง'},
            {key:'ph_mul',title:'คูณพื้นฐาน',desc:'ตารางคูณและคูณคำตอบไม่เกิน 10',mode:'home_practice',topic:4,difficulty:'medium',questionCount:10,tag1:'คูณ',tag2:'พื้นฐาน'},
            {key:'ph_compare',title:'เปรียบเทียบและคู่คี่',desc:'ฝึกตรรกะและความเร็วในการตัดสินใจ',mode:'home_practice',topic:5,difficulty:'medium',questionCount:10,tag1:'ตรรกะ',tag2:'วิเคราะห์'}]},
          builder:{label:'Level 2 เลขเกิน 10',desc:'เน้นหลักสิบ หลักหน่วย และจินตภาพ',missions:[
            {key:'ph_large_addsub',title:'เลขเกิน 10',desc:'ตอบสองจังหวะ ฝึกค่าประจำหลัก',mode:'large_number',topic:null,difficulty:'medium',questionCount:10,tag1:'สองจังหวะ',tag2:'หลักสิบ'},
            {key:'ph_mix_hard',title:'คละโจทย์ยากขึ้น',desc:'สุ่มโจทย์คณิตหลายแบบในระดับสูงขึ้น',mode:'home_practice',topic:null,difficulty:'hard',questionCount:10,tag1:'คละโจทย์',tag2:'ฝึกสปีด'},
            {key:'ph_mulfast',title:'คูณคิดไว',desc:'เพิ่มความคล่องในการคูณพื้นฐาน',mode:'home_practice',topic:4,difficulty:'hard',questionCount:10,tag1:'คูณ',tag2:'คิดเร็ว'}]},
          master:{label:'Level 3 ก่อนขึ้นมัธยม',desc:'ความยากสูงและเน้นจับเวลา',missions:[
            {key:'ph_large_master',title:'โจทย์สองหลักคละแบบ',desc:'สุ่มบวก ลบ คูณ ในคำตอบสองหลัก',mode:'large_number',topic:null,difficulty:'hard',questionCount:10,tag1:'สองหลัก',tag2:'ท้าทาย'},
            {key:'ph_div_intro',title:'หารลงตัวเบื้องต้น',desc:'เตรียมพื้นฐานการหารก่อนเข้า ม.1',mode:'home_practice',topic:9,difficulty:'medium',questionCount:10,tag1:'หาร',tag2:'ต่อยอด'},
            {key:'ph_final',title:'สรุปประถมปลาย',desc:'ทดสอบความพร้อมก่อนขยับไปมัธยม',mode:'home_practice',topic:null,difficulty:'hard',questionCount:10,tag1:'สรุป',tag2:'พร้อมต่อยอด'}]}
        }
      },
      secondary:{
        label:'มัธยม',placeholder:'เช่น ม.1/1',recommended:'hard',
        hint:'เหมาะกับ ม.1–3 ที่ต้องการโจทย์ท้าทายกว่าเดิม เน้นความเร็ว ความแม่น และการคิดในใจ',
        plan:'แนะนำเริ่มด้วยจินตคณิตหรือคิดเร็ว แล้วใช้โหมดท้าทายเพื่อจับเวลา',
        quick:[
          {label:'คิดเร็ว 2 หลัก',sub:'บวก ลบ คูณ หาร แบบสองจังหวะ',mode:'large_number',topic:null,difficulty:'hard'},
          {label:'สุ่มโจทย์มัธยม',sub:'โจทย์คละยากขึ้นสำหรับมัธยม',mode:'home_practice',topic:null,difficulty:'hard'},
          {label:'คูณ–หารท้าทาย',sub:'โจทย์เข้มข้นขึ้น เน้นคิดในใจ',mode:'home_practice',topic:4,difficulty:'hard'}
        ],
        tiers:{
          starter:{label:'Level 1 Warm up',desc:'เข้าสู่โหมดคิดไวสำหรับมัธยม',missions:[
            {key:'sc_mix',title:'สุ่มโจทย์มัธยม',desc:'คละโจทย์บวก ลบ คูณ เปรียบเทียบแบบจับเวลา',mode:'home_practice',topic:null,difficulty:'hard',questionCount:10,tag1:'คละโจทย์',tag2:'warm up'},
            {key:'sc_mul',title:'คูณระดับมัธยม',desc:'คูณโจทย์ยากขึ้นเพื่อสร้างความแม่นยำ',mode:'home_practice',topic:4,difficulty:'hard',questionCount:10,tag1:'คูณ',tag2:'แม่นยำ'},
            {key:'sc_div',title:'หารลงตัว',desc:'ฝึกหารลงตัวก่อนเข้าสู่โจทย์สองหลัก',mode:'home_practice',topic:9,difficulty:'hard',questionCount:10,tag1:'หาร',tag2:'ตรรกะ'}]},
          builder:{label:'Level 2 Speed Drill',desc:'โจทย์สองหลักคละแบบ',missions:[
            {key:'sc_large_mix',title:'คิดเร็ว 2 หลัก',desc:'บวก ลบ คูณ หาร คำตอบสองหลักแบบสองจังหวะ',mode:'large_number',topic:null,difficulty:'hard',questionCount:10,tag1:'สองหลัก',tag2:'speed'},
            {key:'sc_large_more',title:'โจทย์เร็วต่อเนื่อง',desc:'เล่นต่อเนื่องเพื่อฝึกสมาธิและความเร็ว',mode:'large_number',topic:null,difficulty:'hard',questionCount:20,tag1:'20 ข้อ',tag2:'focus'},
            {key:'sc_logic',title:'คู่คี่และเปรียบเทียบ',desc:'โจทย์ไว ๆ เพื่อฝึกการตัดสินใจ',mode:'home_practice',topic:6,difficulty:'hard',questionCount:10,tag1:'ตรรกะ',tag2:'reaction'}]},
          master:{label:'Level 3 Challenge',desc:'บทสรุปแบบเต็มระบบ',missions:[
            {key:'sc_master_mix',title:'Challenge รอบชิง',desc:'คละโจทย์มัธยมพร้อมจับเวลาและเก็บคะแนนสูงสุด',mode:'large_number',topic:null,difficulty:'hard',questionCount:20,tag1:'challenge',tag2:'เต็มระบบ'},
            {key:'sc_precision',title:'แม่นยำสูง',desc:'เน้นทำคะแนนให้ความแม่นยำเกิน 85%',mode:'home_practice',topic:null,difficulty:'hard',questionCount:10,tag1:'accuracy',tag2:'target'},
            {key:'sc_final',title:'บทสรุปมัธยม',desc:'เก็บสถิติก่อนส่งขึ้น Dashboard ของครู',mode:'large_number',topic:null,difficulty:'hard',questionCount:10,tag1:'dashboard',tag2:'final'}]}
        }
      }
    };
  }
  setGradeBand(band,opts={}){
    const bands=this.getStructuredBands();
    const info=bands[band]||bands.primary_low;
    this.gradeBand=band;
    localStorage.setItem('fingerMath_gradeBand',band);
    document.querySelectorAll('[data-grade-band]').forEach(btn=>btn.classList.toggle('active',btn.dataset.gradeBand===band));
    if(DOM.gradeBandHint)DOM.gradeBandHint.innerHTML=`<strong>${info.label}</strong> · ${info.hint}`;
    if(DOM.startClassroom && (!DOM.startClassroom.value || opts.forcePlaceholder))DOM.startClassroom.placeholder=info.placeholder;
    if(DOM.gradeRecommendation)DOM.gradeRecommendation.innerHTML=`<i class="fa-solid fa-lightbulb"></i><div><strong>เส้นทางแนะนำสำหรับ${info.label}</strong><span>${info.plan}</span></div>`;
    if(DOM.gradeQuickButtons){
      DOM.gradeQuickButtons.innerHTML='';
      (info.quick||[]).forEach(item=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.innerHTML=`<strong>${item.label}</strong><small>${item.sub}</small>`;
        btn.onclick=()=>this.quickStartConfigured(band,item.mode,item.topic,item.difficulty);
        DOM.gradeQuickButtons.appendChild(btn);
      });
    }
    this.renderMissionHub();
    if(!opts.preserveDifficulty){
      const next=opts.silent?(localStorage.getItem('fingerMath_difficulty')||this.difficulty||info.recommended):info.recommended;
      this.setDifficultyLevel(next,{silent:true});
    }
  }
  setDifficultyLevel(level,opts={}){
    const meta={
      easy:{label:'ง่าย',width:'34%',hint:'โจทย์สั้น ตัวเลขเล็ก เหมาะสำหรับเริ่มฝึกหรือทบทวนพื้นฐาน'},
      medium:{label:'ปานกลาง',width:'67%',hint:'เพิ่มการคิดในใจและสลับรูปแบบโจทย์ เหมาะกับการฝึกประจำวัน'},
      hard:{label:'ท้าทาย',width:'100%',hint:'ตอบเร็วขึ้น โจทย์หลากหลายขึ้น เหมาะสำหรับผู้เรียนที่พร้อมขยับระดับ'}
    };
    const info=meta[level]||meta.medium;
    this.difficulty=level;
    localStorage.setItem('fingerMath_difficulty',level);
    if(DOM.startDifficulty)DOM.startDifficulty.value=level;
    document.querySelectorAll('[data-difficulty-level]').forEach(btn=>btn.classList.toggle('active',btn.dataset.difficultyLevel===level));
    if(DOM.difficultyMeterFill)DOM.difficultyMeterFill.style.width=info.width;
    if(DOM.difficultyHint)DOM.difficultyHint.innerHTML=`<strong>${info.label}</strong> · ${info.hint}`;
  }
  setMissionTier(tier,opts={}){
    this.selectedMissionTier=tier||'starter';
    localStorage.setItem('fingerMath_v8_tier',this.selectedMissionTier);
    this.renderMissionHub();
  }
  renderMissionHub(){
    const bands=this.getStructuredBands();
    const info=bands[this.gradeBand]||bands.primary_low;
    const tiers=info.tiers||{};
    if(!tiers[this.selectedMissionTier])this.selectedMissionTier=Object.keys(tiers)[0]||'starter';
    const tierMeta=tiers[this.selectedMissionTier]||{label:'Level',desc:'',missions:[]};
    if(DOM.v8MissionTitle)DOM.v8MissionTitle.innerText=`เส้นทาง ${info.label}`;
    if(DOM.v8MissionSubtitle)DOM.v8MissionSubtitle.innerText=`${tierMeta.label} • ${tierMeta.desc}`;
    if(DOM.v8TierTabs){
      DOM.v8TierTabs.innerHTML='';
      Object.entries(tiers).forEach(([key,val])=>{
        const btn=document.createElement('button');
        btn.type='button';btn.className='v8-tier-tab'+(key===this.selectedMissionTier?' active':'');
        btn.innerHTML=`<strong>${val.label}</strong><small>${val.desc}</small>`;
        btn.onclick=()=>this.setMissionTier(key);
        DOM.v8TierTabs.appendChild(btn);
      });
    }
    if(DOM.v8MissionList){
      DOM.v8MissionList.innerHTML='';
      (tierMeta.missions||[]).forEach(m=>{
        const card=document.createElement('div');card.className='v8-mission-card';
        const prog=this.getMissionProgress(m.key);
        card.innerHTML=`<div><h4>${m.title}</h4><p>${m.desc}</p></div><div class="v8-chip-row"><span class="v8-chip">${m.tag1||info.label}</span><span class="v8-chip">${m.tag2||tierMeta.label}</span><span class="v8-chip">${m.questionCount||10} ข้อ</span></div><div class="v8-mini-progress">${prog}</div><button type="button" class="v8-launch-btn">เริ่มบทเรียนนี้</button>`;
        card.querySelector('button').onclick=()=>this.startStructuredMission({band:this.gradeBand,tier:this.selectedMissionTier,...m});
        DOM.v8MissionList.appendChild(card);
      });
    }
    if(DOM.v8ProgressSummary){
      DOM.v8ProgressSummary.innerHTML=this.getBandProgressSummary(this.gradeBand);
    }
  }
  getMissionProgressStore(){
    try{return JSON.parse(localStorage.getItem('fingerMath_v8_progress')||'[]');}catch(e){return []}
  }
  getMissionProgress(missionKey){
    const rows=this.getMissionProgressStore().filter(r=>r.missionKey===missionKey);
    if(!rows.length)return 'ยังไม่เคยเล่นบทเรียนนี้';
    const best=Math.max(...rows.map(r=>Number(r.accuracy)||0));
    const latest=rows[rows.length-1];
    return `เล่นแล้ว ${rows.length} ครั้ง • ดีที่สุด ${best}% • ล่าสุด ${latest.accuracy}%`;
  }
  getBandProgressSummary(band){
    const rows=this.getMissionProgressStore().filter(r=>r.band===band);
    if(!rows.length)return '<strong>Progress</strong><span>ยังไม่มีสถิติของช่วงชั้นนี้</span><span>เริ่มเล่นบทเรียนแรกเพื่อเก็บความก้าวหน้า</span>';
    const unique=new Set(rows.map(r=>r.missionKey)).size;
    const best=Math.max(...rows.map(r=>Number(r.accuracy)||0));
    const avg=(rows.reduce((a,b)=>a+(Number(b.accuracy)||0),0)/rows.length).toFixed(1);
    const latest=rows[rows.length-1];
    return `<strong>Progress ${rows.length} session</strong><span>ปลดล็อกแล้ว ${unique} บทเรียน • ค่าเฉลี่ย ${avg}%</span><span>ดีที่สุด ${best}% • ล่าสุด ${latest.title||'บทเรียน'} </span>`;
  }
  async quickStartConfigured(band,mode,topic=null,difficulty=null){
    this.currentMissionMeta={band,tier:'quick',missionKey:`quick_${band}_${mode}_${topic||'mix'}`,title:'Quick Start'};
    this.setGradeBand(band,{silent:true,preserveDifficulty:true});
    if(difficulty)this.setDifficultyLevel(difficulty,{silent:true});
    await this.startGame(mode,topic||null);
  }
  async startStructuredMission(mission){
    this.currentMissionMeta={band:mission.band||this.gradeBand,tier:mission.tier||this.selectedMissionTier,missionKey:mission.key,title:mission.title};
    this.setGradeBand(mission.band||this.gradeBand,{silent:true,preserveDifficulty:true});
    if(mission.difficulty)this.setDifficultyLevel(mission.difficulty,{silent:true});
    if(DOM.startQuestionCount && mission.questionCount)DOM.startQuestionCount.value=String(mission.questionCount);
    await this.startGame(mission.mode||'home_practice',mission.topic==null?null:mission.topic);
  }
  recordV8Progress(sessionRecord){
    if(!this.currentMissionMeta)return;
    const rows=this.getMissionProgressStore();
    rows.push({
      band:this.currentMissionMeta.band||this.gradeBand,
      tier:this.currentMissionMeta.tier||this.selectedMissionTier,
      missionKey:this.currentMissionMeta.missionKey||'manual',
      title:this.currentMissionMeta.title||'ภารกิจ',
      accuracy:sessionRecord.accuracy,
      score:sessionRecord.score,
      avgResponseTime:sessionRecord.avgResponseTime,
      dateTime:sessionRecord.dateTime
    });
    localStorage.setItem('fingerMath_v8_progress',JSON.stringify(rows.slice(-200)));
  }
  toggleMentalHandMapping(){
    this.mentalSwapHands=!this.mentalSwapHands;
    localStorage.setItem('fingerMath_mentalSwapHands',this.mentalSwapHands?'1':'0');
    return this.mentalSwapHands;
  }
  updateMenuSubtitle(){
    if(!DOM.menuSubtitle)return;
    DOM.menuSubtitle.innerText=this.theme==='kids'
      ?'เกมคณิตศาสตร์นับนิ้วสำหรับเด็ก ป.1–3 ✨ เล่นง่าย สนุก และประเมินได้จริง'
      :'แยกโหมดผู้ปกครองใช้ที่บ้าน และโหมดครูประเมินทักษะผู้เรียน ✨';
  }
  updateVoiceModeUI(){
    const b=document.getElementById('btnVoiceAccessibility');
    const s=document.getElementById('voiceModeStatus');
    if(b)b.innerHTML=this.accessibilityMode?'<i class="fa-solid fa-volume-xmark"></i> ปิดโหมดเสียง':'<i class="fa-solid fa-volume-high"></i> เปิดโหมดเสียง';
    if(s)s.innerHTML=this.accessibilityMode?'<i class="fa-solid fa-ear-listen"></i> สถานะ: เปิดโหมดเสียง':'<i class="fa-solid fa-ear-listen"></i> สถานะ: ปิดโหมดเสียง';
  }
  ensureVoiceMode(){
    if(this.accessibilityMode)return;
    this.accessibilityMode=true;
    this.speech.enable();
    this.updateVoiceModeUI();
  }
  async enableVoiceMode(){
    if(this.accessibilityMode){
      this.accessibilityMode=false;
      this.speech.disable();
      this.updateVoiceModeUI();
      return;
    }
    if(!this.speech.supported()){
      const s=document.getElementById('voiceModeStatus');
      if(s)s.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i> เบราว์เซอร์นี้ไม่รองรับเสียงพูด';
      return;
    }
    this.accessibilityMode=true;
    this.updateVoiceModeUI();
    const ok=await this.speech.enable();
    if(!ok){
      const s=document.getElementById('voiceModeStatus');
      if(s)s.innerHTML='<i class="fa-solid fa-volume-high"></i> เปิดแล้ว — กด “ฟังวิธีใช้” เพื่อทดสอบเสียง';
    }
  }
  repeatVoiceHelp(){
    this.ensureVoiceMode();
    this.speech.help();
  }
  setupResponsiveMenu(){
    return; // V8 uses the new primary tab navigation; disable the obsolete floating menu.
    const firstTab=document.querySelector('.tab-btn[data-tab]');
    const bar=firstTab&&firstTab.parentElement;
    if(!bar||bar.classList.contains('menu-tabs-right'))return;
    bar.classList.add('menu-tabs-right');
    bar.removeAttribute('style');
    const audioBtn=document.createElement('button');
    audioBtn.type='button';
    audioBtn.className='btn btn-ghost menu-audio-control';
    audioBtn.onclick=()=>this.toggleSoundEffects();
    audioBtn.innerHTML='<i class="fa-solid fa-volume-high"></i><span>เสียงเอฟเฟกต์</span>';
    bar.appendChild(audioBtn);
    this.updateSoundButton();
  }
  updateSoundButton(){
    const b=document.querySelector('.menu-audio-control');if(!b||!this.sound)return;
    b.innerHTML=this.sound.enabled
      ?'<i class="fa-solid fa-volume-high"></i><span>เสียงเอฟเฟกต์</span>'
      :'<i class="fa-solid fa-volume-xmark"></i><span>ปิดเสียงอยู่</span>';
    b.setAttribute('aria-pressed',this.sound.enabled?'true':'false');
  }
  toggleSoundEffects(){
    this.sound.toggle();this.updateSoundButton();
  }
  unlockAudioSystems(){
    if(this.sound)this.sound.unlock();
    try{if('speechSynthesis' in window)window.speechSynthesis.resume();}catch(e){}
  }
  switchMenuTab(t){
    ['parent','teacher','roster','physical','accessibility'].forEach(n=>{
      const el=$('tab'+n.charAt(0).toUpperCase()+n.slice(1));
      if(el)el.classList.toggle('hidden',n!==t);
    });
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
    document.querySelectorAll('.navlink[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  }

  // ══════════ AUTH (แยกบัญชีผู้ปกครอง / ครู) ══════════
  setAuthRole(role){
    this.authRole=['teacher','student'].includes(role)?role:'parent';
    DOM.authRoleParentBtn.classList.toggle('active',this.authRole==='parent');
    DOM.authRoleTeacherBtn.classList.toggle('active',this.authRole==='teacher');
    DOM.authRoleStudentBtn.classList.toggle('active',this.authRole==='student');
    const isStudent=this.authRole==='student';
    DOM.authModeSwitch.classList.toggle('hidden',isStudent);
    DOM.authSignupNameWrap.classList.add('hidden');
    DOM.authEmailWrap.classList.toggle('hidden',isStudent);
    DOM.authPasswordWrap.classList.toggle('hidden',isStudent);
    DOM.authSubmitBtn.classList.toggle('hidden',isStudent);
    DOM.authStudentPanel.classList.toggle('hidden',!isStudent);
    DOM.authError.innerText='';
    if(isStudent)this.renderStudentProfiles();
    else this.setAuthMode(this.authMode);
  }
  renderStudentProfiles(){
    const profiles=LearnerStore.allProfiles();
    DOM.studentProfileEmpty.classList.toggle('hidden',profiles.length>0);
    DOM.studentProfileList.innerHTML=profiles.map(p=>`<button type="button" class="student-profile-card" onclick="app.loginAsStudent('${p.ownerId}','${p.id}')"><span class="avatar">${(p.name||'?').charAt(0).toUpperCase()}</span><span><strong>${p.name}</strong><small>${p.classroom||'—'} · ผู้ดูแล: ${p.ownerName}</small></span></button>`).join('');
  }
  loginAsStudent(ownerId,learnerId){
    const learner=LearnerStore.find(ownerId,learnerId);
    if(!learner){DOM.authError.innerText='ไม่พบโปรไฟล์นี้ กรุณาให้ผู้ดูแลสร้างใหม่';return;}
    AccountManager.logout();StudentSession.set(ownerId,learnerId);
    this.selectedLearnerId=learnerId;
    DOM.startPlayerName.value=learner.name;
    DOM.startClassroom.value=learner.classroom==='—'?'':learner.classroom;
    this.onStudentAuthed(ownerId,learner);
  }
  onStudentAuthed(ownerId,learner){
    DOM.screenAuth.classList.add('hidden');DOM.menu.classList.remove('hidden');
    DOM.navUserName.innerText=learner.name;
    DOM.navUserRoleBadge.innerText='นักเรียน';DOM.navUserRoleBadge.className='role-badge';
    DOM.navUserRoleBadge.style.cssText='background:rgba(245,158,11,.18);color:#fcd34d;border:1px solid rgba(245,158,11,.4)';
    DOM.topnavLinks.innerHTML=`<button class="navlink active" data-tab="parent" onclick="app.switchMenuTab('parent')"><i class="fa-solid fa-gamepad"></i> เริ่มฝึก</button><button class="navlink" data-tab="physical" onclick="app.switchMenuTab('physical')"><i class="fa-solid fa-universal-access"></i> โหมดท่าทาง</button><button class="navlink" data-tab="accessibility" onclick="app.switchMenuTab('accessibility')"><i class="fa-solid fa-volume-high"></i> โหมดเสียง</button>`;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('hidden',['teacher','roster'].includes(b.dataset.tab)));
    DOM.startPlayerName.classList.add('student-locked-input');DOM.startClassroom.classList.add('student-locked-input');
    this.switchMenuTab('parent');
  }
  setAuthMode(mode){
    this.authMode=mode==='signup'?'signup':'login';
    DOM.authModeLoginBtn.classList.toggle('active',this.authMode==='login');
    DOM.authModeSignupBtn.classList.toggle('active',this.authMode==='signup');
    DOM.authSignupNameWrap.classList.toggle('hidden',this.authMode!=='signup');
    DOM.authSubmitBtn.innerHTML=this.authMode==='signup'
      ?'<i class="fa-solid fa-user-plus"></i> สมัครใช้งาน'
      :'<i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ';
    DOM.authError.innerText='';
  }
  async submitAuth(){
    DOM.authError.innerText='ระบบกำลังเชื่อมต่อ Supabase...';
    if(window.FMSingleAuth?.submit){
      return window.FMSingleAuth.submit(this);
    }
    DOM.authError.innerText='ระบบ Supabase ยังโหลดไม่สำเร็จ กรุณารีเฟรชหน้า';
  }

  onAuthed(acc){
    StudentSession.clear();
    DOM.startPlayerName.classList.remove('student-locked-input');DOM.startClassroom.classList.remove('student-locked-input');
    DOM.authEmail.value='';DOM.authPassword.value='';DOM.authName.value='';
    DOM.screenAuth.classList.add('hidden');
    DOM.menu.classList.remove('hidden');
    this.renderNavUser();
    this.renderTopnavLinks();
    this.renderRoster();
    this.populateTeacherStudentSelect();
    this.switchMenuTab(acc.role==='teacher'?'teacher':'parent');
  }
  async logout(){
    try{await window.FMSupabase?.signOut?.();}catch(e){}
    AccountManager.logout();
    StudentSession.clear();
    this.currentCloudAccount=null;
    location.reload();
  }

  getOwnerId(){const acc=this.currentCloudAccount;if(acc)return acc.id;const ss=StudentSession.current();return ss?ss.ownerId:'guest';}
  renderNavUser(){
    const acc=this.currentCloudAccount||AccountManager.current();if(!acc)return;
    DOM.navUserName.innerText=acc.name;
    DOM.navUserRoleBadge.innerText=acc.role==='teacher'?'ครู':'ผู้ปกครอง';
    DOM.navUserRoleBadge.className='role-badge '+(acc.role==='teacher'?'role-teacher':'role-parent');
    DOM.rosterTabLabel.innerText=acc.role==='teacher'?'รายชื่อนักเรียน':'โปรไฟล์ลูก';
    if(DOM.rosterHintTitle)DOM.rosterHintTitle.innerText=acc.role==='teacher'?'รายชื่อนักเรียนของฉัน':'โปรไฟล์ลูกของฉัน';
    if(DOM.rosterHintDesc)DOM.rosterHintDesc.innerText=acc.role==='teacher'
      ?'เพิ่มรายชื่อนักเรียนไว้ล่วงหน้า แล้วเลือกจากรายการก่อนเริ่มทำแบบประเมิน ระบบจะแยกเก็บผลของนักเรียนแต่ละคนไว้ใต้บัญชีของคุณเท่านั้น'
      :'เพิ่มโปรไฟล์ลูกแต่ละคนไว้ล่วงหน้า เพื่อให้เลือกชื่อได้เร็วขึ้นตอนเริ่มฝึก และดูความคืบหน้าแยกเป็นรายคน';
  }
  renderTopnavLinks(){
    const acc=this.currentCloudAccount||AccountManager.current();if(!acc)return;
    let html='';
    if(acc.role==='teacher'){
      html+=`<button class="navlink active" data-tab="teacher" onclick="app.switchMenuTab('teacher')"><i class="fa-solid fa-clipboard-check"></i> ประเมินทักษะ</button>`;
      html+=`<button class="navlink" data-tab="roster" onclick="app.switchMenuTab('roster')"><i class="fa-solid fa-users"></i> นักเรียนของฉัน</button>`;
      html+=`<button class="navlink" onclick="app.showDashboard()"><i class="fa-solid fa-chart-bar"></i> แดชบอร์ด</button>`;
      html+=`<button class="navlink" onclick="app.exportCSV()"><i class="fa-solid fa-file-csv"></i> Export CSV</button>`;
      html+=`<button class="navlink" onclick="app.showSheetSyncModal()"><i class="fa-solid fa-table"></i> Google Sheet</button>`;
    }else{
      html+=`<button class="navlink active" data-tab="parent" onclick="app.switchMenuTab('parent')"><i class="fa-solid fa-house-user"></i> ฝึกที่บ้าน</button>`;
      html+=`<button class="navlink" data-tab="roster" onclick="app.switchMenuTab('roster')"><i class="fa-solid fa-users"></i> โปรไฟล์ลูก</button>`;
      html+=`<button class="navlink" onclick="app.showLeaderboard()"><i class="fa-solid fa-crown"></i> ความคืบหน้าของลูก</button>`;
    }
    html+=`<button class="navlink" data-tab="physical" onclick="app.switchMenuTab('physical')"><i class="fa-solid fa-universal-access"></i> โหมดท่าทาง</button>`;
    html+=`<button class="navlink" data-tab="accessibility" onclick="app.switchMenuTab('accessibility')"><i class="fa-solid fa-volume-high"></i> โหมดเสียง</button>`;
    DOM.topnavLinks.innerHTML=html;
    // ซ่อนแท็บของอีกบทบาทไม่ให้เปิดใช้ปน (ผู้ปกครองไม่เห็นแท็บครู และในทางกลับกัน)
    const parentTabBtn=document.querySelector('.tab-btn[data-tab="parent"]');
    const teacherTabBtn=document.querySelector('.tab-btn[data-tab="teacher"]');
    if(parentTabBtn)parentTabBtn.classList.toggle('hidden',acc.role==='teacher');
    if(teacherTabBtn)teacherTabBtn.classList.toggle('hidden',acc.role!=='teacher');
  }

  // ══════════ ROSTER (นักเรียน/ลูก แยกตามบัญชี) ══════════
  addLearner(){
    const name=DOM.rosterNewName.value.trim();
    if(!name){DOM.rosterNewName.focus();return;}
    const classroom=DOM.rosterNewClassroom.value.trim();
    LearnerStore.add(this.getOwnerId(),name,classroom);
    DOM.rosterNewName.value='';DOM.rosterNewClassroom.value='';
    this.renderRoster();
    this.populateTeacherStudentSelect();
  }
  removeLearner(id){
    LearnerStore.remove(this.getOwnerId(),id);
    if(this.selectedLearnerId===id)this.selectedLearnerId=null;
    this.renderRoster();
    this.populateTeacherStudentSelect();
  }
  renderRoster(){
    const acc=this.currentCloudAccount||AccountManager.current();if(!acc||!DOM.rosterList)return;
    const list=LearnerStore.listFor(acc.id);
    if(!list.length){
      DOM.rosterList.innerHTML=`<p style="text-align:center;color:#64748b;padding:1.25rem 0;font-weight:600;font-size:0.85rem;">ยังไม่มีรายชื่อ — เพิ่มได้จากช่องด้านบน</p>`;
      return;
    }
    DOM.rosterList.innerHTML=list.map(s=>`
      <div class="roster-item">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
          <div class="roster-avatar">${(s.name||'?').trim().charAt(0).toUpperCase()}</div>
          <div style="min-width:0;">
            <p style="font-weight:700;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</p>
            <p style="font-size:0.7rem;color:#64748b;">${s.classroom}</p>
          </div>
        </div>
        <button class="btn btn-ghost" style="padding:6px 10px;flex-shrink:0;" onclick="app.removeLearner('${s.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>`).join('');
  }
  populateTeacherStudentSelect(){
    if(!DOM.teacherStudentSelect)return;
    const acc=this.currentCloudAccount||AccountManager.current();if(!acc)return;
    const list=LearnerStore.listFor(acc.id);
    DOM.teacherStudentSelect.innerHTML='<option value="">— พิมพ์ชื่อเองด้านบน หรือเลือกจากรายชื่อ —</option>'+
      list.map(s=>`<option value="${s.id}">${s.name} (${s.classroom})</option>`).join('');
  }
  onTeacherStudentSelect(){
    const id=DOM.teacherStudentSelect.value;
    this.selectedLearnerId=id||null;
    if(!id)return;
    const learner=LearnerStore.find(this.getOwnerId(),id);
    if(learner){
      DOM.startPlayerName.value=learner.name;
      if(learner.classroom&&learner.classroom!=='—')DOM.startClassroom.value=learner.classroom;
    }
  }

  // ══════════ GOOGLE SHEET SYNC ══════════
  toggleAppsScriptCode(){DOM.appsScriptCodeBox.classList.toggle('hidden');}
  showSheetSyncModal(){
    const cfg=SheetSync.getConfig(this.getOwnerId());
    DOM.sheetSyncUrl.value=cfg.url||'';
    DOM.sheetSyncAuto.checked=!!cfg.autoSync;
    DOM.sheetSyncStatus.innerText=cfg.lastSyncAt
      ?`ซิงก์ล่าสุด: ${new Date(cfg.lastSyncAt).toLocaleString('th-TH')} (${cfg.lastStatus==='ok'?'สำเร็จ':'ล้มเหลว'})`
      :'ยังไม่เคยซิงก์ข้อมูล';
    DOM.sheetSyncModal.classList.remove('hidden');
  }
  saveSheetSyncConfig(){
    const url=DOM.sheetSyncUrl.value.trim()||SheetSync.DEFAULT_URL;
    DOM.sheetSyncUrl.value=url;
    SheetSync.saveConfig(this.getOwnerId(),{url,autoSync:DOM.sheetSyncAuto.checked});
    DOM.sheetSyncStatus.innerText='บันทึกการเชื่อมต่อ Google Sheets แล้ว ✅';
  }
  async syncAllToSheet(){
    this.saveSheetSyncConfig();
    const ownerId=this.getOwnerId();
    const sessions=ResearchStore.load(ownerId);
    if(!sessions.length){DOM.sheetSyncStatus.innerText='ยังไม่มีข้อมูลในเครื่องให้ส่ง';return;}
    DOM.sheetSyncStatus.innerText='กำลังส่งข้อมูล...';
    const res=await SheetSync.push(ownerId,sessions);
    DOM.sheetSyncStatus.innerText=res.ok
      ?`ส่งสำเร็จ ${res.count} แถว ไปยัง Google Sheet แล้ว ✅`
      :`ส่งไม่สำเร็จ: ${res.error}`;
  }
  async _autoSyncSession(session){
    const ownerId=this.ownerId||this.getOwnerId();
    const cfg=SheetSync.getConfig(ownerId);
    if(!cfg.autoSync||!cfg.url)return;
    await SheetSync.push(ownerId,[session]);
  }
  // ── Camera connect with timeout + retry ──
  _setCameraStatusUI(state,opts={}){
    DOM.camStatus.classList.remove('hidden');
    DOM.btnCameraRetry.classList.toggle('hidden',state!=='error');
    if(state==='connecting'){
      DOM.cameraStatusIconWrap.style.background='rgba(0,212,255,0.1)';
      DOM.cameraStatusIconWrap.style.borderColor='rgba(0,212,255,0.4)';
      DOM.cameraStatusIcon.className='fa-solid fa-satellite-dish fa-spin';
      DOM.cameraStatusIcon.style.color='#00d4ff';
      DOM.cameraStatusTitle.className='';
      DOM.cameraStatusTitle.style.color='#67e8f9';
      DOM.cameraStatusTitle.innerText='กำลังเชื่อมต่อ AI...';
      DOM.cameraStatusSub.innerText='ต้องการอนุญาตกล้อง';
    }else if(state==='error'){
      DOM.cameraStatusIconWrap.style.background='rgba(239,68,68,0.12)';
      DOM.cameraStatusIconWrap.style.borderColor='rgba(239,68,68,0.4)';
      DOM.cameraStatusIcon.className='fa-solid fa-triangle-exclamation';
      DOM.cameraStatusIcon.style.color='#ef4444';
      DOM.cameraStatusTitle.style.color='#fca5a5';
      DOM.cameraStatusTitle.innerText=opts.title||'เชื่อมต่อกล้องไม่สำเร็จ';
      DOM.cameraStatusSub.innerText=opts.sub||'ตรวจสอบสิทธิ์การใช้กล้อง หรืออินเทอร์เน็ต แล้วลองใหม่';
    }
  }
  _createTracker(){
    if(typeof this._boundOnHand!=='function'){
      this._boundOnHand=(f,c,h)=>GameManager.prototype.onHand.call(this,f,c,h);
    }
    if(typeof this._boundOnFaceGesture!=='function'){
      this._boundOnFaceGesture=(g,c,l)=>GameManager.prototype.onFaceGesture.call(this,g,c,l);
    }
    return new HandTracker(
      DOM.video,DOM.canvas,DOM.faceCanvas,
      this._boundOnHand,
      this._boundOnFaceGesture
    );
  }
  async _resetCameraTracker(){
    clearTimeout(this.cameraTimeoutId);
    if(this.tracker){
      try{
        if(this.tracker.dispose) await this.tracker.dispose();
        else this.tracker.stop();
      }catch(e){}
    }
    this.tracker=this._createTracker();
    DOM.camStatus.classList.remove('hidden');
    this._setCameraStatusUI('connecting');
  }
  async _connectCamera(){
    // ถ้าสตรีมเดิมยังมี track ที่ทำงานอยู่จริง จึงค่อยใช้ต่อ
    const currentStream=this.tracker?.mediaStream || DOM.video?.srcObject;
    const hasLiveTrack=!!(currentStream && currentStream.getTracks && currentStream.getTracks().some(t=>t.readyState==='live'));
    if(this.tracker?.isReady && hasLiveTrack)return true;

    // หลังผู้เล่นก่อนหน้าจบ กล้องถูก stop แล้ว ต้องสร้าง Camera/Hands/FaceMesh ใหม่ทั้งหมด
    await this._resetCameraTracker();
    this._setCameraStatusUI('connecting');
    clearTimeout(this.cameraTimeoutId);
    let timedOut=false;
    const timeoutPromise=new Promise(resolve=>{
      this.cameraTimeoutId=setTimeout(()=>{timedOut=true;resolve('timeout');},CONFIG.cameraTimeoutMs);
    });
    try{
      const result=await Promise.race([this.tracker.init().then(()=>'ok'),timeoutPromise]);
      clearTimeout(this.cameraTimeoutId);
      if(result==='timeout'||timedOut){
        this._setCameraStatusUI('error',{title:'เชื่อมต่อกล้องช้ากว่าปกติ',sub:'สัญญาณอินเทอร์เน็ตอาจช้า หรือกล้อง/โมเดลโหลดไม่สำเร็จ'});
        return false;
      }
      if(!this.tracker.isReady){
        // init() resolved but frames haven't arrived yet; onFrame callback will hide the overlay itself
        return true;
      }
      return true;
    }catch(err){
      clearTimeout(this.cameraTimeoutId);
      const denied=String(err&&err.name||'').includes('NotAllowed')||String(err&&err.message||'').toLowerCase().includes('permission');
      this._setCameraStatusUI('error',{
        title:denied?'ไม่ได้รับอนุญาตให้ใช้กล้อง':'เชื่อมต่อกล้องไม่สำเร็จ',
        sub:denied?'กรุณาอนุญาตการใช้กล้องในเบราว์เซอร์ แล้วลองใหม่':'ตรวจสอบว่ากล้องไม่ได้ถูกใช้งานโดยแอปอื่น แล้วลองใหม่อีกครั้ง'
      });
      return false;
    }
  }
  async retryCamera(){
    await this._connectCamera();
    if(this.tracker.isReady&&this.state==='menu'){
      // ผู้ใช้กดลองใหม่ตอนอยู่หน้าเมนู (ไม่ควรเกิดขึ้นบ่อย) — ไม่ต้องทำอะไรเพิ่ม
    }
    if(this.tracker.isReady&&this.tracker.setGestureMode){
      this.tracker.setGestureMode(this.physicalMode?this.physicalControl:'off');
    }
  }
  async startGame(mode,topicOverride=null){
    const acc=this.currentCloudAccount||AccountManager.current(),studentSession=StudentSession.current();
    this.ownerId=acc?acc.id:(studentSession?studentSession.ownerId:'guest');
    this.learnerId=this.selectedLearnerId||(studentSession?studentSession.learnerId:null);
    this.playerName=(DOM.startPlayerName.value.trim())||'ไม่ระบุชื่อ';
    this.classroom=(DOM.startClassroom.value.trim())||'—';
    this.totalQ=parseInt(DOM.startQuestionCount.value)||10;
    this.gradeBand=this.gradeBand||localStorage.getItem('fingerMath_gradeBand')||'primary_low';
    this.difficulty=DOM.startDifficulty.value||this.difficulty||'medium';
    this.holdTime=parseFloat($('practiceHoldTime')?.value||1.2);
    this.gameMode=mode;this.testType=mode;
    this.physicalMode=mode.startsWith('physical_');
    this.physicalControl=mode==='physical_face'?'face':'head';
    document.body.classList.toggle('physical-mode',this.physicalMode);
    document.body.classList.toggle('physical-head-mode',mode==='physical_head');
    document.body.classList.toggle('physical-face-mode',mode==='physical_face');
    if(mode==='voice_accessibility'){this.ensureVoiceMode();}
    if(mode==='mental_two_hand')this.testType='mental_two_hand';
    this.userRole=studentSession?'student':(mode.startsWith('teacher_')?'teacher':(mode==='voice_accessibility'?'accessibility':(this.physicalMode?'physical_accessibility':'parent')));
    if(mode==='teacher_pretest')this.testType='pretest';
    if(mode==='teacher_posttest')this.testType='posttest';
    if(mode==='teacher_assessment')this.testType='skill_assessment';
    if(mode==='home_practice')this.testType='home_practice';
    if(mode==='voice_accessibility')this.testType='accessibility_voice';
    if(mode==='physical_head')this.testType='accessibility_physical_head';
    if(mode==='physical_face')this.testType='accessibility_physical_face';
    if(mode==='mental_two_hand')this.testType='mental_two_hand';
    if(this.physicalMode){this.classTopic=null;}
    else if(topicOverride){this.classTopic=String(topicOverride);}
    else if(mode==='teacher_pretest'||mode==='teacher_posttest'||mode==='teacher_assessment'){
      this.classTopic=$('testTopicSelect')?.value||'0';
      if(this.classTopic==='0')this.classTopic=null;
    }else{this.classTopic=null;}
    this.sound.init();
    this.seed=this._hash(new Date().toDateString()+this.playerName);
    if(this.testType==='pretest'||this.testType==='posttest'||this.testType==='skill_assessment')this.seed=this._hash(new Date().toDateString()+(this.classTopic||'all'));
    this.rng=new SeededRNG(this.seed);
    DOM.hudPlayerName.innerText=this.playerName;
    DOM.menu.classList.add('hidden');DOM.ui.classList.remove('hidden');DOM.gameOverModal.classList.add('hidden');
    const fingerLabel=document.querySelector('#hudFingers')?.previousElementSibling;
    if(fingerLabel)fingerLabel.innerText=this.physicalMode?'คำตอบ':'นิ้ว';
    this._setBadge(this.testType);
    const camOk=await this._connectCamera();
    if(!camOk){
      // แสดงข้อความ error ค้างไว้ในกล้อง ผู้เล่นกดปุ่ม "ลองเชื่อมต่อกล้องอีกครั้ง" ได้
      return;
    }
    if(this.tracker?.setGestureMode)this.tracker.setGestureMode(this.physicalMode?this.physicalControl:'off');
    this.startSession();
  }
  _hash(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}
  _setBadge(m){
    const MAP={pretest:{cls:'badge-pre',txt:'📋 ประเมินก่อนเรียน'},posttest:{cls:'badge-post',txt:'🏁 ประเมินหลังเรียน'},
      skill_assessment:{cls:'badge-pre',txt:'🧾 ประเมินทักษะ'},home_practice:{cls:'badge-practice',txt:'🏠 ฝึกที่บ้าน'},
      practice:{cls:'badge-practice',txt:'✏️ ฝึกหัด'},practice_topic:{cls:'badge-practice',txt:'✏️ ฝึกเฉพาะหัวข้อ'},accessibility_voice:{cls:'badge-pre',txt:'🔊 โหมดเสียง'},
      accessibility_physical_head:{cls:'badge-practice',txt:'♿ พยักหน้า/ส่ายหัว'},accessibility_physical_face:{cls:'badge-practice',txt:'♿ ยิ้ม/หน้านิ่ง'},large_number:{cls:'badge-post',txt:'🔢 เลขเกิน 10'},mental_two_hand:{cls:'badge-post',txt:'👐 จินตคณิตสองมือ'}};
    const m2=MAP[m]||MAP.practice;
    DOM.hudTestBadge.className='badge '+m2.cls;
    DOM.hudTestBadge.innerText=m2.txt;
    DOM.hudTestBadge.classList.remove('hidden');
  }
  startSession(){
    this.score.reset();this.state='playing';this.qIdx=0;this.responses=[];
    this.sessionId=genSessionId();this.sessStart=performance.now();
    this.rng=new SeededRNG(this.seed);
    this.emoAnalyzer.reset();
    this.nextQ();
    if(this.loopId)cancelAnimationFrame(this.loopId);
    this.lastFrame=performance.now();this.loop();
  }
  nextQ(){
    // `nextQ` must never read frame variables such as f/hands. Those only exist in onHand().
    if(!this.qMgr||!this.rng){
      console.error('[FingerMath] Question engine is not ready');
      return;
    }
    this.qIdx++;
    if(this.totalQ!==999&&this.qIdx>this.totalQ){this.endGame();return;}
    DOM.hudLevel.innerText=this.totalQ===999?String(this.qIdx):`${this.qIdx}/${this.totalQ}`;
    const q=this.qMgr.generate(this.score.level,this.gameMode,this.classTopic,this.rng,this.difficulty,this.gradeBand);
    DOM.questionMode.innerHTML=`<i class="fa-solid fa-bolt" style="color:#fcd34d;"></i> ${q.modeName}`;
    DOM.questionText.innerText=q.text;DOM.instructionText.innerText=q.instruction;
    if(this.gameMode==='mental_two_hand'){
      DOM.instructionText.innerText='มือซ้ายของผู้เล่น = หลักสิบ • มือขวาของผู้เล่น = หลักหน่วย';
      DOM.hudFingers.innerText='ซ้าย — | ขวา —';
    }
    if(this.gameMode==='large_number'){
      q.answerStage=0;
      DOM.instructionText.innerText='จังหวะที่ 1/2 · ชูเลขหลักสิบ';
      DOM.hudFingers.innerText='—';
    }
    this.timeLeft=CONFIG.timePerQuestion;this.lastFrame=performance.now();
    this.isHolding=false;this.holdElapsed=0;
    this.pendingPhysicalGesture='none';
    this.pendingPhysicalOk=true;
    if(this.tracker?.resetGestureState)this.tracker.resetGestureState(false);
    this.gestureReadyAt=this.physicalMode?performance.now()+(this.physicalControl==='face'?1250:850):0; // กันการตอบทันทีตอนเปลี่ยนข้อ
    DOM.holdRing.classList.remove('active');
    DOM.holdFill.style.strokeDashoffset='283';
    DOM.feedbackContainer.classList.add('hidden');
    DOM.questionText.classList.remove('anim-pop');
    void DOM.questionText.offsetWidth;
    DOM.questionText.classList.add('anim-pop');
    if(this.accessibilityMode){
      this.state='speaking';
      DOM.instructionText.innerText='กำลังอ่านโจทย์...';
      DOM.timerText.innerText='รอเสียงจบ';
      DOM.timerBar.style.width='100%';
      this.speech.question(q,this.qIdx,this.totalQ).then(()=>{
        if(this.state==='speaking'){
          this.timeLeft=CONFIG.timePerQuestion;
          this.lastFrame=performance.now();
          this.state='playing';
          DOM.instructionText.innerText='เริ่มตอบได้';
        }
      });
    }
  }
  repeatCurrentQuestion(){
    if(!this.accessibilityMode || !this.qMgr.q)return;
    this.state='speaking';
    DOM.instructionText.innerText='กำลังอ่านโจทย์ซ้ำ...';
    DOM.timerText.innerText='รอเสียงจบ';
    this.speech.question(this.qMgr.q,this.qIdx,this.totalQ).then(()=>{
      if(this.state==='speaking'){
        this.lastFrame=performance.now();
        this.state='playing';
        DOM.instructionText.innerText='เริ่มตอบได้';
      }
    });
  }
  onHand(f,conf,hands=null){
    // Normalize callback values so a malformed MediaPipe frame cannot freeze the game loop.
    f=Number.isFinite(Number(f))?Number(f):0;
    conf=Number.isFinite(Number(conf))?Number(conf):0;
    hands=hands&&typeof hands==='object'?hands:null;
    if(this.physicalMode){
      if(this.state!=='playing')return;
      return; // โหมดท่าทางไม่ใช้จำนวนนิ้ว
    }
    if(this.gameMode==='mental_two_hand'){
      const detectedLeft=hands?.left?.digit;
      const detectedRight=hands?.right?.digit;
      const left=this.mentalSwapHands?detectedRight:detectedLeft;
      const right=this.mentalSwapHands?detectedLeft:detectedRight;
      const both=hands?.bothVisible===true&&Number.isInteger(left)&&Number.isInteger(right);
      const value=both?(left*10+right):null;
      DOM.hudFingers.innerText=both?`ซ้าย ${left} สิบ | ขวา ${right} หน่วย = ${value}`:'กรุณาชูสองมือให้เห็นพร้อมกัน';
      const leftValue=document.getElementById('mentalLeftValue');
      const rightValue=document.getElementById('mentalRightValue');
      const combinedValue=document.getElementById('mentalCombinedValue');
      const status=document.getElementById('mentalHandStatus');
      if(leftValue)leftValue.textContent=Number.isInteger(left)?left:'—';
      if(rightValue)rightValue.textContent=Number.isInteger(right)?right:'—';
      if(combinedValue)combinedValue.textContent=both?String(value):'—';
      if(status){
        status.textContent=both?'แยกมือสำเร็จ • ค้างมือไว้เพื่อยืนยัน':'ยังไม่เห็นสองมือชัดเจน • แยกมือออกจากกันและวางกลางกล้อง';
        status.dataset.ready=both?'true':'false';
      }
      if(this.state!=='playing')return;
      if(!both || conf<CONFIG.confThreshold){
        if(this.isHolding){this.isHolding=false;this.holdElapsed=0;DOM.holdRing.classList.remove('active');DOM.holdFill.style.strokeDashoffset='283';}
        return;
      }
      const ok=this.qMgr.q?.answerCheck(value);
      if(ok){if(!this.isHolding){this.isHolding=true;this.holdElapsed=0;DOM.holdRing.classList.add('active');}}
      else if(this.isHolding){this.isHolding=false;this.holdElapsed=0;DOM.holdRing.classList.remove('active');DOM.holdFill.style.strokeDashoffset='283';}
      return;
    }
    if(this.state!=='playing'){DOM.hudFingers.innerText=f;return;}
    DOM.hudFingers.innerText=f;
    if(this.accessibilityMode&&conf>=CONFIG.confThreshold)this.speech.finger(f,false);
    if(conf<CONFIG.confThreshold)return;
    let ok;
    if(this.gameMode==='large_number'&&this.qMgr.q?.answerDigits){
      ok=f===this.qMgr.q.answerDigits[this.qMgr.q.answerStage||0];
    }else ok=this.qMgr.q?.answerCheck(f);
    if(ok){if(!this.isHolding){this.isHolding=true;this.holdElapsed=0;DOM.holdRing.classList.add('active');}}
    else{if(this.isHolding){this.isHolding=false;this.holdElapsed=0;DOM.holdRing.classList.remove('active');DOM.holdFill.style.strokeDashoffset='283';}}
  }
  onFaceGesture(gesture,conf,label){
    if(!this.physicalMode)return;
    const icon={nod:'✅ พยักหน้า',shake:'❌ ส่ายหัว',smile:'😊 ยิ้ม',neutral:'😐 หน้านิ่ง',none:'—'}[gesture]||label||'—';
    DOM.hudFingers.innerText=icon;
    DOM.hudConf.innerText=conf>0?Math.round(conf*100)+'%':'—';
    DOM.confidenceFill.style.width=(conf*100)+'%';
    // แก้ไข: แถบ confidence ในโหมดท่าทางไม่เคยเปลี่ยนสีตามค่าความมั่นใจ
    const confPct=conf*100;
    DOM.confidenceFill.style.background=confPct>=80?'#10b981':confPct>=55?'#f59e0b':'#ef4444';

    if(this.state!=='playing')return;
    if(performance.now()<this.gestureReadyAt)return;

    const allowed=this.physicalControl==='face'?['smile','neutral']:['nod','shake'];
    const minConf=this.physicalControl==='face'?(gesture==='neutral'?0.50:0.54):0.52;
    if(conf<minConf || gesture==='none' || !allowed.includes(gesture)){
      if(this.isHolding){
        this.isHolding=false;this.holdElapsed=0;this.pendingPhysicalGesture='none';
        DOM.holdRing.classList.remove('active');DOM.holdFill.style.strokeDashoffset='283';
      }
      return;
    }

    this.currentGesture=gesture;
    const ok=!!this.qMgr.q?.answerCheck(gesture);

    // โหมดท่าทางต้องนับ “คำตอบที่ผิด” ได้จริง ไม่ใช่รอหมดเวลา
    // จึงให้ค้างวงกลมกับทุก gesture ที่อนุญาต แล้วตัดสินถูก/ผิดตอนค้างครบเวลา
    if(!this.isHolding || this.pendingPhysicalGesture!==gesture){
      this.isHolding=true;
      this.holdElapsed=0;
      this.pendingPhysicalGesture=gesture;
      this.pendingPhysicalOk=ok;
      DOM.holdRing.classList.add('active');
      DOM.holdFill.style.strokeDashoffset='283';
    }else{
      this.pendingPhysicalOk=ok;
    }
  }
  loop(){
    const now=performance.now();
    let dt=Math.min((now-this.lastFrame)/1000,0.1);this.lastFrame=now;
    if(this.state==='playing'||this.state==='feedback'){
      DOM.hudElapsed.innerText=((now-this.sessStart)/1000).toFixed(0)+'s';
    }
    if(this.state==='playing'){
      if(!this.isHolding){this.timeLeft-=dt;if(this.timeLeft<0)this.timeLeft=0;}
      else{
        this.holdElapsed+=dt;
        const pct=Math.min(1,this.holdElapsed/this.holdTime);
        DOM.holdFill.style.strokeDashoffset=(283-(283*pct)).toFixed(2);
        if(this.holdElapsed>=this.holdTime){
          const responseTime=CONFIG.timePerQuestion-this.timeLeft;
          this.isHolding=false;
          if(this.physicalMode){
            const g=this.pendingPhysicalGesture||this.currentGesture||'none';
            const isOk=!!this.pendingPhysicalOk;
            this.currentGesture=g;
            if(isOk)this.handleOk(responseTime);
            else this.handleBad('ยังไม่ถูก ลองใหม่อีกครั้ง',`คำตอบที่ถูกคือ: ${this.qMgr.q?.answerText ?? '—'}`,g);
          }else{
            if(this.gameMode==='large_number'&&this.qMgr.q?.answerStage===0){
              this.qMgr.q.answerStage=1;
              this.isHolding=false;this.holdElapsed=0;
              DOM.holdRing.classList.remove('active');DOM.holdFill.style.strokeDashoffset='283';
              DOM.instructionText.innerText=`ยืนยันหลักสิบแล้ว · จังหวะที่ 2/2 ชูเลขหลักหน่วย`;
              DOM.questionMode.innerHTML='<i class="fa-solid fa-layer-group" style="color:#fcd34d;"></i> หลักหน่วย';
              this.timeLeft=Math.max(this.timeLeft,5);
              if(this.accessibilityMode)this.speech.speak('ถูกต้อง ต่อไปชูเลขหลักหน่วย');
            }else this.handleOk(responseTime);
          }
        }
      }
      DOM.timerText.innerText=Math.max(0,this.timeLeft).toFixed(1)+'s';
      DOM.timerBar.style.width=(this.timeLeft/CONFIG.timePerQuestion*100)+'%';
      const low=this.timeLeft<=3;
      DOM.timerBar.style.background=low?'#ef4444':'#00d4ff';
      DOM.timerText.style.color=low?'#fca5a5':'#fff';
      if(this.timeLeft<=0&&!this.isHolding){
        const answerText=this.qMgr?.q?.answerText ?? '—';
        this.handleBad('หมดเวลา!',`คำตอบที่ถูกคือ: ${answerText}`,-1);
      }
    }
    this.loopId=requestAnimationFrame(()=>this.loop());
  }
  _log(ok,f){
    const q=this.qMgr?.q;
    if(!q)return;
    const rt=parseFloat((CONFIG.timePerQuestion-this.timeLeft).toFixed(2));
    this.responses.push({qNumber:this.qIdx,topic:q.topic,skillDimension:getSkillDimension(q.topic),modeName:q.modeName,questionText:q.text,
      answerText:q.answerText,fingersShown:f,correct:ok,responseTime:rt,
      timeRemaining:parseFloat(this.timeLeft.toFixed(2)),
      emotion:this.emoAnalyzer.currentEmotion,
      timestamp:new Date().toISOString()});
  }
  handleOk(t){
    const f=this.physicalMode?(this.pendingPhysicalGesture||this.currentGesture||'none'):(parseInt(DOM.hudFingers.innerText)||0);this._log(true,f);
    this.state='feedback';this.sound.correct();DOM.holdRing.classList.remove('active');
    const r=this.score.add(t);
    this.emoAnalyzer.onCorrect();
    const okMsg=r.bonus||CONFIG.messages[Math.floor(Math.random()*CONFIG.messages.length)];
    this.showFB(true,`+${r.points}`,okMsg,'');
    const goNext=()=>{if(this.state!=='gameover'&&this.state!=='menu'){this.state='playing';this.nextQ();}};
    if(r.leveledUp){this.sound.levelUp();DOM.levelUpOverlay.classList.remove('hidden');setTimeout(()=>DOM.levelUpOverlay.classList.add('hidden'),2000);}
    if(this.accessibilityMode){
      this.speech.result(true,okMsg,'').then(()=>setTimeout(goNext,700));
    }else{
      setTimeout(goNext,1400);
    }
  }
  handleBad(reason,ans,f=-1){
    const fingers=f===-1?(this.physicalMode?(this.currentGesture||'none'):(parseInt(DOM.hudFingers.innerText)||0)):f;
    this._log(false,fingers);
    this.state='feedback';this.sound.wrong();this.score.bad();DOM.holdRing.classList.remove('active');
    DOM.questionText.classList.add('anim-shake');setTimeout(()=>DOM.questionText.classList.remove('anim-shake'),500);
    this.showFB(false,'0',reason,ans||'');
    const goNext=()=>{if(this.state!=='gameover'&&this.state!=='menu'){this.state='playing';this.nextQ();}};
    if(this.accessibilityMode){
      this.speech.result(false,reason,ans||'').then(()=>setTimeout(goNext,900));
    }else{
      setTimeout(goNext,2200);
    }
  }
  showFB(ok,pts,msg,sub){
    DOM.feedbackContainer.classList.remove('hidden');
    const color=ok?'#10b981':'#ef4444';
    const icon=ok?'fa-check':'fa-xmark';
    DOM.feedbackIconWrap.style.cssText=`width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${ok?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)'};border:2px solid ${color};`;
    DOM.feedbackIcon.className=`fa-solid ${icon}`;
    DOM.feedbackIcon.style.cssText=`font-size:2.2rem;color:${color};`;
    DOM.feedbackText.innerText=ok?'ถูกต้อง!':'ผิดจ้า!';
    DOM.feedbackText.style.color=color;
    DOM.feedbackPoints.innerText=pts;
    DOM.feedbackMessage.innerText=msg;DOM.feedbackAnswer.innerText=sub;
  }
  togglePause(){
    if(this.state==='playing'){
      this.state='paused';
      DOM.btnPause.innerHTML='<i class="fa-solid fa-play"></i><span style="font-size:0.8rem;">เล่นต่อ</span>';
      DOM.btnPause.className='btn btn-green';
      if(this.accessibilityMode)this.speech.speak('พักเกมแล้ว กดปุ่มเดิมเพื่อเล่นต่อ');
    }else if(this.state==='paused'){
      this.state='playing';this.lastFrame=performance.now();
      DOM.btnPause.innerHTML='<i class="fa-solid fa-pause"></i><span style="font-size:0.8rem;">พัก</span>';
      DOM.btnPause.className='btn btn-ghost';
      if(this.accessibilityMode)this.speech.speak('เล่นต่อแล้ว');
    }
  }
  endGame(title='ภารกิจสำเร็จ!'){
    this.state='gameover';
    const tt=parseFloat(((performance.now()-this.sessStart)/1000).toFixed(1));
    const avgRT=this.responses.length?parseFloat((this.responses.reduce((a,b)=>a+(b.responseTime||0),0)/this.responses.length).toFixed(2)):0;

    // Build emotion summary
    const emoSummary=this.emoAnalyzer.getSummary();
    const emotionSummaryMap={};
    if(emoSummary)emoSummary.forEach(e=>emotionSummaryMap[e.emotion]=e.pct);

    const sessionRecord={
      sessionId:this.sessionId,playerName:this.playerName,classroom:this.classroom,
      learnerId:this.learnerId||null,
      userRole:this.userRole||'parent',testType:this.testType,difficulty:this.difficulty,topicFilter:this.classTopic||'all',
      dateTime:new Date().toISOString(),totalQuestions:this.responses.length,
      correctCount:this.score.correct,wrongCount:this.score.wrong,accuracy:this.score.acc,
      score:this.score.score,totalTimeSec:tt,avgResponseTime:avgRT,
      emotionSummary:emotionSummaryMap,
      responses:this.responses,seed:this.seed,
    };
    ResearchStore.add(this.ownerId||this.getOwnerId(),sessionRecord);
    this.recordV8Progress(sessionRecord);
    this._autoSyncSession(sessionRecord);
    DOM.ui.classList.add('hidden');DOM.gameOverModal.classList.remove('hidden');
    const TL={pretest:'📋 ประเมินก่อนเรียน',posttest:'🏁 ประเมินหลังเรียน',skill_assessment:'🧾 ประเมินทักษะ',home_practice:'🏠 ฝึกที่บ้าน',practice:'✏️ ฝึกหัด',practice_topic:'✏️ ฝึกเฉพาะหัวข้อ',accessibility_voice:'🔊 โหมดเสียง',accessibility_physical_head:'♿ พยักหน้า/ส่ายหัว',accessibility_physical_face:'♿ ยิ้ม/หน้านิ่ง',mental_two_hand:'👐 จินตคณิตสองมือ'};
    const TC={pretest:'badge-pre',posttest:'badge-post',skill_assessment:'badge-pre',home_practice:'badge-practice',practice:'badge-practice',practice_topic:'badge-practice',accessibility_voice:'badge-pre',accessibility_physical_head:'badge-practice',accessibility_physical_face:'badge-practice',mental_two_hand:'badge-post'};
    DOM.sessionTypeBadge.innerText=TL[this.testType]||this.testType;
    DOM.sessionTypeBadge.className='badge '+(TC[this.testType]||'badge-practice');
    DOM.gameOverTitle.innerText=this.theme==='kids'?'เก่งมากเลย!':title;
    DOM.finalPlayerName.innerText=this.playerName;
    DOM.finalClassroom.innerText=this.classroom;
    DOM.finalSessionId.innerText=this.sessionId;
    DOM.finalElapsed.innerText=tt+' วินาที';
    DOM.finalScoreText.innerText=this.score.score;
    DOM.finalAccuracy.innerText=this.score.acc+'%';
    DOM.finalCorrect.innerText=this.score.correct;
    DOM.finalWrong.innerText=this.score.wrong;
    if(this.accessibilityMode)this.speech.summary(this.score.score,this.score.acc,this.score.correct,this.score.wrong);

    // Learner level
    const lvl=classifyLearnerLevel(avgRT,this.score.acc);
    DOM.levelAnalysisIcon.style.background=lvl.bg;
    DOM.levelAnalysisIcon.style.border='2px solid '+lvl.border;
    DOM.levelAnalysisIcon.innerText=lvl.icon;
    DOM.levelAnalysisTitle.innerText=lvl.label;
    DOM.levelAnalysisTitle.style.color=lvl.color;
    const passTxt=getAssessmentPass(this.score.acc,avgRT)==='PASS'?'ผ่านเกณฑ์ประเมินเบื้องต้น':'ควรฝึกเสริม/สังเกตเพิ่มเติม';
    DOM.levelAnalysisDesc.innerText=lvl.desc+` (เวลาตอบเฉลี่ย ${avgRT}s) • ${passTxt}`;

    // Emotion summary in game over
    const EMOMAP={happy:{emoji:'😊',label:'มีความสุข',color:'#10b981'},
      excited:{emoji:'🤩',label:'ตื่นเต้น',color:'#f59e0b'},
      focused:{emoji:'🧐',label:'มีสมาธิ',color:'#00d4ff'},
      anxious:{emoji:'😟',label:'ละสายตา',color:'#ef4444'},
      neutral:{emoji:'😐',label:'สงบ',color:'#94a3b8'}};
    DOM.emotionSummaryContent.innerHTML='';
    if(emoSummary&&emoSummary.length){
      emoSummary.slice(0,4).forEach(e=>{
        const em=EMOMAP[e.emotion]||EMOMAP.neutral;
        const el=document.createElement('div');
        el.style.cssText=`display:flex;flex-direction:column;align-items:center;gap:4px;background:rgba(0,0,0,0.25);border-radius:10px;padding:8px 12px;flex:1;min-width:70px;`;
        el.innerHTML=`<span style="font-size:1.4rem;">${em.emoji}</span><span style="font-size:0.68rem;font-weight:700;color:${em.color};">${em.label}</span><span style="font-family:'Fredoka One',cursive;font-size:1rem;color:#fff;">${e.pct}%</span>`;
        DOM.emotionSummaryContent.appendChild(el);
      });
    } else {
      DOM.emotionSummaryContent.innerHTML='<p style="font-size:0.78rem;color:#64748b;padding:4px;">ไม่พบข้อมูลพฤติกรรมการมองหน้าจอ (ต้องการกล้อง)</p>';
    }

    DOM.finalQuestionLog.innerHTML='';
    const EMOICON={happy:'😊',excited:'🤩',focused:'🧐',anxious:'😟',neutral:'😐'};
    this.responses.forEach(r=>{
      const el=document.createElement('div');el.className='q-log-item';
      el.innerHTML=`<span style="color:${r.correct?'#10b981':'#ef4444'};font-size:0.8rem;">${r.correct?'✓':'✗'}</span><span style="flex:1;color:#94a3b8;">${r.qNumber}. ${r.questionText}</span><span style="font-size:0.9rem;">${EMOICON[r.emotion]||'😐'}</span><span style="font-family:'IBM Plex Mono',monospace;font-size:0.72rem;color:#64748b;">${r.responseTime}s</span>`;
      DOM.finalQuestionLog.appendChild(el);
    });
  }
  showDashboard(){
    DOM.dashboardModal.classList.remove('hidden');
    const s=ResearchStore.stats(this.getOwnerId());
    if(!s){DOM.dashTotalPlayers.innerText=DOM.dashTotalSessions.innerText=DOM.dashAvgAcc.innerText=DOM.dashAvgTime.innerText='0';return;}
    DOM.dashTotalPlayers.innerText=s.players.length;DOM.dashTotalSessions.innerText=s.sessions.length;
    DOM.dashAvgAcc.innerText=s.avgAcc+'%';DOM.dashAvgTime.innerText=s.avgTime+'s';
    DOM.dashTopicBars.innerHTML='';
    Object.entries(s.topicStats).forEach(([_,ts])=>{
      const p=ts.total>0?Math.round((ts.correct/ts.total)*100):0;
      const c=p>=80?'#10b981':p>=60?'#f59e0b':'#ef4444';
      DOM.dashTopicBars.innerHTML+=`<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:0.78rem;font-weight:600;color:#94a3b8;">${ts.name}</span><span style="font-size:0.75rem;font-weight:700;color:${c};">${p}% (${ts.correct}/${ts.total})</span></div><div class="sbar-track"><div class="sbar-fill" style="width:${p}%;background:${c};"></div></div></div>`;
    });
    if(s.preAvg!==null||s.postAvg!==null){
      const diff=(s.preAvg!==null&&s.postAvg!==null)?s.postAvg-s.preAvg:null;
      DOM.dashPrePost.innerHTML=`<div style="display:flex;justify-content:space-around;align-items:center;"><div class="badge badge-pre" style="padding:12px 20px;font-size:0.85rem;flex-direction:column;gap:3px;"><span>Pre-Test</span><span class="f-display" style="font-size:1.5rem;">${s.preAvg!==null?s.preAvg+'%':'—'}</span></div><div style="font-size:1.5rem;color:#64748b;">→${diff!==null?`<span style="font-size:0.9rem;font-weight:700;color:${diff>=0?'#10b981':'#ef4444'};"> (${diff>=0?'+':''}${diff}%)</span>`:'  '}</div><div class="badge badge-post" style="padding:12px 20px;font-size:0.85rem;flex-direction:column;gap:3px;"><span>Post-Test</span><span class="f-display" style="font-size:1.5rem;">${s.postAvg!==null?s.postAvg+'%':'—'}</span></div></div>`;
    }
    DOM.dashRecentSessions.innerHTML='';
    [...s.sessions].reverse().slice(0,5).forEach(ss=>{
      const el=document.createElement('div');
      el.style.cssText='display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:8px 12px;font-size:0.78rem;';
      const tl={pretest:'Pre',posttest:'Post',practice:'ฝึก',practice_topic:'ฝึกหัวข้อ',accessibility_voice:'เสียง',accessibility_physical_head:'ท่าทางศีรษะ',accessibility_physical_face:'ท่าทางใบหน้า'};
      const tc={pretest:'badge-pre',posttest:'badge-post',practice:'badge-practice',practice_topic:'badge-practice',accessibility_voice:'badge-pre',accessibility_physical_head:'badge-practice',accessibility_physical_face:'badge-practice'};
      const emo=ss.emotionSummary;
      const topEmo=emo?Object.entries(emo).sort((a,b)=>b[1]-a[1])[0]:null;
      const EMOICON={happy:'😊',excited:'🤩',focused:'🧐',anxious:'😟',neutral:'😐'};
      el.innerHTML=`<div style="display:flex;align-items:center;gap:6px;"><span style="font-weight:700;">${ss.playerName}</span><span style="color:#64748b;">(${ss.classroom})</span><span class="badge ${tc[ss.testType]||'badge-practice'}" style="font-size:0.62rem;padding:2px 7px;">${tl[ss.testType]||ss.testType}</span>${topEmo?`<span title="อารมณ์หลัก" style="font-size:0.9rem;">${EMOICON[topEmo[0]]||''}</span>`:''}</div><div style="text-align:right;"><span style="font-weight:700;color:#fcd34d;">${ss.score}pt</span><span style="color:#64748b;margin-left:8px;">${ss.accuracy}%</span></div>`;
      DOM.dashRecentSessions.appendChild(el);
    });
  }
  showLeaderboard(){
    const ss=ResearchStore.load(this.getOwnerId());DOM.leaderboardList.innerHTML='';
    if(!ss.length){DOM.leaderboardList.innerHTML='<p style="text-align:center;color:#64748b;padding:1.5rem 0;font-weight:600;">ยังไม่มีประวัติ</p>';DOM.leaderboardModal.classList.remove('hidden');return;}
    ss.sort((a,b)=>b.score-a.score).slice(0,10).forEach((s,i)=>{
      const el=document.createElement('div');
      el.style.cssText='display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;';
      const medals=['🥇','🥈','🥉'];
      el.innerHTML=`<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.2rem;width:26px;">${medals[i]||i+1}</span><div><p style="font-weight:700;font-size:0.9rem;">${s.playerName}</p><p style="font-size:0.72rem;color:#64748b;">${s.classroom} · ${s.testType}</p></div></div><div style="text-align:right;"><p class="f-display" style="font-size:1.3rem;color:#fcd34d;">${s.score}</p><p style="font-size:0.72rem;color:#64748b;">${s.accuracy}%</p></div>`;
      DOM.leaderboardList.appendChild(el);
    });
    DOM.leaderboardModal.classList.remove('hidden');
  }
  exportCSV(){ResearchStore.csv(this.getOwnerId());}
  requestClearLeaderboard(){DOM.customConfirmModal.classList.remove('hidden');}
  confirmClearLeaderboard(){ResearchStore.clear(this.getOwnerId());DOM.customConfirmModal.classList.add('hidden');alert('ล้างข้อมูลเรียบร้อยแล้ว');}
  // แก้ไข: ตอนกลับเมนูต้องปิดกล้องจริง ๆ (หยุด MediaStream) ไม่ใช่แค่ซ่อนหน้าจอ
  returnToMenu(){
    document.body.classList.remove('physical-mode','physical-head-mode','physical-face-mode');
    if(this.loopId){cancelAnimationFrame(this.loopId);this.loopId=null;}
    clearTimeout(this.cameraTimeoutId);
    this.state='menu';
    if(this.tracker){
      if(this.tracker.setGestureMode)this.tracker.setGestureMode('off');
      // ปิดทั้ง MediaStream และโมเดลเดิม เพื่อให้ผู้เล่นคนถัดไปสร้างกล้องชุดใหม่ได้แน่นอน
      if(this.tracker.dispose){ this.tracker.dispose().catch(()=>{}); }
      else this.tracker.stop();
    }
    DOM.camStatus.classList.remove('hidden');
    this._setCameraStatusUI('connecting');
    DOM.ui.classList.add('hidden');
    DOM.gameOverModal.classList.add('hidden');
    DOM.menu.classList.remove('hidden');
    this.currentMissionMeta=null;
    this.renderMissionHub();
  }
  async restartGame(){
    DOM.gameOverModal.classList.add('hidden');
    DOM.ui.classList.remove('hidden');
    const camOk=await this._connectCamera();
    if(!camOk)return;
    if(this.tracker?.setGestureMode)this.tracker.setGestureMode(this.physicalMode?this.physicalControl:'off');
    this.startSession();
  }
}

function bootFingerMath(){
  if(window.app)return;
  window.app=new GameManager();
  app.setupResponsiveMenu();
  // เบราว์เซอร์สมัยใหม่ต้องได้รับ gesture ก่อนจึงอนุญาต AudioContext และเสียงพูด
  const unlock=()=>app.unlockAudioSystems();
  document.addEventListener('pointerdown',unlock,{once:true,capture:true});
  document.addEventListener('keydown',unlock,{once:true,capture:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)app.unlockAudioSystems();});
  const studentSession=StudentSession.current();
  if(studentSession){
    const learner=LearnerStore.find(studentSession.ownerId,studentSession.learnerId);
    if(learner){
      app.selectedLearnerId=learner.id;DOM.startPlayerName.value=learner.name;DOM.startClassroom.value=learner.classroom==='—'?'':learner.classroom;
      app.onStudentAuthed(studentSession.ownerId,learner);
    }else{StudentSession.clear();DOM.screenAuth.classList.remove('hidden');DOM.menu.classList.add('hidden');app.setAuthRole('student');}
  }else{
    DOM.screenAuth.classList.remove('hidden');DOM.menu.classList.add('hidden');app.setAuthRole('parent');app.setAuthMode('login');
  }
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootFingerMath,{once:true});
}else{
  bootFingerMath();
}
window.addEventListener('load',bootFingerMath,{once:true});
