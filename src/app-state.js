const STORAGE_KEY = 'sedona-release-webapp-state-v1';

const PRIMARY_EMOTION_GROUPS = [
  { id: 'anxiety', label: '焦虑', icon: '􀊫', color: '#FF9500' },
  { id: 'anger', label: '愤怒', icon: '􀌤', color: '#FF3B30' },
  { id: 'sadness', label: '悲伤', icon: '􀊴', color: '#5E5CE6' },
  { id: 'shame', label: '羞耻', icon: '􀇿', color: '#AF52DE' },
  { id: 'fear', label: '恐惧', icon: '􀋨', color: '#FF2D55' },
  { id: 'hurt', label: '受伤', icon: '􀑪', color: '#34C759' },
  { id: 'numbness', label: '麻木', icon: '􀎡', color: '#8E8E93' },
  { id: 'confusion', label: '混乱', icon: '􀁣', color: '#0A84FF' },
  { id: 'joy', label: '喜悦', icon: '􀎞', color: '#FFD60A' },
  { id: 'calm', label: '平静', icon: '􀊵', color: '#64D2FF' },
];

const EMOTION_OPTIONS = {
  anxiety: ['紧张', '不安', '心慌', '反复担心', '害怕出错', '压力很大', '停不下来', '预感不好', '坐立不安'],
  anger: ['生气', '烦躁', '火大', '不爽', '被冒犯', '想反击', '不甘心', '受不了', '想发火'],
  sadness: ['难过', '失落', '沮丧', '想哭', '空落落', '被抛下', '无力', '低沉', '泄气'],
  shame: ['羞耻', '尴尬', '自责', '内疚', '觉得自己不够好', '丢脸', '后悔', '想躲起来'],
  fear: ['害怕', '怕失控', '怕失败', '怕被拒绝', '怕冲突', '怕麻烦变大', '怕没人支持', '怕出事'],
  hurt: ['委屈', '心寒', '被忽视', '被误解', '失望', '受伤', '被否定', '不被看见', '心里堵'],
  numbness: ['麻木', '空白', '没感觉', '断联感', '呆住', '提不起劲', '迟钝', '像被冻住'],
  confusion: ['混乱', '纠结', '拿不准', '脑子乱', '想太多', '看不清', '矛盾', '被卡住'],
  joy: ['轻松', '开心', '被支持', '释然', '有希望', '满足', '感谢', '被理解'],
  calm: ['平静', '稳定', '松开了', '安心', '踏实', '清楚', '缓下来了', '能呼吸了'],
  body: ['胸口堵住', '喉咙发紧', '胃里发沉', '肩膀很紧', '头胀', '心跳快', '想哭', '想逃开', '身体发麻'],
};

const QUICK_MODES = [
  { id: 'quick-release', label: '快速释放', subtitle: '3 分钟，把情绪放下来一点' },
  { id: 'deep-release', label: '深入释放', subtitle: '适合反复出现的主题' },
  { id: 'relationship-reset', label: '关系清理', subtitle: '围绕控制、认可、安全、分离' },
  { id: 'night-reset', label: '睡前放下', subtitle: '停止反刍，带着更轻的身体去休息' },
];

const RECOMMENDED_NEXT_ACTIONS = [
  '先缓 10 分钟，再决定要不要回复',
  '写下三个最小可控动作',
  '去喝口水，回到身体',
  '把想说的话先写成草稿',
  '今天先停在这里，明天再做一轮',
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getPrimaryEmotionGroups() {
  return PRIMARY_EMOTION_GROUPS;
}

export function getEmotionOptionsByGroup(groupId) {
  return (EMOTION_OPTIONS[groupId] || []).map((label) => ({ id: `${groupId}-${label}`, label }));
}

export function createInitialState() {
  return {
    quickModes: QUICK_MODES,
    recommendedNextActions: RECOMMENDED_NEXT_ACTIONS,
    history: [],
    activeSession: null,
  };
}

export function createCheckIn({
  mode,
  primaryEmotion,
  secondaryEmotion,
  bodyFeeling,
  eventText,
  intensityBefore,
}) {
  return {
    id: createId(),
    mode,
    primaryEmotion,
    secondaryEmotion,
    bodyFeeling,
    eventText,
    intensityBefore,
    startedAt: new Date().toISOString(),
  };
}

export function completeSession(state, session, { intensityAfter, clarityAfter, bodyAfter, nextAction }) {
  const historyItem = {
    ...session,
    intensityAfter,
    clarityAfter,
    bodyAfter,
    nextAction,
    delta: intensityAfter - session.intensityBefore,
    completedAt: new Date().toISOString(),
  };

  return {
    ...state,
    activeSession: null,
    history: [historyItem, ...state.history],
  };
}

export function saveState(storage, state) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw);
    return {
      ...createInitialState(),
      ...parsed,
    };
  } catch {
    return createInitialState();
  }
}
