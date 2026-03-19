const form = document.getElementById('analysisForm');
const authForm = document.getElementById('authForm');
const authBtn = document.getElementById('authBtn');
const submitBtn = document.getElementById('submitBtn');
const uploadBtn = document.getElementById('uploadBtn');

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (response.status >= 500) {
      const reqId = response.headers.get('X-Request-ID') || '';
      const errEl = document.getElementById('globalError');
      const errText = document.getElementById('globalErrorText');
      const errId = document.getElementById('globalErrorId');
      errText.textContent = '服务器出错，请稍后重试';
      errId.textContent = reqId ? `Request ID: ${reqId}` : '';
      errEl.style.display = 'block';
    }
    return response;
  } catch (networkError) {
    if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
      showToast('网络连接失败，请检查网络后重试', 'error');
    }
    throw networkError;
  }
}

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    document.getElementById('darkModeToggle').textContent = '🌙 深色';
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    document.getElementById('darkModeToggle').textContent = '☀️ 浅色';
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.textContent = '☀️ 浅色';
  }
}

function dismissOnboarding() {
  localStorage.setItem('onboarding_seen', '1');
  const panel = document.getElementById('onboardingPanel');
  if (panel) panel.style.display = 'none';
}

function initOnboarding() {
  if (localStorage.getItem('onboarding_seen')) return;
  const panel = document.getElementById('onboardingPanel');
  if (panel) panel.style.display = 'block';
}
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
let _historyItems = [];
let _historySortOrder = 'newest';
let _historySearchQuery = '';
let _historyOffset = 0;
let _historyTotal = 0;
let _duplicateData = null;

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
  setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

function scrollToAnalysis() {
  document.getElementById('targetRole').scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('targetRole').focus();
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
  const credits = user ? user.credits : 0;
  document.getElementById('currentCredits').textContent = `${credits}`;
  document.getElementById('logoutBtn').hidden = !user;
  const lowBadge = document.getElementById('creditsLowBadge');
  if (lowBadge) {
    lowBadge.hidden = credits >= 2;
  }
  const creditsWarn = document.getElementById('creditsWarn');
  if (creditsWarn) {
    if (credits === 1) {
      creditsWarn.textContent = '⚠️ 仅剩 1 次额度，分析后请及时充值';
      creditsWarn.style.display = 'block';
    } else if (credits === 0) {
      creditsWarn.textContent = '⚠️ 额度已用完，请先充值';
      creditsWarn.style.display = 'block';
    } else {
      creditsWarn.style.display = 'none';
    }
  }
}

function renderGaps(gaps) {
  const container = document.getElementById('gapsList');
  const typeLabels = {
    expression: '表达',
    evidence_missing: '证据缺失',
    skill_gap: '技能差距',
    project_gap: '项目差距',
    unknown: '其他',
  };
  container.innerHTML = gaps.map((gap, idx) => `
    <article class="gap-card gap-${gap.severity}">
      <div class="gap-head">
        <span class="gap-badge">${gap.category}</span>
        <span class="gap-type-badge gap-type-${gap.gap_type || 'unknown'}">${typeLabels[gap.gap_type] || gap.gap_type || '其他'}</span>
        <span class="gap-severity">${gap.severity}</span>
        <button onclick="copyGapItem(${idx})" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--muted);font-size:0.75rem;padding:2px 6px;border:1px solid var(--line);border-radius:6px">📋 复制</button>
      </div>
      <h4>${gap.requirement}</h4>
      <p><strong>证据情况：</strong>${gap.evidence}</p>
      <p><strong>建议动作：</strong>${gap.recommendation}</p>
    </article>
  `).join('');

  window._gapsData = gaps;
}

