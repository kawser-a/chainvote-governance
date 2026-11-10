// import { NextResponse } from 'next/server';
// import { dbConnect } from '@/lib/db';
// import Voter from '@/models/Voter';

// export async function POST() {
//     await dbConnect();
//     const data = [
//         { nid: '1990123456789', name: 'Rahim Uddin', sims: ['01711111111', '01822222222'] },
//         { nid: '1999987654321', name: 'Ayesha Khatun', sims: ['01933333333', '01644444444'] },
//         { nid: '2001123409876', name: 'Shahid Hasan', sims: ['01555555555'] },
//     ];
//     for (const d of data) {
//         await Voter.updateOne({ nid: d.nid }, { $setOnInsert: d }, { upsert: true });
//     }
//     return NextResponse.json({ ok: true, inserted: data.length });
// }

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

const seats = [
  'Dhaka-1','Dhaka-2','Dhaka-3','Dhaka-4','Dhaka-5','Dhaka-6','Dhaka-7','Dhaka-8','Dhaka-9','Dhaka-10',
  'Chattogram-1','Chattogram-2','Chattogram-3','Chattogram-4','Chattogram-5',
  'Khulna-1','Khulna-2','Khulna-3','Khulna-4',
  'Rajshahi-1','Rajshahi-2','Rajshahi-3',
  'Sylhet-1','Sylhet-2','Sylhet-3',
  'Barishal-1','Barishal-2',
  'Rangpur-1','Rangpur-2',
  'Mymensingh-1','Mymensingh-2',
  'Gazipur-1','Gazipur-2',
  'Narayanganj-1','Narayanganj-2',
  'Cumilla-1','Cumilla-2',
  'Noakhali-1','Noakhali-2',
  'Faridpur-1','Faridpur-2',
  'Kushtia-1','Kushtia-2',
  'Bogra-1','Bogra-2',
  'Jessore-1','Jessore-2',
  'Tangail-1','Tangail-2'
];

const male = [
  'Abdul','Rahim','Karim','Hasan','Hossain','Rakib','Sabbir','Shahid','Mamun','Ashraf',
  'Farhan','Arif','Raihan','Sumon','Sajid','Imran','Fahim','Nayeem','Nadim','Shanto',
  'Sohel','Shakib','Anik','Tarek','Rashed'
];
const female = [
  'Ayesha','Fatema','Rokeya','Nazma','Rani','Shanta','Sumaiya','Farzana','Nusrat','Mitu',
  'Priya','Mim','Mouri','Rupa','Mahira','Maliha','Jannat','Sadia','Samia','Nargis',
  'Sanjida','Rodela','Orin','Shorna','Rifah'
];
const lastNames = [
  'Ahmed','Rahman','Islam','Hossain','Khan','Chowdhury','Sarker','Biswas','Sheikh','Mia',
  'Talukder','Siddique','Hasan','Alam','Kabir'
];

const prefixes = ['013','014','015','016','017','018','019'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fullName(i) {
  // alternate male/female for variety
  const first = i % 2 === 0 ? pick(male) : pick(female);
  return `${first} ${pick(lastNames)}`;
}
function phone() {
  const pref = pick(prefixes);
  const suffix = String(Math.floor(10_000_000 + Math.random()*89_999_999)).padStart(8,'0');
  return pref + suffix; // 11-digit BD number
}

export async function POST(req) {
  await dbConnect();

  const url = new URL(req.url);
  const reset = url.searchParams.get('reset') === '1';
  if (reset) {
    await Voter.deleteMany({});
  }

  const ops = [];
  for (let i = 0; i < 50; i++) {
    const nid = String(1000000000000 + i); // 13-digit
    const name = fullName(i);
    const seat = seats[i % seats.length];

    // exactly 3 phones
    const simSet = new Set();
    while (simSet.size < 3) simSet.add(phone());
    const sims = Array.from(simSet);

    // keep enrollmentDone for your login flow (not shown in admin table)
    const enrollmentDone = Math.random() < 0.7;
    const status = Math.random() < 0.06 ? 'banned' : 'active';
    const disabledVoting = Math.random() < 0.08;

    ops.push({
      updateOne: {
        filter: { nid },
        update: {
          $set: {
            nid, name, seat, sims,
            primarySim: sims[0],
            status, disabledVoting,
            enrollmentDone,
            suspiciousCount: 0
          }
        },
        upsert: true
      }
    });
  }

  if (ops.length) await Voter.bulkWrite(ops);

  const total = await Voter.countDocuments({});
  const banned = await Voter.countDocuments({ status: 'banned' });
  const disabled = await Voter.countDocuments({ disabledVoting: true });

  return NextResponse.json({ ok: true, seeded: 50, total, banned, disabled, reset });
}
