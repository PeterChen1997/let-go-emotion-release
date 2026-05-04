import {
  createInitialState,
  getPrimaryEmotionGroups,
  getEmotionOptionsByGroup,
  createCheckIn,
  completeSession,
  saveState,
  loadState,
} from './src/app-state.js';

const app = document.getElementById('app');
const todayDate = document.getElementById('todayDate');
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' });
todayDate.textContent = dateFormatter.format(new Date());

const state = loadState(window.localStorage);
let draft = {
  mode: state.quickModes[0].id,
  tab: 'practice',
  primaryEmotion: 'anxiety',
  secondaryEmotion: '紧张',
  bodyFeeling: '胸口堵住',
  eventText: '',
  intensityBefore: 6,
  intensityAfter: 4,
  clarityAfter: 6,
  bodyAfter: 5,
  nextAction: state.recommendedNextActions[0],
};

function setDraft(partial) {
  draft = { ...draft, ...partial };
  render();
}

function emotionGroups() {
  return getPrimaryEmotionGroups();
}

function groupLabel(id) {
  return emotionGroups().find((item) => item.id === id)?.label || id;
}

function optionChips(options, currentValue, clickHandler, className = 'option-chip') {
  return options.map((option) => `
    <button class="${className} ${currentValue === option.label ? 'active' : ''}" data-value="${option.label}">${option.label}</button>
  `).join('');
}

function startSession() {
  const session = createCheckIn({
    mode: draft.mode,
    primaryEmotion: draft.primaryEmotion,
    secondaryEmotion: draft.secondaryEmotion,
    bodyFeeling: draft.bodyFeeling,
    eventText: draft.eventText.trim() || '未填写触发事件',
    intensityBefore: Number(draft.intensityBefore),
  });

  const nextState = completeSession(state, session, {
    intensityAfter: Number(draft.intensityAfter),
    clarityAfter: Number(draft.clarityAfter),
    bodyAfter: Number(draft.bodyAfter),
    nextAction: draft.nextAction,
  });

  state.history = nextState.history;
  state.activeSession = null;
  saveState(window.localStorage, state);
  setDraft({ tab: 'history' });
}

function renderHero() {
  const currentMode = state.quickModes.find((mode) => mode.id === draft.mode) || state.quickModes[0];
  return `
    <section class="hero-card">
      <div class="section-label">今日入口</div>
      <div class="hero-title">先把此刻的情绪放下来一点</div>
      <div class="hero-subtitle">先选情绪，再写一句触发事件，然后进入一轮 3 分钟的引导式释放练习。整个流程默认私密、非医疗、可随时暂停。</div>
      <div class="hero-quickmodes">
        ${state.quickModes.map((mode) => `
          <button class="mode-pill ${draft.mode === mode.id ? 'active' : ''}" data-mode="${mode.id}">
            <strong>${mode.label}</strong>
            <small>${mode.subtitle}</small>
          </button>
        `).join('')}
      </div>
      <div class="hero-focus-card">
        <div>
          <div class="section-label">当前模式</div>
          <strong>${currentMode.label}</strong>
          <p>${currentMode.subtitle}</p>
        </div>
        <button class="primary-btn hero-primary-btn" id="heroStartBtn">开始这轮练习</button>
      </div>
    </section>
  `;
}

