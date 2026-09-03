const apiBase = '/api/classroom/v1';

const phaseDefaults = {
  rust: { title: 'Rust', card: document.querySelector('#phase-rust') },
  rcore: { title: 'rCore', card: document.querySelector('#phase-rcore') },
};

const signedOutView = document.querySelector('#signed-out-view');
const signedInView = document.querySelector('#signed-in-view');
const loginLink = document.querySelector('#github-login');
const loginName = document.querySelector('#github-login-name');
const logoutButton = document.querySelector('#logout-button');
const notice = document.querySelector('#notice');
const noticeCopy = document.querySelector('#notice-copy');
const recreateDialog = document.querySelector('#recreate-dialog');
const recreateForm = document.querySelector('#recreate-form');
const recreateRepositoryName = document.querySelector(
  '#recreate-repository-name',
);
const recreateConfirmation = document.querySelector('#recreate-confirmation');
const recreateConfirm = document.querySelector('#recreate-confirm');
const recreateCancel = document.querySelector('#recreate-cancel');

let csrfToken = '';
let pendingRecreation = null;

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const icons = {
  arrow:
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>',
  external:
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10" /></svg>',
};

const setNotice = (message = '', tone = 'error') => {
  notice.hidden = !message;
  notice.classList.toggle('is-info', tone === 'info');
  noticeCopy.textContent = message;
};

const clearAuthQuery = () => {
  const url = new URL(window.location.href);
  const auth = url.searchParams.get('auth');
  if (!auth) return;

  if (auth === 'denied') {
    setNotice('你取消了 GitHub 登录。', 'info');
  } else if (auth === 'failed') {
    setNotice('GitHub 登录失败，请重新试一次。');
  }

  url.searchParams.delete('auth');
  window.history.replaceState(
    {},
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
};

const parseResponse = async (response) => {
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // A reverse proxy or local static server may return a non-JSON error page.
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'request_failed',
      payload?.error?.message ?? 'request failed',
    );
  }

  return payload;
};

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: { Accept: 'application/json', ...options.headers },
  });
  return parseResponse(response);
};

const makeLink = (label, href, primary = false) => {
  const link = document.createElement('a');
  link.className = `phase-link${primary ? ' primary' : ''}`;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.innerHTML = `${label}${icons.external}`;
  return link;
};

const makeClaimButton = (phase, label, disabled = false) => {
  const button = document.createElement('button');
  button.className = 'claim-action';
  button.type = 'button';
  button.dataset.claim = phase;
  button.disabled = disabled;
  button.textContent = label;
  button.addEventListener('click', () => claimPhase(phase, button));
  return button;
};

const makeRecreateButton = (phase, claim) => {
  const button = document.createElement('button');
  button.className = 'recreate-action';
  button.type = 'button';
  button.textContent = '重新创建';
  button.setAttribute('aria-label', `重新创建仓库 ${claim.repository_name}`);
  button.addEventListener('click', () => {
    pendingRecreation = { phase, claim, button };
    recreateRepositoryName.textContent = claim.repository_name;
    recreateConfirmation.value = '';
    recreateConfirm.disabled = true;
    recreateDialog.showModal();
    recreateConfirmation.focus();
  });
  return button;
};

const makeLoginButton = () => {
  const link = document.createElement('a');
  link.className = 'phase-link primary';
  link.href = `${apiBase}/auth/login`;
  link.innerHTML = `登录后创建${icons.arrow}`;
  return link;
};

const updatePhase = (phase) => {
  const local = phaseDefaults[phase.key];
  if (!local) return;

  const status = local.card.querySelector('[data-phase-status]');
  const actions = local.card.querySelector('[data-phase-actions]');
  const claim = phase.claim;
  status.className = 'status-pill';
  actions.replaceChildren();

  if (!phase.enabled) {
    status.textContent = '尚未开放';
    actions.append(makeClaimButton(phase.key, '尚未开放', true));
    return;
  }

  if (!claim) {
    status.textContent = '可以创建';
    status.classList.add('is-open');
    actions.append(makeClaimButton(phase.key, '创建仓库'));
    return;
  }

  if (claim.status === 'retry_required') {
    status.textContent = '创建未完成';
    status.classList.add('is-waiting');
    actions.append(makeClaimButton(phase.key, '继续创建仓库'));
    return;
  }

  if (claim.status === 'awaiting_acceptance') {
    status.textContent = '等待接受邀请';
    status.classList.add('is-waiting');
    if (claim.invitation_url) {
      actions.append(makeLink('接受 GitHub 邀请', claim.invitation_url, true));
    }
    if (claim.repository_url) {
      actions.append(makeLink('查看仓库', claim.repository_url));
    }
    actions.append(makeRecreateButton(phase.key, claim));
    return;
  }

  status.textContent = '仓库已创建';
  status.classList.add('is-done');
  if (claim.repository_url) {
    actions.append(makeLink('打开实验仓库', claim.repository_url, true));
  }
  actions.append(makeRecreateButton(phase.key, claim));
};

