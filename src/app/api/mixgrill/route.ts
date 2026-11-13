import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MixGrillSlide from '@/models/MixGrillSlide';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';
import { saveFile } from '@/lib/upload';

export const dynamic = 'force-dynamic';

/* Public read. `all=1` (Super Admin only) returns inactive slides too, so the
   management list can show and toggle them. */
export async function GET(request: Request) {
  try {
    const wantAll = new URL(request.url).searchParams.get('all') === '1';
    if (wantAll) {
      const denied = await denyUnlessSuperAdmin();
      if (denied) return denied;
    }
    await connectDB();
    const query: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (!wantAll) query.isActive = true;
    const slides = await MixGrillSlide.find(query).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error fetching mix grill slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const formData = await request.formData();

    /* Either a Cloudinary URL the admin already uploaded, or a raw file that
       falls back to the project's saveFile helper. */
    let imageUrl = (formData.get('imageUrl') as string | null) || '';
    const file = formData.get('image');
    if (file instanceof File && file.size > 0) imageUrl = await saveFile(file);

    if (!imageUrl) {
      return NextResponse.json({ error: 'A slide image is required' }, { status: 400 });
    }

    await connectDB();
    const slide = await MixGrillSlide.create({
      imageUrl,
      title: { en: formData.get('titleEn') || '', ar: formData.get('titleAr') || '' },
      description: {
        en: formData.get('descriptionEn') || '',
        ar: formData.get('descriptionAr') || '',
      },
      ctaText: { en: formData.get('ctaTextEn') || '', ar: formData.get('ctaTextAr') || '' },
      ctaHref: (formData.get('ctaHref') as string) || '/menu',
      order: Number(formData.get('order') ?? 0),
      isActive: formData.get('isActive') !== 'false',
    });
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('Error creating mix grill slide:', error);
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}
