import mongoose from 'mongoose';

/* Our Team members shown on the About Us page. Bilingual fields mirror Branch:
   an `en`/`ar` pair per text field, a GridFS url for the photo, and a soft
   `isDeleted` flag so a removal never destroys the uploaded image. `order`
   drives the sequence on the public page. */
const TeamMemberSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ar: { type: String },
    },
    role: {
      en: { type: String, required: true },
      ar: { type: String },
    },
    desc: {
      en: { type: String },
      ar: { type: String },
    },
    image: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.TeamMember ||
  mongoose.model('TeamMember', TeamMemberSchema);
