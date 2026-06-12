// models/Election.js
import mongoose from 'mongoose';

const ElectionSchema = new mongoose.Schema({
    type: { type: String, required: true }, // national, local, policy vote, etc.
    status: { type: String, required: true, enum: ['ongoing', 'upcoming', 'completed'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, default: null }, // Only for local elections
    electionType: { type: String, enum: ['party', 'individual'], required: true },
}, { timestamps: true });

export default mongoose.models.Election || mongoose.model('Election', ElectionSchema);
