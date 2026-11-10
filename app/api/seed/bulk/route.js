import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

const maleFirst = ['Rahim', 'Karim', 'Hasan', 'Shahid', 'Rakib', 'Ashiq', 'Masud', 'Fahim', 'Arif', 'Shanto', 'Rafi', 'Saif', 'Jubayer', 'Naim', 'Farhan', 'Imran', 'Nayeem', 'Sohag', 'Noman', 'Touhid'];
const femaleFirst = ['Ayesha', 'Fatema', 'Nusrat', 'Rima', 'Sumaiya', 'Tamanna', 'Priya', 'Sadia', 'Shorna', 'Mim', 'Ritu', 'Monira', 'Farzana', 'Sharmin', 'Jannat', 'Meherin', 'Laboni', 'Mahi', 'Joya', 'Sanjiya'];
const lastNames = ['Uddin', 'Hassan', 'Khan', 'Chowdhury', 'Sarkar', 'Mia', 'Biswas', 'Rahman', 'Khatun', 'Akter', 'Begum', 'Sultana', 'Haque', 'Banu', 'Ahmed', 'Mollah', 'Talukder', 'Sheikh', 'Mondol', 'Patwary'];

const seatBuckets = [
    ...Array.from({ length: 12 }, (_, i) => `Dhaka-${i + 1}`),
    ...Array.from({ length: 8 }, (_, i) => `Chittagong-${i + 1}`),
    ...Array.from({ length: 6 }, (_, i) => `Khulna-${i + 1}`),
    ...Array.from({ length: 5 }, (_, i) => `Rajshahi-${i + 1}`),
    ...Array.from({ length: 4 }, (_, i) => `Sylhet-${i + 1}`),
    ...Array.from({ length: 4 }, (_, i) => `Barisal-${i + 1}`),
    ...Array.from({ length: 4 }, (_, i) => `Rangpur-${i + 1}`),
    ...Array.from({ length: 4 }, (_, i) => `Mymensingh-${i + 1}`),
];

const prefixes = ['013', '014', '015', '016', '017', '018', '019'];
function randEl(a) { return a[Math.floor(Math.random() * a.length)]; }
function phone() { return `${randEl(prefixes)}${String(Math.floor(10_000_000 + Math.random() * 89_999_999))}`.slice(0, 11); }
function nid() { return String(Math.floor(1000000000000 + Math.random() * 8999999999999)); } // 13 digits

export async function POST() {
    await dbConnect();

    const total = 50;
    const rows = [];

    for (let i = 0; i < total; i++) {
        const isFemale = Math.random() < 0.48;
        const first = isFemale ? randEl(femaleFirst) : randEl(maleFirst);
        const last = randEl(lastNames);
        const name = `${first} ${last}`;
        const seat = randEl(seatBuckets);

        const sims = new Set();
        while (sims.size < 3) sims.add(phone());

        rows.push({
            nid: nid(),
            name,
            gender: isFemale ? 'Female' : 'Male',
            seat,
            sims: Array.from(sims),
            primarySim: null,

            // IMPORTANT: not registered
            enrollmentDone: false,
            pinHash: null,
            credentialSecret: null,
            credentialCommitment: null,
            revocationHandle: null,

            canVote: true,
            isBanned: false,
        });
    }

    for (const d of rows) {
        await Voter.updateOne({ nid: d.nid }, { $setOnInsert: d }, { upsert: true });
    }
    return NextResponse.json({ ok: true, inserted: rows.length, note: 'All seeded voters are UNREGISTERED (pinHash null).' });
}