window.copyGapItem = async function(idx) {
  const gaps = window._gapsData;
  if (!gaps || !gaps[idx]) return;
  const gap = gaps[idx];
  const text = `【${gap.category}】${gap.requirement}\n证据：${gap.evidence}\n建议：${gap.recommendation}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制到剪贴板', 'success');
  } catch {
    showToast('复制失败', 'error');
  }
};

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

function renderValidation(validation) {
  if (!validation) return;
  const card = document.getElementById('validationCard');
  if (!card) return;
  card.hidden = false;

  document.getElementById('confidenceScore').textContent = validation.confidence;

  const warnEl = document.getElementById('overclaimWarning');
  warnEl.hidden = !validation.overclaim_warning;

  const criticalEl = document.getElementById('criticalGaps');
  if (validation.critical_gaps && validation.critical_gaps.length) {
    criticalEl.hidden = false;
    criticalEl.innerHTML = `<p style="font-size:0.8rem;font-weight:600;margin-bottom:6px;color:var(--accent)">🔴 关键缺口：</p>` +
      validation.critical_gaps.map(g => `<div class="val-item">${g}</div>`).join('');
  } else {
    criticalEl.hidden = true;
  }

  const cautionEl = document.getElementById('cautionNotes');
  if (validation.caution_notes && validation.caution_notes.length) {
    cautionEl.hidden = false;
    cautionEl.innerHTML = `<p style="font-size:0.8rem;font-weight:600;margin-bottom:6px;color:var(--warning)">⚡ 注意事项：</p>` +
      validation.caution_notes.map(n => `<div class="val-item">${n}</div>`).join('');
  } else {
    cautionEl.hidden = true;
  }
}

function renderReport(data) {
  emptyState.hidden = true;
  resultSection.hidden = false;
  const loadingEl = document.getElementById('analysisLoading');
  if (loadingEl) loadingEl.style.display = 'none';
  currentSessionId = data.session_id;
  const score = data.report.match_score;
  const scoreEl = document.getElementById('matchScore');
  scoreEl.textContent = `${score}`;
  scoreEl.style.color = score < 40 ? 'var(--accent)' : score < 70 ? 'var(--warning)' : 'var(--success)';
  document.getElementById('summaryText').textContent = data.report.summary;
  const reportDate = data.created_at ? data.created_at.replace('T', ' ').replace('Z', '') : '';
  const reportRelative = relativeTime(data.created_at);
  document.getElementById('sessionMeta').textContent = `会话 #${data.session_id} · ${data.target_role}${reportDate ? ' · ' + reportDate + (reportRelative ? ' (' + reportRelative + ')' : '') : ''}`;

  if (data.created_at) {
    const created = new Date(data.created_at);
    const now = new Date();
    const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (daysOld > 30) {
      const oldWarning = document.getElementById('reportOldWarning') || (() => {
        const el = document.createElement('div');
        el.id = 'reportOldWarning';
        el.style.cssText = 'background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:8px 14px;border-radius:10px;font-size:0.85rem;margin-top:8px';
        document.getElementById('sessionMeta').parentElement?.appendChild(el);
        return el;
      })();
      oldWarning.textContent = `⚠️ 此报告已生成 ${daysOld} 天，岗位要求可能已更新，建议重新分析`;
      oldWarning.hidden = false;
    } else {
      const oldWarning = document.getElementById('reportOldWarning');
      if (oldWarning) oldWarning.hidden = true;
    }
  }
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
  renderValidation(data.report.validation);
  document.getElementById('resumeDraft').textContent = data.resume_draft;
}

