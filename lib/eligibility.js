export function norm(s) {
    return (s || '').trim().toLowerCase();
}

// export function matchesElectionForVoter(e, voter) {
//     const elig = e.eligibility || {};

//     // basic gates
//     if (elig.requireEnrolled && (!voter.enrollmentDone || !voter.pinHash)) return false;
//     if (elig.canVoteOnly && (!voter.canVote || voter.isBanned)) return false;

//     switch (elig.scope || 'seat') {
//         case 'all':
//         case 'country':
//             return true;

//         case 'seat': {
//             const seats = (elig.seats && elig.seats.length ? elig.seats : e.seats) || [];
//             if (!seats.length) return false;
//             return seats.some(s => norm(s) === norm(voter.seat));
//         }

//         case 'role': {
//             const roles = voter.roles || [];
//             if (!Array.isArray(elig.roles) || !elig.roles.length) return false;
//             return roles.some(r => elig.roles.includes(r));
//         }

//         case 'location': {
//             const vDistrict = norm(voter.district);
//             const eDistrict = norm(e.location?.district);
//             if (eDistrict && vDistrict) return vDistrict === eDistrict;
//             // Extend with ward/union later as needed
//             return false;
//         }

//         default:
//             return false;
//     }
// }

// /lib/eligibility.js
export function matchesElectionForVoter(e, voter) {
    const scope = e.eligibility?.scope || 'seat';
    const norm = s => (s ?? '').toString().trim().toLowerCase();
    if (scope === 'seat') {
      const vSeat = norm(voter.seat);
      const allowed = new Set(
        [
          ...(e.eligibility?.seats || []),
          ...(e.seats || []),
          ...((e.ballot || []).map(b => b.seat).filter(Boolean) || []),
        ].map(norm)
      );
      return allowed.size > 0 ? allowed.has(vSeat) : false;
    }
    // country, role, location, all — implement as needed
    return true;
  }

