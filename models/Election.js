
import mongoose, { Schema } from 'mongoose';

const BallotItemSchema = new Schema({
    manifestoId: { type: Schema.Types.ObjectId, ref: 'Manifesto' },
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' },
    seat: String,
    title: String,

    // ⬇️ snapshot for manifesto duration (optional for old elections)
    targetMonths: { type: Number },

    proposal: {
        title: String,
        reason: String,
        impact: String,
        costOrTime: String,
        options: [{ key: String, label: String }],
    },
}, { _id: true });

const ElectionSchema = new Schema(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['national', 'local', 'presidential', 'constituent', 'decision', 'policy'],
            required: true,
            index: true,
        },

        // For presidential: how votes are cast/authorized
        voteMode: { type: String, enum: ['direct', 'indirect'], default: 'direct' },

        // Optional: local level
        level: { type: String, default: null }, // 'councillor' | 'chairman' | 'mayor' | null

        // Seat targeting (national/local seat-based)
        seats: [{ type: String }],

        // Geographic scope for local
        location: {
            country: { type: String, default: 'Bangladesh' },
            division: String,
            district: String,
            upazila: String,
            union: String,
            ward: String,
            city: String,
        },

        // Eligibility rules
        eligibility: {
            scope: { type: String, enum: ['all', 'country', 'seat', 'location', 'role'], default: 'seat' },
            seats: [String],        // for 'seat'
            roles: [String],        // for 'role' (e.g. ['MP'])
            requireEnrolled: { type: Boolean, default: true },
            canVoteOnly: { type: Boolean, default: true },
            minAge: { type: Number, default: 18 },
        },

        // Ballot behavior
        ballotType: { type: String, enum: ['manifesto', 'candidate', 'proposal'], default: 'manifesto' },
        multiSelect: { type: Boolean, default: true },
        ballot: [BallotItemSchema],

        startAt: { type: Date, required: true },
        endAt: { type: Date, required: true },

        // ⏸️ add "paused"
        status: {
            type: String,
            enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'],
            default: 'draft',
            index: true
        },

        // Pause meta (optional)
        pausedAt: { type: Date, default: null },
        pauseReason: { type: String, default: '' },

        createdBy: { type: String, default: null },
        updatedBy: { type: String, default: null },
    },
    { timestamps: true }
);

ElectionSchema.index({ type: 1, status: 1, startAt: 1, endAt: 1 });
ElectionSchema.index({ 'eligibility.scope': 1 });

export default mongoose.models.Election || mongoose.model('Election', ElectionSchema);