const renderSignedOut = () => {
  if (recreateDialog.open) recreateDialog.close();
  csrfToken = '';
  signedOutView.hidden = false;
  loginLink.hidden = false;
  signedInView.hidden = true;
  logoutButton.hidden = true;

  Object.entries(phaseDefaults).forEach(([key, { card }]) => {
    const status = card.querySelector('[data-phase-status]');
    const actions = card.querySelector('[data-phase-actions]');
    status.className = 'status-pill';
    status.textContent = '尚未登录';
    actions.replaceChildren(makeLoginButton(key));
  });
};

const renderSignedIn = (state) => {
  csrfToken = state.csrf_token;
  signedOutView.hidden = true;
  loginLink.hidden = true;
  signedInView.hidden = false;
  logoutButton.hidden = false;
  loginName.textContent = `@${state.user.login}`;

  for (const phase of state.phases) updatePhase(phase);
};

const friendlyError = (error) => {
  const messages = {
    phase_closed: '这个阶段尚未开放。',
    repository_name_taken: '要创建的仓库名已经存在，请联系活动组织者。',
    login_changed: 'GitHub 用户名发生了变化，请联系活动组织者。',
    claim_incomplete: '这个仓库尚未创建完成，请继续创建。',
    repository_changed:
      '仓库状态与创建记录不一致。为避免误删，请联系活动组织者。',
    github_unavailable: 'GitHub 暂时不可用，请稍后重试。',
    csrf_failed: '登录已过期，请刷新页面后重试。',
    internal_error: '服务暂时不可用，请稍后重试。',
  };
  return messages[error.code] ?? '这次没有创建成功，请稍后重试。';
};

const recreatePhase = async ({ phase, button }) => {
  if (!csrfToken || button.disabled) return;

  setNotice();
  button.disabled = true;
  button.classList.add('is-loading');
  const previousLabel = button.textContent;
  button.textContent = '正在重新创建';

  try {
    const result = await apiRequest(`/claim/${phase}/recreate`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: '',
    });
    updatePhase({ key: phase, enabled: true, claim: result.claim });
    setNotice(
      result.claim.status === 'awaiting_acceptance'
        ? '仓库已重新创建。请等待并接受 GitHub 的协作邀请。'
        : '仓库已重新创建，可以继续实验。',
      'info',
    );
  } catch (error) {
    if (error instanceof ApiError && error.code === 'login_required') {
      renderSignedOut();
      setNotice('登录已过期，请重新登录。', 'info');
      return;
    }
    setNotice(friendlyError(error));
    button.disabled = false;
    button.classList.remove('is-loading');
    button.textContent = previousLabel;
  }
};

const claimPhase = async (phase, button) => {
  if (!csrfToken || button.disabled) return;

  setNotice();
  button.disabled = true;
  button.classList.add('is-loading');
  const previousLabel = button.textContent;
  button.textContent = '正在创建';

  try {
    const result = await apiRequest(`/claim/${phase}`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: '',
    });
    updatePhase({ key: phase, enabled: true, claim: result.claim });
    setNotice(
      result.claim.status === 'awaiting_acceptance'
        ? '仓库已创建。请等待并接受 GitHub 的协作邀请。'
        : '仓库已创建，可以开始实验了。',
      'info',
    );
  } catch (error) {
    if (error instanceof ApiError && error.code === 'login_required') {
      renderSignedOut();
      setNotice('登录已过期，请重新登录。', 'info');
      return;
    }
    setNotice(friendlyError(error));
    button.disabled = false;
    button.classList.remove('is-loading');
    button.textContent = previousLabel;
  }
};

const loadState = async () => {
  try {
    const state = await apiRequest('/state');
    renderSignedIn(state);
  } catch (error) {
    renderSignedOut();
    if (!(error instanceof ApiError && error.code === 'login_required')) {
      setNotice('暂时无法连接仓库服务，请稍后再试。', 'info');
    }
  }
};

logoutButton.addEventListener('click', async () => {
  if (!csrfToken) return;
  logoutButton.disabled = true;
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: '',
    });
    renderSignedOut();
    setNotice('已退出 GitHub。', 'info');
  } catch (error) {
    setNotice(friendlyError(error));
  } finally {
    logoutButton.disabled = false;
  }
});

recreateConfirmation.addEventListener('input', () => {
  recreateConfirm.disabled =
    !pendingRecreation ||
    recreateConfirmation.value !== pendingRecreation.claim.repository_name;
});

recreateCancel.addEventListener('click', () => recreateDialog.close());

recreateDialog.addEventListener('close', () => {
  recreateConfirmation.value = '';
  recreateConfirm.disabled = true;
  recreateRepositoryName.textContent = '';
  pendingRecreation = null;
});

recreateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (
    !pendingRecreation ||
    recreateConfirmation.value !== pendingRecreation.claim.repository_name
  ) {
    return;
  }
  const recreation = pendingRecreation;
  recreateDialog.close();
  void recreatePhase(recreation);
});

clearAuthQuery();
void loadState();
