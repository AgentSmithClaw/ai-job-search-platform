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

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function renderList(elementId, items) {
  const element = document.getElementById(elementId);
  element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function setUserState(user) {
  document.getElementById('currentUser').textContent = user ? `${user.name} (${user.email})` : '未登录';
  document.getElementById('currentCredits').textContent = user ? `${user.credits}` : '0';
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
    historyList.innerHTML = '<article class="card"><p class="module-meta">还没有历史记录，先购买或使用一次分析。</p></article>';
    return;
  }
  historyList.innerHTML = items.map((item) => `
    <article class="card">
      <h3 class="module-title">${item.target_role}</h3>
      <p class="module-meta">匹配度 ${item.match_score} · ${item.created_at}</p>
      <p class="link-summary">${item.summary}</p>
      <p class="module-meta">消耗次数：${item.credits_used}</p>
    </article>
  `).join('');
}

function renderProviders(items) {
  providerCatalog.innerHTML = items.map((item) => `
    <article class="provider-card provider-card-stack">
      <strong>${item.name}</strong>
      <span>${item.role}</span>
      <p>${item.best_for.join(' / ')}</p>
    </article>
  `).join('');
}

function renderPricing(items) {
  pricingCatalog.innerHTML = items.map((item) => `
    <article class="provider-card pricing-card">
      <strong>${item.name}</strong>
      <span>¥${item.price_cny} / ${item.credits} 次</span>
      <p>${item.description}</p>
      <ul class="list">${item.includes.map((entry) => `<li>${entry}</li>`).join('')}</ul>
      <button class="button-link pricing-buy" data-package-code="${item.code}">购买并充值</button>
    </article>
  `).join('');

  document.querySelectorAll('.pricing-buy').forEach((button) => {
    button.addEventListener('click', () => purchasePackage(button.dataset.packageCode));
  });
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
  } catch (error) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUserState(null);
    authStatus.textContent = '登录状态失效，请重新注册 / 登录';
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
    const response = await fetch('/api/purchase', {
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

loadProviders();
loadPricing();
refreshProfile();
