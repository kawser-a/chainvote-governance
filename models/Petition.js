// // import mongoose, { Schema } from 'mongoose';

// // const PetitionSchema = new Schema({
// //   voterNid: { type: String, index: true, required: true },
// //   candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', index: true },
// //   manifestoId: { type: Schema.Types.ObjectId, ref: 'Manifesto', index: true },
// //   electionId: { type: Schema.Types.ObjectId, ref: 'Election', index: true },

// //   reason: { type: String, required: true, trim: true, maxlength: 500 },
// //   requestedAction: { type: String, default: 'remove' }, // or 'investigate', etc.
// //   status: { type: String, enum: ['submitted', 'reviewed', 'accepted', 'rejected'], default: 'submitted', index: true },
// // }, { timestamps: true });

// // export default mongoose.models.Petition || mongoose.model('Petition', PetitionSchema);

// import mongoose, { Schema } from 'mongoose';

// const PetitionSchema = new Schema({
//   electionId: { type: Schema.Types.ObjectId, ref: 'Election', index: true },
//   candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', index: true },
//   manifestoId: { type: Schema.Types.ObjectId, ref: 'Manifesto', index: true },
//   voterNid: { type: String, index: true },
//   reason: { type: String, default: '' },
//   status: {
//     type: String,
//     enum: ['open', 'under_review', 'accepted', 'rejected', 'dismissed'],
//     default: 'open',
//     index: true,
//   },
// }, { timestamps: true });

// export default mongoose.models.Petition || mongoose.model('Petition', PetitionSchema);


// /models/Petition.js
import mongoose, { Schema } from 'mongoose';

const PetitionSchema = new Schema({
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', index: true, required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', index: true, required: true },
  manifestoId: { type: Schema.Types.ObjectId, ref: 'Manifesto', index: true, required: true },
  voterNid: { type: String, index: true, required: true },
  reason: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'under_review', 'accepted', 'rejected', 'dismissed'],
    default: 'open',
    index: true,
  },
}, { timestamps: true });

// Prevent duplicate petition by the same voter for the same manifesto in an election
PetitionSchema.index({ electionId: 1, candidateId: 1, manifestoId: 1, voterNid: 1 }, { unique: true });

export default mongoose.models.Petition || mongoose.model('Petition', PetitionSchema);
