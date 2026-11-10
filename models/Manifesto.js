// import mongoose, { Schema } from 'mongoose';

// const ManifestoSchema = new Schema(
//     {
//         candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', index: true },
//         seat: { type: String, index: true },

//         title: { type: String, required: true, trim: true },
//         summary: { type: String, default: '', trim: true },

//         // ✅ REQUIRED fixed duration window (e.g., 6 months)
//         targetWindowMonths: {
//             type: Number,
//             required: true,
//             min: 1,
//             max: 60, // adjust if you want a larger cap
//         },

//         status: {
//             type: String,
//             enum: ['pending', 'approved', 'rejected'],
//             default: 'pending',
//             index: true,
//         },
//     },
//     { timestamps: true }
// );

// export default mongoose.models.Manifesto || mongoose.model('Manifesto', ManifestoSchema);

import mongoose, { Schema } from 'mongoose';

const ManifestoSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', index: true },
    seat: { type: String, index: true },

    title: { type: String, required: true, trim: true },
    summary: { type: String, default: '', trim: true },

    // Normal: months (for production)
    targetWindowMonths: { type: Number, min: 1, max: 60 },

    // NEW: test-mode option: minutes (for fast expiry/testing)
    targetWindowMinutes: { type: Number, min: 1, max: 43200 }, // up to 30 days for safety

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// Note: We removed "required: true" on targetWindowMonths,
// and validate in API to require either months or minutes.

export default mongoose.models.Manifesto || mongoose.model('Manifesto', ManifestoSchema);
