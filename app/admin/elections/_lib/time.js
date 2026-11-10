export function msToHhmm(ms) {
    if (ms <= 0) return '0m';
    const mins = Math.floor(ms / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h ? h + 'h ' : ''}${m}m`;
  }

  export function timeRemaining(e) {
    const now = Date.now();
    const s = Date.parse(e.startAt);
    const end = Date.parse(e.endAt);
    if (now < s) return { label: `Starts in ${msToHhmm(s - now)}` };
    if (now > end) return { label: `Ended ${msToHhmm(now - end)} ago` };
    return { label: `${msToHhmm(end - now)} left` };
  }

  export function fmtLocation(loc = {}) {
    const parts = ['city', 'ward', 'union', 'upazila', 'district', 'division']
      .map(k => loc?.[k]).filter(Boolean);
    return parts.length ? parts.join(', ') : '-';
  }
  export function fmtElig(elig = {}) {
    const scope = elig.scope || 'seat';
    if (scope === 'role') return `role = ${(elig.roles || []).join(', ') || '-'}`;
    if (scope === 'seat') return `seat in [${(elig.seats || []).join(', ')}]`;
    if (scope === 'location') return 'location-based';
    if (scope === 'country') return 'country-wide';
    return scope;
  }
