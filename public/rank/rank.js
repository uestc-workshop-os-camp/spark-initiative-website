const PAGE_SIZE = 10;
const API_PAGE_SIZE = 200;
const MAX_API_PAGES = 10;

const stageConfig = {
  rust: { label: 'Rust 基础', mode: 1 },
  rcore: { label: 'rCore 实验', mode: 2 },
};

const elements = {
  directionTabs: [...document.querySelectorAll('.direction-tab')],
  osPanel: document.querySelector('#panel-os'),
  rdmaPanel: document.querySelector('#panel-rdma'),
  stageTabs: [...document.querySelectorAll('.stage-tab')],
  stageName: document.querySelector('#stage-name'),
  participantCount: document.querySelector('#participant-count'),
  updatedAt: document.querySelector('#updated-at'),
  updateInterval: document.querySelector('#update-interval'),
  search: document.querySelector('#participant-search'),
  head: document.querySelector('#rank-head'),
  body: document.querySelector('#rank-body'),
  range: document.querySelector('#range-label'),
  page: document.querySelector('#page-label'),
  previous: document.querySelector('#previous-page'),
  next: document.querySelector('#next-page'),
};

const state = {
  direction: location.hash === '#rdma' ? 'rdma' : 'os',
  stage: 'rust',
  query: '',
  page: 1,
  data: new Map(),
  updatedAt: null,
  refreshIntervalSeconds: 15 * 60,
  loading: false,
  error: null,
};

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function compactNumber(value) {
  const normalized = number(value);
  return Number.isInteger(normalized)
    ? String(normalized)
    : normalized.toFixed(1);
}

function percentage(value) {
  return Math.min(100, Math.max(0, number(value)));
}

function formatTime(value) {
  const timestamp = number(value);
  if (!timestamp) return '尚无提交';
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '时间未知';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatUpdatedAt(value) {
  const timestamp = number(value);
  if (!timestamp) return '正在同步';
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '时间未知';
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatRefreshInterval(value) {
  const seconds = Math.max(1, Math.round(number(value, 15 * 60)));
  if (seconds % 3600 === 0) return `每 ${seconds / 3600} 小时自动更新`;
  if (seconds % 60 === 0) return `每 ${seconds / 60} 分钟自动更新`;
  return `每 ${seconds} 秒自动更新`;
}

function initials(username) {
  return (
    String(username)
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2) || 'OS'
  );
}

function githubAvatarURL(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' &&
      url.hostname === 'avatars.githubusercontent.com'
      ? url.href
      : '';
  } catch {
    return '';
  }
}

function participantMark(row, username) {
  const fallback = escapeHTML(initials(username));
  const avatarURL = githubAvatarURL(row.header_url);
  const avatar = avatarURL
    ? `<img src="${escapeHTML(avatarURL)}" alt="" width="38" height="38" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-participant-avatar>`
    : '';
  return `<span class="participant-mark"><span aria-hidden="true">${fallback}</span>${avatar}</span>`;
}

