
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import GalleryItem from '@/models/GalleryItem';
import galleryData from '@/data/gallery.json';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

/* A one-off seed that writes to the database, despite being a GET. */
export async function GET() {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    await connectDB();
    
    // Check if data already exists to avoid duplicates
    const count = await GalleryItem.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: 'Data already migrated', count });
    }

    // Transform data to match new schema
    // The current JSON structure needs to be adapted for bilingual support
    // We will initialize 'en' fields with existing content, 'ar' fields will be empty/placeholder
    const validData = galleryData.map((item: any) => {
      // Basic transformation
      const newItem: any = {
        type: item.type,
        category: item.category,
        column: item.column,
        style: item.style,
      };

      if (item.type === 'image') {
        newItem.src = item.src;
      } else if (item.type === 'text') {
         newItem.content = { en: item.content, ar: '' };
         if (item.subcontent) {
            newItem.subcontent = { en: item.subcontent, ar: '' };
         }
      }

      return newItem;
    });

    await GalleryItem.insertMany(validData);

    return NextResponse.json({ message: 'Migration successful', count: validData.length });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
