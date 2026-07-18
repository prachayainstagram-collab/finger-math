(function () {
  'use strict';
  const cfg = window.FM_CONFIG || {};
  const configured = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes('YOUR_PROJECT') && !cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE'));
  const client = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  const requireClient = () => { if (!client) throw new Error('Supabase ยังไม่ได้ตั้งค่าใน assets/js/config.js'); return client; };
  const currentUser = async () => {
    const { data, error } = await requireClient().auth.getUser();
    if (error) throw error;
    return data.user;
  };

  window.FMSupabase = {
    client, configured,
    ownerId(){ return this._ownerId || null; },
    async signUp({ name, email, password }) {
      if(String(password||'').length<6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      const { data, error } = await requireClient().auth.signUp({
        email, password,
        options: { data: { display_name: name, role: 'parent' } }
      });
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      if(!email || !password) throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
      const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await requireClient().auth.signOut();
      if (error) throw error;
    },
    async resetPassword(email) {
      const redirectTo = location.origin + location.pathname;
      const { error } = await requireClient().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    async getSession() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data.session || null;
    },
    async getProfile() {
      const user = await currentUser();
      if (!user) return null;
      this._ownerId = user.id;
      const { data, error } = await client.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
    async listStudents() {
      const { data, error } = await requireClient().from('students')
        .select('id,owner_id,student_code,full_name,classroom,grade_level,is_active,created_at')
        .eq('is_active', true).order('full_name');
      if (error) throw error;
      return data || [];
    },
    async listPublicStudents() {
      const { data, error } = await requireClient().rpc('list_active_students');
      if (error) throw error;
      return data || [];
    },
    async addStudent(student) { return this.createStudent(student); },
    async createStudent(student) {
      const { data, error } = await requireClient().rpc('create_student', {
        p_full_name: student.name,
        p_classroom: student.classroom || null,
        p_grade_level: student.gradeLevel || null,
        p_student_code: student.studentCode || null,
        p_pin: student.pin || null
      });
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    },
    async verifyStudentPin(studentId, pin) {
      const { data, error } = await requireClient().rpc('verify_student_pin', { p_student_id: studentId, p_pin: pin });
      if (error) throw error;
      return data && data[0] ? data[0] : null;
    },
    async deleteStudent(id) {
      const { error } = await requireClient().from('students').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    async listQuestions() {
      const { data, error } = await requireClient().from('questions').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async addQuestion(q) {
      const user = await currentUser();
      const { data, error } = await requireClient().from('questions').insert({
        owner_id: user.id, topic: Number(q.topic), difficulty: Number(q.difficulty),
        question_th: q.questionTh, question_en: q.questionEn || null,
        instruction_th: q.instructionTh || null, instruction_en: q.instructionEn || null,
        answer_value: Number(q.answer)
      }).select().single();
      if (error) throw error;
      return data;
    },
    async deleteQuestion(id) {
      const { error } = await requireClient().from('questions').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    async saveSession(session) {
      const user = await currentUser();
      if (!user) throw new Error('ต้องเข้าสู่ระบบก่อนบันทึกผลขึ้นคลาวด์');
      const row = {
        session_id: session.sessionId, owner_id: user.id, learner_id: session.learnerId || null,
        player_name: session.playerName, classroom: session.classroom || null,
        test_type: session.testType || null, difficulty: String(session.difficulty || ''),
        topic_filter: String(session.topicFilter || ''), total_questions: session.totalQuestions || 0,
        correct_count: session.correctCount || 0, wrong_count: session.wrongCount || 0,
        accuracy: session.accuracy || 0, score: session.score || 0,
        total_time_sec: session.totalTimeSec || 0, avg_response_time_sec: session.avgResponseTime || 0,
        expression_signal_summary: session.emotionSummary || {}, responses: session.responses || [],
        played_at: session.dateTime || new Date().toISOString()
      };
      const { data, error } = await requireClient().from('assessment_sessions').upsert(row).select().single();
      if (error) throw error;
      return data;
    },
    async syncLocalData() {
      const owner = (window.app && typeof window.app.getOwnerId === 'function') ? window.app.getOwnerId() : null;
      const sessions = (window.ResearchStore && owner) ? ResearchStore.load(owner) : [];
      for (const session of sessions) { try { await this.saveSession(session); } catch (e) { console.warn('sync session', e); } }
      return sessions.length;
    },
    async listSessions() {
      const { data, error } = await requireClient().from('assessment_sessions').select('*').order('played_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    onAuthStateChange(callback) {
      if (!client) return { data: { subscription: { unsubscribe(){} } } };
      return client.auth.onAuthStateChange(callback);
    }
  };
})();
