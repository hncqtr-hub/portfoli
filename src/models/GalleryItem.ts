import mongoose from 'mongoose';

const GalleryItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'text'],
    required: true,
  },
  src: {
    type: String,
    // required if type is image
  },
  category: {
    type: String,
  },
  content: {
    en: String,
    ar: String,
  },
  subcontent: {
    en: String,
    ar: String,
  },
  style: {
    type: String,
    enum: ['large', 'small'],
  },
  column: {
    type: Number,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
