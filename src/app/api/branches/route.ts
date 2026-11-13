import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import mongoose from 'mongoose';
import { normalizeMapEmbed, MAP_HELP } from '@/lib/mapEmbed';
import { normalizeWhatsApp, WA_HELP } from '@/lib/whatsapp';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

/* Public: the Home page map, the Find Us page and the WhatsApp picker read this. */
export async function GET() {
  try {
    await connectDB();
    const branches = await Branch.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 });
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const formData = await request.formData();
    console.log('Branches POST: FormData received');
    
    // Parse text fields
    const nameStr = formData.get('name') as string;
    const addressStr = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const mapEmbedUrl = formData.get('mapEmbedUrl') as string;
    const locationUrl = formData.get('locationUrl') as string;
    
    // Get files
    const imageFile = formData.get('image') as File | null;
    const menuPdfFile = formData.get('menuPdf') as File | null;

    console.log('Image File:', imageFile ? `Present (${imageFile.size} bytes)` : 'Missing');
    console.log('PDF File:', menuPdfFile ? `Present (${menuPdfFile.size} bytes)` : 'Missing');

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    const uploadFile = async (file: File) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadStream = bucket.openUploadStream(file.name, {
            metadata: { contentType: file.type }
        });
        const fileId = uploadStream.id;

        return new Promise<string>((resolve, reject) => {
            uploadStream.on('finish', () => resolve(`/api/file/${fileId}`));
            uploadStream.on('error', reject);
            uploadStream.end(buffer);
        });
    };

    let imageUrl = '';
    let menuPdfUrl = '';

    if (imageFile) {
        // Upload image to GridFS if present
        imageUrl = await uploadFile(imageFile);
    }

    if (menuPdfFile) {
        // Upload PDF to GridFS if present
        menuPdfUrl = await uploadFile(menuPdfFile); 
    }

    const name = nameStr ? JSON.parse(nameStr) : { en: '', ar: '' };
    const address = addressStr ? JSON.parse(addressStr) : { en: '', ar: '' };

    /* Both of these are optional, but a value that cannot be used is worse than
       no value: it saves cleanly and then shows nothing on the public site with
       no hint as to why. Reject it here with a reason the admin can act on. */
    let cleanMap = '';
    if (mapEmbedUrl && mapEmbedUrl.trim()) {
      cleanMap = normalizeMapEmbed(mapEmbedUrl) ?? '';
      if (!cleanMap) return NextResponse.json({ error: MAP_HELP }, { status: 400 });
    }
    if (whatsapp && whatsapp.trim() && !normalizeWhatsApp(whatsapp)) {
      return NextResponse.json({ error: WA_HELP }, { status: 400 });
    }

    const newBranch = await Branch.create({
      name,
      address,
      phone,
      whatsapp,
      mapEmbedUrl: cleanMap,
      locationUrl,
      image: imageUrl,
      menuPdf: menuPdfUrl,
    });

    return NextResponse.json(newBranch, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
