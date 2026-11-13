
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';

import { saveFile } from '@/lib/upload';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;
    
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const category = formData.get('category') as string;
    const style = formData.get('style') as string;
    const contentStr = formData.get('content') as string;
    const subcontentStr = formData.get('subcontent') as string;
    const image = formData.get('image') as File | null;

    const updateData: any = {
      type,
      category,
      style,
    };

    if (image) {
      updateData.src = await saveFile(image);
    }
    
    if (contentStr) updateData.content = JSON.parse(contentStr);
    if (subcontentStr) updateData.subcontent = JSON.parse(subcontentStr);

    await connectDB();
    
    // Ensure we don't update a soft-deleted item
    const updatedItem = await GalleryItem.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } }, 
      updateData, 
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Gallery item not found or deleted' }, { status: 404 });
    }
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;
    await connectDB();
    // Soft delete: update isDeleted to true instead of removing the document
    const softDeletedItem = await GalleryItem.findByIdAndUpdate(
      id, 
      { isDeleted: true }, 
      { new: true, strict: false }
    );
    
    if (!softDeletedItem) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Gallery item soft deleted', item: softDeletedItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
