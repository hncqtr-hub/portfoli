import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';

// This API route streams a video stored in GridFS by its file ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Invalid File ID', { status: 400 });
    }

    await connectDB();
    const db = mongoose.connection.db;
    
    if (!db) {
        return new NextResponse('Database not connected', { status: 500 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'videos'
    });

    // Check if file exists
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    if (!files || files.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const file = files[0];
    const range = request.headers.get('range');
    
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
        const chunksize = (end - start) + 1;

        const downloadStream = bucket.openDownloadStream(file._id, {
            start,
            end: end + 1 // MongoDB end is exclusive
        });
        
        // Robust stream conversion
        const stream = new ReadableStream({
            start(controller) {
                downloadStream.on('data', (chunk) => {
                    try {
                        controller.enqueue(chunk);
                    } catch (e) {
                        // Controller might be closed if client disconnected
                        downloadStream.destroy();
                    }
                });
                downloadStream.on('end', () => {
                    try {
                        controller.close();
                    } catch (e) {
                        // Ignore if already closed
                    }
                });
                downloadStream.on('error', (err) => {
                    try {
                        controller.error(err);
                    } catch (e) {
                        // Ignore
                    }
                });
            },
            cancel() {
                downloadStream.destroy();
            } 
        });

        return new NextResponse(stream, {
            status: 206,
            headers: {
                'Content-Range': `bytes ${start}-${end}/${file.length}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': 'video/mp4',
            },
        });
    } else {
        const downloadStream = bucket.openDownloadStream(file._id);
        
        const stream = new ReadableStream({
             start(controller) {
                downloadStream.on('data', (chunk) => {
                    try {
                        controller.enqueue(chunk);
                    } catch (e) {
                        downloadStream.destroy();
                    }
                });
                downloadStream.on('end', () => {
                    try {
                        controller.close();
                    } catch (e) { }
                });
                downloadStream.on('error', (err) => {
                    try {
                        controller.error(err);
                    } catch (e) { }
                });
            },
            cancel() {
                downloadStream.destroy();
            }
        });
        
        return new NextResponse(stream, {
            headers: {
                'Content-Length': file.length.toString(),
                'Content-Type': 'video/mp4',
            },
        });
    }

  } catch (error) {
    console.error('Error streaming video:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
