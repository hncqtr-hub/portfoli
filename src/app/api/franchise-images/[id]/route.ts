import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import FranchiseImage, { isAllowedImageUrl, parseAlt } from '@/models/FranchiseImage';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Image not found' }, { status: 404 });

/* Replace the photo and/or edit its alt text. Body: { imageUrl?, alt? };
   whatever is left out stays as it is. */
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;
    const { id } = await props.params;

    const body = await request.json().catch(() => null);
    const update: Record<string, unknown> = {};
    if (body?.imageUrl !== undefined) {
      if (!isAllowedImageUrl(body.imageUrl)) {
        return NextResponse.json(
          { error: 'Upload a JPG, PNG or WebP image to Cloudinary first.' },
          { status: 400 },
        );
      }
      update.imageUrl = body.imageUrl;
    }
    if (body?.alt !== undefined) {
      const alt = parseAlt(body.alt);
      if (!alt) {
        return NextResponse.json({ error: 'Alt text must be 200 characters or fewer.' }, { status: 400 });
      }
      update.alt = alt;
    }
    if (!Object.keys(update).length) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(id)) return notFound();
    await connectDB();
    const image = await FranchiseImage.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      update,
      { new: true },
    );
    return image ? NextResponse.json(image) : notFound();
  } catch (error) {
    console.error('Error updating franchise image:', error);
    return NextResponse.json({ error: 'Failed to update the image' }, { status: 500 });
  }
}

/* Soft delete, like Mix Grill slides. The photos after it close up on their
   own, since the page orders by `order` rather than reading fixed slots. */
export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;
    const { id } = await props.params;
    if (!mongoose.isValidObjectId(id)) return notFound();

    await connectDB();
    const image = await FranchiseImage.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { isDeleted: true },
    );
    return image ? NextResponse.json({ success: true }) : notFound();
  } catch (error) {
    console.error('Error deleting franchise image:', error);
    return NextResponse.json({ error: 'Failed to delete the image' }, { status: 500 });
  }
}
