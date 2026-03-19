const form = document.getElementById('analysisForm');
const authForm = document.getElementById('authForm');
const authBtn = document.getElementById('authBtn');
const submitBtn = document.getElementById('submitBtn');
const uploadBtn = document.getElementById('uploadBtn');
const resumeFileInput = document.getElementById('resumeFile');
const uploadStatus = document.getElementById('uploadStatus');
const formStatus = document.getElementById('formStatus');
const authStatus = document.getElementById('authStatus');
const resultSection = document.getElementById('resultSection');
const emptyState = document.getElementById('emptyState');
const historyList = document.getElementById('historyList');
const providerCatalog = document.getElementById('providerCatalog');
const pricingCatalog = document.getElementById('pricingCatalog');
const ACCESS_TOKEN_KEY = 'ai-job-search-access-token';
const DRAFT_KEY = 'ai-job-search-draft';
let currentSessionId = null;

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast ${type} show`;
  toast.textContent = message;
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function setLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="loading-spinner"></span>加载中...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function saveDraft() {
  const draft = {
    targetRole: document.getElementById('targetRole').value,
    resumeText: document.getElementById('resumeText').value,
    jobDescription: document.getElementById('jobDescription').value,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  showToast('草稿已保存', 'success');
}

function loadDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) {
    showToast('没有保存的草稿', 'error');
    return;
  }
  try {
    const draft = JSON.parse(saved);
    document.getElementById('targetRole').value = draft.targetRole || '';
    document.getElementById('resumeText').value = draft.resumeText || '';
    document.getElementById('jobDescription').value = draft.jobDescription || '';
    showToast('草稿已加载', 'success');
  } catch (e) {
    showToast('加载草稿失败', 'error');
  }
}

function logout() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.getElementById('currentUser').textContent = '未登录';
  document.getElementById('currentCredits').textContent = '0';
  document.getElementById('logoutBtn').hidden = true;
  document.getElementById('dashboardStats').hidden = true;
  document.getElementById('authStatus').textContent = '已退出登录';
  historyList.innerHTML = '<article class="card"><p class="module-meta">请先登录，再查看分析记录。</p></article>';
  showToast('已退出登录', 'info');
}

function showEditProfileModal() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    showToast('请先登录', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'editProfileModal';
  modal.innerHTML = `
    <div class="modal">
      <h3>编辑资料</h3>
      <form id="editProfileForm">
        <label>
          <span>昵称</span>
          <input id="editName" type="text" required />
        </label>
        <div class="modal-actions">
          <button type="button" class="button-link-secondary" onclick="closeModal()">取消</button>
          <button type="submit" class="button-link">保存</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('editName').value.trim();
    if (!name) return;
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Update failed');
      
      setUserState(data);
      showToast('资料已更新', 'success');
      closeModal();
    } catch (error) {
      showToast('更新失败: ' + error.message, 'error');
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) modal.remove();
}

