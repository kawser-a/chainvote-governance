// models/Manifesto.js
import mongoose from 'mongoose';

const ManifestoSchema = new mongoose.Schema({
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    details: { type: String, required: true },
    timeline: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Manifesto || mongoose.model('Manifesto', ManifestoSchema);
