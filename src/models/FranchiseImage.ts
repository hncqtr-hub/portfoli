import mongoose from 'mongoose';

/* Photos for the Franchise page gallery, the four-photo block after Digital
   Presence. `order` maps to the block's positions (wide top, tall left, two
   stacked right). Alt text is localised the same {en, ar} way MixGrillSlide
   does it; empty means decorative, which is how the bundled photos render.

   `seedSlot` marks the four bundled photos inserted on first read (see the
   GET handler); the unique index makes that seed safe to race. `isDeleted`
   mirrors the soft delete MixGrillSlide uses. */
const FranchiseImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    alt: {
      en: { type: String, default: '' },
      ar: { type: String, default: '' },
    },
    order: { type: Number, default: 0 },
    seedSlot: { type: Number, unique: true, sparse: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.FranchiseImage ||
  mongoose.model('FranchiseImage', FranchiseImageSchema);

/* The gallery block has exactly four positions. */
export const MAX_FRANCHISE_IMAGES = 4;

/* Only images this project uploaded to its own Cloudinary account, in a format
   the admin accepts. Anything else is refused: the public page hands these to
   next/image, and a data: URL would put the binary back in the database. */
export function isAllowedImageUrl(url: unknown): url is string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return (
    typeof url === 'string' &&
    !!cloud &&
    url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`) &&
    /\.(jpe?g|png|webp)$/i.test(url)
  );
}

/* Trimmed {en, ar} alt text, or null when the shape is wrong. */
export function parseAlt(value: unknown): { en: string; ar: string } | null {
  if (value === undefined) return { en: '', ar: '' };
  if (!value || typeof value !== 'object') return null;
  const { en = '', ar = '' } = value as Record<string, unknown>;
  if (typeof en !== 'string' || typeof ar !== 'string') return null;
  if (en.length > 200 || ar.length > 200) return null;
  return { en: en.trim(), ar: ar.trim() };
}