function renderList(elementId, items) {
  const element = document.getElementById(elementId);
  element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function setUserState(user) {
  document.getElementById('currentUser').textContent = user ? `${user.name} (${user.email})` : '未登录';
  document.getElementById('currentCredits').textContent = user ? `${user.credits}` : '0';
  document.getElementById('logoutBtn').hidden = !user;
}

function renderGaps(gaps) {
  const container = document.getElementById('gapsList');
  container.innerHTML = gaps.map((gap) => `
    <article class="gap-card gap-${gap.severity}">
      <div class="gap-head">
        <span class="gap-badge">${gap.category}</span>
        <span class="gap-severity">${gap.severity}</span>
      </div>
      <h4>${gap.requirement}</h4>
      <p><strong>证据情况：</strong>${gap.evidence}</p>
      <p><strong>建议动作：</strong>${gap.recommendation}</p>
    </article>
  `).join('');
}

function renderSuggestions(suggestions) {
  const container = document.getElementById('resumeSuggestions');
  container.innerHTML = suggestions.map((item) => `
    <article class="suggestion-card">
      <p><strong>原始表达：</strong>${item.original}</p>
      <p><strong>优化表达：</strong>${item.optimized}</p>
      <p class="module-meta">${item.reason}</p>
    </article>
  `).join('');
}

function renderModelPlan(plan) {
  const container = document.getElementById('modelPlan');
  container.innerHTML = `
    <div class="provider-grid">
      <article class="provider-card"><strong>总控</strong><span>${plan.orchestrator}</span></article>
      <article class="provider-card"><strong>抽取</strong><span>${plan.extractor}</span></article>
      <article class="provider-card"><strong>写作</strong><span>${plan.writer}</span></article>
      <article class="provider-card"><strong>审校</strong><span>${plan.reviewer}</span></article>
    </div>
    <ul class="list">${plan.rationale.map((item) => `<li>${item}</li>`).join('')}</ul>
  `;
}

function renderReport(data) {
  emptyState.hidden = true;
  resultSection.hidden = false;
  currentSessionId = data.session_id;
  document.getElementById('matchScore').textContent = `${data.report.match_score}`;
  document.getElementById('summaryText').textContent = data.report.summary;
  document.getElementById('sessionMeta').textContent = `会话 #${data.session_id} · ${data.target_role}`;
  document.getElementById('routingMode').textContent = `路由模式：${data.routing_mode}`;
  document.getElementById('creditsRemaining').textContent = `剩余额度：${data.credits_remaining}`;
  document.getElementById('currentCredits').textContent = `${data.credits_remaining}`;
  renderList('strengthsList', data.report.strengths);
  renderList('risksList', data.report.risks);
  renderList('learningPlanList', data.report.learning_plan);
  renderList('interviewFocusList', data.report.interview_focus);
  renderList('nextActionsList', data.report.next_actions);
  renderGaps(data.report.gaps);
  renderSuggestions(data.report.resume_suggestions);
  renderModelPlan(data.report.recommended_model_plan);
  document.getElementById('resumeDraft').textContent = data.resume_draft;
}

function renderHistory(items) {
  if (!items.length) {
    historyList.innerHTML = '<article class="card" style="text-align:center;padding:32px;color:var(--muted)"><p>还没有分析历史记录</p></article>';
    return;
  }
  historyList.innerHTML = items.map((item) => `
    <article class="card history-card" data-session-id="${item.id}">
      <h3 style="margin-bottom:8px">${item.target_role}</h3>
      <div style="display:flex;gap:12px;align-items:center;margin:8px 0">
        <span style="background:var(--brand-soft);color:var(--brand);padding:4px 12px;border-radius:999px;font-size:0.85rem;font-weight:600">${item.match_score}%</span>
        <span style="color:var(--muted);font-size:0.85rem">${item.created_at}</span>
      </div>
      <p style="color:var(--muted);font-size:0.9rem">${item.summary.substring(0, 60)}...</p>
    </article>
  `).join('');

  document.querySelectorAll('.history-card').forEach((el) => {
    el.addEventListener('click', () => loadSession(el.dataset.sessionId));
  });
}

async function loadSession(sessionId) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('请先登录');
    return;
  }
  try {
    const response = await fetch(`/api/sessions/${sessionId}?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to load session');
    const data = await response.json();
    
    document.getElementById('targetRole').value = data.target_role;
    document.getElementById('resumeText').value = data.resume_text;
    document.getElementById('jobDescription').value = data.job_description;
    
    const report = JSON.parse(data.report_json);
    currentSessionId = data.id;
    
    emptyState.hidden = true;
    resultSection.hidden = false;
    document.getElementById('matchScore').textContent = `${report.match_score}`;
    document.getElementById('summaryText').textContent = report.summary;
    document.getElementById('sessionMeta').textContent = `会话 #${data.id} · ${data.target_role}`;
    document.getElementById('routingMode').textContent = `历史记录`;
    document.getElementById('creditsRemaining').textContent = `已存档`;
    renderList('strengthsList', report.strengths);
    renderList('risksList', report.risks);
    renderList('learningPlanList', report.learning_plan);
    renderList('interviewFocusList', report.interview_focus);
    renderList('nextActionsList', report.next_actions);
    renderGaps(report.gaps);
    renderSuggestions(report.resume_suggestions);
    renderModelPlan(report.recommended_model_plan);
    document.getElementById('resumeDraft').textContent = data.resume_draft;
  } catch (error) {
    alert('加载失败: ' + error.message);
  }
}

