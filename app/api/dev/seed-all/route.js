import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import Voter from '@/models/Voter';
import Otp from '@/models/Otp';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const maleFirst = ['Rahim','Karim','Hasan','Shahid','Rakib','Ashiq','Masud','Fahim','Arif','Shanto','Rafi','Saif','Jubayer','Naim','Farhan','Imran','Nayeem','Sohag','Noman','Touhid'];
const femaleFirst = ['Ayesha','Fatema','Nusrat','Rima','Sumaiya','Tamanna','Priya','Sadia','Shorna','Mim','Ritu','Monira','Farzana','Sharmin','Jannat','Meherin','Laboni','Mahi','Joya','Sanjiya'];
const lastNames = ['Uddin','Hassan','Khan','Chowdhury','Sarkar','Mia','Biswas','Rahman','Khatun','Akter','Begum','Sultana','Haque','Banu','Ahmed','Mollah','Talukder','Sheikh','Mondol','Patwary'];

const seatBuckets = [
  ...Array.from({length: 12}, (_,i)=>`Dhaka-${i+1}`),
  ...Array.from({length: 8},  (_,i)=>`Chittagong-${i+1}`),
  ...Array.from({length: 6},  (_,i)=>`Khulna-${i+1}`),
  ...Array.from({length: 5},  (_,i)=>`Rajshahi-${i+1}`),
  ...Array.from({length: 4},  (_,i)=>`Sylhet-${i+1}`),
  ...Array.from({length: 4},  (_,i)=>`Barisal-${i+1}`),
  ...Array.from({length: 4},  (_,i)=>`Rangpur-${i+1}`),
  ...Array.from({length: 4},  (_,i)=>`Mymensingh-${i+1}`),
];

const prefixes = ['013','014','015','016','017','018','019'];
const rand = a => a[Math.floor(Math.random()*a.length)];
const phone = () => `${rand(prefixes)}${String(Math.floor(10_000_000 + Math.random()*89_999_999))}`.slice(0,11);
const genNid = () => String(Math.floor(1000000000000 + Math.random()*8999999999999)); // 13 digits

export async function POST() {
  try {
    // Safety: block in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'Blocked in production' }, { status: 403 });
    }

    await dbConnect();

    // Drop collections if they exist
    const db = mongoose.connection.db;
    const existing = await db.listCollections().toArray();
    const hasVoters = existing.some(c => c.name === 'voters');
    const hasOtps   = existing.some(c => c.name === 'otps');

    if (hasVoters) await db.dropCollection('voters');
    if (hasOtps)   await db.dropCollection('otps');

    // Recreate collections & indexes
    await Voter.createCollection();
    await Otp.createCollection();
    await Voter.syncIndexes(); // ensures unique nid etc.
    await Otp.syncIndexes();

    // Build 50 voters
    const total = 50;
    const rows = [];
    const pinHash = await bcrypt.hash('123456', 10);

    for (let i=0;i<total;i++){
      const isFemale = Math.random() < 0.48;
      const name  = `${isFemale ? rand(femaleFirst) : rand(maleFirst)} ${rand(lastNames)}`;
      const seat  = rand(seatBuckets);
      const sims = new Set(); while (sims.size < 3) sims.add(phone());

      const enrolled = Math.random() < 0.55;
      const credentialSecret = enrolled ? crypto.randomBytes(32).toString('hex') : null;
      const credentialCommitment = enrolled ? crypto.createHash('sha256').update(`${i}:${credentialSecret}`).digest('hex') : null;
      const revocationHandle = enrolled ? crypto.createHash('sha256').update(`${i}:rev`).digest('hex') : null;

      rows.push({
        nid: genNid(),
        name,
        gender: isFemale ? 'Female' : 'Male',
        seat,
        sims: Array.from(sims),
        primarySim: null,
        enrollmentDone: enrolled,
        pinHash: enrolled ? pinHash : null,
        credentialSecret,
        credentialCommitment,
        revocationHandle,
        canVote: true,
        isBanned: false,
      });
    }

    // Insert all at once (faster & index-safe)
    await Voter.insertMany(rows, { ordered: false });

    const counts = {
      total: await Voter.countDocuments({}),
      enrolled: await Voter.countDocuments({ enrollmentDone: true }),
    };

    return NextResponse.json({
      ok: true,
      message: 'Database reset & seeded.',
      note: 'Demo PIN for enrolled users: 123456',
      counts
    });
  } catch (e) {
    console.error('Seed-all error:', e);
    return NextResponse.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
