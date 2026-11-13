import mongoose from 'mongoose';

/* Uploads into the same `uploads` bucket branches and gallery use, so the
   existing /api/file/[id] route serves whatever is stored here. */
export async function uploadToGridFS(file: File) {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection failed');
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = bucket.openUploadStream(file.name, {
    metadata: { contentType: file.type },
  });
  const fileId = stream.id;
  return new Promise<string>((resolve, reject) => {
    stream.on('finish', () => resolve(`/api/file/${fileId}`));
    stream.on('error', reject);
    stream.end(buffer);
  });
}
