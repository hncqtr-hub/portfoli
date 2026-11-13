import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* Admin only: a signature lets the holder upload into our Cloudinary account. */
export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const { folder = 'hero' } = await request.json();

    // Generate Signature for Upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: folder
    }, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({
      timestamp,
      signature
    });
  } catch (error) {
    console.error('Cloudinary Signature Error:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