function renderPracticePanel() {
  const currentSecondaryOptions = getEmotionOptionsByGroup(draft.primaryEmotion);
  const bodyOptions = getEmotionOptionsByGroup('body');

  return `
    <section class="grid two">
      <div class="panel">
        <div class="section-label">第一步 · 快速分类情绪</div>
        <h2>你现在最强烈的情绪是什么？</h2>
        <div class="emotion-groups">
          ${emotionGroups().map((group) => `
            <button class="group-chip ${draft.primaryEmotion === group.id ? 'active' : ''}" data-group="${group.id}">
              <strong>${group.label}</strong>
              <span>${group.id}</span>
            </button>
          `).join('')}
        </div>

        <label class="input-label">
          更贴近你的感受是？
          <div class="option-list" id="secondaryOptions">
            ${optionChips(currentSecondaryOptions, draft.secondaryEmotion, 'secondaryOptions')}
          </div>
        </label>

        <label class="input-label">
          身体哪里最有感觉？
          <div class="option-list" id="bodyOptions">
            ${optionChips(bodyOptions, draft.bodyFeeling, 'body-chip')}
          </div>
        </label>

        <label class="input-label">
          发生了什么？
          <textarea id="eventText" placeholder="用一句话写下触发点，比如：老板刚刚在群里否定了我的方案">${draft.eventText}</textarea>
        </label>

        <label class="input-label">
          现在情绪强度是多少？ <span>${draft.intensityBefore}/10</span>
          <input id="intensityBefore" type="range" min="0" max="10" value="${draft.intensityBefore}" />
        </label>
      </div>

      <div class="panel">
        <div class="section-label">第二步 · 跟着做一轮释放</div>
        <div class="practice-steps">
          <div class="step-card"><div class="step-number">1</div><h4>先承认这个感觉在这里</h4><p>不用急着变好，也不用解释自己。先只做一件事：承认“我现在确实有这个感觉”。</p></div>
          <div class="step-card"><div class="step-number">2</div><h4>问自己：我能允许它待在这里吗？</h4><p>不要求喜欢它，只是给它一点空间。你也可以改问：我能欢迎它一点点吗？</p></div>
          <div class="step-card"><div class="step-number">3</div><h4>问自己：我愿意松开一点点吗？</h4><p>不是彻底放掉，而是从 100% 抓住，变成 90% 或 80%。</p></div>
          <div class="step-card"><div class="step-number">4</div><h4>问自己：如果愿意，什么时候？</h4><p>答案通常是：现在，先松一点点。然后再次感受身体和情绪有没有变化。</p></div>
        </div>

        <label class="input-label">
          练习后情绪强度 <span>${draft.intensityAfter}/10</span>
          <input id="intensityAfter" type="range" min="0" max="10" value="${draft.intensityAfter}" />
        </label>

        <label class="input-label">
          清晰度 <span>${draft.clarityAfter}/10</span>
          <input id="clarityAfter" type="range" min="0" max="10" value="${draft.clarityAfter}" />
        </label>

        <label class="input-label">
          身体放松度 <span>${draft.bodyAfter}/10</span>
          <input id="bodyAfter" type="range" min="0" max="10" value="${draft.bodyAfter}" />
        </label>

        <label class="input-label">
          现在最适合的下一步
          <div class="next-actions">
            ${state.recommendedNextActions.map((action) => `
              <button class="next-chip ${draft.nextAction === action ? 'active' : ''}" data-next-action="${action}">${action}</button>
            `).join('')}
          </div>
        </label>

        <div class="actions">
          <button class="primary-btn" id="startSessionBtn">保存这次练习</button>
          <button class="secondary-btn" id="goHistoryBtn">查看历史记录</button>
        </div>
      </div>
    </section>
  `;
}

function renderHistoryPanel() {
  const history = state.history;
  return `
    <section class="grid metrics">
      <div class="metric-card">
        <span>累计练习</span>
        <strong>${history.length}</strong>
      </div>
      <div class="metric-card">
        <span>平均强度变化</span>
        <strong>${history.length ? (history.reduce((sum, item) => sum + item.delta, 0) / history.length).toFixed(1) : '0.0'}</strong>
      </div>
      <div class="metric-card">
        <span>最近主情绪</span>
        <strong>${history[0] ? groupLabel(history[0].primaryEmotion) : '—'}</strong>
      </div>
    </section>
    <section class="panel">
      <div class="section-label">历史记录</div>
      <h2>每次练习都回到真实事件</h2>
      ${history.length ? `
        <div class="history-list">
          ${history.map((item) => `
            <article class="history-card">
              <div class="history-header">
                <div>
                  <strong>${groupLabel(item.primaryEmotion)} · ${item.secondaryEmotion}</strong>
                  <div class="history-meta">${new Date(item.completedAt).toLocaleString('zh-CN')} · ${item.bodyFeeling}</div>
                </div>
                <div class="delta-badge ${item.delta < 0 ? 'better' : 'same'}">${item.delta < 0 ? `${item.delta}` : `±${item.delta}`}</div>
              </div>
              <p style="margin: 12px 0 8px; color: var(--text)">${item.eventText}</p>
              <p class="history-meta">前后变化：${item.intensityBefore} → ${item.intensityAfter}｜清晰度 ${item.clarityAfter}/10｜下一步：${item.nextAction}</p>
            </article>
          `).join('')}
        </div>
      ` : `<div class="empty-state">你还没有保存任何练习。先完成一次快速释放，就会在这里看到记录和趋势。</div>`}
    </section>
  `;
}

