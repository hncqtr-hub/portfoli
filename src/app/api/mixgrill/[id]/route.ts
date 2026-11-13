import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MixGrillSlide from '@/models/MixGrillSlide';
import { saveFile } from '@/lib/upload';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;
    const { id } = await props.params;
    const formData = await request.formData();

    const update: Record<string, unknown> = {
      title: { en: formData.get('titleEn') || '', ar: formData.get('titleAr') || '' },
      description: {
        en: formData.get('descriptionEn') || '',
        ar: formData.get('descriptionAr') || '',
      },
      ctaText: { en: formData.get('ctaTextEn') || '', ar: formData.get('ctaTextAr') || '' },
      ctaHref: (formData.get('ctaHref') as string) || '/menu',
      order: Number(formData.get('order') ?? 0),
      isActive: formData.get('isActive') !== 'false',
    };

    /* Image is optional on edit: left alone unless a new one is supplied. */
    const urlField = formData.get('imageUrl') as string | null;
    if (urlField) update.imageUrl = urlField;
    const file = formData.get('image');
    if (file instanceof File && file.size > 0) update.imageUrl = await saveFile(file);

    await connectDB();
    const slide = await MixGrillSlide.findByIdAndUpdate(id, update, { new: true });
    if (!slide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating mix grill slide:', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

/* Soft delete, matching how gallery items are retired. */
export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;
    const { id } = await props.params;
    await connectDB();
    const slide = await MixGrillSlide.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!slide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mix grill slide:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
