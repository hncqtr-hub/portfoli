
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';

import { saveFile } from '@/lib/upload';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export async function GET() {
  try {
    await connectDB();
    // Only fetch items that are not deleted
    const items = await GalleryItem.find({ isDeleted: { $ne: true } });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const formData = await request.formData();
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const style = formData.get('style') as string;
    const contentStr = formData.get('content') as string;
    const subcontentStr = formData.get('subcontent') as string;
    const image = formData.get('image') as File | null;

    let src = '';
    if (image) {
      src = await saveFile(image);
    }

    const content = contentStr ? JSON.parse(contentStr) : undefined;
    const subcontent = subcontentStr ? JSON.parse(subcontentStr) : undefined;

    await connectDB();
    const newItem = await GalleryItem.create({
      type,
      category,
      style,
      content,
      subcontent,
      src,
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}
