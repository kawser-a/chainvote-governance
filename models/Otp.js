import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    nid: { type: String, index: true },
    msisdn: String,
    code: String,
    purpose: { type: String, default: 'enroll' },
    expiresAt: { type: Date, index: true },
    used: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