function renderProviders(items) {
  providerCatalog.innerHTML = items.map((item) => `
    <article class="provider-card">
      <strong style="color:var(--brand)">${item.name}</strong>
      <span style="color:var(--muted)">${item.role}</span>
      <p style="font-size:0.85rem;margin-top:8px">${item.best_for.join(' • ')}</p>
    </article>
  `).join('');
}

function renderPricing(items) {
  pricingCatalog.innerHTML = items.map((item) => `
    <article class="pricing-card">
      <h3 style="margin-bottom:8px">${item.name}</h3>
      <div class="price">¥${item.price_cny}<span> / ${item.credits}次</span></div>
      <p style="color:var(--muted);font-size:0.9rem;margin:12px 0">${item.description}</p>
      <ul style="list-style:none;text-align:left;font-size:0.85rem;margin:12px 0">
        ${item.includes.map((entry) => `<li style="padding:4px 0">✓ ${entry}</li>`).join('')}
      </ul>
      <button class="btn btn-primary pricing-buy" data-package-code="${item.code}" style="width:100%;margin-top:12px">购买</button>
    </article>
  `).join('');

  document.querySelectorAll('.pricing-buy').forEach((button) => {
    button.addEventListener('click', () => purchasePackage(button.dataset.packageCode));
  });
}

