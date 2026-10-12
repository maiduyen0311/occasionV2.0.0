const pad = (n) => String(n).padStart(2, '0');

const parseEndTimestamp = (raw) => {
  if (!raw || typeof raw !== 'string') return null;

  const iso = raw.trim();
  const match = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);

  if (match) {
    const y = Number(match[1]);
    const mo = Number(match[2]) - 1;
    const d = Number(match[3]);
    const h = Number(match[4]);
    const mi = Number(match[5]);
    const s = Number(match[6] || 0);
    const ts = new Date(y, mo, d, h, mi, s).getTime();
    return Number.isNaN(ts) ? null : ts;
  }

  const fallback = new Date(iso).getTime();
  return Number.isNaN(fallback) ? null : fallback;
};

// data-daily="true": counts down to the next local midnight and rolls over every day
const nextMidnight = () => {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
};

const initCountdown = (root) => {
  const daily = root.dataset.daily === 'true';
  let end = daily ? nextMidnight() : parseEndTimestamp(root.dataset.end);
  if (!end) {
    root.classList.add('flash-deals__timer--invalid');
    return;
  }

  if (root._flashCountdownTimer) {
    clearInterval(root._flashCountdownTimer);
  }

  const daysEl = root.querySelector('[data-days]');
  const hoursEl = root.querySelector('[data-hours]');
  const minsEl = root.querySelector('[data-mins]');
  const secsEl = root.querySelector('[data-secs]');

  const tick = () => {
    if (daily && Date.now() >= end) end = nextMidnight();
    const diff = Math.max(0, end - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    if (daysEl) daysEl.textContent = daysEl.closest('.oc-countdown') ? pad(days) : String(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl) minsEl.textContent = pad(mins);
    if (secsEl) secsEl.textContent = pad(secs);
  };

  tick();
  root._flashCountdownTimer = setInterval(tick, 1000);
};

export const flashDealsCountdown = () => {
  document.querySelectorAll('[data-flash-countdown]').forEach(initCountdown);
};

export const destroyFlashDealsCountdown = () => {
  document.querySelectorAll('[data-flash-countdown]').forEach((root) => {
    if (root._flashCountdownTimer) {
      clearInterval(root._flashCountdownTimer);
      delete root._flashCountdownTimer;
    }
  });
};