function renderLearnPanel() {
  return `
    <section class="grid two">
      <div class="panel">
        <div class="section-label">方法说明</div>
        <h2>这是什么，不是什么</h2>
        <p>这是一个自助式情绪练习工具：帮助你识别情绪、承认触发、进行允许与松开，并把注意力带回下一步行动。它不是医疗工具，不替代心理治疗、精神科评估或危机干预。</p>
      </div>
      <div class="safety-card">
        <h3>安全边界</h3>
        <ul class="safety-list">
          <li>如果你出现明显失控、自伤冲动、强烈创伤闪回或持续解离，请停止练习并联系专业支持。</li>
          <li>如果这轮练习让你更难受，请改做更温和的接地练习：喝水、走动、呼吸、联系可信任的人。</li>
          <li>如果涉及现实中的暴力、控制或医学症状，请优先寻求现实支持与专业帮助。</li>
        </ul>
      </div>
    </section>
  `;
}

function render() {
  app.innerHTML = `
    ${renderHero()}
    <section class="panel">
      <div class="tab-row">
        <button class="tab-chip ${draft.tab === 'practice' ? 'active' : ''}" data-tab="practice">开始练习</button>
        <button class="tab-chip ${draft.tab === 'history' ? 'active' : ''}" data-tab="history">历史记录</button>
        <button class="tab-chip ${draft.tab === 'learn' ? 'active' : ''}" data-tab="learn">了解边界</button>
      </div>
    </section>
    ${draft.tab === 'practice' ? renderPracticePanel() : ''}
    ${draft.tab === 'history' ? renderHistoryPanel() : ''}
    ${draft.tab === 'learn' ? renderLearnPanel() : ''}
    <div class="footer-note">默认本地保存到你的浏览器 · 适合日常情绪整理 · 非医疗替代</div>
  `;

  bindEvents();
}

function bindEvents() {
  app.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => setDraft({ mode: button.dataset.mode }));
  });
  app.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setDraft({ tab: button.dataset.tab }));
  });
  app.querySelectorAll('[data-group]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.group;
      const firstOption = getEmotionOptionsByGroup(group)[0]?.label || '';
      setDraft({ primaryEmotion: group, secondaryEmotion: firstOption });
    });
  });
  app.querySelectorAll('#secondaryOptions .option-chip').forEach((button) => {
    button.addEventListener('click', () => setDraft({ secondaryEmotion: button.dataset.value }));
  });
  app.querySelectorAll('#bodyOptions .option-chip').forEach((button) => {
    button.addEventListener('click', () => setDraft({ bodyFeeling: button.dataset.value }));
  });
  app.querySelectorAll('[data-next-action]').forEach((button) => {
    button.addEventListener('click', () => setDraft({ nextAction: button.dataset.nextAction }));
  });

  const eventText = app.querySelector('#eventText');
  if (eventText) eventText.addEventListener('input', (event) => { draft.eventText = event.target.value; });

  ['intensityBefore', 'intensityAfter', 'clarityAfter', 'bodyAfter'].forEach((id) => {
    const el = app.querySelector(`#${id}`);
    if (el) el.addEventListener('input', (event) => setDraft({ [id]: Number(event.target.value) }));
  });

  const startButton = app.querySelector('#startSessionBtn');
  if (startButton) startButton.addEventListener('click', startSession);
  const heroStartButton = app.querySelector('#heroStartBtn');
  if (heroStartButton) heroStartButton.addEventListener('click', () => setDraft({ tab: 'practice' }));
  const historyButton = app.querySelector('#goHistoryBtn');
  if (historyButton) historyButton.addEventListener('click', () => setDraft({ tab: 'history' }));
}

render();
