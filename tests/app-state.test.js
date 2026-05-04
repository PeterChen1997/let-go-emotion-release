import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  getPrimaryEmotionGroups,
  getEmotionOptionsByGroup,
  createCheckIn,
  completeSession,
  saveState,
  loadState,
} from '../src/app-state.js';

function createStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('initial state exposes iOS-friendly quick flows and empty history', () => {
  const state = createInitialState();

  assert.equal(state.quickModes.length, 4);
  assert.deepEqual(state.history, []);
  assert.equal(state.activeSession, null);
  assert.equal(state.recommendedNextActions.length >= 4, true);
});

test('emotion taxonomy includes complete primary groups and rich secondary options', () => {
  const groups = getPrimaryEmotionGroups();

  assert.deepEqual(groups.map((group) => group.id), [
    'anxiety',
    'anger',
    'sadness',
    'shame',
    'fear',
    'hurt',
    'numbness',
    'confusion',
    'joy',
    'calm',
  ]);

  const anxietyOptions = getEmotionOptionsByGroup('anxiety');
  const hurtOptions = getEmotionOptionsByGroup('hurt');
  const bodyOptions = getEmotionOptionsByGroup('body');

  assert.equal(anxietyOptions.length >= 8, true);
  assert.equal(hurtOptions.some((item) => item.label === '委屈'), true);
  assert.equal(bodyOptions.some((item) => item.label === '胸口堵住'), true);
});

test('createCheckIn supports quick emotion selection and one-line event capture', () => {
  const session = createCheckIn({
    mode: 'quick-release',
    primaryEmotion: 'anxiety',
    secondaryEmotion: '紧张',
    bodyFeeling: '胸口堵住',
    eventText: '老板刚刚在群里否定了我的方案',
    intensityBefore: 8,
  });

  assert.equal(session.mode, 'quick-release');
  assert.equal(session.primaryEmotion, 'anxiety');
  assert.equal(session.secondaryEmotion, '紧张');
  assert.equal(session.eventText, '老板刚刚在群里否定了我的方案');
  assert.equal(session.intensityBefore, 8);
  assert.ok(session.id);
});

test('completeSession appends history item with before/after deltas and next action', () => {
  const state = createInitialState();
  const session = createCheckIn({
    mode: 'relationship-reset',
    primaryEmotion: 'anger',
    secondaryEmotion: '被冒犯',
    bodyFeeling: '喉咙发紧',
    eventText: '对方打断我说话',
    intensityBefore: 7,
  });

  const nextState = completeSession(state, session, {
    intensityAfter: 4,
    clarityAfter: 7,
    bodyAfter: 5,
    nextAction: '先缓 10 分钟，再决定要不要回复',
  });

  assert.equal(nextState.history.length, 1);
  assert.equal(nextState.history[0].delta, -3);
  assert.equal(nextState.history[0].nextAction, '先缓 10 分钟，再决定要不要回复');
  assert.equal(nextState.activeSession, null);
});

test('state roundtrip preserves history and active preferences in storage', () => {
  const storage = createStorageMock();
  const state = createInitialState();
  const session = createCheckIn({
    mode: 'deep-release',
    primaryEmotion: 'fear',
    secondaryEmotion: '怕失控',
    bodyFeeling: '胃里发沉',
    eventText: '我担心明天汇报失败',
    intensityBefore: 9,
  });
  const completed = completeSession(state, session, {
    intensityAfter: 6,
    clarityAfter: 6,
    bodyAfter: 6,
    nextAction: '写下三个最小可控动作',
  });

  saveState(storage, completed);
  const loaded = loadState(storage);

  assert.equal(loaded.history.length, 1);
  assert.equal(loaded.history[0].eventText, '我担心明天汇报失败');
  assert.equal(loaded.quickModes[0].id, 'quick-release');
});