function renderHistory(items, sortOrder = 'newest', searchQuery = '') {
  _historyItems = items.slice();
  _historySortOrder = sortOrder;
  _historySearchQuery = searchQuery;

  let display = _historyItems.slice();
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    display = display.filter(item => item.target_role.toLowerCase().includes(q));
  }
  if (sortOrder === 'oldest') {
    display.reverse();
  }
  const badge = document.getElementById('historyCountBadge');
  if (badge) {
    badge.textContent = _historyItems.length;
    badge.style.display = _historyItems.length > 0 ? 'inline-block' : 'none';
  }
  if (!display.length) {
    historyList.innerHTML = '<article class="card" style="text-align:center;padding:32px;color:var(--muted)"><p>没有匹配的分析记录</p></article>';
    return;
  }
  historyList.innerHTML = display.map((item) => {
    const s = item.match_score;
    const badgeColor = s < 40 ? 'var(--accent)' : s < 70 ? 'var(--warning)' : 'var(--success)';
    const badgeBg = s < 40 ? '#fee2e2' : s < 70 ? '#fef3c7' : '#d1fae5';
    const relTime = relativeTime(item.created_at);
    const fullDate = item.created_at ? item.created_at.replace('T', ' ').replace('Z', '') : '';
    return `
    <article class="card history-card" data-session-id="${item.id}">
      <h3 style="margin-bottom:8px">${item.target_role}</h3>
      <div style="display:flex;gap:12px;align-items:center;margin:8px 0">
        <span style="background:${badgeBg};color:${badgeColor};padding:4px 12px;border-radius:999px;font-size:0.85rem;font-weight:600">${item.match_score}%</span>
        <span style="color:var(--muted);font-size:0.85rem" title="${fullDate}">${relTime}</span>
      </div>
      <p style="color:var(--muted);font-size:0.9rem">${item.summary.substring(0, 60)}...</p>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();duplicateSession('${item.id}')">📋 复用</button>
      </div>
    </article>
  `}).join('');

  document.querySelectorAll('.history-card').forEach((el) => {
    el.addEventListener('click', () => loadSession(el.dataset.sessionId));
  });

  const loadMoreEl = document.getElementById('historyLoadMore');
  if (loadMoreEl) {
    loadMoreEl.style.display = _historyOffset + display.length < _historyTotal ? 'block' : 'none';
  }
}

function sortHistory(order) {
  renderHistory(_historyItems, order, _historySearchQuery);
}

function filterHistory(query) {
  renderHistory(_historyItems, _historySortOrder, query);
  if (query.trim()) {
    const key = 'recent_searches';
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (!saved.includes(query.trim())) {
      saved.unshift(query.trim());
      localStorage.setItem(key, JSON.stringify(saved.slice(0, 5)));
    }
    updateRecentSearchesDatalist();
  }
}

function updateRecentSearchesDatalist() {
  const saved = JSON.parse(localStorage.getItem('recent_searches') || '[]');
  const datalist = document.getElementById('recentSearches');
  if (!datalist) return;
  datalist.innerHTML = saved.map(s => `<option value="${s.replace(/"/g, '&quot;')}">`).join('');
}

const debouncedFilterHistory = debounce(filterHistory, 300);