async function fetchPage(mode, page) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      `/api/scores/${page}/${API_PAGE_SIZE}/${mode}`,
      {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (payload?.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error('Unexpected response');
    }
    return {
      rows: payload.data,
      updatedAt: number(payload.updated_at) || null,
      refreshIntervalSeconds: number(payload.refresh_interval_seconds, 15 * 60),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllScores(mode) {
  const rows = [];
  let updatedAt = null;
  let refreshIntervalSeconds = 15 * 60;
  for (let page = 1; page <= MAX_API_PAGES; page += 1) {
    const result = await fetchPage(mode, page);
    rows.push(...result.rows);
    updatedAt = result.updatedAt || updatedAt;
    refreshIntervalSeconds = result.refreshIntervalSeconds;
    if (result.rows.length < API_PAGE_SIZE) break;
  }
  return { rows, updatedAt, refreshIntervalSeconds };
}

function setLoading(isLoading) {
  state.loading = isLoading;
  if (isLoading && !state.data.has(state.stage)) {
    elements.participantCount.textContent = '—';
    elements.body.innerHTML = `
      <tr class="loading-row">
        <td colspan="5">
          <span class="loading-line"></span>
          <span class="loading-line"></span>
          <span class="loading-line"></span>
        </td>
      </tr>`;
  }
}

async function loadStage(force = false) {
  if (state.loading) return;
  if (!force && state.data.has(state.stage)) {
    render();
    return;
  }

  setLoading(true);
  state.error = null;
  try {
    const result = await fetchAllScores(stageConfig[state.stage].mode);
    state.data.set(state.stage, result.rows);
    state.updatedAt = result.updatedAt;
    state.refreshIntervalSeconds = result.refreshIntervalSeconds;
  } catch (error) {
    state.error = error;
  } finally {
    setLoading(false);
    render();
  }
}

function setDirection(direction) {
  state.direction = direction;
  elements.directionTabs.forEach((tab) => {
    const active = tab.dataset.direction === direction;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  elements.osPanel.hidden = direction !== 'os';
  elements.rdmaPanel.hidden = direction !== 'rdma';
  history.replaceState(
    null,
    '',
    direction === 'rdma' ? '#rdma' : location.pathname,
  );
}

function setStage(stage) {
  state.stage = stage;
  state.page = 1;
  state.query = '';
  elements.search.value = '';
  elements.stageTabs.forEach((tab) => {
    const active = tab.dataset.stage === stage;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  elements.stageName.textContent = stageConfig[stage].label;
  void loadStage();
}

function getVisibleRows() {
  const rows = state.data.get(state.stage) || [];
  const query = state.query.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) =>
    String(row.username || '')
      .toLowerCase()
      .includes(query),
  );
}

function renderHead() {
  elements.head.innerHTML =
    state.stage === 'rust'
      ? `<tr>
          <th scope="col">排名</th>
          <th scope="col">参与者</th>
          <th scope="col">完成</th>
          <th scope="col">完成度</th>
          <th scope="col">最后提交</th>
        </tr>`
      : `<tr>
          <th scope="col">排名</th>
          <th scope="col">参与者</th>
          <th scope="col">总进度</th>
          <th scope="col">章节进度</th>
          <th scope="col">最后提交</th>
        </tr>`;
}

function rustRow(row, fallbackRank) {
  const rank = Math.max(1, number(row.rank, fallbackRank));
  const points = number(row.points);
  const total = number(row.total);
  const progress = total > 0 ? percentage((points / total) * 100) : 0;
  const rawUsername = String(row.username || 'unknown');
  const username = escapeHTML(rawUsername);
  return `<tr data-rank="${rank}">
    <td class="cell-rank"><span class="rank-number">${rank}</span></td>
    <td class="cell-participant">
      <span class="participant">
        ${participantMark(row, rawUsername)}
        <strong>${username}</strong>
      </span>
    </td>
    <td class="cell-score" data-label="完成">
      <span class="score-value">${compactNumber(points)} <span>/ ${compactNumber(total)}</span></span>
    </td>
    <td class="cell-progress" data-label="完成度">
      <span class="progress-cell">
        <span class="progress-track"><i style="--progress:${progress.toFixed(1)}%"></i></span>
        <span>${Math.round(progress)}%</span>
      </span>
    </td>
    <td class="cell-time" data-label="最后提交"><span class="time-value">${formatTime(row.pass_time)}</span></td>
  </tr>`;
}

function rcoreRow(row, fallbackRank) {
  const rank = Math.max(1, number(row.rank, fallbackRank));
  const rawUsername = String(row.username || 'unknown');
  const username = escapeHTML(rawUsername);
  const chapters = ['ch3', 'ch4', 'ch5', 'ch6', 'ch8'];
  const chapterMarkup = chapters
    .map(
      (chapter) =>
        `<span>${chapter.toUpperCase()}<b>${Math.round(percentage(row[chapter]))}%</b></span>`,
    )
    .join('');
  return `<tr data-rank="${rank}">
    <td class="cell-rank"><span class="rank-number">${rank}</span></td>
    <td class="cell-participant">
      <span class="participant">
        ${participantMark(row, rawUsername)}
        <strong>${username}</strong>
      </span>
    </td>
    <td class="cell-score" data-label="总进度">
      <span class="score-value">${compactNumber(row.total)} <span>/ 500</span></span>
    </td>
    <td class="cell-chapters" data-label="章节进度"><span class="chapter-list">${chapterMarkup}</span></td>
    <td class="cell-time" data-label="最后提交"><span class="time-value">${formatTime(row.pass_time)}</span></td>
  </tr>`;
}

function renderRows() {
  if (state.error) {
    elements.body.innerHTML = `<tr class="empty-state"><td colspan="5">
      <strong>暂时无法读取进度</strong>
      <span>请稍后刷新重试。</span>
    </td></tr>`;
    return;
  }

  const visibleRows = getVisibleRows();
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageRows = visibleRows.slice(start, start + PAGE_SIZE);

  if (!pageRows.length) {
    elements.body.innerHTML = `<tr class="empty-state"><td colspan="5">
      <strong>${state.query ? '没有找到这位参与者' : '这里还没有进度记录'}</strong>
      <span>${state.query ? '换一个关键词试试。' : '第一条记录出现后，会在这里展示。'}</span>
    </td></tr>`;
  } else {
    const renderer = state.stage === 'rust' ? rustRow : rcoreRow;
    elements.body.innerHTML = pageRows
      .map((row, index) => renderer(row, start + index + 1))
      .join('');
    elements.body
      .querySelectorAll('[data-participant-avatar]')
      .forEach((avatar) =>
        avatar.addEventListener('error', () => avatar.remove(), { once: true }),
      );
  }

  elements.range.textContent = visibleRows.length
    ? `显示 ${start + 1}–${Math.min(start + PAGE_SIZE, visibleRows.length)}，共 ${visibleRows.length} 位`
    : '暂无结果';
  elements.page.textContent = `${state.page} / ${totalPages}`;
  elements.previous.disabled = state.page <= 1;
  elements.next.disabled = state.page >= totalPages;
}

function renderMeta() {
  const rows = state.data.get(state.stage) || [];
  elements.stageName.textContent = stageConfig[state.stage].label;
  elements.participantCount.textContent = state.error
    ? '—'
    : `${rows.length} 位`;
  elements.updatedAt.textContent = state.error
    ? '暂时无法读取'
    : formatUpdatedAt(state.updatedAt);
  elements.updateInterval.textContent = formatRefreshInterval(
    state.refreshIntervalSeconds,
  );
}

function render() {
  renderHead();
  renderMeta();
  renderRows();
}

elements.directionTabs.forEach((tab) => {
  tab.addEventListener('click', () => setDirection(tab.dataset.direction));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const nextDirection = state.direction === 'os' ? 'rdma' : 'os';
    setDirection(nextDirection);
    elements.directionTabs
      .find((item) => item.dataset.direction === nextDirection)
      ?.focus();
  });
});

elements.stageTabs.forEach((tab) => {
  tab.addEventListener('click', () => setStage(tab.dataset.stage));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const nextStage = state.stage === 'rust' ? 'rcore' : 'rust';
    setStage(nextStage);
    elements.stageTabs
      .find((item) => item.dataset.stage === nextStage)
      ?.focus();
  });
});

elements.search.addEventListener('input', (event) => {
  state.query = event.target.value;
  state.page = 1;
  renderRows();
});

elements.previous.addEventListener('click', () => {
  if (state.page <= 1) return;
  state.page -= 1;
  renderRows();
  elements.head.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

elements.next.addEventListener('click', () => {
  const totalPages = Math.ceil(getVisibleRows().length / PAGE_SIZE);
  if (state.page >= totalPages) return;
  state.page += 1;
  renderRows();
  elements.head.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

setDirection(state.direction);
renderHead();
void loadStage();

setInterval(
  () => {
    if (state.direction === 'os' && !document.hidden) void loadStage(true);
  },
  15 * 60 * 1000,
);
