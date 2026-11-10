import mongoose, { Schema } from 'mongoose';

const VoteSchema = new Schema(
    {
        electionId: { type: Schema.Types.ObjectId, ref: 'Election', index: true },
        voterNid: { type: String, index: true },
        seat: { type: String, index: true },

        // What the voter selected (depends on election.ballotType)
        // manifesto flow (national): manifestoId
        manifestoId: { type: Schema.Types.ObjectId, ref: 'Manifesto', index: true },
        // candidate flow (presidential/local direct): candidateId
        candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', index: true },
        // proposal flow (decision/policy): optionKey under a given ballot item
        // ballotItemId is the proposal item _id inside election.ballot
        ballotItemId: { type: Schema.Types.ObjectId },
        optionKey: { type: String }, // 'agree' | 'agree_conditional' | 'disagree', etc.

        // (optional) simple chain fields
        prevHash: { type: String, default: null },
        hash: { type: String, required: true },
    },
    { timestamps: true }
);

// Constraints:
// - For manifesto: allow multiple per election (one per manifesto)
// - For candidate: usually single-choice; enforced in API (unique (electionId, voterNid))
// - For proposals: allow one vote per proposal item per voter
VoteSchema.index({ electionId: 1, voterNid: 1, manifestoId: 1 }, { unique: true, partialFilterExpression: { manifestoId: { $exists: true } } });
VoteSchema.index({ electionId: 1, voterNid: 1, candidateId: 1 }, { unique: true, partialFilterExpression: { candidateId: { $exists: true } } });
VoteSchema.index({ electionId: 1, voterNid: 1, ballotItemId: 1 }, { unique: true, partialFilterExpression: { ballotItemId: { $exists: true } } });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