function renderApplications(items) {
  const container = document.getElementById('applicationList');
  if (!items.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:16px">还没有投递记录</p>';
    return;
  }
  const statusMap = {
    interested: '感兴趣',
    applied: '已投递',
    interviewing: '面试中',
    offer: '已拿到offer',
    rejected: '被拒',
    withdrawn: '已撤回',
  };
  container.innerHTML = items.map((app) => `
    <article class="application-card">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <strong style="font-size:1.05rem">${app.company_name}</strong>
          <span class="status-badge status-${app.status}">${statusMap[app.status] || app.status}</span>
        </div>
        <p style="color:var(--muted);font-size:0.9rem">${app.target_role}</p>
        ${app.salary_range ? `<p style="color:var(--brand);font-size:0.85rem;margin-top:4px">💰 ${app.salary_range}</p>` : ''}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <select onchange="updateApplicationStatus(${app.id}, this.value)" style="padding:6px;border-radius:8px;border:1px solid var(--line)">
          ${Object.entries(statusMap).map(([k, v]) => `<option value="${k}" ${app.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <button onclick="deleteApplication(${app.id})" class="btn btn-sm btn-outline">删除</button>
      </div>
    </article>
  `).join('');
}

function renderTasks(items) {
  const container = document.getElementById('taskList');
  if (!items.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:16px">还没有学习任务</p>';
    return;
  }
  const statusMap = { pending: '待开始', in_progress: '进行中', completed: '已完成' };
  container.innerHTML = items.map((task) => `
    <article class="task-card" style="border-left:4px solid ${task.priority === 'high' ? 'var(--accent)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)'}">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
          <strong>${task.title}</strong>
          <span class="status-badge status-${task.status}">${statusMap[task.status] || task.status}</span>
        </div>
        ${task.description ? `<p style="color:var(--muted);font-size:0.85rem">${task.description}</p>` : ''}
        ${task.target_date ? `<p style="color:var(--muted);font-size:0.8rem;margin-top:4px">📅 ${task.target_date}</p>` : ''}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <select onchange="updateTaskStatus(${task.id}, this.value)" style="padding:6px;border-radius:8px;border:1px solid var(--line)">
          ${Object.entries(statusMap).map(([k, v]) => `<option value="${k}" ${task.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-outline">删除</button>
      </div>
    </article>
  `).join('');
}

function renderPrep(items) {
  const container = document.getElementById('prepList');
  if (!items.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:16px">还没有面试准备</p>';
    return;
  }
  container.innerHTML = items.map((prep) => `
    <article class="prep-card">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <strong>Q: ${prep.question}</strong>
          <span class="status-badge status-${prep.status}">${prep.status === 'prepared' ? '已准备' : '待准备'}</span>
        </div>
        ${prep.ideal_answer ? `<p style="font-size:0.9rem;margin:8px 0;padding:8px;background:#f8fafc;border-radius:8px">💡 ${prep.ideal_answer}</p>` : ''}
        ${prep.notes ? `<p style="color:var(--muted);font-size:0.8rem">📝 ${prep.notes}</p>` : ''}
      </div>
    </article>
  `).join('');
}

async function refreshProfile() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    setUserState(null);
    historyList.innerHTML = '<article class="card"><p class="module-meta">请先登录，再查看分析记录。</p></article>';
    return;
  }

  try {
    const response = await fetch(`/api/auth/me?access_token=${encodeURIComponent(accessToken)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to load profile');
    setUserState(data);
    authStatus.textContent = '已登录';
    await loadHistory();
    await loadApplications();
    await loadTasks();
    await loadPrep();
    await loadDashboard();
  } catch (error) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUserState(null);
    authStatus.textContent = '登录状态失效，请重新注册 / 登录';
  }
}

async function loadDashboard() {
  const accessToken = getAccessToken();
  if (!accessToken) return;
  try {
    const response = await fetch(`/api/dashboard?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) return;
    const data = await response.json();
    document.getElementById('dashboardStats').hidden = false;
    document.getElementById('statAnalyses').textContent = data.stats.total_analyses;
    document.getElementById('statApplications').textContent = data.stats.total_applications;
    document.getElementById('statTasks').textContent = data.stats.total_tasks;
    document.getElementById('statSpent').textContent = data.stats.total_spent_cny;
    document.getElementById('statAvgMatch').textContent = data.stats.average_match_score;
  } catch (error) {
    console.log('Dashboard stats not available');
  }
}

async function loadHistory() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    historyList.innerHTML = '<article class="card"><p class="module-meta">请先登录，再查看分析记录。</p></article>';
    return;
  }
  try {
    const response = await fetch(`/api/sessions?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    renderHistory(data);
  } catch (error) {
    historyList.innerHTML = '<article class="card"><p class="module-meta">无法加载历史记录，请通过后端服务访问此页面。</p></article>';
  }
}

async function loadApplications() {
  const accessToken = getAccessToken();
  if (!accessToken) return;
  try {
    const response = await fetch(`/api/applications?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to fetch applications');
    const data = await response.json();
    renderApplications(data);
  } catch (error) {
    console.error('Failed to load applications:', error);
  }
}

async function loadTasks() {
  const accessToken = getAccessToken();
  if (!accessToken) return;
  try {
    const response = await fetch(`/api/learning-tasks?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    renderTasks(data);
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
}

async function loadPrep() {
  const accessToken = getAccessToken();
  if (!accessToken) return;
  try {
    const response = await fetch(`/api/interview-prep?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to fetch prep');
    const data = await response.json();
    renderPrep(data);
  } catch (error) {
    console.error('Failed to load prep:', error);
  }
}

async function loadProviders() {
  try {
    const response = await fetch('/api/providers');
    if (!response.ok) throw new Error('Failed to fetch providers');
    const data = await response.json();
    renderProviders(data.providers);
  } catch (error) {
    providerCatalog.innerHTML = '<p class="module-meta">模型工位加载失败，请通过后端服务访问。</p>';
  }
}

async function loadPricing() {
  try {
    const response = await fetch('/api/pricing');
    if (!response.ok) throw new Error('Failed to fetch pricing');
    const data = await response.json();
    renderPricing(data.packages);
  } catch (error) {
    pricingCatalog.innerHTML = '<p class="module-meta">套餐信息加载失败，请通过后端服务访问。</p>';
  }
}

async function purchasePackage(packageCode) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    authStatus.textContent = '请先注册 / 登录后再购买。';
    return;
  }

  authStatus.textContent = '正在充值额度...';
  try {
    const response = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, package_code: packageCode }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Purchase failed');
    authStatus.textContent = `已购买 ${data.package_name}，当前额度 ${data.credits_total}`;
    document.getElementById('currentCredits').textContent = `${data.credits_total}`;
    await refreshProfile();
  } catch (error) {
    authStatus.textContent = `购买失败：${error.message}`;
  }
}

