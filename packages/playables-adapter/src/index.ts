interface PlayablesMessage {
  type: 'pause' | 'resume' | 'load';
  data?: Record<string, string>;
}

let _isPlayablesHost = false;
const _dataCache = new Map<string, string>();
const _pauseCallbacks: Array<() => void> = [];
const _resumeCallbacks: Array<() => void> = [];
let _initialized = false;

function handleMessage(event: MessageEvent): void {
  const msg = event.data as PlayablesMessage | undefined;
  if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
    return;
  }

  if (msg.type === 'pause') {
    _isPlayablesHost = true;
    for (const cb of _pauseCallbacks) {
      cb();
    }
  } else if (msg.type === 'resume') {
    _isPlayablesHost = true;
    for (const cb of _resumeCallbacks) {
      cb();
    }
  } else if (msg.type === 'load') {
    _isPlayablesHost = true;
    if (msg.data && typeof msg.data === 'object') {
      for (const [k, v] of Object.entries(msg.data)) {
        if (typeof v === 'string') {
          _dataCache.set(k, v);
        }
      }
    }
  }
}

export function initPlayables(): void {
  if (_initialized) {
    return;
  }
  _initialized = true;

  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'game-ready' }, '*');
    }
  }
}

export function reportScore(score: number): void {
  if (_isPlayablesHost && typeof window !== 'undefined' && window.parent) {
    window.parent.postMessage({ type: 'score', score }, '*');
  } else if (typeof localStorage !== 'undefined') {
    localStorage.setItem('arcade-carnival-score', String(score));
  }
}

export function saveData(key: string, value: string): void {
  if (_isPlayablesHost && typeof window !== 'undefined' && window.parent) {
    window.parent.postMessage({ type: 'save', key, value }, '*');
  } else if (typeof localStorage !== 'undefined') {
    localStorage.setItem('arcade-carnival-' + key, value);
  }
}

export function loadData(key: string): string | null {
  if (_isPlayablesHost) {
    return _dataCache.get(key) ?? null;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('arcade-carnival-' + key);
  }
  return null;
}

export function onPause(cb: () => void): void {
  _pauseCallbacks.push(cb);
}

export function onResume(cb: () => void): void {
  _resumeCallbacks.push(cb);
}
