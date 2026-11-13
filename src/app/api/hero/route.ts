import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import HeroSettings from '@/models/HeroSettings';
import { saveFile } from '@/lib/upload';
import mongoose from 'mongoose';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (db) {
      const settings = await db.collection('herosettings').findOne({}, { sort: { createdAt: -1 } });
      return NextResponse.json(settings);
    }
    const settings = await HeroSettings.findOne().sort({ createdAt: -1 });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch hero settings in GET API:", error);
    return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const formData = await request.formData();
    await connectDB();
    
    // Find existing settings or create new object
    let settings = await HeroSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
        settings = new HeroSettings({ bannerImageUrl: '', openingSoonImages: [] });
    }

    // handle banner image - either Cloudinary URL or direct file upload
    const bannerImageUrl = formData.get('bannerImageUrl') as string | null;
    if (bannerImageUrl) {
        settings.bannerImageUrl = bannerImageUrl;
    }

    // handle banner image file upload
    const bannerFile = formData.get('bannerImage');
    if (bannerFile instanceof File) {
        const imageUrl = await saveFile(bannerFile);
        settings.bannerImageUrl = imageUrl;
    }

    // handle mobile banner image - either Cloudinary URL or direct file upload
    const mobileBannerImageUrl = formData.get('mobileBannerImageUrl') as string | null;
    if (mobileBannerImageUrl) {
        settings.mobileBannerImageUrl = mobileBannerImageUrl;
    }

    // handle mobile banner image file upload
    const mobileBannerFile = formData.get('mobileBannerImage');
    if (mobileBannerFile instanceof File) {
        const imageUrl = await saveFile(mobileBannerFile);
        settings.mobileBannerImageUrl = imageUrl;
    }

    // handle opening soon images (fixed 3 slots)
    const currentImages = settings.openingSoonImages || [];
    // Ensure array has at least 3 slots
    while (currentImages.length < 3) currentImages.push('');
    
    const newImages = [...currentImages];

    for (let i = 0; i < 3; i++) {
        const imageFile = formData.get(`openingSoonImage${i + 1}`);
        if (imageFile instanceof File) {
             const imageUrl = await saveFile(imageFile);
             newImages[i] = imageUrl;
        }
    }
    settings.openingSoonImages = newImages;

    // handle offer images (dynamic list)
    if (formData.has('offers') || formData.has('offers[]')) {
         const offerItems = formData.getAll('offers');
         const processedOffers: string[] = [];

         for (const item of offerItems) {
            if (item instanceof File) {
                 const url = await saveFile(item);
                 processedOffers.push(url);
            } else if (typeof item === 'string') {
                 processedOffers.push(item);
            }
         }
         settings.offerImages = processedOffers;
    }

    // Save
    const savedSettings = await settings.save();

    return NextResponse.json(savedSettings, { status: 200 });
  } catch (error) {
    console.error('Error updating hero settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