async function updateApplicationStatus(id, status) {
  const accessToken = getAccessToken();
  try {
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, status }),
    });
    await loadApplications();
  } catch (error) {
    console.error('Failed to update application:', error);
  }
}

async function deleteApplication(id) {
  if (!confirm('确定要删除这条投递记录吗？')) return;
  const accessToken = getAccessToken();
  try {
    await fetch(`/api/applications/${id}?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'DELETE',
    });
    await loadApplications();
  } catch (error) {
    console.error('Failed to delete application:', error);
  }
}

async function updateTaskStatus(id, status) {
  const accessToken = getAccessToken();
  try {
    await fetch(`/api/learning-tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, status }),
    });
    await loadTasks();
  } catch (error) {
    console.error('Failed to update task:', error);
  }
}

async function deleteTask(id) {
  if (!confirm('确定要删除这个任务吗？')) return;
  const accessToken = getAccessToken();
  try {
    await fetch(`/api/learning-tasks/${id}?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'DELETE',
    });
    await loadTasks();
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authBtn.disabled = true;
  authStatus.textContent = '正在登录...';

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('userEmail').value.trim(),
        name: document.getElementById('userName').value.trim(),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Auth failed');
    setAccessToken(data.access_token);
    setUserState(data);
    authStatus.textContent = `登录成功，已赠送 ${data.credits} 次测试额度`;
    await loadHistory();
    await loadApplications();
    await loadTasks();
    await loadPrep();
  } catch (error) {
    authStatus.textContent = `登录失败：${error.message}`;
  } finally {
    authBtn.disabled = false;
  }
});

uploadBtn.addEventListener('click', async () => {
  const file = resumeFileInput.files?.[0];
  if (!file) {
    uploadStatus.textContent = '请先选择一个简历文件。';
    return;
  }

  uploadBtn.disabled = true;
  uploadStatus.textContent = '正在解析简历文件...';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    document.getElementById('resumeText').value = data.extracted_text;
    uploadStatus.textContent = `已解析 ${data.file_name}，共 ${data.char_count} 字，解析器：${data.parser}`;
  } catch (error) {
    uploadStatus.textContent = `上传失败：${error.message}`;
  } finally {
    uploadBtn.disabled = false;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    formStatus.textContent = '请先注册 / 登录。';
    return;
  }

  formStatus.textContent = '正在生成分析报告...';
  submitBtn.disabled = true;

  const payload = {
    access_token: accessToken,
    target_role: document.getElementById('targetRole').value.trim(),
    resume_text: document.getElementById('resumeText').value.trim(),
    job_description: document.getElementById('jobDescription').value.trim(),
  };

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to analyze');
    }

    renderReport(data);
    formStatus.textContent = '分析完成，可继续调整简历和 JD 再次生成。';
    await refreshProfile();
  } catch (error) {
    formStatus.textContent = `分析失败：${error.message}`;
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById('applicationForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('请先登录');
    return;
  }

  const payload = {
    access_token: accessToken,
    company_name: document.getElementById('appCompany').value.trim(),
    target_role: document.getElementById('appRole').value.trim(),
    job_description: document.getElementById('appDesc').value.trim(),
    application_url: document.getElementById('appUrl').value.trim(),
    salary_range: document.getElementById('appSalary').value.trim(),
    notes: document.getElementById('appNotes').value.trim(),
    status: 'interested',
  };

  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create application');
    document.getElementById('applicationForm').reset();
    await loadApplications();
  } catch (error) {
    alert('添加失败: ' + error.message);
  }
});

document.getElementById('taskForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('请先登录');
    return;
  }

  const payload = {
    access_token: accessToken,
    title: document.getElementById('taskTitle').value.trim(),
    description: document.getElementById('taskDesc').value.trim(),
    target_date: document.getElementById('taskDate').value || null,
    priority: document.getElementById('taskPriority').value,
  };

  try {
    const response = await fetch('/api/learning-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create task');
    document.getElementById('taskForm').reset();
    await loadTasks();
  } catch (error) {
    alert('添加失败: ' + error.message);
  }
});

document.getElementById('prepForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('请先登录');
    return;
  }

  const payload = {
    access_token: accessToken,
    question: document.getElementById('prepQuestion').value.trim(),
    ideal_answer: document.getElementById('prepAnswer').value.trim(),
    notes: document.getElementById('prepNotes').value.trim(),
  };

  try {
    const response = await fetch('/api/interview-prep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create prep');
    document.getElementById('prepForm').reset();
    await loadPrep();
  } catch (error) {
    alert('添加失败: ' + error.message);
  }
});

document.getElementById('exportDocx').addEventListener('click', async () => {
  if (!currentSessionId) return;
  const accessToken = getAccessToken();
  window.open(`/api/export/${currentSessionId}?access_token=${encodeURIComponent(accessToken)}&format=docx`, '_blank');
});

document.getElementById('exportPdf').addEventListener('click', async () => {
  if (!currentSessionId) return;
  const accessToken = getAccessToken();
  window.open(`/api/export/${currentSessionId}?access_token=${encodeURIComponent(accessToken)}&format=pdf`, '_blank');
});

document.getElementById('createTasksBtn').addEventListener('click', async () => {
  if (!currentSessionId) return;
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('请先登录');
    return;
  }

  const sessionId = currentSessionId;
  
  try {
    const response = await fetch(`/api/sessions/${sessionId}?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to load session');
    const data = await response.json();
    const report = JSON.parse(data.report_json);
    
    if (!report.learning_plan || !report.learning_plan.length) {
      alert('当前分析报告没有学习计划');
      return;
    }

    let created = 0;
    for (const plan of report.learning_plan) {
      const payload = {
        access_token: accessToken,
        title: plan,
        description: `基于 ${data.target_role} 分析报告创建`,
        session_id: sessionId,
        priority: 'medium',
      };
      
      const taskResponse = await fetch('/api/learning-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (taskResponse.ok) created++;
    }
    
    alert(`已创建 ${created} 个学习任务`);
    await loadTasks();
  } catch (error) {
    alert('创建失败: ' + error.message);
  }
});

document.getElementById('generateQuestionsBtn').addEventListener('click', async () => {
  if (!currentSessionId) {
    alert('请先生成分析报告');
    return;
  }
  const accessToken = getAccessToken();
  if (!accessToken) {
    alert('请先登录');
    return;
  }

  const btn = document.getElementById('generateQuestionsBtn');
  btn.disabled = true;
  btn.textContent = '生成中...';

  try {
    const sessionResponse = await fetch(`/api/sessions/${currentSessionId}?access_token=${encodeURIComponent(accessToken)}`);
    if (!sessionResponse.ok) throw new Error('Failed to load session');
    const sessionData = await sessionResponse.json();
    const report = JSON.parse(sessionData.report_json);

    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        session_id: currentSessionId,
        target_role: sessionData.target_role,
        resume_text: sessionData.resume_text,
        job_description: sessionData.job_description,
        gaps: report.gaps,
      }),
    });

    if (!response.ok) throw new Error('Failed to generate questions');
    const data = await response.json();

    let questionsText = '以下是生成的面试问题：\n\n';
    data.questions.forEach((q, i) => {
      questionsText += `${i + 1}. ${q}\n`;
    });
    
    for (const q of data.questions) {
      await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          question: q,
          session_id: currentSessionId,
        }),
      });
    }
    
    alert(`已生成 ${data.questions.length} 道面试题并添加到面试准备列表`);
    await loadPrep();
  } catch (error) {
    alert('生成失败: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '生成面试题';
  }
});

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
document.getElementById('loadDraftBtn').addEventListener('click', loadDraft);
document.getElementById('editProfileBtn').addEventListener('click', showEditProfileModal);

loadProviders();
loadPricing();
refreshProfile();