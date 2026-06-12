// models/Vote.js
import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
    manifesto: { type: mongoose.Schema.Types.ObjectId, ref: 'Manifesto', required: true },
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter', required: true }, // Who voted
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
}, { timestamps: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
