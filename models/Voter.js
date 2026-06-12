import mongoose from 'mongoose';

const VoterSchema = new mongoose.Schema({
    nid: { type: String, unique: true, index: true },
    name: String,
    sims: [String],
    primarySim: { type: String, default: null },
    enrollmentDone: { type: Boolean, default: false },
    pinHash: { type: String, default: null },
    credentialSecret: { type: String, default: null },
    credentialCommitment: { type: String, default: null },
    revocationHandle: { type: String, default: null },
    disabled: { type: Boolean, default: false },  
}, { timestamps: true });

export default mongoose.models.Voter || mongoose.model('Voter', VoterSchema);
