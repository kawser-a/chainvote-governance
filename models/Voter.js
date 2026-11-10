import mongoose from 'mongoose';

const VoterSchema = new mongoose.Schema({
    nid: { type: String, unique: true, index: true },
    name: String,
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    seat: { type: String, index: true },              // e.g., "Dhaka-1"
    sims: [String],                                    // >= 3 numbers
    primarySim: { type: String, default: null },

    // enrollment & credential
    enrollmentDone: { type: Boolean, default: false, index: true },
    pinHash: { type: String, default: null },
    credentialSecret: { type: String, default: null },
    credentialCommitment: { type: String, default: null },
    revocationHandle: { type: String, default: null },

    // admin controls
    canVote: { type: Boolean, default: true, index: true },
    isBanned: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export default mongoose.models.Voter || mongoose.model('Voter', VoterSchema);
