import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import { saveFile } from '@/lib/upload';
import mongoose from 'mongoose';
import { normalizeMapEmbed, MAP_HELP } from '@/lib/mapEmbed';
import { normalizeWhatsApp, WA_HELP } from '@/lib/whatsapp';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;
    
    // Log the incoming request details
    const formData = await request.formData();
    console.log(`Branches PUT [${id}]: FormData received`);

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

    const deleteGridFSFile = async (url: string) => {
        if (!url || !url.includes('/api/file/')) return;
        const fileId = url.split('/api/file/')[1];
        if (mongoose.Types.ObjectId.isValid(fileId)) {
            try {
                await bucket.delete(new mongoose.Types.ObjectId(fileId));
            } catch (e) {
                console.warn(`Failed to delete GridFS file ${fileId}`, e);
            }
        }
    };

    // Get current branch to check for old files
    const currentBranch = await Branch.findById(id);
    if (!currentBranch) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (nameStr) updateData.name = JSON.parse(nameStr);
    if (addressStr) updateData.address = JSON.parse(addressStr);
    if (phone) updateData.phone = phone;
    if (locationUrl) updateData.locationUrl = locationUrl;

    /* These two are optional and keyed off whether the field was sent at all,
       not whether it is truthy: `if (value)` meant an admin could never clear a
       number or a map once one had been saved. */
    if (formData.has('whatsapp')) {
      const typed = (whatsapp || '').trim();
      if (typed && !normalizeWhatsApp(typed)) {
        return NextResponse.json({ error: WA_HELP }, { status: 400 });
      }
      updateData.whatsapp = typed;
    }

    if (formData.has('mapEmbedUrl')) {
      const typed = (mapEmbedUrl || '').trim();
      if (typed) {
        const clean = normalizeMapEmbed(typed);
        if (!clean) return NextResponse.json({ error: MAP_HELP }, { status: 400 });
        updateData.mapEmbedUrl = clean;
      } else {
        updateData.mapEmbedUrl = '';
      }
    }

    if (imageFile) {
      if (currentBranch.image) await deleteGridFSFile(currentBranch.image);
      updateData.image = await uploadFile(imageFile);
    }

    if (menuPdfFile) {
        console.log('Processing PDF upload...');
        if (currentBranch.menuPdf) await deleteGridFSFile(currentBranch.menuPdf);
        updateData.menuPdf = await uploadFile(menuPdfFile);
    }

    const updatedBranch = await Branch.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedBranch);
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    const params = await props.params;
    const { id } = params;
    await connectDB();
    const deletedBranch = await Branch.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, strict: false }
    );

    if (!deletedBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
  }
}
