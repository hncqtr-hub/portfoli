import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String }
  },
  address: {
    en: { type: String, required: true },
    ar: { type: String }
  },
  phone: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  mapEmbedUrl: {
    type: String,
  },
  locationUrl: { // Direct link to Google Maps
    type: String, 
  },
  image: {
    type: String,
  },
  menuPdf: {
    type: String, // URL to the uploaded PDF
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.models.Branch || mongoose.model('Branch', BranchSchema);
