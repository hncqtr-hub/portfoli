import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FranchiseImage, {
  MAX_FRANCHISE_IMAGES,
  isAllowedImageUrl,
  parseAlt,
} from '@/models/FranchiseImage';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

/* The photos the gallery shipped with, in position order. */
const BUNDLED = [
  '/images/franchise_sofa.jpg',
  '/images/franchise_dish.jpg',
  '/images/franchise_table1.jpg',
  '/images/franchise_table2.jpg',
];

/* A brand-new collection starts out holding the bundled photos, so the page
   looks the same the day this ships and the admin sees what is live. Soft
   deletes keep records around, so an emptied gallery is never reseeded; the
   upsert on the unique seedSlot makes a race between first reads harmless. */
async function seedIfNew() {
  if ((await FranchiseImage.estimatedDocumentCount()) > 0) return;
  await FranchiseImage.bulkWrite(
    BUNDLED.map((imageUrl, i) => ({
      updateOne: {
        filter: { seedSlot: i },
        update: { $setOnInsert: { imageUrl, order: i, seedSlot: i } },
        upsert: true,
      },
    })),
    { ordered: false },
  ).catch((error) => {
    if (error?.code !== 11000) throw error;
  });
}

const active = () =>
  FranchiseImage.find({ isDeleted: { $ne: true } }).sort({ order: 1, createdAt: 1 });

/* Public read, in display order. */
export async function GET() {
  try {
    await connectDB();
    await seedIfNew();
    return NextResponse.json(await active());
  } catch (error) {
    console.error('Error fetching franchise images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

/* Adds a photo at the next free position. Body: { imageUrl, alt? }. */
export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    if (!isAllowedImageUrl(body?.imageUrl)) {
      return NextResponse.json(
        { error: 'Upload a JPG, PNG or WebP image to Cloudinary first.' },
        { status: 400 },
      );
    }
    const alt = parseAlt(body.alt);
    if (!alt) {
      return NextResponse.json({ error: 'Alt text must be 200 characters or fewer.' }, { status: 400 });
    }

    await connectDB();
    // ponytail: count-then-insert, a double submit could add a fifth; the page only ever shows four
    const current = await active();
    if (current.length >= MAX_FRANCHISE_IMAGES) {
      return NextResponse.json(
        { error: 'The gallery already has 4 photos. Replace or delete one first.' },
        { status: 409 },
      );
    }
    const order = current.length ? current[current.length - 1].order + 1 : 0;
    const image = await FranchiseImage.create({ imageUrl: body.imageUrl, alt, order });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error creating franchise image:', error);
    return NextResponse.json({ error: 'Failed to add the image' }, { status: 500 });
  }
}

/* Reorder. Body: { ids } - every live photo's id, in the new display order. */
export async function PATCH(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const ids: unknown = body?.ids;
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'ids must be a list of image ids.' }, { status: 400 });
    }

    await connectDB();
    const current = (await active()).map((img) => String(img._id));
    const sameSet =
      ids.length === current.length &&
      new Set(ids).size === ids.length &&
      ids.every((id) => current.includes(id));
    if (!sameSet) {
      return NextResponse.json(
        { error: 'The gallery changed in the meantime. Reload and try again.' },
        { status: 409 },
      );
    }

    await FranchiseImage.bulkWrite(
      ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })),
    );
    return NextResponse.json(await active());
  } catch (error) {
    console.error('Error reordering franchise images:', error);
    return NextResponse.json({ error: 'Failed to save the order' }, { status: 500 });
  }
}
