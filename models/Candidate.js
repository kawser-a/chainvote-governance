// models/Candidate.js
import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter', required: true }, // linking to the Voter model
    manifesto: { type: mongoose.Schema.Types.ObjectId, ref: 'Manifesto', required: false }, // initially not uploaded
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Admin approval status
    isContestant: { type: Boolean, default: false }, // If they wish to contest the election
}, { timestamps: true });

export default mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
