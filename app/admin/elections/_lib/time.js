// Plain-language descriptions of an election's location and eligibility rules.
export function fmtLocation(loc = {}) {
    const parts = ['city', 'ward', 'union', 'upazila', 'district', 'division'].map((k) => loc?.[k]).filter(Boolean);
    return parts.length ? parts.join(', ') : null;
}

export function fmtElig(elig = {}) {
    const scope = elig.scope || 'seat';
    if (scope === 'role') return `Voters with the role ${(elig.roles || []).join(', ') || '—'}`;
    if (scope === 'seat') return `Voters in ${(elig.seats || []).join(', ') || 'the listed seats'}`;
    if (scope === 'location') return 'Voters in the election’s location';
    if (scope === 'country') return 'Every voter in the country';
    return 'Everyone enrolled';
}
