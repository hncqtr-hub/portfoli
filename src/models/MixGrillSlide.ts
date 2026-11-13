import mongoose from 'mongoose';

/* Slides for the Home page Mix Grill section.

   The section's artwork carries its own copy, so `imageUrl` is the only
   required field. Title and description are kept for the accessibility tree
   (the public section renders them screen-reader only, as it always has) and
   are localised the same {en, ar} way GalleryItem does it.

   `isDeleted` mirrors the soft delete GalleryItem uses, so removing a slide
   never destroys the record. */
const LocalisedText = {
  en: { type: String, default: '' },
  ar: { type: String, default: '' },
};

const MixGrillSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: LocalisedText,
    description: LocalisedText,
    ctaText: LocalisedText,
    ctaHref: { type: String, default: '/menu' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.MixGrillSlide ||
  mongoose.model('MixGrillSlide', MixGrillSlideSchema);
