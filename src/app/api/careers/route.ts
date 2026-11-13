import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CareerApplication from '@/models/CareerApplication';
import { saveFile } from '@/lib/upload';
import mongoose from 'mongoose';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

/* Admin only: applicants' contact details and résumé links. POST stays public
   for the careers form. */
export async function GET() {
  try {
    const denied = await denyUnlessSuperAdmin();
    if (denied) return denied;

    await connectDB();
    const applications = await CareerApplication.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch career applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const position = formData.get('position') as string;
    const message = formData.get('message') as string;
    const resumeFile = formData.get('resume') as File | null;

    if (!name || !email || !phone || !message || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    let resumeUrl = '';
    if (resumeFile) {
      const db = mongoose.connection.db;
      if (!db) {
         throw new Error('Database connection is not active');
      }

      const bucket = new mongoose.mongo.GridFSBucket(db, {
         bucketName: 'uploads'
      });

      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      const uploadStream = bucket.openUploadStream(resumeFile.name, {
        metadata: {
          contentType: resumeFile.type
        }
      });
      const fileId = uploadStream.id;
      
       await new Promise((resolve, reject) => {
        uploadStream.write(buffer);
        uploadStream.end();
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      resumeUrl = `/api/file/${fileId}`;
    }

    const newApplication = await CareerApplication.create({
      name,
      email,
      phone,
      position,
      message,
      resume: resumeUrl,
    });

    return NextResponse.json(newApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating career application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
