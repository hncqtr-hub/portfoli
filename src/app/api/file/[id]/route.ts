
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import CareerApplication from '@/models/CareerApplication';
import { denyUnlessSuperAdmin } from '@/lib/adminGuard';

/* Types a browser may show in place. Anything else, whatever type it was
   uploaded with, is sent as a download so a file from the public careers form
   can never run as a page on this site. */
const INLINE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'];

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    
    // Ensure DB connection
    await connectDB();
    const db = mongoose.connection.db;

    if (!db) {
      return new NextResponse('Database connection error', { status: 500 });
    }

    // Initialize GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const _id = new mongoose.Types.ObjectId(id);

    /* Résumés share this bucket with public images, and ids handed out by one
       server run are near-sequential, so a public image id makes them
       guessable. Only the Super Admin may fetch them. */
    const isResume = Boolean(await CareerApplication.exists({ resume: `/api/file/${id}` }));
    if (isResume) {
      const denied = await denyUnlessSuperAdmin();
      if (denied) return denied;
    }

    // Find file
    const files = await bucket.find({ _id }).toArray();
    if (files.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(_id);

    // Convert stream to ReadableStream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      }
    });

    // Older uploads may carry the legacy top-level contentType the driver no longer types.
    const type: string =
      (file as { contentType?: string }).contentType || file.metadata?.contentType || 'application/octet-stream';
    const inline = INLINE_TYPES.includes(type);

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': inline ? type : 'application/octet-stream',
        'Content-Length': file.length.toString(),
        'X-Content-Type-Options': 'nosniff',
        ...(inline ? {} : { 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}` }),
        // A résumé must never sit in a shared cache where others could get it.
        'Cache-Control': isResume ? 'private, no-store' : 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
