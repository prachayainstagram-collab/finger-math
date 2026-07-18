(function () {
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));

  function toast(message, ok=true) {
    const d=document.createElement("div");
    d.textContent=message;
    d.style.cssText=`position:fixed;right:18px;bottom:18px;z-index:9999;padding:12px 16px;border-radius:12px;color:white;font-weight:700;background:${ok?"#14945f":"#dc3f54"};box-shadow:0 12px 30px rgba(0,0,0,.25)`;
    document.body.appendChild(d); setTimeout(()=>d.remove(),2800);
  }

  function buildTeacherWorkspace() {
    const tab = $("tabTeacher");
    if (!tab || $("teacherDataWorkspace")) return;
    const wrap = document.createElement("section");
    wrap.id = "teacherDataWorkspace";
    wrap.innerHTML = `
      <div class="card" style="padding:18px;margin-top:16px">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
          <div><h3 style="font-size:1.1rem;font-weight:900">คลังโจทย์ของครู</h3>
          <p style="font-size:.78rem;color:#64748b">เพิ่มโจทย์ภาษาไทยและอังกฤษ แล้วบันทึกลง Supabase</p></div>
          <button id="fmSyncAll" class="btn btn-cyan"><i class="fa-solid fa-cloud-arrow-up"></i> ซิงก์ข้อมูลเดิม</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">
          <select id="qTopic" class="inp">
            <option value="1">การแทนจำนวนด้วยนิ้ว</option><option value="2">การบวก</option>
            <option value="3">การลบ</option><option value="4">การคูณ</option>
            <option value="5">การเปรียบเทียบ</option><option value="6">คู่ / คี่</option>
          </select>
          <select id="qDifficulty" class="inp"><option value="1">ง่าย</option><option value="2">ปานกลาง</option><option value="3">ยาก</option></select>
          <input id="qTh" class="inp" placeholder="โจทย์ภาษาไทย เช่น 3 + 2 = ?">
          <input id="qEn" class="inp" placeholder="English question, e.g. 3 + 2 = ?">
          <input id="qInstructionTh" class="inp" placeholder="คำสั่งภาษาไทย">
          <input id="qInstructionEn" class="inp" placeholder="English instruction">
          <input id="qAnswer" type="number" min="0" max="10" class="inp" placeholder="คำตอบตัวเลข">
          <button id="qSave" class="btn btn-primary"><i class="fa-solid fa-plus"></i> บันทึกโจทย์</button>
        </div>
        <div id="questionCloudList" style="display:grid;gap:8px;margin-top:14px"></div>
      </div>

      <div class="card" style="padding:18px;margin-top:16px">
        <h3 style="font-size:1.1rem;font-weight:900">อัปโหลดรายชื่อนักเรียน</h3>
        <p style="font-size:.78rem;color:#64748b;margin-bottom:12px">รองรับ CSV: student_code, full_name, classroom, grade_level หรือ ชื่อ, ห้อง</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <input id="studentCsvFile" type="file" accept=".csv,text/csv" class="inp" style="flex:1;min-width:220px">
          <button id="studentCsvImport" class="btn btn-green"><i class="fa-solid fa-file-import"></i> นำเข้ารายชื่อ</button>
          <button id="studentTemplate" class="btn btn-ghost"><i class="fa-solid fa-download"></i> ดาวน์โหลดตัวอย่าง CSV</button>
        </div>
        <div id="cloudStudentList" style="display:grid;gap:8px;margin-top:14px"></div>
      </div>`;
    tab.appendChild(wrap);

    $("qSave").onclick = saveQuestion;
    $("fmSyncAll").onclick = syncAll;
    $("studentCsvImport").onclick = importStudents;
    $("studentTemplate").onclick = downloadTemplate;
    refreshCloud();
  }

  async function saveQuestion() {
    const q = {
      topic:$("qTopic").value, difficulty:$("qDifficulty").value,
      questionTh:$("qTh").value.trim(), questionEn:$("qEn").value.trim(),
      instructionTh:$("qInstructionTh").value.trim(), instructionEn:$("qInstructionEn").value.trim(),
      answer:$("qAnswer").value
    };
    if (!q.questionTh || q.answer === "") return toast("กรอกโจทย์ภาษาไทยและคำตอบก่อน", false);
    try {
      if (!FMSupabase.configured) throw new Error("กรุณาใส่ Supabase URL และ anon key ใน assets/js/config.js");
      await FMSupabase.addQuestion(q);
      ["qTh","qEn","qInstructionTh","qInstructionEn","qAnswer"].forEach(id=>$(id).value="");
      toast("บันทึกโจทย์แล้ว"); refreshCloud();
    } catch(e) { toast(e.message || "บันทึกไม่สำเร็จ", false); }
  }

  async function syncAll() {
    try { await FMSupabase.syncLocalData(); toast("ซิงก์ข้อมูลเดิมขึ้น Supabase แล้ว"); refreshCloud(); }
    catch(e) { toast(e.message, false); }
  }

  function parseCSV(text) {
    const rows=[]; let row=[], cell="", quote=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i], next=text[i+1];
      if(ch=='"' && quote && next=='"'){cell+='"';i++;}
      else if(ch=='"'){quote=!quote;}
      else if(ch==',' && !quote){row.push(cell.trim());cell="";}
      else if((ch=='\n'||ch=='\r') && !quote){if(ch=='\r'&&next=='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell="";}
      else cell+=ch;
    }
    if(cell||row.length){row.push(cell.trim());rows.push(row);}
    return rows;
  }

  async function importStudents() {
    const file=$("studentCsvFile").files[0];
    if(!file)return toast("กรุณาเลือกไฟล์ CSV",false);
    try{
      const rows=parseCSV(await file.text());
      if(rows.length<2)throw new Error("ไฟล์ไม่มีข้อมูลนักเรียน");
      const header=rows[0].map(x=>x.toLowerCase().replace(/\s/g,""));
      const col=(names)=>header.findIndex(h=>names.includes(h));
      const nameIdx=col(["full_name","fullname","name","ชื่อ","ชื่อนักเรียน"]);
      const classIdx=col(["classroom","class","ห้อง","ห้องเรียน"]);
      const codeIdx=col(["student_code","studentcode","รหัส","รหัสนักเรียน"]);
      const gradeIdx=col(["grade_level","grade","ระดับชั้น"]);
      if(nameIdx<0)throw new Error("ไม่พบคอลัมน์ชื่อ/full_name");
      let count=0;
      for(const r of rows.slice(1)){
        const name=(r[nameIdx]||"").trim();if(!name)continue;
        const student={
          id:"STU-"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase(),
          name, classroom:(classIdx>=0?r[classIdx]:"")||"—",
          studentCode:codeIdx>=0?r[codeIdx]:"", gradeLevel:gradeIdx>=0?r[gradeIdx]:""
        };
        if(typeof LearnerStore!=="undefined"){
          const owner=FMSupabase.ownerId(), data=LearnerStore.load();
          data[owner]=data[owner]||[]; data[owner].push({id:student.id,name:student.name,classroom:student.classroom,createdAt:new Date().toISOString()});
          LearnerStore.save(data);
        }
        if(FMSupabase.configured)await FMSupabase.addStudent(student);
        count++;
      }
      if(window.app){app.renderRoster?.();app.populateTeacherStudentSelect?.();}
      toast(`นำเข้าสำเร็จ ${count} คน`);refreshCloud();
    }catch(e){toast(e.message||"นำเข้าไม่สำเร็จ",false);}
  }

  function downloadTemplate(){
    const csv="\uFEFFstudent_code,full_name,classroom,grade_level\n001,ด.ช.ตัวอย่าง ใจดี,ป.2/1,ป.2\n002,ด.ญ.ตัวอย่าง เรียนดี,ป.2/1,ป.2\n";
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download="student-template.csv";a.click();URL.revokeObjectURL(a.href);
  }

  async function refreshCloud(){
    if(!window.FMSupabase?.configured){
      const q=$("questionCloudList"),s=$("cloudStudentList");
      if(q)q.innerHTML='<div style="color:#b45309;font-size:.8rem">ยังไม่ได้ตั้งค่า Supabase ใน assets/js/config.js</div>';
      if(s)s.innerHTML='';
      return;
    }
    try{
      const [qs,ss]=await Promise.all([FMSupabase.listQuestions(),FMSupabase.listStudents()]);
      $("questionCloudList").innerHTML=qs.length?qs.map(q=>`<div class="roster-item"><div><b>${escapeHtml(q.question_th)}</b><div style="font-size:.72rem;color:#64748b">${escapeHtml(q.question_en||"")} · คำตอบ ${q.answer_value}</div></div><button class="btn btn-red" data-q-delete="${q.id}">ลบ</button></div>`).join(""):'<div style="font-size:.8rem;color:#64748b">ยังไม่มีโจทย์ในคลัง</div>';
      $("cloudStudentList").innerHTML=ss.length?ss.map(s=>`<div class="roster-item"><div><b>${escapeHtml(s.full_name)}</b><div style="font-size:.72rem;color:#64748b">${escapeHtml(s.student_code||"—")} · ${escapeHtml(s.classroom||"—")}</div></div></div>`).join(""):'<div style="font-size:.8rem;color:#64748b">ยังไม่มีรายชื่อนักเรียนใน Supabase</div>';
      document.querySelectorAll("[data-q-delete]").forEach(b=>b.onclick=async()=>{await FMSupabase.deleteQuestion(b.dataset.qDelete);toast("ลบโจทย์แล้ว");refreshCloud();});
    }catch(e){toast(e.message||"โหลดข้อมูลไม่สำเร็จ",false);}
  }

  document.addEventListener("DOMContentLoaded",()=>setTimeout(buildTeacherWorkspace,150));
  window.addEventListener("load",()=>setTimeout(buildTeacherWorkspace,300));
})();