async function duplicateSession(sessionId) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    showToast('请先登录', 'error');
    return;
  }
  try {
    const response = await fetch(`/api/sessions/${sessionId}?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to load session');
    const data = await response.json();
    document.getElementById('targetRole').value = data.target_role;
    document.getElementById('resumeText').value = data.resume_text;
    document.getElementById('jobDescription').value = data.job_description;
    scrollToAnalysis();
    showToast('已复用历史数据，请检查后提交分析', 'info');
  } catch (error) {
    showToast('复用失败：' + error.message, 'error');
  }
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
    _duplicateData = {
      target_role: data.target_role,
      resume_text: data.resume_text,
      job_description: data.job_description,
    };
    document.getElementById('targetRole').value = data.target_role;
    document.getElementById('resumeText').value = data.resume_text;
    document.getElementById('jobDescription').value = data.job_description;
    
    const report = JSON.parse(data.report_json);
    currentSessionId = data.id;
    
    emptyState.hidden = true;
    resultSection.hidden = false;
    const score = report.match_score;
    const scoreEl = document.getElementById('matchScore');
    scoreEl.textContent = `${score}`;
    scoreEl.style.color = score < 40 ? 'var(--accent)' : score < 70 ? 'var(--warning)' : 'var(--success)';
    document.getElementById('summaryText').textContent = report.summary;
    const reportDate = data.created_at ? data.created_at.replace('T', ' ').replace('Z', '') : '';
    const reportRelative = relativeTime(data.created_at);
    document.getElementById('sessionMeta').textContent = `会话 #${data.id} · ${data.target_role}${reportDate ? ' · ' + reportDate + (reportRelative ? ' (' + reportRelative + ')' : '') : ''}`;
    document.getElementById('routingMode').textContent = `历史记录`;
    document.getElementById('creditsRemaining').textContent = `已存档`;

    if (data.created_at) {
      const created = new Date(data.created_at);
      const now = new Date();
      const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (daysOld > 30) {
        const oldWarning = document.getElementById('reportOldWarning') || (() => {
          const el = document.createElement('div');
          el.id = 'reportOldWarning';
          el.style.cssText = 'background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:8px 14px;border-radius:10px;font-size:0.85rem;margin-top:8px';
          document.getElementById('sessionMeta').parentElement?.appendChild(el);
          return el;
        })();
        oldWarning.textContent = `⚠️ 此报告已生成 ${daysOld} 天，岗位要求可能已更新，建议重新分析`;
        oldWarning.hidden = false;
      } else {
        const oldWarning = document.getElementById('reportOldWarning');
        if (oldWarning) oldWarning.hidden = true;
      }
    }
    renderList('strengthsList', report.strengths);
    renderList('risksList', report.risks);
    renderList('learningPlanList', report.learning_plan);
    renderList('interviewFocusList', report.interview_focus);
    renderList('nextActionsList', report.next_actions);
    renderGaps(report.gaps);
    renderSuggestions(report.resume_suggestions);
    renderModelPlan(report.recommended_model_plan);
    renderValidation(report.validation);
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
  pricingCatalog.innerHTML = items.map((item, idx) => `
    <article class="pricing-card ${idx === 1 ? 'pricing-popular' : ''}">
      ${idx === 1 ? '<div class="popular-badge">最受欢迎</div>' : ''}
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  container.innerHTML = items.map((task) => {
    let deadlineWarning = '';
    if (task.target_date && task.status !== 'completed') {
      const due = new Date(task.target_date);
      due.setHours(0, 0, 0, 0);
      const daysUntil = Math.floor((due - today) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) deadlineWarning = '<span style="color:var(--accent);font-size:0.8rem"> 已逾期</span>';
      else if (daysUntil <= 3) deadlineWarning = `<span style="color:var(--warning);font-size:0.8rem"> ${daysUntil === 0 ? '今天' : daysUntil + '天后'}截止</span>`;
    }
    return `
    <article class="task-card" style="border-left:4px solid ${task.priority === 'high' ? 'var(--accent)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)'}">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
          <strong>${task.title}${deadlineWarning}</strong>
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
  `}).join('');
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
    document.getElementById('statAnalysesWeek').textContent = data.stats.analyses_this_week || 0;
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
  _historyOffset = 0;
  try {
    const response = await fetch(`/api/sessions?access_token=${encodeURIComponent(accessToken)}&offset=0&limit=20`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    _historyTotal = data.total || 0;
    const sortOrder = document.getElementById('historySort')?.value || 'newest';
    const searchQuery = document.getElementById('historySearch')?.value || '';
    renderHistory(data.items || data, sortOrder, searchQuery);
  } catch (error) {
    historyList.innerHTML = '<article class="card"><p class="module-meta">无法加载历史记录，请通过后端服务访问此页面。</p></article>';
  }
}

async function loadMoreHistory() {
  const accessToken = getAccessToken();
  if (!accessToken || _historyOffset >= _historyTotal) return;
  const nextOffset = _historyOffset + 20;
  try {
    const response = await fetch(`/api/sessions?access_token=${encodeURIComponent(accessToken)}&offset=${nextOffset}&limit=20`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    _historyOffset = nextOffset;
    const sortOrder = document.getElementById('historySort')?.value || 'newest';
    const searchQuery = document.getElementById('historySearch')?.value || '';
    const allItems = [..._historyItems, ...(data.items || data)];
    renderHistory(allItems, sortOrder, searchQuery);
  } catch (error) {
    showToast('加载更多失败', 'error');
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

  authStatus.textContent = '正在跳转支付页面...';
  try {
    const response = await fetch('/api/payment/create-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, package_code: packageCode }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to create checkout');

    if (data.checkout_url && !data.checkout_url.includes('/mock/')) {
      localStorage.setItem('pending_order_' + data.order_id, JSON.stringify({
        package_code: packageCode,
        created_at: new Date().toISOString()
      }));
      window.location.href = data.checkout_url;
    } else {
      authStatus.textContent = `已购买（Mock），当前额度 ${data.credits_total || '?'}`;
      await refreshProfile();
    }
  } catch (error) {
    authStatus.textContent = `购买失败：${error.message}`;
  }
}

function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const orderId = params.get('order_id');
  const url = window.location.pathname;

  if (url === '/payment/cancel') {
    params.delete('order_id');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', newUrl);
    showToast('支付已取消，订单未完成', 'info');
    return;
  }

  if (sessionId || orderId) {
    params.delete('session_id');
    params.delete('order_id');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState(null, '', newUrl);
    showToast('支付成功！正在刷新额度...', 'success');
    setTimeout(() => refreshProfile(), 1500);
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
    document.getElementById('targetRole').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('targetRole').focus();
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
    const response = await safeFetch('/api/resume/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    document.getElementById('resumeText').value = data.extracted_text;
    uploadStatus.textContent = `已解析 ${data.file_name}，共 ${data.char_count} 字，解析器：${data.parser}`;
    if (data.extracted_text.length >= 20) {
      document.getElementById('targetRole').scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('targetRole').focus();
    }
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
    document.getElementById('authForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const credits = parseInt(document.getElementById('currentCredits').textContent, 10);
  if (credits <= 0) {
    formStatus.textContent = '额度不足，请先充值。';
    document.getElementById('pricingCatalog').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const resumeText = document.getElementById('resumeText').value.trim();
  if (resumeText.length < 50) {
    formStatus.textContent = '简历内容过短（至少50字），请粘贴更完整的简历';
    formStatus.style.color = 'var(--warning)';
    return;
  }

  const jobDesc = document.getElementById('jobDescription').value.trim();
  if (jobDesc.length < 30) {
    formStatus.textContent = '职位描述过短（至少30字），请粘贴更完整的JD';
    formStatus.style.color = 'var(--warning)';
    return;
  }

  formStatus.textContent = '正在生成分析报告...';
  submitBtn.disabled = true;
  const loadingEl = document.getElementById('analysisLoading');
  const contentEl = document.getElementById('analysisContent');
  if (loadingEl) loadingEl.style.display = 'block';
  if (contentEl) contentEl.hidden = true;

  const payload = {
    access_token: accessToken,
    target_role: document.getElementById('targetRole').value.trim(),
    resume_text: resumeText,
    job_description: jobDesc,
  };

  try {
    const response = await safeFetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to analyze');
    }

    renderReport(data);
    clearDraftFromSession();
    formStatus.textContent = '分析完成，可继续调整简历和 JD 再次生成。';
    formStatus.style.color = 'var(--success)';
    await refreshProfile();
  } catch (error) {
    formStatus.textContent = `分析失败：${error.message}`;
    formStatus.style.color = 'var(--accent)';
  } finally {
    submitBtn.disabled = false;
    const loadingEl = document.getElementById('analysisLoading');
    if (loadingEl) loadingEl.style.display = 'none';
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

document.getElementById('shareReportBtn').addEventListener('click', async () => {
  if (!currentSessionId) return;
  const accessToken = getAccessToken();
  try {
    const response = await safeFetch(`/api/sessions/${currentSessionId}?access_token=${encodeURIComponent(accessToken)}`);
    if (!response.ok) throw new Error('Failed to load');
    const data = await response.json();
    const report = JSON.parse(data.report_json);
    const shareText = `【AI 求职分析】${data.target_role}\n匹配度：${report.match_score}%\n优势：${report.strengths.slice(0, 3).join('；')}\n主要差距：${report.gaps.slice(0, 3).map(g => g.requirement).join('；')}\n——由 AI Job Search Platform 生成`;
    await navigator.clipboard.writeText(shareText);
    showToast('分析摘要已复制到剪贴板，可直接粘贴分享', 'success');
  } catch (error) {
    showToast('分享复制失败：' + error.message, 'error');
  }
});

async function copyResumeDraft() {
  const text = document.getElementById('resumeDraft').textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('简历草稿已复制到剪贴板', 'success');
  } catch {
    showToast('复制失败，请手动选择文本复制', 'error');
  }
}

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

    const count = report.learning_plan.length;
    if (!confirm(`将根据学习计划创建 ${count} 个任务，是否继续？`)) return;

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

document.getElementById('resumeText').addEventListener('input', function () {
  const count = this.value.length;
  const el = document.getElementById('resumeCharCount');
  el.textContent = count > 0 ? `（${count} 字）` : '';
  saveDraftImmediate('resumeText', this.value);
});

document.getElementById('targetRole').addEventListener('input', function () {
  saveDraftImmediate('targetRole', this.value);
});

document.getElementById('jobDescription').addEventListener('input', function () {
  saveDraftImmediate('jobDescription', this.value);
});

function saveDraftImmediate(field, value) {
  const draft = JSON.parse(sessionStorage.getItem('draft_inprogress') || '{}');
  draft[field] = value;
  draft._saved = new Date().toISOString();
  sessionStorage.setItem('draft_inprogress', JSON.stringify(draft));
}

function restoreDraftFromSession() {
  const draft = JSON.parse(sessionStorage.getItem('draft_inprogress') || '{}');
  if (!draft._saved) return;
  if (draft.targetRole && !document.getElementById('targetRole').value) {
    document.getElementById('targetRole').value = draft.targetRole || '';
  }
  if (draft.resumeText && !document.getElementById('resumeText').value) {
    document.getElementById('resumeText').value = draft.resumeText || '';
    const el = document.getElementById('resumeCharCount');
    if (el) el.textContent = draft.resumeText.length > 0 ? `（${draft.resumeText.length} 字）` : '';
  }
  if (draft.jobDescription && !document.getElementById('jobDescription').value) {
    document.getElementById('jobDescription').value = draft.jobDescription || '';
  }
}

function clearDraftFromSession() {
  sessionStorage.removeItem('draft_inprogress');
}

function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const active = document.activeElement;
    if (active && (active.id === 'resumeText' || active.id === 'jobDescription')) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    const active = document.activeElement;
    if (active && active.closest('#analysisForm')) {
      e.preventDefault();
      saveDraft();
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    const active = document.activeElement;
    if (active && active.closest('#analysisForm')) {
      e.preventDefault();
      loadDraft();
    }
  }
  if (e.key === 'Escape') {
    const panel = document.getElementById('shortcutsPanel');
    if (panel) panel.hidden = true;
  }
});

function toggleShortcuts() {
  const panel = document.getElementById('shortcutsPanel');
  if (panel) panel.hidden = !panel.hidden;
}

initTheme();
initOnboarding();
updateRecentSearchesDatalist();
restoreDraftFromSession();
loadProviders();
loadPricing();
refreshProfile();
handlePaymentReturn();

setInterval(() => {
  const token = getAccessToken();
  if (!token) return;
  const targetRole = document.getElementById('targetRole')?.value?.trim();
  const resumeText = document.getElementById('resumeText')?.value?.trim();
  const jobDesc = document.getElementById('jobDescription')?.value?.trim();
  if (targetRole || resumeText || jobDesc) {
    const draft = { targetRole, resumeText, jobDesc, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }
}, 30000);