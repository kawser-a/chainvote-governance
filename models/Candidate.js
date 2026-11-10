// /models/Candidate.js
import mongoose, { Schema } from 'mongoose';

// const CandidateSchema = new Schema(
//     {
//         // Required identity & contact
//         name: { type: String, required: true },
//         gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
//         age: { type: Number, min: 18 },
//         seat: { type: String, required: true, index: true }, // e.g., "Dhaka-1"
//         nid: { type: String, required: true, unique: true },
//         phone: { type: String, required: true },
//         email: { type: String, required: true, unique: true, index: true },

//         // Party / candidature
//         partyName: { type: String, default: null },            // null => independent
//         independent: { type: Boolean, default: false },
//         approved: { type: Boolean, default: true },            // added by admin after EC approval
//         active: { type: Boolean, default: true },              // admin can disable

//         // Auth (candidate portal)
//         passwordHash: { type: String, required: true },

//         // Public profile
//         bio: { type: String, default: '' },

//         // Extended profile (NEW)
//         partyPosition: { type: String, default: '' },
//         education: [
//             {
//                 degree: String,         // e.g., BSc in CSE
//                 institution: String,    // e.g., BUET
//                 year: String,           // e.g., 2018
//                 // _id subdoc is added by Mongoose automatically (ObjectId)
//             },
//         ],
//         leadership: [
//             {
//                 role: String,           // e.g., Union Parishad Member
//                 org: String,            // e.g., Local Youth Club
//                 period: String,         // e.g., 2019–2022
//                 // _id auto
//             },
//         ],
//         futureGoals: { type: String, default: '' },
//         currentOccupation: { type: String, default: '' },
//         speech50: { type: String, default: '' },               // up to ~50 words
//     },
//     { timestamps: true }
// );
const CandidateSchema = new Schema(
    {
      // Required identity & contact
      name: { type: String, required: true },
      gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
      age: { type: Number, min: 18 },
      seat: { type: String, required: true, index: true },
      nid: { type: String, required: true, unique: true },
      phone: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },

      // Party / candidature
      partyName: { type: String, default: null },
      independent: { type: Boolean, default: false },
      approved: { type: Boolean, default: true },
      active: { type: Boolean, default: true },

      // Auth
      passwordHash: { type: String, required: true },

      // Public profile
      bio: { type: String, default: '' },

      // Extended profile
      partyPosition: { type: String, default: '' },
      education: [{ degree: String, institution: String, year: String }],
      leadership: [{ role: String, org: String, period: String }],
      futureGoals: { type: String, default: '' },
      currentOccupation: { type: String, default: '' },
      speech50: { type: String, default: '' },

      // NEW flags for removal via petitions
      removed: { type: Boolean, default: false },
      removedAt: { type: Date, default: null },
      removedReason: { type: String, default: '' },
    },
    { timestamps: true }
  );

export default mongoose.models.Candidate ||
    mongoose.model('Candidate', CandidateSchema);
